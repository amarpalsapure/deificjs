(function() {
	Deific.Tag = DS.Model.extend({
		name: DS.attr('string'),
		excerpt: DS.attr('string'),
		description: DS.attr('string'),
		questioncount: DS.attr('number', { defaultValue: 0 }),

		selfurl: function(){
			return '/questions/tagged/' + this.get('name');
		}.property('name'),

		question: DS.belongsTo('question')
	});
}).call(this);