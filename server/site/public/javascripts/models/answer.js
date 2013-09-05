(function() {
	Deific.Answer = DS.Model.extend({
		text: DS.attr('string'),
		__utcdatecreated: DS.attr('date'),
		__createdby: DS.attr('string'),

		//question: DS.belongsTo('Deific.Question'),
		author: DS.belongsTo('Deific.User'),
		comments: DS.hasMany('Deific.Comment'),

		getfulldate: function(){
			return moment(this.get('__utcdatecreated')).format("DDMMMYYYY");
		}.property('__utcdatecreated'),

		loginurl: function(){
			return  '/users/login?returnurl=' + window.location.pathname;
		}.property('text')
	});
}).call(this);