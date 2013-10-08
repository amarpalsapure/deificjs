(function() {
	Deific.EntitiesView =  Ember.View.extend({
		templateName: 'entities',

		entitylist: true,
		hidetag: true,
		hidevotecount: false,
		hideviewcount: true,
		hideanswercount: true,
		hidebookmarkcount: true,

		didInsertElement: function(){
			//remove loader
			$('#rootProgress').remove();

			//enable the the active link
			var sort = $.fn.parseParam('sort', 'latest').toLowerCase();
			$('.sortGroup #' + 'a' + sort).addClass('active');

			//update the href of all the sort
			//add query to the href
			var query = $.fn.parseParam('q');
			if(query) {
				$.each($('.sortGroup a'), function(i, ele) {
					$(ele).attr('href', $(ele).attr('href') + '&q=' + query);
				});
			}

			//cleanup html
			//as we are using common template `entity` for all pages
			//following DOM elements get added unnecessarily
			//so removing them
			$('.comment-container, .comment-add-container').remove();
			$('.vote-panel').parent().remove();
		}
	});
}).call(this);