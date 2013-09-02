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
			//q.push({
			//	id: question.get('__id'),
			//	title : question.get('title')
			//});
		})

		res.json({ questions: q });
	}, function (status) {
		res.json(status);
	});	
};

exports.findById = function(req, res) {
	var t = {"question": {"__id": "35557904755065298", "__schematype": "question", "__createdby": "35557274383681410", "__tags": ["c#", ".net", "enums", "enumeration"], "__utcdatecreated": "2013-08-28T11:37:40.5100052Z", "title": "How do I enumerate an enum?", "description": "How can you enumerate a enum in C#?\n\ne.g. the following does not compile:\n\n    public enum Suit\n    {\n        Spades,\n        Hearts,\n        Clubs,\n        Diamonds\n    }\n\n    public void EnumerateAllSuitsDemoMethod()\n    {\n        foreach (Suit suit in Suit)\n        {\n            DoSomething(suit);\n        }\n    }\n\nIt gives the compile time error:\n> ``Suit` is a `type` but is used like a `variable``\n\nIt fails on the *Suit* keyword, the 2nd one.", "__attributes": {}, "comment_ids": ["35645814467592818", "35645814467592828"], "author_id": "35557274383681410", "answer_ids": ["45645814467592818", "45645814467592828"] }, "comments": [{"__id": "35645814467592818", "__schematype": "comment", "__createdby": "35557311733959061", "__utcdatecreated": "2013-08-29T10:54:57.7453920Z", "__utclastupdateddate": "2013-08-29T12:21:53.1721335Z", "text": "It might be easiest just to use `Enum.GetValues(typeof(Suit)).Cast<Suit>()`. That will give you an `IEnumerable<Suit>`.", "__attributes": {}, "__tags": [], "author_id": "35557311733959061"}, {"__id": "35645814467592828", "__schematype": "comment", "__createdby": "35557274383681410", "__utcdatecreated": "2013-08-29T10:54:57.7453920Z", "__utclastupdateddate": "2013-08-29T12:21:53.1721335Z", "text": "It might be easiest just to use `Enum.GetValues(typeof(Suit)).Cast<Suit>()`. That will give you an `IEnumerable<Suit>`.", "__attributes": {}, "__tags": [], "author_id": "35557274383681410"} ], "users": [{"__id": "35557274383681410", "__schematype": "user", "firstname": "John", "lastname": "Doe", "__attributes": {}, "__tags": [] } ] };
	setTimeout(function(){
		return res.json(t);		
	}, 1500);
	
};
exports.test= function(){
	var response = {
		question: {},
		comments: [],
		users: []
	};

  	var sdk = require('./appacitive.init');
	var Appacitive = sdk.init();
	var query = new Appacitive.Queries.GraphProjectQuery('question', [req.param('id')]);
	query.fetch(function (questions) {
		//tranform		
		var transform = function (question) {
			response.question = question.toJSON();

			//Comments
			response.comments = [];
			response.question.comment_ids = [];
			question.children.comments.forEach(function(comment){
				response.question.comment_ids.push(comment.id())
				var commentJ = comment.toJSON();
				commentJ.author_id = comment.get('__createdby');
				response.comments.push(commentJ);
			});
			
			//question author
			var author = question.children.author[0].toJSON();
			response.question.author_id = author['__id'];
			response.users.push(author);
			return response;
		}

		//if no data found
		if(!questions && questions.length == 0) return res.json(response);
		
		res.json(transform(questions[0]));
	}, function (status) {
		res.json(response);
	});	
};