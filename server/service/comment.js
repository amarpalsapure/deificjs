exports.save = function(req, res) {
	var payload = req.body.comment;

	//get the state of app
	var app = require('../shared/app.init');
	var state = app.init(req);

	//intialize SDK
	var sdk = require('./appacitive.init');
	var Appacitive = sdk.init(state.debug);

	if(!state.userid) return res.status(401).json({ message: 'Session expired' });

	var relation = 'answer_comment';
	var label = 'answer';
	var articleid = payload.answer;
	var comment = new Appacitive.Article({
		schema: 'comment',
		text: payload.text,
		__createdby: state.userid
	});

	var response = {
		comment: {}
	};


	//check if comment is for question
	if(payload.question){
		relation = 'question_comment';	
		label = 'question';
		articleid = payload.question;
	}

	var relation = new Appacitive.ConnectionCollection({ relation: relation });

	// setup the connection
	var connection = relation.createNewConnection({ 
	  endpoints: [{
	      articleid: articleid,
	      label: label
	  }, {
	      article: comment,
	      label: 'comment'
	  }]
	});
	connection.save(function(){
		response.comment = comment.toJSON();

		//Set the author
		response.comment.author = state.userid;
		response.comment.isowner = true;

		//Set the parent, either question or answer
		if(payload.question) response.comment.question = payload.question;
		else response.comment.answer = payload.answer;

		return res.json(response);
	}, function(status){
		return res.status(502).json({ messsage: 'Unable to save the comment.' });
	});
};

exports.del = function(req, res) {
	//get the state of app
	var app = require('../shared/app.init');
	var state = app.init(req);

	//intialize SDK
	var sdk = require('./appacitive.init');
	var Appacitive = sdk.init(state.debug);

	if(!state.userid) return res.status(401).json({ message: 'Session expired' });

	var aComment = new Appacitive.Article({ __id : req.param('id'), schema : 'comment' });
	aComment.del(function(){
		return res.status(204).json({});
	}, function(){
		return res.status(502).json({ messsage: 'Unable to delete the comment.' });
	}, true); //delete the connection also
};