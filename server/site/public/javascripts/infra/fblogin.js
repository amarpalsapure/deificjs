window.fbAsyncInit = function() {
FB.init({
  appId      : window.init.config.fbappid,                        // App ID from the app dashboard
  channelUrl : 'http://localhost',
  status     : true, // check login status
  cookie     : true, // enable cookies to allow the server to access the session
  xfbml      : false  // parse XFBML
});

};

// Load the SDK asynchronously
(function(d){
 var js, id = 'facebook-jssdk', ref = d.getElementsByTagName('script')[0];
 if (d.getElementById(id)) {return;}
 js = d.createElement('script'); js.id = id; js.async = true;
 js.src = "//connect.facebook.net/en_US/all.js";
 ref.parentNode.insertBefore(js, ref);
}(document));