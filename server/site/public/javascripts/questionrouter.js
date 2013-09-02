/*global Deific Ember */
'use strict';

Deific.Router.map(function () {
	this.resource('question', { path: '/' });
});

Deific.QuestionRoute = Ember.Route.extend({
	model: function(){
		//extract the id from url
		var idMatch = window.location.pathname.match(/\d+\.?\d*/g);
		if(!idMatch || idMatch.length == 0) window.location = "/error.html";

		return Deific.Question.find(idMatch[0]);
	}	
});