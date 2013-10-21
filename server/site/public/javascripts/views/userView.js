(function() {
	Deific.UserView =  Ember.View.extend({
        showTagContainer: true,
        showVoteContainer: false,
        isowner: true,

        reset: {},
        profile: {},

        didInsertElement: function () {
            var that = this;
            var model = that.controller.get('model');

            if (!Deific.AccountController.user
                || model.get('id') != Deific.AccountController.user.userid) {
                $('#avotes').remove();
                this.set('isowner', false);
            }

            //remove loader
            $('#rootProgress').remove();

            //Set users link as active
            $('.nav-users').addClass('active');

            //set the title of the page
            var title =  $(document).attr('title');
            title = title.replace('User', model.get('fullname'));
            $(document).attr('title', title);

            //IMPORTANT
            //Same view is used on two pages
            //On user edit page tabs are preset, on this assumption,
            //if tab are not preset trigger editors code

            //enable the the active link
            var tab = $.fn.parseParam('tab', $('.tabGroup').data('default'));
            if (tab) {
                tab = tab.toLowerCase();
                $('.tabGroup #' + 'a' + tab).addClass('active');

                var count = model.get('entities').get('length');

                switch (tab.toLowerCase()) {
                    case 'answers':
                        $('#noactivity').html('not answerd any question');
                        $('#title').html(count + (count > 1 ? ' Answers' : ' Answer'));
                        break;
                    case 'favorites':
                        $('#noactivity').html('no favorite question');
                        $('#title').html(count + count > 1 ? ' Favoirte Questions' : ' Favoirte Question');
                        break;
                    case 'votes':
                        $('#noactivity').html('not voted any question or answer.');
                        $('#title').html(count + count > 1 ? ' Votes' : ' Vote');
                        break;
                    default:
                        $('#noactivity').html('not asked any question');
                        $('#title').html(count + (count > 1 ? ' Questions' : ' Question'));
                }

                //show the voting details view if selected tab is `votes`
                if (tab === 'votes') this.set('showVoteContainer', true);
            } else {
                //check the length of answer
                //must be more than 20 characters
                $(window).on('deificloaded', function () {
                    $('.profile-description #wmd-input').keyup(function () {
                        var about = $.trim($('#wmd-input').val());
                        if (about.length > 20 && about != model.get('about')) $('#btnSubmit').removeAttr('disabled');
                        else $('#btnSubmit').attr('disabled', 'disabled');
                    });
                    $('#wmd-input').val(model.get('about'));
                });

                //initialize the markdown editor
                //by raising the event, event listener is in markdown-editor.js
                setTimeout(function () {
                    $(window).trigger('deificloaded');
                }, 100);

                var checkPwdComplete = function () {
                    //Enable reset password button
                    that.__checkResetFormIsComplete();
                };
                $('#oldpwd').keyup(checkPwdComplete);
                $('#newpwd').keyup(checkPwdComplete);
                $('#confirmpwd').keyup(checkPwdComplete);

                $('#divSuccessModal').on('hidden.bs.modal', function () {
                    window.location = window.host + '/users/login?returnurl=' + window.location.pathname;
                })
            }
        },

        __checkResetFormIsComplete: function () {
            if ($('#oldpwd').val().length < 2
			 || $('#newpwd').val().length < 2
			 || $('#confirmpwd').val().length < 2
             || ($('#newpwd').val()!= $('#confirmpwd').val())) {
                $('#btnReset').attr('disabled', 'disabled');
                return;
            }
            $('#btnReset').removeAttr('disabled');
        },

        resetPassword: function () {
            var that = this;

            //Resetting password
            $('.reset-pwe-error').addClass('hide');
            $('.reset-password input').attr('disabled', 'disabled');
            $('#btnReset').button('loading')

            //calling account controll as user model shouldn't contain password field
            Deific.AccountController.resetPassword(that.reset.oldpassword, that.reset.confirmpassword, function () {
                //password changed successfully, show confirmation modal, and redirect to login again
                $("#divSuccessModal").modal();
            }, function (message) {
                $(".reset-pwe-error").addClass('has-error').removeClass('hide');
                $('.reset-password input').removeAttr('disabled');
                $('#btnReset').button('reset')
                that.set("reset.error", message);
            });
        },

        saveProfile: function () {
            var that = this;

            //updating profile
            $('#wmd-input').attr('disabled', 'disabled');
            $('#btnSubmit').button('loading')

            var resetView = function () {
                $('#wmd-input').removeAttr('disabled');
                $('#btnSubmit').button('reset')
            };

            //calling account controll as user model shouldn't contain password field
            that.controller.updateProfile(that.profile.about, function () {
                //reset view
                resetView();
            }, function (message) {
                //in case of any error roll back the changes (if any)
                //and show an error message
                message = message || 'An error occurred during updating profile.';
                var alert = '<div class="alert alert-block alert-danger font9 mts pull-left"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>' + message + '</div>';
                $('.profileError').html(alert).alert();

                //reset view
                resetView();
            });
        }
	});
}).call(this);