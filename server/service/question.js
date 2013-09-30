exports.findAll = function(req, res) {
	var response = {
		questions: []
	};

	//IMPORTANT
	//Check if question id is there in param,
	//if yes, it means user has done get question
	//and not search
	var questionId = req.param('qId');
	if(questionId) {
		_findById(req, questionId, function(questionRes){
			//dump the question response object in current response object
			
			//push the question to array of question, client expects an array of question
			response.questions.push(questionRes.question);

			//following stuff is side loaded, so add it to root
			//comments, tags and users
			response.comments = questionRes.comments;
			response.tags = questionRes.tags;
			response.users = questionRes.users;

			return res.json(response);
		});

	} else {
		var questionIds = [];

		//get the state of app
		var app = require('../shared/app.init');
		var state = app.init(req);

		//initialize the SDK
		var sdk = require('./appacitive.init');
		var Appacitive = sdk.init(state.debug);

		//get the transformer
		var transformer = require('./infra/transformer');

		//First get the question according to the query
		//then get the question details by making a graph query call
		var orderBy = '__utcdatecreated',
			filter = "*issearchable==true and *type=='question'";


		var sort = req.query.sort;
		sort = (!sort) ? 'popular' : sort.toLowerCase();
		switch(sort) {
			case 'popular': 
				orderBy = 'totalvotecount';
				break;
			case 'latest':
				break;
			case 'unresolved':
				filter += ' and *isanswered==false';
				break;
		}

		var query = new Appacitive.Queries.FindAllQuery({
						schema : 'entity',
						fields : '__id',
						isAscending: false,
						orderBy: orderBy,
						filter: filter,
						pageSize: process.config.pagesize
					});

		query.fetch(function (questions, paginginfo) {
			questions.forEach(function (question) {
				questionIds.push(question.id());
			})

			//No questions found
			if(questionIds.length === 0) return res.json(response);

			//Get the question details
			var query = new Appacitive.Queries.GraphProjectQuery('questions', questionIds);
			query.fetch(function (gQuestions) {
				//if no data found
				if(gQuestions && gQuestions.length > 0) response = transformer.toQuestions(gQuestions, paginginfo);
				
				return res.json(response);
			}, function (status) {
				return res.json(response);
			});	
		}, function (status) {
			return res.json(response);
		});
	}
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
	var voteconnid = '';
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
		response.question['voteconnid'] = voteconnid;
		response.question['voted'] = voted;
		callback(response);
	};

	//get the state of app
	var app = require('../shared/app.init');
	var state = app.init(req);

	//initialize the SDK
  	var sdk = require('./appacitive.init');
	var Appacitive = sdk.init(state.debug);

	//get the transformer
	var transformer = require('./infra/transformer');

	//PARALLEL CALL 1 
	//Get the question details
	var query = new Appacitive.Queries.GraphProjectQuery('question', [qId]);
	query.fetch(function (questions) {
		//if no data found
		if(!questions && questions.length == 0) callback(response);
		
		var question = questions[0]
		response = transformer.toQuestion(question, state);
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
			orderBy: '__utclastupdateddate';
			break;
		case 'votes':
			orderBy = 'totalvotecount';
			break;
		case 'oldest':
			isAscending = true;
			break;
	}

	var question = new Appacitive.Article({ __id : qId, schema : 'entity' });
	question.fetchConnectedArticles({ 
	    relation: 'question_answer',
	    label: 'answer',
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
				if(connection.get('isupvote', 'boolean')) voted = 1;
				else voted = -1;
				voteconnid = connection.id();
			}
			merge();
		}, function(err) {
			merge();
		});
	}else {
		merge();
	}
};

//deprecated
exports.findById = function(req, res) {
	var qId = req.param('id');
	_findById(req, qId, function(response){
		return res.json(response);
	});
};

