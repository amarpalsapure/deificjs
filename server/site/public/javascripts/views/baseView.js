(function(){
	Deific.BaseView = Ember.View.extend({

		isCommenting: false,
		isVoteOpen: false,

		questionpage: true,
		updateInProgress: false,

		//action handlers
		commentAction: function() {	this.set('isCommenting', !this.get('isCommenting')); },

		//vote details are open or not
		voteDetails: function() { this.set('isVoteOpen', true);	},

		showShare: function() {
			var model = this.controller.get('model');
			if(!model) return;

			var type = model.get('type');

			var $rootElement = model.get('rootElement');
			var $ele = $rootElement.find('.entity-action .share a');
			var content = '<div class=\"share-popup\">	\
								<span class=\"pbxs pull-left\">share a link to this ' + type + '</span>	\
								<input type=\"text\" value=' + model.get('murl') + '>	\
								<a class=\"close-share pull-right\" style=\"padding:2px 0\">close</a>	\
							</div>';
			$ele.popover({
				title: '',
				html: true,
				content: content,
				placement: 'left',
				delay: { show: 50, hide: 1 },

			}).on('shown.bs.popover', function() {
				var that = this;
				$(that).siblings().find('.close-share').click(function(){
					$(that).popover('hide');
				})
			}).popover('show');
		},

		showAllComment: function() {
			var model = this.controller.get('model');
			if(!model) return;

			var $rootElement = model.get('rootElement');
			$rootElement.find('.comment').removeClass('hide');
			$rootElement.find('.showMore').parent().remove();
		},

		registerVote: function(isUpVote) {
			var that = this;
			var model = that.controller.get('model');

			//private functions
			var validateVoteUser = function() {
				if(model.get('isowner') === false) return false;
				//show error
				var alert = '<div style="width: 240px" class="alert alert-block alert-danger font9 pull-left"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button> You can\'t vote on your own post. </div>';
				model.get('rootElement').find('.voteError').html(alert).alert();
				return true;
			};

			var showVoteError = function(message) {
				message = message || 'An error occurred during saving your vote.';
				var alert = '<div class="alert alert-block alert-danger font9 pull-left"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button> ' + message + ' </div>';
				model.get('rootElement').find('.voteError').html(alert).alert();
			};

			var toggleVoteLoader = function() {
				model.get('rootElement').find('.voteProgress').toggleClass('hide');
			};

			//check if the owner of entity is not voting
			if(validateVoteUser()) return;

			//keep a local flag to track the progress
			if(that.updateInProgress) return;
			that.set('updateInProgress', true);

			//show the loader
			toggleVoteLoader();
			
			//reset the view
			var reset = function() {
				toggleVoteLoader();
				that.set('updateInProgress', false);
				model.set('action', '');
			};

			that.controller.registerVote(isUpVote, function(savedObj) {
				//reset the view
				reset();
			}, function(message) {
				//reset the view
				reset();
				//show error message
				showVoteError(message);
			});
		},

		saveComment: function() {
			var text = this.get('newComment');

			//validation
			if (!text || !text.trim()) return;

			var that = this;
			var parentModel = that.controller.get('model');

			var toggleView = function() {
				setTimeout(function(){
					parentModel.get('rootElement').find('.actionProgress').toggleClass('hide');
					parentModel.get('rootElement').find('.entity-action').toggleClass('hide');
				}, 10);
			};

			//show progress bar
			toggleView();

			//hide the text area and command buttons
			that.set('isCommenting', false);

			that.controller.saveComment(text, function(comment) {
				// Clear the "New Comment" text field
				that.set('newComment', '');
				toggleView();
			}, function(message) {
				//hide the progress bar
				toggleView();

				//show the text area and command buttons
				that.set('isCommenting', true);

				//show an error message
				setTimeout(function() {
					message = message || 'An error occurred during saving comment.';
					var alert = '<div class="alert alert-block alert-danger pull-left"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button> ' + message + ' </div>';
					parentModel.get('rootElement').find('.action-save-comment-error').html(alert).alert();
				}, 50);
			});
		},

		deleteComment: function(comment) {
			var that = this;
			var model = that.controller.get('model');

			//show the confirmation modal
			$('#divDeleteModal .modal-title').html('Delete the Comment');
			$('#divDeleteModal .modal-body').html('<p>Are you sure you want to delete the comment?</p><p>This action cannot be undone.</p>');

			$('#divDeleteModal').modal('show');

			//on confirmation delete the comment
			$('#divDeleteModal .btn-danger').unbind('click').click(function(e) {
				//reset the state of the view
				var resetView = function() {
					$('#divDeleteModal .btn-danger').button('reset');
					$('#divDeleteModal').modal('hide');
				}

				//set the state of button to loading
				$('#divDeleteModal .btn-danger').button('loading');

				that.controller.deleteComment(comment, function() {
					//remove the comment object from list too
					model.get('comments').removeObject(comment);

					//reset the view
					resetView();
				}, function(message) {
					message = message || 'An error occurred while deleting the comment.';
					var alert = '<div style="width: 300px" class="alert alert-block alert-danger font9 pull-left"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>' + message + '</div>';

					//show the comment and error
					comment.get('rootElement').find('.action-delete-comment-error').html(alert).alert();

					//reset the view
					resetView();
				});
			});
		},

		deleteEntity: function() {
			var that = this;
			var model = that.controller.get('model');

			var type = model.get('type');
			//show the confirmation modal
			var entity = type === 'question' ? 'Question' : 'Answer';
			$('#divDeleteModal .modal-title').html('Delete the ' + entity);
			$('#divDeleteModal .modal-body').html('<p>Are you sure you want to delete the ' + entity + '?</p><p>You will loose all the points you earned on this ' + type + '.</p><p>This action cannot be undone.</p>');

			$('#divDeleteModal').modal('show');

			//on confirmation delete the entity
			$('#divDeleteModal .btn-danger').unbind('click').click(function(e) {
				//reset the state of the view
				var resetView = function() {
					$('#divDeleteModal .btn-danger').button('reset');
					$('#divDeleteModal').modal('hide');
				}

				//set the state of button to loading
				$('#divDeleteModal .btn-danger').button('loading');

				that.controller.deleteEntity(function() {
					//On success reload the page according to type of entity
					if(type === 'question') window.location = window.host;
					else window.location.reload();
				}, function(message) {
					message = message || 'An error occurred while deleting the ' + type + '.';
					var alert = '<div class="alert alert-block alert-danger font9 pull-left"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>' + message + '</div>';
					
					//show error
					var $rootElement = model.get('rootElement');
					$rootElement.find('.action-delete-entity-error').html(alert).alert();

					//reset the view
					resetView();
				});
			});
		},
		
	});
}).call(this);