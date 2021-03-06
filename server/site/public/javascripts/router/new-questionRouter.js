/*global Deific Ember */
'use strict';

Deific.Router.map(function () {
	this.resource('question', { path: '/' });
});

Deific.QuestionRoute = Deific.BaseRoute.extend({
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
	},
	renderTemplate: function() {
		this.render('question');
		this.render('header', {	into: 'question', outlet: 'headerBar', controller: 'header' });
	}
});