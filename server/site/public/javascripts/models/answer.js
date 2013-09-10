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

		question: DS.belongsTo('question'),
		author: DS.belongsTo('user'),
		comments: DS.hasMany('comment'),

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
			//As are binding to question, when ever answer is fetched,
			//in the router question will be assigned to question for the answer
			//which will reflect on view automatically
			var question = this.get('question');
			if(!question) return false;
			return Deific.AccountController.user != null 
					  && Deific.AccountController.user.userid == question.get('author').get('id');
		}.property('question')
	});
}).call(this);