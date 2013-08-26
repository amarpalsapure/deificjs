exports.init = function (userToken) {
	var path = './infra/AppacitiveSDK.js';
	delete require.cache[require.resolve(path)];

	var Appacitive = require(path);
	delete require.cache[require.resolve(path)];

	var config = require('../shared/configuration').load();

	Appacitive.initialize({ 
	    apikey: config.apikey, 
	    env: config.env,
	    appId: config.appId,
	    userToken: userToken
	});
	return Appacitive;
};