(function() {
	/*global Ember */
	window.Deific = Ember.Application.create({
		ApplicationController: Ember.Controller.extend({
    		
  		})
	});

  	var showdown = new Showdown.converter();

	Ember.Handlebars.registerBoundHelper('markdown', function(input) {
		if(!input) return '';
		return new Handlebars.SafeString(showdown.makeHtml(input));
	});

	Ember.Handlebars.registerBoundHelper('sincetime', function(date) {return moment(date).fromNow();});
	Ember.Handlebars.registerBoundHelper('sincetimeonly', function(date) { return moment(date).fromNow(true);});
	Ember.Handlebars.registerBoundHelper('calendar', function(date) { return moment(date).calendar();});
	Ember.Handlebars.registerBoundHelper('getfulldate', function(date) {return moment(date).format("DDMMMYYYY");});
	Ember.Handlebars.registerBoundHelper('getdate', function(date) {return moment(date).format("DD");});		
	Ember.Handlebars.registerBoundHelper('getday', function(date) {return moment(date).format("dddd");});	
	Ember.Handlebars.registerBoundHelper('getmonth', function(date) {return moment(date).format("MMMM");});
	Ember.Handlebars.registerBoundHelper('getyear', function(date) {return moment(date).format("YYYY");});
	Ember.Handlebars.registerBoundHelper('pluralize', function(number, opts) {
		var single = opts.hash['s'];
	  	Ember.assert('pluralize requires a singular string (s)', single);
	  	var plural = opts.hash['p'] || single + 's';
	  	return (number <= 1) ? single : plural;
	});
	Ember.Handlebars.registerBoundHelper('abbreviateNumber', function(value){
		var abbreviateNumber=  function(value) {
			if(!value) return 0;
		    var newValue = value;
		    if (value >= 1000) {
		        var suffixes = ["", "k", "m", "b","t"];
		        var suffixNum = Math.floor( (""+value).length/3 );
		        var shortValue = '';
		        for (var precision = 2; precision >= 1; precision--) {
		            shortValue = parseFloat( (suffixNum != 0 ? (value / Math.pow(1000,suffixNum) ) : value).toPrecision(precision));
		            var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g,'');
		            if (dotLessShortValue.length <= 2) { break; }
		        }
		        if (shortValue % 1 != 0)  shortNum = shortValue.toFixed(1);
		        newValue = shortValue+suffixes[suffixNum];
		    }
		    return newValue;
		}
		return abbreviateNumber(value);
	});
}).call(this);
