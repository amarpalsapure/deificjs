exports.findById = function(req, res) {
	var response = {
		answer: {},
		comments: [],
		users: []
	};

	var answerId = req.param('id');
	// +    vote => +1
	// -    vote => -1
	// not voted =>  0
	var voted = 0
	var voteconnid = '';
	var callCount = 2;

	//merge the responses from the parallel calls
	var merge = function(){
		if(--callCount != 0) return;

		response.answer['voteconnid'] = voteconnid;
		response.answer['voted'] = voted;
		return res.json(response);
	}

	//initialize the sdk
  	var sdk = require('./appacitive.init');
	var Appacitive = sdk.init();

	//get the transformer
	var transformer = require('./infra/transformer');

	//get the state of app
	//to check if user is logged in or not
	var app = require('../shared/app.init');
	var state = app.init(req);

	//PARALLEL CALL 1 
	//get the answer details
	var query = new Appacitive.Queries.GraphProjectQuery('answer', [answerId]);
	query.fetch(function (answers) {
		//if no data found
		if(!answers && answers.length == 0) return res.json(response);
		
		response = transformer.toAnswer(answers[0]);
		merge();
	}, function (status) {
		merge();
	});

	//PARALLEL CALL 2
	//Check if logged in user had voted the answer
	if(state.isauth) {
		Appacitive.Connection.getBetweenArticlesForRelation({
			relation: 'answer_vote',
			articleAId : state.userid, // id of logged in user
			articleBId : answerId // id of answer
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

exports.update = function(req, res) {
	var answer = req.body.answer;
	if(!answer || !answer.action) throw Error();

	//set answer id, froam param
	answer.id = answer.__id = req.param('id');

	//initialize appacitive sdk
	var sdk = require('./appacitive.init');
	var Appacitive = sdk.init();

	//get the transformer
	var transformer = require('./infra/transformer');

	//get the state of app
	//to check if user is logged in or not
	var app = require('../shared/app.init');
	var state = app.init(req);

	if(!state.userid) throw Error('Session expired');

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
			throw Error(status.message);
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