//*** IMPORTANT ***//
//This route will handle 3 request
// 1) find question by Id (query string will have question id)
// 2) find question by Tag (query string will have tag)
// 3) find all questions (no query search string)
exports.findQuestion = function (req, res) {
    
	if(req.param('qId')) return _findById(req, res);
	else if(req.param('tag')) return _tagSearch(req, res);
	else return _findAll(req, res);
};

//Step 1: Get the question details
//Step 2: Get the answers
// If user is logged in, in that case following two extra calls needs to be made
//Step 3: Check if logged in user had voted the question
//Step 4: Check if logged in user had bookmarked the question
var _findById = function(req, res) {
	//As we are doing a search call from client side
	//ember expects an array of of question and not a single question
	//hence creating an array and dumping question in it
	var response = {
		questions: [],
		comments: [],
		tags: [],
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
	var qId = req.param('qId');
	var questionExists = true;
	var callCount = 2;

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
		if(--callCount != 0 || questionExists === false) return;

		//increment the view count locally
		if(isNewVisit) response.question['viewcount'] = parseInt(response.question['viewcount'], 10) + 1;
		
		//if the correct answer exists, then it will appear first in any sort
		if(response.question.correctanswer) {
			var newAnswerMeta = [];
			response.question.correctanswer.__utcdatecreated = transformer.toISODateFormat(response.question.correctanswer.__utcdatecreated);
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

		//As we are doing a search call from client side
		//ember expects an array of of question and not a single question
		//hence creating an array and dumping question in it
		response.questions = [];
		response.questions.push(response.question);
		delete response.question;
		return res.json(response);
	};

	//get the state of app
	var app = require('../shared/app.init');
	var state = app.init(req);

	//initialize the SDK
  	var sdk = require('./appacitive.init');
	var Appacitive = sdk.init(state.token, state.debug);

	//get the transformer
	var transformer = require('./infra/transformer');

	//PARALLEL CALL 1 
	//Get the question details
	var graphQueryName = 'question';
	if(state.isauth) graphQueryName = 'question_user';

	var query = new Appacitive.Queries.GraphProjectQuery(graphQueryName, [qId], { id: state.userid });
	query.fetch(function (questions) {
		var question = questions[0]
		response = transformer.toQuestion(question, state);
		merge();

		//update the view count, fire and forget save call
		if(isNewVisit) question.increment('viewcount').save();
	}, function (status) {
		questionExists = false;
		merge();
		return res.status(404).json(transformer.toError('question_not_found', status));	
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
	    		__utcdatecreated: transformer.toISODateFormat(answer.get('__utcdatecreated'))
	    	})
	    });
	    merge();
	}, function (err, obj) {
		merge();
	});
};

