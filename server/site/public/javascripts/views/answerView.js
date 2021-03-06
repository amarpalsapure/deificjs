(function () {
    Deific.AnswerView = Deific.BaseView.extend({

        hidevotecount: true,
        hideanswercount: true,
        hideviewcount: true,
        hidebookmarkcount: true,

        didInsertElement: function () {

            var model = this.controller.get('model');

            //Question Page
            if ($('.question-page').length === 1) {
                //remove loader and show answer
                var asyncShowAnswer = function () {
                    setTimeout(function () {
                        var $loaderEle = $('#answer-loader-' + model.get('id'));
                        //show answer
                        model.get('rootElement').removeClass('hide')
                        //remove loader
                        $loaderEle.remove();
                    }, 50);
                }

                //pretify the code
                var asyncPrettyPrint = function () {
                    setTimeout(function () {
                        var codeBlocks = Array.prototype.slice.call(document.getElementsByTagName('pre'));
                        codeBlocks.forEach(function (codeBlock) {
                            if ($(codeBlock).children('code').length == 0) return;
                            $(codeBlock).addClass('prettyprint');
                        });
                        prettyPrint();
                    }, 10);
                };

                if (model) {
                    //answers are loaded async.
                    //didInsertElement is fired before the model is fetched, hence show a loader initially
                    //once answer is fetched, remove loader and show answer
                    //when answer is fetched, text property of answer will change from null to actual string
                    model.addObserver('text', null, function () {
                        //show answer
                        asyncShowAnswer();

                        //running asyncPrettyPrint for any code in answer
                        asyncPrettyPrint();

                        //remove show more if there are no hidden comments
                        setTimeout(function () {
                            var $ele = $('#answer-' + model.get('id'));
                            var hiddenComments = model.get('comments').filter(function (comment) {
                                return comment.get('ishidden');
                            });

                            if (hiddenComments && hiddenComments.get('length') > 0) {
                                $ele.find('.showMore').removeClass('hide');
                                return;
                            }
                            $ele.find('.showMore').parent().remove();
                        }, 50);
                    });
                    if (model.get('text') && model.get('text') != '') {
                        //show answer
                        asyncShowAnswer();
                        //running asyncPrettyPrint for any code in answer
                        asyncPrettyPrint();
                    }
                }
            }

            //Answer Edit Page
            if ($('.answer-edit-page').length === 1) {
                var that = this;
                //remove loader
                $('#rootProgress').remove();

                //bind the controls
                setTimeout(function () {
                    $('#wmd-input').val(model.get('text'));
                }, 150);

                $(window).on('deificloaded', function () {
                    $('#wmd-input').keyup(function () {
                        //Enable submit button
                        that.__checkQuestionFormIsComplete();
                    });
                });

                setTimeout(function () {
                    $(window).trigger('deificloaded');
                }, 100);
            }
        },

        __checkQuestionFormIsComplete: function () {
            if ($.trim($('#wmd-input').val()).length < 20) {			//tags
                $('#btnSubmitAnswer').attr('disabled', 'disabled');
                return;
            }
            $('#btnSubmitAnswer').removeAttr('disabled');
        },

        toggleAnswer: function (isAccepted) {
            var model = this.controller.get('model');

            //show the loader and disable the dropdown menu
            var toggleView = function () {
                model.get('rootElement').find('.action-toggle-accept').toggleClass('hide');
                model.get('rootElement').find('.action-toggle-accept-progress').toggleClass('hide');
            };

            //hide action button and show the loader
            toggleView();

            //toggle the current state of the answer as accepted/unaccepted answer
            //if user is switching the answer, 
            //then unaccept the initial answer (this will be done in the service)
            //on client side just mark the original answer as unaccepted
            this.controller.toggleAnswer(isAccepted, function (answer) {
                toggleView();
            }, function (message) {
                //show error message
                message = message || 'An error occurred during unaccepting answer.';
                var alert = '<div class="alert alert-block alert-danger pull-left"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>' + message + '</div>';
                model.get('rootElement').find('.action-toggle-accept-error').html(alert).alert();

                //hide loader and show action button
                toggleView();
            });
        },

        saveAnswer: function () {
            var text = $("#wmd-input").val();

            //change the button state to loading (Bootstrap)
            $('#btnSubmitAnswer').button('loading');

            var onSuccess = function (url) {
                //redirect user to the question page
                window.location = url;
            };

            var onError = function (message) {
                //do the error handling
                //errors can be session expired or bad gateway
                //reset button state to loading (Bootstrap)
                message = message || 'An error occurred during saving answer.';
                var alert = '<div class="alert alert-block alert-danger pull-left font9"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>' + message + '</div>';
                $('.answerError').html(alert).alert();

                $('#btnSubmitAnswer').button('reset');
            };

            this.get('controller').saveAnswer(text, onSuccess, onError);
        },
    });
}).call(this);