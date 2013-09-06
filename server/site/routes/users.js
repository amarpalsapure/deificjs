exports.index = function(req, res){
	//initialize the app
  	var app = require('../../shared/app.init');
	var state = app.init(req);

	res.render('users', state);
};

exports.login = function(req, res){
	//initialize the app
  	var app = require('../../shared/app.init');
	var state = app.init(req);
	res.render('login', state);
};

