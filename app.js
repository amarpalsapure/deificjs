
//Module dependencies.
var express = require('express');
var engine = require('ejs-locals');
var minify = require('express-minify');
var passport = require('passport');
var util = require('util');
var TwitterStrategy = require('passport-twitter').Strategy;
var http = require('http');
var path = require('path');
var cacheControl = require('./server/node_module_ext/cache-control');
var appSetup = require('./server/node_module_ext/app-setup');

// routes
var routes = require('./server/site/routes');
var userRoute = require('./server/site/routes/user');
var questionRoute = require('./server/site/routes/question');
var answerRoute = require('./server/site/routes/answer');
var searchRoute = require('./server/site/routes/search');
var tagRoute = require('./server/site/routes/tag');
var feedbackRoute = require('./server/site/routes/feedback');
var adminRoutes = require('./server/site/routes/admin');

// api
var questionApi = require('./server/service/question.js');
var answerApi = require('./server/service/answer.js');
var userApi = require('./server/service/user.js');
var commentApi = require('./server/service/comment.js');
var tagApi = require('./server/service/tag.js');
var tagwikiApi = require('./server/service/tagwiki.js');
var searchApi = require('./server/service/search.js');
var callbackHandlerApi = require('./server/service/callbackHandlers.js');
var feedbackApi = require('./server/service/feedback.js');
var configurationApi = require('./server/service/configuration.js');

// load the config
process.config = require('./server/shared/configuration').load(__dirname);

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});


if (process.config.twitter_consumer_key != '' && process.config.twitter_consumer_secret != '') {
    passport.use(new TwitterStrategy({
        consumerKey: process.config.twitter_consumer_key,
        consumerSecret: process.config.twitter_consumer_secret,
        callbackURL: process.config.host + "/auth/twitter/callback"
    }, function (token, tokenSecret, profile, done) {
        // asynchronous verification, for effect..
        process.nextTick(function () {
            profile.token = token;
            profile.tokenSecret = tokenSecret;
            return done(null, profile);
        });
    }
    ));
}

var app = express();
app.use(express.compress());

// only production
if ('production' == app.get('env')) {
    // enable minification of static content
    app.use(minify({ cache: path.join(__dirname, 'server/site/public/_cache') }));

    // add resource combiner
    require('./server/node_module_ext/combiner.js').initialize(__dirname);
}

// all environments
app.set('port', process.env.PORT || 8400);
app.set('views', __dirname + '/server/site/views');
app.set('view engine', 'ejs');
app.engine('ejs', engine);

// prerender html (for google bot)
app.use(require('prerender-node'));

// express related stuff
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.favicon());
app.use(express.cookieParser('9b7c1f44590b46e509db'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'server/site/public'), { maxAge: Infinity }));

// passport related stuff
app.use(passport.initialize());
app.use(passport.session());

// development only
process.config.environment = app.get('env');
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}


// ***************************************************
// ****************** Service route ******************
// ***************************************************

// ################# question api ####################
// get all question
app.get('/service/questions', cacheControl.noCacheRequest, questionApi.findQuestion);
// save question
app.post('/service/questions', cacheControl.noCacheRequest, questionApi.save);
// update question
app.put('/service/questions/:id', cacheControl.noCacheRequest, questionApi.update);
// delete question
app.delete('/service/questions/:id', cacheControl.noCacheRequest, questionApi.del);


// ################# answer api ####################
// get answer
app.get('/service/answers/:id', cacheControl.noCacheRequest, answerApi.findById);
// save answer
app.post('/service/answers', cacheControl.noCacheRequest, answerApi.save);
// update answer
app.put('/service/answers/:id', cacheControl.noCacheRequest, answerApi.update);
// delete comment
app.delete('/service/answers/:id', cacheControl.noCacheRequest, answerApi.del);


// ################# user api ####################
// get all users
app.get('/service/users', cacheControl.timeCacheRequest, userApi.findAll);
// get user
app.get('/service/users/:id', cacheControl.timeCacheRequest, userApi.findById);
// update user
app.put('/service/users/:id', cacheControl.noCacheRequest, userApi.update);
// authenticate user
app.post('/service/users/auth', cacheControl.noCacheRequest, userApi.auth);
// authenticate user using facebook
app.post('/service/users/fbauth', cacheControl.noCacheRequest, userApi.fbauth);
// logout user
app.post('/service/users/logout', cacheControl.noCacheRequest, userApi.logout);
// register user
app.post('/service/users/register', cacheControl.noCacheRequest, userApi.register);
// recover password
app.post('/service/users/recover', cacheControl.noCacheRequest, userApi.recover);
// reset password
app.post('/service/users/reset', cacheControl.noCacheRequest, userApi.reset);

// ################# comment api ####################
// save comment
app.post('/service/comments', cacheControl.noCacheRequest, commentApi.save)
// delete comment
app.delete('/service/comments/:id', cacheControl.noCacheRequest, commentApi.del);

