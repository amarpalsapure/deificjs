exports.findAll = function(req, res) {
	var t = {"answers": [{"__id": "45645814467592828", "__schematype": "answer", "__createdby": "35557311733959061", "__utcdatecreated": "2013-08-29T11:37:40.5100052Z", "text": "Awesome:\n\n    public enum Suit\n    {\n        Spades,\n        Hearts,\n        Clubs,\n        Diamonds\n    }\n\n    public void EnumerateAllSuitsDemoMethod()\n    {\n        foreach (Suit suit in Suit)\n        {\n            DoSomething(suit);\n        }\n    }\n\nIt gives the compile time error:\n> ``Suit` is a `type` but is used like a `variable``\n\nIt fails on the *Suit* keyword, the 2nd one.", "__attributes": {}, "author_id": "35557311733959061", "comment_ids": ["55645814467592828", "55645814467592820"] }, {"__id": "45645814467592818", "__schematype": "answer", "__createdby": "35557274383681410", "__utcdatecreated": "2013-08-29T11:37:40.5100052Z", "text": "Try doing this:\n\n    foreach (Suit suit in Enum.GetValues(typeof(Suit)))\n    {\n        \n    }", "__attributes": {}, "author_id": "35557274383681410", "comment_ids": ["55645814467592831", "55645814467592832", "55645814467592834", "55645814467592833"] } ], "comments": [{"__id": "55645814467592828", "__schematype": "comment", "__createdby": "35557311733959061", "__utcdatecreated": "2013-08-29T10:54:57.7453920Z", "__utclastupdateddate": "2013-08-29T12:21:53.1721335Z", "text": "That will give you an `IEnumerable<Suit>`.", "__attributes": {}, "__tags": [], "author_id": "35557311733959061"}, {"__id": "55645814467592820", "__schematype": "comment", "__createdby": "35557274383681410", "__utcdatecreated": "2013-08-29T10:54:57.7453920Z", "__utclastupdateddate": "2013-08-29T12:21:53.1721335Z", "text": "It might be easiest just to use `Enum.GetValues(typeof(Suit)).Cast<Suit>()`.", "__attributes": {}, "__tags": [], "author_id": "35557274383681410"}, {"__id": "55645814467592831", "__schematype": "comment", "__createdby": "35557274383681410", "__utcdatecreated": "2013-08-29T10:54:57.7453920Z", "__utclastupdateddate": "2013-08-29T12:21:53.1721335Z", "text": "Have you tried this?", "__attributes": {}, "__tags": [], "author_id": "35557274383681410"}, {"__id": "55645814467592832", "__schematype": "comment", "__createdby": "35557311733959061", "__utcdatecreated": "2013-08-29T10:54:57.7453920Z", "__utclastupdateddate": "2013-08-29T12:21:53.1721335Z", "text": "Yes tried doing something similar, but no luck.", "__attributes": {}, "__tags": [], "author_id": "35557311733959061"}, {"__id": "55645814467592834", "__schematype": "comment", "__createdby": "35557274383681410", "__utcdatecreated": "2013-08-29T10:54:57.7453920Z", "__utclastupdateddate": "2013-08-29T12:21:53.1721335Z", "text": "It might be easiest just to use `Enum.GetValues(typeof(Suit)).Cast<Suit>()`.", "__attributes": {}, "__tags": [], "author_id": "35557274383681410"}, {"__id": "55645814467592833", "__schematype": "comment", "__createdby": "35557311733959061", "__utcdatecreated": "2013-08-29T10:54:57.7453920Z", "__utclastupdateddate": "2013-08-29T12:21:53.1721335Z", "text": "Thanks that did work.", "__attributes": {}, "__tags": [], "author_id": "35557311733959061"} ], "users": [{"__id": "35557274383681410", "__schematype": "user", "firstname": "John", "lastname": "Doe", "__attributes": {}, "__tags": [] }, {"__id": "35557274383681410", "__schematype": "user", "firstname": "John", "lastname": "Doe", "__attributes": {}, "__tags": [] } ] };
	setTimeout(function(){
		return res.json(t);	
	}, 1500);
		
	
};

