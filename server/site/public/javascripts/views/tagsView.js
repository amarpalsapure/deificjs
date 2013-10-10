(function() {
	Deific.TagsView =  Ember.View.extend({
        showTagContainer: true,

        didInsertElement: function() {
            //remove loader
            $('#rootProgress').remove();

            //enable the the active link
            var sort = $.fn.parseParam('sort', $('.sortGroup').data('default')).toLowerCase();
            $('.sortGroup #' + 'a' + sort).addClass('active');
        },

    	submitTextField: Ember.TextField.extend({
			insertNewline: function() {
		        return this.get('parentView').search();
	   		}
		}),

    	search: function() {
            var that = this;

            //get the search query
    		var query = this.get('searchtext').trim();

            //sort results
            var sort = $.fn.parseParam('sort', $('.sortGroup').data('default')).toLowerCase();

            $('#btnTagSearch').button('loading');

            var resetView = function() {
                //reset the button
                $('#btnTagSearch').button('reset');
                //hide the pager
                that.set('showTagContainer', query === '');
            }

            this.controller.search(query, sort, function(tags) {
                resetView();
            }, function(message) {
                resetView();
            });
    	}
	});
}).call(this);