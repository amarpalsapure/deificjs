exports.findAll = function(req, res) {
	if(req.param('uId')) return _findByIdWithEntities(req, res);
	else return _findAll(req, res);	
};

var _findAll = function(req, res) {
	var response = {
		users: []
	};

	//get the state of app
	var app = require('../shared/app.init');
	var state = app.init(req);

	//initialize the sdk
  	var sdk = require('./appacitive.init');
	var Appacitive = sdk.init(state.debug);

	//get the transformer
	var transformer = require('./infra/transformer');

	//search for matching users
	var orderBy = '__utcdatecreated',
		pagenumber = req.param('page'),
		isAscending = false,
		filter;

	if(!pagenumber) pagenumber = 1;

	var sort = req.query.sort;
	sort = (!sort) ? 'reputation' : sort.toLowerCase();
	switch(sort) {
		case 'latest':
			break;
		case 'reputation': 
			orderBy = '$questionupcount';
			isAscending = true;
			break;		
		case 'name':
			orderBy = 'firstname';
			isAscending = true;
			break;
	}

	var nameQuery = req.param('q');
	if(nameQuery) filter = Appacitive.Filter.Or(
						Appacitive.Filter.Property('firstname').like(nameQuery), 
						Appacitive.Filter.Property('lastname').like(nameQuery));

	var query = new Appacitive.Queries.FindAllQuery({
						schema : 'user',
						fields : 'firstname,lastname,email,reputation,$questionupcount,$questiondowncount,$answerupcount,$answerupcount,$correctanswercount,__utcdatecreated',
						orderBy: orderBy,
						filter: filter,
						pageNumber: pagenumber,
						isAscending: isAscending,
						pageSize: 4
					});

	query.fetch(function (users, paginginfo) {
		return res.json(transformer.toUsers(users, paginginfo));
	}, function (status) {
		return res.status(502).json(transformer.toError('question_find_tag', status));
	});
};

// Step 1 : Get the user
// Step 2 : Depending upon the type of requested entity, get connected articles
var _findByIdWithEntities = function(req, res) {
	var response = {
		users: [],
		entities: []
	};

	//get the state of app
	var app = require('../shared/app.init');
	var state = app.init(req);

	//initialize the sdk
  	var sdk = require('./appacitive.init');
	var Appacitive = sdk.init(state.debug);

	//get the transformer
	var transformer = require('./infra/transformer');

	var userId = req.param('uId');
	var type = req.param('type');
	var pagenumber = req.param('page');

	if(userId === '') return res.status(400).json(transformer.toError('Invalid input'));
	if(!type) type = 'questions';
	if(!pagenumber) pagenumber = 1;


	var getUser = function(userId, onSuccess, onError) {
		var user = new Appacitive.User({__id: userId});
		user.fetch(onSuccess, onError);
	};

	var getConnectedEntities = function(userId, relation, entityType, pagenumber, onSuccess, onError) {
		var userArticle = new Appacitive.Article({ __id : userId, schema : 'user' });
		userArticle.fetchConnectedArticles({ 
		    relation: relation,
		    label: 'entity',
		    filter: Appacitive.Filter.Property('type').equalTo(entityType),
		    pageSize: process.config.pagesize,
		    pageNumber: pagenumber,
		    orderBy: '__utcdatecreated',
		    isAscending: false,
		    fields: ['__id,__attributes,title,text,shorttext,totalvotecount,isanswered,viewcount,score,type,__utcdatecreated,$answercount,$bookmarkcount,isupvote'],
		    returnEdge: false
		}, function(obj, pi) {
			onSuccess(userArticle.children[relation], pi);
		}, onError);
	};

	var getVotedItems = function(userId, pagenumber, onSuccess, onError) {
		var userArticle = new Appacitive.Article({ __id : userId, schema : 'user' });
		userArticle.fetchConnectedArticles({ 
		    relation: 'entity_vote',
		    label: 'entity',
		    pageSize: process.config.pagesize,
		    pageNumber: pagenumber,
		    orderBy: '__utcdatecreated',
		    isAscending: false,
		    fields: ['__id,__attributes,title,shorttext,totalvotecount,isanswered,viewcount,score,type,__utcdatecreated,$answercount,$bookmarkcount,isupvote'],
		}, function(obj, pi) {
			onSuccess(userArticle.children['entity_vote'], pi);
		}, onError);
	};

	var getConnectedItems = function(userId, pagenumber, type, onSuccess, onError) {
		switch(type.toLowerCase()) {
			case 'answers': //answers
				getConnectedEntities(userId, 'entity_user', 'answer', pagenumber, onSuccess, onError);
				break;
			case 'votes':
				getVotedItems(userId, pagenumber, onSuccess, onError);
				break;
			default: //questions
				getConnectedEntities(userId, 'entity_user', 'question', pagenumber, onSuccess, onError);
				break;
		}
	};

	getUser(userId, function(user) {
		//get connected entities on basis of type
		getConnectedItems(userId, pagenumber, type, function(entities, paginginfo){
			var response = transformer.toEntities(entities, paginginfo);
			
			//add user to response
			var userJ = transformer.toUser(user);
			userJ.entities = [];
			entities.forEach(function(entity) { userJ.entities.push(entity.id()); })
			response.users.push(userJ);
			
			return res.json(response);
		}, function(status){
			return res.status(502).json(transformer.toError('user_find', status));
		});
	}, function(status) {
		return res.status(502).json(transformer.toError('user_find', status));
	});

};

exports.findById = function(req, res) {
	var response = {
		user: {}
	};

	//get the state of app
	var app = require('../shared/app.init');
	var state = app.init(req);

	//initialize the sdk
  	var sdk = require('./appacitive.init');
	var Appacitive = sdk.init(state.debug);
	
	//get the transformer
	var transformer = require('./infra/transformer');

	var user = new Appacitive.User({__id: req.param('id')})
	user.fetch(function () {
		//tranform		
		response.user = transformer.toUser(user);
		return res.json(response);
	}, function (status) {
		return res.status(404).json(transformer.toError('user_find'));
	});	
};

exports.auth = function(req, res){
	var email = req.body.email;
	var pwd = req.body.password;

	//get the transformer
	var transformer = require('./infra/transformer');

	//validate the inputs
	if(!email || email === '' || !pwd || pwd === '')
		return res.status(400).json(transformer.toError('user_login_validate'));
	
	//initialize the SDK
  	var sdk = require('./appacitive.init');
	var Appacitive = sdk.init();

	Appacitive.Users.login(email, pwd, function (authResult) {
		// User has been logged in successfully
		// Set the cookie
		res.cookie('u', {
			i: authResult.user.id(),
			f: authResult.user.get('firstname'),
			l: authResult.user.get('lastname'),
			e: authResult.user.get('email'),
			t: authResult.token
		},{
			signed: true,
			maxAge: 30*24*60*60*1000, //30 days
			httpOnly: true
		})

    	return res.json({
			user: {
				id: authResult.user.id(),
				fname: authResult.user.get('firstname'),
				lname: authResult.user.get('lastname')
			}
		});
	}, function(status) {
		return res.status(401).json(transformer.toError('user_login', status));
	});	
};

exports.logout = function(req, res){
	//get the state of app
	var app = require('../shared/app.init');
	var state = app.init(req);

	//initialize the SDK
  	var sdk = require('./appacitive.init');
	var Appacitive = sdk.init(state.token);

	//Logout user from appacitve
	Appacitive.Users.logout();

	//remove the auth cookie
	res.clearCookie('u');
	res.json({
		success: true
	});
};