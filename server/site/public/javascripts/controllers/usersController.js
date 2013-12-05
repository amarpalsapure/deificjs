(function() {
	Deific.UsersController = Deific.HeaderController.extend({
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
		}
	});
}).call(this);