//Step 1: Get the question ids by tag name
//Step 2: Get all question details using graph query
var _tagSearch = function(req, res) {
	var response = {
		questions: [],
		users: []
	}

	//validate input
	var tagName = req.param('tag');
	if(!tagName || tagName === '') return res.json(response);
	tagName = tagName.toLowerCase();

	//get the state of app
	var app = require('../shared/app.init');
	var state = app.init(req);

	//initialize the SDK
	var sdk = require('./appacitive.init');
	var Appacitive = sdk.init(state.token, state.debug);

	//get the transformer
	var transformer = require('./infra/transformer');

	//First get the question according to the query
	//then get the question details by making a graph query call
	var orderBy = '__utcdatecreated',
		filter = Appacitive.Filter.And(
					Appacitive.Filter.Property('issearchable').equalTo(true),
					Appacitive.Filter.Property('type').equalTo('question'),
					Appacitive.Filter.taggedWithOneOrMore([tagName])),
		pagenumber = req.param('page');

	if(!pagenumber) pagenumber = 1;

	var sort = req.query.sort;
	sort = (!sort) ? 'latest' : sort.toLowerCase();
	switch(sort) {
		case 'latest':
			break;
		case 'votes': 
			orderBy = 'totalvotecount';
			break;		
		case 'active':
			orderBy = '__utclastupdateddate';
			break;
	    case 'unresolved':
	        filter = Appacitive.Filter.And(filter, Appacitive.Filter.Property('isanswered').equalTo(false));
	        break;
	}

	var getQuestions = function(onsuccess, onfailure) {
		var questionQuery = new Appacitive.Queries.FindAllQuery({
					schema : 'entity',
					filter: filter,
					orderBy: orderBy,
				    pageNumber: pagenumber,
				    pageSize: process.config.pagesize,
				    fields: '__id'
				});
		questionQuery.fetch(onsuccess, onfailure);
	};

	var getQuestionDetails = function(questionIds, onsuccess, onfailure) {
		//Get the question details
		var query = new Appacitive.Queries.GraphProjectQuery('questions', questionIds);
		query.fetch(onsuccess, onfailure);	
	};

	//get the questions
	getQuestions(function(questions, paginginfo) {
		//extract the user ids from entities
		var questionIds = [];
		questions.forEach(function (question) {
			questionIds.push(question.id());
		});

		//No questions found
		if(questionIds.length === 0) return res.json(response);

		//get the question details with user and tags
		getQuestionDetails(questionIds, function(gQuestions) {

			//if no data found
			if(gQuestions && gQuestions.length > 0) response = transformer.toQuestions(gQuestions, paginginfo);
			
			//dump tag information
			if(!response.meta) response.meta = {};
			response.meta.tag = {};
			//getting the tag information from the response
			if(response.tags && response.tags.length > 0) {
				for (var i = 0; i < response.tags.length; i++) {
					if(tagName === response.tags[i]['name']) {
						response.meta.tag.__id = response.tags[i]['__id'];
						break;
					}
				};
			}			

		    //return the response
		    return res.json(response);

		}, function(status) { // error while fetching users
			return res.status(502).json(transformer.toError('question_find_tag_no_user', status));
		});
	}, function(status) {	// error while fetching question
		return res.status(502).json(transformer.toError('question_find_tag_no_question', status));
	});
};

