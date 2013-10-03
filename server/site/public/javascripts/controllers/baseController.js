(function(){
	Deific.BaseController = Deific.HeaderController.extend({

		isCommenting: false,
		isVoteOpen: false,
		updateInProgress: false,

		//action handlers
		commentAction: function() {	this.set('isCommenting', !this.get('isCommenting')); },

		//vote details are open or not
		votedetails: function() { this.set('isVoteOpen', true);	},

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

		//for internal use
		__saveComment: function(type){
			var text = this.get('newComment');

			//validation
			if (!text || !text.trim()) return;

			var that = this;
			this.get('store').find('user', Deific.AccountController.user.userid).then(function(user){
				// Create the new Comment model
				var parentId = '';
				var comment = that.get('store').createRecord('comment');
				comment.set('text', text);
				comment.set('author', user);
				
				if(type == 'question'){
					comment.set('question', that.get('model'));
					parentId = that.get('model').get('id');
				}
				else {
					comment.set('answer', that.get('model').get('content'));
					parentId = that.get('model').get('content').get('id');
				}

				// Clear the "New Comment" text field
				that.set('newComment', '');
				that.set('isCommenting', false);

				var toggleView = function() {
					setTimeout(function(){
						$('#'+ type + '-' + parentId +' .actionProgress').toggleClass('hide');
						$('#'+ type + '-' + parentId +' .entity-action').toggleClass('hide');
					}, 10);
				}

				toggleView();

				// Save the new model
				comment.save().then(function(savedObj){
					var model = null;
					if(type == 'question') model = that.get('model');
					else model = that.get('model').get('content');
					savedObj.set('author', user);
					model.get('comments').pushObject(savedObj);
					toggleView();
				}, function(){
					//in case of any error roll back the changes
					//and show an error message
					var alert = '<div class="alert alert-block alert-danger pull-left"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button> An error occurred during saving comment. </div>';
					$('#'+ parentId +' .commentError').html(alert).alert();
					toggleView();
				});
			});
		},

		deleteComment: function(comment, onSuccess, onError) {
			if(!comment) onError();
			
			comment.deleteRecord();
			comment.save().then(onSuccess, function(error) {
				comment.rollback();
				onError(Deific.localDataSource.handleError(error, 'Deific.BaseController-deleteComment'));
			});
		},

		deleteEntity: function(onSuccess, onError) {
			var that = this;
			var model = that.get('model');
			if(model.get('type') === 'answer') model = model.get('content');

			model.deleteRecord();
			model.save().then(onSuccess, function(error) {
				model.rollback();
				onError(Deific.localDataSource.handleError(error, 'Deific.BaseController-deleteEntity'));
			});
		}
	});
}).call(this);