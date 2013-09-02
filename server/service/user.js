exports.findById = function(req, res) {
	var t = {"user": {"__id": "35557311733959061", "__schematype": "user", "__attributes": {}, "__tags": [], "__createdby": "Amar Palsapure", "__lastmodifiedby": "Amar Palsapure", "__schemaid": "35005530646905140", "__revision": "1", "__utcdatecreated": "2013-08-28T11:28:14.9929811Z", "__utclastupdateddate": "2013-08-28T11:28:14.9929811Z", "username": "jane.doe", "location": "", "email": "", "firstname": "Jane", "lastname": "Doe", "isemailverified": "false", "isenabled": "true", "isonline": "false", "connectionid": ""} };
	return res.json(t);

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