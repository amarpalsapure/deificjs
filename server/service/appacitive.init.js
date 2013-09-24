exports.init = function (userToken, debug) {
	if(!debug) debug = false;
	if(typeof userToken === 'boolean') {
		debug = userToken;
		userToken = null;
	}
	var path = './infra/AppacitiveSDK.js';
	delete require.cache[require.resolve(path)];

	var Appacitive = require(path);
	delete require.cache[require.resolve(path)];

	Appacitive.initialize({ 
	    apikey: process.config.apikey, 
	    env: process.config.env,
	    appId: process.config.appId,
	    userToken: userToken,
	    debug: debug
	});

	Appacitive.config.apiBaseUrl = "http://apis.appacitive.com/";
	return Appacitive;
};