/*global Deific Ember */
'use strict';

Deific.Router.map(function () {
	this.resource('questions', { path: '/' });
});

Deific.QuestionsRoute = Deific.BaseRoute.extend({
	model: function(param){ 
		var split = window.location.pathname.split('/');
		var tagName = split.pop();
		if (tagName === '') tagName = split.pop();
		if(tagName === '') window.location = '/error.html';
		var sort = $.fn.parseParam('sort', 'votes');
		var page = $.fn.parseParam('page', '1');
		return this.get('store').find('question', {
			tag: decodeURI(tagName),
			sort: sort,
			page: page
		});
	},
	setupController : function(controller, model) {
		var that = this;
		that.controllerFor('questions').set('questions', model);

		//set the paging info (if any)
		that.setupPager(model);

		//try to set the tag information from the meta
		var store = that.get('store');
		var meta = store.typeMapFor(model.type).metadata;
		if(meta && meta.tag) {
			store.find('tag', meta.tag.__id).then(function(tag) {
				tag.set('description','loading');
				tag.reload();
				that.controllerFor('questions').set('tag', tag);

			});
		}

		//get the tags from the questions
		that.setupRelatedTag('questions', model);
	},
	renderTemplate: function() {
		this.render('questions');
		this.render('header', {	into: 'questions', outlet: 'headerBar', controller: 'header' });
		this.render('relatedtags', { into: 'questions', outlet: 'relatedTags' })
		this.render('paging', { into: 'questions', outlet: 'pagerBar', controller: 'paging'});
	}
});