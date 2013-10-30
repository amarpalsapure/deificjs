//Connect the comment to the entity
exports.save = function(req, res) {
	var payload = req.body.configurations;

    //get the state of app
	var app = require('../shared/app.init');
	var state = app.init(req);

	//intialize SDK
	var sdk = require('./appacitive.init');
	var Appacitive = sdk.init(state.token, state.debug);

	//get the transformer
	var transformer = require('./infra/transformer');

	if (!payload) return res.status(402).json(transformer.toError('invalid_input'));

    //update process configuration
	var privateKeys = ['rv', 'environment'];
	for (var key in process.config) {
	    if (privateKeys.indexOf(key) != -1) continue;
	    process.config[key] = payload[key];
	}

    //persist in local storage

	return res.status(204).json({});
};

exports.findAll = function(req, res) {
	//get the state of app
	var app = require('../shared/app.init');
	var state = app.init(req);

	var response = {
        configurations: []
	}

	var returnConfig = function () {
	    var privateKeys = ['rv', 'environment'];
	    for (var key in process.config) {
	        if (privateKeys.indexOf(key) != -1) continue;
	        response.configurations.push({
                __id: key,
	            name: key,
                value: process.config[key]
	        });
	    }
	    return res.json(response);dsa
	};
	returnConfig();
	//if api key is not setup means user is setting up the application
	//if (!process.config.apikey) {

	//} else {
    //    //if api key is there check the access
	//    //intialize SDK
	//    var sdk = require('./appacitive.init');
	//    var Appacitive = sdk.init(state.token, state.debug);

	//    //get the transformer
	//    var transformer = require('./infra/transformer');
	//}
};