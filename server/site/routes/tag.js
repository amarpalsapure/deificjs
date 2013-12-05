exports.index = function(req, res){
	//initialize the app
  	var app = require('../../shared/app.init');
	var state = app.init(req);
	state.title = 'Tags';

	res.render('tags', state);
};

exports.add = function (req, res) {
    //initialize the app
    var app = require('../../shared/app.init');
    var state = app.init(req);

    if (!state.token) return res.redirect('/users/login?returnurl=' + req.path);

    //set the title of the page
    state.title = 'Add a Tag';

    //initialize the context
    var context = require('../../shared/context');
    //set the context
    context.set(state.token, function (user) {
        res.render('tag-new', state);
    }, function (err) {
        //delete the cookie, and redirect user to login page
        res.clearCookie('u');
        res.redirect('/users/login?returnurl=' + req.path + '&s=1');
    });
};

exports.info = function (req, res) {
    //initialize the app
    var app = require('../../shared/app.init');
    var state = app.init(req);
    state.title = "'" + req.param('tag') + "' tag wiki";

    res.render('tagwiki', state);
};

exports.edit = function (req, res) {
    //initialize the app
    var app = require('../../shared/app.init');
    var state = app.init(req);

    if (!state.token) return res.redirect('/users/login?returnurl=' + req.path);

    //set the title of the page
    state.title = "Editing " + req.param('tag') + " tag wiki";

    //initialize the context
    var context = require('../../shared/context');
    //set the context
    context.set(state.token, function (user) {
        res.render('tagwiki-edit', state);
    }, function (err) {
        //delete the cookie, and redirect user to login page
        res.clearCookie('u');
        res.redirect('/users/login?returnurl=' + req.path + '&s=1');
    });
};