/*global Deific Ember */
'use strict';

Deific.Router.map(function () {
	this.resource('questions', { path: '/' });
});
Deific.Router.reopen({
	location: 'none'
});

Deific.QuestionsRoute = Ember.Route.extend({
	model: function(){ 
		var sort = $.fn.parseParam('sort', 'popular');
		return this.get('store').find('question', {
			sort: sort
		});
	},
	setupController : function(controller, model) {
		this.controllerFor('questions').set('questions', model);

		//get the tags from the questions
		var tags = [];
		var questions = model.toArray();
		questions.forEach(function(question) {
			question.get('tags').forEach(function(tag) {
				var match = $.grep(tags, function(item) {
					return item.get('id') === tag.get('id');
				});
				if(match.length === 0) tags.push(tag);
			});
		});

		//sort tags by `questioncount`
		tags.sort(function(t1, t2) {
			var diff = t2.get('questioncount') - t1.get('questioncount');
			if(diff < -1) return -1;
			if(diff > 0) return 1;
			return 0;
		});
		this.controllerFor('questions').set('tags', tags);
	},
	renderTemplate: function() {
		this.render('questions');
		this.render('header', {	into: 'questions', outlet: 'headerBar', controller: 'header' });
		this.render('tags', { into: 'questions', outlet: 'relatedTags' })
	}
});