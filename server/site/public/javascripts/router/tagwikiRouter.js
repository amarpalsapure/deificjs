/*global Deific Ember */
'use strict';

Deific.Router.map(function () {
    this.resource('tagwiki', { path: '/' });
});

Deific.TagwikiRoute = Deific.BaseRoute.extend({
	model: function(param){ 
	    var name = window.location.pathname.split('/')[2];
	    return this.get('store').find('tagwiki', {
			name: name			
		});
	},
	setupController: function (c, m) {
	    var model = m.get('firstObject');
	    //change the model to single tag
	    c.set('model', model);
	},
	renderTemplate: function() {
	    this.render('tagwiki');
	    this.render('header', { into: 'tagwiki', outlet: 'headerBar', controller: 'header' });
	}
});