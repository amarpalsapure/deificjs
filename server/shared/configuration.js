exports.load = function () {
   var config = {
        apikey: 'YOUR API KEY', 
        env: 'sandbox', 
        appId: 'APPLICATION ID',
        brand: 'YOUR BRAND NAME',
        host: '',
        upvotepts: 10,
        downvotepts: 5,
        answerpts: 20
   };
   if(config.host == '') throw Error('Set the host in config');

   return config;
};
