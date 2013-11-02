(function() {
	Deific.TagwikiView = Ember.View.extend({
		didInsertElement: function() {
		    //remove loader
		    $('#rootProgress').remove();

		    if ($('.tagwiki-edit-page').length === 0) return;

		    var checkInput = function () {
		        if ($.trim($('#txtExcerpt').val()).length < 20		    //excerpt
                    || $.trim($('#wmd-input').val()).length < 20) {		//description
		            $('#btnSaveTagwiki').attr('disabled', 'disabled');
		            return;
		        }
		        $('#btnSaveTagwiki').removeAttr('disabled');
		    };

		    //must be more than 20 characters
		    $(window).on('deificloaded', function () {
		        $('#txtExcerpt').keyup(checkInput);
		        $('#wmd-input').keyup(checkInput);
		    });

		    //initialize the markdown editor
		    //by raising the event, event listener is in markdown-editor.js
		    setTimeout(function () {
		        $(window).trigger('deificloaded');
		    }, 100);
		},

		saveTagwiki: function () {
		    var that = this;
		    $('#btnSaveTagwiki').button('loading');

		    that.controller.saveTagwiki(function (model) {
		        setTimeout(function () {
		            window.location = model.get('infoUrl');
		        }, 500);
		    }, function (message) {
		        //do the error handling
		        //errors can be session expired or bad gateway
		        //reset button state to loading (Bootstrap)
		        message = message || 'An error occurred during saving tagwiki.';
		        var alert = '<div class="alert alert-block alert-danger font9"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">x</button>' + message + '</div>';
		        $('.tagError').html(alert).alert();

		        $('#btnSaveTagwiki').button('reset');
		    });
		}
	});
}).call(this);