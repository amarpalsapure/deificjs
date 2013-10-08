exports.findById = function(req, res) {
	var response = {
		user: {}
	};

	//get the state of app
	var app = require('../shared/app.init');
	var state = app.init(req);

	//initialize the sdk
  	var sdk = require('./appacitive.init');
	var Appacitive = sdk.init(state.debug);
	
	//get the transformer
	var transformer = require('./infra/transformer');

	var user = new Appacitive.User({__id: req.param('id')})
	user.fetch(function () {
		//tranform		
		response.user = transformer.toUser(user);
		return res.json(response);
	}, function (status) {
		return res.status(404).json(transformer.toError('user_find'));
	});	
};

exports.auth = function(req, res){
	var email = req.body.email;
	var pwd = req.body.password;

	//get the transformer
	var transformer = require('./infra/transformer');

	//validate the inputs
	if(!email || email === '' || !pwd || pwd === '')
		return res.status(400).json(transformer.toError('user_login_validate'));
	
	//initialize the SDK
  	var sdk = require('./appacitive.init');
	var Appacitive = sdk.init();

	Appacitive.Users.login(email, pwd, function (authResult) {
		// User has been logged in successfully
		// Set the cookie
		res.cookie('u', {
			i: authResult.user.id(),
			f: authResult.user.get('firstname'),
			l: authResult.user.get('lastname'),
			e: authResult.user.get('email'),
			t: authResult.token
		},{
			signed: true,
			maxAge: 30*24*60*60*1000, //30 days
			httpOnly: true
		})

    	return res.json({
			user: {
				id: authResult.user.id(),
				fname: authResult.user.get('firstname'),
				lname: authResult.user.get('lastname')
			}
		});
	}, function(status) {
		return res.status(401).json(transformer.toError('user_login', status));
	});	
};

exports.logout = function(req, res){
	//get the state of app
	var app = require('../shared/app.init');
	var state = app.init(req);

	//initialize the SDK
  	var sdk = require('./appacitive.init');
	var Appacitive = sdk.init(state.token);

	//Logout user from appacitve
	Appacitive.Users.logout();

	//remove the auth cookie
	res.clearCookie('u');
	res.json({
		success: true
	});
};