exports.freeText = function (req, res) {
	var response = {
		entities: []
	}

	//validate input
	var query = res.param('q');
	if(!query || query === '') return res.json(response);

	//initialize the SDK
	var sdk = require('./appacitive.init');
	var Appacitive = sdk.init();

	//get the transformer
	var transformer = require('./infra/transformer');

	//First get the question according to the query
	//then get the question details by making a graph query call
	var orderBy = '__utcdatecreated',
		filter = "*issearchable == true and *type == 'question'";

	var sort = req.query.sort;
	sort = (!sort) ? 'popular' : sort.toLowerCase();
	switch(sort) {
		case 'popular': 
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
					fields : 'title,text,__utcdatecreated: ',
					isAscending: false,
					orderBy: orderBy,
					filter: filter,
					pageSize: process.config.pagesize
				});

	query.fetch(function (questions, pi) {
		questions.forEach(function (question) {
			questionIds.push(question.id());
		})

		//No questions found
		if(questionIds.length === 0) return res.json(response);

		//Get the question details
		var query = new Appacitive.Queries.GraphProjectQuery('questions', questionIds);
		query.fetch(function (gQuestions) {
			//if no data found
			if(gQuestions && gQuestions.length > 0) response = transformer.toQuestions(gQuestions);
			
			return res.json(response);
		}, function (status) {
			return res.json(response);
		});	
	}, function (status) {
		return res.json(response);
	});
};