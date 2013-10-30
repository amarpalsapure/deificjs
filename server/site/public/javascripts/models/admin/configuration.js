(function() {
	Deific.Configuration = DS.Model.extend({
		name: DS.attr('string'),
		value: DS.attr('string'),
		description: DS.attr('string')
	});
}).call(this);