exports.update = function(req, res) {
	var question = req.body.question;
	if(!question || !question.action) return res.status(400);

	//set question id, froam param
	question.id = question.__id = req.param('id');

	//get the state of app
	var app = require('../shared/app.init');
	var state = app.init(req);

	//initialize appacitive sdk
	var sdk = require('./appacitive.init');
	var Appacitive = sdk.init(state.debug);

	//get the transformer
	var transformer = require('./infra/transformer');

	if(!state.userid) return res.status(401).json({ message: 'Session expired' });

	var aQuestion = transformer.toAppacitiveQuestion(Appacitive, question);

	//creates 'question_vote' relation between user and question 
	var question_vote_Create = function(isupvote, onsuccess, onfailure) {
		var relation = new Appacitive.ConnectionCollection({ relation: 'question_vote' });
		var connection = relation.createNewConnection({ 
		  endpoints: [{
		      articleid: question.id,
		      label: 'question'
		  }, {
		      articleid: state.userid,
		      label: 'user'
		  }],
		  isupvote: isupvote
		});
		connection.save(function(){
			question.voteconnid = connection.id();
			onsuccess();
		}, onfailure);
	}

	//updates 'question_vote' relation between user and question 
	var question_vote_Update = function(isupvote, onsuccess, onfailure) {
		var relation = new Appacitive.Connection({ relation: 'question_vote', __id: question.voteconnid });
		relation.set('isupvote', isupvote);
		relation.save(onsuccess, onfailure);
	}

	//deletes 'question_vote' relation between user and question 
	var question_vote_Delete = function(onsuccess, onfailure) {
		var relation = new Appacitive.Connection({ relation: 'question_vote', __id: question.voteconnid });
		relation.del(function() {
			question.voteconnid = '';
			onsuccess();
		}, onfailure);
	}

	//saves the question object on appacitive api
	var save = function() {
		aQuestion.save(function(){
			//transform the object
			delete question.id;
			var response = transformer.toQuestion(aQuestion, state);
			response.question.answercount = question.answercount;
			response.question.author = question.author;
			response.question.comments = question.comments;
			response.question.tags = question.tags;
			response.question.voted = question.voted;
			response.question.voteconnid = question.voteconnid;
			return res.json(response);
		}, function(status) {
			return res.status(502).json({ messsage: status.message });
		});
	};

	//depending upon the action, perform the update
	switch(question.action) {
		case 'do:upvote':
			//Step 1.0: check if connectionid exists, if yes means user has switched vote
			//Step 1.1: update the connection, and increment upvotecount and decrement downvotecount
			//Step 2.0: else create 'question_vote' connection between user and question
			//Step 2.1: decrement upvotecount
			if(question.voteconnid != ''){
				question_vote_Update(true, function(){
					aQuestion.increment('upvotecount');
					aQuestion.decrement('downvotecount');
					aQuestion.increment('totalvotecount', 2);
					save();
				}, function(status){
					return res.status(502).json({ messsage: 'Failed to register downvote' });
				});
			}else {
				question_vote_Create(true, function(){
					aQuestion.increment('upvotecount');
					aQuestion.increment('totalvotecount');
					save();
				}, function(status){
					return res.status(502).json({ messsage: 'Failed to register upvote' });
				});
			}
			//has voted true
			question.voted = 1;
			break;
		case 'undo:upvote':
			//Step 1: delete 'question_vote' connection between user and question
			//Step 2: decrement upvotecount
			question_vote_Delete(function(){
				aQuestion.decrement('upvotecount');
				aQuestion.decrement('totalvotecount');
				save();
			}, function(status){
				return res.status(502).json({ messsage: 'Failed to undo register upvote' });
			});
			//has removed vote
			question.voted = 0;
			break;
		case 'do:downvote':
			//Step 1.0: check if connectionid exists, if yes means user has switched vote
			//Step 1.1: update the connection, and decrement upvotecount and increment downvotecount
			//Step 2.0: else create 'question_vote' connection between user and question
			//Step 2.1: decrement upvotecount
			if(question.voteconnid != ''){
				question_vote_Update(false, function(){
					aQuestion.decrement('upvotecount');
					aQuestion.increment('downvotecount');
					aQuestion.decrement('totalvotecount', 2);
					save();
				}, function(status){
					return res.status(502).json({ messsage: 'Failed to register downvote' });
				});
			}else {
				question_vote_Create(false, function(){
					aQuestion.increment('downvotecount');
					aQuestion.decrement('totalvotecount');
					save();
				}, function(status){
					return res.status(502).json({ messsage: 'Failed to register downvote' });
				});
			}
			//has voted false
			question.voted = -1;
			break;
		case 'undo:downvote':
			//Step 1: delete 'question_vote' connection between user and question
			//Step 2: increment upvotecount
			question_vote_Delete(function(){
				aQuestion.decrement('downvotecount');
				aQuestion.increment('totalvotecount');
				save();
			}, function(status){
				return res.status(502).json({ messsage: 'Failed to undo register downvote' });
			});
			//has remove vote
			question.voted = 0;
			break;
		default:
			return res.status(400).json({ message: 'Invalid action provided' });
	}
};

