(function() {
	Deific.HeaderView =  Ember.View.extend({
    	templateName: 'header',

    	signOut: function() {
    		return Deific.AccountController.signOut(function(data) {
				//don't do anything
				}, function(error) {
					var alert = '<div class="alert alert-block alert-danger font9">' +
              						'<button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>' +
              						'An error occurred during logging you out.' +
            					'</div>';
					$(".logoutError").html(alert).alert();
				});
    	}
	});
}).call(this);