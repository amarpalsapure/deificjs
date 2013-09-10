/*global Deific Ember */
'use strict';

Deific.Router.map(function () {
	this.resource('question', { path: '/' });
});
Deific.Router.reopen({
	location: 'none'
});

Deific.QuestionRoute = Ember.Route.extend({
	model: function(params){
		//extract the id from url
		var idMatch = window.location.pathname.match(/\d+\.?\d*/g);
		if(!idMatch || idMatch.length == 0) window.location = "/error.html";
		var sort = $.fn.parseParam('sort', 'popular');
		
		return this.get('store').find('question', idMatch[0]);

		return Deific.Question.find(idMatch[0], {
			sort: sort
		});
	},
	setupController: function(controller, model){
		var groupedAnswers = [];
		var answersMeta = model.get('answersMeta');
		if(answersMeta){
			for (var i = 0; i <= answersMeta.length - 1; i++) {
				var key = moment(answersMeta[i].__utcdatecreated).format('DDMMMYYYY');
				var match = $.grep(groupedAnswers, function(g){
					return g.date === key;
				});

				var answer = this.get('store').find('answer', answersMeta[i].__id);
				if(match && match.length > 0){
					match[0].answers.push(answer);
				}else{
					groupedAnswers.push({
						date: key,
						__utcdatecreated: answersMeta[i].__utcdatecreated,
						answers: [
						 	answer
						]
					});
				}
			};
		}
		controller.set('groupedAnswers', groupedAnswers);
		controller.set('model', model);
	}
});