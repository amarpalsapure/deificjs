(function() {
	Deific.AnswerView =  Ember.View.extend({
		didInsertElement: function(){
			//remove loader
			var model = this.controller.get('model');
			if(model){
				model.addObserver('text', null, function() {
					setTimeout(function(){
						$('[name="ElementNameHere"]')
						var $loaderEle = $('[name="'+ model.get('id') +'"]');
						$loaderEle.next('.answer').removeClass('hide')
						$loaderEle.remove();
					}, 50);

					//running asyncPrettyPrint for any code in answer
					asyncPrettyPrint();
				});
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
		}
	});
}).call(this);