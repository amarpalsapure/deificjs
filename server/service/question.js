exports.findAll = function(req, res) {
	var response = {
		questions: []
	};
	var questionIds = [];

	var sdk = require('./appacitive.init');
	var Appacitive = sdk.init();

	var transformer = require('./infra/transformer');

	//First get the question according to the query
	//then get the question details by making a graph query call
	var orderBy = '__utcdatecreated',
		filter = '';


	var sort = req.query.sort;
	sort = (!sort) ? 'popular' : sort.toLowerCase();
	switch(sort) {
		case 'popular': 
			orderBy = 'totalvotecount';
			break;
		case 'latest':
			break;
		case 'unresolved':
			filter = '*isanswered==false';
			break;
	}

	var query = new Appacitive.Queries.FindAllQuery({
					schema : 'question',
					fields : '__id',
					isAscending: false,
					orderBy: orderBy,
					filter: filter,
					pageSize: process.config.pagesize
				});

	query.fetch(function (questions, pi) {
		questions.forEach(function (question) {
			questionIds.push(question.id());
		})

		//Get the quesiton details
		var query = new Appacitive.Queries.GraphProjectQuery('questions', questionIds);
		query.fetch(function (gQuestions) {
			//if no data found
			if(gQuestions && gQuestions.length > 0) response = transformer.toQuestions(gQuestions);
			
			return res.json(response);
		}, function (status) {
			return res.json(response);
		});	
	}, function (status) {
		return res.json(response);
	});	
};


var _findById = function(req, qId, callback) {
	var response = {
		question: {},
		comments: [],
		users: []
	};
	var answersMeta = [];
	var correctanswerMeta = {
		__id: '',
		__utcdatecreated: ''
	}

	// +    vote => +1
	// -    vote => -1
	// not voted =>  0
	var voted = 0
	var callCount = 3;

	//to update the view count
	var isNewVisit = false;

	//if the id of question doesn't exists in session object, increment view count
	if(!req.session.visited_questions) req.session.visited_questions = [];
	if(req.session.visited_questions.indexOf(qId) == -1){
		isNewVisit = true;
		req.session.visited_questions.push(qId);
	}

	//merge the responses from the parallel calls
	var merge = function(){
		if(--callCount != 0) return;
		if(isNewVisit) response.question['viewcount'] = parseInt(response.question['viewcount'], 10) + 1;
		if(response.question.correctanswer) {
			var newAnswerMeta = [];
			newAnswerMeta.push(response.question.correctanswer);
			//remove the correct answer from answersMeta if it's there 
			//else remove the last item, depending upon the page size
			for (var i = 0; i < answersMeta.length; i++) {
				if(answersMeta[i].__id == response.question.correctanswer.__id) continue;
				newAnswerMeta.push(answersMeta[i]);
			};
			delete response.question.correctanswer;
			answersMeta = newAnswerMeta;
		}
		response.question['answersMeta'] = answersMeta;
		response.question['voted'] = voted;
		callback(response);
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
		if(!questions && questions.length == 0) callback(response);
		
		var question = questions[0]
		response = transformer.toQuestion(question);
		merge();

		//update the view count, fire and forget save call
		if(isNewVisit) question.increment('viewcount').save();

	}, function (status) {
		merge();
	});	

	//PARALLEL CALL 2 
	//Get the answers
	var orderBy = '__utcdatecreated',
		isAscending = false;
	var sort = req.query.sort;
	sort = (!sort) ? 'active' : sort.toLowerCase();
	switch(sort) {
		case 'active': 
			break;
		case 'votes':
			orderBy = 'totalvotecount';
			break;
		case 'oldest':
			isAscending = true;
			break;
	}

	var question = new Appacitive.Article({ __id : qId, schema : 'question' });
	question.fetchConnectedArticles({ 
	    relation: 'question_answer',
	    orderBy: orderBy,
	    isAscending: isAscending,
	    pageSize: process.config.pagesize,
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
exports.findById = function(req, res) {
	var qId = req.param('id');
	_findById(req, qId, function(response){
		return res.json(response);	
	});
};