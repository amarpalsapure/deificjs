(function() {
	Deific.Comment = DS.Model.extend({
		text: DS.attr('string'),
		__utcdatecreated: DS.attr('date'),

		question: DS.belongsTo('question'),
		answer: DS.belongsTo('answer'),
		author: DS.belongsTo('user')
	});
}).call(this);