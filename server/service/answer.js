exports.findById = function(req, res) {
	var response = {
		answer: {},
		comments: [],
		users: []
	};

  	var sdk = require('./appacitive.init');
	var Appacitive = sdk.init();

	var transformer = require('./infra/transformer');

	var query = new Appacitive.Queries.GraphProjectQuery('answer', [req.param('id')]);
	query.fetch(function (answers) {
		//if no data found
		if(!answers && answers.length == 0) return res.json(response);
		
		return res.json(transformer.toAnswer(answers[0]));
	}, function (status) {
		res.json(response);
	});	
};