exports.save = function(req, res) {
	var question = req.body.question;
	if(!question) return res.status(400);

	//get the state of app
	var app = require('../shared/app.init');
	var state = app.init(req);

	//initialize appacitive sdk
	var sdk = require('./appacitive.init');
	var Appacitive = sdk.init(state.debug);

	//get the transformer
	var transformer = require('./infra/transformer');

	//from the state of app
	//check if user is logged in or not
	if(!state.userid) {
		res.clearCookie('u');
		return res.status(401).json({ message: 'Session expired' });
	}

	//creates the question and connects it with current logged in user
	var createQuestion = function() {
		var aQuestion = transformer.toAppacitiveQuestion(Appacitive, question);
		aQuestion.set('title', question.title);
		aQuestion.set('text', question.text);
		aQuestion.set('__createdby', state.userid);

		var shortText = question.text.substring(0, 200);
		shortText = shortText.substring(0, Math.min(shortText.length, shortText.lastIndexOf(' ')));
		aQuestion.set('shorttext', shortText);

		//creates 'question_user' relation between user and question
		var question_user_Create = function(onsuccess, onfailure) {
			var relation = new Appacitive.ConnectionCollection({ relation: 'question_user' });
			var connection = relation.createNewConnection({ 
			  endpoints: [{
			      article: aQuestion,
			      label: 'question'
			  }, {
			      articleid: state.userid,
			      label: 'user'
			  }]
			});
			connection.save(function(){
				question_user_conn_id = connection.id();
				onsuccess();
			}, onfailure);
		}

		//creates 'question_tag' relation between user and question 
		var question_tag_Create = function(tagId, onsuccess, onfailure) {
			var relation = new Appacitive.ConnectionCollection({ relation: 'question_tag' });
			var connection = relation.createNewConnection({ 
			  endpoints: [{
			      articleid: aQuestion.id(),
			      label: 'question'
			  }, {
			      articleid: tagId,
			      label: 'tag'
			  }]
			});
			connection.save(onsuccess, onfailure);
		}

		//update question, and set the issearchable flag to true
		//so that it appears in all searches
		var updateQuestion = function() {
			//set issearchable
			aQuestion.set('issearchable', true);
			aQuestion.save(function(){
				//return the response
				var response = transformer.toQuestion(aQuestion, state);
				response.question.answercount = 0;
				response.question.author = question.author;
				response.question.comments = [];
				response.question.tags = question.tags;
				return res.json(response);
			}, function(status) {
				aQuestion.del(function(){}, function(){}, true);
				return res.status(500).json({ messsage: 'Unable to save answer' });		
			});
		};

		question_user_Create(function(){
			var counter = question.tags.length;
			var merge = function() {
				if(--counter != 0) return;

				//update the question
				updateQuestion();
			};
			for (var i = 0; i < question.tags.length; i++) {
				question_tag_Create(question.tags[i], merge, merge);
			};
		}, function(status) {
			//rollback the question
			aQuestion.del(function(){}, function(){}, true);
			return res.status(500).json({ messsage: 'Unable to save answer' });		
		});
	};

	//initiate the create process
    createQuestion();
};