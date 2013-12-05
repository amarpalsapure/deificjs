(function() {
    Deific.AccountController = Ember.ArrayController.create({
        init: function() {
            this.setUser();
        },
        isLoggedIn: false,
        user: null,
        fbSignIn: function(accessToken, onSuccess, onError) {
          Ember.$.post('/service/users/fbauth', { accessToken: accessToken }).then(function(response) {
              onSuccess();
          }, function(error){
              onError(Deific.localDataSource.handleError(error, 'Deific.AccountController-fbSignIn'));
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
        resetPassword: function (oldpwd, newpwd, onSuccess, onError) {
            Ember.$.post('/service/users/reset', { oldpwd: oldpwd, pwd: newpwd }).then(function(){
                onSuccess();
            }, function (error) {
                onError(Deific.localDataSource.handleError(error, 'Deific.AccountController-resetPassword'));
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
