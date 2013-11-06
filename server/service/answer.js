exports.findById = function (req, res) {
    var response = {
        answer: {},
        comments: [],
        users: []
    };

    var answerId = req.param('id');

    //get the state of app
    var app = require('../shared/app.init');
    var state = app.init(req);

    //initialize the sdk
    var sdk = require('./appacitive.init');
    var Appacitive = sdk.init(state.token, state.debug);

    //get the transformer
    var transformer = require('./infra/transformer');

    //set graph query name depending upon if user is logged in or not
    //according to this it will be checked if current user has upvoted the answer or not
    var graphQueryName = 'answer';
    if (state.isauth) graphQueryName = 'answer_user';

    //gets the details of answer using graph query
    var getAnswer = function (queryName, entityId, userId, onSuccess, onError) {
        var query = new Appacitive.Queries.GraphProjectQuery(queryName, [entityId], { id: userId });
        query.fetch(onSuccess, onError);
    };

    //get the answer details
    getAnswer(graphQueryName, answerId, state.userid, function (answers) {
        //if no data found
        if (!answers && answers.length == 0) return res.json(response);
        else return res.json(transformer.toAnswer(answers[0], state));
    }, function (status) {
        return res.json(response);
    });
};

exports.update = function (req, res) {
    var answer = req.body.answer;
    if (!answer || !answer.action) return res.status(400).json(req.body.answer);

    //set answer id, froam param
    answer.id = answer.__id = req.param('id');

    //get the state of app
    //to check if user is logged in or not
    var app = require('../shared/app.init');
    var state = app.init(req);

    //initialize appacitive sdk
    var sdk = require('./appacitive.init');
    var Appacitive = sdk.init(state.token, state.debug);

    //get the transformer
    var transformer = require('./infra/transformer');

    if (!state.userid) return res.status(401).json(transformer.toSessionExpiredError(res));

    var aAnswer = transformer.toAppacitiveAnswer(Appacitive, answer);

    //creates 'entity_vote' relation between user and answer 
    var answer_vote_Create = function (isupvote, onsuccess, onfailure) {
        var relation = new Appacitive.ConnectionCollection({ relation: 'entity_vote' });
        var connection = relation.createNewConnection({
            endpoints: [{
                articleid: answer.id,
                label: 'entity'
            }, {
                articleid: state.userid,
                label: 'user'
            }],
            isupvote: isupvote,
            type: 'answer'
        });
        connection.save(function () {
            answer.voteconnid = connection.id();
            onsuccess();
        }, onfailure);

        //update the author of answer
        update_author(answer.author, isupvote ? process.config.upvotepts : -1 * process.config.downvotepts);
    };

    //updates 'entity_vote' relation between user and answer 
    var answer_vote_Update = function (isupvote, onsuccess, onfailure) {
        var relation = new Appacitive.Connection({ relation: 'entity_vote', __id: answer.voteconnid });
        relation.set('isupvote', isupvote);
        relation.save(onsuccess, onfailure);

        //update the author of answer
        var pts = process.config.upvotepts + process.config.downvotepts;
        update_author(answer.author, isupvote ? pts : -1 * pts);
    };

    //deletes 'entity_vote' relation between user and answer 
    var answer_vote_Delete = function (factor, onsuccess, onfailure) {
        var relation = new Appacitive.Connection({ relation: 'entity_vote', __id: answer.voteconnid });
        relation.del(function () {
            answer.voteconnid = '';
            onsuccess();
        }, onfailure);

        //update the author of answer
        update_author(answer.author, factor);
    };

    //check if correct_answer relation exists or not
    //if yes delete it
    var oldAcceptedAnswer = null;
    var check_n_delete_correct_answer = function (onsuccess, onfailure) {
        var question = new Appacitive.Article({ __id: answer.question, schema: 'entity' });
        question.fetchConnectedArticles({
            relation: 'correct_answer',
            label: 'answer'
        }, function (r) {
            if (r && r.children && r.children['correct_answer'] && r.children['correct_answer'].length > 0) {
                oldAcceptedAnswer = r.children['correct_answer'][0];
                //delete the connection
                var relation = new Appacitive.Connection({ relation: 'correct_answer', __id: oldAcceptedAnswer.connection.id() });
                relation.del(onsuccess, onfailure);

                //update the author of answer
                update_author(oldAcceptedAnswer.get('__createdby'), -1 * process.config.answerpts);
            } else onsuccess();
        }, onfailure);
    };

    //create a connection of 'correct_answer'
    var correct_answer_Create = function (answerId, onsuccess, onfailure) {
        var relation = new Appacitive.ConnectionCollection({ relation: 'correct_answer' });
        var connection = relation.createNewConnection({
            endpoints: [{
                articleid: answer.question,
                label: 'question'
            }, {
                articleid: answerId,
                label: 'answer'
            }]
        });
        connection.save(onsuccess, onfailure);

        //update the author of answer
        update_author(answer.author, process.config.answerpts);
    };

    //update the question and set isanswered to true
    var update_question = function (onsuccess, onfailure) {
        var question = new Appacitive.Article({ __id: answer.question, schema: 'entity' });
        question.set('isanswered', true);
        question.save(onsuccess, onfailure);
    };

    //get the user and sum the entityupcount, entitydowncount and answercount and finally add the factor
    //and update the user
    var update_author = function (authorId, factor) {
        var user = new Appacitive.User({ __id: authorId });
        user.fetch(function () {
            var userJ = transformer.toUser(user);
            user.set('reputation', userJ.reputation + factor);
            user.save();
        }, function () { }, ['$entityupcount', '$entitydowncount', '$correctanswercount'])
    };

    //saves the answer object on appacitive api
    var save = function () {
        aAnswer.save(function () {
            //transform the object
            delete answer.id;
            var response = transformer.toAnswer(aAnswer, state);
            response.answer.question = answer.question;
            response.answer.author = answer.author;
            response.answer.comments = answer.comments;
            response.answer.tags = answer.tags;
            response.answer.voted = answer.voted;
            response.answer.voteconnid = answer.voteconnid;
            return res.json(response);
        }, function (status) {
            return res.status(424).json(req.body.answer);
        });
    };

    //depending upon the action, perform the update
    switch (answer.action) {
        case 'do:upvote':
            //Step 1.0: check if connectionid exists, if yes means user has switched vote
            //Step 1.1: update the connection, and increment upvotecount and decrement downvotecount
            //Step 2.0: else create 'entity_vote' connection between user and answer
            //Step 2.1: decrement upvotecount
            if (answer.voteconnid != '') {
                answer_vote_Update(true, function () {
                    aAnswer.increment('upvotecount');
                    aAnswer.decrement('downvotecount');
                    aAnswer.increment('totalvotecount', 2);
                    save();
                }, function (status) {
                    return res.status(502).json(transformer.toError('entity_vote_up', status));
                });
            } else {
                answer_vote_Create(true, function () {
                    aAnswer.increment('upvotecount');
                    aAnswer.increment('totalvotecount');
                    save();
                }, function (status) {
                    return res.status(502).json(transformer.toError('entity_vote_up', status));
                });
            }
            //has voted true
            answer.voted = 1;
            break;
        case 'undo:upvote':
            //Step 1: delete 'entity_vote' connection between user and answer
            //Step 2: decrement upvotecount
            answer_vote_Delete(-1 * process.config.upvotepts, function () {
                aAnswer.decrement('upvotecount');
                aAnswer.decrement('totalvotecount');
                save();
            }, function (status) {
                return res.status(502).json(transformer.toError('entity_vote_up_undo', status));
            });
            //has removed vote
            answer.voted = 0;
            break;
        case 'do:downvote':
            //Step 1.0: check if connectionid exists, if yes means user has switched vote
            //Step 1.1: update the connection, and decrement upvotecount and increment downvotecount
            //Step 2.0: else create 'entity_vote' connection between user and answer
            //Step 2.1: decrement upvotecount
            if (answer.voteconnid != '') {
                answer_vote_Update(false, function () {
                    aAnswer.decrement('upvotecount');
                    aAnswer.increment('downvotecount');
                    aAnswer.decrement('totalvotecount', 2);
                    save();
                }, function (status) {
                    return res.status(502).json(transformer.toError('entity_vote_down', status));
                });
            } else {
                answer_vote_Create(false, function () {
                    aAnswer.increment('downvotecount');
                    aAnswer.decrement('totalvotecount');
                    save();
                }, function (status) {
                    return res.status(502).json(transformer.toError('entity_vote_down', status));
                });
            }
            //has voted false
            answer.voted = -1;
            break;
        case 'undo:downvote':
            //Step 1: delete 'entity_vote' connection between user and answer
            //Step 2: increment upvotecount
            answer_vote_Delete(process.config.downvotepts, function () {
                aAnswer.decrement('downvotecount');
                aAnswer.increment('totalvotecount');
                save();
            }, function (status) {
                return res.status(502).json(transformer.toError('entity_vote_down_undo', status));
            });
            //has remove vote
            answer.voted = 0;
            break;
        case 'do:accepted':
            //Step 1: Check if question has any existing accepted answer
            //Step 2: If yes; delete that connection
            //Step 3: Create a new connection between current answer and question
            //Step 4: If there was no earlier accepted answer, then update the question
            // and set isanswered for the question as true
            check_n_delete_correct_answer(function () {
                //if oldAcceptedAnswer is null, means there was no earlier connection
                //so if anything goes wrong after this, there is nothing to be rollbacked
                correct_answer_Create(answer.id, function () {
                    //if oldAcceptedAnswer is null, means mark the question as answered
                    if (!oldAcceptedAnswer) update_question();
                    else {
                        //set the score of old answer as zero
                        //which will reduce the reputation of repective user
                        oldAcceptedAnswer.set('score', 0);
                        oldAcceptedAnswer.save();
                    }

                    //set the score of current answer to one
                    //which will increase the reputation of respective user
                    aAnswer.set('score', 1);

                    //save the answer and return the response
                    save();
                }, function () {
                    if (!oldAcceptedAnswer) return res.status(502).json(transformer.toError('answer_accept'));
                    //try to rollback the state
                    correct_answer_Create(oldAcceptedAnswer.id(), function () {
                        return res.status(502).json(transformer.toError('answer_accept'));
                    }, function () {
                        //TODO: Some error mechanism which will let user know something is gone wrong for which user might to refresh the page
                        return res.status(502).json(transformer.toError('answer_accept'));
                    });
                });
            }, function () {
                return res.status(502).json(transformer.toError('answer_accept'));
            });
            break;
        case 'undo:accepted':
            //Step 1: Delete the connection
            //Step 2: Update the score to 0 for current answer
            check_n_delete_correct_answer(function () {
                aAnswer.set('score', 0);

                save();
            }, function () {
                return res.status(502).json(transformer.toError('answer_accept_undo'));
            });
            break;
        case 'do:save':
            //get the question
            //check the ownership
            aAnswer.fetch(function () {
                if (aAnswer.get('__createdby') != state.userid) return res.status(401).json(transformer.toError('access_denied'));

                //update text
                aAnswer.set('text', answer.text);

                //in case edits by other user is supported in future
                aAnswer.set('editedby', state.userid);
                var editCount = aAnswer.get('editcount');
                if (!editCount || isNaN(editCount)) editCount = 0;
                else editCount = parseInt(editCount, 10);
                aAnswer.set('editcount', editCount + 1);
                save();
            }, function (status) {
                return res.status(502).json(transformer.toError('question_save', status));
            });
            break;
        default:
            return res.status(400).json(transformer.toError('entity_invalid_action'));
    }
};

