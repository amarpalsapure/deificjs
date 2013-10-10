(function() {
	Deific.TagController = Deific.HeaderController.extend({
	});
	Deific.TagsController = Ember.ArrayController.extend({
		search: function(text, sort, onSuccess, onError) {
			var that = this;
			var store = that.get('store');
			store.find('tag', {
				q: text,
				sort: sort
			}).then(function(tags) {
				that.set('tags', tags);
				onSuccess(tags);
			}, function(error) {
				onError(Deific.localDataSource.handleError(error, 'Deific.TagController-search'));
			});
		}
	});
}).call(this);