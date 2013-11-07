(function () {
    Deific.TagView = Ember.View.extend({
        didInsertElement: function () {
            $(this.get('element')).find('a').on('click', function (e) {
                e.preventDefault();
                return false;
            }).popover({ trigger: 'click' });
        }
    });
}).call(this);