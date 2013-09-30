(function(){
	Deific.AnswerController = Deific.BaseController.extend({
		createComment: function() { this.__saveComment('answer'); },
		upvote: function() {
			var model = this.get('content').get('content');
			this.__upvote('answer', model);
		},
		downvote: function() {
			var model = this.get('content').get('content');
			this.__downvote('amswer', model);
		},
		acceptAnswer: function(onSuccess, onError) {
			var that = this;
			var model = that.get('content').get('content');
			model.set('action', 'do:accepted');
			model.save().then(function(savedObj){
				//get the question controller 
				//itirate on the grouped answers
				//and mark isacceptedanswer for old answer as false
				var questionController = that.controllerFor('question');
				var groupedAnswers = questionController.get('groupedAnswers').toArray();
				for (var i = 0; i < groupedAnswers.length; i++) {
					if(!groupedAnswers[i].answers) continue;
					for (var j = 0; j < groupedAnswers[i].answers.length; j++) {
						var answer = groupedAnswers[i].answers[j].get('content');
						if(answer.get('id') != model.get('id') && answer.get('iscorrectanswer') === true) {
							answer.set('iscorrectanswer', false);
							onSuccess(model);
							return;
						}
					};
				};
				onSuccess(model);
			}, function(error){
				onError(Deific.localDataSource.handleError(error, 'Deific.AnswerController-acceptAnswer'));
			});
		},
		unacceptAnswer: function() {
			var that = this;
			var model = that.get('content').get('content');
			model.set('action', 'undo:accepted');
			model.save().then(function(savedObj){
				onSuccess(savedObj);
			}, function(error){
				onError(Deific.localDataSource.handleError(error, 'Deific.AnswerController-acceptAnswer'));
			});
		}
	});
}).call(this);