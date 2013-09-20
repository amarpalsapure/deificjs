exports.search = function(req, res){
	//initialize the app
  	var app = require('../../shared/app.init');
	var state = app.init(req);
	
	res.render('search', state);
};