exports.init = function (userToken) {
	var path = './infra/AppacitiveSDK.js';
	delete require.cache[require.resolve(path)];

	var Appacitive = require(path);
	delete require.cache[require.resolve(path)];

	Appacitive.initialize({ 
	    apikey: process.config.apikey, 
	    env: process.config.env,
	    appId: process.config.appId,
	    userToken: userToken
	});

	Appacitive.config.apiBaseUrl = "http://apis.appacitive.com/";
	return Appacitive;
};