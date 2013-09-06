(function() {
	Deific.Answer = DS.Model.extend({
		text: DS.attr('string'),
		__utcdatecreated: DS.attr('date'),
		__createdby: DS.attr('string'),
		iscorrectanswer: DS.attr('boolean'),
		upvotecount: DS.attr('number', { defaultValue: 0 }),
		downvotecount: DS.attr('number', { defaultValue: 0 }),

		//question: DS.belongsTo('Deific.Question'),
		author: DS.belongsTo('Deific.User'),
		comments: DS.hasMany('Deific.Comment'),

		getfulldate: function(){
			return moment(this.get('__utcdatecreated')).format("DDMMMYYYY");
		}.property('__utcdatecreated'),

		votecount: function(){
			if(this.get('upvotecount') && this.get('downvotecount')) return this.get('upvotecount') - this.get('downvotecount');
			else return 0;
		}.property('upvotecount', 'downvotecount'),

		loginurl: function(){
			return  '/users/login?returnurl=' + window.location.pathname;
		}.property('text')
	});
}).call(this);