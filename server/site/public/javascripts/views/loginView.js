(function() {
	Deific.LoginView =  Ember.View.extend({
		login: {},

		didInsertElement: function(){
			//remove loader
			$('#rootProgress').remove();
		},
		submitTextField: Ember.TextField.extend({
			insertNewline: function() {
		        return this.get('parentView').login();
	   		}
		}),
		resetLogin: function() {
			$('#frmLogin .has-error').removeClass('has-error');
			$(".login-error").addClass('hide');
		},
		signIn: function() {
			var that = this;
			
			//reset the state
			that.resetLogin();

			//Validation
			var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			if(re.test(this.login.email) == false)
				$('.login-email').closest('.form-group').addClass('has-error');

			if($.trim(this.login.password) == '')
				$('.login-pwd').closest('.form-group').addClass('has-error');
			if($('#frmLogin .has-error').length > 0) return;

			//Authentication
			$('#frmLogin input').attr('disabled', 'disabled');
			$('#frmLogin button').button('loading')

			return Deific.AccountController.login(this.login, function(data, error) {
				if (!error) {
					//logged in successfully, take back user to return url (if any)
					window.location = $.fn.parseParam('returnurl', window.host);
				} else {
					$(".login-error").addClass('has-error').removeClass('hide');
					$('#frmLogin input').removeAttr('disabled');
					$('#frmLogin button').button('reset')
					return that.set("login.error", error.message);
				}
			});
		},
		cancelSignIn: function() { 
			//reset the state
			this.resetLogin();
			this.set('login', {});			
			this.get('controller').set('isLogin', false);	
		}

	});
}).call(this);