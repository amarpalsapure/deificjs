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
			asyncPrettyPrint();

			var answers = this.controller.content.get('answers');
			if(answers && answers.loadingRecordsCount > 0){

				answers.toArray()[0].addObserver('text', null,  function(){
					//remove answer loader
					setTimeout(function(){
						$('#answerLoadingProgress').hide();
						$('.answer-list').removeClass('hide');	
					}, 10);					

					//run asyncPrettyPrint for any code in answer 
					asyncPrettyPrint();

					//remove the duplicate dates so that answers given on same day get merged
					setTimeout(function(){
						var pName = '';
						$('.answer .time-container').each(function(i,ele){ 
							var cName = $(ele).attr('name');
							if(pName != cName) {
								pName = cName;
								return;
							}
							$(ele).closest('.answer').prevAll('.answer').next('.bubble-container').remove();
							$(ele).closest('.time-row').remove();
						});
					}, 10);
				});
			}
		}
	});

	Deific.TagView = Ember.View.extend({
		templateName: 'tag',
		selfurl: function(){
			return '/questions/tagged/' + this.get('tag');
		}.property('tag')
	});
}).call(this);