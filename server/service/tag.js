exports.findAll = function (req, res) {
    var response = {
        tags: []
    };

    //get the state of app
    var app = require('../shared/app.init');
    var state = app.init(req, res);

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

    if (!pagenumber) pagenumber = 1;

    var sort = req.query.sort;
    sort = (!sort) ? 'popular' : sort.toLowerCase();
    switch (sort) {
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

    var tagQuery = encodeURIComponent(req.param('q'));
    if (req.param('q') && tagQuery) filter = Appacitive.Filter.Property('name').like(tagQuery);

    var query = new Appacitive.Queries.FindAllQuery({
        schema: 'tag',
        fields: 'name,excerpt,$questioncount,__utcdatecreated',
        orderBy: orderBy,
        filter: filter,
        pageNumber: pagenumber,
        isAscending: isAscending,
        pageSize: 30
    });

    query.fetch(function (tags, paginginfo) {
        return res.json(transformer.toTags(tags, paginginfo));
    }, function (status) {
        return res.status(502).json(transformer.toError('question_find_tag', status));
    });
};

exports.findById = function (req, res) {
    var response = {
        tag: {}
    };

    //get the state of app
    var app = require('../shared/app.init');
    var state = app.init(req, res);

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

exports.save = function (req, res) {
    //get the state of app
    var app = require('../shared/app.init');
    var state = app.init(req, res);

    //initialize appacitive sdk
    var sdk = require('./appacitive.init');
    var Appacitive = sdk.init(state.token, state.debug);

    //get the transformer
    var transformer = require('./infra/transformer');

    //from the state of app
    //check if user is logged in or not
    if (!state.userid) return res.status(401).json(transformer.toSessionExpiredError(res));

    //validate inputs
    if (!req.body.name || req.body.name === ''
        || !req.body.excerpt || req.body.excerpt === ''
        || !req.body.description || req.body.description === '') return res.status(400).json(transformer.toError('invalid_input'));

    var createTag = function (onSuccess, onError) {
        var tag = new Appacitive.Article({
            schema: 'tag',
            name: req.body.name.toLowerCase(),
            excerpt: req.body.excerpt,
            description: req.body.description
        });

        tag.save(onSuccess, onError);
    };

    createTag(function () {
        return res.status(204).json({});
    }, function (status) {
        return res.status(502).json(transformer.toError('tag_save', status));
    });
};