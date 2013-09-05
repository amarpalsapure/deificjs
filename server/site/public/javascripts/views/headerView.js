(function() {
	Deific.HeaderView =  Ember.View.extend({
		init: function() {
			this._super();
  	},
  	didInsertElement: function(){
  		this._super()
  	},
    templateName: 'header',
    loginurl: function(){
      return  '/users/login?returnurl=' + window.location.pathname;
    }
	});
}).call(this);