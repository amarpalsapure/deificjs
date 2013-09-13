(function() {
	Deific.AnswerView =  Ember.View.extend({
		didInsertElement: function(){
			//remove loader and show answer
			var asyncShowAnswer = function() {
				setTimeout(function(){
					$('[name="ElementNameHere"]')
					var $loaderEle = $('[name="'+ model.get('id') +'"]');
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
				});
				if(model.text && model.text != '') {
					//show answer
					asyncShowAnswer();
					//running asyncPrettyPrint for any code in answer
					asyncPrettyPrint();
				}
			}
			
			
		}
	});
}).call(this);