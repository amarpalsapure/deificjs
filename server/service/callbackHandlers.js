
// Question
//Step 1: Get the author of question
//Step 2: Get all the users who has subscribed to question
//Step 4: Send an email to individual person

exports.entitycreate = function (req, res) {
    var payload = req.body;

    var sendResponse = function () {
        return res.json({});
    }

    if (!payload || payload.__article.type === 'question') return sendResponse();

    //get the state of app
    //to check if user is logged in or not
    var app = require('../shared/app.init');
    var state = app.init(req, res);

    //initialize appacitive sdk
    var sdk = require('./appacitive.init');
    var Appacitive = sdk.init();

    //get the transformer
    var transformer = require('./infra/transformer');

    var question = {};

    var answer = {
        id: payload.__article.__id,
        shorttext: payload.__article.text
    };
    var questionAuthor = {};
    var answerAuthor = {};

    //get the author of entity
    var getAuthor = function (onSuccess, onError) {
        var user = new Appacitive.User({ __id: payload.__article.__createdby });
        user.fetch(onSuccess, onError, ["firstname", "lastname", "email"]);
    };
    
    //get all users to whom email needs to be sent
    var getUsers = function (onSuccess, onError) {
        var questionUser = new Appacitive.Article({ __id: question.id, schema: 'entity' });
        questionUser.fetchConnectedArticles({
            relation: 'question_subscribe',
            label: 'user',
            pageSize: 200,
            fields: ["firstname", "lastname", "email"]
        }, function (obj, pi) {
            var userEmails = [];
            questionUser.children['question_subscribe'].forEach(function (user) {
                userEmails.push(user.get('email'));
            });
            onSuccess(userEmails);
        }, onError);
    };

    //send email
    var getSubject = function() {
        var subject = "A: " + question.title ;
        subject = "[" + process.config.brand + "] " + subject;

        //limiting subject length to 78 char
        //http://stackoverflow.com/questions/1592291/what-is-the-email-subject-length-limit
        if (subject.length > 78) {
            subject = subject.substring(0, 78);
            subject = subject.substring(0, Math.min(subject.length, subject.lastIndexOf(' ')));
        }
        return subject;
    };
    

    var sendEmail = function (emailAddress) {       
        var options = {
            to: [emailAddress],
            subject: getSubject(),
            templateName: 'answer',
            from: "noreply@appacitive.com",
            isHtml: true,
            data: {
                "questionurl": process.config.host + '/questions/' + question.id, 
                "title": question.title,
                "shorttext": question.shorttext,
                "authorurl": questionAuthor.url,
                "authorimg": questionAuthor.gravtarurl,
                "authorname": questionAuthor.firstname + ' ' + questionAuthor.lastname,
                "brand": process.config.brand
            }
        };
    
        options.data.answershorttext = answer.shorttext.substring(0, 200);
        options.data.answerauthorurl = answerAuthor.url;
        options.data.answerauthorimg = answerAuthor.gravtarurl;
        options.data.answerauthorname = answerAuthor.firstname + ' ' + answerAuthor.lastname;
    
        Appacitive.Email.sendTemplatedEmail(options, function () { }, function () { });
    };

    
    //get the question
    var query = new Appacitive.Queries.GraphProjectQuery('answer_question', [payload.__article.__id]);
    query.fetch(function (answers) {
        if (!answers || answers.length === 0) return sendResponse();
        var ans = answers[0];

        //get answer's author info
        if (!ans.children.author || ans.children.author.length === 0) return sendResponse();
        answerAuthor = transformer.toUser(ans.children.author[0]);

        //get question info
        if (!ans.children.question || ans.children.question.length === 0) return sendResponse();
        var q = ans.children.question[0];
        question.id = q.id();
        question.title = q.get('title');
        question.shorttext = q.get('shorttext');

        //get question's author info
        if (!q.children.author || q.children.author.length === 0) return sendResponse();
        questionAuthor = transformer.toUser(q.children.author[0]);

        //get the users
        getUsers(function (usersEmail) {
            for (var i = 0; i < usersEmail.length; i++) sendEmail(usersEmail[i]);
            return sendResponse();
        }, function (status) {
            return sendResponse();
        });

    }, function (status) {
        return sendResponse();
    });
};