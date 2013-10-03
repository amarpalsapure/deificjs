(function() {
	Deific.PagingController = Ember.ObjectController.extend({
		isvisible: false,
		pages: null,
		totalpages: 0,
		totalrecords: 0,
		totalRecordPlaceholder: '', //if this id is present, total record count will be displayed here
	});
}).call(this);