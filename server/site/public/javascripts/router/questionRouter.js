/*global Deific Ember */
'use strict';

Deific.Router.map(function () {
	this.resource('question', { path: '/' });
});

Deific.Router.reopen({ location: 'none' });

Deific.QuestionRoute = Ember.Route.extend({
	model: function(params){
		//extract the id from url
		var idMatch = window.location.pathname.match(/\d+\.?\d*/g);
		if(!idMatch || idMatch.length == 0) window.location = "/error.html";
		var sort = $.fn.parseParam('sort', 'popular');
		
		//this search will set question collection as model
		//change this in setupcontroller as we are looking for only one question
		return this.get('store').find('question', {
			qId: idMatch[0],
			sort: sort
		});
	},
	setupController: function(c, m){
		var model = m.get('firstObject');
		var loadedanswercount = 0;
		var groupedAnswers = [];

		var answersMeta = model.get('answersMeta');
		if(answersMeta){
			loadedanswercount = model.get('answercount');
			for (var i = 0; i <= answersMeta.length - 1; i++) {
				var key = moment(answersMeta[i].__utcdatecreated).format('DDMMMYYYY');
				var match = $.grep(groupedAnswers, function(g){
					return g.date === key;
				});

				var answer = this.get('store').find('answer', answersMeta[i].__id);
				answer.then(function(gAnswer){
					gAnswer.set('question', model);
					//if url has hash (in case of answer id), then reload the page
					if(--loadedanswercount == 0 && window.location.hash != '') 
						setTimeout(function(){
							window.location = window.location.href;
						}, 500);
				});
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
		c.set('groupedAnswers', groupedAnswers);
		//change the model to single question
		c.set('model', model);
	},
	renderTemplate: function() {
		this.render('question');
		this.render('header', {	into: 'question', outlet: 'headerBar', controller: 'header' });
	}
});