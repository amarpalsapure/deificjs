(function() {
    Deific.AccountController = Ember.ArrayController.create({
        init: function() {
            this.setUser();
        },
        isLoggedIn: false,
        user: null,
        fbSignIn: function(callback) {
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
        signIn: function(login, onSuccess, onError) {
            Ember.$.post('/service/users/auth', login).then(function(response) {
                onSuccess();
            }, function(error){
                onError(Deific.localDataSource.handleError(error, 'Deific.AccountController-signIn'));
            });
        },
        signOut: function(onSuccess, onError) {
            var that = this;
            Ember.$.post('/service/users/logout').then(function(response) {
                onSuccess();
            }, function(error){
                onError(Deific.localDataSource.handleError(error, 'Deific.AccountController-signOut'));
            });
        },
        register: function(register, onSuccess, onError) {
          Ember.$.post('/service/users/register', register).then(function(response) {
              onSuccess();
          }, function(error){
              onError(Deific.localDataSource.handleError(error, 'Deific.AccountController-register'));
          });
        },
        requestPasswordReset: function(forgotPassword, onSuccess, onError) {
          Ember.$.post('/service/users/recover', forgotPassword).then(function(response) {
              onSuccess();
          }, function(error){
              onError(Deific.localDataSource.handleError(error, 'Deific.AccountController-register'));
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
            var user = Deific.localDataSource.getCurrentUser();
            if(user) this.set('isLoggedIn', true);
            this.set('user', Deific.localDataSource.getCurrentUser());
            return this.user;
        }
    });

}).call(this);
