(function() {
	Deific.QuestionView =  Deific.BaseView.extend({

		question: {},
		hidevotecount: true,

		didInsertElement: function(){
			//hide the answer containers
			$('.answer-section .question').addClass('hide');

			var that = this;
			//remove loader
			$('#rootProgress').remove();

			//pretify the code
			var asyncPrettyPrint = function(){
				setTimeout(function(){
					var codeBlocks = Array.prototype.slice.call(document.getElementsByTagName('pre'));
					codeBlocks.forEach(function (codeBlock) {
						if ($(codeBlock).children('code').length == 0) return;
		 				$(codeBlock).addClass('prettyprint');
					});
					prettyPrint();
				}, 10);
			};

			//get the model
			var model = this.controller.get('model');
			if(model && model.get('title')) {
				//set the page title
				var title = model.get('title') + ' - ' + $(document).attr('title');
				var tags = model.get('tags');
				if(tags && tags.get('length') > 0) {
					tags = tags.toArray();
					var lTitle = title.toLowerCase();
					for (var i = 0; i < tags.get('length'); i++) {
						if(lTitle.indexOf(tags[i].get('name').toLowerCase()) != -1) continue;
						title = tags[i].get('name') + ' - ' + title;
						break;
					};
				}
				$(document).attr('title', title);

				//if there are no answers, remore the answer section
				if(model.get('answersMeta').get('length') == 0){
					$('.answer-section').addClass('hide');
				}

				//question data is loaded and will be render immediately,
				//running asyncPrettyPrint for any code in question
				model.addObserver('text', this, function(){
					asyncPrettyPrint();	
				});

				//remove show more if there are no hidden comments
				setTimeout(function(){
					var hiddenComments = model.get('comments').filter(function(comment) {
						return comment.get('ishidden');
					});
					if(hiddenComments && hiddenComments.get('length') > 0) return;
					var $ele = $('#question-' + model.get('id'));
					$ele.find('.showMore').parent().remove();			
				}, 50);
			}

			//highlight the sort order for the answer
			var sort = $.fn.parseParam('sort', 'active').toLowerCase();
			$('.sortGroup #' + 'a' +sort).addClass('active');

			asyncPrettyPrint();

			//check the length of answer
			//must be more than 20 characters
			$(window).on('deificloaded', function(){
				$('.question-page #wmd-input').keyup(function() {
			        if($.trim($('#wmd-input').val()).length > 20) $('#btnSubmitAnswer').removeAttr('disabled');
			        else $('#btnSubmitAnswer').attr('disabled', 'disabled');
			    });
			});

			//initialize the markdown editor
			//by raising the event, event listener is in markdown-editor.js
			setTimeout(function(){
				$(window).trigger('deificloaded');
			}, 100);


			if($('#tagSearch').length > 0) {
				function tagFormatResult(tag) {
					//add tags to local store, so that api called is not made, when find is done on them
					var store = that.controller.get('store');
					store.push('tag', {
						id: tag.__id,
						name: tag.name,
						description: tag.description
					});

					//return the html
			        var markup = "<table class='tag-result'><tr>";
			        markup += "<td class='tag-info'><div class='tag-name font-bold'>" + tag.name + "</div>";
			        markup += "<div class='tag-qcount mls font9'>x "+ tag.questioncount +"</div>"
			        if (tag.description) {
			            markup += "<div class='pas font8'>" + tag.description + "</div>";
			        }
			        markup += "</td></tr></table>"
			        return markup;
			    };

			    function tagFormatSelection(tag) {
			        return tag.name;
			    };

				//select2 for tag search
				$('#tagSearch').select2({
		            placeholder: { title: 'Search for tag' },
		            id: function(tag){ return tag.__id; },
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
								$('#selectedTags ul li div').each(function(j, ele) { 
									if(data.tags[i].name == $(ele).html()) isSelected = true;
								});
								if(isSelected) continue;
		                    	results.push(data.tags[i]);
		                    };
		                    return { results: results };
		                }
		            },
		            formatResult: tagFormatResult,
		            formatSelection: tagFormatSelection
		        });

				$(window).on('deificloaded', function(){
					$('.question-new-page #wmd-input').keyup(function() {
				        //Enable submit button
						that.__checkQuestionFormIsComplete();
				    });
				});

				$('#txtTitle').keyup(function() {
					//Enable submit button
					that.__checkQuestionFormIsComplete();
				});
			}			
		},
		
		newQuestionAddTag: function() {
			var that = this;

			if($('#tagSearch').val().trim() == "") return;

			var template = "<li class='select2-search-choice'> <div id='"+ $('#tagSearch').val() +"'>"+ $('.select2-chosen').html() +"</div> <a href='#' onclick='return false;' class='select2-search-choice-close' tabindex='-1'></a> </li>";

			//clear the select2
			$('#tagSearch').select2('val', '');

			//hide the placeholder
			if($('#selectedTags ul li').length == 0) {
				$('#selectedTags').removeClass('hide');
				$('#selectedTags').siblings().addClass('hide');
			}

			//max four tags allowed
			if($('#selectedTags ul li').length >= 4) {
				var alert = '<div class="alert alert-block alert-danger font9 pull-left"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button> Max four tags allowed. </div>';
				$('.tagError').html(alert).alert();
				return;			
			}

			$('#selectedTags ul').append(template);

			$('#selectedTags ul li a').on('click', function(e){
				$(this).parent().remove();
				//Enable submit button
				that.__checkQuestionFormIsComplete();
			});

			//Enable submit button
			this.__checkQuestionFormIsComplete();
		},

		createQuestion: function() {
			var title = this.get('question').title.trim();
			var text = this.get('question').text.trim();

			var tagIds = [];
			$('#selectedTags ul li div').each(function(i,ele) { 
				tagIds.push($(ele).attr('id'));
			});

			//change the button state to loading (Bootstrap)
			$('#btnSubmitQuestion').button('loading');

			this.get('controller').createQuestion(title, text, tagIds, function(savedObj){
				//redirect user to the question page
				window.location = savedObj.get('url');
			}, function(error) {
				//do the error handling
				//errors can be session expired or bad gateway
				//reset button state to loading (Bootstrap)
				$('#btnSubmitQuestion').button('reset');		
			});
		},

		__checkQuestionFormIsComplete: function() {
			if($.trim($('#txtTitle').val()).length < 10 		//title
			 || $.trim($('#wmd-input').val()).length < 20		//description 
			 || $('#selectedTags ul li').length == 0) {			//tags
	        	$('#btnSubmitQuestion').attr('disabled', 'disabled');
	        	return;
	     	}
	     	$('#btnSubmitQuestion').removeAttr('disabled');
		},

		notimplemented: function() {
			alert('not implemented');
		},

		toggleBookmark: function() {
			alert('not implemented');
		}
	});
}).call(this);