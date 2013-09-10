(function() {
	Deific.Tag = DS.Model.extend({
		name: DS.attr('string'),
		description: DS.attr('string'),

		selfurl: function(){
			return '/questions/tagged/' + this.get('name');
		}.property('name'),

		question: DS.belongsTo('question')
	});
}).call(this);