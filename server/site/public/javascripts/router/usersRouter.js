/*global Deific Ember */
'use strict';

Deific.Router.map(function () {
	this.resource('users', { path: '/' });
});

Deific.UsersRoute = Deific.BaseRoute.extend({
	model: function(param){ 
	    var sort = $.fn.parseParam('sort', 'points');
		var page = $.fn.parseParam('page', '1');
		return this.get('store').find('user', {
			sort: sort,
			page: page			
		});
	},
	setupController : function(controller, model) {
		var that = this;
		that.controllerFor('users').set('users', model);

		//set the paging info (if any)
		that.setupPager(model);
	},
	renderTemplate: function() {
		this.render('users');
		this.render('header', {	into: 'users', outlet: 'headerBar', controller: 'header' });
		this.render('paging', { into: 'users', outlet: 'pagerBar', controller: 'paging'});
	}
});