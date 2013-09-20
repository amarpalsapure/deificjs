exports.freeText = function (req, res) {
	var response = {
		entities: [],
		users: []
	}

	//validate input
	var query = req.param('q');
	if(!query || query === '') return res.json(response);

	//initialize the SDK
	var sdk = require('./appacitive.init');
	var Appacitive = sdk.init();

	//get the transformer
	var transformer = require('./infra/transformer');

	//First get the question according to the query
	//then get the question details by making a graph query call
	var orderBy = '__utcdatecreated',
		filter = "*issearchable == true and (*title like '*" + query + "*' or *text like '*" + query + "*')";

	var sort = req.query.sort;
	sort = (!sort) ? 'latest' : sort.toLowerCase();
	switch(sort) {
		case 'latest':
			break;
		case 'votes': 
			orderBy = 'totalvotecount';
			break;		
		case 'active':
			orderBy = '__utclastupdateddate';
			break;
	}

	var query = new Appacitive.Queries.FindAllQuery({
					schema : 'entity',
					fields : 'title,text,type,upvotecount,downvotecount,totalvotecount,__createdby,__utcdatecreated,__attributes',
					isAscending: false,
					orderBy: orderBy,
					filter: filter,
					pageSize: process.config.pagesize
				});

	query.fetch(function (entities, paginginfo) {
		var userIds = [];
		entities.forEach(function (entity) {
			userIds.push(entity.get('__createdby'));
		})

		//No questions found
		if(userIds.length === 0) return res.json(response);

		//Get the details for all the users
		Appacitive.Article.multiGet({ 
		    schema: 'user',
		    ids: userIds,
		    fields: ['firstname,lastname,email,$answerdowncount,$answerupcount,$correctanswercount,$questiondowncount,$questionupcount']// this denotes the fields to be returned in the article object, to avoid increasing the payload : optional
		}, function(users) { 
			//get the transformed entities
			response = transformer.toEntities(entities, paginginfo);

		    //update the entity with user information
		    users.forEach(function(user) {
		    	response.users.push(transformer.toUser(user));
		    });
		    return res.json(response);
		}, function(err) {
		    return res.status(502).json(response);
		});
		
	}, function (status) {
		return res.status(502).json(response);
	});
};