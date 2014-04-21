(function() {
	Deific.Question = DS.Model.extend({
		__utcdatecreated: DS.attr('date'),
		__createdby: DS.attr('string'),
		__tags: DS.attr('string'),

		title: DS.attr('string'),
		text: DS.attr('string'),
		url: DS.attr('string'),
		murl: DS.attr('string'),
		answersMeta: DS.attr('array'),
		answercount: DS.attr('number', { defaultValue: 0 }),
		voteconnid: DS.attr('string'),
		phi: DS.attr('string'),
		upvotecount: DS.attr('number', { defaultValue: 0 }),
		downvotecount: DS.attr('number', { defaultValue: 0 }),
		totalvotecount: DS.attr('number', { defaultValue: 0 }),
		viewcount: DS.attr('number', { defaultValue: 0 }),
		bookmarkcount: DS.attr('number', { defaultValue: 0 }),
		isanswered: DS.attr('boolean'),
		voted: DS.attr('number'),
		action: DS.attr('string'),
		isowner: DS.attr('boolean'),
		isbookmarked: DS.attr('boolean'),
		bookmarkconnid: DS.attr('string'),
		issubscribed: DS.attr('boolean'),
		subscribeconnid: DS.attr('string'),

		//relationship property
		answers: DS.hasMany('answer'),
		comments: DS.hasMany('comment'),
		author: DS.belongsTo('user'),
		tags: DS.hasMany('tag'),

		type: 'question',

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

		hasupvotedTitle: function(){
		    if (this.get('voted') == 1) return 'Click to up vote.\n(click again to undo)';
		    else return 'Click to up vote.';
		}.property('voted'),

		hasdownvoted: function(){
			if(this.get('voted') == -1) return 'btn btn-warning btn-sm';
			else return 'btn btn-danger btn-sm';
		}.property('voted'),

		hasdownvotedTitle: function () {
		    if (this.get('voted') == -1) return 'Click to down vote.\n(click again to undo)';
		    else return 'Click to down vote.';
		}.property('voted'),

		isfavtag: function() {
			//TODO: depending upon user favorites tags highlight the question
			return false;
		}.property('tags', 'author'),

		votecount: function(){
			return this.get('upvotecount') - this.get('downvotecount');
		}.property('upvotecount', 'downvotecount'),

		postedaction: function() {
			return 'asked';
		}.property('type'),

		rootElement: function() {
			return $('#question' + '-' + this.get('id'));
		}.property('id'),

		editUrl: function () {
		    return '/questions/' + this.get('id') + '/edit';
		}.property('id'),

		isbookmarkedTitle: function () {
		    return !this.get('isbookmarked') ? 'Click to bookmark this question.' : 'Click to bookmark this question. \n(click again to undo)'
		}.property('isbookmarked')
	});
}).call(this);
