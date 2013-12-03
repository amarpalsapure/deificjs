exports.findByName = function (req, res) {
    var response = {
        tagwikis: [],
        questions: []
    };
    var questions = [];

    //get the state of app
    var app = require('../shared/app.init');
    var state = app.init(req);

    //initialize the sdk
    var sdk = require('./appacitive.init');
    var Appacitive = sdk.init(state.token, state.debug);

    //get the transformer
    var transformer = require('./infra/transformer');

    var name = req.param('name').trim();

    if (name === '') return res.status(400).json(transformer.toError('invalid_input'));

    //to update the view count
    var isNewVisit = false;

    //if the id of tag doesn't exists in session object, increment view count
    if (!req.session.visited_tags) req.session.visited_tags = [];
    if (req.session.visited_tags.indexOf(name) == -1) {
        isNewVisit = true;
        req.session.visited_tags.push(name);
    }

    var callcount = 2;
    var merge = function () {
        if (--callcount != 0) return;
        if (response.tagwikis.length != 0) {
            response.tagwikis[0].questions = [];
            for (var count = 0; count < questions.length; count++) {
                var question = transformer.toQuestion(questions[count]).question;
                response.tagwikis[0].questions.push(question.__id);
                response.questions.push(question);
            }
        }
        return res.json(response);
    };

    //get the tag by name
    var getTagByName = function (name, onSuccess, onError) {
        var query = new Appacitive.Queries.FindAllQuery({
            schema: 'tag',
            fields: 'name,excerpt,description,viewcount,active,__createdby,editedby,edited,editcount,$questioncount,__utcdatecreated',
            filter: Appacitive.Filter.Property('name').equalTo(name)
        });
        query.fetch(function (tags, paginginfo) {
            if (!tags || tags.length === 0) onSuccess();
            else onSuccess(tags[0]);
        }, onError);
    };

    //get the tagged questions
    var getTaggedQuestions = function (name, onSuccess, onError) {
        var orderBy = 'totalvotecount',
		filter = Appacitive.Filter.And(
					Appacitive.Filter.Property('issearchable').equalTo(true),
					Appacitive.Filter.Property('type').equalTo('question'),
					Appacitive.Filter.taggedWithOneOrMore([name]));

        var questionQuery = new Appacitive.Queries.FindAllQuery({
            schema: 'entity',
            filter: filter,
            orderBy: orderBy,
            pageSize: 10,
            fields: '__id,title,totalvotecount'
        });
        questionQuery.fetch(onSuccess, onError);
    };

    //get the tag by name
    getTagByName(req.param('name'), function (tag) {
        if (!tag) return res.status(404).json(transformer.toError('tag_find'));
        else {
            if (isNewVisit) tag.increment('viewcount').save();
            response.tagwikis.push(transformer.toTag(tag));
            merge();
        }
    }, function (error) {
        return res.status(502).json(transformer.toError('tag_find', error));
    });

    //get the tagged questions
    getTaggedQuestions(req.param('name'), function (taggedQuestions) {
        if (!taggedQuestions || taggedQuestions.length === 0) merge();
        else {
            taggedQuestions.forEach(function (taggedQuestion) {
                questions.push(taggedQuestion);
            });
            merge();
        }
    }, function (error) {
        merge();
    });
};

exports.update = function (req, res) {
    //get the state of app
    var app = require('../shared/app.init');
    var state = app.init(req);

    //initialize appacitive sdk
    var sdk = require('./appacitive.init');
    var Appacitive = sdk.init(state.token, state.debug);

    //get the transformer
    var transformer = require('./infra/transformer');

    //from the state of app
    //check if user is logged in or not
    if (!state.userid) return res.status(401).json(transformer.toSessionExpiredError(res));

    //validate inputs
    if (!req.body.tagwiki || !req.param('id')
        || !req.body.tagwiki.excerpt || req.body.tagwiki.excerpt === ''
        || !req.body.tagwiki.description || req.body.tagwiki.description === '') return res.status(400).json(transformer.toError('invalid_input'));

    req.body.tagwiki.__id = req.param('id');
    //update tag
    var updateTag = function (onSuccess, onError) {
        var tag = new Appacitive.Article({
            __id: req.body.tagwiki.__id,
            schema: 'tag',
            excerpt: req.body.tagwiki.excerpt,
            description: req.body.tagwiki.description
        });

        tag.save(function () {
            tag.set('editedby', state.userid);
            tag.increment('editcount');
            tag.set('edited', tag.get('__utclastupdateddate'));
            tag.save();
            onSuccess();
        }, onError);
    };

    //update tag
    updateTag(function () {
        return res.json(  {
            tagwiki: req.body.tagwiki
        });
    }, function (status) {
        return res.status(502).json(transformer.toError('tag_save', status));
    });
};