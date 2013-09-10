(function() {
	Deific.LocalUser = Ember.Object.extend({
		userid: DS.attr('string'),
		firstname: DS.attr('string'),
		lastname: DS.attr('string')
	});

	Deific.User = DS.Model.extend({
		firstname: DS.attr('string'),
		lastname: DS.attr('string'),
		reputation: DS.attr('number'),
		gravtarurl: DS.attr('string'),

		smallimgurl: function() {
			if(this.get('gravtarurl')) return this.get('gravtarurl') + '?s=36';//&d='+ encodeURI(window.host + '/images/user-default.png');
			else return '/images/user-default.png';
		}.property('gravtarurl'),
		largeimgurl: function() {
			if(this.get('gravtarurl')) return this.get('gravtarurl') + '?s=128';
			else return '/images/user-default.png';
		}.property('gravtarurl'),
		fullname: function(){
			if(!this.get('firstname') && !this.get('lastname')) return '...';
			else return this.get('firstname') + ' ' + this.get('lastname');
		}.property('firstname', 'lastname'),
		selfurl: function(){
			var url = '/users/';
			url += this.get('id') + '/' ;
			if(this.get('lastname') == '') url += this.get('firstname').toLowerCase();
			else url += (this.get('firstname') + '-' + this.get('lastname')).replace(/ /g,'-').toLowerCase();
			return url;
		}.property('firstname', 'lastName'),

		question: DS.belongsTo('question'),
		answer: DS.belongsTo('user'),
		comment: DS.belongsTo('comment')
	});
}).call(this);	