// ############## combiner ############## //
// global.combined.js
exports.initialize = function (rootPath) {
    var combiner = require("web-combiner");
    var path = require("path");
    var globalJSFiles = [
        path.join(rootPath, 'server/site/public/javascripts/infra/jquery.js'),
        path.join(rootPath, 'server/site/public/javascripts/infra/bootstrap.js'),
        path.join(rootPath, 'server/site/public/javascripts/infra/util.js'),
        path.join(rootPath, 'server/site/public/javascripts/infra/handlebars.js'),
        path.join(rootPath, 'server/site/public/javascripts/infra/ember.js'),
        path.join(rootPath, 'server/site/public/javascripts/infra/ember-states.js'),
        path.join(rootPath, 'server/site/public/javascripts/infra/ember-data-beta-1.0.js'),
        path.join(rootPath, 'server/site/public/javascripts/infra/markdown-editor.js'),
        path.join(rootPath, 'server/site/public/javascripts/infra/moment.js'),
        path.join(rootPath, 'server/site/public/javascripts/infra/commonTemplate.js'),

        path.join(rootPath, 'server/site/public/javascripts/app.js'),
        path.join(rootPath, 'server/site/public/javascripts/store.js'),

        path.join(rootPath, 'server/site/public/javascripts/models/question.js'),
        path.join(rootPath, 'server/site/public/javascripts/models/answer.js'),
        path.join(rootPath, 'server/site/public/javascripts/models/entity.js'),
        path.join(rootPath, 'server/site/public/javascripts/models/tag.js'),
        path.join(rootPath, 'server/site/public/javascripts/models/comment.js'),
        path.join(rootPath, 'server/site/public/javascripts/models/user.js'),

        path.join(rootPath, 'server/site/public/javascripts/controllers/accountController.js'),
        path.join(rootPath, 'server/site/public/javascripts/controllers/headerController.js'),

        path.join(rootPath, 'server/site/public/javascripts/router/baseRoute.js'),
        path.join(rootPath, 'server/site/public/javascripts/router/errorRouter.js'),

        path.join(rootPath, 'server/site/public/javascripts/views/headerView.js'),
        path.join(rootPath, 'server/site/public/javascripts/views/footerView.js')
    ];
    combiner.combine(globalJSFiles, path.join(rootPath, 'server/site/public/_min/js/global.combined.js'), true, true);
    combiner.init();

    var globalCSSFiles = [
        path.join(rootPath, 'server/site/public/stylesheets/bootstrap.css'),
        path.join(rootPath, 'server/site/public/stylesheets/bootstrap-theme.css'),
        path.join(rootPath, 'server/site/public/stylesheets/bootstrap-switch.css'),
        path.join(rootPath, 'server/site/public/stylesheets/prettify.css'),
        path.join(rootPath, 'server/site/public/stylesheets/select2.css'),
        path.join(rootPath, 'server/site/public/stylesheets/font-awesome.css'),
        path.join(rootPath, 'server/site/public/stylesheets/master-style.css'),
        path.join(rootPath, 'server/site/public/stylesheets/style.css')
    ];
    combiner.combine(globalCSSFiles, path.join(rootPath, 'server/site/public/_min/css/global.combined.css'), true, true);
    combiner.init();

    var indexFiles = [
        path.join(rootPath, 'server/site/public/javascripts/router/indexRouter.js'),
        path.join(rootPath, 'server/site/public/javascripts/controllers/baseController.js'),
        path.join(rootPath, 'server/site/public/javascripts/controllers/questionController.js'),
        path.join(rootPath, 'server/site/public/javascripts/views/questionsView.js'),
        path.join(rootPath, 'server/site/public/javascripts/views/tagView.js')
    ];
    combiner.combine(indexFiles, path.join(rootPath, 'server/site/public/_min/js/index.combined.js'), true, true);
    combiner.init();

    var admin_indexFiles = [
        path.join(rootPath, 'server/site/public/javascripts/router/admin/indexRouter.js'),
        path.join(rootPath, 'server/site/public/javascripts/controllers/admin/configurationController.js'),
        path.join(rootPath, 'server/site/public/javascripts/models/admin/configuration.js'),
        path.join(rootPath, 'server/site/public/javascripts/views/admin/configurationView.js')
    ];
    combiner.combine(admin_indexFiles, path.join(rootPath, 'server/site/public/_min/js/admin-index.combined.js'), true, true);
    combiner.init();

    var editUserFiles = [
        path.join(rootPath, 'server/site/public/javascripts/router/edit-userRouter.js'),
        path.join(rootPath, 'server/site/public/javascripts/infra/prettify.js'),
        path.join(rootPath, 'server/site/public/javascripts/models/user.js'),
        path.join(rootPath, 'server/site/public/javascripts/controllers/userController.js'),
        path.join(rootPath, 'server/site/public/javascripts/views/userView.js')
    ];
    combiner.combine(editUserFiles, path.join(rootPath, 'server/site/public/_min/js/editUser.combined.js'), true, true);
    combiner.init();

    var feedbackFiles = [
        path.join(rootPath, 'server/site/public/javascripts/router/feedbackRouter.js'),
        path.join(rootPath, 'server/site/public/javascripts/controllers/feedbackController.js'),
        path.join(rootPath, 'server/site/public/javascripts/views/feedbackView.js')
    ];
    combiner.combine(feedbackFiles, path.join(rootPath, 'server/site/public/_min/js/feedback.combined.js'), true, true);
    combiner.init();

    var loginFiles = [
        path.join(rootPath, 'server/site/public/javascripts/router/loginRouter.js'),
        path.join(rootPath, 'server/site/public/javascripts/controllers/loginController.js'),
        path.join(rootPath, 'server/site/public/javascripts/views/loginView.js')
    ];
    combiner.combine(loginFiles, path.join(rootPath, 'server/site/public/_min/js/login.combined.js'), true, true);
    combiner.init();

    var newQuestionFiles = [
        path.join(rootPath, 'server/site/public/javascripts/router/new-questionRouter.js'),
        path.join(rootPath, 'server/site/public/javascripts/infra/prettify.js'),
        path.join(rootPath, 'server/site/public/javascripts/infra/select2.min.js'),
        path.join(rootPath, 'server/site/public/javascripts/controllers/baseController.js'),
        path.join(rootPath, 'server/site/public/javascripts/controllers/questionController.js'),
        path.join(rootPath, 'server/site/public/javascripts/views/baseView.js'),
        path.join(rootPath, 'server/site/public/javascripts/views/questionView.js')
    ];
    combiner.combine(newQuestionFiles, path.join(rootPath, 'server/site/public/_min/js/newQuestion.combined.js'), true, true);
    combiner.init();

    var taggedQuestionFiles = [
        path.join(rootPath, 'server/site/public/javascripts/router/taggedRouter.js'),
        path.join(rootPath, 'server/site/public/javascripts/models/paging.js'),
        path.join(rootPath, 'server/site/public/javascripts/controllers/baseController.js'),
        path.join(rootPath, 'server/site/public/javascripts/controllers/questionController.js'),
        path.join(rootPath, 'server/site/public/javascripts/controllers/pagingController.js'),
        path.join(rootPath, 'server/site/public/javascripts/views/questionsView.js'),
        path.join(rootPath, 'server/site/public/javascripts/views/tagView.js'),
        path.join(rootPath, 'server/site/public/javascripts/views/pagingView.js')
    ];
    combiner.combine(taggedQuestionFiles, path.join(rootPath, 'server/site/public/_min/js/taggedQuestion.combined.js'), true, true);
    combiner.init();

    var questionFiles = [
        path.join(rootPath, 'server/site/public/javascripts/infra/bootstrap-switch.js'),
        path.join(rootPath, 'server/site/public/javascripts/router/questionRouter.js'),
        path.join(rootPath, 'server/site/public/javascripts/infra/prettify.js'),
        path.join(rootPath, 'server/site/public/javascripts/controllers/baseController.js'),
        path.join(rootPath, 'server/site/public/javascripts/controllers/questionController.js'),
        path.join(rootPath, 'server/site/public/javascripts/controllers/answerController.js'),
        path.join(rootPath, 'server/site/public/javascripts/views/baseView.js'),
        path.join(rootPath, 'server/site/public/javascripts/views/questionView.js'),
        path.join(rootPath, 'server/site/public/javascripts/views/answerView.js'),
        path.join(rootPath, 'server/site/public/javascripts/views/commentView.js'),
        path.join(rootPath, 'server/site/public/javascripts/views/tagView.js')
    ];
    combiner.combine(questionFiles, path.join(rootPath, 'server/site/public/_min/js/question.combined.js'), true, true);
    combiner.init();

    var questionsFiles = [
        path.join(rootPath, 'server/site/public/javascripts/router/questionsRouter.js'),
        path.join(rootPath, 'server/site/public/javascripts/models/paging.js'),
        path.join(rootPath, 'server/site/public/javascripts/controllers/baseController.js'),
        path.join(rootPath, 'server/site/public/javascripts/controllers/questionController.js'),
        path.join(rootPath, 'server/site/public/javascripts/controllers/pagingController.js'),
        path.join(rootPath, 'server/site/public/javascripts/views/questionsView.js'),
        path.join(rootPath, 'server/site/public/javascripts/views/pagingView.js'),
        path.join(rootPath, 'server/site/public/javascripts/views/tagView.js')
    ];
    combiner.combine(questionsFiles, path.join(rootPath, 'server/site/public/_min/js/questions.combined.js'), true, true);
    combiner.init();

    var searchFiles = [
        path.join(rootPath, 'server/site/public/javascripts/router/freeSearchRouter.js'),
        path.join(rootPath, 'server/site/public/javascripts/models/paging.js'),
        path.join(rootPath, 'server/site/public/javascripts/controllers/entityController.js'),
        path.join(rootPath, 'server/site/public/javascripts/controllers/pagingController.js'),
        path.join(rootPath, 'server/site/public/javascripts/views/entitiesView.js'),
        path.join(rootPath, 'server/site/public/javascripts/views/pagingView.js')
    ];
    combiner.combine(searchFiles, path.join(rootPath, 'server/site/public/_min/js/search.combined.js'), true, true);
    combiner.init();

    var newTagFiles = [
        path.join(rootPath, 'server/site/public/javascripts/router/new-tagRouter.js'),
        path.join(rootPath, 'server/site/public/javascripts/infra/prettify.js'),
        path.join(rootPath, 'server/site/public/javascripts/controllers/newtagController.js'),
        path.join(rootPath, 'server/site/public/javascripts/views/newtagView.js')
    ];
    combiner.combine(newTagFiles, path.join(rootPath, 'server/site/public/_min/js/newTag.combined.js'), true, true);
    combiner.init();

    var tagsFiles = [
        path.join(rootPath, 'server/site/public/javascripts/router/tagsRouter.js'),
        path.join(rootPath, 'server/site/public/javascripts/models/tag.js'),
        path.join(rootPath, 'server/site/public/javascripts/models/paging.js'),
        path.join(rootPath, 'server/site/public/javascripts/controllers/tagsController.js'),
        path.join(rootPath, 'server/site/public/javascripts/controllers/pagingController.js'),
        path.join(rootPath, 'server/site/public/javascripts/views/tagsView.js'),
        path.join(rootPath, 'server/site/public/javascripts/views/pagingView.js')
    ];
    combiner.combine(tagsFiles, path.join(rootPath, 'server/site/public/_min/js/tags.combined.js'), true, true);
    combiner.init();

    var tagwikiFiles = [
        path.join(rootPath, 'server/site/public/javascripts/router/tagwikiRouter.js'),
        path.join(rootPath, 'server/site/public/javascripts/models/tagwiki.js'),
        path.join(rootPath, 'server/site/public/javascripts/controllers/tagwikiController.js'),
        path.join(rootPath, 'server/site/public/javascripts/views/tagwikiView.js'),
    ];
    combiner.combine(tagwikiFiles, path.join(rootPath, 'server/site/public/_min/js/tagwiki.combined.js'), true, true);
    combiner.init();

    var userFiles = [
        path.join(rootPath, 'server/site/public/javascripts/router/userRouter.js'),
        path.join(rootPath, 'server/site/public/javascripts/models/user.js'),
        path.join(rootPath, 'server/site/public/javascripts/models/paging.js'),
        path.join(rootPath, 'server/site/public/javascripts/controllers/userController.js'),
        path.join(rootPath, 'server/site/public/javascripts/controllers/pagingController.js'),
        path.join(rootPath, 'server/site/public/javascripts/views/userView.js'),
        path.join(rootPath, 'server/site/public/javascripts/views/pagingView.js')
    ];
    combiner.combine(userFiles, path.join(rootPath, 'server/site/public/_min/js/user.combined.js'), true, true);
    combiner.init();

    var usersFiles = [
        path.join(rootPath, 'server/site/public/javascripts/router/usersRouter.js'),
        path.join(rootPath, 'server/site/public/javascripts/models/paging.js'),
        path.join(rootPath, 'server/site/public/javascripts/controllers/usersController.js'),
        path.join(rootPath, 'server/site/public/javascripts/controllers/pagingController.js'),
        path.join(rootPath, 'server/site/public/javascripts/views/usersView.js'),
        path.join(rootPath, 'server/site/public/javascripts/views/pagingView.js')
    ];
    combiner.combine(usersFiles, path.join(rootPath, 'server/site/public/_min/js/users.combined.js'), true, true);
    combiner.init();
};