//Step 1: Get the question ids according to query
//Step 2: Get the question details using projection query
var _findAll = function(req, res) {
	var response = {
		questions: [],
		comments: [],
		tags: [],
		users: []
	};
	//get the state of app
	var app = require('../shared/app.init');
	var state = app.init(req);

	//initialize the SDK
	var sdk = require('./appacitive.init');
	var Appacitive = sdk.init(state.token, state.debug);

	//get the transformer
	var transformer = require('./infra/transformer');

	//First get the question according to the query
	//then get the question details by making a graph query call
	var orderBy = '__utcdatecreated',
		filter = "*issearchable==true and *type=='question'",
		pagenumber = req.param('page');

	if(!pagenumber) pagenumber = 1;

	var sort = req.query.sort;
	sort = (!sort) ? 'votes' : sort.toLowerCase();
	switch(sort) {
		case 'votes': 
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
					pageNumber: pagenumber,
					pageSize: process.config.pagesize
				});

	query.fetch(function (questions, paginginfo) {
		var questionIds = [];
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
			return res.status(502).json(transformer.toError('question_find_all', status));
		});	
	}, function (status) {
		return res.status(502).json(transformer.toError('question_find_all', status));
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
	var Appacitive = sdk.init(state.token, state.debug);

	//get the transformer
	var transformer = require('./infra/transformer');

	if(!state.userid) return res.status(401).json(transformer.toSessionExpiredError(res));

	var aQuestion = transformer.toAppacitiveQuestion(Appacitive, question);

	//creates 'entity_vote' relation between user and entity 
	var question_vote_Create = function(isupvote, onsuccess, onfailure) {
		var relation = new Appacitive.ConnectionCollection({ relation: 'entity_vote' });
		var connection = relation.createNewConnection({ 
		  endpoints: [{
		      articleid: question.id,
		      label: 'entity'
		  }, {
		      articleid: state.userid,
		      label: 'user'
		  }],
		  isupvote: isupvote,
		  type: 'question'
		});
		connection.save(function(){
			question.voteconnid = connection.id();
			onsuccess();
		}, onfailure);

	    //update the author of question
		update_author(question.author, isupvote ? process.config.upvotepts : -1 * process.config.downvotepts);
	};

	//updates 'entity_vote' relation between user and entity 
	var question_vote_Update = function(isupvote, onsuccess, onfailure) {
		var relation = new Appacitive.Connection({ relation: 'entity_vote', __id: question.voteconnid });
		relation.set('isupvote', isupvote);
		relation.save(onsuccess, onfailure);

	    //update the author of question
		var pts = process.config.upvotepts + process.config.downvotepts;
		update_author(question.author, isupvote ? pts : -1 * pts);
	};

	//deletes 'entity_vote' relation between user and entity 
	var question_vote_Delete = function(factor, onsuccess, onfailure) {
		var relation = new Appacitive.Connection({ relation: 'entity_vote', __id: question.voteconnid });
		relation.del(function() {
			question.voteconnid = '';
			onsuccess();
		}, onfailure);

	    //update the author of question
		update_author(question.author, factor);
	};

	//create 'question_bookmark' relation between question and user
	var question_bookmark_Create = function(onsuccess, onfailure) {
		var relation = new Appacitive.ConnectionCollection({ relation: 'question_bookmark' });
		var connection = relation.createNewConnection({ 
		  endpoints: [{
		      articleid: question.id,
		      label: 'question'
		  }, {
		      articleid: state.userid,
		      label: 'user'
		  }]
		});
		connection.save(function() {
			question.bookmarkconnid = connection.id();
			onsuccess();
		}, onfailure);
	};
	var question_bookmark_Delete = function (onsuccess, onfailure) {
	    var relation = new Appacitive.Connection({ relation: 'question_bookmark', __id: question.bookmarkconnid });
	    relation.del(function () {
	        question.bookmarkconnid = '';
	        onsuccess();
	    }, onfailure);
	};
    //create 'question_subscribe' relation between question and user
	var question_subscribe_Create = function (onsuccess, onfailure) {
	    var relation = new Appacitive.ConnectionCollection({ relation: 'question_subscribe' });
	    var connection = relation.createNewConnection({
	        endpoints: [{
	            articleid: question.id,
	            label: 'question'
	        }, {
	            articleid: state.userid,
	            label: 'user'
	        }]
	    });
	    connection.save(function () {
	        question.subscribeconnid = connection.id();
	        onsuccess();
	    }, onfailure);
	};
	var question_subscribe_Delete = function (onsuccess, onfailure) {
	    var relation = new Appacitive.Connection({ relation: 'question_subscribe', __id: question.subscribeconnid });
	    relation.del(function () {
	        question.subscribeconnid = '';
	        onsuccess();
	    }, onfailure);
	};
	

    //get the user and sum the entityupcount, entitydowncount and answercount and finally add the factor
    //and update the user
	var update_author = function (authorId, factor) {
	    var user = new Appacitive.User({ __id: authorId });
	    user.fetch(function () {
	        var userJ = transformer.toUser(user);
	        user.set('reputation', userJ.reputation + factor);
	        user.save();
	    }, function () { }, [ '$entityupcount', '$entitydowncount', '$correctanswercount'])
	};

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
			response.question.isbookmarked = question.isbookmarked;
			response.question.bookmarkconnid = question.bookmarkconnid;
			response.question.issubscribed = question.issubscribed;
			response.question.subscribeconnid = question.subscribeconnid;
			return res.json(response);
		}, function(status) {
			return res.status(502).json(transformer.toError('questoin_save', status));
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
					return res.status(502).json(transformer.toError('entity_vote_down', status));
				});
			}else {
				question_vote_Create(true, function(){
					aQuestion.increment('upvotecount');
					aQuestion.increment('totalvotecount');
					save();
				}, function(status){
					return res.status(502).json(transformer.toError('entity_vote_up', status));
				});
			}
			//has voted true
			question.voted = 1;
			break;
		case 'undo:upvote':
			//Step 1: delete 'question_vote' connection between user and question
			//Step 2: decrement upvotecount
		    question_vote_Delete(-1 * process.config.upvotepts, function () {
				aQuestion.decrement('upvotecount');
				aQuestion.decrement('totalvotecount');
				save();
			}, function(status){
				return res.status(502).json(transformer.toError('entity_vote_up_undo', status));
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
					return res.status(502).json(transformer.toError('entity_vote_down', status));
				});
			}else {
				question_vote_Create(false, function(){
					aQuestion.increment('downvotecount');
					aQuestion.decrement('totalvotecount');
					save();
				}, function(status){
					return res.status(502).json(transformer.toError('entity_vote_down', status));
				});
			}
			//has voted false
			question.voted = -1;
			break;
		case 'undo:downvote':
			//Step 1: delete 'question_vote' connection between user and question
			//Step 2: increment upvotecount
		    question_vote_Delete(process.config.downvotepts, function () {
				aQuestion.decrement('downvotecount');
				aQuestion.increment('totalvotecount');
				save();
			}, function(status){
				return res.status(502).json(transformer.toError('entity_vote_down_undo', status));
			});
			//has remove vote
			question.voted = 0;
			break;
		case 'toggle:bookmark':
			//if question isbookmarked then create connection between user and question
			if(question.isbookmarked === true) {
				question_bookmark_Create(function() {
					question.isbookmarked = true;
					save();
				}, function(status) {
					return res.status(502).json(transformer.toError('entity_bookmark', status));
				});
			} else {
				question_bookmark_Delete(function() {
					question.isbookmarked = false;
					save();
				}, function(status) {
					return res.status(502).json(transformer.toError('entity_bookmark_undo', status));
				});
			}
			break;
	    case 'toggle:subscribe':
	        //if question isbookmarked then create connection between user and question
	        if (question.issubscribed === true) {
	            question_subscribe_Create(function () {
	                question.issubscribed = true;
	                save();
	            }, function (status) {
	                return res.status(502).json(transformer.toError('entity_subscribe', status));
	            });
	        } else {
	            question_subscribe_Delete(function () {
	                question.issubscribed = false;
	                save();
	            }, function (status) {
	                return res.status(502).json(transformer.toError('entity_subscribe_undo', status));
	            });
	        }
	        break;
		default:
			return res.status(400).json(transformer.toError('entity_invalid_action'));
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
	var Appacitive = sdk.init(state.token, state.debug);

	//get the transformer
	var transformer = require('./infra/transformer');

	//from the state of app
	//check if user is logged in or not
	if(!state.userid) return res.status(401).json(transformer.toSessionExpiredError(res));

	//creates the question and connects it with current logged in user
	var createQuestion = function() {
		var aQuestion = transformer.toAppacitiveQuestion(Appacitive, question);
		aQuestion.set('title', question.title);
		aQuestion.set('text', question.text);
		aQuestion.set('__createdby', state.userid);

		//add tags
		var tagsSplit = question.__tags.split(',');
		for (var i = 0; i < tagsSplit.length; i++) aQuestion.addTag(tagsSplit[i]);

		var shortText = question.text.substring(0, 200);
		shortText = shortText.substring(0, Math.min(shortText.length, shortText.lastIndexOf(' ')));
		aQuestion.set('shorttext', shortText);

		//creates 'entity_user' relation between user and question
		var question_user_Create = function(onsuccess, onfailure) {
			var relation = new Appacitive.ConnectionCollection({ relation: 'entity_user' });
			var connection = relation.createNewConnection({ 
			  endpoints: [{
			      article: aQuestion,
			      label: 'entity'
			  }, {
			      articleid: state.userid,
			      label: 'user'
			  }]
			});
			connection.save(onsuccess, onfailure);
		}

	    //creates 'question_subscribe' relation between question and author
		var question_subscribe_Create = function (onsuccess, onfailure) {
		    var relation = new Appacitive.ConnectionCollection({ relation: 'question_subscribe' });
		    var connection = relation.createNewConnection({
		        endpoints: [{
		            articleid: aQuestion.id(),
		            label: 'question'
		        }, {
		            articleid: state.userid,
		            label: 'user'
		        }]
		    });
		    connection.save(onsuccess, onfailure);
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
				return res.status(500).json(transformer.toError('question_save', status));		
			});
		};

        //create a connection between question and user
		question_user_Create(function () {

            //subscribe user to question
		    question_subscribe_Create();

            //connect question to tags
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
			return res.status(500).json(transformer.toError('question_save', status));		
		});
	};

	//initiate the create process
    createQuestion();
};

