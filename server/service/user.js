exports.findById = function(req, res) {
	var response = {
		user: {}
	};

  	var sdk = require('./appacitive.init');
	var Appacitive = sdk.init();
	
	var user = new Appacitive.User({__id: req.param('id')})
	user.fetch(function () {
		//tranform		
		var transform = function (user) {
			response.user = user.toJSON();
			return response;
		}

		res.json(transform(user));
	}, function (status) {
		res.json(response);
	});	
};

exports.auth = function(req, res){
	var email = req.body.email;
	var pwd = req.body.password;

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

    	res.send({
			success: true,
			user: {
				id: authResult.user.id(),
				fname: authResult.user.get('firstname'),
				lname: authResult.user.get('lastname')
			}
		});
	}, function(data) {
		var message = data && data.message ? data.message : 'Authentication failed';
    	res.send({
    		success: false,
    		message: message
    	});
	});	
};

exports.logout = function(req, res){
	//TODO: Logout user from appacitve
	res.clearCookie('u');
	res.send({
		success: true
	});
};