
/**
 * Module dependencies.
 */

var express = require('express');
var engine = require('ejs-locals');
var minify = require('express-minify');
var passport = require('passport');
var util = require('util');
var TwitterStrategy = require('passport-twitter').Strategy;

var routes = require('./server/site/routes');
var userRoute = require('./server/site/routes/user');
var questionRoute = require('./server/site/routes/question');
var searchRoute = require('./server/site/routes/search');
var tagRoute = require('./server/site/routes/tag');
var http = require('http');
var path = require('path');
process.config = require('./server/shared/configuration').load();
//var googlebot = require("./server/googlebot.js");

// api
var questionApi = require('./server/service/question.js');
var answerApi = require('./server/service/answer.js');
var userApi = require('./server/service/user.js');
var commentApi = require('./server/service/comment.js');
var tagApi = require('./server/service/tag.js');
var searchApi = require('./server/service/search.js');
var callbackHandlerApi = require('./server/service/callbackHandlers.js');



passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


if (process.config.twitter_consumer_key != '' && process.config.twitter_consumer_secret != '') {
    passport.use(new TwitterStrategy({
        consumerKey: process.config.twitter_consumer_key,
        consumerSecret: process.config.twitter_consumer_secret,
        callbackURL: "http://localhost:3000/auth/twitter/callback"
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

console.log(app.get('env'));
if ('production' == app.get('env')) {
	app.use(minify({ cache: path.join(__dirname, 'server/site/public/_cache') }));
}

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/server/site/views');
app.set('view engine', 'ejs');
app.engine('ejs', engine);
//app.use(googlebot());
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('9b7c1f44590b46e509db'));
app.use(express.session());

app.use(passport.initialize());
app.use(passport.session());

app.use(app.router);
app.use(express.static(path.join(__dirname, 'server/site/public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// ***************************************************
// ****************** Service route ******************
// ***************************************************

// ################# question api ####################
function noCacheRequest() {
	return function(req, res, next) {
		res._no_minify = true;
		res.header("Cache-Control", "no-cache, no-store, must-revalidate");
		res.header("Pragma", "no-cache");
		res.header("Expires", 0);
		next();
	};
};

// get all question
app.get('/service/questions', noCacheRequest(), questionApi.findQuestion);
// save question
app.post('/service/questions', noCacheRequest(), questionApi.save);
// update question
app.put('/service/questions/:id', noCacheRequest(), questionApi.update);
// delete question
app.delete('/service/questions/:id', noCacheRequest(), questionApi.del);


// ################# answer api ####################
// get answer
app.get('/service/answers/:id', noCacheRequest(), answerApi.findById);
// save answer
app.post('/service/answers', noCacheRequest(), answerApi.save);
// update answer
app.put('/service/answers/:id', noCacheRequest(), answerApi.update);
// delete comment
app.delete('/service/answers/:id', noCacheRequest(), answerApi.del);


// ################# user api ####################
// get all users
app.get('/service/users', noCacheRequest(), userApi.findAll);
// get user
app.get('/service/users/:id', noCacheRequest(), userApi.findById);
// authenticate user
app.post('/service/users/auth', noCacheRequest(), userApi.auth);
// authenticate user using facebook
app.post('/service/users/fbauth', noCacheRequest(), userApi.fbauth);
// logout user
app.post('/service/users/logout', noCacheRequest(), userApi.logout);
// register user
app.post('/service/users/register', noCacheRequest(), userApi.register);
// recover password
app.post('/service/users/recover', noCacheRequest(), userApi.recover);


// ################# comment api ####################
// save comment
app.post('/service/comments', noCacheRequest(), commentApi.save)
// delete comment
app.delete('/service/comments/:id', noCacheRequest(), commentApi.del);

// ################# tag api ####################
// find tag
app.get('/service/tags', noCacheRequest(), tagApi.findAll)
// find tag by id
app.get('/service/tags/:id', noCacheRequest(), tagApi.findById);

// ################# search api ####################
// free text search
app.get('/service/entities', noCacheRequest(), searchApi.search);


// ################# call back handler api ####################



// *************************************************
// ***************** site route ********************
// *************************************************


// ################ question #######################
// index page
app.get('/', routes.index);

//ask a question
app.get('/questions/ask', questionRoute.ask);

// all questions page
app.get('/questions', questionRoute.all);

// question list page by tag
app.get('/questions/tagged/:tag', questionRoute.tagged);

// question page without title in url
app.get('/questions/:id', questionRoute.index);

// question page with title in url
app.get('/questions/:id/:title', questionRoute.index);

// short url for question
app.get('/q/:qid', questionRoute.miniindex);

//short url for answer
app.get('/a/:qid/:aid', questionRoute.miniindex);


// ################ user #######################
//all users
app.get('/users', userRoute.index);

// user login page
app.get('/users/login',userRoute.login);

// get user by id withour name in url
app.get('/users/:id', userRoute.findById);

// get user by id with name in url
app.get('/users/:id/:title', userRoute.findById);


// ################ search #######################
app.get('/search', searchRoute.search);


// ################ tags #######################
// all tags page
app.get('/tags', tagRoute.index);
// it renders the same page as all questions for a given tag
app.get('/tags/:tag', questionRoute.tagged);

// GET /auth/twitter
// Use passport.authenticate() as route middleware to authenticate the
// request. The first step in Twitter authentication will involve redirecting
// the user to twitter.com. After authorization, the Twitter will redirect
// the user back to this application at /auth/twitter/callback
app.get('/auth/twitter',
  passport.authenticate('twitter'),
  function(req, res){
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
  	function(req, res) {
	  	//initialize the SDK
	  	var sdk = require('./server/service/appacitive.init');
		var Appacitive = sdk.init();

		var authRequest = {
			'type': 'twitter',
		  	'oauthtoken': req.user.token,
		  	'oauthtokensecret': req.user.tokenSecret,
		  	'createnew': true
		}

		Appacitive.Users.authenticateUser(authRequest, function(){ 
		  	res.cookie('u', {
				i: authResult.user.id(),
				f: authResult.user.get('firstname'),
				l: authResult.user.get('lastname'),
				e: authResult.user.get('email'),
				t: authResult.token
			},{
				signed: true,
				maxAge: 30*24*60*60*1000, //30 days
				httpOnly: true
			});
			res.redirect('/users/login?tl=0');
		}, function(error) {
			res.redirect('/users/login?tl=1');			  		
		}, 'twitter');
	}
);


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});