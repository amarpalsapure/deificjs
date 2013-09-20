(function() {
	Deific.TagView = Ember.View.extend({
		didInsertElement: function() {
			$(this.get('element')).find('a').popover({trigger: 'hover'});
		}
	});
}).call(this);