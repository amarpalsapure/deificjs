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

		return this.get('store').find('user', {
			uId: idMatch[0],
			isedit: true
		});
	},
	setupController : function(controller, model) {
		var that = this;
		
		var model = model.get('firstObject');
		that.controllerFor('user').set('content', model);
	},
	renderTemplate: function() {
		this.render('user');
		this.render('header', {	into: 'user', outlet: 'headerBar', controller: 'header' });
	}
});