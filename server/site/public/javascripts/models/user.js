(function() {
	Deific.LocalUser = Ember.Object.extend({
		id: DS.attr('string'),
		firstname: DS.attr('string'),
		lastname: DS.attr('string')
	});

	Deific.User = DS.Model.extend({
		firstname: DS.attr('string'),
		lastname: DS.attr('string'),

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

		question: DS.belongsTo('Deific.Question'),
		answer: DS.belongsTo('Deific.User'),
		comment: DS.belongsTo('Deific.Comment')
	});
}).call(this);	