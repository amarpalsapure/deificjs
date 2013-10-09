(function() {
	Deific.User = DS.Model.extend({
		__utcdatecreated: DS.attr('date'),

		firstname: DS.attr('string'),
		lastname: DS.attr('string'),
		reputation: DS.attr('number'),
		gravtarurl: DS.attr('string'),
		url: DS.attr('string'),

		//relationship property
		question: DS.belongsTo('question'),
		answer: DS.belongsTo('user'),
		comment: DS.belongsTo('comment'),

		//observing functions
		smallimgurl: function() {			
				if(this.get('gravtarurl'))
					if(window.host.indexOf('localhost:3000') === -1) return this.get('gravtarurl') + '?s=40&d='+ encodeURI(window.host + '/images/user-default.png');
					else return this.get('gravtarurl') + '?s=40&d='+ encodeURI('https://raw.github.com/amarpalsapure/deificjs/master/server/site/public/images/user-default.png');
				else return '/images/user-default.png';
		}.property('gravtarurl'),

		largeimgurl: function() {
			if(this.get('gravtarurl')) return this.get('gravtarurl') + '?s=128';
			else return '/images/user-default.png';
		}.property('gravtarurl'),

		fullname: function(){
			if(!this.get('firstname') && !this.get('lastname')) return '...';
			else return this.get('firstname') + ' ' + this.get('lastname');
		}.property('firstname', 'lastname')
	});

	Deific.LocalUser = Ember.Object.extend({
		userid: DS.attr('string'),
		firstname: DS.attr('string'),
		lastname: DS.attr('string')
	});
}).call(this);	