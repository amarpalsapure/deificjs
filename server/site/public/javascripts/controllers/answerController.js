(function(){
    Deific.AnswerController = Deific.BaseController.extend({

        saveAnswer: function(text, onSuccess, onError) {
            var that = this;
            var model = this.get('model');

            //set the text
            model.set('text', text);

            model.set('action', 'do:save');

            //get the author from store
            that.get('store').find('user', Deific.AccountController.user.userid).then(function (user) {
                //set author of question
                model.set('author', user);
                
                var murl = model.get('murl');
                model.save().then(function (savedObj) {
                    onSuccess(murl);
                }, function (error) {
                    onError(Deific.localDataSource.handleError(error, 'Deific.AnswerController-saveAnswer'));
                });
            });
        },

		//toggles the state of answer as accepted / unaccepted
		toggleAnswer: function(isAccepted, onSuccess, onError) {
			var that = this;
			var model = that.get('content').get('content');
			var ownsparent = model.get('ownsparent');

			//set the action which will perform on the answer
			model.set('action', isAccepted ? 'do:accepted': 'undo:accepted');

			//if question is owned by the current user then
			//answer has ownsparent property, set it accordingly
			var resetParentOwnerShip = function() {
				if(model.get('type') === 'answer') model.set('ownsparent', ownsparent);
			};

			//Save the model
			model.save().then(function(savedObj){
				resetParentOwnerShip();

				//if the answer is accepted, then try to toggle older accepted answer
				if(isAccepted === true) {
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
				}
				onSuccess(model);
			}, function(error){
				resetParentOwnerShip();
				onError(Deific.localDataSource.handleError(error, 'Deific.AnswerController-toggleAnswer'));
			});
		}
	});
}).call(this);