(function(){
	Deific.FeedbackController = Ember.ObjectController.extend({

		//toggles the state of answer as accepted / unaccepted
		submitFeedback: function(text, onSuccess, onError) {
		    Ember.$.post('/service/feedback', {
		        text: text		       
		    }).then(function(){
				onSuccess();
			}, function(error){
			    onError(Deific.localDataSource.handleError(error, 'Deific.FeedbackController-submitFeedback'));
			});
		}
	});
}).call(this);