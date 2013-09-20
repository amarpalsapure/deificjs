/*global Deific Ember */
'use strict';

Deific.Router.map(function () {
	this.resource('entities', { path: '/' });
});
Deific.Router.reopen({
	location: 'none'
});

Deific.Entity = DS.Model.extend({
	__utcdatecreated: DS.attr('date'),
	
	title: DS.attr('string'),
	text: DS.attr('string'),
	url: DS.attr('string'),
	upvotecount: DS.attr('number', { defaultValue: 0 }),
	downvotecount: DS.attr('number', { defaultValue: 0 }),
	isanswered: DS.attr('boolean'),

	author: DS.belongsTo('user')

});

Deific.EntityController = Deific.HeaderController.extend({
});

Deific.EntitiesRoute = Ember.Route.extend({
	model: function(param){ 
		var query = $.fn.parseParam('q');
		if(query === '') window.location = '/error.html';
		var sort = $.fn.parseParam('sort', 'popular');
		return this.get('store').find('entity', {
			q: decodeURI(query),
			sort: sort
		});
	},
	setupController : function(controller, model) {
		this.controllerFor('entities').set('entities', model);
	},
	renderTemplate: function() {
		this.render('entities');
		this.render('header', {	into: 'entities', outlet: 'headerBar', controller: 'header' });
	}
});