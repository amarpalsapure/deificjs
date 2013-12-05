(function(){
    Deific.ConfigurationsController = Deific.HeaderController.extend({
        saveConfiguration: function (configurations, onSuccess, onError) {
            Ember.$.post('/service/configurations', { configurations: configurations }).then(function () {
                onSuccess();
            }, function (error) {
                onError(Deific.localDataSource.handleError(error, 'Deific.ConfigurationsController-saveConfiguration'));
            });
        }
	});
}).call(this);