// ################# tag api ####################
// find tag
app.get('/service/tags', cacheControl.timeCacheRequest, tagApi.findAll);
// find tag by id
app.get('/service/tags/:id', cacheControl.timeCacheRequest, tagApi.findById);
// save tag
app.post('/service/tags/add', cacheControl.noCacheRequest, tagApi.save);
// find tag by name
app.get('/service/tagwikis', cacheControl.timeCacheRequest, tagwikiApi.findByName);
// update tagwiki
app.put('/service/tagwikis/:id', cacheControl.noCacheRequest, tagwikiApi.update);

// ################# search api ####################
// free text search
app.get('/service/entities', cacheControl.timeCacheRequest, searchApi.search);


// ################# call back handler api ####################
app.post('/service/callback/entitycreate', cacheControl.noCacheRequest, callbackHandlerApi.entitycreate);

// ################ feedback #######################
app.post('/service/feedback', feedbackApi.send);

// ################ configurations ##################
// get all configurations
app.get('/service/configurations', cacheControl.noCacheRequest, configurationApi.findAll);

//save configurations
app.post('/service/configurations', cacheControl.noCacheRequest, configurationApi.save);


// *************************************************
// ***************** site route ********************
// *************************************************

// application setup route
app.get('/admin/setup', adminRoutes.index);

// ################ question #######################
// index page
app.get('/', appSetup.init, routes.index);

// about page
app.get('/about', appSetup.init, routes.about);

//ask a question
app.get('/questions/ask', appSetup.init, questionRoute.ask);

// all questions page
app.get('/questions', appSetup.init, questionRoute.all);

// question list page by tag
app.get('/questions/tagged/:tag', appSetup.init, questionRoute.tagged);

// question page without title in url
app.get('/questions/:id', appSetup.init, questionRoute.index);

// question page with title in url
app.get('/questions/:id/edit', appSetup.init, questionRoute.edit);

// question page with title in url
app.get('/questions/:id/:title', appSetup.init, questionRoute.index);

// short url for question
app.get('/q/:qid', appSetup.init, questionRoute.miniindex);

//short url for answer
app.get('/a/:qid/:aid', appSetup.init, questionRoute.miniindex);

// ################ answer #####################
//answer edit
app.get('/answers/:id/edit', appSetup.init, answerRoute.edit);

// ################ user #######################
//all users
app.get('/users', appSetup.init, userRoute.index);

// user login page
app.get('/users/login', appSetup.init, userRoute.login);

// user edit page
app.get('/users/edit/:id', appSetup.init, userRoute.edit);

// get user by id withour name in url
app.get('/users/:id', appSetup.init, userRoute.findById);

// get user by id with name in url
app.get('/users/:id/:title', appSetup.init, userRoute.findById);


// ################ search #######################
app.get('/search', appSetup.init, searchRoute.search);

// ################ tags #######################
// all tags page
app.get('/tags', appSetup.init, tagRoute.index);
// add new tag
app.get('/add-tag-wiki', appSetup.init, tagRoute.add);
// it renders the same page as all questions for a given tag
app.get('/tags/:tag', appSetup.init, questionRoute.tagged);
// tag info page
app.get('/tags/:tag/info', appSetup.init, tagRoute.info);
// tag edit page
app.get('/tags/:tag/edit', appSetup.init, tagRoute.edit);

// ################ feedback #######################
app.get('/feedback', appSetup.init, feedbackRoute.index);

// GET /auth/twitter
// Use passport.authenticate() as route middleware to authenticate the
// request. The first step in Twitter authentication will involve redirecting
// the user to twitter.com. After authorization, the Twitter will redirect
// the user back to this application at /auth/twitter/callback
app.get('/auth/twitter',
  passport.authenticate('twitter'),
  function (req, res) {
      // The request will be redirected to Twitter for authentication, so this
      // function will not be called.
  });

// GET /auth/twitter/callback
// Use passport.authenticate() as route middleware to authenticate the
// request. If authentication fails, the user will be redirected back to the
// login page. Otherwise, the primary route function function will be called,
// which, in this example, will redirect the user to the home page.
app.get('/auth/twitter/callback',
  	passport.authenticate('twitter', { failureRedirect: '/users/login?tl=1' }),
  	function (req, res) {
  	    //initialize the SDK
  	    var sdk = require('./server/service/appacitive.init');
  	    var Appacitive = sdk.init();

  	    var authRequest = {
  	        'type': 'twitter',
  	        'oauthtoken': req.user.token,
  	        'oauthtokensecret': req.user.tokenSecret,
  	        'createnew': true
  	    }

  	    Appacitive.Users.authenticateUser(authRequest, function () {
  	        res.cookie('u', {
  	            i: authResult.user.id(),
  	            f: authResult.user.get('firstname'),
  	            l: authResult.user.get('lastname'),
  	            e: authResult.user.get('email'),
  	            t: authResult.token
  	        }, {
  	            signed: true,
  	            maxAge: 30 * 24 * 60 * 60 * 1000, //30 days
  	            httpOnly: true
  	        });
  	        res.redirect('/users/login?tl=0');
  	    }, function (error) {
  	        res.redirect('/users/login?tl=1');
  	    }, 'twitter');
  	}
);


http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});