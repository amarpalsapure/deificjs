(function() {
	Deific.Comment = DS.Model.extend({
		text: DS.attr('string'),
		__utcdatecreated: DS.attr('date'),

		question: DS.belongsTo('Deific.Question'),
		answer: DS.belongsTo('Deific.Answer'),
		author: DS.belongsTo('Deific.User')
	});
}).call(this);