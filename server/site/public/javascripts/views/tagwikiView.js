(function() {
	Deific.TagwikiView = Ember.View.extend({
		didInsertElement: function() {
		    //remove loader
		    $('#rootProgress').remove();
		}
	});
}).call(this);