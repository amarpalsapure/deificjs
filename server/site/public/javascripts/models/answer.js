(function() {
	Deific.Answer = DS.Model.extend({
		text: DS.attr('string'),
		__utcdatecreated: DS.attr('date'),
		__createdby: DS.attr('string'),
		iscorrectanswer: DS.attr('boolean'),
		upvotecount: DS.attr('number', { defaultValue: 0 }),
		downvotecount: DS.attr('number', { defaultValue: 0 }),
		voted: DS.attr('number'),

		hasupvoted: function(){
			if(this.get('voted') == 1) return 'btn btn-warning btn-sm';
			else return 'btn btn-success btn-sm';
		}.property('voted'),

		hasdownvoted: function(){
			if(this.get('voted') == -1) return 'btn btn-warning btn-sm';
			else return 'btn btn-danger btn-sm';
		}.property('voted'),

		question: DS.belongsTo('Deific.Question'),
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
		}.property('text'),

		isOwnerLoggedIn: function() {
			//As there is only one question, all will return the main question			
			var question = Deific.Question.all().toArray()[0];
			return Deific.AccountController.user != null 
					  && Deific.AccountController.user.get('userid') == question.get('author').get('id');
		}.property('question')
	});
}).call(this);