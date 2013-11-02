(function() {
    Deific.TagwikiController = Deific.HeaderController.extend({
        saveTagwiki: function (onSuccess, onError) {
            var model = this.get('model');
            //model.set('excerpt', excerpt);
            model.save().then(function () {
                onSuccess(model);
            }, function (error) {
                onError(Deific.localDataSource.handleError(error, 'Deific.TagwikiController-saveTagwiki'));
            });
        }
	});
}).call(this);