(function() {
	Deific.Answer = DS.Model.extend({
		question: DS.belongsTo('Deific.Question'),
		text: DS.attr('string'),
		__utcdatecreated: DS.attr('date'),
		__createdby: DS.attr('string'),
		author: DS.belongsTo('Deific.User'),
		comments: DS.hasMany('Deific.Comment'),

		getfulldate: function(){
			return moment(this.get('__utcdatecreated')).format("DDMMMYYYY");
		}.property('__utcdatecreated')
	});
}).call(this);