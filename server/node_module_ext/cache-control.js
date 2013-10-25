exports.noCacheRequest = function (req, res, next) {
    res._no_minify = true;
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", 0);
    next();
};

exports.timeCacheRequest = function (req, res, next) {
    res._no_minify = true;
    res.header("Cache-Control", "must-revalidate");
    next();
};