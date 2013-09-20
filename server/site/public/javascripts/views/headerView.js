(function() {
	Deific.HeaderView =  Ember.View.extend({
    	templateName: 'header',

    	submitTextField: Ember.TextField.extend({
			insertNewline: function() {
		        return this.get('parentView').search();
	   		}
		}),

    	search: function() {
    		var query = this.get('searchtext');
    		
    		//validation
    		if(!query || query.trim() === '') return;

    		window.location = window.host + '/search?q=' + encodeURI(query);
    	},

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