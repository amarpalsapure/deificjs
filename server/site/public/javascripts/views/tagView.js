(function () {
    Deific.TagView = Ember.View.extend({
        didInsertElement: function () {
            if ($(window).width() > 767) {
                $(this.get('element')).find('a').popover({ trigger: 'hover' });
                $(this.get('element')).find('a').on('show.bs.popover', function () {
                    setTimeout(function () {
                        $('.popover-content .display-block:last').remove();
                    }, 10);
                });                
            } else {
                $(this.get('element')).find('a').on('click', function (e) {
                    e.preventDefault();
                    return false;
                }).popover({ trigger: 'click' });
            }
        }
    });
}).call(this);