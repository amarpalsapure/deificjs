exports.index = function (req, res) {
    //initialize the app
    var app = require('../../shared/app.init');
    var state = app.init(req, res);

    switch (req.param('tab')) {
        case 'votes':
            state.title = "Highest Voted Questions";
            break;
        case 'active':
            state.title = "Most Active Questions";
            break;
        case 'unresolved':
            state.title = "Unresolved Questions";
            break;
        default:
            state.title = "Latest Questions";
            break;
    }

    res.render('index', state);
};

exports.about = function (req, res) {
    var app = require('../../shared/app.init');
    var state = app.init(req, res);
    state.title = "About";

    res.render('about', state);
};