Deific.BaseRoute = Ember.Route.extend({
	setupPager: function(model, totalRecordPlaceholder) {
		var store = this.controllerFor('paging').get('store');
		var meta = store.typeMapFor(model.type).metadata;
		
		if(meta && meta.paginginfo) {
			var maxpagecount = Math.ceil(meta.paginginfo.totalrecords / meta.paginginfo.pagesize);
			if(maxpagecount > 0) {
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
					that.controllerFor('paging').set('totalrecords', meta.paginginfo.totalrecords);
					if(totalRecordPlaceholder)
						that.controllerFor('paging').set('totalRecordPlaceholder', totalRecordPlaceholder);
				});
			}
		}
	}
});