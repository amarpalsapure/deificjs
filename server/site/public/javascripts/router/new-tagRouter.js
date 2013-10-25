/*global Deific Ember */
'use strict';

Deific.Router.map(function () {
    this.resource('newtag', { path: '/' });
});

Deific.NewtagRoute = Deific.BaseRoute.extend({
	model: function(){ 
	    return {};
	},
	renderTemplate: function() {
	    this.render('newtag');
	    this.render('header', { into: 'newtag', outlet: 'headerBar', controller: 'header' });
	}
});