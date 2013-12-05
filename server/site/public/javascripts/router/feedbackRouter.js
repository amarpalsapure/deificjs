/*global Deific Ember */
'use strict';

Deific.Router.map(function () {
    this.resource('feedback', { path: '/' });
});

Deific.FeedbackRoute = Deific.BaseRoute.extend({
	model: function(){ 
	    return {};
	},
	renderTemplate: function() {
	    this.render('feedback');
	    this.render('header', { into: 'feedback', outlet: 'headerBar', controller: 'header' });
	}
});