(function() {
    var _cookieManager = function () {

        this.setCookie = function (name, value, minutes, erase) {
            var expires = '';
            if (minutes) {
                var date = new Date();
                date.setTime(date.getTime() + (minutes*60*1000));
                expires = "; expires=" + date.toGMTString();
            }

            if (!erase) {
                //for now lets make this a session cookie if it is not an erase
                if (!global.Appacitive.Session.persistUserToken) expires = '';
                else expires = "; expires=" +  new Date("2020-12-31").toGMTString();
            } else {
                expires = '; expires=Thu, 01-Jan-1970 00:00:01 GMT';
            }
            var domain = 'domain=appacitive.com';
            
            document.cookie = name + "=" + value + expires + "; path=/;" + domain;
        };

        this.readCookie = function (name) {
            var nameEQ = name + "=";
            var ca = document.cookie.split(';');
            for (var i=0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') c = c.substring(1,c.length);
                if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length,c.length);
            }
            return null;
        };

        this.eraseCookie = function (name) {
            this.setCookie(name, "" ,-1, true);
        };

    };

    window.Cookie = new _cookieManager();
	Deific.HeaderView =  Ember.View.extend({
    	templateName: 'header',

        didInsertElement: function() {
            var query = $.fn.parseParam('q');
            if(!query || query === '') return;
            this.set('searchtext', decodeURIComponent(query).replace(/\+/g, ' '));
            $(this.get('element')).find('.searchbox > input').focus();
        },

    	submitTextField: Ember.TextField.extend({
			insertNewline: function() {
		        return this.get('parentView').search();
	   		}
		}),

    	search: function() {
            //get the search query
    		var query = this.get('searchtext');
    		
    		//validation
    		if(!query || query.trim() === '') return;

            //set the search in query string
            query = encodeURIComponent(query).replace(/%20/g, '+');
    		window.location = window.host + '/search?q=' + query;
    	},

    	signOut: function() {
            return Deific.AccountController.signOut(function(data) {
				Cookie.eraseCookie("__app_session");
                Cookie.eraseCookie("_app_session_user");
                //reload the page
                window.location.reload();
				}, function(error) {
					var alert = '<div class="alert alert-block alert-danger font9">' +
              						'<button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>' +
              						'An error occurred during logging you out.' +
            					'</div>';
					$(".logoutError").html(alert).alert();
				});
    	}
	});
}).call(this);