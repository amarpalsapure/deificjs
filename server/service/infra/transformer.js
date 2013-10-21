var _toUser = function(user) {
	if(!user) return {};

	var md5 = require('MD5');

	var response = {
		'__id': user.id(),
		'firstname': user.get('firstname'),
		'lastname': user.get('lastname'),
        'about': user.get('about'),
		'gravtarurl': null,
		'reputation': 0,
		'url': '',
		'__utcdatecreated': _toISODateFormat(user.get('__utcdatecreated'))
	};
	if(user.get('email'))
		response.gravtarurl = 'http://www.gravatar.com/avatar/' + md5(user.get('email'));

	//generate the url
	var url = '/users/' + user.id() + '/',
		subUrl = '';
	if(user.get('lastname') == '') url += _urlEncode(user.get('firstname'));
	else url += _urlEncode(user.get('firstname') + '-' + user.get('lastname'));
	response.url = process.config.host + url;

	var entitydowncount = 0,
		entityupcount = 0,
		correctanswercount = 0;
		
	if(user.aggregate('entitydowncount')) entitydowncount = user.aggregate('entitydowncount').all;
	if(user.aggregate('entityupcount')) entityupcount = user.aggregate('entityupcount').all;
	if(user.aggregate('correctanswercount')) correctanswercount = user.aggregate('correctanswercount').all;

	response.reputation = (_toInt(entityupcount) * process.config.upvotepts) -
						  (_toInt(entitydowncount) * process.config.downvotepts) +
						  (_toInt(correctanswercount) * process.config.answerpts);

	return response;
};
exports.toUser = _toUser;

var _toUsers = function(users, paginginfo) {
	var response = {
		users: []
	};

	//set the paginginfo
	if(paginginfo) {
		response.meta = {
			paginginfo: paginginfo
		};
	}

	//translate each tag
	users.forEach(function(user) {
		response.users.push(_toUser(user));
	});

	return response;
};
exports.toUsers = _toUsers;

var _toComment = function(comment, state) {
	if(!comment) return {};
	var response = {
		'__id': comment.id(),
		'__utcdatecreated': _toISODateFormat(comment.get('__utcdatecreated')),
		'text': comment.get('text'),
		'author': comment.get('__createdby'),
		'ishidden': false
	};

	if(state) response.isowner = response.author === state.userid;

	return response;
};

var _toTag = function(tag) {
	var response = {
		'__id': tag.id(),
		'name': tag.get('name'),
		'excerpt': tag.get('excerpt'),
		'description': tag.get('description'),
		'__utcdatecreated': _toISODateFormat(tag.get('__utcdatecreated')),
		'questioncount': 0
	};

	if(tag.aggregate('questioncount')) response.questioncount = _toInt(tag.aggregate('questioncount').all);

	return response;
};
exports.toTag = _toTag;

var _toTags = function(tags, paginginfo) {
	var response = {
		tags: []
	};

	//set the paginginfo
	if(paginginfo) {
		response.meta = {
			paginginfo: paginginfo
		};
	}

	//translate each tag
	tags.forEach(function(tag) {
		response.tags.push(_toTag(tag));
	});

	return response;
};
exports.toTags = _toTags;

