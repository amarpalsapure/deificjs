(function() {
	Deific.Entity = DS.Model.extend({
		__utcdatecreated: DS.attr('date'),
		
		type: DS.attr('string'),
		title: DS.attr('string'),
		text: DS.attr('string'),
		
		url: DS.attr('string'),
		totalvotecount: DS.attr('number', { defaultValue: 0 }),
		isanswered: DS.attr('boolean'),

		answercount: DS.attr('number', { defaultValue: 0 }),
		viewcount: DS.attr('number', { defaultValue: 0 }),
		bookmarkcount: DS.attr('number', { defaultValue: 0 }),

		author: DS.belongsTo('user'),

		votecount: function(){
			return this.get('totalvotecount');
		}.property('totalvotecount'),

		isquestion: function() {
			return this.get('type') === 'question';
		}.property('type'),

		isanswer: function() {
			return this.get('type') === 'answer';
		}.property('type'),

		postedaction: function() {
			return this.get('type') === 'question' ? 'asked' : 'answered';
		}.property('type')
	});
}).call(this);