exports.init = function (req) {
	var config = require('../shared/configuration').load();

	var state =  {
		brand: process.config.brand,
		title: process.config.brand,
		hidelogin: '',
		hidelogout: 'hide',
		isauth: false,
		userid: '',
		fullname: '',
		user: '',
		token: ''
	};
	if(req && req.signedCookies && req.signedCookies.u){
		state.hidelogin = 'hide';
		state.hidelogout = '';
		state.isauth = true;
		state.userid = req.signedCookies.u.i;
		state.fullname = req.signedCookies.u.f + ' ' + req.signedCookies.u.l;
		state.user = "window.init = {};" +
					 "window.init.user = { "+
					 "id: '"+ req.signedCookies.u.i +"', "+
					 "fname: '" + req.signedCookies.u.f + "', "+
					 "lname: '"+ req.signedCookies.u.l +"'};" +
					 "window.host = '" + config.host + "'";
		state.token = req.signedCookies.u.t;
	}
	return state;
};