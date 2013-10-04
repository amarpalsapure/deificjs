exports.search = function(req, res) {
	if(req.param('tagsearch') === 'true') return tagSearch(req, res);
	else return freeText(req, res);
};

var freeText = function (req, res) {
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

	var query = new Appacitive.Queries.FindAllQuery({
					schema : 'entity',
					fields : 'title,text,type,isanswered,totalvotecount,__createdby,__utcdatecreated,__attributes',
					isAscending: false,
					orderBy: orderBy,
					filter: filter,
					pageNumber: pagenumber,
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


//Step 1: Get the tag
//Step 2: Get connected question for the tag
//Step 3: Get all users info
var tagSearch = function(req, res) {
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
	var orderBy = '__utcdatecreated',
		filter = "*issearchable==true",
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

	var getTag = function(name, onsuccess, onfailure) {
		var tagQuery = new Appacitive.Queries.FindAllQuery({
					schema : 'tag',
					fields : '__id,name,description',
					filter: "*name=='" + name + "'"
				});
		tagQuery.fetch(function(tags) {
			if(tags && tags.length > 0) onsuccess(tags[0]);
			else onsuccess();
		}, onfailure);
	};

	var getConnectedQuestion = function(aTag, onsuccess, onfailure) {
		aTag.fetchConnectedArticles({
			relation: 'question_tag',
		    label: 'question',
		    orderBy: orderBy,
		    pageNumber: pagenumber,
		    pageSize: process.config.pagesize,
		    fields: 'title,text,type,isanswered,totalvotecount,__createdby,__utcdatecreated,__attributes'
		}, function(obj, paginginfo){
			onsuccess(aTag.children['question_tag'], paginginfo);
		}, onfailure);
	};

	var getUsers = function(userIds, onsuccess, onfailure) {
		//Get the details for all the users
		Appacitive.Article.multiGet({ 
		    schema: 'user',
		    ids: userIds,
		    fields: ['firstname,lastname,email,$answerdowncount,$answerupcount,$correctanswercount,$questiondowncount,$questionupcount']// this denotes the fields to be returned in the article object, to avoid increasing the payload : optional
		}, onsuccess, onfailure);
	};

	//get the tag
	getTag(query, function(aTag) {
		//tag name is invalid
		if(!aTag) return res.status(400).json({message: 'Tag name is invalid'});

		//get the connected questions
		getConnectedQuestion(aTag, function(entities, paginginfo) {
			//extract the user ids from entities
			var userIds = [];
			entities.forEach(function (entity) {
				userIds.push(entity.get('__createdby'));
			});

			//No questions found
			if(userIds.length === 0) return res.json(response);

			//get the user details
			getUsers(userIds, function(users) {
				//get the transformed entities
				response = transformer.toEntities(entities, paginginfo);

			    //update the entity with user information
			    users.forEach(function(user) {
			    	response.users.push(transformer.toUser(user));
			    });

			    //return the response
			    return res.json(response);

			}, function(status) { // error while fetching users
				return res.status(502).json({message: 'Couldn\'t fetch users.'});
			});
		}, function(status) {	// error while fetching question
			return res.status(502).json({message: 'Couldn\'t fetch question.'});
		});
	}, function(status) {	// error while fetching tag
		return res.status(502).json({message: 'Couldn\'t fetch tag.'});
	});
};