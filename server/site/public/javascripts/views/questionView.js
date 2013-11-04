(function () {
    Deific.QuestionView = Deific.BaseView.extend({

        hidevotecount: true,
        isTogglingBookmark: false,
        isTogglingSubscribe: false,

        didInsertElement: function () {
            var that = this;
            //remove loader
            $('#rootProgress').remove();

            //get the model
            var model = this.controller.get('model');
            if (model) {
                //Question Page
                if ($('.question-page').length === 1) {
                    //hide the answer containers
                    $('.answer-section .question').addClass('hide');

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

                    //set the page title
                    if (model.get('title')) {
                        var title = model.get('title') + ' - ' + window.init.config.brand;
                        var tags = model.get('tags');
                        if (tags && tags.get('length') > 0) {
                            tags = tags.toArray();
                            var lTitle = title.toLowerCase();
                            for (var i = 0; i < tags.get('length') ; i++) {
                                if (lTitle.indexOf(tags[i].get('name').toLowerCase()) != -1) continue;
                                title = tags[i].get('name') + ' - ' + title;
                                break;
                            };
                        }
                        $(document).attr('title', title);
                    }

                    //if there are no answers, remore the answer section
                    if (model.get('answersMeta').get('length') == 0) {
                        $('.answer-section').addClass('hide');
                    }

                    //question data is loaded and will be render immediately,
                    //running asyncPrettyPrint for any code in question
                    model.addObserver('text', this, function () {
                        asyncPrettyPrint();
                    });

                    //remove show more if there are no hidden comments
                    setTimeout(function () {
                        var hiddenComments = model.get('comments').filter(function (comment) {
                            return comment.get('ishidden');
                        });
                        if (hiddenComments && hiddenComments.get('length') > 0) return;
                        var $ele = $('#question-' + model.get('id'));
                        $ele.find('.showMore').parent().remove();
                    }, 50);

                    //highlight the sort order for the answer
                    var sort = $.fn.parseParam('sort', 'active').toLowerCase();
                    $('.right-nav-tabs #' + 'a' + sort).parent().addClass('active');

                    asyncPrettyPrint();

                    //subscribe to question (only on question detail page)
                    if (model.get('issubscribed') === true) $('#chkSubscribe input').attr('checked', 'checked');
                    $('#chkSubscribe').bootstrapSwitch();
                    $('#chkSubscribe').on('switch-change', function (e, data) {
                        if (that.get('isTogglingSubscribe') === true) return;
                        that.toggleSubscription();
                    });

                    //check the length of answer
                    //must be more than 20 characters
                    $(window).on('deificloaded', function () {
                        $('#wmd-input').keyup(function () {
                            if ($.trim($('#wmd-input').val()).length > 20) $('#btnSubmitAnswer').removeAttr('disabled');
                            else $('#btnSubmitAnswer').attr('disabled', 'disabled');
                        });
                    });

                } //e.o.f. question page

                //on question edit page pre populate the selected tags
                if ($('.question-edit-page').length === 1) {
                    //bind the controls
                    setTimeout(function () {
                        $('#txtTitle').val(model.get('title'));
                        $('#wmd-input').val(model.get('text'));
                    }, 150);

                    //set the tags
                    var tags = model.get('tags');
                    if (tags) {
                        tags.forEach(function (tag) {
                            that.__addTag(tag.get('id'), tag.get('name'));
                        });
                    }
                }

            } //e.o.f. model


            if ($('.question-new-page').length === 1 || $('.question-edit-page').length === 1) {
                //helper functions
                var tagFormatResult = function (tag) {
                    //add tags to local store, so that api called is not made, when find is done on them
                    var store = that.controller.get('store');
                    store.push('tag', {
                        id: tag.__id,
                        name: tag.name,
                        excerpt: tag.excerpt
                    });

                    //return the html
                    var markup = "<table class='tag-result'><tr>";
                    markup += "<td class='tag-info'><div class='tag-name font-bold'>" + tag.name + "</div>";
                    markup += "<div class='tag-qcount mls font9'>x " + tag.questioncount + "</div>"
                    if (tag.excerpt) {
                        markup += "<div class='pas font8'>" + tag.excerpt + "</div>";
                    }
                    markup += "</td></tr></table>"
                    return markup;
                };
                var tagFormatSelection = function (tag) {
                    return tag.name;
                };

                //select2 for tag search
                $('#tagSearch').select2({
                    placeholder: { title: 'Search for tag' },
                    id: function (tag) { return tag.__id; },
                    minimumInputLength: 1,
                    ajax: { // instead of writing the function to execute the request we use Select2's convenient helper
                        url: '/service/tags',
                        data: function (term, page) {
                            return {
                                q: term, // search term
                                ps: 5
                            };
                        },
                        results: function (data, page) { // parse the results into the format expected by Select2.
                            //remove the items which are already selected
                            var results = [];
                            var isSelected = false;
                            for (var i = 0; i < data.tags.length; i++) {
                                isSelected = false;
                                $('#selectedTags ul li div').each(function (j, ele) {
                                    if (data.tags[i].name == $(ele).html()) isSelected = true;
                                });
                                if (isSelected) continue;
                                results.push(data.tags[i]);
                            };
                            return { results: results };
                        }
                    },
                    formatResult: tagFormatResult,
                    formatSelection: tagFormatSelection
                });

                $(window).on('deificloaded', function () {
                    $('#wmd-input').keyup(function () {
                        //Enable submit button
                        that.__checkQuestionFormIsComplete();
                    });
                });

                $('#txtTitle').keyup(function () {
                    //Enable submit button
                    that.__checkQuestionFormIsComplete();
                });

            } //e.o.f new question page

            //common for all pages
            //initialize the markdown editor
            //by raising the event, event listener is in markdown-editor.js
            setTimeout(function () {
                $(window).trigger('deificloaded');
            }, 100);
        },

        newQuestionAddTag: function () {
            if ($('#tagSearch').val().trim() == "") return;

            this.__addTag($('#tagSearch').val(), $('.select2-chosen').html());

            //clear the select2
            $('#tagSearch').select2('val', '');
        },

        __addTag: function (tagId, tagName) {
            var that = this;

            var template = "<li class='select2-search-choice'> <div id='" + tagId + "'>" + tagName + "</div> <a href='#' onclick='return false;' class='select2-search-choice-close' tabindex='-1'></a> </li>";

            //hide the placeholder
            if ($('#selectedTags ul li').length == 0) {
                $('#selectedTags').removeClass('hide');
                $('#selectedTags').siblings().addClass('hide');
            }

            //max four tags allowed
            if ($('#selectedTags ul li').length >= 4) {
                var alert = '<div class="alert alert-block alert-danger font9 pull-left"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button> Max four tags allowed. </div>';
                $('.tagError').html(alert).alert();
                return;
            }

            $('#selectedTags ul').append(template);

            $('#selectedTags ul li a').on('click', function (e) {
                $(this).parent().remove();
                //Enable submit button
                that.__checkQuestionFormIsComplete();
            });

            //Enable submit button
            this.__checkQuestionFormIsComplete();
        },

        saveQuestion: function (action) {
            var title = $.trim($("#txtTitle").val());
            var text = $("#wmd-input").val();

            var tagIds = [];
            $('#selectedTags ul li div').each(function (i, ele) {
                tagIds.push($(ele).attr('id'));
            });

            //change the button state to loading (Bootstrap)
            $('#btnSubmitQuestion').button('loading');

            var onSuccess = function (savedObj) {
                //redirect user to the question page
                window.location = savedObj.get('url');
            };

            var onError = function (message) {
                //do the error handling
                //errors can be session expired or bad gateway
                //reset button state to loading (Bootstrap)
                message = message || 'An error occurred during saving answer.';
                var alert = '<div class="alert alert-block alert-danger pull-left font9"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>' + message + '</div>';
                $('.questionError').html(alert).alert();

                $('#btnSubmitQuestion').button('reset');
            };

            this.get('controller').saveQuestion(title, text, tagIds, onSuccess, onError);
        },

        saveAnswer: function () {
            var that = this;
            var text = that.get('newAnswer');

            //validation
            if (!text || !text.trim()) return;
            var model = that.controller.get('model');

            //change the button state to loading (Bootstrap)
            $('#btnSubmitAnswer').button('loading');
            that.set('isTogglingSubscribe', true);

            var reset = function (answer) {
                if (answer) answer.set('action', '');
                //reset button state to loading (Bootstrap)
                $('#btnSubmitAnswer').button('reset');
            };

            that.controller.saveAnswer(text, function (savedObj, parent) {
                if (parent.get('issubscribed') != $('#chkSubscribe input').is(':checked'))
                    $('#chkSubscribe').bootstrapSwitch('toggleState');

                setTimeout(function () {
                    that.set('isTogglingSubscribe', false);
                }, 500);

                $('.answer-section').removeClass('hide');
                $('#wmd-input').val('');
                $('#wmd-input').trigger('focus');

                reset(savedObj);

                //Set the location to # of answer
                setTimeout(function () {
                    window.location = model.get('url') + '#' + savedObj.get('id');
                }, 1000);
            }, function (message) {
                that.set('isTogglingSubscribe', false);
                //in case of any error roll back the changes (if any)
                //and show an error message
                message = message || 'An error occurred during saving answer.';
                var alert = '<div class="alert alert-block alert-danger font9"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>' + message + '</div>';
                $('.answerError').html(alert).alert();

                reset();
            });
        },

        __checkQuestionFormIsComplete: function () {
            if ($.trim($('#txtTitle').val()).length < 10 		//title
			 || $.trim($('#wmd-input').val()).length < 20		//description 
			 || $('#selectedTags ul li').length == 0) {			//tags
                $('#btnSubmitQuestion').attr('disabled', 'disabled');
                return;
            }
            $('#btnSubmitQuestion').removeAttr('disabled');
        },

        toggleBookmark: function () {
            var that = this;

            var model = that.controller.get('model');
            //owner can't bookmark his own question
            if (model.get('isowner') === true) {
                var alert = '<div style="width: 275px;" class="alert alert-block alert-danger pull-left"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button> You can\'t bookmark, your own question. </div>';
                $('#question-' + model.get('id') + ' .action-toggle-bookmark-error').html(alert).alert();
                return;
            }

            if (that.get('isTogglingBookmark') === true) return;
            that.set('isTogglingBookmark', true);

            that.controller.toggleBookmark(function () {
                that.set('isTogglingBookmark', false);
            }, function (error) {
                that.set('isTogglingBookmark', false);
                var alert = '<div class="alert alert-block alert-danger pull-left"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button> An error occurred. </div>';
                $('#question-' + model.get('id') + ' .action-toggle-bookmark-error').html(alert).alert();
            });
        },

        toggleSubscription: function () {
            var that = this;

            if (that.get('isTogglingSubscribe') === true) return;
            $('#chkSubscribe').bootstrapSwitch('toggleActivation')
            that.set('isTogglingSubscribe', true);

            that.controller.toggleSubscription(function () {
                $('#chkSubscribe').bootstrapSwitch('toggleActivation')
                that.set('isTogglingSubscribe', false);
            }, function (error) {
                $('#chkSubscribe').bootstrapSwitch('toggleActivation')
                $('#chkSubscribe').bootstrapSwitch('toggleState');

                setTimeout(function () {
                    that.set('isTogglingSubscribe', false);
                }, 500);

                var alert = '<div class="alert alert-block alert-danger position-absolute"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button> An error occurred. </div>';
                $('.subscribeError').html(alert).alert();
            });
        }
    });
}).call(this);