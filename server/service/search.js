exports.freeText = function (req, res) {
	var response = {
		entities: []
	}
	response.entities.push({
		__id: '123',
		__utcdatecreated: "2013-09-19T12:46:15.0000000Z",
		title: 'A : Hello World',
		text: 'What is what?',
		url: 'http://localhost:3000',
		author: '37554279646691315',
		upvotecount: 0,
		downvotecount: 0,
		isanswered: true
	});
	return res.json(response);
};