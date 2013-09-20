(function() {
	Deific.HeaderController = Ember.ObjectController.extend({
		isLoggedInBinding: 'Deific.AccountController.isLoggedIn',
	   
		loginurl: window.location.pathname.toLowerCase() === '/users/login'
				? '/users/login'
				: '/users/login?returnurl=' + window.location.pathname,
		askUrl: Deific.AccountController.user != null 
			  ? '/questions/ask' 
			  : '/users/login?returnurl=/questions/ask'
	});
}).call(this);