(function() {
	Deific.EntitiesView =  Ember.View.extend({
		templateName: 'entities',
		didInsertElement: function(){
			//remove loader
			$('#rootProgress').remove();

			//enable the the active link
			var sort = $.fn.parseParam('sort', 'latest').toLowerCase();
			$('.sortGroup #' + 'a' + sort).addClass('active');
			$("#h1Sortedby").html(sort + ' questions');

			//update the href of all the sort
			//add query to the href
			var query = $.fn.parseParam('q');
			$.each($('.sortGroup a'), function(i, ele) {
				$(ele).attr('href', $(ele).attr('href') + '&q=' + query);
			});
		}
	});
}).call(this);