var _toQuestion = function(question, state) {
	var response = {
		question: {},
		comments: [],
		users: [],
		tags: []
	};

	if(!question)  return response;

	response.question = question.toJSON();
	response.question.__utcdatecreated = _toISODateFormat(question.get('__utcdatecreated'));
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

	//Question Bookmark
	response.question.bookmarkcount = 0;
	if(question.aggregate('bookmarkcount')){
		response.question.bookmarkcount = _toInt(question.aggregate('bookmarkcount').all);
		//delete the proerty from the JSON as it is not required by client
		delete response.question.$bookmarkcount;
	}

	//Comments
	if(question.children.comments && question.children.comments.length > 0) {
		response.question.comments = [];
		for (var i = 0; i < question.children.comments.length; i++) {
			var comment = question.children.comments[i];
			response.question.comments.push(comment.id())
			var commentJ = _toComment(comment, state);
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
		if(state) response.question.isowner = author['__id'] === state.userid;
		response.users.push(author);
	}

	//Correct Answer
	if(question.children.answer && question.children.answer.length > 0) {
		response.question.correctanswer = question.children.answer[0].toJSON();
		delete response.question.correctanswer.__schematype;
		delete response.question.correctanswer.__attributes;
		delete response.question.correctanswer.__tags;
	}

    //question is voted or not
	if(question.children.vote && question.children.vote.length > 0) {
		response.question['voteconnid'] = question.children.vote[0].connection.id();
		response.question['voted'] = question.children.vote[0].connection.get('isupvote', 'boolean') ? 1 : -1;
	} else {
		response.question['voted'] = 0;
		response.question['voteconnid'] = '';
	}

    //question is bookmarked or not
	if(question.children.bookmark && question.children.bookmark.length > 0) {
		response.question['isbookmarked'] = true;
		response.question['bookmarkconnid'] = question.children.bookmark[0].connection.id();;
	} else {
		response.question['isbookmarked'] = false;
		response.question['bookmarkconnid'] = '';
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

		for (var i = 0; i < questionResponse.users.length; i++){
			if(response.users.length === 0) response.users.push(questionResponse.users[i]);
			else {
				var exists = false;
				for (var j = 0; j < response.users.length; j++) {
					if(response.users[j]['__id'] === questionResponse.users[i]['__id']) {
						exists = true;
						break;
					}
				}
				if(exists === false) response.users.push(questionResponse.users[i]);	
			}
		}

		for (var i = 0; i < questionResponse.tags.length; i++)
			if(response.tags.length === 0) response.tags.push(questionResponse.tags[i]);
			else {
				var exists = false;
				for (var j = 0; j < response.tags.length; j++) {
					if(response.tags[j]['__id'] === questionResponse.tags[i]['__id']) {
						exists = true;
						break;
					}
				}
				if(exists === false) response.tags.push(questionResponse.tags[i]);	
			}
	});
	return response;
};
exports.toQuestions = _toQuestions;

