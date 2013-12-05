exports.search = function(req, res){
	//initialize the app
  	var app = require('../../shared/app.init');
	var state = app.init(req);
	
	switch(req.param('sort')) {
		case 'latest':
			state.title = "Newest Posts containing '" + req.param('q') + "'";
			break;
		case 'active':
			state.title = "Recent Posts containing '" + req.param('q') + "'";
			break;
		default:
			state.title = "Highest Voted Posts containing '" + req.param('q') + "'";
			break;
	}

	res.render('search', state);
};