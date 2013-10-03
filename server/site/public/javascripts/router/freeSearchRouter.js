/*global Deific Ember */
'use strict';

Deific.Router.map(function () {
	this.resource('entities', { path: '/' });
});
Deific.Router.reopen({
	location: 'none'
});

Deific.EntitiesRoute = Deific.BaseRoute.extend({
	model: function(param){ 
		var query = $.fn.parseParam('q');
		if(query === '') window.location = '/error.html';
		var sort = $.fn.parseParam('sort', 'popular');
		var page = $.fn.parseParam('page', '1');
		return this.get('store').find('entity', {
			q: decodeURI(query),
			sort: sort,
			page: page
		});
	},
	setupController : function(controller, model) {
		this.controllerFor('entities').set('entities', model);

		//set the paging info (if any)
		this.setupPager(model, '#h1SearchCount');
	},
	renderTemplate: function() {
		this.render('entities');
		this.render('header', {	into: 'entities', outlet: 'headerBar', controller: 'header' });
		this.render('paging', { into: 'entities', outlet: 'pagerBar', controller: 'paging'});
	}
});