exports.findAll = function(req, res) {
	var sdk = require('./appacitive.init');
	var Appacitive = sdk.init();

	var query = new Appacitive.Queries.FindAllQuery({
		schema : 'question',
		fields: ['title']
	});
	query.fetch(function (questions) {
		var q  =[];
		questions.forEach(function (question) {
			q.push(question.toJSON());
		})
		res.json(q);
	}, function (status) {
		res.json(status);
	});	
};

exports.findById = function(req, res) {
  	var sdk = require('./appacitive.init');
	var Appacitive = sdk.init();

	Appacitive.Article.get({
		schema : 'question',
		id : req.param('id'),
		fields: ['title']
	},function (question) {
		res.json(question.toJSON());
	}, function (status) {
		res.json(status);
	});	
};