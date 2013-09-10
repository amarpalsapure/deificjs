(function() {
	Deific.QuestionController = Ember.ObjectController.extend({
		//answers grouped by date
		groupedAnswers: [],
		isLoggedIn: Deific.AccountController.user != null,
		isCommenting: false,
		isVoteOpen: false,

		//action handlers
		commentAction: function() {	this.set('isCommenting', !this.get('isCommenting')); },
		createComment: function() { this.__saveComment('question');	},
		votedetails: function() { this.set('isVoteOpen', true);	},
		upvote: function() {
			var model = this.get('model');
			//remove the up vote
			if(model.get('voted') == 1) {
				model.set('voted', 0);
				model.set('upvotecount', parseInt(model.get('upvotecount'), 10) - 1);
			}else {
			//add up vote
				model.set('voted', 1);
				model.set('upvotecount', parseInt(model.get('upvotecount'), 10) + 1);
			}
			var that = this;
			
			// Save the new model
			this.get('store').commit();

			//in case of any error roll back the changes
			//and show an error message
			model.on('becameError', function(){
				var alert = '<div class="alert alert-block alert-danger font9 pull-left"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button> An error occurred during saving your vote. </div>';
				$("#divVoteError").html(alert).alert();
				var parent = that.get('model');
				parent.get('stateManager').transitionTo('loaded.updated');
				parent.rollback();
			});
		},
		downvote: function() {
			alert('not implemented')
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
			})
			
			
		}
	});

	Deific.AnswerController = Deific.QuestionController.extend({
		createComment: function() { this.__saveComment('answer'); }
	});
}).call(this);