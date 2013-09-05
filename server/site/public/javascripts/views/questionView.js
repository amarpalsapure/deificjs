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
			var model = this.controller.get('model');
			model.addObserver('description', this, function(){
				asyncPrettyPrint();	
			});

			asyncPrettyPrint();
		}
	});

	Deific.QuestionLoginView = Ember.View.extend({
		templateName: "question/login",

		didInsertElement:function(){
			var that = this;
			$('#loginModal')
				.removeClass('hide')
				.modal()
				.on('hidden.bs.modal', function(){
					that.get('controller').transitionTo('question');
				});
		}

	});
}).call(this);