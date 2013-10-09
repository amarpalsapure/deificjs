(function() {
	Deific.LoginView =  Ember.View.extend({
		login: {},

		submitTextField: Ember.TextField.extend({
			insertNewline: function() {
		        return this.get('parentView').login();
	   		}
		}),

		didInsertElement: function(){
			//remove loader
			$('#rootProgress').remove();

			//show modal, showing user's session has expired
			var isSessionExpired = $.fn.parseParam('s', '0');
			if(isSessionExpired == '1') {
				$('#modalSessionExpired').modal('show');
			}
		},		
		
		signIn: function() {
			var that = this;
			
			//reset the state
			that.__resetLogin();

			//Validation
			// email
			var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			if(re.test(this.login.email) == false)
				$('.login-email').closest('.form-group').addClass('has-error');
			
			// password
			if($.trim(this.login.password) == '')
				$('.login-pwd').closest('.form-group').addClass('has-error');

			// check if any error element is visible or not
			if($('#frmLogin .has-error').length > 0) return;

			//Authentication
			$('#frmLogin input').attr('disabled', 'disabled');
			$('#frmLogin button').button('loading')

			return Deific.AccountController.signIn(this.login, function() {
				//logged in successfully, take back user to return url (if any)
				window.location = $.fn.parseParam('returnurl', window.host);
			}, function(message) {
				$(".login-error").addClass('has-error').removeClass('hide');
				$('#frmLogin input').removeAttr('disabled');
				$('#frmLogin button').button('reset')
				return that.set("login.error", message);
			});
		},

		cancelSignIn: function() { 
			//reset the state
			this.__resetLogin();
			this.set('login', {});			
			this.get('controller').set('isLogin', false);	
		},

		//internal methods
		__resetLogin: function() {
			$('#frmLogin .has-error').removeClass('has-error');
			$(".login-error").addClass('hide');
		}

	});
}).call(this);