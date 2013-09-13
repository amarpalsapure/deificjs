
/**
 * Module dependencies.
 */

var express = require('express');
var engine = require('ejs-locals');
var routes = require('./server/site/routes');
var users = require('./server/site/routes/users');
var questions = require('./server/site/routes/questions');
var http = require('http');
var path = require('path');
process.config = require('./server/shared/configuration').load();
//var googlebot = require("./server/googlebot.js");

// api
var questionApi = require('./server/service/question.js');
var answerApi = require('./server/service/answer.js');
var userApi = require('./server/service/user.js');
var commentApi = require('./server/service/comment.js');

var app = express();

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
app.use(app.router);
app.use(express.static(path.join(__dirname, 'server/site/public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// service route

// ################# question api ####################
// get all question
app.get('/service/questions', questionApi.findAll);
// get question by id
app.get('/service/questions/:id', questionApi.findById);
// update question
app.put('/service/questions/:id', questionApi.update);


// ################# answer api ####################
// get answer
app.get('/service/answers/:id', answerApi.findById);
// update answer
app.put('/service/answers/:id', answerApi.update);
// save answer
app.post('/service/answers', answerApi.save);


// ################# user api ####################
// get user
app.get('/service/users/:id', userApi.findById);
// authenticate user
app.post('/service/users/auth', userApi.auth);
// logout user
app.post('/service/users/logout', userApi.logout);


// ################# comment api ####################
// save comment
app.post('/service/comments', commentApi.save)

// site route
app.get('/', routes.index);
app.get('/questions/:id', questions.index);
app.get('/questions/:id/:title', questions.index);
app.get('/questions/tagged/:tag', questions.index);
app.get('/users/login',users.login);
app.get('/users/:id', users.index);
app.get('/users/:id/:title', users.index);


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
