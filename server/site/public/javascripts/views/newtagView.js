(function() {
    Deific.NewtagView = Ember.View.extend({
        tag: {},

        didInsertElement: function () {
            var that = this;
            //remove loader
            $('#rootProgress').remove();

            var checkInput = function () {
                if ($.trim($('#txtName').val()).length < 1   		    //name
                    || $.trim($('#txtExcerpt').val()).length < 20		//excerpt
                    || $.trim($('#wmd-input').val()).length < 20) {			//description
                    $('#btnSaveTag').attr('disabled', 'disabled');
                        return;
                }
                $('#btnSaveTag').removeAttr('disabled');
            };

            //must be more than 20 characters
            $(window).on('deificloaded', function () {
                $('#txtName').keyup(checkInput);
                $('#txtExcerpt').keyup(checkInput);
                $('#wmd-input').keyup(checkInput);
            });

            //initialize the markdown editor
            //by raising the event, event listener is in markdown-editor.js
            setTimeout(function () {
                $(window).trigger('deificloaded');
            }, 100);
        },

        saveTag: function () {
            var that = this;
            $('#btnSaveTag').button('loading');

            that.controller.saveTag(that.tag.name.trim(), that.tag.excerpt.trim(), that.tag.description.trim(), function () {
                $('#divSuccess').removeClass('hide');
                $('#frmNewTag').addClass('hide');
            }, function (message) {
                //do the error handling
                //errors can be session expired or bad gateway
                //reset button state to loading (Bootstrap)
                message = message || 'An error occurred during saving tag.';
                var alert = '<div class="alert alert-block alert-danger font9"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>' + message + '</div>';
                $('.tagError').html(alert).alert();

                $('#btnSaveTag').button('reset');
            });
        },

        addmore: function () {
            window.location.reload();
        }

	});
}).call(this);