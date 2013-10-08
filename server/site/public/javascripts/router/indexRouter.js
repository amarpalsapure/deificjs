/*global Deific Ember */
'use strict';

Deific.Router.map(function () {
	this.resource('questions', { path: '/' });
});

Deific.QuestionsRoute = Deific.BaseRoute.extend({
	model: function(){ 
		var sort = $.fn.parseParam('sort', 'popular');
		return this.get('store').find('question', {
			sort: sort
		});
	},
	
	setupController : function(controller, model) {
		//set the model for the controller
		this.controllerFor('questions').set('questions', model);

		//get the tags from the questions
		this.setupRelatedTag('questions', model);
	},
	renderTemplate: function() {
		this.render('questions');
		this.render('header', {	into: 'questions', outlet: 'headerBar', controller: 'header' });
		this.render('tags', { into: 'questions', outlet: 'relatedTags' })
	}
});