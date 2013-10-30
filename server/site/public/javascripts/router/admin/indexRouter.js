/*global Deific Ember */
'use strict';

Deific.Router.map(function () {
	this.resource('configurations', { path: '/' });
});

Deific.ConfigurationsRoute = Deific.BaseRoute.extend({
	model: function(){ 
		return this.get('store').find('configuration');
	},
	
	renderTemplate: function() {
		this.render('configurations');
		this.render('header', { into: 'configurations', outlet: 'headerBar', controller: 'header' });
	}
});