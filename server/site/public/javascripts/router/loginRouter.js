/*global Deific Ember */
'use strict';

Deific.Router.map(function () {
	this.resource('login', { path: '/' });
});
Deific.Router.reopen({
	location: 'none'
});

Deific.LoginRoute = Ember.Route.extend({
	model: function(){ return {}; }
});