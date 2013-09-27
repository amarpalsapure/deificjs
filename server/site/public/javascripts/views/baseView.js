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
		}
	});
}).call(this);