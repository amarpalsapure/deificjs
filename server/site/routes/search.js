exports.search = function(req, res){
	//initialize the app
  	var app = require('../../shared/app.init');
	var state = app.init(req);
	
	state.title = "Posts containing '" + req.param('q') + "'";

	res.render('search', state);
};