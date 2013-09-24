(function() {
	Deific.PagingView =  Ember.View.extend({
		disableprepage: true,
		disablenextpage: false,
		jumpfirstpage: null,
		jumplastpage: null,

		didInsertElement: function() {
			//get the model
			var pages = this.controller.get('pages');
			var maxpagecount = this.controller.get('totalpages');
			var totalRecords = this.controller.get('totalrecords');

			//paging control will have only 5 pages max, (try to read from server)
			var maxallowedpagecount = 5;
			if(isNaN(window.init.config.maxpagecount) === false) maxallowedpagecount = window.init.config.maxpagecount;

			//if max page count is less than 5, then disable both pre and next page anchor
			if(maxpagecount <= maxallowedpagecount) {
				this.set('disableprepage', true);
				this.set('disablenextpage', true);
			} else {
				this.set('disableprepage', pages[0].get('pagenumber') === 1);
				this.set('disablenextpage', pages[maxallowedpagecount - 1].get('pagenumber') === maxpagecount);

				var prePage = pages[0].get('pagenumber') - 1;
				var nextPage = pages[maxallowedpagecount - 1].get('pagenumber') + 1;

				var getLocation = function(pagenumber) {
					var location = window.host + '/search' + $.fn.removeParam('page') +
								   '&page=' + pagenumber;
					if(window.location.hash != '') location += window.location.hash
					return location;
				}

				this.set('jumpfirstpage', getLocation(prePage));
				this.set('jumplastpage', getLocation(nextPage));
			}

			//set result count
			var placeHolder = this.controller.get('totalRecordPlaceholder');
			if(placeHolder)
				$(placeHolder).html(totalRecords.toFixed(1).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").replace('.0',''));

			//show the control
			if(totalRecords > 0) this.controller.set('isvisible', true);
		}
	});
}).call(this);