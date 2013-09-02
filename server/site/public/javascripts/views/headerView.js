(function() {
	Deific.HeaderView =  Ember.View.extend({
		init: function() {
			this._super();
			
  			//return this;
    	},
    	didInsertElement: function(){
    		this._super()
    		this._userBind();
    	},
	    templateName: 'header',
	    hideLogin: "",
    	hideLogout: "hide",
    	fullname: "",
		userBinding: 'Deific.accountController.user',
		userDidChange: (function() {
  			return this._userBind();
		}).observes('Deific.accountController.user'),
		//private
		_userBind: function () {
			if (!this.user) {
				this.set("firstname", "");
    			this.set("lastname", "");

    			this.set("hideLogin", "");
    			this.set("hideLogout", "hide");
  			} else {
				this.set("fullname", this.user.get("firstname") + " " + this.user.get("lastname"));

    			this.set("hideLogin", "hide");
    			this.set("hideLogout", "");
  			}
  			return this;
		}
	});
}).call(this);