exports.find = function(req, res) {
	var response = {
		tags: [],
		total: 0
	};

	var term = req.param('q');
	var pageSize = req.param('ps');
	if(isNaN(pageSize)) pageSize = process.config.pagesize;

	//get the state of app
	var app = require('../shared/app.init');
	var state = app.init(req);

	//initialize the sdk
  	var sdk = require('./appacitive.init');
	var Appacitive = sdk.init(state.token, state.debug);

	//get the transformer
	var transformer = require('./infra/transformer');

	//search for matching tags
	var query = new Appacitive.Queries.FindAllQuery({
						schema : 'tag',
						fields : 'name,excerpt,$questioncount',
						isAscending: false,
						filter: "(*name like '"+ term +"*')",
						pageSize: pageSize
					});

	query.fetch(function (tags, pi) {
		tags.forEach(function (tag) {
			response.tags.push(transformer.toTag(tag));
		});
		response.total = pi.totalrecords;
		return res.json(response);
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