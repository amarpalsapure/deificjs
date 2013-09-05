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

		selfurl: function(){
			//TODO: Handling error in question get

			if(!this.get('title')) return '';
			var url = '/questions/';
			url += this.get('id') + '/' ;
			var subUrl = this.get('title').replace(/ /g, '-').replace(/[^a-zA-Z/-]/g, '');
			while(subUrl.indexOf('--') != -1){
				subUrl= subUrl.replace(/--/,'-');
			}
			url += subUrl.toLowerCase();
			return url;
		}.property('title'),

		loginurl: function(){
			return  '/users/login?returnurl=' + window.location.pathname;
		}.property('title'),

		votecount: function(){
			if(this.get('upvotecount') && this.get('downvotecount')) return this.get('upvotecount') - this.get('downvotecount');
			else return 0;
		}.property('upvotecount', 'downvotecount'),

		comments: DS.hasMany('Deific.Comment'),
		author: DS.belongsTo('Deific.User'),
		tags: DS.hasMany('Deific.Tag')
	});
}).call(this);
