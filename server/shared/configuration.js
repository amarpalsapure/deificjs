exports.load = function () {
   var config = {
        apikey: 'YOUR API KEY', 
        env: 'sandbox', 
        appId: 'APPLICATION ID',
        brand: 'YOUR BRAND NAME',
        fbappid: 'YOUR FACEBOOK APP ID', //make it empty, if you don't want user to login using facebook
        twitter_consumer_key: 'TWITTER CONSUMER KEY', //make it empty, if you don't want user to login using twitter
        twitter_consumer_secret: 'TWITTER CONSUMER SECRET',
        host: '',
        allowsignup: true, //Do you want to allow signups from login page
        upvotepts: 10,
        downvotepts: 5,
        answerpts: 20,
        pagesize: 5,                      //max items per page
        maxpagecount: 3,                  //on paging control maximum page counter will be visible
        comments: 4                       //max comments will be visible by default
   };
   if(config.host == '') throw Error('Set the host in config');

   return config;
};
