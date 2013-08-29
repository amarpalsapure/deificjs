
/**
 * Module dependencies.
 */

var express = require('express');
var engine = require('ejs-locals');
var routes = require('./server/site/routes');
var user = require('./server/site/routes/user');
var questions = require('./server/site/routes/questions');
var http = require('http');
var path = require('path');
process.config = require('./server/shared/configuration').load();
var googlebot = require("./server/googlebot.js");

// api
var question = require('./server/service/question.js');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/server/site/views');
app.set('view engine', 'ejs');
app.engine('ejs', engine);
app.use(googlebot());
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'server/site/public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// service route
// questions
app.get('/service/question/find/all', question.findAll);
app.get('/service/question/find/:id', question.findById);

// site route
app.get('/', routes.index);
app.get('/questions/:id', questions.index);
app.get('/questions/:id/:title', questions.index);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
