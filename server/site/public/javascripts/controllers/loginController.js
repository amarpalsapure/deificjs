(function() {
	Deific.LoginController = Ember.ObjectController.extend({
		isLogin: false,

		lgnAppacitive: function() {
			this.set('isLogin', true);
		},
		lgnFacebook: function() {

		},
		lgnTwitter: function() {

		}
	});
}).call(this);