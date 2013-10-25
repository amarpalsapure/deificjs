/*global Deific Ember */
'use strict';

Deific.Router.map(function () {
	this.resource('questions', { path: '/' });
});

Deific.QuestionsRoute = Deific.BaseRoute.extend({
	model: function(){ 
	    var sort = $.fn.parseParam('tab', 'votes');
		var page = $.fn.parseParam('page', '1');
		return this.get('store').find('question', {
			sort: sort,
			page: page
		});
	},
	
	setupController : function(controller, model) {
		//set the model for the controller
		this.controllerFor('questions').set('questions', model);

		//set the paging info (if any)
		this.setupPager(model, '#h1SearchCount');

		//get the tags from the questions
		this.setupRelatedTag('questions', model);
	},
	renderTemplate: function() {
		this.render('questions');
		this.render('header', {	into: 'questions', outlet: 'headerBar', controller: 'header' });
		this.render('paging', { into: 'questions', outlet: 'pagerBar', controller: 'paging'});
		this.render('relatedtags', { into: 'questions', outlet: 'relatedTags' })
	}
});