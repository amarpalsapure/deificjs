exports.send = function(req, res) {
    //get the state of app
    var app = require('../shared/app.init');
    var state = app.init(req);

    //intialize SDK
    var sdk = require('./appacitive.init');
    var Appacitive = sdk.init(state.token, state.debug);

    //get the transformer
    var transformer = require('./infra/transformer');

    if (!state.userid) return res.status(401).json(transformer.toSessionExpiredError(res));

    var sendEmail = function (emailAddresses) {
        var options = {
            to: emailAddresses,
            subject: 'Feedback Recieved',
            templateName: 'feedback',
            from: "noreply@appacitive.com",
            isHtml: true,
            data: {
                "brand": process.config.brand,
                "text": req.body.text,
                "userurl": process.config.host + '/users/' + state.userid,
                "fullname": state.fullname
            }
        };
        Appacitive.Email.sendTemplatedEmail(options, function () {
            return res.status(204).json({});
        }, function (status) {
            return res.status(502).json(transformer.toError('feedback', status));
        });
    };

    sendEmail(process.config.feedbackemail.split(','));
    
};