var _toUser = function(user) {
	if(!user) return {};

	var md5 = require('MD5');

	var response = {
		'__id': user.id(),
		'firstname': user.get('firstname'),
		'lastname': user.get('lastname'),
		'gravtarurl': null,
		'reputation': 0
	};
	if(user.get('email'))
		response.gravtarurl = 'http://www.gravatar.com/avatar/' + md5(user.get('email'));

	var answerdowncount = 0,
		answerupcount = 0,
		correctanswercount = 0,
		questiondowncount = 0,
		questionupcount = 0;

	if(user.aggregate('answerdowncount')) answerdowncount = user.aggregate('answerdowncount').all;
	if(user.aggregate('answerupcount')) answerupcount = user.aggregate('answerupcount').all;
	if(user.aggregate('correctanswercount')) correctanswercount = user.aggregate('correctanswercount').all;
	if(user.aggregate('questiondowncount')) questiondowncount = user.aggregate('questiondowncount').all;
	if(user.aggregate('questionupcount')) questionupcount = user.aggregate('questionupcount').all;

	response.reputation = ((_toInt(answerupcount) + _toInt(questionupcount)) * process.config.upvotepts) -
						  ((_toInt(answerdowncount) + _toInt(questiondowncount)) * process.config.downvotepts) +
						  (_toInt(correctanswercount) * process.config.answerpts);

	return response;
};
exports.toUser = _toUser;
var _toInt = function(number) { 
	if(isNaN(number)) return 0;
	return parseInt(number, 10);
}

var _toComment = function(comment) {
	if(!comment) return {};
	var response = {
		'__id': comment.id(),
		'__utcdatecreated': comment.get('__utcdatecreated'),
		'text': comment.get('text'),
		'author_id': comment.get('__createdby')
	};

	return response;
};

var _toTag = function(tag) {
	var response = {
		'__id': tag.id(),
		'name': tag.get('name'),
		'description': tag.get('description'),
		'questioncount': 0
	};

	if(tag.aggregate('questioncount')) response.questioncount = tag.aggregate('questioncount').all;

	return response;
};
exports.toTag = _toTag;

var _toQuestion = function(question) {
	var response = {
		question: {},
		comments: [],
		users: [],
		tags: []
	};

	if(!question)  return response;

	response.question = question.toJSON();
	delete response.question.__schematype;
	delete response.question.__attributes;
	delete response.question.__tags;

	//get the answer count
	response.question.answercount = 0;
	if(question.aggregate('answercount')){
		response.question.answercount = question.aggregate('answercount').all;
		//delete the proerty from the JSON as it is not required by client
		delete response.question.$answercount;
	}

	//Comments
	if(question.children.comments && question.children.comments.length > 0) {
		response.question.comment_ids = [];
		question.children.comments.forEach(function(comment){
			response.question.comment_ids.push(comment.id())
			response.comments.push(_toComment(comment));
		});
	}

	//Tags
	if(question.children.tags && question.children.tags.length > 0) {
		response.question.tag_ids = [];
		question.children.tags.forEach(function(tag){
			response.question.tag_ids.push(tag.id())
			response.tags.push(_toTag(tag));
		});			
	}
	
	//Question Author
	if(question.children.author && question.children.author.length > 0) {
		var author = _toUser(question.children.author[0]);
		response.question.author_id = author['__id'];
		response.users.push(author);
	}

	//Correct Answer
	if(question.children.answer && question.children.answer.length > 0) {
		response.question.correctanswer = question.children.answer[0].toJSON();
		delete response.question.correctanswer.__schematype;
		delete response.question.correctanswer.__attributes;
		delete response.question.correctanswer.__tags;
	}
	return response;
};
exports.toQuestion = _toQuestion;

var _toQuestions = function(questions) {
	var response = {
		questions: [],
		comments: [],
		users: [],
		tags: []
	};

	questions.forEach(function(question) {
		var questionResponse = _toQuestion(question);
		if(!questionResponse) return;
		questionResponse.question.text = questionResponse.question.shorttext;
		response.questions.push(questionResponse.question);
		
		for (var i = 0; i < questionResponse.comments.length; i++) 
			response.comments.push(questionResponse.comments[i]);

		for (var i = 0; i < questionResponse.users.length; i++)
			response.users.push(questionResponse.users[i]);

		for (var i = 0; i < questionResponse.tags.length; i++)
			response.tags.push(questionResponse.tags[i]);
	});
	return response;
};
exports.toQuestions = _toQuestions;

var _toAnswer = function(answer) {
	var response = {
		answer: {},
		comments: [],
		users: []
	};

	var answerJ = answer.toJSON();
	delete answerJ.__schematype;
	delete answerJ.__attributes;
	delete answerJ.__tags;
	response.answer.iscorrect = answer.get('score') == 1;
	delete answerJ.score;
	response.answer = answerJ;

	//Comments
	response.comments = [];
	response.answer.comment_ids = [];
	answer.children.comments.forEach(function(comment){
		response.answer.comment_ids.push(comment.id())
		response.comments.push(_toComment(comment));
	});
	
	//answer author
	var author = _toUser(answer.children.author[0]);
	response.answer.author_id = author['__id'];
	response.users.push(author);
				
	return response;
};
exports.toAnswer = _toAnswer;