var phantom = require("node-phantom");
var phantom_opts = {
        phantomPath: require("phantomjs").path,
        parameters: {
                "ignore-ssl-errors": "yes"
                }
        }
var url = require("url");
 
function openPage(path, callback)
        {
        phantom.create(function(err, ph)
                {
                ph.createPage(function(err, page)
                        {
                        page.open(path, function(err, status)
                                {
                                if(err) return callback(err);
                                if(status == "fail")
                                        return callback(new Error("Googlebot: page "+path+" failed to load."));
                                callback(null, page);
                                ph.exit();
                                });
                        });
                }, phantom_opts);
        }
 
module.exports = function(options)
        {
        if(typeof options != "object") options = {};
        var fragment = '?_escaped_fragment_=';
       
        return function(req, res, next)
                {
                //check for escaped fragment:
                var parts = req.url.split(fragment);
                if(parts.length < 2) return next();
               
                //construct url:
                var start = (options.protocol || req.protocol || "http")+
                          "://"+(options.host || req.headers.host);
                var url = start + parts[0] + "#!" + decodeURIComponent(parts[1]);
               
                //get page:
                openPage(url, function(err, page)
                        {
                        if(err) return next(err);
                        setTimeout(function()
                                {
                                page.evaluate(function(){      
 
                                        return document.all[0].outerHTML;
                                       
                                        },function(err, html){
                                       
                                        if(err) return next(err);
                                        if(typeof html != "string") return next(new Error("googlebot.js: html returned was not a string."));
                                       
                                        //modify urls if they are relative (don't start with [a-zA-Z]+:):
                                        html = html.replace(/(<a[^>]*href=\")(?:(?![a-zA-Z]+:))\/?([^"]*"[^>]*>)/g, "$1"+start+"/$2");
                                       
                                        //strip script tags:
                                        html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
                                       
                                        //send
                                        res.end(html);
                                        });
                                }, options.delay || 0);
                        });
                }
        }