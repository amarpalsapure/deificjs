(function() {
	Deific.QuestionsView =  Ember.View.extend({
		didInsertElement: function(){
			//remove loader
			$('#rootProgress').remove();

			//enable the the active link
			var sort = 'a' + $.fn.parseParam('sort', 'popular').toLowerCase();
			$('.sortGroup #' + sort).addClass('active');
		}
	});
	Deific.TagView = Ember.View.extend({
		didInsertElement: function() {
			$(this.get('element')).find('a').popover({trigger: 'hover'});
		}
	});
}).call(this);