//Step 1: Save the Answer and connect user to answer
//Step 2: Create connection of Answer with question
exports.save = function (req, res) {
    var answer = req.body.answer;
    if (!answer || !answer.action) return res.status(400).json(req.body.answer);

    //get the state of app
    //to check if user is logged in or not
    var app = require('../shared/app.init');
    var state = app.init(req);

    //initialize appacitive sdk
    var sdk = require('./appacitive.init');
    var Appacitive = sdk.init(state.token, state.debug);

    //get the transformer
    var transformer = require('./infra/transformer');

    if (!state.userid) return res.status(401).json(transformer.toSessionExpiredError(res));

    var rollbackAnswer = function (aAnswer, status) {
        //Rollback the answer
        aAnswer.del(function () { }, function () { }, true);
        return res.status(500).json(transformer.toError('answer_save', status));
    };

    //creates the answer and connects it with current logged in user
    //and then connects with question
    var createAnswer = function () {
        var question_subscribe_conn_id = answer.subscribeconnid;
        //perform a basic transform
        var aAnswer = transformer.toAppacitiveAnswer(Appacitive, answer);
        aAnswer.set('text', answer.text);
        aAnswer.attr('question', answer.question);
        aAnswer.attr('title', answer.title);

        //creates 'answer_user' relation between user and answer
        var answer_user_Create = function (onsuccess, onfailure) {
            var relation = new Appacitive.ConnectionCollection({ relation: 'entity_user' });
            var connection = relation.createNewConnection({
                endpoints: [{
                    article: aAnswer,
                    label: 'entity'
                }, {
                    articleid: state.userid,
                    label: 'user'
                }]
            });
            connection.save(onsuccess, onfailure);
        }

        //creates 'question_answer' relation between question and answer
        var question_answer_Create = function (onsuccess, onfailure) {
            var relation = new Appacitive.ConnectionCollection({ relation: 'question_answer' });
            var connection = relation.createNewConnection({
                endpoints: [{
                    articleid: answer.question,
                    label: 'question'
                }, {
                    articleid: aAnswer.id(),
                    label: 'answer'
                }]
            });
            connection.save(onsuccess, onfailure);
        }

        //creates 'question_subscribe' relation between question and author
        var question_subscribe_Create = function (onsuccess, onfailure) {

            //if user is already subscribed to the question then return success directly
            if (answer.issubscribed === true) {
                if (onsuccess) onsuccess();
                return;
            }

            //create the relation
            var relation = new Appacitive.ConnectionCollection({ relation: 'question_subscribe' });
            var connection = relation.createNewConnection({
                endpoints: [{
                    articleid: answer.question,
                    label: 'question'
                }, {
                    articleid: state.userid,
                    label: 'user'
                }]
            });
            connection.save(function () {
                question_subscribe_conn_id = connection.id();
                onsuccess();
            }, onsuccess);
        }

        //update answer, and set the issearchable flag to true
        //so that it appears in all searches
        var updateAnswer = function () {
            //set issearchable
            aAnswer.set('issearchable', true);
            aAnswer.save(function () {
                //return the response
                var response = transformer.toAnswer(aAnswer, state);
                response.answer.author = state.userid;
                response.answer.question = answer.question;
                response.answer.isowner = true;

                if (question_subscribe_conn_id) {
                    response.answer.issubscribed = true;
                    response.answer.subscribeconnid = question_subscribe_conn_id;
                }

                return res.json(response);
            }, function (status) {
                return rollbackAnswer(aAnswer, status);
            });
        };

        //create answer and connect to user
        answer_user_Create(function () {
            //connect question and answer
            question_answer_Create(function () {

                //subscribe user to question
                question_subscribe_Create(function () {
                    //update answer, so that it can be searched
                    updateAnswer();
                });
            }, function (status) {
                //rollback answer
                return rollbackAnswer(aAnswer, status);
            });
        }, function (status) {
            //rollback answer
            return rollbackAnswer(aAnswer, status);
        });
    };

    //initiate the create process
    createAnswer();
};

