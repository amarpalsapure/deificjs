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
			if(!Deific.AccountController.user){
				this.transitionTo('question.login');
				return;
			}
			var text = this.get('newComment');

			if (!text || !text.trim()) {
				return;
			}
			// Create the new Comment model
			var comment = Deific.Comment.createRecord({
				text: text,
				author: Deific.User.find(Deific.AccountController.user.get('userid'))		
			});

			if(type == 'question') 
				comment.set('question', this.get('model'));
			else 
				comment.set('answer', this.get('model'));

			// Clear the "New Comment" text field
			this.set('newComment', '');
			this.set('isCommenting', false);
			var that = this;
			
			// Save the new model
			this.get('store').commit();
			
			//in case of any error roll back the changes
			//and show an error message
			comment.on('becameError', function(){
				var alert = '<div class="alert alert-block alert-danger pull-left"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button> An error occurred during saving comment. </div>';
				$("#divCommentError").html(alert).alert();
				var parent = that.get('model');
				parent.send('becomeDirty');
				parent.rollback();
			});
		}
	});

	Deific.AnswerController = Deific.QuestionController.extend({
		createComment: function() { this.__saveComment('answer'); }
	});
}).call(this);