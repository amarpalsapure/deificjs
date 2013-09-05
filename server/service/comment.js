exports.save = function(req, res) {
	var payload = req.body.comment;

	var sdk = require('./appacitive.init');
	var Appacitive = sdk.init();

	var app = require('../shared/app.init');
	var state = app.init(req);

	if(!state.userid) throw new Error('Session expired');

	var relation = 'answer_comment';
	var label = 'answer';
	var articleid = payload.answer_id;
	var comment = new Appacitive.Article({
		schema: 'comment',
		text: payload.text,
		__createdby: state.userid
	});

	var response = {
		comment: {}
	};


	//check if comment is for question
	if(payload.question_id){
		relation = 'question_comment';	
		label = 'question';
		articleid = payload.question_id;
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
		response.comment.author_id = state.userid;

		//Set the parent, either question or answer
		if(payload.question_id) response.comment.question_id = payload.question_id;
		else response.comment.answer_id = payload.answer_id;

		return res.json(response);
	}, function(status){
		throw new Error();
	});	
};