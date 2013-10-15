exports.init = function (req) {
	var config = require('../shared/configuration').load();

	var state =  {
		debug: false,
		brand: process.config.brand,
		title: process.config.brand,
		hidelogin: '',
		hidelogout: 'hide',
		isauth: false,
		userid: '',
		fullname: '',
		context: 'window.init = {};',
		token: ''
	};
	if(req && req.signedCookies && req.signedCookies.u){
		state.hidelogin = 'hide';
		state.hidelogout = '';
		state.isauth = true;
		state.userid = req.signedCookies.u.i;
		state.fullname = req.signedCookies.u.f + ' ' + req.signedCookies.u.l;
		state.context += "window.init.user = { "+
						"id: '"+ req.signedCookies.u.i + "', " +
						"fname: '" + req.signedCookies.u.f + "', " +
						"lname: '"+ req.signedCookies.u.l + "'" +
					 "};";
					 

		state.token = req.signedCookies.u.t;
	}
	state.context += "window.init.config = { " +
					 	"maxpagecount: " + parseInt(process.config.maxpagecount) + "," +
					 	"env: '" + process.config.env + "'," +
					 	"brand: '" + process.config.brand + "'," +
					 	"fbappid: '" + process.config.fbappid +"'," +
					 	"allowsignup: " + process.config.allowsignup +
					 "};" +
					 "window.host = '" + config.host + "'";
	if(req.param('debug')) {
		if(req.param('debug') === 'on') req.session.debug = true;
		else if(req.param('debug') === 'off') req.session.debug = false;
	}
	state.debug = req.session.debug;
	return state;
};