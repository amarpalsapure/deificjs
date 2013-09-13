(function() {
	Deific.QuestionController = Ember.ObjectController.extend({
		//answers grouped by date
		groupedAnswers: [],
		isLoggedIn: Deific.AccountController.user != null,
		isCommenting: false,
		isVoteOpen: false,
		updateInProgress: false,

			//action handlers
		commentAction: function() {	this.set('isCommenting', !this.get('isCommenting')); },
		createComment: function() { this.__saveComment('question');	},
		votedetails: function() { this.set('isVoteOpen', true);	},
		upvote: function() {
			var model = this.get('content');
			this.__upvote(model);
		},
		downvote: function() {
			var model = this.get('content');
			this.__downvote(model);
		},
		createAnswer: function() {
			var text = this.get('newAnswer');

			//validation
			if (!text || !text.trim()) return;

			var that = this;
			this.get('store').find('user', Deific.AccountController.user.userid).then(function(user){
				// Create the new Comment model
				var questionModel = that.get('model');
				var parentId = questionModel.get('id');
				var answer = that.get('store').createRecord('answer');
				answer.set('text', text);
				answer.set('author', user);
				answer.set('question', questionModel);
				answer.set('action', 'do:answer');

				//change the button state to loading (Bootstrap)
				$('#btnSubmitAnswer').button('loading');

				var reset = function() {
					answer.set('action', '');
					//reset button state to loading (Bootstrap)
					$('#btnSubmitAnswer').button('reset');
				};

				// Save the new model
				answer.save().then(function(savedObj){
					var model = that.get('model');
					savedObj.set('author', user);
					savedObj.set('question', model);
					model.get('answersMeta').pushObject({
						__id: savedObj.get('id'),
						__utcdatecreated: savedObj.get('__utcdatecreated')
					});

					var groupedAnswers = that.get('groupedAnswers');
					
					if(groupedAnswers){
						var key = moment(savedObj.get('__utcdatecreated')).format('DDMMMYYYY');
						var match = $.grep(groupedAnswers, function(g){
							return g.date === key;
						});

						var answer = that.get('store').find('answer', savedObj.get('id'));
						if(match && match.length > 0){
							match[0].answers.pushObject(answer);
						}else{
							groupedAnswers.pushObject({
								date: key,
								__utcdatecreated: answersMeta[i].__utcdatecreated,
								answers: [
								 	answer
								]
							});
						}
					}

					$('#wmd-input').val('');
					$('#wmd-input').trigger('focus');
					//TODO: Set the location to # of answer
					reset();
				}, function(){
					//in case of any error roll back the changes (if any)
					//and show an error message
					var alert = '<div class="alert alert-block alert-danger font9"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button> An error occurred during saving answer. </div>';
					$('.answerError').html(alert).alert();

					reset();
				});
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
						$('#'+ parentId +' .commentProgress').toggleClass('hide');
						$('#'+ parentId +' .commentAdd').toggleClass('hide');
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
		__upvote: function(model) {
			if(this.__validateVoteUser(model)) return;
			if(this.updateInProgress) return;
			this.set('updateInProgress', true);
			this.__toggleVoteLoader(model.get('id'));

			var that = this;
			
			//backup
			var upvotecount = model.get('upvotecount');
			var downvotecount = model.get('downvotecount');
			var voted = model.get('voted');

			//remove the up vote
			if(model.get('voted') == 1) {
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

			var reset = function() {
				that.__toggleVoteLoader(model.get('id'));
				that.set('updateInProgress', false);
				model.set('action', '');
			};

			// Save the new model
			model.save().then(function(item){
				reset();
				//don't do anything, 
				//view is already updated
			}, function(error){
				reset();				
				//in case of any error roll back the changes
				//and show an error message
				model.rollback();
				
				//Hack as roll back is not working
				model.set('upvotecount', upvotecount);
				model.set('downvotecount', downvotecount);
				model.set('voted', voted);

				//show error message
				that.__showVoteError(model.get('id'));
			});
		},
		__downvote: function(model) {
			if(this.__validateVoteUser(model)) return;
			if(this.updateInProgress) return;
			this.set('updateInProgress', true);
			this.__toggleVoteLoader(model.get('id'));

			var that = this;
			
			//backup
			var upvotecount = model.get('upvotecount');
			var downvotecount = model.get('downvotecount');
			var voted = model.get('voted');

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
			
			var reset = function() {
				that.__toggleVoteLoader(model.get('id'));
				that.set('updateInProgress', false);
				model.set('action', '');
			};

			// Save the new model
			model.save().then(function(item){
				reset()
				//don't do anything, 
				//view is already updated
			}, function(error){
				reset();
				//in case of any error roll back the changes
				//and show an error message
				model.rollback();
				
				//Hack as roll back is not working
				model.set('upvotecount', upvotecount);
				model.set('downvotecount', downvotecount);
				model.set('voted', voted);

				//show error message
				that.__showVoteError(model.get('id'));
			});
		},
		//check if user who has questioned or answered is not upvoting his/her own answer
		__validateVoteUser: function(model) {
			if(Deific.AccountController.user.userid != model.get('author').get('id')) return false;
			//show error
			var alert = '<div class="alert alert-block alert-danger font9 pull-left"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button> You can\'t vote on your own post. </div>';
			$('#'+ model.get('id') +' .voteError').html(alert).alert();
			return true;
		},
		__showVoteError: function(id) {
			var alert = '<div class="alert alert-block alert-danger font9 pull-left"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button> An error occurred during saving your vote. </div>';
			$('#'+ id +' .voteError').html(alert).alert();
		},
		__toggleVoteLoader: function(id) {
			$('#'+ id +' .voteProgress').toggleClass('hide');
		}
	});

	Deific.AnswerController = Deific.QuestionController.extend({
		createComment: function() { this.__saveComment('answer'); },
		upvote: function() {
			var model = this.get('content').get('content');
			this.__upvote(model);
		},
		downvote: function() {
			var model = this.get('content').get('content');
			this.__downvote(model);
		},
	});
}).call(this);