//Step 1: Get the question, check if owner is deleting question (important)
//Step 2: Get all the comments for the question (optional)
//Step 3: Delete the question with all connections (important)
//Step 4: Multi-Delete the comments	(optional)
//Step 5: Delete all the answers
exports.del= function(req, res) {
	var qId = req.param('id');
	if(!qId) return res.status(400).json({ messsage: 'Question Id is required' });

	//get the state of app
	var app = require('../shared/app.init');
	var state = app.init(req);

	//intialize SDK
	var sdk = require('./appacitive.init');
	var Appacitive = sdk.init(state.token, state.debug);

	//get the transformer
	var transformer = require('./infra/transformer');

	//get the answer api so that answers can be deleted
	var answerApi = require('./answer');

	if(!state.userid) return res.status(401).json(transformer.toSessionExpiredError(res));

	//get the question details
	var getQuestionDetails = function(onsuccess, onfailure) {
		var query = new Appacitive.Queries.GraphProjectQuery('question', [qId]);
		query.fetch(function (questions) {
			//if no data found
			if(!questions && questions.length == 0) return res.status(400).json({ messsage: 'Question not found' });
			
			var response = transformer.toQuestion(questions[0], state);
			var question = response.question;
			var aQuestion = new Appacitive.Article({ __id : question.__id, schema : 'entity' });
			question.answers = [];

			//get the answers according to page number
			var getAnswers = function(pagenumber) {
				aQuestion.fetchConnectedArticles({ 
				    relation : 'question_answer',
				    label: 'answer',
				    fields: ['__id'],
				    pageSize: 200
				}, function(obj, pi) {
					aQuestion.children["question_answer"].forEach(function(answer) {
						question.answers.push(answer.id());
					});
					if(pi.pagenumber * pi.pagesize >= pi.totalrecords) {
						onsuccess(response.question);
					} else getAnswers(pi.pagenumber + 1);
				}, function (obj, error) {
				    onsuccess(response.question);
				});
			};

			//fetch all the answers
			getAnswers(1);
		}, onfailure);
	};

	//delete the question with all connections
	var delete_Question = function(questionId, onsuccess, onfailure) {
		var question = new Appacitive.Article({ schema: 'entity', __id: questionId });
		question.del(onsuccess, onfailure, true);
	};

	//delete all answers
	var delete_Answers = function(answers) {
		if(!answers || answers.length === 0) return;
		for (var i = 0; i < answers.length; i++) {
			answerApi.deleteAnswer(answers[i], true, Appacitive, state, transformer, function(s) {}, function(s, m) {});
		};
	};

	//multi delete the comments
	var multi_delete_comments = function(comments) {
		if(!comments || comments.length === 0) return;

		Appacitive.Article.multiDelete({    
		    schema: 'comment',
		    ids: comments
		});
	};

	getQuestionDetails(function(question) {
		//check the ownership of question
		if(!question.isowner)
			return res.status(403).json(transformer.toError('access_denied'));

		//delete the question with all connections
		delete_Question(question.__id, function() {
			//delete the comments
			multi_delete_comments(question.comments);

			//delete answers
			delete_Answers(question.answers);

			//return empty response
			return res.status(204).json({});
		}, function(status) {
			return res.status(502).json(transformer.toError('question_delete', status));
		});
	}, function(status) {
		return res.status(502).json(transformer.toError('question_delete', status));
	});	
};