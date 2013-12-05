(function(){
	Deific.NewtagController = Ember.ObjectController.extend({

		//toggles the state of answer as accepted / unaccepted
	    saveTag: function (name, excerpt, description, onSuccess, onError) {
		    Ember.$.post('/service/tags/add', {
		        name: name,
		        excerpt: excerpt,
                description: description
		    }).then(function(){
				onSuccess();
			}, function(error){
			    onError(Deific.localDataSource.handleError(error, 'Deific.NewtagController-saveTag'));
			});
		}
	});
}).call(this);