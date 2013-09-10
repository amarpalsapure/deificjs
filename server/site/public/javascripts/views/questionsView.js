(function() {
	Deific.QuestionsView =  Ember.View.extend({
		didInsertElement: function(){
			//remove loader
			$('#rootProgress').remove();

			//enable the the active link
			var sort = $.fn.parseParam('sort', 'popular').toLowerCase();
			$('.sortGroup #' + 'a' +sort).addClass('active');
			$("#h1Sortedby").html(sort + ' questions');
		}
	});
	Deific.TagView = Ember.View.extend({
		didInsertElement: function() {
			$(this.get('element')).find('a').popover({trigger: 'hover'});
		}
	});
}).call(this);