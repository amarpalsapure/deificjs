/*global Deific Ember */
'use strict';

Deific.Router.map(function () {
	this.resource('user', { path: '/' });
});

Deific.UserRoute = Deific.BaseRoute.extend({
	model: function(param){ 
		//extract the id from url
		var idMatch = window.location.pathname.match(/\d+\.?\d*/g);
		if(!idMatch || idMatch.length == 0) window.location = "/error.html";

		var type = $.fn.parseParam('tab', 'questions');
		var page = $.fn.parseParam('page', '1');
		return this.get('store').find('user', {
			uId: idMatch[0],
			type: type,
			page: page			
		});
	},
	setupController : function(controller, model) {
		var that = this;
		//set the paging info (if any)
		that.setupPager(model);
		
		var model = model.get('firstObject');
		that.controllerFor('user').set('content', model);
	},
	renderTemplate: function() {
		this.render('user');
		this.render('header', {	into: 'user', outlet: 'headerBar', controller: 'header' });
		this.render('paging', { into: 'user', outlet: 'pagerBar', controller: 'paging'});
	}
});