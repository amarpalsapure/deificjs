(function() {
	Deific.UserView =  Ember.View.extend({
        showTagContainer: true,

        didInsertElement: function() {
            //remove loader
            $('#rootProgress').remove();

            //Set users link as active
            $('.nav-users').addClass('active');

            //enable the the active link
            var sort = $.fn.parseParam('sort', $('.sortGroup').data('default')).toLowerCase();
            $('.sortGroup #' + 'a' + sort).addClass('active');
        },

    	submitTextField: Ember.TextField.extend({
			insertNewline: function() {
		        return this.get('parentView').search();
	   		}
		})
	});
}).call(this);