/*global Deific Ember */
'use strict';

Deific.Router.map(function () {
	this.resource('error', {path: '/error'});
});
Deific.Router.reopen({
	location: 'none'
});

Deific.Error = DS.Model.extend({
	code: DS.attr('string'),
	message: DS.attr('string')
});

Deific.ErrorRoute = Ember.Route.extend({
	model: function() {
		var status = Deific.localDataSource.getLatestRouteError();
		var store = this.get('store');
		//if status code is '19036', it means user token has expired,
		//show user session expired message with login link
		//it's a known error, removing code hides help message in the view
		if(status.code === '56789' || status.code === '19036') delete status.code;

		//push the error object in store
		store.push('error', {
			id: status.referenceid,
			code: status.code,
			message: status.error
		});

		return store.find('error', status.referenceid);
	},
	renderTemplate: function() {
		this.render('error');
		this.render('header', {	into: 'error', outlet: 'headerBar', controller: 'header' });
	}
});