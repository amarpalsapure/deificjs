(function(){
	Deific.BaseView = Ember.View.extend({

		questionpage: true,

		showShare: function() {
			var model = this.controller.get('model');
			if(!model) return;

			var type = model.get('type');

			var $parent = $('#' + type + '-' + model.get('id'));
			var $ele = $parent.find('.entity-action .share a');
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

			var type = model.get('type');

			var $ele = $('#' + type + '-' + model.get('id'));
			$ele.find('.comment').removeClass('hide');
			$ele.find('.showMore').parent().remove();
		},

		deletecomment: function(comment) {
			var that = this;
			var model = that.controller.get('model');

			//hide the comment
			$('#' + comment.get('id')).addClass('hide');

			that.controller.deletecomment(comment, function() {
				//remove the comment object from list too
				model.get('comments').removeObject(comment);
			}, function(error) {
				var alert = '<div style="width: 300px" class="alert alert-block alert-danger font9 pull-left"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button> An error occurred while deleting the comment. </div>';
				//show the comment and error
				$('#' + comment.get('id'))
					.removeClass('hide')
					.find('.action-delete-comment-error').html(alert).alert();
			});
		}
	});
}).call(this);