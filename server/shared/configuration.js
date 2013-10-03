exports.load = function () {
   var config = {
        apikey: 'YOUR API KEY', 
        env: 'sandbox', 
        appId: 'APPLICATION ID',
        brand: 'YOUR BRAND NAME',
        host: '',
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
