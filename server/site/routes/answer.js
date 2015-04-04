exports.edit = function (req, res) {
    //initialize the app
    var app = require('../../shared/app.init');
    var state = app.init(req, res);

    //set the title of the page
    state.title = 'Editing answer';

    if (!state.token) return res.redirect('/users/login?returnurl=' + req.path);

    //initialize the context
    var context = require('../../shared/context');
    //set the context
    context.set(state.token, function (user) {
        res.render('answer-edit', state);
    }, function (err) {
        //delete the cookie, and redirect user to login page
        res.clearCookie('u');
        res.redirect('/users/login?returnurl=' + req.path + '&s=1');
    });
};