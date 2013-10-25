
// Question flow
//Step 1: Get the author of question
//Step 2: get all the users (excluding who created the question)
//Step 4: Send an email to individual person

// Answer flow
//Step 1: Get the question with question's author
//Step 2: Get the author of the answer
//Step 3: Get all users (excluding who created the answer)
//Step 4: Send an email to individual person
exports.entitycreate = function (req, res) {
    var payload = req.body;

    //get the state of app
    //to check if user is logged in or not
    var app = require('../shared/app.init');
    var state = app.init(req);

    //initialize appacitive sdk
    var sdk = require('./appacitive.init');
    var Appacitive = sdk.init();

    //get the transformer
    var transformer = require('./infra/transformer');

    var question = {
        id: payload.__article.__id,
        title: payload.__article.title,
        shorttext: payload.__article.shorttext
    };
    var answer = {
        id: payload.__article.__id,
        shorttext: payload.__article.text
    };
    var questionAuthor = {};
    var answerAuthor = {};

    var sendResponse = function () {
        return res.json({});
    }

    //get the author of entity
    var getAuthor = function (onSuccess, onError) {
        var user = new Appacitive.User({ __id: payload.__article.__createdby });
        user.fetch(onSuccess, onError, ["firstname", "lastname", "email"]);
    };
    
    //get all users to whom email needs to be sent
    var getUsers = function (onSuccess, onError) {
        var userCollection = new Appacitive.ArticleCollection({ schema: 'user', fields: ['email'] });
        userCollection.fetch(function () {
            var userEmails = [];
            userCollection.getAll().forEach(function (user) {
                if (user.id() == payload.__article.__createdby) return;
                userEmails.push(user.get('email'));
            });
            onSuccess(userEmails);
        }, onError);
    };

    //send email
    var getSubject = function() {
        var subject = "Q: " + question.title ;
        if (payload.__article.type != 'question') subject = "A: " + question.title;
        subject = "[DeepThought] " + subject;

        //limiting subject length to 78 char
        //http://stackoverflow.com/questions/1592291/what-is-the-email-subject-length-limit
        if (subject.length > 78) {
            subject = subject.substring(0, 78);
            subject = subject.substring(0, Math.min(subject.length, subject.lastIndexOf(' ')));
        }
        return subject;
    };
    

    var templatename = payload.__article.type;
    
    var sendEmail = function (emailAddress) {       
        var options = {
            to: [emailAddress],
            subject: getSubject(),
            templateName: templatename,
            from: "noreply@appacitive.com",
            isHtml: true,
            data: {
                "questionurl": process.config.host + '/questions/' + question.id, 
                "title": question.title,
                "shorttext": question.shorttext,
                "authorurl": questionAuthor.url,
                "authorimg": questionAuthor.gravtarurl,
                "authorname": questionAuthor.firstname + ' ' + questionAuthor.lastname
            }
        };
        if (payload.__article.type != 'question') {
            options.data.answershorttext = answer.shorttext.substring(0, 200);
            options.data.answerauthorurl = answerAuthor.url;
            options.data.answerauthorimg = answerAuthor.gravtarurl;
            options.data.answerauthorname = answerAuthor.firstname + ' ' + answerAuthor.lastname;
        }
        Appacitive.Email.sendTemplatedEmail(options, function () { }, function () { });
    };

    if (payload.__article.type === "question") {
        //get the author
        getAuthor(function (user) {
            questionAuthor = transformer.toUser(user);
            //get the users
            getUsers(function (usersEmail) {
                //send email to all
                for (var i = 0; i < usersEmail.length; i++) sendEmail(usersEmail[i]);
                
                return sendResponse();
            }, function (status) {
                return sendResponse();
            });
        }, function (status) {
            return sendResponse();
        });
    } else {
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
    }
};