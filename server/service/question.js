exports.findAll = function(req, res) {
	var sdk = require('./appacitive.init');
	var Appacitive = sdk.init();

	var query = new Appacitive.Queries.FindAllQuery({
		schema : 'question',
		fields: ['title']
	});
	query.fetch(function (questions) {
		var q  =[];
		questions.forEach(function (question) {
			q.push(question.toJSON());
			//q.push({
			//	id: question.get('__id'),
			//	title : question.get('title')
			//});
		})

		res.json({ questions: q });
	}, function (status) {
		res.json(status);
	});	
};

exports.findById = function(req, res) {
	var response = {
		question: {},
		comments: [],
		users: []
	};
	var answersMeta = [];
	var qId = req.param('id');
	// +    vote => +1
	// -    vote => -1
	// not voted =>  0
	var voted = 0

	var callCount = 3;

	var merge = function(){
		if(--callCount != 0) return;
		response.question['answers_meta'] = answersMeta;
		response.question['voted'] = voted;
		return res.json(response);
	};

	//initialize the SDK
  	var sdk = require('./appacitive.init');
	var Appacitive = sdk.init();

	var transformer = require('./infra/transformer');

	//get the state of app
	//to check if user is logged in or not
	var app = require('../shared/app.init');
	var state = app.init(req);

	//PARALLEL CALL 1 
	//Get the quesiton details
	var query = new Appacitive.Queries.GraphProjectQuery('question', [qId]);
	query.fetch(function (questions) {
		//if no data found
		if(!questions && questions.length == 0) return res.json(response);
		
		var question = questions[0]
		response = transformer.toQuestion(question);
		merge();

		//update the view count, fire and forget save call
		//question.increment('viewcount').save();
	}, function (status) {
		merge();
	});	

	//PARALLEL CALL 2 
	//Get the answers
	var question = new Appacitive.Article({ __id : qId, schema : 'question' });
	question.fetchConnectedArticles({ 
	    relation: 'question_answer',
	    orderBy: 'upvotecount',
	    pageSize: 10,
	    fields: ['__id,__utcdatecreated']
	}, function(obj, pi) {
	    question.children['question_answer'].forEach(function(answer){
	    	answersMeta.push({
	    		__id: answer.id(),
	    		__utcdatecreated: answer.get('__utcdatecreated')
	    	})
	    });
	    merge();
	}, function (err, obj) {
		merge();
	});

	//PARALLEL CALL 3 
	//Check if logged in user had voted the question
	if(state.isauth) {
		Appacitive.Connection.getBetweenArticlesForRelation({
			relation: 'question_vote',
			articleAId : state.userid, // id of logged in user
			articleBId : qId // id of question
		}, function(connection) {
			if(connection){
				if(connection.get('isupvote')) voted = 1;
				else voted = -1;
			}
			merge();
		}, function(err) {
			merge();
		});
	}else {
		merge();
	}
};