(function() {
	Deific.FooterView =  Ember.View.extend({
	    templateName: 'footer',

	    didInsertElement: function () {
	        setTimeout(function () {
	            if ($('.sideSection-container').length === 0) {
	                $('.sideNavLeft').remove();
	                return;
	            }
	            $('.sideNavLeft').unbind('click').click(function (e) {
	                e.preventDefault();
	                if ($(this).find('.icon-arrow-left').length === 1) {
	                    $('.sideSection-container').removeClass('slideSideSection');
	                    $('.sideNavLeft i')
                                .removeClass('icon-arrow-left')
                                .addClass('icon-arrow-right');
	                }
	                else {
	                    $('.sideSection-container').addClass('slideSideSection');
	                    $('.sideNavLeft i')
                                .removeClass('icon-arrow-right')
                                .addClass('icon-arrow-left');
	                }

	                return false;
	            });
	        }, 100);
	    }
	});	
}).call(this);