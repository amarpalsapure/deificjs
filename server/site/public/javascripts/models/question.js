(function() {
	Deific.Question = DS.Model.extend({
		__utcdatecreated: DS.attr('date'),
		__createdby: DS.attr('string'),
		__tags: DS.attr('array'),
		title: DS.attr('string'),
		description: DS.attr('string'),

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
		}.property('title', 'lastName'),

		comments: DS.hasMany('Deific.Comment'),
		author: DS.belongsTo('Deific.User'),
		answers: DS.hasMany('Deific.Answer')
	});
}).call(this);
