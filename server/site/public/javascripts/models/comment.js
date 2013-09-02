(function() {
	Deific.Comment = DS.Model.extend({
		text: DS.attr('string'),
		__utcdatecreated: DS.attr('date'),
		__createdby: DS.attr('string'),

		question: DS.belongsTo('Deific.Question'),
		author: DS.belongsTo('Deific.Answer'),
		author: DS.belongsTo('Deific.User')
	});
}).call(this);