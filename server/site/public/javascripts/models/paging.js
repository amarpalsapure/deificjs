(function() {
	Deific.Paging = DS.Model.extend({
		pagenumber: DS.attr('number'),
		isactivepage: DS.attr('boolean'),

		jumptopage: function() {
			if(window.location.href.indexOf('?') === -1) return window.location + '/?page=' + this.get('pagenumber');
			var location = window.host + window.location.pathname + $.fn.removeParam('page') +
						   '&page=' + this.get('pagenumber');
			if(window.location.hash != '') location += window.location.hash
			return location;
		}.property('pagenumber')
	});
}).call(this);