(function() {
  Deific.AccountController = Ember.ArrayController.create({
    init: function() {
      this.setUser();
    },
    user: null,
    fbLogin: function(callback) {
      var _this = this;

      return Neptune.parseDataSource.fbLogin(function(data, error) {
        var tempUser;

        if (!error) {
          _this.setUser();
          callback(_this.user, null);
          tempUser = _this.user;
          return FB.api("/me", function(response) {
            var _this = this;

            tempUser.firstName = response.first_name;
            tempUser.lastName = response.last_name;
            return Neptune.parseDataSource.updateUser(tempUser, function(data, error) {
              Neptune.accountController.setUser();
              return callback(data, error);
            });
          });
        } else {
          return callback(null, Neptune.parseDataSource.getError(-1, 'Email or password is incorrect', 'ERROR', 'Neptune.AccountController-login'));
        }
      });
    },
    login: function(login, callback) {
      var errorMessage,
        _this = this;

      errorMessage = '';
      if (!login.email || login.email.length === 0) {
        errorMessage = 'Please enter your email address';
      }
      if (!login.password || login.password.length === 0) {
        errorMessage = 'Please enter your password';
      }
      if (errorMessage.length === 0) {
        Ember.$.post('/service/users/auth', login).then(function(response, error) {
          if (response && response.success) {
            //syncing local store
            window.init = {};
            window.init.user = response.user;
            
            //load logged in user in store
            Deific.User.find(response.user.id);

            _this.setUser();
            return callback(_this.user, null);
          } else {
            return callback(null,'Email or password is incorrect');
          }
        });
      } else {
        return callback(null, errorMessage);
      }
    },
    logout: function() {
      Neptune.parseDataSource.logout();
      return this.setUser();
    },
    register: function(register, callback) {
      var errorMessage,
        _this = this;

      errorMessage = '';
      if (register.firstName === null || register.firstName.length === 0) {
        errorMessage = 'Please specify a first name';
      }
      if (register.lastName === null || register.lastName.length === 0) {
        errorMessage = 'Please specify a last name';
      }
      if (register.email === null || register.email.length === 0) {
        errorMessage = 'Please specify an email address';
      }
      if (register.password === null || register.password.length === 0) {
        errorMessage = 'Please specify a password';
      }
      if (errorMessage.length === 0) {
        return Neptune.parseDataSource.register(register, function(data, error) {
          if (!error) {
            return Neptune.parseDataSource.login(register.email, register.password, function(data, error) {
              if (!error) {
                return callback(_this.setUser(), null);
              } else {
                return callback(null, Neptune.parseDataSource.getError(error.code, error.message, 'ERROR', 'Neptune.AccountController-register'));
              }
            });
          } else {
            return callback(null, Neptune.parseDataSource.getError(error.code, error.message, 'ERROR', 'Neptune.AccountController-register'));
          }
        });
      } else {
        return callback(null, Neptune.parseDataSource.getError(-1, errorMessage, 'ERROR', 'Neptune.AccountController-register'));
      }
    },
    requestPasswordReset: function(forgotPassword, callback) {
      return Neptune.parseDataSource.requestPasswordReset(forgotPassword.email, function(data, error) {
        return callback(data, error);
      });
    },
    updateUser: function(user, callback) {
      var _this = this;

      this.set('user.firstName', user.firstName);
      this.set('user.lastName', user.lastName);
      return Neptune.parseDataSource.updateUser(user, function(data, error) {
        _this.setUser();
        return callback(data, error);
      });
    },
    setUser: function() {
      this.set('user', Deific.localDataSource.getCurrentUser());
      return this.user;
    }
  });

}).call(this);
