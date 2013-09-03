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