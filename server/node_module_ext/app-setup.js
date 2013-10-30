exports.init = function (req, res, next) {
    if (!process.config.apikey || process.config.apikey === '' ||
        !process.config.sa === '' || process.config.sa === '' ||
        !process.config.brand === '' || process.config.brand === '' ||
        !process.config.appId === '' || process.config.appId === '' ||
        !process.config.env === '' || process.config.env === '' ||
        !process.config.host === '' || process.config.host === '' ||
        !process.config.allowsignup === '' || process.config.allowsignup === '' ||
        !process.config.feedbackemail === '' || process.config.feedbackemail === '')
        res.redirect('/admin/setup');
    else next();
};