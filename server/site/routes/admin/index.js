exports.index = function(req, res){
	//initialize the app
  	var app = require('../../../shared/app.init');
	var state = app.init(req, res);

	state.title = 'Application Setup';
	
	res.render('admin/index', state);
};