/*global Deific Ember */
'use strict';

Deific.Router.map(function () {
	this.resource('answer', { path: '/' });
});

//delete answer template
delete Ember.TEMPLATES.answer;

Deific.AnswerRoute = Deific.BaseRoute.extend({
	model: function(params){
		//extract the id from url
		var idMatch = window.location.pathname.match(/\d+\.?\d*/g);
		if(!idMatch || idMatch.length == 0) window.location = "/error.html";
		
	    //this search will set question collection as model
	    //change this in setupcontroller as we are looking for only one question
		return this.get('store').find('answer',  idMatch[0]);
	},
	renderTemplate: function() {
		this.render('answer');
		this.render('header', { into: 'answer', outlet: 'headerBar', controller: 'header' });
	}
});