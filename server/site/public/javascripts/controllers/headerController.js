(function() {
	Deific.HeaderController = Ember.ObjectController.extend({
		isLoggedInBinding: Ember.Binding.oneWay('Deific.AccountController.isLoggedIn'),
		isSignupAllowed: window.init.config.allowsignup,
	   
		loginurl: window.location.pathname.toLowerCase() === '/users/login'
				? '/users/login'
				: '/users/login?returnurl=' + window.location.pathname + window.location.search,
		askUrl: Deific.AccountController.user != null 
			  ? '/questions/ask' 
			  : '/users/login?returnurl=/questions/ask'
	});
}).call(this);