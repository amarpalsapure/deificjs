/*global Deific Ember */
'use strict';

Deific.Router.map(function () {
	this.resource('question', { path: '/' });
});
Deific.Router.reopen({
	location: 'none'
});

Deific.QuestionRoute = Ember.Route.extend({
	model: function(){ 
		var store = this.get('store');
		//TODO: push the current logged in user (if any) to store
		//if(Deific.AccountController.user) {
		//	store.push('user', {
		//		id: Deific.AccountController.user.userid,
		//		firstname: 
		//	});
		//}
		return store.createRecord('question');
	}
});