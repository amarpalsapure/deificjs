(function() {
    Deific.Tagwiki = DS.Model.extend({
        __utcdatecreated: DS.attr('date'),
        
		name: DS.attr('string'),
		excerpt: DS.attr('string'),
		description: DS.attr('string'),
		viewcount: DS.attr('number', { defaultValue: 0 }),
		questioncount: DS.attr('number', { defaultValue: 0 }),
		editcount: DS.attr('number', { defaultValue: 0 }),
		active: DS.attr('date'),
		edited: DS.attr('date'),

		author: DS.belongsTo('user'),
		editor: DS.belongsTo('user'),

        questions: DS.hasMany('question'),

		selfurl: function(){
			return '/questions/tagged/' + encodeURIComponent(this.get('name'));
		}.property('name'),

		infoUrl: function () {
		    return '/tags/' + this.get('name') + '/info';
		}.property(name),

		editUrl: function() {
		    return '/tags/' + this.get('name') + '/edit';
		}.property(name)
	});
}).call(this);