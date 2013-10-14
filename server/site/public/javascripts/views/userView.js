(function() {
	Deific.UserView =  Ember.View.extend({
        showTagContainer: true,
        showVoteContainer: false,

        didInsertElement: function() {
            var model = this.controller.get('model');

            //remove loader
            $('#rootProgress').remove();

            //Set users link as active
            $('.nav-users').addClass('active');

            //set the title of the page
            var title =  $(document).attr('title');
            title = title.replace('User', model.get('fullname'));
            $(document).attr('title', title);

            //enable the the active link
            var tab = $.fn.parseParam('tab', $('.tabGroup').data('default')).toLowerCase();
            $('.tabGroup #' + 'a' + tab).addClass('active');

            if(tab === 'votes') this.set('showVoteContainer', true);
        },

    	submitTextField: Ember.TextField.extend({
			insertNewline: function() {
		        return this.get('parentView').search();
	   		}
		})
	});
}).call(this);