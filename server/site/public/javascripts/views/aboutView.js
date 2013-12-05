(function () {
    Deific.AboutView = Ember.View.extend({
        didInsertElement: function () {
            //remove loader
            $('#rootProgress').remove();

            $(window).on('scroll', function () {
                if ($(window).scrollTop() > 200)
                    if ($('.question-answer .background-image').position().left > 50) {
                        $('.question-answer .background-image').animate({
                            left: '0'
                        }, 'slow');
                    }
            });
        }
    });
}).call(this);