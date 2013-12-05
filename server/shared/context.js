exports.set = function (token, success, failure) {
    //initialize the sdk
    var sdk = require('../service/appacitive.init');
    var Appacitive = sdk.init();

    if (!token || token === '') {
        //token is not set
        failure();
    } else {
        //validate the user token, to do this get user by token
        //this internally sets the context of the user
        Appacitive.Users.getUserByToken(token, success, failure);
    }
};