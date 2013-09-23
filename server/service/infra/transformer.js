var _toUser = function(user) {
	if(!user) return {};

	var md5 = require('MD5');

	var response = {
		'__id': user.id(),
		'firstname': user.get('firstname'),
		'lastname': user.get('lastname'),
		'gravtarurl': null,
		'reputation': 0,
		'url': ''
	};
	if(user.get('email'))
		response.gravtarurl = 'http://www.gravatar.com/avatar/' + md5(user.get('email'));

	//generate the url
	var url = '/users/' + user.id() + '/',
		subUrl = '';
	if(user.get('lastname') == '') url += _urlEncode(user.get('firstname'));
	else url += _urlEncode(user.get('firstname') + '-' + user.get('lastname'));
	response.url = process.config.host + url;

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


var _toComment = function(comment) {
	if(!comment) return {};
	var response = {
		'__id': comment.id(),
		'__utcdatecreated': comment.get('__utcdatecreated'),
		'text': comment.get('text'),
		'author': comment.get('__createdby'),
		'ishidden': false
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
	//UI will set action, when question is updated
	question.action = '';

	//generate the url
	var url = '/questions/' + question.id() + '/' + _urlEncode(question.get('title'));
	response.question.url = process.config.host + url;
	response.question.murl = process.config.host + '/q/'+ question.id();

	//get the answer count
	response.question.answercount = 0;
	if(question.aggregate('answercount')){
		response.question.answercount = question.aggregate('answercount').all;
		//delete the proerty from the JSON as it is not required by client
		delete response.question.$answercount;
	}

	//Comments
	if(question.children.comments && question.children.comments.length > 0) {
		response.question.comments = [];
		for (var i = 0; i < question.children.comments.length; i++) {
			var comment = question.children.comments[i];
			response.question.comments.push(comment.id())
			var commentJ = _toComment(comment);
			if(i >= process.config.comments) commentJ.ishidden = true;
			response.comments.push(commentJ);
		};
	}

	//Tags
	if(question.children.tags && question.children.tags.length > 0) {
		response.question.tags = [];
		question.children.tags.forEach(function(tag){
			response.question.tags.push(tag.id())
			response.tags.push(_toTag(tag));
		});			
	}
	
	//Question Author
	if(question.children.author && question.children.author.length > 0) {
		var author = _toUser(question.children.author[0]);
		response.question.author = author['__id'];
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

var _toQuestions = function(questions, paginginfo) {
	var response = {
		questions: [],
		comments: [],
		users: [],
		tags: []
	};

	//set the paginginfo
	if(paginginfo) {
		response.meta = {
			paginginfo: paginginfo
		};
	}

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
	//UI will set action, when answer is updated
	answerJ.action = '';
	response.answer.iscorrect = answer.get('score') == 1;
	delete answerJ.score;
	response.answer = answerJ;

	//Comments
	if(answer.children.comments && answer.children.comments.length > 0) {
		response.answer.comments = [];
		for (var i = 0; i < answer.children.comments.length; i++) {
			var comment = answer.children.comments[i];
			response.answer.comments.push(comment.id())
			var commentJ = _toComment(comment);
			if(i >= process.config.comments) commentJ.ishidden = true;
			response.comments.push(commentJ);
		};
	}
	
	//answer author
	if(answer.children.author && answer.children.author.length > 0) {
		var author = _toUser(answer.children.author[0]);
		response.answer.author = author['__id'];
		response.users.push(author);
	}
				
	return response;
};
exports.toAnswer = _toAnswer;

var _toEntities = function(entities, paginginfo) {
	var response = {
		entities: [],
		users: []
	};

	//set paging info if it is available
	if(paginginfo) {
		response.meta = {
			paginginfo : paginginfo
		};
	}

	entities.forEach(function(entity) {
		var jEntity = entity.toJSON();

		//set the title for answer as question title from it's attribute
		if(jEntity.type != 'question') jEntity.title = entity.attr('title');

		//set the url
		if(jEntity.type === 'question') 
			jEntity.url = process.config.host + '/questions/' 
						+ entity.id() + '/' + _urlEncode(entity.get('title'));
		else
			jEntity.url = process.config.host + '/questions/' 
						+ entity.attr('question') + '/' + _urlEncode(entity.attr('title'))
						+ '#' + entity.id();

		//set the author
		jEntity.author = jEntity.__createdby;

		if(jEntity.text.length > 250) {
			jEntity.text = jEntity.text.substring(0, 250);
			jEntity.text = jEntity.text.substring(0, Math.min(jEntity.text.length, jEntity.text.lastIndexOf(' ')));
		}

		//delete unrequired properties, so that payload is less
		delete jEntity.__schematype;
		delete jEntity.__attributes;
		delete jEntity.__tags;
		delete jEntity.__createdby;

		response.entities.push(jEntity);
	});

	return response;
};
exports.toEntities = _toEntities;

var _to_Appacitive_Question = function(Appacitive, question) {
	return new Appacitive.Article({
		__id: question.id,
		__schematype: 'entity',
		type: 'question'
	});
};
exports.toAppacitiveQuestion = _to_Appacitive_Question;

var _to_Appacitive_Answer = function(Appacitive, answer) {
	return new Appacitive.Article({
		__id: answer.id,
		__schematype: 'entity',
		type: 'answer'
	});
};
exports.toAppacitiveAnswer = _to_Appacitive_Answer;



//private functions (for local use)
var _toInt = function(number) { 
	if(!number || number == '' || isNaN(number)) return 0;
	return parseInt(number, 10);
}

var _urlEncode = function(text) {
	if(!text) return '';
	text = text.replace(/ /g, '-').replace(/\//g,'-').replace(/[^a-zA-Z/-]/g, '');
	while(text.indexOf('--') != -1){
		text = text.replace(/--/,'-');
	}
	return text.toLowerCase();
};
