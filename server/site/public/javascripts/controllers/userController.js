(function() {
	Deific.UserController = Deific.HeaderController.extend({
		users: [],
		search: function(text, page, sort, onSuccess, onError) {
			var that = this;
			var store = that.get('store');
			store.find('user', {
				q: text,
				page: page,
				sort: sort
			}).then(function(tags) {
				that.set('users', tags);
				onSuccess(tags);
			}, function(error) {
				onError(Deific.localDataSource.handleError(error, 'Deific.UsersController-search'));
			});
		},

		updateProfile: function (about, onSuccess, onError) {
		    var that = this;
		    var model = that.get('model');
		    var oldAbout = model.get('about');
		    model.set('about', about);
		    model.save().then(function () {
		        onSuccess();
		    }, function (error) {
		        model.rollback();
		        model.set('about', oldAbout);
		        onError(Deific.localDataSource.handleError(error, 'Deific.UsersController-updateProfile'));
		    });
		}
	});
}).call(this);