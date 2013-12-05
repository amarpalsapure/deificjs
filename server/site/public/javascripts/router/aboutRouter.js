/*global Deific Ember */
'use strict';

Deific.Router.map(function () {
    this.resource('about', { path: '/' });
});

Deific.FeedbackRoute = Deific.BaseRoute.extend({
	model: function(){ 
	    return {};
	},
	renderTemplate: function() {
	    this.render('about');
	    this.render('header', { into: 'about', outlet: 'headerBar', controller: 'header' });
	}
});