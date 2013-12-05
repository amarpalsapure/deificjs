(function() {
    Deific.ConfigurationsView = Ember.View.extend({
        brand: '',
        appId: '',
        apikey: '',
        env: '',
        sa: '',
        host: '',
        allowsignup: '',
        feedbackemail: '',
        fbappid: '',
        twitter_consumer_key: '',
        twitter_consumer_secret: '',
        upvotepts: '',
        downvotepts: '',
        answerpts: '',
        pagesize: '',
        maxpagecount: '',
        comments: '',

        didInsertElement: function(){
            var that = this;
            
		    //remove loader
		    $('#rootProgress').remove();
            
            //get the store
		    var store = this.get('controller').get('store');

            //render the existing configuration
		    store.find('configuration', 'brand').then(function (item) { that.set('brand', item.get('value')); });
		    store.find('configuration', 'appId').then(function (item) { that.set('appId', item.get('value')); });
		    store.find('configuration', 'apikey').then(function (item) { that.set('apikey', item.get('value')); });
		    store.find('configuration', 'env').then(function (item) { that.set('env', item.get('value')); });
		    store.find('configuration', 'sa').then(function (item) { that.set('sa', item.get('value')); });
		    store.find('configuration', 'host').then(function (item) { that.set('host', item.get('value')); });
		    store.find('configuration', 'allowsignup').then(function (item) { that.set('allowsignup', item.get('value')); });
		    store.find('configuration', 'feedbackemail').then(function (item) { that.set('feedbackemail', item.get('value')); });
		    store.find('configuration', 'fbappid').then(function (item) { that.set('fbappid', item.get('value')); });
		    store.find('configuration', 'twitter_consumer_key').then(function (item) { that.set('twitter_consumer_key', item.get('value')); });
		    store.find('configuration', 'twitter_consumer_secret').then(function (item) { that.set('twitter_consumer_secret', item.get('value')); });
		    store.find('configuration', 'upvotepts').then(function (item) { that.set('upvotepts', item.get('value')); });
		    store.find('configuration', 'downvotepts').then(function (item) { that.set('downvotepts', item.get('value')); });
		    store.find('configuration', 'answerpts').then(function (item) { that.set('answerpts', item.get('value')); });
		    store.find('configuration', 'pagesize').then(function (item) { that.set('pagesize', item.get('value')); });
		    store.find('configuration', 'maxpagecount').then(function (item) { that.set('maxpagecount', item.get('value')); });
		    store.find('configuration', 'comments').then(function (item) { that.set('comments', item.get('value')); });
		},

        saveConfiguration: function () {
            var that = this;

            $('#btnSubmit').button('loading');

            var newConfig = {
                brand: that.get('brand'),
                appId: that.get('appId'),
                apikey: that.get('apikey'),
                env: that.get('env'),
                sa: that.get('sa'),
                host: that.get('host'),
                allowsignup: that.get('allowsignup'),
                feedbackemail: that.get('feedbackemail'),
                fbappid: that.get('fbappid'),
                twitter_consumer_key: that.get('twitter_consumer_key'),
                twitter_consumer_secret: that.get('twitter_consumer_secret'),
                upvotepts: that.get('upvotepts'),
                downvotepts: that.get('downvotepts'),
                answerpts: that.get('answerpts'),
                pagesize: that.get('pagesize'),
                maxpagecount: that.get('maxpagecount'),
                comments: that.get('comments'),
            };

            that.get('controller').saveConfiguration(newConfig, function () {
                $('#btnSubmit').button('reset');
                setTimeout(function () {
                    window.location = window.host;
                }, 1000);
		    }, function (message) {
		        //do the error handling
		        //errors can be session expired or bad gateway
		        //reset button state to loading (Bootstrap)
		        message = message || 'An error occurred while saving configurations.';
		        var alert = '<div class="alert alert-block alert-danger font9"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>' + message + '</div>';
		        $('.configError').html(alert).alert();

		        $('#btnSubmit').button('reset');
		    });
		}
	});
}).call(this);