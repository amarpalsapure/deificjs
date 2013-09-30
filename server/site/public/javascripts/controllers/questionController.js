(function() {
	Deific.QuestionController = Deific.BaseController.extend({
		//answers grouped by date
		groupedAnswers: [],

		createComment: function() { this.__saveComment('question');	},
		votedetails: function() { this.set('isVoteOpen', true);	},
		upvote: function() {
			var model = this.get('content');
			this.__upvote('question', model);
		},
		downvote: function() {
			var model = this.get('content');
			this.__downvote('quesiton', model);
		},
		createAnswer: function() {
			var text = this.get('newAnswer');

			//validation
			if (!text || !text.trim()) return;

			//change the button state to loading (Bootstrap)
			$('#btnSubmitAnswer').button('loading');

			var reset = function(answer) {
				if(answer) answer.set('action', '');
				//reset button state to loading (Bootstrap)
				$('#btnSubmitAnswer').button('reset');
			};

			var alert_n_reset = function() {
				//in case of any error roll back the changes (if any)
				//and show an error message
				var alert = '<div class="alert alert-block alert-danger font9"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button> An error occurred during saving answer. </div>';
				$('.answerError').html(alert).alert();

				reset();
			};

			var that = this;
			this.get('store').find('user', Deific.AccountController.user.userid).then(function(user) {
				// Create the new Comment model
				var questionModel = that.get('model');
				var parentId = questionModel.get('id');
				var answer = that.get('store').createRecord('answer');
				answer.set('text', text);
				answer.set('author', user);
				answer.set('question', questionModel);
				answer.set('title', questionModel.get('title'));
				answer.set('action', 'do:answer');

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
								__utcdatecreated: savedObj.get('__utcdatecreated'),
								answers: [
								 	answer
								]
							});
						}
					}

					$('.answer-section').removeClass('hide');
					$('#wmd-input').val('');
					$('#wmd-input').trigger('focus');

					reset(savedObj);

					//Set the location to # of answer
					setTimeout(function() {
						window.location = model.get('url') + '#' + savedObj.get('id');
					}, 1000);
				}, function(){
					alert_n_reset();
				});
			}, function(error) {
				alert_n_reset();				
			});
		},

		createQuestion: function(title, text, tagIds, onSuccess, onError) {
			var that = this;
			var model = this.get('model');

			//set the title
			model.set('title', title);

			//set the text
			model.set('text', text);

			//get the tags from store
			var tagPromise = [];
			for (var i = 0; i < tagIds.length; i++) 
				tagPromise.push(that.get('store').find('tag', tagIds[i]));

			//wait for all tags to be fetched
			Ember.RSVP.all(tagPromise).then(function(tags) {
				//add tags to model
				model.get('tags').pushObjects(tags);

				//get the author from store
				that.get('store').find('user', Deific.AccountController.user.userid).then(function(user) {
					//set author of question
					model.set('author', user);
					model.save().then(onSuccess, onError);
				});
			});
		}		
	});
}).call(this);