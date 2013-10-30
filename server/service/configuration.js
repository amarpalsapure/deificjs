//Saves the configuration in application
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

    //saves the config in local store and updates it in memory
	var saveConfig = function () {
	    //persist in local storage
	    var configAPI = require('../shared/configuration');
	    var success = configAPI.save(payload);

	    if (success === false) return res.status(500).json(transformer.toError('config_save'));

	    //update process configuration
	    var privateKeys = process.config.private;
	    for (var key in process.config) {
	        if (privateKeys.indexOf(key) != -1) continue;
	        process.config[key] = payload[key];
	    }
	    return res.status(204).json({});
	}

	__authorizeAction(req, res, saveConfig);
};

//Gets the configuration from application
exports.findAll = function(req, res) {
	var response = {
        configurations: []
	}

    //returns the configuration
	var returnConfig = function () {
	    var privateKeys = process.config.private;
	    for (var key in process.config) {
	        if (privateKeys.indexOf(key) != -1) continue;
	        response.configurations.push({
                __id: key,
	            name: key,
                value: process.config[key]
	        });
	    }
	    return res.json(response);
	};
	
	__authorizeAction(req, res, returnConfig);
};

//checks the config and if required checks the access
var __authorizeAction = function (req, res, action) {
    //get the state of app
    var app = require('../shared/app.init');
    var state = app.init(req);

    //get the transformer
    var transformer = require('./infra/transformer');

    //if api key is not setup means user is setting up the application
    if (!process.config.apikey || !process.config.sa ||
        process.config.apikey === '' || process.config.sa === '') {
        return action();
    } else {
        if (!state.token) return res.status(401).json(transformer.toError('access_denied'));
        //if api key is there check the access
        var context = require('../shared/context');
        //set the context
        context.set(state.token, function (user) {
            var email = user.get('email');
            if (!email || process.config.sa.indexOf(email.toLowerCase()) === -1) return res.status(401).json(transformer.toError('access_denied'));
            else return action();
        }, function (error) {
            //delete the cookie, and redirect user to login page
            return res.status(401).json(transformer.toSessionExpiredError(res, error));
        });
    }
};