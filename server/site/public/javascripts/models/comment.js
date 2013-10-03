(function() {
	Deific.Comment = DS.Model.extend({
		__utcdatecreated: DS.attr('date'),
		text: DS.attr('string'),		
		ishidden: DS.attr('boolean'),
		isowner: DS.attr('boolean'),

		question: DS.belongsTo('question'),
		answer: DS.belongsTo('answer'),
		author: DS.belongsTo('user'),

		rootElement: function() {
			return $('#' + this.get('id'));
		}.property('id')
	});
}).call(this);