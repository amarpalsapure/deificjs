exports.index = function(req, res){
	//initialize the app
  	var app = require('../../shared/app.init');
	var state = app.init(req);

	res.render('question', state);
};

exports.tagged = function(req, res) {
	//initialize the app
  	var app = require('../../shared/app.init');
	var state = app.init(req);

	state.tag = req.param('tag');
	state.title = "Questions tagged as '" + state.tag + "'";

	res.render('question-tagged', state);
};

exports.miniindex = function(req, res) {
	//get the question and answer id (if any) from request
	var questionId = req.param('qid');
	var answerId = req.param('aid');

	//initialize the sdk
	var sdk = require('../../service/appacitive.init');
	var Appacitive = sdk.init();

	//get the transformer
	var transformer = require('../../service/infra/transformer');

	// get the question from api and the redirect user to question page
	Appacitive.Article.get({ 
	    schema: 'entity', //mandatory
	    id: questionId, //mandatory
	    fields: ["title"] //optional
	}, function(question) {
		var lQuestion = transformer.toQuestion(question).question;		
		if(answerId && isNaN(answerId) == false) lQuestion.url += '#' + answerId;
		res.redirect(lQuestion.url);
	}, function(err, obj) {
	    res.redirect('404', '/error.html');
	});
};

exports.ask = function(req, res) {
	//initialize the app
  	var app = require('../../shared/app.init');
	var state = app.init(req);

	//set the title of the page
	state.title = 'Ask a Question - ' + state.title;

	//initialize the context
	var context = require('../../shared/context');
	//set the context
	context.set(state.token, function(user) {
	    res.render('question-new', state);
	}, function(err) {
		//delete the cookie, and redirect user to login page
		res.clearCookie('u');
	    res.redirect('/users/login?returnurl=/questions/ask&s=1');
	});
};