exports.findById = function(req, res) {
	//remove this
	var t = {"answer": {"__id": "45645814467592828", "__schematype": "answer", "__createdby": "35557311733959061", "__utcdatecreated": "2013-08-29T11:37:40.5100052Z", "text": "Awesome:\n\n    public enum Suit\n    {\n        Spades,\n        Hearts,\n        Clubs,\n        Diamonds\n    }\n\n    public void EnumerateAllSuitsDemoMethod()\n    {\n        foreach (Suit suit in Suit)\n        {\n            DoSomething(suit);\n        }\n    }\n\nIt gives the compile time error:\n> ``Suit` is a `type` but is used like a `variable``\n\nIt fails on the *Suit* keyword, the 2nd one.", "__attributes": {}, "author_id": "35557311733959061", "comment_ids": ["55645814467592828", "55645814467592820"] }, "comments": [{"__id": "55645814467592828", "__schematype": "comment", "__createdby": "35557274383681410", "__utcdatecreated": "2013-08-29T10:54:57.7453920Z", "__utclastupdateddate": "2013-08-29T12:21:53.1721335Z", "text": "That will give you an `IEnumerable<Suit>`.", "__attributes": {}, "__tags": [], "author_id": "35557274383681410"}, {"__id": "55645814467592820", "__schematype": "comment", "__createdby": "35557274383681410", "__utcdatecreated": "2013-08-29T10:54:57.7453920Z", "__utclastupdateddate": "2013-08-29T12:21:53.1721335Z", "text": "It might be easiest just to use `Enum.GetValues(typeof(Suit)).Cast<Suit>()`.", "__attributes": {}, "__tags": [], "author_id": "35557274383681410"} ], "users": [{"__id": "35557274383681410", "__schematype": "user", "firstname": "John", "lastname": "Doe", "__attributes": {}, "__tags": [] } ] };
	if(req.param('id') != "45645814467592828")
		t = {"answer": {"__id": "45645814467592818", "__schematype": "answer", "__createdby": "35557274383681410", "__utcdatecreated": "2013-08-29T11:37:40.5100052Z", "text": "Try doing this:\n\n    foreach (Suit suit in Enum.GetValues(typeof(Suit)))\n    {\n        \n    }", "__attributes": {}, "comment_ids": ["55645814467592828", "55645814467592820"], "author_id": "35557274383681410"}, "comments": [{"__id": "55645814467592828", "__schematype": "comment", "__createdby": "35557274383681410", "__utcdatecreated": "2013-08-29T10:54:57.7453920Z", "__utclastupdateddate": "2013-08-29T12:21:53.1721335Z", "text": "That will give you an `IEnumerable<Suit>`.", "__attributes": {}, "__tags": [], "author_id": "35557274383681410"}, {"__id": "55645814467592820", "__schematype": "comment", "__createdby": "35557274383681410", "__utcdatecreated": "2013-08-29T10:54:57.7453920Z", "__utclastupdateddate": "2013-08-29T12:21:53.1721335Z", "text": "It might be easiest just to use `Enum.GetValues(typeof(Suit)).Cast<Suit>()`.", "__attributes": {}, "__tags": [], "author_id": "35557274383681410"} ], "users": [{"__id": "35557274383681410", "__schematype": "user", "firstname": "John", "lastname": "Doe", "__attributes": {}, "__tags": [] } ] };
	return res.json(t);

	var response = {
		answer: {},
		comments: [],
		users: []
	};

  	var sdk = require('./appacitive.init');
	var Appacitive = sdk.init();
	var query = new Appacitive.Queries.GraphProjectQuery('answer', [req.param('id')]);
	query.fetch(function (answers) {
		//tranform		
		var transform = function (answer) {
			response.answer = answer.toJSON();

			//Comments
			response.comments = [];
			response.answer.comment_ids = [];
			answer.children.comments.forEach(function(comment){
				response.answer.comment_ids.push(comment.id())
				var commentJ = comment.toJSON();
				commentJ.author_id = comment.get('__createdby');
				response.comments.push(commentJ);
			});
			
			//answer author
			var author = answer.children.author[0].toJSON();
			response.answer.author_id = author['__id'];
			response.users.push(author);
			return response;
		}

		//if no data found
		if(!answers && answers.length == 0) return res.json(response);
		
		res.json(transform(answers[0]));
	}, function (status) {
		res.json(response);
	});	
};