/*global Deific Ember */
'use strict';

Deific.Router.map(function () {
	this.resource('question', { path: '/' });
});

Deific.QuestionRoute = Deific.BaseRoute.extend({
	model: function(params){
		//extract the id from url
		var idMatch = window.location.pathname.match(/\d+\.?\d*/g);
		if(!idMatch || idMatch.length == 0) window.location = "/error.html";
		
	    //this search will set question collection as model
	    //change this in setupcontroller as we are looking for only one question
		return this.get('store').find('question', {
		    qId: idMatch[0],
            edit: true
		});
	},
	setupController: function (c, m) {
	    var model = m.get('firstObject');
	    //change the model to single question
	    c.set('model', model);
	},
	renderTemplate: function() {
		this.render('question');
		this.render('header', {	into: 'question', outlet: 'headerBar', controller: 'header' });
	}
});