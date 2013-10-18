exports.findAll = function(req, res) {
    if (req.param('uId')) {
        if (req.param('isedit')) return _findById(req, res);
        else return _findByIdWithEntities(req, res);
    }
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
	sort = (!sort) ? 'points' : sort.toLowerCase();
	switch(sort) {
		case 'latest':
			break;
	    case 'points':
		    orderBy = 'reputation';
			isAscending = false;
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
						fields : 'firstname,lastname,email,reputation,$entityupcount,$entitydowncount,$correctanswercount,__utcdatecreated',
						orderBy: orderBy,
						filter: filter,
						pageNumber: pagenumber,
						isAscending: isAscending,
						pageSize: 8
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
	var Appacitive = sdk.init(state.token, state.debug);

	//get the transformer
	var transformer = require('./infra/transformer');

    //get the parameters
	var userId = req.param('uId');
	if (userId === '') return res.status(400).json(transformer.toError('Invalid input'));

	var type = req.param('type');
	if (!type) type = 'questions';
	else type = type.toLowerCase();
	var pagenumber = req.param('page');

    //to update the view count
	var isNewVisit = false;

    //if the id of user doesn't exists in session object, increment view count
	if (!state.userid || state.userid != userId) {
	    if (!req.session.visited_users) req.session.visited_users = [];
	    if (req.session.visited_users.indexOf(userId) == -1) {
	        isNewVisit = true;
	        req.session.visited_users.push(userId);
	    }
	}

    //if user is logged in and trying to see votes of other user then fail the call
	if((!state.userid && type ==='votes')
        || (state.userid && state.userid != userId &&  type === 'votes'))
	    return res.status(401).json(transformer.toError('access_denied'));
	
	if(!pagenumber) pagenumber = 1;
    
    //get the user and user's profile
	var getUser = function(userId, onSuccess, onError) {
		var user = new Appacitive.User({__id: userId});
		user.fetch(onSuccess, onError);
	};

    //get the user profile for viewcount
	var getUserProfile = function(userId, onSuccess, onError) {
	    var user = new Appacitive.User({__id: userId});
	    user.fetchConnectedArticles({
	        relation: 'user_profile',
	        label: 'profile',
	        returnEdge: false,
	        fields: ['__id,viewcount'],
	    }, function (obj, pi) {
	        //try to get the user profile
            //if it is not there create a profile for the user
	        if(user.children['user_profile'] && user.children['user_profile'].length > 0)
	            onSuccess(user.children['user_profile'][0]);
	        else {
	            //creates 'user_profile' relation between user and answer
	            var profile = new Appacitive.Article({schema: 'profile', viewcount: 0 });
	            var relation = new Appacitive.ConnectionCollection({ relation: 'user_profile' });
	            var connection = relation.createNewConnection({
	                endpoints: [{
	                    articleid: userId,
	                    label: 'user'
	                }, {
	                    article: profile,
	                    label: 'profile'
	                }]
	            });
	            connection.save(function () {
	                onSuccess(profile);
	            }, onError);
	        }
	    }, onError);
	};

    //get the connected entities for the given user
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

    //get the voted entites for the given user
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

    //get the favorite items for the given user
	var getFavoriteItems = function (userId, pagenumber, onSuccess, onError) {
	    var userArticle = new Appacitive.Article({ __id: userId, schema: 'user' });
	    userArticle.fetchConnectedArticles({
	        relation: 'question_bookmark',
	        label: 'question',
	        pageSize: process.config.pagesize,
	        pageNumber: pagenumber,
	        orderBy: '__utcdatecreated',
	        isAscending: false,
	        returnEdge: false,
	        fields: ['__id,__attributes,title,shorttext,totalvotecount,isanswered,viewcount,score,type,__utcdatecreated,$answercount,$bookmarkcount,isupvote'],
	    }, function (obj, pi) {
	        onSuccess(userArticle.children['question_bookmark'], pi);
	    }, onError);
	};

    //depending upon the type, get the entities of the given user
	var getConnectedItems = function(userId, pagenumber, type, onSuccess, onError) {
		switch(type.toLowerCase()) {
			case 'answers': //answers
				getConnectedEntities(userId, 'entity_user', 'answer', pagenumber, onSuccess, onError);
				break;
			case 'votes':
				getVotedItems(userId, pagenumber, onSuccess, onError);
				break;
		    case 'favorites':
		        getFavoriteItems(userId, pagenumber, onSuccess, onError);
		        break;
			default: //questions
				getConnectedEntities(userId, 'entity_user', 'question', pagenumber, onSuccess, onError);
				break;
		}
	};

    //update user's viewcount
	var updateViewCount = function (profileId) {
	    var profileArticle = new Appacitive.Article({ __id: profileId, schema: 'profile' });
	    profileArticle.increment('viewcount').save();
	};

    //merge the response of parallel calls
	var callcount = 2;
	var merge = function (user) {
	    if (--callcount != 0) return;

	    if (response.users && response.users.length > 0)
	        response.users[0].views = user.get('viewcount');

	    return res.json(response);
	};
    
    //get the user details
	getUser(userId, function (user) {

        //PARALLEL CALL 1
	    //get the user profile
	    getUserProfile(userId, function (profile) {
	        if (!profile) {
	            merge(user);
	            return;
	        };

	        //increment the view count if it's a new visit
	        if (isNewVisit) {
	            profile.increment('viewcount').save(function () {
	            }, function (error) {
	                var t = error;
	            });
	        }

            //set the viewcount in user
	        user.set('viewcount', profile.get('viewcount'));

	        //call merge to merge the response
	        merge(user);
	    }, function (status) {
	        //don't do anything
	        merge(user);
	    });

        //PARALLEL CALL 2
		//get connected entities on basis of type
	    getConnectedItems(userId, pagenumber, type, function (entities, paginginfo) {
            //get the response for entities
	        response = transformer.toEntities(entities, paginginfo);

	        //add user to response
	        var userJ = transformer.toUser(user);
	        userJ.entities = [];
	        entities.forEach(function (entity) { userJ.entities.push(entity.id()); })
	        response.users.push(userJ);
			
		    //call merge to merge the response
			merge(user);			
		}, function(status){
			return res.status(502).json(transformer.toError('user_find', status));
		});
	}, function(status) {
		return res.status(502).json(transformer.toError('user_find', status));
	});

};

// Get the user and set the authtype from the state
// if authtype is appacitive, allow user to reset password
var _findById = function (req, res) {
    var response = {
        users: []
    };

    //get the state of app
    var app = require('../shared/app.init');
    var state = app.init(req);

    //get the transformer
    var transformer = require('./infra/transformer');

    //basic validations
    if (!state.userid) return res.status(401).json(transformer.toSessionExpiredError(res));
    if (state.userid != req.param('uId')) return res.status(401).json(transformer.toError('access_denied'));

    //initialize the sdk
    var sdk = require('./appacitive.init');
    var Appacitive = sdk.init(state.debug);

    //get the user
    var user = new Appacitive.User({ __id: req.param('uId') })
    user.fetch(function () {
        //tranform		
        var userJ = transformer.toUser(user);
        userJ.authtype = state.authtype;

        response.users.push(userJ);

        return res.json(response);
    }, function (status) {
        return res.status(404).json(transformer.toError('user_find'));
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
            a: 'appacitive',
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

exports.fbauth = function(req, res) {
	var accessToken = req.body.accessToken;

	//get the transformer
	var transformer = require('./infra/transformer');

	//validate the inputs
	if(!accessToken || accessToken === '')
		return res.status(400).json(transformer.toError('user_fb_login_validate'));
	
	//initialize the SDK
  	var sdk = require('./appacitive.init');
	var Appacitive = sdk.init();

	Appacitive.Facebook.accessToken(accessToken);

	Appacitive.Users.signupWithFacebook(function (authResult) {
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

exports.register = function(req, res) {
	var email = req.body.email
	var name = req.body.name;
	var pwd = req.body.password;

	//get the transformer
	var transformer = require('./infra/transformer');

	//validate the inputs
	if(!email || email === '' || !pwd || pwd === '' || !name || name === '')
		return res.status(400).json(transformer.toError('user_signup_validate'));

	var split = name.split(' ');
    var lastName = '', firstName = '';

    firstName = split.shift();
    lastName = split.join(' ');

    var user = {
            'firstname': firstName,
            'lastname': lastName,
            'username': email,
            'email': email,
            'password': pwd
        };
	
	//initialize the SDK
  	var sdk = require('./appacitive.init');
	var Appacitive = sdk.init();

	Appacitive.Users.signup(user, function (authResult) {
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
		return res.status(401).json(transformer.toError('user_signup', status));
	});	
};

exports.recover = function(req, res) {
	var email = req.body.email;

	//get the transformer
	var transformer = require('./infra/transformer');

	//validate the inputs
	if(!email || email === '')
		return res.status(400).json(transformer.toError('user_recover_validate'));
	
	//initialize the SDK
  	var sdk = require('./appacitive.init');
	var Appacitive = sdk.init();

	Appacitive.Users.sendResetPasswordEmail(email, 'Account Recovery - ' + process.config.brand, function () {
    	return res.status(204).json({});
	}, function(status) {
		return res.status(401).json(transformer.toError('user_recover', status));
	});	
};

//Step 1: Set the context of the user
//Step 2: changed the password
//Step 3: delete the session cookie
//Step 4: logout from appacitive
exports.reset = function (req, res) {
    //get the state of app
    var app = require('../shared/app.init');
    var state = app.init(req);

    //initialize the SDK
    var sdk = require('./appacitive.init');
    var Appacitive = sdk.init(state.token);

    //get the transformer
    var transformer = require('./infra/transformer');

    if (!state.userid) return res.status(401).json(transformer.toSessionExpiredError(res));

    //change password
    var changePassword = function () {
        Appacitive.Users.currentUser().updatePassword(req.body.oldpwd, req.body.pwd, function () {
            //remove the auth cookie
            res.clearCookie('u');

            //Logout user from appacitve
            Appacitive.Users.logout();

            return res.status(204).json({});
        }, function (status) {
            return res.status(502).json(transformer.toError('user_pwd_reset', status));
        });
    };

    //initialize the context
    var context = require('../shared/context');
    //set the context
    context.set(state.token, function (user) {
        Appacitive.Users.setCurrentUser(user, state.token);
        changePassword();
    }, function (err) {
        //delete the cookie
        return res.status(401).json(transformer.toSessionExpiredError(res));
    });

    

      

    
};