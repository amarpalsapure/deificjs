(function() {
	Deific.Answer = DS.Model.extend({
		__utcdatecreated: DS.attr('date'),
		__createdby: DS.attr('string'),
		murl: DS.attr('string'),
		
		title: DS.attr('string'), //question title, will be used when new answer is created
		text: DS.attr('string'),
		murl: DS.attr('string'),
		iscorrectanswer: DS.attr('boolean'),
		voteconnid: DS.attr('string'),
		upvotecount: DS.attr('number', { defaultValue: 0 }),
		downvotecount: DS.attr('number', { defaultValue: 0 }),
		voted: DS.attr('number'),
		action: DS.attr('string'),
		isowner: DS.attr('boolean'),
		ownsparent: DS.attr('boolean'),

		//relation ship properties
		question: DS.belongsTo('question'),
		author: DS.belongsTo('user'),
		comments: DS.hasMany('comment'),

		istypeanswer: true,
		type: 'answer',
				
		//observing functions
		entityid: function() {
			return 'answer-' + this.get('id');
		}.property('id'),

		loaderid: function() {
			return 'answer-loader-' + this.get('id');
		}.property('id'),
		
		hasupvoted: function(){
			if(this.get('voted') == 1) return 'btn btn-warning btn-sm';
			else return 'btn btn-success btn-sm';
		}.property('voted'),

		hasdownvoted: function(){
			if(this.get('voted') == -1) return 'btn btn-warning btn-sm';
			else return 'btn btn-danger btn-sm';
		}.property('voted'),

		
		getfulldate: function(){
			return moment(this.get('__utcdatecreated')).format("DDMMMYYYY");
		}.property('__utcdatecreated'),

		votecount: function(){
			if(this.get('upvotecount') && this.get('downvotecount')) return this.get('upvotecount') - this.get('downvotecount');
			else return 0;
		}.property('upvotecount', 'downvotecount'),

		isOwnerLoggedIn: function() {
			//As are binding to question, when ever answer is fetched,
			//in the router question will be assigned to question for the answer
			//which will reflect on view automatically
			var question = this.get('question');
			if(!question) return false;
			return Deific.AccountController.user != null 
					  && Deific.AccountController.user.userid == question.get('author').get('id');
		}.property('question'),

		loginselfurl: function(){
			return  '/users/login?returnurl=' + window.location.pathname + '#' + this.get('id');
		}.property('text'),

		votecount: function(){
			return this.get('upvotecount') - this.get('downvotecount');
		}.property('upvotecount', 'downvotecount'),

		postedaction: function() {
			return 'Answered';
		}.property('type'),

		rootElement: function() {
			return $('#answer' + '-' + this.get('id'));
		}.property('id')
	});
}).call(this);