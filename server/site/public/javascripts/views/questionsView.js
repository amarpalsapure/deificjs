(function() {
	Deific.QuestionsView =  Ember.View.extend({
		templateName: 'questions',

		questionlist: true,
		hidebookmarkcount: true,

		didInsertElement: function(){

			//remove loader
			$('#rootProgress').remove();

			//enable the the active link
			var sort = $.fn.parseParam('sort', 'popular').toLowerCase();
			$('.sortGroup #' + 'a' +sort).addClass('active');
			$("#h1Sortedby").html(sort + ' questions');

			//cleanup html
			//as we are using common template `entity` for all pages
			//following DOM elements get added unnecessarily
			//so removing them
			$('.comment-container, .comment-add-container').remove();
			$('.vote-panel').parent().remove();
		}
	});
}).call(this);