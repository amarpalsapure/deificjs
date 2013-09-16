(function() {
	Deific.AnswerView =  Ember.View.extend({
		didInsertElement: function(){
			//remove loader and show answer
			var asyncShowAnswer = function() {
				setTimeout(function(){
					var $loaderEle = $('#answer-loader-'+ model.get('id'));
					//show answer
					$loaderEle.next('.answer').removeClass('hide')
					//remove loader
					$loaderEle.remove();
				}, 50);
			}

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

			var model = this.controller.get('model');
			if(model){
				//answers are loaded async.
				//didInsertElement is fired before the model is fetched, hence show a loader initially
				//once answer is fetched, remove loader and show answer
				//when answer is fetched, text property of answer will change from null to actual string
				model.addObserver('text', null, function() {
					//show answer
					asyncShowAnswer();
					
					//running asyncPrettyPrint for any code in answer
					asyncPrettyPrint();

					//remove show more if there are no hidden comments
					setTimeout(function(){
						var hiddenComments = model.get('comments').filter(function(comment) {
							return comment.get('ishidden');
						});
						if(hiddenComments && hiddenComments.get('length') > 0) return;
						var $ele = $('#answer-' + model.get('id'));
						$ele.find('.showMore').parent().remove();			
					}, 50);
				});
				if(model.get('text') && model.get('text') != '') {
					//show answer
					asyncShowAnswer();
					//running asyncPrettyPrint for any code in answer
					asyncPrettyPrint();
				}
			}
		},

		showAllComment: function() {
			var model = this.controller.get('model');
			var $ele = $('#answer-' + model.get('id'));
			$ele.find('.comment').removeClass('hide');
			$ele.find('.showMore').parent().remove();
		}
	});
}).call(this);