(function() {
	Deific.LoginView =  Ember.View.extend({
		showDefault: true,
		showLogin: false,
		showSignup: false,
		showRecover: false,
		showfblogin: false,
		showtweetlogin: false,
		twitterLoginFailed: false,

		showRecoverForm: true,
		
		allowSignUp: window.init.config.allowsignup,
		allowFBLogin: window.init.config.fbenable,
		allowTwitterLogin: window.init.config.twitterenable,

		login: {},
		register: {},
		recover: {},

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

			var tl = $.fn.parseParam('tl');
			if(tl) {
				if(tl === '1') {
					this.__hideView();
					this.set('twitterLoginFailed', true);
				} else {
					var returnurl = this.__getReturnUrl();
					if(returnurl) window.location = returnurl.replace('returnurl=', '');
					else window.location = '/';
				}
			}
		},

		lgnAppacitive: function() {
			this.__hideView();
			this.set('showLogin', true);
		},

		lgnFacebook: function() {
			var that = this;

			that.__hideView();
			this.set('showfblogin', true);
			
			//reset the state
			setTimeout(function(){
				that.__resetFbLogin();
			}, 50);

			if(FB) FB.login(function(response) {
				if (response && response.status === 'connected' && response.authResponse) {
					return Deific.AccountController.fbSignIn(response.authResponse.accessToken, function() {
						//logged in successfully, take back user to return url (if any)
						window.location = $.fn.parseParam('returnurl', window.host);
					}, function(message) {
						$('.fb-loggin-in').addClass('hide');
						$(".fblogin .fb-login-error").addClass('has-error').removeClass('hide');
						that.set('login.error', message);
					});
				} else {
					that.cancel();
				}
			}, { scope:'email,user_birthday' });
		},

		lgnTwitter: function() {
			document.cookie = 'returnurl=' + window.location.search +';path=/';
			window.location = '/auth/twitter';
		},

		cancelTwitter: function() {
		    var returnurl = this.__getReturnUrl();
			window.location = window.host + '/users/login' + returnurl;
		},
		
		signIn: function() {
			var that = this;
			
			//reset the state
			that.__resetLogin();

			//Validation
			// email
			var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			if(re.test(this.login.email) == false)
				$('#frmLogin .login-email').closest('#frmLogin .form-group').addClass('has-error');
			
			// password
			if($.trim(this.login.password) == '')
				$('#frmLogin .login-pwd').closest('#frmLogin .form-group').addClass('has-error');

			// check if any error element is visible or not
			if($('#frmLogin .has-error').length > 0) return;

			//Authentication
			$('#frmLogin input').attr('disabled', 'disabled');
			$('#frmLogin button').button('loading')

			return Deific.AccountController.signIn(this.login, function() {
				//logged in successfully, take back user to return url (if any)
				window.location = $.fn.parseParam('returnurl', window.host);
			}, function(message) {
				$("#frmLogin .login-error").addClass('has-error').removeClass('hide');
				$('#frmLogin input').removeAttr('disabled');
				$('#frmLogin button').button('reset')
				that.set("login.error", message);
			});
		},

		cancel: function() { 
			//reset the state
			this.__resetLogin();
			this.set('login', {});
			this.set('register', {});
			this.set('recover', {});
			this.__hideView();	
			this.set('showDefault', true);	
		},

		signUp: function() {
			var that = this;
			
			//reset the state
			that.__resetSignup();

			//Validation
			// email
			var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			if(re.test(this.register.email) == false)
				$('#frmSignup .login-email').closest('#frmSignup .form-group').addClass('has-error');

			//name
			if($.trim(this.register.name) == '')
				$('#frmSignup .login-name').closest('#frmSignup .form-group').addClass('has-error');
			
			// password
			if($.trim(this.register.password) == '')
				$('#frmSignup .login-pwd').closest('#frmSignup .form-group').addClass('has-error');

			// re-password
			if($.trim(this.register.repassword) == '')
				$('#frmSignup .login-repwd').closest('#frmSignup .form-group').addClass('has-error');
			else if($.trim(this.register.password) != $.trim(this.register.repassword))
				$('#frmSignup .login-repwd').closest('#frmSignup .form-group').addClass('has-error');

			// check if any error element is visible or not
			if($('#frmSignup .has-error').length > 0) return;

			//Authentication
			$('#frmSignup input').attr('disabled', 'disabled');
			$('#frmSignup button').button('loading')

			return Deific.AccountController.register(this.register, function() {
				//user is signed up and logged in successfully, take back user to return url (if any)
				window.location = $.fn.parseParam('returnurl', window.host);
			}, function(message) {
				$("#frmSignup .signUp-error").addClass('has-error').removeClass('hide');
				$('#frmSignup input').removeAttr('disabled');
				$('#frmSignup button').button('reset')
				that.set("login.error", message);
			});
		},

		requestPasswordReset: function() {
			var that = this;
			
			//reset the state
			that.__resetRecover();

			//Validation
			// email
			var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			if(re.test(this.recover.email) == false)
				$('#frmRecover .reover-email').closest('#frmRecover .form-group').addClass('has-error');

			// check if any error element is visible or not
			if($('#frmRecover .has-error').length > 0) return;

			//Authentication
			$('#frmRecover input').attr('disabled', 'disabled');
			$('#frmRecover button').button('loading')

			return Deific.AccountController.requestPasswordReset(this.recover, function() {
				//show success message
				that.set('showRecoverForm', false);
			}, function(message) {
				$("#frmRecover .recover-error").addClass('has-error').removeClass('hide');
				$('#frmRecover input').removeAttr('disabled');
				$('#frmRecover button').button('reset')
				that.set("login.error", message);
			});
		},

		showCreateAccount: function() {
			this.__hideView();
			$('#title').html('Create '+ window.init.config.brand +' Account');
			this.set('showSignup', true);
		},

		showRecoverAccount: function(){
			this.__hideView();
			$('#title').html('Account Recovery');
			this.set('showRecover', true);
		},

		//internal methods
		__hideView: function() {
			$('#title').html('Log In');
			this.set('showDefault', false);
			this.set('showLogin', false);
			this.set('showSignup', false);
			this.set('showRecover', false);
			this.set('showfblogin', false);
			this.set('twitterLoginFailed', false);
		},

		__resetLogin: function() {
			$('#frmLogin .has-error').removeClass('has-error');
			$(".login-error").addClass('hide');
		},

		__resetSignup: function() {
			$('#frmSignup .has-error').removeClass('has-error');
			$(".signUp-error").addClass('hide');
		},

		__resetRecover: function() {
			$('#frmRecover .has-error').removeClass('has-error');
			$(".recover-error").addClass('hide');
		},

		__resetFbLogin: function() {
			$('.fblogin .has-error').removeClass('has-error');
			$(".fb-login-error").addClass('hide');
			$('.fb-loggin-in').removeClass('hide');
		},

		__getReturnUrl: function() {
			var i, x, y, returnurl, split = document.cookie.split(";");
		    for (i = 0; i < split.length; i++) {
		        x = split[i].substr(0, split[i].indexOf("="));
		        y = split[i].substr(split[i].indexOf("=") + 1);
		        x = x.replace(/^\s+|\s+$/g, "");
		        if (x == 'returnurl') {
		            returnurl = unescape(y);
		        }
		    }
		    document.cookie = 'returnurl=;path=/;expires=Thu, 01 Jan 1970 00:00:00 UTC;';
		    return returnurl;
		}
	});
}).call(this);