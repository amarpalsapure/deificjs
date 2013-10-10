(function() {
	Deific.TagController = Deific.HeaderController.extend({
	});
	Deific.TagsController = Ember.ArrayController.extend({
		search: function(text, page, sort, onSuccess, onError) {
			var that = this;
			var store = that.get('store');
			store.find('tag', {
				q: text,
				page: page,
				sort: sort
			}).then(function(tags) {
				that.set('tags', tags);
				onSuccess(tags);
			}, function(error) {
				onError(Deific.localDataSource.handleError(error, 'Deific.TagsController-search'));
			});
		}
	});
}).call(this);