/*global Deific Ember */
'use strict';

Deific.Router.map(function () {
	this.resource('questions', { path: '/' });
});
Deific.Router.reopen({
	location: 'none'
});

Deific.QuestionsRoute = Ember.Route.extend({
	model: function(){ 
		var sort = $.fn.parseParam('sort', 'popular');
		return this.get('store').find('question', {
			sort: sort
		});
	},
	setupController : function(controller, model) {
		this.controllerFor('questions').set('questions', model);
	},
	renderTemplate: function() {
		this.render('questions');
		this.render('header', {	into: 'questions', outlet: 'headerBar', controller: 'header' });
	}
});