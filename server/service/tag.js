exports.find = function(req, res) {
	var response = {
		tags: []
	};

	//get the state of app
	var app = require('../shared/app.init');
	var state = app.init(req);

	//initialize the sdk
  	var sdk = require('./appacitive.init');
	var Appacitive = sdk.init(state.token, state.debug);

	//get the transformer
	var transformer = require('./infra/transformer');

	//search for matching tags
	var orderBy = '__utcdatecreated',
		pagenumber = req.param('page'),
		isAscending = false,
		filter;

	if(!pagenumber) pagenumber = 1;

	var sort = req.query.sort;
	sort = (!sort) ? 'popular' : sort.toLowerCase();
	switch(sort) {
		case 'latest':
			break;
		case 'popular': 
			orderBy = '$questioncount';
			break;		
		case 'name':
			orderBy = 'name';
			isAscending = true;
			break;
	}

	var tagQuery = req.param('q');
	if(tagQuery) filter = Appacitive.Filter.Property('name').like(tagQuery);

	var query = new Appacitive.Queries.FindAllQuery({
						schema : 'tag',
						fields : 'name,excerpt,$questioncount,__utcdatecreated',
						orderBy: orderBy,
						filter: filter,
						pageNumber: pagenumber,
						isAscending: isAscending,
						pageSize: 12
					});

	query.fetch(function (tags, paginginfo) {
		return res.json(transformer.toTags(tags, paginginfo));
	}, function (status) {
		return res.status(502).json(transformer.toError('question_find_tag', status));
	});
};

exports.findById = function(req, res) {
	var response = {
		tag: {}
	};

	//get the state of app
	var app = require('../shared/app.init');
	var state = app.init(req);

	//initialize the sdk
  	var sdk = require('./appacitive.init');
	var Appacitive = sdk.init(state.token, state.debug);
	
	//get the transformer
	var transformer = require('./infra/transformer');

	var tag = new Appacitive.Article({ __id: req.param('id'), schema: 'tag' })
	tag.fetch(function () {
		//tranform		
		response.tag = transformer.toTag(tag);
		return res.json(response);
	}, function (status) {
		return res.status(404).json(transformer.toError('tag_find'));
	});	
};