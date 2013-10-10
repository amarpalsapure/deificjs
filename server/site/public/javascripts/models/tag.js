(function() {
	Deific.Tag = DS.Model.extend({
		__utcdatecreated: DS.attr('date'),
		
		name: DS.attr('string'),
		excerpt: DS.attr('string'),
		description: DS.attr('string'),
		questioncount: DS.attr('number', { defaultValue: 0 }),

		selfurl: function(){
			return '/questions/tagged/' + encodeURIComponent(this.get('name'));
		}.property('name'),

		minexcerpt: function() {
			var text = this.get('excerpt');
			var maxLength = 120;
			if(!text) return 'NA';
			if(text.length > maxLength) {
				text = text.substring(0, maxLength);
				text = text.substring(0, Math.min(text.length, text.lastIndexOf(' '))) + '...';
			}
			return text;
		}.property('excerpt'),

		question: DS.belongsTo('question')
	});
}).call(this);