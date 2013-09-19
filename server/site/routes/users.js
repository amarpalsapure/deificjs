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

	//set the title of the page
	state.title = 'Log In - ' + state.brand;

	if(!state.token || state.token == '') {
		res.render('login', state);
	} else {
		//initialize the context
		var context = require('../../shared/context');
		//set the context
		context.set(state.token, function(user) {
		    res.redirect(process.config.host);
		}, function(err) {
			//delete the cookie, and redirect user to login page
			res.clearCookie('u');
	    	res.render('login', state);
		});
	}
};