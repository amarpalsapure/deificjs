(function() {
	Deific.HeaderView =  Ember.View.extend({
    	templateName: 'header',

        didInsertElement: function() {
            var query = $.fn.parseParam('q');
            if(!query || query === '') return;
            this.set('searchtext', decodeURI(query));
            $(this.get('element')).find('.searchbox > input').focus();
        },

    	submitTextField: Ember.TextField.extend({
			insertNewline: function() {
		        return this.get('parentView').search();
	   		}
		}),

    	search: function() {
            //get the search query
    		var query = this.get('searchtext');
    		
    		//validation
    		if(!query || query.trim() === '') return;

            //set the search in query string
    		window.location = window.host + '/search?q=' + encodeURI(query);
    	},

    	signOut: function() {
    		return Deific.AccountController.signOut(function(data) {
				//reload the page
                window.location.reload();
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