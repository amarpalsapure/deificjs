exports.index = function(req, res){
    //initialize the app
    var app = require('../../shared/app.init');
    var state = app.init(req);

    //set the title of the page
    state.title = 'Feedback';

    if (!state.token) return res.redirect('/users/login?returnurl=/feedback');

    //initialize the context
    var context = require('../../shared/context');
    //set the context
    context.set(state.token, function (user) {
        res.render('feedback', state);
    }, function (err) {
        //delete the cookie, and redirect user to login page
        res.clearCookie('u');
        res.redirect('/users/login?returnurl=/feedback&s=1');
    });
};