exports.findById = function(req, res) {
	var response = {
		user: {}
	};

  	var sdk = require('./appacitive.init');
	var Appacitive = sdk.init();
	
	var transformer = require('./infra/transformer');

	var user = new Appacitive.User({__id: req.param('id')})
	user.fetch(function () {
		//tranform		
		response.user = transformer.toUser(user);
		res.json(response);
	}, function (status) {
		res.json(response);
	});	
};

exports.auth = function(req, res){
	var email = req.body.email;
	var pwd = req.body.password;

	//validate the inputs
	if(!email || email === '' || !pwd || pwd === '')
		return res.status(400).json({ message: 'Email and Password are required.' });
	
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
	}, function(data) {
		return res.status(401).json({ message: 'Authentication failed' });
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