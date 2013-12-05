/*global Deific Ember */
'use strict';

Deific.Router.map(function () {
	this.resource('tags', { path: '/' });
});

Deific.TagsRoute = Deific.BaseRoute.extend({
	model: function(param){ 
		var sort = $.fn.parseParam('tab', 'popular');
		var page = $.fn.parseParam('page', '1');
		return this.get('store').find('tag', {
			sort: sort,
			page: page			
		});
	},
	setupController : function(controller, model) {
		var that = this;
		that.controllerFor('tags').set('tags', model);

		//set the paging info (if any)
		that.setupPager(model);
	},
	renderTemplate: function() {
		this.render('tags');
		this.render('header', {	into: 'tags', outlet: 'headerBar', controller: 'header' });
		this.render('paging', { into: 'tags', outlet: 'pagerBar', controller: 'paging'});
	}
});