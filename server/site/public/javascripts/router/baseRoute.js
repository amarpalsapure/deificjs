Deific.BaseRoute = Ember.Route.extend({
	actions: {
		error: function(error, transition) {
			Deific.localDataSource.handleRouteError(error);
			this.transitionTo('error');
		}
	},

	setupPager: function(model, totalRecordPlaceholder) {
		var store = this.controllerFor('paging').get('store');
		var meta = store.typeMapFor(model.type).metadata;
		
		if(meta && meta.paginginfo) {
			var maxpagecount = Math.ceil(meta.paginginfo.totalrecords / meta.paginginfo.pagesize);
			if(maxpagecount > 1) {
				//paging control will have only 5 pages max, (try to read from server)
				var maxallowedpagecount = 5;
				if(isNaN(window.init.config.maxpagecount) === false) maxallowedpagecount = window.init.config.maxpagecount;
				
				var pagecount = maxpagecount;
				if(maxpagecount > maxallowedpagecount) pagecount = maxallowedpagecount;

				var that = this;
				var idPromise = [];
				var counter = maxallowedpagecount * parseInt(meta.paginginfo.pagenumber / maxallowedpagecount) + 1;
				if(meta.paginginfo.pagenumber % maxallowedpagecount === 0) {
					counter = meta.paginginfo.pagenumber - maxallowedpagecount + 1
				}
				for (var i = 0; i < pagecount; i++) {
					var id = parseInt(Math.random() * 1000000000);
					store.push('paging',{
						id: id,
						pagenumber: counter + i,
						isactivepage: counter + i === meta.paginginfo.pagenumber
					});
					idPromise.push(store.find('paging', id));
				}
				Ember.RSVP.all(idPromise).then(function(pages) {
					that.controllerFor('paging').set('pages', pages);
					that.controllerFor('paging').set('totalpages', maxpagecount);
				});
			}
			this.controllerFor('paging').set('totalrecords', meta.paginginfo.totalrecords);
			if(totalRecordPlaceholder)
				this.controllerFor('paging').set('totalRecordPlaceholder', totalRecordPlaceholder);
		}
	},

	setupRelatedTag: function(controllerFor, model) {
		var storeTags = [];
		var questions = model.toArray();
		if(!questions) return;
		questions.forEach(function(question) {
			var tags = question.get('tags');
			if(!tags) return;
			tags.forEach(function(tag) {
				var match = $.grep(storeTags, function(item) {
					return item.get('id') === tag.get('id');
				});
				if(match.length === 0) storeTags.push(tag);
			});
		});

		//sort tags by `questioncount`
		storeTags.sort(function(t1, t2) {
			var diff = t2.get('questioncount') - t1.get('questioncount');
			if(diff < -1) return -1;
			if(diff > 0) return 1;
			return 0;
		});
		this.controllerFor(controllerFor).set('tags', storeTags);
	}
});