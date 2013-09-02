(function() {
	/*global Ember */
	window.Deific = Ember.Application.create();

  	var showdown = new Showdown.converter();

	Ember.Handlebars.registerBoundHelper('markdown', function(input) {
		if(!input) return '';
		return new Handlebars.SafeString(showdown.makeHtml(input));
	});

	Ember.Handlebars.registerBoundHelper('sincetime', function(date) {return moment(date).fromNow();});
	Ember.Handlebars.registerBoundHelper('getfulldate', function(date) {return moment(date).format("DDMMMYYYY");});
	Ember.Handlebars.registerBoundHelper('getdate', function(date) {return moment(date).format("DD");});		
	Ember.Handlebars.registerBoundHelper('getday', function(date) {return moment(date).format("dddd");});	
	Ember.Handlebars.registerBoundHelper('getmonth', function(date) {return moment(date).format("MMMM");});
	Ember.Handlebars.registerBoundHelper('getyear', function(date) {return moment(date).format("YYYY");});
	
}).call(this);
