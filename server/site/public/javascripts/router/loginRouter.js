/*global Deific Ember */
'use strict';

Deific.Router.map(function () {
	this.resource('login', { path: '/' });
});

Deific.LoginRoute = Deific.BaseRoute.extend({
	model: function(){ return {}; },
	renderTemplate: function() {
		this.render('login');
		this.render('header', {	into: 'login', outlet: 'headerBar', controller: 'header' });
	}
});