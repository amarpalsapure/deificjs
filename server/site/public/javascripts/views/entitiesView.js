(function() {
	Deific.EntitiesView =  Ember.View.extend({
		templateName: 'entities',
		didInsertElement: function(){

			//remove loader
			$('#rootProgress').remove();

			//enable the the active link
			var sort = $.fn.parseParam('sort', 'popular').toLowerCase();
			$('.sortGroup #' + 'a' +sort).addClass('active');
			$("#h1Sortedby").html(sort + ' questions');
		}
	});
}).call(this);