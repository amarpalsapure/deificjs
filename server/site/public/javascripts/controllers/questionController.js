(function() {
	Deific.QuestionController = Deific.BaseController.extend({
		//answers grouped by date
		groupedAnswers: [],

		saveAnswer: function(text, onSuccess, onError) {
			var that = this;
			that.get('store').find('user', Deific.AccountController.user.userid).then(function(user) {
				// Create the new Comment model
				var questionModel = that.get('model');
				var answer = that.get('store').createRecord('answer');
				answer.set('text', text);
				answer.set('author', user);
				answer.set('question', questionModel);
				answer.set('title', questionModel.get('title'));

			    //set the question subscription
				answer.set('issubscribed', questionModel.get('issubscribed'));
				answer.set('subscribeconnid', questionModel.get('subscribeconnid'));

				answer.set('action', 'do:answer');

				// Save the new model
				answer.save().then(function(savedObj){
					var model = that.get('model');
					savedObj.set('author', user);
					savedObj.set('question', model);

				    //set subscription info to question model
					if (savedObj.get('subscribeconnid')) {
					    model.set('issubscribed', true);
					    model.set('subscribeconnid', savedObj.get('subscribeconnid'));
					}

					savedObj.set('isowner', true);
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

					onSuccess(savedObj, model);
				}, function(error){
					onError(Deific.localDataSource.handleError(error, 'Deific.QuestionController-saveAnswer'));
				});
			}, function(error) {
				onError(Deific.localDataSource.handleError(error, 'Deific.QuestionController-saveAnswer'));
			});
		},

		saveQuestion: function(title, text, tagIds, onSuccess, onError) {
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
				//add tag names to model
				var tagsArray = [];
				for (var i = 0; i < tags.length; i++) 
					tagsArray.push(tags[i].get('name'));
				
				model.set('__tags', tagsArray.join(','));

				//add tags to model
				model.get('tags').pushObjects(tags);

				//get the author from store
				that.get('store').find('user', Deific.AccountController.user.userid).then(function(user) {
					//set author of question
					model.set('author', user);
					model.save().then(onSuccess, function(error){
						onError(Deific.localDataSource.handleError(error, 'Deific.QuestionController-saveQuestion'));
					});
				});
			});
		},

		toggleBookmark: function(onSuccess, onError) {
			var model = this.get('model');
			model.set('isbookmarked', !model.get('isbookmarked'));
			model.set('action', 'toggle:bookmark');
			model.save().then(function(savedObj) {
				onSuccess(savedObj);
			}, function(error) {
				//rollback state
				model.set('isbookmarked', !model.get('isbookmarked'));
				onError(Deific.localDataSource.handleError(error, 'Deific.QuestionController-toggleBookmark'));
			});
		},

		toggleSubscription: function (onSuccess, onError) {
		    var model = this.get('model');
		    model.set('issubscribed', !model.get('issubscribed'));
		    model.set('action', 'toggle:subscribe');
		    model.save().then(function (savedObj) {
		        onSuccess(savedObj);
		    }, function (error) {
		        //rollback state
		        model.set('issubscribed', !model.get('issubscribed'));
		        onError(Deific.localDataSource.handleError(error, 'Deific.QuestionController-toggleSubscription'));
		    });
		}
	});
}).call(this);