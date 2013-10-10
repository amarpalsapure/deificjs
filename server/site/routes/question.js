exports.index = function(req, res){
	//initialize the app
  	var app = require('../../shared/app.init');
	var state = app.init(req);

	state.title = 'Fetching question';

	res.render('question', state);
};

exports.all = function(req, res) {
	//initialize the app
  	var app = require('../../shared/app.init');
	var state = app.init(req);

	switch(req.param('sort')) {
		case 'latest':
			state.title = "Latest Questions";
			break;
		case 'active':
			state.title = "Most Active Questions";
			break;
		case 'unresolved':
			state.title = "Unresolved Questions";
			break;
		default:
			state.title = "Highest Voted Questions";
			break;
	}
		
	res.render('questions', state);
};

exports.tagged = function(req, res) {
	//initialize the app
  	var app = require('../../shared/app.init');
	var state = app.init(req);

	state.tag = encodeURIComponent(req.param('tag'));

	switch(req.param('sort')) {
		case 'latest':
			state.title = "Latest Questions tagged as '" + req.param('tag') + "'";
			break;
		case 'active':
			state.title = "Most Active Questions tagged as '" + req.param('tag') + "'";
			break;
		case 'unresolved':
			state.title = "Unresolved Questions tagged as '" + req.param('tag') + "'";
			break;
		default:
			state.title = "Highest Voted Questions tagged as '" + req.param('tag') + "'";
			break;
	}

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