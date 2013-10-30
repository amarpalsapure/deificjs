exports.init = function (req) {
    var config = process.config;

    var state = {
        environment: config.environment,
        debug: false,
        brand: config.brand,
        title: config.brand,
        hidelogin: '',
        hidelogout: 'hide',
        isauth: false,
        userid: '',
        fullname: '',
        authtype: '',
        context: 'window.init = {};',
        token: ''
    };
    if (req && req.signedCookies && req.signedCookies.u) {
        state.hidelogin = 'hide';
        state.hidelogout = '';
        state.isauth = true;
        state.userid = req.signedCookies.u.i;
        state.fullname = req.signedCookies.u.f + ' ' + req.signedCookies.u.l;
        state.authtype = req.signedCookies.u.a;
        state.isSA = process.config.sa.indexOf(req.signedCookies.u.e) === 0;
        state.context += "window.init.user = { " +
						"id: '" + req.signedCookies.u.i + "', " +
						"fname: '" + req.signedCookies.u.f + "', " +
						"lname: '" + req.signedCookies.u.l + "'" +
					 "};";


        state.token = req.signedCookies.u.t;
    }
    var isfbenabled = false, istwitterenbalbed = false;
    if (process.config.fbappid != '') isfbenabled = true;
    if (process.config.twitter_consumer_key != '') istwitterenbalbed = true;
    state.context += "window.init.config = { " +
					 	"maxpagecount: " + parseInt(config.maxpagecount) + "," +
					 	"env: '" + config.env + "'," +
					 	"brand: '" + config.brand + "'," +
					 	"fbappid: '" + config.fbappid + "'," +
                        "fbenable: " + isfbenabled + ", " +
                        "twitterenable: " + istwitterenbalbed + ", " +
					 	"allowsignup: " + config.allowsignup +
					 "};" +
					 "window.host = '" + config.host + "'";
    if (req.param('debug')) {
        if (req.param('debug') === 'on') req.session.debug = true;
        else if (req.param('debug') === 'off') req.session.debug = false;
    }
    //resource version (js and css)
    state.rv = config.rv;
    state.debug = req.session.debug;
    return state;
};