var _toAnswer = function(answer, state) {
	var response = {
		answer: {},
		comments: [],
		users: []
	};

	var answerJ = answer.toJSON();
	answerJ.__utcdatecreated = _toISODateFormat(answer.get('__utcdatecreated'));
	delete answerJ.__schematype;
	delete answerJ.__attributes;
	delete answerJ.__tags;
	//UI will set action, when answer is updated
	answerJ.action = '';
	response.answer = answerJ;
	response.answer.iscorrectanswer = answer.get('score') === '1';
	delete answerJ.score;

	//Question and miniurl for answer
	if(answer.children.question && answer.children.question.length > 0) {
		response.answer.question = answer.children.question[0].id();
		response.answer.murl = process.config.host + '/a/'+ response.answer.question + '/' + answer.id();
	}

	//Comments
	if(answer.children.comments && answer.children.comments.length > 0) {
		response.answer.comments = [];
		for (var i = 0; i < answer.children.comments.length; i++) {
			var comment = answer.children.comments[i];
			response.answer.comments.push(comment.id())
			var commentJ = _toComment(comment, state);
			if(i >= process.config.comments) commentJ.ishidden = true;
			response.comments.push(commentJ);
		};
	}
	
	//answer author
	if(answer.children.author && answer.children.author.length > 0) {
		var author = _toUser(answer.children.author[0]);
		response.answer.author = author['__id'];
		if(state) response.answer.isowner = author['__id'] === state.userid;
		response.users.push(author);
	}

	//answer question
	if(answer.children.question && answer.children.question.length > 0) {
		response.answer.question = answer.children.question[0]['__id'];
	}

    //answer is voted or not
	if (answer.children.vote && answer.children.vote.length > 0) {
	    response.answer['voteconnid'] = answer.children.vote[0].connection.id();
	    response.answer['voted'] = answer.children.vote[0].connection.get('isupvote', 'boolean') ? 1 : -1;
	} else {
	    response.answer['voted'] = 0;
	    response.answer['voteconnid'] = '';
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
		var jEntity;
		if(entity.get('type') === 'question') jEntity = _toQuestion(entity).question;
		else jEntity = _toAnswer(entity).answer;

		jEntity.type = entity.get('type');

		//in get connected vote calls fron user api, entity has connection
		if(entity.connection && entity.connection.get('isupvote')) {
		    jEntity.isupvote = entity.connection.get('isupvote', 'boolean');
		    jEntity.votedon = _toISODateFormat(entity.get('__utcdatecreated'));
		}

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

		if(jEntity.text) {
			if(jEntity.text.length > 250) {
				jEntity.text = jEntity.text.substring(0, 250);
				jEntity.text = jEntity.text.substring(0, Math.min(jEntity.text.length, jEntity.text.lastIndexOf(' ')));
			}
		} else if(!jEntity.text && jEntity.shorttext) jEntity.text = jEntity.shorttext;

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

var _to_Appacitive_User = function (Appacitive, user) {
    return new Appacitive.User({
        __id: user.id
    });
};
exports.toAppacitiveUser = _to_Appacitive_User;

// ASSUMPTION //
//if status object is not provided, it means user has provided in valid input
var _toError = function(origin, status) {
	if(!status) status = {
					code: '56789', //this code value is handled differently on client side
					message: 'status object not provided',
  					faulttype: null,
  					version: '1.0',
  					referenceid: 'notavailble',
  					additionalmessages: []
				};
	var errorMap = {
	    default: 'Something went wrong.',
		question_not_found: 'Question not found, it might be deleted.',
		question_save: 'Failed to save the question.',
		question_find_all: 'Looks like something has broken.',
		question_find_tag_no_tag: 'Some error occurred during fetching tag',
		question_find_tag_no_question: 'Some error occurred during fetching question',
		question_find_tag_no_user: 'Some error occurred during fetching user for the question',
		questoin_save: 'Failed to save the question.',
		question_delete: 'Failed to delete the question.',
		entity_find_all: 'Looks like something has broken.',
		entity_vote_up: 'Failed to register upvote',
		entity_vote_up_undo: 'Failed to undo register upvote',
		entity_vote_down: 'Failed to register downvote',
		entity_vote_down_undo: 'Failed to undo register downvote',
		entity_bookmark: 'Failed to bookmark the question',
		entity_bookmark_undo: 'Failed to undo bookmark the question',
		entity_invalid_action: 'Invalid action provided',
		access_denied: 'You are not authorized for this action.',
		user_signup_validate: 'Name, Email and Password are required.',
		user_signup: 'Failed to sign up.',
		user_login_validate: 'Email and Password are required.',
		user_login: 'Authentication failed',
		user_fb_login_validate: 'Access token is required.',
		user_find: 'User not found',
		user_recover_validate: 'Email address is required',
		user_recover: 'Failed to recover the password. Please try again.',
		comment_save: 'Failed to save the comment.',
		comment_delete: 'Failed to delete the comment.',
		answer_save: 'Failed to save the answer.',
		answer_delete: 'Failed to delete the answer.',
		answer_accept: 'Failed to accept the answer',
		answer_accept_undo: 'Failed to undo accepted answer',
		tag_find: 'Tag not found',
		user_pwd_reset: 'Failed to reset password.',
	    user_update: 'Failed to update profile.',
	};
	var message = errorMap[origin];
	if(!message) message = errorMap['default'];

	if (status.code === '19036') message = 'Your session has expired, please <a href="/users/login?returnurl=PATHNAME">login</a> again. Thanks.';
	if (status.code === '25001') message = 'Old password is invalid';
	if(origin === 'user_signup' && status.code === '600') message = 'Account already exists for given email address.';

	status.referenceid = status.referenceid || 'notavailble';
	status.error = message;
	return status;
};
exports.toError = _toError;

var _toSessionExpiredError = function(res, status) {
	//clear the session cookie (if any)
	if(res) res.clearCookie('u');

	//if status is not provided, create one
	if(!status) status = {
		code: '19036',
		message: 'Session expired'
	}

	status.error = 'Your session has expired, please <a href="/users/login?returnurl=PATHNAME">login</a> again. Thanks.';
	return status;
};
exports.toSessionExpiredError = _toSessionExpiredError;

var _toISODateFormat = function(dateString) {
	if(isNaN(new Date(dateString))) return dateString;
	return dateString.substring(0, dateString.lastIndexOf('.')) + 'Z';
};
exports.toISODateFormat = _toISODateFormat;

//private functions (for local use)
var _toInt = function(number) { 
	if(!number || number == '' || isNaN(number)) return 0;
	return parseInt(number, 10);
};

var _urlEncode = function(text) {
	if(!text) return '';
	text = text.replace(/ /g, '-').replace(/\//g,'-').replace(/[^a-zA-Z/-]/g, '');
	while(text.indexOf('--') != -1){
		text = text.replace(/--/,'-');
	}
	return text.toLowerCase();
};