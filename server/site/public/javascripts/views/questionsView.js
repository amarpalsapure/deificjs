(function() {
	Deific.QuestionsView =  Ember.View.extend({
		templateName: 'questions',

		questionlist: true,
		hidebookmarkcount: true,

		didInsertElement: function(){

			//remove loader
			$('#rootProgress').remove();

			//Set questions link as active
			if(window.location.pathname.indexOf('/questions') === 0) $('.nav-questions').addClass('active');

			//enable the the active link
			var sort = $.fn.parseParam('tab', $('.right-nav-tabs').data('default')).toLowerCase();
			$('.right-nav-tabs #' + 'a' + sort).parent().addClass('active');
			
            if(sort === 'votes') sort = 'Highest Voted'
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