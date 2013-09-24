(function() {
	Deific.QuestionsView =  Ember.View.extend({
		templateName: 'questions',

		questionlist: true,
		//questionpage: true,

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