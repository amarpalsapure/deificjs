exports.find = function(req, res) {
	var response = {
		tags: [],
		total: 0
	};

	var term = req.param('q');
	var pageSize = req.param('ps');
	if(isNaN(pageSize)) pageSize = process.config.pagesize;

	//get the state of app
	var app = require('../shared/app.init');
	var state = app.init(req);

	//initialize the sdk
  	var sdk = require('./appacitive.init');
	var Appacitive = sdk.init(state.debug);

	//get the transformer
	var transformer = require('./infra/transformer');

	//search for matching tags
	var query = new Appacitive.Queries.FindAllQuery({
						schema : 'tag',
						fields : 'name,description,$questioncount',
						isAscending: false,
						filter: "(*name like '"+ term +"*')",
						pageSize: pageSize
					});

	query.fetch(function (tags, pi) {
		tags.forEach(function (tag) {
			response.tags.push(transformer.toTag(tag));
		});
		response.total = pi.totalrecords;
		return res.json(response);
	}, function (status) {
		return res.status(502).json({message: status.message});
	});
};

exports.update = function(req, res) {
	var answer = req.body.answer;
	if(!answer || !answer.action) return res.status(400).json(req.body.answer);

	//set answer id, froam param
	answer.id = answer.__id = req.param('id');

	//get the state of app
	//to check if user is logged in or not
	var app = require('../shared/app.init');
	var state = app.init(req);

	if(!state.userid) return res.status(401).json(req.body.answer);

	//initialize appacitive sdk
	var sdk = require('./appacitive.init');
	var Appacitive = sdk.init(state.debug);

	//get the transformer
	var transformer = require('./infra/transformer');

	var aAnswer = transformer.toAppacitiveAnswer(Appacitive, answer);

	//creates 'answer_vote' relation between user and answer 
	var answer_vote_Create = function(isupvote, onsuccess, onfailure) {
		var relation = new Appacitive.ConnectionCollection({ relation: 'answer_vote' });
		var connection = relation.createNewConnection({ 
		  endpoints: [{
		      articleid: answer.id,
		      label: 'answer'
		  }, {
		      articleid: state.userid,
		      label: 'user'
		  }],
		  isupvote: isupvote
		});
		connection.save(function(){
			answer.voteconnid = connection.id();
			onsuccess();
		}, onfailure);
	}

	//updates 'answer_vote' relation between user and answer 
	var answer_vote_Update = function(isupvote, onsuccess, onfailure) {
		var relation = new Appacitive.Connection({ relation: 'answer_vote', __id: answer.voteconnid });
		relation.set('isupvote', isupvote);
		relation.save(onsuccess, onfailure);
	}

	//deletes 'answer_vote' relation between user and answer 
	var answer_vote_Delete = function(onsuccess, onfailure) {
		var relation = new Appacitive.Connection({ relation: 'answer_vote', __id: answer.voteconnid });
		relation.del(function() {
			answer.voteconnid = '';
			onsuccess();
		}, onfailure);
	}

	//saves the answer object on appacitive api
	var save = function() {
		aAnswer.save(function(){
			//transform the object
			delete answer.id;
			var response = transformer.toAnswer(aAnswer);
			response.answer.author = answer.author;
			response.answer.comments = answer.comments;
			response.answer.tags = answer.tags;
			response.answer.voted = answer.voted;
			response.answer.voteconnid = answer.voteconnid;
			return res.json(response);
		}, function(status) {
			return res.status(424).json(req.body.answer);
		});
	};

	//depending upon the action, perform the update
	switch(answer.action) {
		case 'do:upvote':
			//Step 1.0: check if connectionid exists, if yes means user has switched vote
			//Step 1.1: update the connection, and increment upvotecount and decrement downvotecount
			//Step 2.0: else create 'answer_vote' connection between user and answer
			//Step 2.1: decrement upvotecount
			if(answer.voteconnid != ''){
				answer_vote_Update(true, function(){
					aAnswer.increment('upvotecount');
					aAnswer.decrement('downvotecount');
					aAnswer.increment('totalvotecount', 2);
					save();
				}, function(status){
					throw Error('Failed to register downvote');
				});
			}else {
				answer_vote_Create(true, function(){
					aAnswer.increment('upvotecount');
					aAnswer.increment('totalvotecount');
					save();
				}, function(status){
					throw Error('Failed to register upvote');
				});
			}
			//has voted true
			answer.voted = 1;
			break;
		case 'undo:upvote':
			//Step 1: delete 'answer_vote' connection between user and answer
			//Step 2: decrement upvotecount
			answer_vote_Delete(function(){
				aAnswer.decrement('upvotecount');
				aAnswer.decrement('totalvotecount');
				save();
			}, function(status){
				throw Error('Failed to undo register upvote');
			});
			//has removed vote
			answer.voted = 0;
			break;
		case 'do:downvote':
			//Step 1.0: check if connectionid exists, if yes means user has switched vote
			//Step 1.1: update the connection, and decrement upvotecount and increment downvotecount
			//Step 2.0: else create 'answer_vote' connection between user and answer
			//Step 2.1: decrement upvotecount
			if(answer.voteconnid != ''){
				answer_vote_Update(false, function(){
					aAnswer.decrement('upvotecount');
					aAnswer.increment('downvotecount');
					aAnswer.decrement('totalvotecount', 2);
					save();
				}, function(status){
					throw Error('Failed to register downvote');
				});
			}else {
				answer_vote_Create(false, function(){
					aAnswer.increment('downvotecount');
					aAnswer.decrement('totalvotecount');
					save();
				}, function(status){
					throw Error('Failed to register downvote');
				});
			}
			//has voted false
			answer.voted = -1;
			break;
		case 'undo:downvote':
			//Step 1: delete 'answer_vote' connection between user and answer
			//Step 2: increment upvotecount
			answer_vote_Delete(function(){
				aAnswer.decrement('downvotecount');
				aAnswer.increment('totalvotecount');
				save();
			}, function(status){
				throw Error('Failed to undo register downvote');
			});
			//has remove vote
			answer.voted = 0;
			break;
		default:
			throw Error('Invalid action provided');
	}
};