//Step 1: Get the answer, check if owner is deleting answer (important)
//Step 2: Get all the comments for the answer (optional)
//Step 3: Delete the answer with all connections (important)
//Step 4: Multi-Delete the comments	(optional)
//Step 5: If current answer is accepted answer, then marked question as unanswered (optional)
exports.del = function (req, res) {
    if (!req.param('id')) return res.status(400).json({ messsage: 'Answer Id is required' });

    //get the state of app
    var app = require('../shared/app.init');
    var state = app.init(req);

    //intialize SDK
    var sdk = require('./appacitive.init');
    var Appacitive = sdk.init(state.debug);

    //get the transformer
    var transformer = require('./infra/transformer');

    if (!state.userid) return res.status(401).json(transformer.toSessionExpiredError(res));

    _deleteAnswer(req.param('id'), false, Appacitive, state, transformer, function (status) {
        return res.status(status).json({});
    }, function (status, error) {
        return res.status(status).json(error);
    });
};

var _deleteAnswer = function (answerId, overrideOwner, Appacitive, state, transformer, onSuccess, onFailure) {
    if (!answerId) return;

    //get the answer details
    var getAnswerDetails = function (onsuccess, onfailure) {
        var query = new Appacitive.Queries.GraphProjectQuery('answer', [answerId]);
        query.fetch(function (answers) {
            //if no data found
            if (!answers && answers.length == 0) onsuccess();

            var response = transformer.toAnswer(answers[0], state);
            onsuccess(response.answer);
        }, onfailure);
    };

    var delete_Answer = function (answerId, onsuccess, onfailure) {
        var answer = new Appacitive.Article({ schema: 'entity', __id: answerId });
        answer.del(onsuccess, onfailure, true);
    };

    //multi delete the comments
    var multi_delete_comments = function (comments) {
        if (!comments || comments.length === 0) return;

        Appacitive.Article.multiDelete({
            schema: 'comment',
            ids: comments
        });
    };

    //update the question
    var update_question = function (questionId) {
        var question = new Appacitive.Article({ schema: 'entity', __id: questionId });
        question.set('isanswered', false);
        question.save();
    };

    getAnswerDetails(function (answer) {
        //check the ownership of answer
        if (!overrideOwner && !answer.isowner) {
            onFailure(403, transformer.toError('access_denied'))
            return;
        }

        //delete the answer with all connections
        delete_Answer(answer.__id, function () {
            //delete the comments
            multi_delete_comments(answer.comments);

            //update question if required
            //if overrideOwner is false then only try to update the question
            if (!overrideOwner && answer.iscorrectanswer) update_question(answer.question);

            //return empty response
            onSuccess(204);
        }, function (status) {
            onFailure(502, transformer.toError('answer_delete', status));
        });
    }, function (status) {
        onFailure(502, transformer.toError('answer_delete', status));
    });
};
exports.deleteAnswer = _deleteAnswer;