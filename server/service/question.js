exports.findAll = function(req, res) {
	var sdk = require('./appacitive.init');
	var Appacitive = sdk.init();

	var query = new Appacitive.Queries.FindAllQuery({
		schema : 'question',
		fields: ['title']
	});
	query.fetch(function (questions) {
		var q  =[];
		questions.forEach(function (question) {
			q.push(question.toJSON());
			//q.push({
			//	id: question.get('__id'),
			//	title : question.get('title')
			//});
		})

		res.json({ questions: q });
	}, function (status) {
		res.json(status);
	});	
};

exports.findById = function(req, res) {
	var response = {
		question: {},
		comments: [],
		users: []
	};
	var answersMeta = [];

	var callCount = 2;

	var merge = function(){
		if(--callCount != 0) return;
		response.question['answers_meta'] = answersMeta;
		return res.json(response);
	};

	//initialize the SDK
  	var sdk = require('./appacitive.init');
	var Appacitive = sdk.init();

	var transformer = require('./infra/transformer');

	//Get the quesiton details
	var query = new Appacitive.Queries.GraphProjectQuery('question', [req.param('id')]);
	query.fetch(function (questions) {
		//if no data found
		if(!questions && questions.length == 0) return res.json(response);
		
		var question = questions[0]
		response = transformer.toQuestion(question);
		merge();

		//update the view count, fire and forget save call
		//question.increment('viewcount').save();

	}, function (status) {
		merge();
	});	

	//Get the answers
	var question = new Appacitive.Article({ __id : req.param('id'), schema : 'question' });
	question.fetchConnectedArticles({ 
	    relation: 'question_answer',
	    orderBy: 'upvotecount',
	    pageSize: 10,
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
};