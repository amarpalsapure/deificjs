/*global Deific Ember */
'use strict';

Deific.Router.map(function () {
	this.resource('question', { path: '/' });
});
Deific.Router.reopen({
	location: 'none'
});

Deific.QuestionRoute = Ember.Route.extend({
	model: function(){
		//extract the id from url
		var idMatch = window.location.pathname.match(/\d+\.?\d*/g);
		if(!idMatch || idMatch.length == 0) window.location = "/error.html";

		return Deific.Question.find(idMatch[0]);
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

				var answer = Deific.Answer.find(answersMeta[i].__id);

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