//Step 1: Save the Answer and connect user to answer
//Step 2: Create connection of Answer with question
exports.save = function(req, res) {
	var answer = req.body.answer;
	if(!answer || !answer.action) return res.status(400).json(req.body.answer);

	//get the state of app
	//to check if user is logged in or not
	var app = require('../shared/app.init');
	var state = app.init(req);

	if(!state.userid) return res.status(401).json(req.body.answer);

	//initialize appacitive sdk
	var sdk = require('./appacitive.init');
	var Appacitive = sdk.init(state.debug);

	//get the transformer
	var transformer = require('./infra/transformer');

	//perform a basic transform
	var aAnswer = transformer.toAppacitiveAnswer(Appacitive, answer);
	aAnswer.set('text', answer.text);

	//STEP 1: Save the Answer and connect user to answer
	var userRelation = new Appacitive.ConnectionCollection({ relation: 'answer_user' });
	var userConnection = userRelation.createNewConnection({ 
	  endpoints: [{
	      article: aAnswer,
	      label: 'answer'
	  }, {
	      articleid: state.userid,
	      label: 'user'
	  }]
	});
	userConnection.save(function(){
		//STEP 2: Create connection of Answer with question
		var questionRelation = new Appacitive.ConnectionCollection({ relation: 'question_answer' });
		var questionConnection = questionRelation.createNewConnection({ 
		  endpoints: [{
		      articleid: answer.question,
		      label: 'question'
		  }, {
	       	  article: aAnswer,
		      label: 'answer'
		  }]
		});
		questionConnection.save(function(){
			var response = transformer.toAnswer(aAnswer);
			response.answer.author = state.userid;
			response.answer.question = answer.question;
			return res.json(response);
		}, function(status){
			//Rollback the answer
			aAnswer.del(function(){}, function(){}, true);
			return res.status(500).json({ message: 'Unable to save answer' });
		})
	}, function(status){
		return res.status(500).json({ message: 'Unable to save answer' });
	});
};