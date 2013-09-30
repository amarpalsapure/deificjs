(function() {
	Deific.AnswerView =  Deific.BaseView.extend({

		hidevotecount: true,
		hideanswercount: true,
		hideviewcount: true,
		hidebookmarkcount: true,

		didInsertElement: function(){
			//remove loader and show answer
			var asyncShowAnswer = function() {
				setTimeout(function(){
					var $loaderEle = $('#answer-loader-'+ model.get('id'));
					//show answer
					$('#answer-'+model.get('id')).removeClass('hide')
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
						var $ele = $('#answer-' + model.get('id'));
						var hiddenComments = model.get('comments').filter(function(comment) {
							return comment.get('ishidden');
						});

						if(hiddenComments && hiddenComments.get('length') > 0) {
							$ele.find('.showMore').removeClass('hide');
							return;
						}
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

		acceptAnswer: function() {
			//show the loader and disable the dropdown menu

			//mark current answer as accepted answer
			//if user is switching the answer, 
			//then unaccept the initial answer (this will be done in the service)
			//on client side just mark the original answer as unaccepted
			this.controller.acceptAnswer(function(answer) {

			}, function(error) {

			});

		},

		unacceptAnswer: function() {
			var model = this.controller.get('model');
		},

		notimplemented: function() {
			alert('not implemented');
		}
	});
}).call(this);