(function() {
	Deific.QuestionView =  Ember.View.extend({
		didInsertElement: function(){
			//remove loader
			$('#rootProgress').remove();

			//set page title
			var model = this.controller.get('model');
			var title = model.get('title') + " - " + $(document).attr('title');
			var tags = model.get('__tags');
			if(tags && tags.length > 0) title = tags[0] + " - " + title;
			$(document).attr('title', title);

			//highlight the sort order for the answer
			var sort = $.fn.parseParam('sort', 'active').toLowerCase();
			$('.sortGroup #' + 'a' +sort).addClass('active');

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

			//question data is loaded and will be render immediately,
			//running asyncPrettyPrint for any code in question
			var model = this.controller.get('model');
			model.addObserver('text', this, function(){
				asyncPrettyPrint();	
			});

			asyncPrettyPrint();

			//check the length of answer
			//must be more than 20 characters
			$(window).on('deificloaded', function(){
				$('#wmd-input').keyup(function() {
			        if($.trim($('#wmd-input').val()).length > 20) $('#btnSubmitAnswer').removeAttr('disabled');
			        else $('#btnSubmitAnswer').attr('disabled', 'disabled');
			    });
			});

			//initialize the markdown editor
			//by raising the event, event listener is in markdown-editor.js
			setTimeout(function(){
				$(window).trigger('deificloaded');
			}, 100);

		}
	});
	Deific.TagView = Ember.View.extend({
		didInsertElement: function() {
			$(this.get('element')).find('a').popover({trigger: 'hover'});
		}
	});
}).call(this);