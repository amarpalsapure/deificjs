exports.set = function (token, success, failure, req, res) {
    //initialize the sdk
    var sdk = require('../service/appacitive.init');
    var Appacitive = sdk.init();

    var session = req.cookies["__app_session"];

    if (session && session.length > 0) {
        var userData = req.cookies["_app_session_user"];
        var apUser = {};
        var userSplit = userData.split('|');
        apUser.firstname = userSplit[0];
        apUser.lastname = userSplit[1];
        apUser.accountname = userSplit[2];
        apUser.username = userSplit[3];
        apUser.email = userSplit[4];
        
        if (userSplit.length > 5) {
            apUser.photo = userSplit[5];
        }

        if (!token || token === '') {
            //token is not set/user is not logged in
            var userAPI = require("../service/user");
            userAPI.findByUsernameOrCreate(apUser, req, res, success, failure);
        } else {
            //validate the user token, to do this get user by token
            //this internally sets the context of the user
            Appacitive.Users.getUserByToken(token, success, failure);
        }

    } else {
        failure();
    }

};