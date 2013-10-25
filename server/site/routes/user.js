exports.index = function(req, res){
	//initialize the app
  	var app = require('../../shared/app.init');
	var state = app.init(req);

	state.title = 'Users';

	res.render('users', state);
};
exports.findById = function(req, res) {
	//initialize the app
  	var app = require('../../shared/app.init');
	var state = app.init(req);

	if (req.param('title')) {
	    var capitalize = function (s) {
	        return s[0].toUpperCase() + s.slice(1);
	    };

	    state.title = '';
	    var split = req.param('title').split('-');
	    for (var i = 0; i < split.length; i++)
	        state.title += capitalize(split[i]) + ' ';
	} else state.title = 'User';

	res.render('user', state);
};
exports.login = function(req, res){
	//initialize the app
  	var app = require('../../shared/app.init');
	var state = app.init(req);

	//set the title of the page
	state.title = 'Log In';

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
};
exports.edit = function (req, res) {
    //initialize the app
    var app = require('../../shared/app.init');
    var state = app.init(req);

    state.title = 'User';

    res.render('edit-user', state);
};