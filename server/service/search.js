exports.search = function(req, res) {
	var response = {
		entities: [],
		users: []
	}

	//validate input
	var query = req.param('q');
	if(!query || query === '') return res.json(response);

	//get the state of app
	var app = require('../shared/app.init');
	var state = app.init(req);

	//initialize the SDK
	var sdk = require('./appacitive.init');
	var Appacitive = sdk.init(state.debug);

	//get the transformer
	var transformer = require('./infra/transformer');

	//First get the question according to the query
	//then get the question details by making a graph query call
	query = encodeURIComponent(query);
	var orderBy = '__utcdatecreated',
		filter = "*issearchable==true and (*title like '*" + query + "*' or *text like '*" + query + "*')",
		pagenumber = req.param('page');

	if(!pagenumber) pagenumber = 1;

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

	var findAllEntities = function(onsuccess, onfailure) {
		var query = new Appacitive.Queries.FindAllQuery({
					schema : 'entity',
					fields : 'title,text,type,isanswered,totalvotecount,__createdby,__utcdatecreated,__attributes',
					isAscending: false,
					orderBy: orderBy,
					filter: filter,
					pageNumber: pagenumber,
					pageSize: process.config.pagesize
				});
		query.fetch(onsuccess, onfailure);
	};

	var multiGetUsers = function(userIds, onsuccess, onfailure) {
		Appacitive.Article.multiGet({ 
		    schema: 'user',
		    ids: userIds,
		    fields: ['firstname,lastname,email,$entitydowncount,$entityupcount,$correctanswercount']
		}, onsuccess, onfailure);
	};

	findAllEntities(function(entities, paginginfo) {
		var userIds = [];
		entities.forEach(function (entity) {
			userIds.push(entity.get('__createdby'));
		})

		//No questions found
		if(userIds.length === 0) return res.json(response);

		multiGetUsers(userIds, function(users){
			//get the transformed entities
			response = transformer.toEntities(entities, paginginfo);

		    //update the entity with user information
		    users.forEach(function(user) {
		    	response.users.push(transformer.toUser(user));
		    });
		    return res.json(response);
		}, function(status){
			return res.status(502).json(transformer.toError('entity_find_all', status));
		});
	}, function(status){
		return res.status(502).json(transformer.toError('entity_find_all', status));
	});	
};