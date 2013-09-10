(function() {
	Deific.Question = DS.Model.extend({
		__utcdatecreated: DS.attr('date'),
		__createdby: DS.attr('string'),
		__tags: DS.attr('array'),
		title: DS.attr('string'),
		text: DS.attr('string'),
		answersMeta: DS.attr('array'),
		answercount: DS.attr('number', { defaultValue: 0 }),
		upvotecount: DS.attr('number', { defaultValue: 0 }),
		downvotecount: DS.attr('number', { defaultValue: 0 }),
		viewcount: DS.attr('number', { defaultValue: 0 }),
		isanswered: DS.attr('boolean'),
		voted: DS.attr('number'),

		answers: DS.hasMany('answer'),
		comments: DS.hasMany('comment'),
		author: DS.belongsTo('user'),
		tags: DS.hasMany('tag'),


		hasupvoted: function(){
			if(this.get('voted') == 1) return 'btn btn-warning btn-sm';
			else return 'btn btn-success btn-sm';
		}.property('voted'),

		hasdownvoted: function(){
			if(this.get('voted') == -1) return 'btn btn-warning btn-sm';
			else return 'btn btn-danger btn-sm';
		}.property('voted'),

		selfurl: function(){
			//TODO: Handling error in question get
			if(!this.get('title')) return '';
			var url = '/questions/';
			url += this.get('id') + '/' ;
			var subUrl = this.get('title').replace(/ /g, '-').replace(/\//g,'-').replace(/[^a-zA-Z/-]/g, '');
			while(subUrl.indexOf('--') != -1){
				subUrl= subUrl.replace(/--/,'-');
			}
			url += subUrl.toLowerCase();
			return url;
		}.property('title'),

		isfavtag: function() {
			//TODO: depending upon user favorites tags highlight the question
			return false;
		}.property('tags', 'author'),

		loginurl: function(){
			return  '/users/login?returnurl=' + window.location.pathname;
		}.property('title'),

		votecount: function(){
			return this.get('upvotecount') - this.get('downvotecount');
		}.property('upvotecount', 'downvotecount')		
	});
}).call(this);
