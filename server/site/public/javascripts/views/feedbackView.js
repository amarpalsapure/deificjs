(function() {
    Deific.FeedbackView = Ember.View.extend({
        successFeedback: false,

        didInsertElement: function () {
            var that = this;
            //remove loader
            $('#rootProgress').remove();

            $('#txtFeedback').keyup(function () {
                if ($.trim($('#txtFeedback').val()).length > 20) $('#btnSubmitFeedback').removeAttr('disabled');
                else $('#btnSubmitFeedback').attr('disabled', 'disabled');

            });
        },

        submitFeedback: function () {
            var that = this;
            $('#btnSubmitFeedback').button('loading');

            that.controller.submitFeedback($('#txtFeedback').val(), function () {
                that.set('successFeedback', true);
            }, function (message) {
                //do the error handling
                //errors can be session expired or bad gateway
                //reset button state to loading (Bootstrap)
                message = message || 'An error occurred during submitting your feedback.';
                var alert = '<div class="alert alert-block alert-danger font9"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>' + message + '</div>';
                $('.feedbackError').html(alert).alert();

                $('#btnSubmitFeedback').button('reset');
            });
        }
	});
}).call(this);