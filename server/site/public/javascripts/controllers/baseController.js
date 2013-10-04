(function(){
	Deific.BaseController = Deific.HeaderController.extend({

		//common functionality of vote
		registerVote: function(isUpVote, onSuccess, onError) {
			var that = this;
			var model = that.get('model');
			var ownsparent;
			if(model.get('type') === 'answer') {
				model = model.get('content');
				ownsparent = model.get('ownsparent');
			}
			
			//backup
			var upvotecount = model.get('upvotecount');
			var downvotecount = model.get('downvotecount');
			var voted = model.get('voted');

			if(isUpVote) {
				//remove the up vote
				if(model.get('voted') === 1) {
					model.set('action', 'undo:upvote');
					model.set('voted', 0);
					model.decrementProperty('upvotecount');
				}else {
					//add up vote
					model.set('action', 'do:upvote');
					model.set('voted', 1);
					model.incrementProperty('upvotecount');

					//if voteconnid is not empty, means user is switching vote
					if(model.get('voteconnid') && model.get('voteconnid') != '') {
						model.decrementProperty('downvotecount');
					}
				}
			} else {
				//remove the up vote
				if(model.get('voted') == -1) {
					model.set('action', 'undo:downvote');
					model.set('voted', 0);
					model.decrementProperty('downvotecount');
				}else {
					//add up vote
					model.set('action', 'do:downvote');
					model.set('voted', -1);
					model.incrementProperty('downvotecount');
					//if voteconnid is not empty, means user is switching vote
					if(model.get('voteconnid') && model.get('voteconnid') != '') {
						model.decrementProperty('upvotecount');
					}
				}
			}

			//if question is owned by the current user then
			//answer has ownsparent property, set it accordingly
			var resetParentOwnerShip = function() {
				if(model.get('type') === 'answer') model.set('ownsparent', ownsparent);
			};

			// Save the new model
			model.save().then(function(item){
				resetParentOwnerShip();
				onSuccess(item);
			}, function(error){
				//in case of any error roll back the changes
				//and show an error message
				model.rollback();
				
				//Hack as roll back is not working
				model.set('upvotecount', upvotecount);
				model.set('downvotecount', downvotecount);
				model.set('voted', voted);
				resetParentOwnerShip();

				onError(Deific.localDataSource.handleError(error, 'Deific.BaseController-upvote'));
			});
		},

		//save the comment
		saveComment: function(text, onSuccess, onError) {
			var that = this;
			var parentModel = that.get('model');
			var type = parentModel.get('type');
			if(type === 'answer') parentModel = parentModel.get('content');

			that.get('store').find('user', Deific.AccountController.user.userid).then(function(user){
				// Create the new Comment model
				var comment = that.get('store').createRecord('comment');
				comment.set('text', text);
				comment.set('author', user);
				comment.set(type, parentModel);
				
				// Save the new model
				comment.save().then(function(savedObj){
					savedObj.set('author', user);
					parentModel.get('comments').pushObject(savedObj);
					onSuccess(savedObj);
				}, function(error){
					//in case of any error roll back the changes, in this case there is nothing to rollback
					onError(Deific.localDataSource.handleError(error, 'Deific.BaseController-saveComment'));
				});
			});
		},

		//delete the comment
		deleteComment: function(comment, onSuccess, onError) {
			if(!comment) onError();
			
			comment.deleteRecord();
			comment.save().then(onSuccess, function(error) {
				comment.rollback();
				onError(Deific.localDataSource.handleError(error, 'Deific.BaseController-deleteComment'));
			});
		},

		//delete the entity, entity can be answer or question
		deleteEntity: function(onSuccess, onError) {
			var that = this;
			var model = that.get('model');
			if(model.get('type') === 'answer') model = model.get('content');

			//change the state of model to deleted
			model.deleteRecord();

			//save the changes to the model
			model.save().then(onSuccess, function(error) {
				model.rollback();
				onError(Deific.localDataSource.handleError(error, 'Deific.BaseController-deleteEntity'));
			});
		}
	});
}).call(this);