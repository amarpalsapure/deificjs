(function() {
	Deific.Question = DS.Model.extend({
		__utcdatecreated: DS.attr('date'),
		__createdby: DS.attr('string'),

		title: DS.attr('string'),
		text: DS.attr('string'),
		url: DS.attr('string'),
		murl: DS.attr('string'),
		answersMeta: DS.attr('array'),
		answercount: DS.attr('number', { defaultValue: 0 }),
		voteconnid: DS.attr('string'),
		upvotecount: DS.attr('number', { defaultValue: 0 }),
		downvotecount: DS.attr('number', { defaultValue: 0 }),
		viewcount: DS.attr('number', { defaultValue: 0 }),
		isanswered: DS.attr('boolean'),
		voted: DS.attr('number'),
		action: DS.attr('string'),

		//relationship property
		answers: DS.hasMany('answer'),
		comments: DS.hasMany('comment'),
		author: DS.belongsTo('user'),
		tags: DS.hasMany('tag'),

		//observing functions
		commentsArray: function() {
			return this.get('comments').map(function(i, idx) {
				return {comment: i, index: idx, ishidden: idx > 5};
			});
		}.property('comments@each'),

		entityid: function() {
			return 'question-' + this.get('id');
		}.property('id'),

		hasupvoted: function(){
			if(this.get('voted') == 1) return 'btn btn-warning btn-sm';
			else return 'btn btn-success btn-sm';
		}.property('voted'),

		hasdownvoted: function(){
			if(this.get('voted') == -1) return 'btn btn-warning btn-sm';
			else return 'btn btn-danger btn-sm';
		}.property('voted'),

		isfavtag: function() {
			//TODO: depending upon user favorites tags highlight the question
			return false;
		}.property('tags', 'author'),

		votecount: function(){
			return this.get('upvotecount') - this.get('downvotecount');
		}.property('upvotecount', 'downvotecount')
	});
}).call(this);
