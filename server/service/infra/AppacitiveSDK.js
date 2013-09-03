/*
 * AppacitiveSDK.js v0.995 - Javascript SDK to integrate applictions using Appacitive
 * Copyright (c) 2013 Appacitive Software Pvt Ltd
 * MIT license  : http://www.apache.org/licenses/LICENSE-2.0.html
 * Project      : https://github.com/chiragsanghvi/JavascriptSDK
 * Contact      : support@appacitive.com | csanghvi@appacitive.com
 * Build time 	: Sat Aug 31 10:43:57 IST 2013
 */

// Add ECMA262-5 method binding if not supported natively
//
if (!('bind' in Function.prototype)) {
    Function.prototype.bind= function(owner) {
        var that= this;
        if (arguments.length<=1) {
            return function() {
                return that.apply(owner, arguments);
            };
        } else {
            var args= Array.prototype.slice.call(arguments, 1);
            return function() {
                return that.apply(owner, arguments.length===0? args : args.concat(Array.prototype.slice.call(arguments)));
            };
        }
    };
}

// Add ECMA262-5 string trim if not supported natively
//
if (!('trim' in String.prototype)) {
    String.prototype.trim= function() {
        return this.replace(/^\s+/, '').replace(/\s+$/, '');
    };
}


// Add ECMA262-5 Array methods if not supported natively
//
if (!('indexOf' in Array.prototype)) {
    Array.prototype.indexOf= function(find, i /*opt*/) {
        if (i===undefined) i= 0;
        if (i<0) i+= this.length;
        if (i<0) i= 0;
        for (var n= this.length; i<n; i++)
            if (i in this && this[i]===find)
                return i;
        return -1;
    };
}
if (!('lastIndexOf' in Array.prototype)) {
    Array.prototype.lastIndexOf= function(find, i /*opt*/) {
        if (i===undefined) i= this.length-1;
        if (i<0) i+= this.length;
        if (i>this.length-1) i= this.length-1;
        for (i++; i-->0;) /* i++ because from-argument is sadly inclusive */
            if (i in this && this[i]===find)
                return i;
        return -1;
    };
}
if (!('forEach' in Array.prototype)) {
    Array.prototype.forEach= function(action, that /*opt*/) {
        for (var i= 0, n= this.length; i<n; i++)
            if (i in this)
                action.call(that, this[i], i, this);
    };
}
if (!('map' in Array.prototype)) {
    Array.prototype.map= function(mapper, that /*opt*/) {
        var other= new Array(this.length);
        for (var i= 0, n= this.length; i<n; i++)
            if (i in this)
                other[i]= mapper.call(that, this[i], i, this);
        return other;
    };
}
if (!('filter' in Array.prototype)) {
    Array.prototype.filter= function(filter, that /*opt*/) {
        var other= [], v;
        for (var i=0, n= this.length; i<n; i++)
            if (i in this && filter.call(that, v= this[i], i, this))
                other.push(v);
        return other;
    };
}
if (!('every' in Array.prototype)) {
    Array.prototype.every= function(tester, that /*opt*/) {
        for (var i= 0, n= this.length; i<n; i++)
            if (i in this && !tester.call(that, this[i], i, this))
                return false;
        return true;
    };
}
if (!('some' in Array.prototype)) {
    Array.prototype.some= function(tester, that /*opt*/) {
        for (var i= 0, n= this.length; i<n; i++)
            if (i in this && tester.call(that, this[i], i, this))
                return true;
        return false;
    };
}
// Override only if native toISOString is not defined
if (!Date.prototype.toISOString) {
    // Here we rely on JSON serialization for dates because it matches 
    // the ISO standard. However, we check if JSON serializer is present 
    // on a page and define our own .toJSON method only if necessary
    if (!Date.prototype.toJSON) {
        Date.prototype.toJSON = function (key) {
            function f(n) {
                // Format integers to have at least two digits.
                return n < 10 ? '0' + n : n;
        }

        return this.getUTCFullYear()   + '-' +
            f(this.getUTCMonth() + 1) + '-' +
            f(this.getUTCDate())      + 'T' +
            f(this.getUTCHours())     + ':' +
            f(this.getUTCMinutes())   + ':' +
            f(this.getUTCSeconds())   + 'Z';
        };
    }

    Date.prototype.toISOString = Date.prototype.toJSON;
}
// monolithic file

var global = {};

(function () {

	"use strict";

	// create the global object

	if (typeof window == 'undefined') {
		global = process;
	} else {
		global = window;
	}

	var _initialize = function () {
		var t;
		if (!global.Appacitive) {
			global.Appacitive = {
				runtime: {
					isNode: typeof process != typeof t,
					isBrowser: typeof window != typeof t
				}
			};
		}
	};
	_initialize();

	// httpBuffer class, stores a queue of the requests
	// and fires them. Global level pre and post processing 
	// goes here. 
	// requires httpTransport class that is able to actually 
	// send the request and receive the response
	/**
	 * @constructor
	 */
	var HttpBuffer = function (httpTransport) {

		// validate the httpTransport passed
		// and assign the callback
		if (!httpTransport || !httpTransport.send || typeof httpTransport.send != 'function') {
			throw new Error('No applicable httpTransport class found');
		} else {
			httpTransport.onResponse = this.onResponse;
		}

		// internal handle to the http requests
		var _queue = [];

		// handle to the list of pre-processing functions
		var _preProcessors = {}, _preCount = 0;

		// handle to the list of post-processing functions
		var _postProcessors = {}, _postCount = 0;

		// public method to add a processor
		this.addProcessor = function (processor) {
			if (!processor) return;
			processor.pre = processor.pre || function () {};
			processor.post = processor.post || function () {};

			addPreprocessor(processor.pre);
			addPostprocessor(processor.post);
		};

		// stores a preprocessor
		// returns a numeric id that can be used to remove this processor
		var addPreprocessor = function (preprocessor) {
			_preCount += 1;
			_preProcessors[_preCount] = preprocessor;
			return _preCount;
		};

		// removes a preprocessor
		// returns true if it exists and has been removed successfully
		// else false
		var removePreprocessor = function (id) {
			if (_preProcessors[id]) {
				delete(_preProcessors[id]);
				return true;
			} else {
				return false;
			}
		};

		// stores a postprocessor
		// returns a numeric id that can be used to remove this processor
		var addPostprocessor = function (postprocessor) {
			_postCount += 1;
			_postProcessors[_postCount] = postprocessor;
			return _postCount;
		};

		// removes a postprocessor
		// returns true if it exists and has been removed successfully
		// else false
		var removePostprocessor = function (id) {
			if (_postProcessors[id]) {
				delete(_postProcessors[id]);
				return true;
			} else {
				return false;
			}
		};

		// enqueues a request in the queue
		// returns true is succesfully added
		this.enqueueRequest = function (request) {
			_queue.push(request);
		};


		this.changeRequestForCors = function(request) {
			var body = {
				m : request.method.toUpperCase()
			};
			request.headers.forEach(function(h) {
				body[h.key] = h.value;
			});
			request.headers = [];
			request.headers.push({ key:'Content-Type', value: 'text/plain' });
			request.method = 'POST';

			if (request.data) body.b = request.data
			delete request.data;
			
			if (global.Appacitive.config.debug) {
				if (request.url.indexOf('?') == -1) request.url = request.url + '?debug=true';
				else request.url = request.url + '&debug=true';
			}

			try { request.data = JSON.stringify(body); } catch(e) {}
			return request;
		};

		// notifies the queue that there are requests pending
		// this will start firing the requests via the method 
		// passed while initalizing
		this.notify = function () {
			if (_queue.length === 0) return;

			// for convienience, extract the postprocessing object into an array
			var _callbacks = [];
			for (var processor in _postProcessors) {
				if (_postProcessors.hasOwnProperty(processor)) {
					_callbacks.push(_postProcessors[processor]);
				}
			}

			while (_queue.length > 0) {
				var toFire = _queue.shift();

				// execute the preprocessors
				// if they return anything, pass it along
				// to be able to access it in the post processing callbacks
				var _state = [];
				for (var processor in _preProcessors) {
					if (_preProcessors.hasOwnProperty(processor)) {
						_state.push(_preProcessors[processor](toFire));
					}
				}

				this.changeRequestForCors(toFire);

				// send the requests
				// and the callbacks and the 
				// results returned from the preprocessors
				httpTransport.send(toFire, _callbacks, _state);
			}
		};

		// callback to be invoked when a request has completed
		this.onResponse = function (responseData) {
			console.dir(responseData);
		};

	};

	// base httpTransport class
	/**
	 * @constructor
	 */
	var _HttpTransport = function () {
		var _notImplemented = function () {
			throw new Error('Not Implemented Exception');
		}
		var _notProvided = function () {
			throw new Error('Delegate not provided');
		}

		// implements this
		this.send = _notImplemented;
		this.inOnline = _notImplemented;

		// needs these callbacks to be set
		this.onResponse = function (response, request) {
			_notImplemented()
		};
		this.onError = function (request) {
			_notImplemented()
		};
	};

	// base xmlhttprequest class
	/**
	  * @constructor
	  */

	var _XMLHttpRequest = null;

	_XMLHttpRequest = (global.Appacitive.runtime.isBrowser) ?  XMLHttpRequest : require('xmlhttprequest').XMLHttpRequest;

	var _XDomainRequest = function(request) {
	    var xdr = new XDomainRequest();
	    xdr.onload = function() {
  			var response = xdr.responseText;
			try {
				var contentType = xdr.contentType;
				if (contentType.toLowerCase() == 'application/json' ||  contentType.toLowerCase() == 'application/javascript' || contentType.toLowerCase() == 'application/json; charset=utf-8' || contentType.toLowerCase() == 'application/json; charset=utf-8;') { 
					var jData = response;
					if (!global.Appacitive.runtime.isBrowser) {
						if (jData[0] != "{") {
							jData = jData.substr(1, jData.length - 1);
						}
					}
					response = JSON.parse(jData);
				}
			} catch(e) {}
            request.onSuccess(response, this);       
	    };
	    xdr.onerror = xdr.ontimeout = function() {
	       request.onError({code: "400" , message: "Server Error" }, xdr);
	    };
	    xdr.onprogress = function() {};
	    if (request.url.indexOf('?') == -1)
            request.url = request.url + '?ua=ie';
        else
            request.url = request.url + '&ua=ie';

	    xdr.open(request.method, request.url, true);
	    xdr.send(request.data);
		return xdr;
	};


	var _XMLHttp = function(request) {

		if (!request.url) throw new Error("Please specify request url");
		if (!request.method) request.method = 'GET' ;
		if (!request.headers) request.headers = [];
		var data = {};
		
		var doNotStringify = true;
		request.headers.forEach(function(r){
			if (r.key.toLowerCase() == 'content-type') {
				doNotStringify = true;
				if (r.value.toLowerCase() == 'application/json' || r.value.toLowerCase() == "application/javascript" || r.value.toLowerCase() == 'application/json; charset=utf-8' || r.value.toLowerCase() == 'application/json; charset=utf-8;') {
					doNotStringify = false;
				}
			}
		});


		if (doNotStringify) data = request.data;
		else {
			if (request.data) { 
				data = request.data;
				if (typeof request.data == 'object') {
					try { data = JSON.stringify(data); } catch(e) {}
				}
			}
		}

		if (!request.onSuccess || typeof request.onSuccess != 'function') request.onSuccess = function() {};
	    if (!request.onError || typeof request.onError != 'function') request.onError = function() {};
	    
	    if (global.navigator && (global.navigator.userAgent.indexOf('MSIE 8') != -1 || global.navigator.userAgent.indexOf('MSIE 9') != -1)) {
	    	request.data = data;
			var xdr = new _XDomainRequest(request);
			return xdr;
	    } else {
		    var xhr = new _XMLHttpRequest();
		    xhr.onreadystatechange = function() {
		    	if (this.readyState == 4) {
			    	if ((this.status >= 200 && this.status < 300) || this.status == 304) {
						var response = this.responseText;
						try {
							var contentType = this.getResponseHeader('content-type') || this.getResponseHeader('Content-Type');
							if (contentType.toLowerCase() == 'application/json' ||  contentType.toLowerCase() == 'application/javascript' || contentType.toLowerCase() == 'application/json; charset=utf-8' || contentType.toLowerCase() == 'application/json; charset=utf-8;') { 
								var jData = response;
								if (!global.Appacitive.runtime.isBrowser) {
									if (jData[0] != "{") {
										jData = jData.substr(1, jData.length - 1);
									}
								}
								response = JSON.parse(jData);
							}
						} catch(e) {}
			            request.onSuccess(response, this);
			        } else {
			        	request.onError({code: this.status , message: this.statusText }, this);
			        }
		    	}
		    };
		    xhr.open(request.method, request.url, true);
		    for (var x = 0; x < request.headers.length; x += 1)
				xhr.setRequestHeader(request.headers[x].key, request.headers[x].value);
			if (!global.Appacitive.runtime.isBrowser)
				xhr.setRequestHeader('User-Agent', 'Appacitive-NodeJSSDK'); 
		    xhr.send(data);
		    return xhr;
		}
	};


	// httpRequest class, encapsulates the request 
	// without bothering about how it is going to be fired.
	/**
	 * @constructor
	 */
	var HttpRequest = function (o) {
		o = o || {};
		this.url = o.url || '';
		this.data = o.data || {};
		this.headers = o.headers || [];
		this.method = o.method || 'GET';
		this.onSuccess = o.onSuccess || function(){}
		this.onError = o.onError || function(){}

		this.send = function(doNotStringify) {
			return new _XMLHttp(this, doNotStringify);
		};
	};

	// browser based http transport class
	/**
	 * @constructor
	 */
	var BasicHttpTransport = function () {

		var _super = new _HttpTransport();

		_super.isOnline = function () { return true; };

		var _executeCallbacks = function (response, callbacks, states) {
			if (callbacks.length != states.length) {
				throw new Error('Callback length and state length mismatch!');
			}
			for (var x = 0; x < callbacks.length; x += 1) {
				callbacks[x].apply({}, [response, states[x]]);
			}
		};

		var that = _super;

		var _trigger = function(request, callbacks, states) {
			var xhr = new  _XMLHttp({
				method: request.method,
				url: request.url,
				headers: request.headers,
				data: request.data,
				onSuccess: function(data, xhr) {
					if (!data) {
					 	that.onError(request, { code:'400', messgae: 'Invalid request' });
						return;
					}
					try{ data = JSON.parse(data);} catch(e){}
					// execute the callbacks first
					_executeCallbacks(data, callbacks, states);
					that.onResponse(data, request);
				},
				onError: function(e) {
					that.onError(request, e);
				}
			});
		}

		_super.send = function (request, callbacks, states) {
			if (!global.Appacitive.Session.initialized) throw new Error("Initialize Appacitive SDK");
			if (typeof request.beforeSend == 'function') {
				request.beforeSend(request);
			}
			_trigger(request, callbacks, states);
		};

		_super.upload = function (request, callbacks, states) {
			if (typeof request.beforeSend == 'function') {
				request.beforeSend(request);
			}
			_trigger(request, callbacks, states, true);
		};

		return _super;
	};

	// http functionality provider
	/**
	 * @constructor
	 */
	var HttpProvider = function () {

		// actual http provider
		//var _inner = global.Appacitive.runtime.isBrowser ? new JQueryHttpTransport() : new NodeHttpTransport();
		var _inner = new BasicHttpTransport();

		// the http buffer
		var _buffer = new HttpBuffer(_inner);

		// used to pause/unpause the provider
		var _paused = false;

		// allow pausing/unpausing
		this.pause = function () {
			_paused = true;
		}
		this.unpause = function () {
			_paused = false;
		}

		// allow adding processors to the buffer
		this.addProcessor = function (processor) {
			var _processorError = new Error('Must provide a processor object with either a "pre" function or a "post" function.');
			if (!processor) throw _processorError;
			if (!processor.pre && !processor.post) throw _processorError;

			_buffer.addProcessor(processor);
		}

		// the method used to send the requests
		this.send = function (request) {
			_buffer.enqueueRequest(request);

			// notify the queue if the actual transport 
			// is ready to send the requests
			if (_inner.isOnline() && _paused == false) {
				_buffer.notify();
			}
		}

		// method used to clear the queue
		this.flush = function (force) {
			if (!force) {
				if (_inner.isOnline()) {
					_buffer.notify();
				}
			} else {
				_buffer.notify();
			}
		}

		// the error handler
		this.onError = function (request, err) {
			if (request.onError) {
				if (request.context) {
					request.onError.apply(request.context, [err]);
				} else {
					request.onError(err);
				}
			}
		}
		_inner.onError = this.onError;

		// the success handler
		this.onResponse = function (response, request) {
			if (request.onSuccess) {
				if (request.context) {
					request.onSuccess.apply(request.context, [response]);
				} else {
					request.onSuccess(response);
				}
			}
		}
		_inner.onResponse = this.onResponse;
	};

	// create the http provider and the request
	global.Appacitive.http = new HttpProvider();
	global.Appacitive.HttpRequest = HttpRequest;

	/* PLUGIN: Http Utilities */

	// compulsory plugin
	// handles session and shits
	(function (global) {

		if (!global.Appacitive) return;
		if (!global.Appacitive.http) return;

		global.Appacitive.http.addProcessor({
			pre: function (request) {
				return request;
			},
			post: function (response, request) {
				try {
					var _valid = global.Appacitive.Session.isSessionValid(response);
					if (!_valid.status) {
						if (_valid.isSession) {
							if (global.Appacitive.Session.get() != null) {
								global.Appacitive.Session.resetSession();
							}
							global.Appacitive.http.send(request);
						}
					} else {
						if (response && ((response.status && response.status.code && response.status.code == '8036') || (response.code &&response.code == '8036'))) {
							global.Appacitive.Users.logout(function(){}, true);
						} else {
							global.Appacitive.Session.incrementExpiry();
						}
					}
				} catch(e){}
			}
		});

		global.Appacitive.http.addProcessor({
			pre: function (req) {
				return new Date().getTime()
			},
			post: function (response, state) {
				var timeSpent = new Date().getTime() - state;
				response._timeTakenInMilliseconds = timeSpent;
			}
		});

	})(global);

	/* Http Utilities */

})();(function (global) {
    /**
     * @param {...string} var_args
     */
    String.format = function (text, var_args) {
        if (arguments.length <= 1) {
            return text;
        }
        var tokenCount = arguments.length - 2;
        for (var token = 0; token <= tokenCount; token++) {
            //iterate through the tokens and replace their placeholders from the original text in order
            text = text.replace(new RegExp("\\{" + token + "\\}", "gi"),
                                                arguments[token + 1]);
        }
        return text;
    };
    String.prototype.toPascalCase = function () {
        return this.charAt(0).toUpperCase() + this.slice(1);
    };
    String.prototype.trimChar = function (char1) {
        var pattern = new RegExp("^" + char1);
        var returnStr = this;
        if (pattern.test(returnStr)) returnStr = returnStr.slice(1, returnStr.length);
        pattern = new RegExp(char1 + "$");
        if (pattern.test(returnStr)) returnStr = returnStr.slice(0, -1);
        return returnStr;
    };
    String.toSearchString = function (text) {
        if (typeof (text) == 'undefined')
            text = '';

        var result = '';
        for (var x = 0; x < text.length; x = x + 1) {
            if (' .,;#'.indexOf(text[x]) == -1)
                result += text[x];
        }

        result = result.toLowerCase();

        return result;
    };

    String.contains = function (s1, s2) {
        return (s1.indexOf(s2) != -1);
    }

    String.startsWith = function (s1, s2) {
        return (s1.indexOf(s2) == 0);
    };

    Array.distinct = function(orgArr) {
        var newArr = [],
            origLen = orgArr.length,
            found,
            x, y;
            
        for ( x = 0; x < origLen; x++ ) {
            found = undefined;
            for ( y = 0; y < newArr.length; y++ ) {
                if ( orgArr[x].toLowerCase() === newArr[y].toLowerCase() ) { 
                  found = true;
                  break;
                }
            }
            if (!found) newArr.push(orgArr[x]);    
        }
       return newArr;
    };

    Object.isEmpty = function (object) {
        if(!object) return true;
        var isEmpty = true;
        for (keys in object) {
            isEmpty = false; 
            break; // exiting since we found that the object is not empty
        }
        return isEmpty;
    }

    global.dateFromWcf = function (input, throwOnInvalidInput) {
        var pattern = /Date\(([^)]+)\)/;
        var results = pattern.exec(input);
        if (results.length != 2) {
            if (!throwOnInvalidInput) {
                return s;
            }
            throw new Error(s + " is not .net json date.");
        }
        return new Date(parseFloat(results[1]));
    };

    /**
     * @constructor
     */
    var UrlFactory = function () {

        global.Appacitive.bag = global.Appacitive.bag || {};
        
        var baseUrl = (global.Appacitive.config || { apiBaseUrl: '' }).apiBaseUrl;
        
        var _getFields = function(fields) {
            if (typeof fields == 'object' && fields.length > 0 && (typeof fields[0] == 'string' || typeof fields[0] == 'number')) fields = fields.join(',');
            if (!fields) fields = '';
            return fields;
        };

        this.email = {
            emailServiceUrl: 'email',
            
            getSendEmailUrl: function() {
                return String.format("{0}/send", this.emailServiceUrl)
            }
        };
        this.user = {

            userServiceUrl:  'user',

            getCreateUrl: function (fields) {
                return String.format("{0}/create?fields={1}", this.userServiceUrl, _getFields(fields));
            },
            getAuthenticateUserUrl: function () {
                return String.format("{0}/authenticate", this.userServiceUrl);
            },
            getGetUrl: function (userId, fields) {
                return String.format("{0}/{1}?fields={2}", this.userServiceUrl, userId, _getFields(fields));
            },
            getUserByTokenUrl: function(userToken) {
                return String.format("{0}/me?useridtype=token&token=", this.userServiceUrl, userToken);
            },
            getUserByUsernameUrl: function(username) {
                return String.format("{0}/{1}?useridtype=username", this.userServiceUrl, username);
            },
            getUpdateUrl: function (userId, fields) {
                return String.format("{0}/{1}?fields={2}", this.userServiceUrl, userId, _getFields(fields));
            },
            getDeleteUrl: function (userId) {
                return String.format("{0}/{1}", this.userServiceUrl, userId);
            },
            getGetAllLinkedAccountsUrl: function(userId) {
                var url = String.format("{0}/{1}/linkedaccounts", this.userServiceUrl, userId);
                return url;
            },
            getValidateTokenUrl: function(token) {
                return String.format("{0}/validate?userToken={1}", this.userServiceUrl, token);
            },
            getInvalidateTokenUrl: function(token) {
                return String.format("{0}/invalidate?userToken={1}", this.userServiceUrl, token);
            },
            getSendResetPasswordEmailUrl: function() {
                return String.format("{0}/sendresetpasswordemail", this.userServiceUrl);
            },
            getUpdatePasswordUrl: function(userId) {
                return String.format("{0}/{1}/changepassword", this.userServiceUrl, userId);
            },
            getLinkAccountUrl: function(userId) {
                return String.format("{0}/{1}/link", this.userServiceUrl, userId);
            },
            getDelinkAccountUrl: function(userId, type){
                return String.format("{0}/{1}/{2}/delink", this.userServiceUrl, userId, type);
            },
            getCheckinUrl: function(userId, lat, lng) {
                return String.format("{0}/{1}/chekin?lat={2}&lng={3}", this.userServiceUrl, userId, lat, lng);
            },
            getResetPasswordUrl: function(token) {
                return String.format("{0}/resetpassword?token={1}", this.userServiceUrl, token);
            },
            getValidateResetPasswordUrl: function(token) {
                return String.format("{0}/validateresetpasswordtoken?token={1}", this.userServiceUrl, token);
            }
        };
        this.device = {
            deviceServiceUrl: 'device',

            getCreateUrl: function (fields) {
                return String.format("{0}/register?fields={1}", this.deviceServiceUrl, _getFields(fields));
            },
            getGetUrl: function (deviceId, fields) {
                return String.format("{0}/{1}?fields={2}", this.deviceServiceUrl, deviceId, _getFields(fields));
            },
            getUpdateUrl: function (deviceId, fields) {
                return String.format("{0}/{1}?fields={2}", this.deviceServiceUrl, deviceId, _getFields(fields));
            },
            getDeleteUrl: function (deviceId) {
                return String.format("{0}/{1}", this.deviceServiceUrl, deviceId);
            }
        };
        this.article = {
            articleServiceUrl: 'article',

            getSearchAllUrl: function (schemaName, queryParams, pageSize) {
                var url = '';

                url = String.format('{0}/search/{1}/all', this.articleServiceUrl, schemaName);

                if (pageSize)
                    url = url + '?psize=' + pageSize;
                else
                    url = url + '?psize=10';
                if (typeof (queryParams) !== 'undefined' && queryParams.length > 0) {
                    for (var i = 0; i < queryParams.length; i = i + 1) {
                        if (queryParams[i].trim().length == 0) continue;
                        url = url + "&" + queryParams[i];
                    }
                }
                return url;
            },
            getProjectionQueryUrl: function() {
                return String.format('{0}/search/project', this.articleServiceUrl);
            },
            getPropertiesSearchUrl: function (schemaName, query) {
                return String.format('{0}/search/{1}/all?properties={2}', this.articleServiceUrl, schemaName, query);
            },
            getMultiGetUrl: function (schemaName, articleIds, fields) {
                return String.format('{0}/{1}/multiGet/{2}?fields={3}', this.articleServiceUrl, schemaName, articleIds, _getFields(fields));
            },
            getCreateUrl: function (schemaName, fields) {
                return String.format('{0}/{1}?fields={2}', this.articleServiceUrl, schemaName, _getFields(fields));
            },
            getGetUrl: function (schemaName, articleId, fields) {
                return String.format('{0}/{1}/{2}?fields={3}', this.articleServiceUrl, schemaName, articleId, _getFields(fields));
            },
            getUpdateUrl: function (schemaName, articleId, fields) {
                return String.format('{0}/{1}/{2}?fields={3}', this.articleServiceUrl, schemaName, articleId, _getFields(fields));
            },
            getDeleteUrl: function (schemaName, articleId) {
                return String.format('{0}/{1}/{2}', this.articleServiceUrl, schemaName, articleId);
            },
            getMultiDeleteUrl: function (schemaName) {
                return String.format('{0}/{1}/bulkdelete', this.articleServiceUrl, schemaName);
            }
        };
        this.connection = {

            connectionServiceUrl: 'connection',

            getGetUrl: function (relationName, connectionId, fields) {
                return String.format('{0}/{1}/{2}?fields={3}', this.connectionServiceUrl, relationName, connectionId, _getFields(fields));
            },
            getMultiGetUrl: function (relationName, connectionIds, fields) {
                return String.format('{0}/{1}/multiGet/{2}?fields={3}', this.connectionServiceUrl, relationName, connectionIds, _getFields(fields));
            },
            getCreateUrl: function (relationName, fields) {
                return String.format('{0}/{1}?fields={2}', this.connectionServiceUrl, relationName, _getFields(fields));
            },
            getUpdateUrl: function (relationName, connectionId, fields) {
                return String.format('{0}/{1}/{2}?fields={3}', this.connectionServiceUrl, relationName, connectionId, _getFields(fields));
            },
            getDeleteUrl: function (relationName, connectionId) {
                return String.format('{0}/{1}/{2}', this.connectionServiceUrl, relationName, connectionId);
            },
            getMultiDeleteUrl: function (relationName) {
                return String.format('{0}/{1}/bulkdelete', this.connectionServiceUrl, relationName);
            },
            getSearchByArticleUrl: function (relationName, articleId, label, queryParams) {
                var url = '';

                url = String.format('{0}/{1}/find/all?label={2}&articleid={3}', this.connectionServiceUrl, relationName, label, articleId);
                // url = url + '?psize=1000';
                if (typeof (queryParams) !== 'undefined' && queryParams.length > 0) {
                    for (var i = 0; i < queryParams.length; i = i + 1) {
                        url = url + "&" + queryParams[i];
                    }
                }
                return url;
            },
            getConnectedArticles: function (relationName, articleId, queryParams) {
                var url = '';
                url = String.format('{0}/{1}/{2}/find', this.connectionServiceUrl, relationName, articleId);
                if (queryParams && queryParams.length && queryParams.length > 0) {
                    for (var x = 0; x < queryParams.length; x += 1) {
                        if (x == 0) {
                            url += '?' + queryParams[x];
                        } else {
                            url += '&' + queryParams[x];
                        }
                    }
                }
                return url;
            },
            getInterconnectsUrl: function () {
                return String.format('{0}/interconnects', this.connectionServiceUrl);
            },
            getPropertiesSearchUrl: function (relationName, query) {
                return String.format('{0}/{1}/find/all?properties=', this.connectionServiceUrl, relationName, query);
            }
        };
        this.cannedList = {

            cannedListServiceUrl: 'list',

            getGetListItemsUrl: function (cannedListId) {
                return String.format('{0}/list/{1}/contents', this.cannedListServiceUrl, cannedListId);
            }
        };
        this.push = {
            
            pushServiceUrl: 'push',

            getPushUrl: function () {
                return String.format('{0}/', this.pushServiceUrl);
            },

            getGetNotificationUrl: function (notificationId) {
                return String.format('{0}/notification/{1}', this.pushServiceUrl, notificationId);
            },

            getGetAllNotificationsUrl: function (pagingInfo) {
                return String.format('{0}/getAll?psize={1}&pnum={2}', this.pushServiceUrl, pagingInfo.psize, pagingInfo.pnum);
            }
        };
        this.file = {

            fileServiceUrl: 'file',

            getUploadUrl: function (contentType, fileName) {
                if (fileName && fileName.length > 0) {
                    return String.format('{0}/uploadurl?contenttype={1}&expires=20&filename={2}', this.fileServiceUrl, escape(contentType), escape(fileName));
                } else {
                    return String.format('{0}/uploadurl?contenttype={1}&expires=20', this.fileServiceUrl, escape(contentType));
                }
            },

            getUpdateUrl: function (fileId, contentType) {
                return String.format('{0}/updateurl/{1}?contenttype={2}&expires=20', this.fileServiceUrl, fileId, escape(contentType));
            },

            getDownloadUrl: function (fileId, expiryTime) {
                return String.format('{0}/download/{1}?expires={2}', this.fileServiceUrl, fileId, expiryTime);
            },

            getDeleteUrl: function (fileId) {
                return String.format('{0}/delete/{1}', this.fileServiceUrl, fileId);
            }
        };
        this.query = {
            params: function (key) {
                var match = [];
                if (location.search == "" || location.search.indexOf("?") == -1) return match;
                if (!key) return location.search.split("?")[1].split("=");
                else {
                    key = key.toLowerCase();
                    var splitQuery = location.search.split("?")[1].split("&");
                    splitQuery.forEach(function (i, k) {
                        var splitKey = k.split("=");
                        var value = splitKey[1];
                        if (splitKey.length > 2) {
                            splitKey.forEach(function (ii, kk) {
                                if (ii == 0 || ii == 1) return;
                                value = value + "=" + splitKey[ii];
                            });
                        }
                        if (splitKey[0].toLowerCase() == key) match = [splitKey[0], value];
                    });
                    return match;
                }
            }
        };

    }

    global.Appacitive.storage = global.Appacitive.storage || {};
    global.Appacitive.storage.urlFactory = new UrlFactory();

})(global);/**
Depends on  NOTHING
**/

(function(global) {

    "use strict";

    /**
     * @constructor
    */

    var EventManager = function () {

        function GUID() {
            var S4 = function () {
                return Math.floor(
                    Math.random() * 0x10000 /* 65536 */
                ).toString(16);
            };

            return (
                S4() + S4() + "-" +
                S4() + "-" +
                S4() + "-" +
                S4() + "-" +
                S4() + S4() + S4()
            );
        }

        var _subscriptions = {};

        this.subscribe = function (eventName, callback) {
            if (typeof (eventName) != "string" || typeof (callback) != "function")
                throw new Error("Incorrect subscription call");

            if (typeof (_subscriptions[eventName]) == "undefined")
                _subscriptions[eventName] = [];

            var _id = GUID();
            _subscriptions[eventName].push({
                callback: callback,
                id: _id
            });

            return _id;
        };

        this.unsubscribe = function (id) {
            if (!id) return false;
            var index = -1, eN = null;
            for (var eventName in _subscriptions) {
                for (var y = 0; y < _subscriptions[eventName].length; y = y + 1) {
                    if (_subscriptions[eventName][y].id == id) {
                        index = y;
                        eN = eventName;
                        break;
                    }
                }
            }
            if (index != -1) {
                _subscriptions[eN].splice(index, 1);
                return true;
            }
            return false;
        };

        this.fire = function (eventName, sender, args) {
            if (typeof (eventName) != "string") throw new Error("Incorrect fire call");

            if (typeof (args) == "undefined" || args === null)
                args = {};
            args.eventName = eventName;

            // shifted logging here
            // for better debugging
            //if (console && console.log && typeof console.log == 'function')
               // console.log(eventName + ' fired');

            if (typeof (_subscriptions["all"]) != "undefined") {
                for (var x = 0; x < _subscriptions["all"].length; x = x + 1) {
                    //try {
                    _subscriptions["all"][x].callback(sender, args);
                    //} catch (e) { }
                }
            }

            var _callback = function (f, s, a) {
                setTimeout(function () {
                    f(s, a);
                }, 0);
            };

            if (typeof (_subscriptions[eventName]) != "undefined") {
                for (var y= 0; y < _subscriptions[eventName].length; y = y + 1) {
                    _callback(_subscriptions[eventName][y].callback, sender, args);
                }
            }
        };

        this.clearSubscriptions = function (eventName) {
            if (typeof (eventName) != 'string')
                throw new Error('Event Name must be string in EventManager.clearSubscriptions');

            if (_subscriptions[eventName]) _subscriptions[eventName].length = 0;

            return this;
        };

        this.clearAndSubscribe = function (eventName, callback) {
            this.clearSubscriptions(eventName);
            this.subscribe(eventName, callback);
        };

        this.dump = function () {
            console.dir(_subscriptions);
        };

    };

    global.Appacitive.eventManager = new EventManager();

})(global);(function(global) {

	"use strict";

	global.Appacitive.config = {
		apiBaseUrl: 'https://apis.appacitive.com/'
	};

	if (typeof XDomainRequest != 'undefined') {
		global.Appacitive.config.apiBaseUrl = window.location.protocol + '//apis.appacitive.com/'
	}

}(global));(function(global) {

	"use strict";

	/**
	 * @constructor
	 */
	var SessionManager = function() {

		/**
		 * @constructor
		 */

		this.initialized = false;

		var _sessionRequest = function() {
			this.apikey = '';
			this.isnonsliding = false;
			this.usagecount = -1;
			this.windowtime = 240;
		};

		var _sessionKey = null, _appName = null, _options = null, _apikey = null, _authToken = null, authEnabled = false;

		this.useApiKey = true ;

		this.onSessionCreated = function() {};

		this.recreate = function() {
			global.Appacitive.Session.create(_options);
		};

		this.create = function(onSuccess, onError) {

			if (!this.initialized) throw new Error("Intialize Appacitvie SDK");

			// create the session
			var _sRequest = new _sessionRequest();

			_sRequest.apikey = _apikey
			
			var _request = new global.Appacitive.HttpRequest();
			_request.url = global.Appacitive.config.apiBaseUrl + 'application.svc/session';
			_request.method = 'put';
			_request.data = _sRequest;
			_request.onSuccess = function(data) {
				if (data && data.status && data.status.code == '200') {
					_sessionKey = data.session.sessionkey;
					global.Appacitive.Session.useApiKey = false;
					if (onSuccess && typeof onSuccess == 'function') onSuccess(data);
					global.Appacitive.Session.onSessionCreated();
				}
				else {
					if (onError && typeof onError == 'function') onError(data);
				}
			};
			_request.onError = onError;
			global.Appacitive.http.send(_request);
		};

		global.Appacitive.http.addProcessor({
			pre: function(request) {
				if (global.Appacitive.Session.useApiKey) {
					request.headers.push({ key: 'ak', value: _apikey });
				} else {
					request.headers.push({ key: 'as', value: _sessionKey });
				}

				if (authEnabled === true) {
					var userAuthHeader = request.headers.filter(function (uah) {
						return uah.key == 'ut';
					});
					if (userAuthHeader.length == 1) {
						request.headers.forEach(function (uah) {
							if (uah.key == 'ut') {
								uah.value = _authToken;
							}
						});
					} else {
						request.headers.push({ key: 'ut', value: _authToken });
					}
				}
			}
		});

		this.setUserAuthHeader = function(authToken, expiry, doNotSetCookie) {
			try {
				if (authToken) {
					authEnabled = true;
					_authToken = authToken;
					if (!doNotSetCookie) {
						if(!expiry) expiry = 60;
						if (expiry == -1) expiry = null;
						
						if (global.Appacitive.runtime.isBrowser) {
							global.Appacitive.Cookie.setCookie('Appacitive-UserToken', authToken, expiry);
							global.Appacitive.Cookie.setCookie('Appacitive-UserTokenExpiry', expiry ? expiry : -1, expiry);
						}
					}
				}
			} catch(e) {}
		};

		this.incrementExpiry = function() {
			return;
			/*try {
				if (global.Appacitive.runtime.isBrowser && authEnabled) {
					var expiry = global.Appacitive.Cookie.readCookie('Appacitive-UserTokenExpiry');
					
					if (!expiry) expiry = 60;
					if (expiry == -1) expiry = null;
					
					global.Appacitive.Cookie.setCookie('Appacitive-UserToken', _authToken, expiry);
					global.Appacitive.Cookie.setCookie('Appacitive-UserTokenExpiry', expiry ? expiry : -1, expiry);
				}
			} catch(e) {}*/
		};

		this.removeUserAuthHeader = function(callback, avoidApiCall) {
			if (callback && typeof callback != 'function' && typeof callback == 'boolean') {
				avoidApiCall = callback;
				callback = function() {}; 
			}

			authEnabled = false;
			callback = callback || function() {};
			global.Appacitive.localStorage.remove('Appacitive-User');
			if (global.Appacitive.runtime.isBrowser) {
			 	global.Appacitive.Cookie.eraseCookie('Appacitive-UserToken');
			 	global.Appacitive.Cookie.eraseCookie('Appacitive-UserTokenExpiry');
			}
			if (_authToken  && !avoidApiCall) {
				try {
					var _request = new global.Appacitive.HttpRequest();
					_request.url = global.Appacitive.config.apiBaseUrl + global.Appacitive.storage.urlFactory.user.getInvalidateTokenUrl(_authToken);
					_authToken = null;
					_request.method = 'POST';
					_request.data = {};
					_request.onSuccess = function() {
						if (typeof(callback) == 'function')
							callback();
					};
					global.Appacitive.http.send(_request);
				} catch (e){}
			} else {
				_authToken = null;
				if (typeof(callback) == 'function')
					callback();
			}
		};

		this.isSessionValid = function(response) {
			if (!response) return true;
			if (response.status) {
				if (response.status.code) {
					if (response.status.code == '8027' || response.status.code == '8002') {
						return { status: false, isSession: (response.status.code == '8027') ? true : false };
					}
				}
			} else if (response.code) {
				if (response.code == '8027' || response.code == '8002') {
					return { status: false, isSession: (response.code == '8027') ? true : false };
				}
			}
			return { status: true };
		};

		this.resetSession = function() {
			_sessionKey = null;
			this.useApiKey = true;
		};

		this.get = function() {
			return _sessionKey;
		};

		this.setSession = function(session) {
			if (session) {
				_sessionKey = session;
				this.useApiKey = false;
			}
		};

		this.setApiKey = function(apikey) {
			if (apikey) {
				_apikey = apikey;
				this.useApiKey = true;
			}
		}

		// the name of the environment, simple public property
		var _env = 'sandbox';
		this.environment = function() {
			if (arguments.length == 1) {
				var value = arguments[0];
				if (value != 'sandbox' && value != 'live')	value = 'sandbox';
				_env = value;
			}
			return _env;
		};
	};

	global.Appacitive.Session = new SessionManager();

	global.Appacitive.getAppPrefix = function(str) {
		return global.Appacitive.Session.environment() + '/' + global.Appacitive.appId + '/' + str;
	};

	global.Appacitive.initialize = function(options) {
		
		options = options || {};

		if (global.Appacitive.Session.initialized) return;
		
		if (!options.apikey || options.apikey.length == 0) throw new Error("apikey is mandatory");
		
		if (!options.appId || options.appId.length == 0) throw new Error("appId is mandatory");


		global.Appacitive.Session.setApiKey( options.apikey) ;
		global.Appacitive.Session.environment(options.env || 'sandbox' );
		global.Appacitive.useApiKey = true;
		global.Appacitive.appId = options.appId;
  		
  		global.Appacitive.Session.initialized = true;
  		global.Appacitive.Session.persistUserToken = options.persistUserToken;
  		
		if (options.debug) global.Appacitive.config.debug = true;

  		if (options.userToken) {

			if (options.expiry == -1)  options.expiry = null 
			else if (!options.expiry)  options.expiry = 3600;

			global.Appacitive.Session.setUserAuthHeader(options.userToken, options.expiry);

			if (options.user) {
				global.Appacitive.Users.setCurrentUser(options.user);	
			} else {
				//read user from from localstorage and set it;
				var user = global.Appacitive.localStorage.get('Appacitive-User');	
				if (user) global.Appacitive.Users.setCurrentUser(user);
			}

		} else {

			if (global.Appacitive.runtime.isBrowser) {
				//read usertoken from cookie and set it
				var token = global.Appacitive.Cookie.readCookie('Appacitive-UserToken');
				if (token) { 
					var expiry = global.Appacitive.Cookie.readCookie('Appacitive-UserTokenExpiry');
					if (!expiry) expiry = 60;
					
					//read usertoken from cookie and user from from localstorage and set it;
					var user = global.Appacitive.localStorage.get('Appacitive-User');	
					if (user) global.Appacitive.Users.setCurrentUser(user, token, expiry);
				}
			}
		}			
	};

} (global));


// compulsory http plugin
// attaches the appacitive environment headers
(function (global){

	if (!global.Appacitive) return;
	if (!global.Appacitive.http) return;

	global.Appacitive.http.addProcessor({
		pre: function(req) {
			req.headers.push({ key: 'e', value: global.Appacitive.Session.environment() });
		}
	});

})(global);(function (global) {

    var Appacitive = global.Appacitive;

    Appacitive.GeoCoord = function(lat, lng) {
        
        _validateGeoCoord = function(lat, lng) {
          if (isNaN(lat) || isNaN(lng)) throw new Error("Invalid Latitiude or longitiude provided");
          if (lat < -90.0 || lat > 90.0) throw new Error("Latitude " + lat + " should be in range of  -90.0 to 90.");
          if (lng < -180.0 || lng > 180.0) throw new Error("Latitude " + lng + " should be in range of  -180.0 to 180.");
        };

        if (!lat || !lng) {
          this.lat = 0, this.lng = 0;
        } else {
          _validateGeoCoord(lat, lng);
          this.lat = lat, this.lng = lng;
        }

        this.toJSON = function() {
            return {
                latitude : this.lat,
                longitude: this.lng
            };
        };

        this.getValue = function() {
            return String.format("{0},{1}", lat, lng);
        };

        this.toString = function() { return this.getValue(); };
    };

    var _filter = function() { this.toString = function() { }; };

    var _fieldFilter = function(options) {

        _filter.call(this);

        options = options || {};
        this.fieldType = options.fieldType;
        this.field = options.field || '';
        this.value = options.value;
        this.operator = options.operator;

        this.getFieldType = function() {
            switch (this.fieldType) {
                case 'property' : return '*';
                case 'attribute' : return '@';
                case 'aggregate' : return '$';
                default : return '*';
            };
        };

        this.toString = function() {
             return String.format("{0}{1} {2} {3}",
                    this.getFieldType(),
                    this.field.toLowerCase(),
                    this.operator,
                    this.value.getValue());
        };

    };

    _fieldFilter.prototype = new _filter();
    _fieldFilter.prototype.constructor = _fieldFilter;


    var _containsFilter = function(options) {
        
        options = options || '';

        if (!(typeof options.value == 'object') || !options.value.length) throw new Error("Specify field value as array");
        
        _fieldFilter.call(this, options);

        var _getValue = function(value) {
            if (typeof value == 'string') return "'" + value + "'";
            else if (typeof value == 'number') return value;  
            else return value.toString();
        };

        this.toString = function() {
            var values = [];
            for (var i = 0; i < this.value.length; i = i + 1) {
                values.push(String.format("{0}{1} {2} {3}",
                            this.getFieldType(),
                            this.field.toLowerCase(),
                            this.operator,
                            _getValue(this.value[i])));
            };
            return "("  + values.join(' or ') + ")"; 
        }

    };

    _containsFilter.prototype = new _fieldFilter();
    _containsFilter.prototype.constructor = _containsFilter;

    var _betweenFilter = function(options) {
        options = options || '';

        if (!options.val1) throw new Error("Specify field value1 ");
        if (!options.val2) throw new Error("Specify field value2 ");

        this.val1 = options.val1;
        this.val2 = options.val2;

        _fieldFilter.call(this, options);

        delete this.value;

        this.toString = function() {
             return String.format("{0}{1} {2} ({3},{4})",
                    this.getFieldType(),
                    this.field.toLowerCase(),
                    this.operator,
                    this.val1.getValue(),
                    this.val2.getValue());
        };

    };

    _betweenFilter.prototype = new _fieldFilter();
    _betweenFilter.prototype.constructor = _betweenFilter;


    var _radialFilter = function(options) {

        options = options || '';

        if (!options.geoCoord || !(options.geoCoord instanceof Appacitive.GeoCoord)) throw new Error("withinCircle filter needs Appacitive.GeoCoord object as argument");

        _fieldFilter.call(this, options);

        this.value = options.geoCoord;

        this.unit = options.unit || 'mi';

        this.distance = options.distance || 5;

        this.toString = function() {
             return String.format("{0}{1} {2} {3},{4} {5}",
                    this.getFieldType(),
                    this.field.toLowerCase(),
                    this.operator,
                    this.value.getValue(),
                    this.distance,
                    this.unit);
        };
    };

    _radialFilter.prototype = new _fieldFilter();
    _radialFilter.prototype.constructor = _betweenFilter;


    var _polygonFilter = function(options) {

        options = options || '';

        if (!options.geoCoords || options.geoCoords.length == 0) throw new Error("polygon filter needs array of Appacitive.GeoCoord objects as argument");

        if (options.geoCoords.length < 3) throw new Error("polygon filter needs atleast 3 Appacitive.GeoCoord objects as arguments");

        _fieldFilter.call(this, options);

        this.value = options.geoCoords;

        var _getPipeSeparatedList = function(coords) {
            var value = '';
            coords.forEach(function(c) {
                if (value.length == 0) value = c.toString();
                else value += " | " + c.toString();
            });
            return value;
        }

        this.toString = function() {
             return String.format("{0}{1} {2} {3}",
                    this.getFieldType(),
                    this.field.toLowerCase(),
                    this.operator,
                    _getPipeSeparatedList(this.value));
        };
    };

    _polygonFilter.prototype = new _fieldFilter();
    _polygonFilter.prototype.constructor = _betweenFilter;

    _tagFilter = function(options) {

        _filter.call(this);

        options = options || {};
        if (!options.tags || typeof options.tags != 'object' || options.tags.length == 0) throw new Error("Specify valid tags");

        this.tags = options.tags;
        this.operator = options.operator;
        
        this.toString = function() {
             return String.format("{0}('{1}')", this.operator, this.tags.join(','));
        };
    };

    _tagFilter.prototype = new _filter();
    _tagFilter.prototype.constructor = _tagFilter;

    _compoundFilter = function(operator, filters) {
        
        if (!filters || !filters.length || filters.length < 2) throw new Error("Provide valid or atleast 2 filters");

        this.operator = operator;

        this.innerFilters = [];

        for (var i = 0; i < filters.length ; i = i + 1) {
            if (!(filters[i] instanceof _filter)) throw new Error("Invalid filter provided");
            this.innerFilters.push(filters[i]);
        };

        this.toString = function() {
            var op = this.operator;
            var value = "(";
            this.innerFilters.forEach(function(f) {
                if (value.length == 1) value += ' ' + f.toString();
                else value += String.format(' {0} {1} ', op, f.toString());
            });
            value += ")";
            return value;
        };
    };

    _compoundFilter.prototype = new _filter();
    _compoundFilter.prototype.constructor = _compoundFilter;


    var _operators = {
        isEqualTo: "==",
        isGreaterThan: ">",
        isGreaterThanEqualTo: ">=",
        isLessThan: "<",
        isLessThanEqualTo: "<=",
        like: "like",
        between: "between",
        withinCircle: "within_circle",
        withinPolygon: "within_polygon",
        or: "or",
        and: "and",
        taggedWithAll: "tagged_with_all",
        taggedWithOneOrMore: "tagged_with_one_or_more"
    };

    var _primitiveFieldValue = function(value) {

        if (value == null || value == undefined || value.length == 0) throw new Error("Specify value");

        this.value = value;

        this.getValue = function() {
            if (typeof this.value == 'string') return "'" + this.value + "'";
            else if (typeof this.value == 'number' || typeof this.value == 'boolean') return this.value;  
            else if (typeof this.value == 'object' && this.value instanceof date) return "datetime('" + Appacitive.Date.toISOString(this.value) + "')";
            else return this.value.toString();
        };
    };

    var _dateFieldValue = function(value) {
        this.value = value;
        
        this.getValue = function() {
            if (typeof this.value == 'object' && this.value instanceof Date) return "date('" + Appacitive.Date.toISODate(this.value) + "')";
            else return "date('" + this.value + "'')";
        };
    };

    var _timeFieldValue = function(value) {
        this.value = value;
        
        this.getValue = function() {
            if (typeof this.value == 'object' && this.value instanceof Date) return "time('" + Appacitive.Date.toISOTime(this.value) + "')";
            else return "time('" + this.value + "'')";
        };
    };

    var _dateTimeFieldValue = function(value) {
        this.value = value;
        
        this.getValue = function() {
            if (typeof this.value == 'object' && this.value instanceof Date) return "datetime('" + Appacitive.Date.toISOString(this.value) + "')";
            else return "datetime('" + this.value + "'')";
        };
    };

    var _fieldFilterUtils = function(type, name, context) { 

        if (!context) context = this;

        context.type = type;

        context.name = name;

        /* Helper functions for EqualTo */
        context.equalTo = function(value) {
            return new _fieldFilter({ field: this.name, fieldType: this.type, value: new _primitiveFieldValue(value), operator: _operators.isEqualTo });
        };

        context.equalToDate = function(value) {
            return new _fieldFilter({ field: this.name, fieldType: this.type, value: new _dateFieldValue(value), operator: _operators.isEqualTo });
        };

        context.equalToTime = function(value) {
            return new _fieldFilter({ field: this.name, fieldType: this.type, value: new _timeFieldValue(value), operator: _operators.isEqualTo });
        };

        context.equalToDateTime = function(value) {
            return new _fieldFilter({ field: this.name, fieldType: this.type, value: new _dateTimeFieldValue(value), operator: _operators.isEqualTo });
        };


        /* Helper functions for GreaterThan */
        context.greaterThan = function(value) {
            return new _fieldFilter({ field: this.name, fieldType: this.type, value: new _primitiveFieldValue(value), operator: _operators.isGreaterThan });
        };

        context.greaterThanDate = function(value) {
            return new _fieldFilter({ field: this.name, fieldType: this.type, value: new _dateFieldValue(value), operator: _operators.isGreaterThan });
        };

        context.greaterThanTime = function(value) {
            return new _fieldFilter({ field: this.name, fieldType: this.type, value: new _timeFieldValue(value), operator: _operators.isGreaterThan });
        };

        context.greaterThanDateTime = function(value) {
            return new _fieldFilter({ field: this.name, fieldType: this.type, value: new _dateTimeFieldValue(value), operator: _operators.isGreaterThan });
        };


        /* Helper functions for GreaterThanEqualTo */
        context.greaterThanEqualTo = function(value) {
            return new _fieldFilter({ field: this.name, fieldType: this.type, value: new _primitiveFieldValue(value), operator: _operators.isGreaterThanEqualTo });
        };

        context.greaterThanEqualToDate = function(value) {
            return new _fieldFilter({ field: this.name, fieldType: this.type, value: new _dateFieldValue(value), operator: _operators.isGreaterThanEqualTo });
        };

        context.greaterThanEqualToTime = function(value) {
            return new _fieldFilter({ field: this.name, fieldType: this.type, value: new _timeFieldValue(value), operator: _operators.isGreaterThanEqualTo });
        };

        context.greaterThanEqualToDateTime = function(value) {
            return new _fieldFilter({ field: this.name, fieldType: this.type, value: new _dateTimeFieldValue(value), operator: _operators.isGreaterThanEqualTo });
        };

        /* Helper functions for LessThan */
        context.lessThan = function(value) {
            return new _fieldFilter({ field: this.name, fieldType: this.type, value: new _primitiveFieldValue(value), operator: _operators.isLessThan });
        };

        context.lessThanDate = function(value) {
            return new _fieldFilter({ field: this.name, fieldType: this.type, value: new _dateFieldValue(value), operator: _operators.isLessThan });
        };

        context.lessThanTime = function(value) {
            return new _fieldFilter({ field: this.name, fieldType: this.type, value: new _timeFieldValue(value), operator: _operators.isLessThan });
        };

        context.lessThanDateTime = function(value) {
            return new _fieldFilter({ field: this.name, fieldType: this.type, value: new _dateTimeFieldValue(value), operator: _operators.isLessThan });
        };


        /* Helper functions for LessThanEqualTo */
        context.lessThanEqualTo = function(value) {
            return new _fieldFilter({ field: this.name, fieldType: this.type, value: new _primitiveFieldValue(value), operator: _operators.isLessThanEqualTo });
        };

        context.lessThanEqualToDate = function(value) {
            return new _fieldFilter({ field: this.name, fieldType: this.type, value: new _dateFieldValue(value), operator: _operators.isLessThanEqualTo });
        };

        context.lessThanEqualToTime = function(value) {
            return new _fieldFilter({ field: this.name, fieldType: this.type, value: new _timeFieldValue(value), operator: _operators.isLessThanEqualTo });
        };

        context.lessThanEqualToDateTime = function(value) {
            return new _fieldFilter({ field: this.name, fieldType: this.type, value: new _dateTimeFieldValue(value), operator: _operators.isLessThanEqualTo });
        };

        /* Helper functions for string operations */
        context.like = function(value) {
            return new _fieldFilter({ field: this.name, fieldType: this.type, value: new _primitiveFieldValue("*" + value + "*"), operator: _operators.like });
        };

        context.startsWith = function(value) {
            return new _fieldFilter({ field: this.name, fieldType: this.type, value: new _primitiveFieldValue(value + "*"), operator: _operators.like });
        };

        context.endsWith = function(value) {
            return new _fieldFilter({ field: this.name, fieldType: this.type, value: new _primitiveFieldValue("*" + value), operator: _operators.like });
        };

        context.contains = function(values) {
            return new _containsFilter({ field: this.name, fieldType: this.type, value: values, operator: _operators.isEqualTo });
        };

        /* Helper functions for between */
        context.between = function(val1, val2) {
            return new _betweenFilter({ field: this.name, fieldType: this.type, val1: new _primitiveFieldValue(val1), val2: new _primitiveFieldValue(val2), operator: _operators.between });
        };

        context.betweenDate = function(val1, val2) {
            return new _betweenFilter({ field: this.name, fieldType: this.type, val1: new _dateFieldValue(val1), val2: new _dateFieldValue(val2), operator: _operators.between });
        };

        context.betweenTime = function(val1, val2) {
            return new _betweenFilter({ field: this.name, fieldType: this.type, val1: new _timeFieldValue(val1), val2: new _timeFieldValue(val2), operator: _operators.between });
        };

        context.betweenDateTime = function(val1, val2) {
            return new _betweenFilter({ field: this.name, fieldType: this.type, val1: new _dateTimeFieldValue(val1), val2: new _dateTimeFieldValue(val2), operator: _operators.between });
        };

        /*Helper functionf for geolocation search */
        context.withinCircle = function(geoCoord, distance, unit) {
            return new _radialFilter({ field: this.name, fieldType: this.type, geoCoord: geoCoord, distance: distance, unit: unit, operator: _operators.withinCircle });
        };

        context.withinPolygon = function(geoCoords) {
            return new _polygonFilter({ field: this.name, fieldType: this.type, geoCoords: geoCoords, operator: _operators.withinPolygon });
        };
    };

    _propertyExpression = function(name) {
        
        if (!name || name.length == 0) throw new Error("Specify field name");
        
        this.field = name;

        _fieldFilterUtils("property", name, this);

        return this;
    };

    _aggregateExpression = function(name) {
        
        if (!name || name.length == 0) throw new Error("Specify field name");
        
        this.field = name;

        var _fieldFilters = new _fieldFilterUtils("aggregate", name);

        this.equalTo = function(value) {
            return _fieldFilters.equalTo(value);
        };

        this.greaterThan = function(value) {
            return _fieldFilters.greaterThan(value);
        };

        this.greaterThanEqualTo = function(value) {
            return _fieldFilters.greaterThanEqualTo(value);
        };

        this.lessThan = function(value) {
            return _fieldFilters.lessThan(value);
        };

        this.lessThanEqualTo = function(value) {
            return _fieldFilters.lessThanEqualTo(value);
        };

        this.between = function(val1, val2) {
            return _fieldFilters.between(val1, val2);
        };

        return this;
    };

    _attributeExpression = function(name) {
        if (!name || name.length == 0) throw new Error("Specify field name");
        
        this.field = name;

        var _fieldFilters = new _fieldFilterUtils("attribute", name);

        /* Helper functions for string operations */
        this.like = function(value) {
            return _fieldFilters.like(value);
        };

        this.startWith = function(value) {
            return _fieldFilters.startsWith(value);
        };

        this.endsWith = function(value) {
            return _fieldFilters.endsWith(value);
        };

        this.equalTo = function(value) {
            return _fieldFilters.equalTo(value);
        };        

        this.contains = function(values) {
            return _fieldFilters.contains(values);
        };

        return this;
    };

    Appacitive.Filter = {
        Property: function(name) {
            return new _propertyExpression(name)
        },
        Aggregate: function(name) {
            return new _aggregateExpression(name)
        },
        Attribute: function(name) {
            return new _attributeExpression(name)
        },
        Or: function() {
            return new _compoundFilter(_operators.or, arguments); 
        },
        And: function() {
            return new _compoundFilter(_operators.and, arguments); 
        },
        taggedWithOneOrMore: function(tags) {
            return new _tagFilter({ tags: tags, operator: _operators.taggedWithOneOrMore });
        },
        taggedWithAll: function(tags) {
            return new _tagFilter({ tags: tags, operator: _operators.taggedWithAll });
        }
    };

})(global);(function(global) {

	"use strict";

	global.Appacitive.Queries = {};

	// basic query for contains pagination
	/** 
	* @constructor
	**/
	var PageQuery = function(o) {
		var options = o || {};
		var _pageNumber = 1;
		var _pageSize = 20;

		//define getter and setter for pageNumber
		this.pageNumber =  function() { 
			if (arguments.length == 1) {
				_pageNumber = arguments[0] || 1;
				return this;
			}
			return _pageNumber; 
		};

		//define getter and setter for pageSize
		this.pageSize =  function() { 
			if (arguments.length == 1) {
				_pageSize = arguments[0] || 20;
				return this;
			}
			return _pageSize; 
		};

		this.pageNumber(options.pageNumber);
		this.pageSize(options.pageSize);
	};
	PageQuery.prototype.toString = function() {
		return 'psize=' + this.pageSize() + '&pnum=' + this.pageNumber();
	};

	// sort query
	/** 
	* @constructor
	**/
	var SortQuery = function(o) {
		var options = o || {};
		var _orderBy = '__UtcLastUpdatedDate';
		var _isAscending = false;

		//define getter/setter for orderby
		this.orderBy =  function() { 
			if (arguments.length == 1) {
				_orderBy = arguments[0] || '__UtcLastUpdatedDate';
				return this;
			}
			return _orderBy; 
		};

		//define getter for isAscending
		this.isAscending =  function() { 
			if (arguments.length == 1) {
				_isAscending = typeof arguments[0] == 'undefined' ? false : arguments[0];
				return this;
			}
			return _isAscending; 
		};

		this.orderBy(options.orderBy);
		this.isAscending(options.isAscending);
	};
	SortQuery.prototype.toString = function() {
		return 'orderBy=' + this.orderBy() + '&isAsc=' + this.isAscending();
	};

	// base query
	/** 
	* @constructor
	**/
	var BasicQuery = function(o) {

		var options = o || {};

		//set filters , freetext and fields
		var _filter = '';
		var _freeText = '';
		var _fields = '';
		var _queryType = options.queryType || 'BasicQuery';
		var _pageQuery = new PageQuery(o);
		var _sortQuery = new SortQuery(o);
		var _entityType = options.schema || options.relation;
		var _type = (options.relation) ? 'connection' : 'article';


		//define getter for type (article/connection)
		this.type = function() { return _type; };

		//define getter for basetype (schema/relation)
		this.entityType = function() { return _entityType; };

		//define getter for querytype (basic,connectedarticles etc)
		this.queryType = function() { return _queryType; };

		//define getter for pagequery 
		this.pageQuery = function() { return _pageQuery; };

		
		//define getter and setter for pageNumber
		this.pageNumber =  function() { 
			if (arguments.length == 1) {
				_pageQuery.pageNumber(arguments[0]);
				return this;
			}
			return _pageQuery.pageNumber(); 
		};

		//define getter and setter for pageSize
		this.pageSize =  function() { 
			if (arguments.length == 1) {
				_pageQuery.pageSize(arguments[0]);
				return this;
			}
			return _pageQuery.pageSize(); 
		};

		//define getter for sortquery
		this.sortQuery = function() { return _sortQuery; };

		//define getter and setter for orderby
		this.orderBy =  function() { 
			if (arguments.length == 1) {
				_sortQuery.orderby(arguments[0]);
				return this;
			}
			return _sortQuery.orderby(); 
		};

		//define getter and setter for isAscending
		this.isAscending =  function() { 
			if (arguments.length == 1) {
				_sortQuery.isAscending(arguments[0]);
				return this;
			}
			return _sortQuery.isAscending(); 
		};

		//define getter and setter for filter
		this.filter =  function() { 
			if (arguments.length == 1) {
				_filter = arguments[0];
				return this;
			}
			return _filter; 
		};		
		
		//define getter and setter for freetext
		this.freeText =  function() { 
			if (arguments.length == 1) {
				var value = arguments[0];
				if (typeof value == 'string') _freeText = arguments[0];
				else if (typeof value == 'object' && value.length) _freeText = arguments[0].join(' ');
				return this;
			}
			return _freeText; 
		};		
		
		
		this.fields = function() {
			if (arguments.length == 1) {
				var value = arguments[0];
				if (typeof value == 'string') _fields = value;
				else if (typeof value == 'object' && value.length) _fields = value.join(',');
				return this;
			} else {
				return _fields;
			}
		}

		//set filters , freetext and fields
		this.filter(options.filter || '');
		this.freeText(options.freeText || '');
		this.fields(options.fields || '');

		this.setFilter = function() { this.filter(arguments[0]); };
		this.setFreeText = function() { this.freeText(arguments[0]); };
        this.setFields = function() { this.fields(arguments[0]); };

        this.extendOptions = function(changes) {
			for (var key in changes) {
				options[key] = changes[key];
			}
			_pageQuery = new PageQuery(options);
			_sortQuery = new SortQuery(options);
			return this;
		};

		this.getQueryString = function() {

			var finalUrl = _pageQuery.toString() + '&' + _sortQuery.toString();

			if (this.filter()) {
				var filter = this.filter().toString();
			    if (filter.trim().length > 0) finalUrl += '&query=' + filter;
			}

			if (this.freeText() && this.freeText().trim().length > 0) {
                finalUrl += "&freetext=" + this.freeText() + "&language=en";
            }

            if (this.fields() && this.fields().trim().length > 0) {
            	finalUrl += "&fields=" + this.fields();
            }

			return finalUrl;
		};

		this.toUrl = function() {
			return global.Appacitive.config.apiBaseUrl + _type + '/' + _entityType + '/find/all?' + this.getQueryString();
		};

		this.toRequest = function() {
			var r = new global.Appacitive.HttpRequest();
			r.url = this.toUrl();
            r.method = 'get';
			return r;
		};

		this.getOptions = function() {
			var o = {};
			for (var key in this) {
				if (this.hasOwnProperty(key) && typeof this[key] != 'function') {
					o[key] = this[key];
				}
			}
			return o;
		};

		var _parse = function(entities) {
			var entityObjects = [];
			if (!entities) entities = [];
			var eType = (_type == 'article') ? 'Article' : 'Connection';
			entities.forEach(function(e) {
				entityObjects.push(new global.Appacitive[eType](e, true));
			});
			return entityObjects;
		};

		this.fetch = function(onSuccess, onError) {
			var request = this.toRequest();
			request.onSuccess = function(d) {
			if (d && d.status && d.status.code == '200') {
				   if (typeof onSuccess == 'function') onSuccess(_parse(d[_type + 's']), d.paginginfo);
				} else {
					d = d || {};
					if (typeof onError == 'function') onError(d.status || { message : 'Server error', code: 400 });
				}
			};
			request.onError = function(d) {
				d = d || {};
				if (typeof onError == 'function') onError(d.status || { message : 'Server error', code: 400 });
			};
			global.Appacitive.http.send(request);
			return this;
		};

		this.count = function(onSuccess, onError) {
			onSuccess = onSuccess || function() {};
			onError = onError || function() {};

			var _pSize = _pageQuery.pageSize;
			var _pNum = _pageQuery.pageNumber;

			_pageQuery.pageSize = 1;
			_pageQuery.pageNumber = 999999999;

			var that = this;

			var _restoreOldPaging = function() {
				_pageQuery.pageSize = _pSize;
				_pageQuery.pageNumber = _pNum;
			};

			var _queryRequest = this.toRequest();
			_queryRequest.onSuccess = function(data) {

				_restoreOldPaging();

				data = data || {};
				var pagingInfo = data.paginginfo;

				var count = 0;
				if (!pagingInfo) {
					if (data.status && data.status.code && data.status.code == '200') {
						count = 0;
					} else {
						var d = data.status || { message : 'Server error', code: 400 };
				        if (typeof onError == 'function') onError(d, that);
						return;
					}
				} else {
					count = pagingInfo.totalrecords;
				}
				if (typeof onSuccess == 'function') onSuccess(count);
			};
			_queryRequest.onError = function(d) {
				_restoreOldPaging();
				d = d || { message : 'Server error', code: 400 };
			    if (typeof onError == 'function') onError(d, that);
			};
			global.Appacitive.http.send(_queryRequest);

			return this;
		};
	};

	/** 
	* @constructor
	**/
	global.Appacitive.Queries.FindAllQuery = function(options) {

		options = options || {};

		if ((!options.schema && !options.relation) || (options.schema && options.relation)) 
		    throw new Error('Specify either schema or relation for basic filter query');

		options.queryType = 'BasicFilterQuery';

		BasicQuery.call(this, options);

		return this;
	};

	global.Appacitive.Queries.FindAllQuery.prototype = new BasicQuery();

	global.Appacitive.Queries.FindAllQuery.prototype.constructor = global.Appacitive.Queries.FindAllQuery;

	/** 
	* @constructor
	**/
	global.Appacitive.Queries.ConnectedArticlesQuery = function(options) {

		options = options || {};

		if (!options.relation) throw new Error('Specify relation for connected articles query');
		if (!options.articleId) throw new Error('Specify articleId for connected articles query');
		if (!options.schema) throw new Error('Specify schema of article id for connected articles query');
		
		var schema = options.schema;
		delete options.schema;

		options.queryType = 'ConnectedArticlesQuery';

		BasicQuery.call(this, options);

		this.articleId = options.articleId;
		this.relation = options.relation;
		this.schema = schema;
		this.prev = options.prev;

		this.label = '';
		var that = this;

		if (options.label && typeof options.label == 'string' && options.label.length > 0) this.label = '&label=' + options.label;

		this.toRequest = function() {
			var r = new global.Appacitive.HttpRequest();
			r.url = this.toUrl();
			r.method = 'get';
			return r;
		};

		this.toUrl = function() {
			return global.Appacitive.config.apiBaseUrl + 'connection/' + this.relation + '/' + this.schema + '/' + this.articleId + '/find?' +
				this.getQueryString() + this.label;
		};


		var parseNodes = function(nodes, endpointA) {
			var articles = [];
			nodes.forEach(function(o) {
				var edge = o.__edge;
				delete o.__edge;

				edge.__endpointa = endpointA;
				edge.__endpointb = {
					articleid: o.__id,
					label: edge.__label,
					type: o.__schematype
				};
				delete edge.label;

				var connection = new global.Appacitive.Connection(edge, true);
				var tmpArticle = new global.Appacitive.Article(o, true);
				tmpArticle.connection = connection;
				
				articles.push(tmpArticle);
			});
			return articles;
		};


		var	prevParseNodes = function(nodes, endpointA) {
			var connections = [];
			nodes.forEach(function(o) {
				var edge = o.__edge;
				delete o.__edge;

				edge.__endpointa = endpointA;
				edge.__endpointb = {
					article: o,
					label: edge.__label,
					type: o.__schematype
				};
				delete edge.label;

				var connection = new global.Appacitive.Connection(edge, true);

				connections.push(connection);
			});
			return connections;
		};

		this.fetch = function(onSuccess, onError) {
			var request = this.toRequest();
			request.onSuccess = function(d) {
			if (d && d.status && d.status.code == '200') {
				   if (typeof onSuccess == 'function') {
					   var cb = parseNodes;
					   if (that.prev) cb = prevParseNodes;
				   	   onSuccess(cb( d.nodes ? d.nodes : [], { articleid : options.articleId, type: schema, label: d.parent }), d.paginginfo);   
				   	}
				} else {
					d = d || {};
					if (typeof onError == 'function') onError(d.status || { message : 'Server error', code: 400 });
				}
			};
			request.onError = function(d) {
				d = d || {};
				if (typeof onError == 'function') onError(d.status || { message : 'Server error', code: 400 });
			};
			global.Appacitive.http.send(request);
			return this;
		};

		return this;
	};

	global.Appacitive.Queries.ConnectedArticlesQuery.prototype = new BasicQuery();

	global.Appacitive.Queries.ConnectedArticlesQuery.prototype.constructor = global.Appacitive.Queries.ConnectedArticlesQuery;

	/** 
	* @constructor
	**/
	global.Appacitive.Queries.GetConnectionsQuery = function(options) {

		options = options || {};

		if (!options.relation) throw new Error('Specify relation for GetConnectionsQuery query');
		if (!options.articleId) throw new Error('Specify articleId for GetConnectionsQuery query');
		if (!options.label || options.label.trim().length == 0) throw new Error('Specify label for GetConnectionsQuery query');
		if (options.schema) delete options.schema;

		options.queryType = 'GetConnectionsQuery';

		BasicQuery.call(this, options);

		this.articleId = options.articleId;
		this.relation = options.relation;
		this.label = options.label;

		this.toRequest = function() {
			var r = new global.Appacitive.HttpRequest();
			r.url = this.toUrl();
			r.method = 'get';
			return r;
		};

		this.toUrl = function() {
			return global.Appacitive.config.apiBaseUrl + 'connection/' + this.relation + '/find/all?' +
				'articleid=' + this.articleId +
				'&label=' +this.label +
				this.getQueryString();
		};

		return this;
	};

	global.Appacitive.Queries.GetConnectionsQuery.prototype = new BasicQuery();

	global.Appacitive.Queries.GetConnectionsQuery.prototype.constructor = global.Appacitive.Queries.GetConnectionsQuery;

	/** 
	* @constructor
	**/
	global.Appacitive.Queries.GetConnectionsBetweenArticlesQuery = function(options, queryType) {

		options = options || {};

		if (!options.articleAId || typeof options.articleAId != 'string' || options.articleAId.length == 0) throw new Error('Specify valid articleAId for GetConnectionsBetweenArticlesQuery query');
		if (!options.articleBId || typeof options.articleBId != 'string' || options.articleBId.length == 0) throw new Error('Specify articleBId for GetConnectionsBetweenArticlesQuery query');
		if (options.schema) delete options.schema;

		options.queryType = queryType || 'GetConnectionsBetweenArticlesQuery';

		BasicQuery.call(this, options);

		this.articleAId = options.articleAId;
		this.articleBId = options.articleBId;
		this.label = (this.queryType() == 'GetConnectionsBetweenArticlesForRelationQuery' && options.label && typeof options.label == 'string' && options.label.length > 0) ? '&label=' + options.label : '';;
		this.relation = (options.relation && typeof options.relation == 'string' && options.relation.length > 0) ? options.relation + '/' : '';
		
		this.toRequest = function() {
			var r = new global.Appacitive.HttpRequest();
			r.url = this.toUrl();
			r.method = 'get';
			return r;
		};

		this.toUrl = function() {
			return global.Appacitive.config.apiBaseUrl + 'connection/' + this.relation + 'find/' + this.articleAId + '/' + this.articleBId + '?'
				+ this.getQueryString() + this.label;
		};

		return this;
	};

	global.Appacitive.Queries.GetConnectionsBetweenArticlesQuery.prototype = new BasicQuery();

	global.Appacitive.Queries.GetConnectionsBetweenArticlesQuery.prototype.constructor = global.Appacitive.Queries.GetConnectionsBetweenArticlesQuery;

	/** 
	* @constructor
	**/
	global.Appacitive.Queries.GetConnectionsBetweenArticlesForRelationQuery = function(options) {
		
		options = options || {};
		
		if (!options.relation) throw new Error('Specify relation for GetConnectionsBetweenArticlesForRelationQuery query');
		
		var inner = new global.Appacitive.Queries.GetConnectionsBetweenArticlesQuery(options, 'GetConnectionsBetweenArticlesForRelationQuery');

		inner.fetch = function(onSuccess, onError) {
			var request = this.toRequest();
			request.onSuccess = function(d) {
			if (d && d.status && d.status.code == '200') {
				   if (typeof onSuccess == 'function') onSuccess(d.connection ? new global.Appacitive.Connection(d.connection) :  null);
				} else {
					d = d || {};
					if (typeof onError == 'function') onError(d.status || { message : 'Server error', code: 400 });
				}
			};
			request.onError = function(d) {
				d = d || {};
				if (typeof onError == 'function') onError(d.status || { message : 'Server error', code: 400 });
			};
			global.Appacitive.http.send(request);
			return this;
		};

		return inner;
	};

	/** 
	* @constructor
	**/
	global.Appacitive.Queries.InterconnectsQuery = function(options) {

		options = options || {};

		if (!options.articleAId || typeof options.articleAId != 'string' || options.articleAId.length == 0) throw new Error('Specify valid articleAId for InterconnectsQuery query');
		if (!options.articleBIds || typeof options.articleBIds != 'object' || !(options.articleBIds.length > 0)) throw new Error('Specify list of articleBIds for InterconnectsQuery query');
		if (options.schema) delete options.schema;

		options.queryType = 'InterconnectsQuery';

		BasicQuery.call(this, options);

		this.articleAId = options.articleAId;
		this.articleBIds = options.articleBIds;
		
		this.toRequest = function() {
			var r = new global.Appacitive.HttpRequest();
			r.url = this.toUrl();
			r.method = 'post';
			r.data = {
				article1id: this.articleAId,
				article2ids: this.articleBIds
			};
			return r;
		};

		this.toUrl = function() {
			return global.Appacitive.config.apiBaseUrl + 'connection/interconnects?' + this.getQueryString();
		};

		return this;
	};

	global.Appacitive.Queries.InterconnectsQuery.prototype = new BasicQuery();

	global.Appacitive.Queries.InterconnectsQuery.prototype.constructor = global.Appacitive.Queries.InterconnectsQuery;


	/** 
	* @constructor
	**/
	global.Appacitive.Queries.GraphFilterQuery = function(name, placeholders) {

		if (!name || name.length == 0) throw new Error("Specify name of filter query");
		
		this.name = name;
		this.data = { };
		this.queryType = 'GraphFilterQuery';

		if (placeholders) this.data.placeholders = placeholders;

		this.toRequest = function() {
			var r = new global.Appacitive.HttpRequest();
			r.url = this.toUrl();
			r.method = 'post';
			r.data = this.data;
			return r;
		};

		this.toUrl = function() {
			return global.Appacitive.config.apiBaseUrl + 'search/' + this.name + '/filter';
		};

		this.fetch = function(onSuccess, onError) {
			
			var request = this.toRequest();
			request.onSuccess = function(d) {
			if (d && d.status && d.status.code == '200') {
				   if (typeof onSuccess == 'function') {
				   		onSuccess(d.ids ? d.ids : []);
					}
				} else {
					d = d || {};
					if (typeof onError == 'function') onError(d.status || { message : 'Server error', code: 400 });
				}
			};
			request.onError = function(d) {
				d = d || {};
				if (typeof onError == 'function') onError(d.status || { message : 'Server error', code: 400 });
			};
			global.Appacitive.http.send(request);
			return this;
		};

	};

	/** 
	* @constructor
	**/
	global.Appacitive.Queries.GraphProjectQuery = function(name, ids, placeholders) {

		if (!name || name.length == 0) throw new Error("Specify name of project query");
		if (!ids || !ids.length) throw new Error("Specify ids to project");
		
		this.name = name;
		this.data = { ids: ids };
		this.queryType = 'GraphProjectQuery';

		if (placeholders) this.data.placeholders = placeholders;

		this.toRequest = function() {
			var r = new global.Appacitive.HttpRequest();
			r.url = this.toUrl();
			r.method = 'post';
			r.data = this.data;
			return r;
		};

		this.toUrl = function() {
			return global.Appacitive.config.apiBaseUrl + 'search/' + this.name + '/project';
		};

		var _parseResult = function(result) {
			var root;
			for (var key in result) {
				if (key !== 'status') {
					root = result[key];
					break;
				}
			}
			var parseChildren = function(obj, parentLabel, parentId) {
				var props = [];
				obj.forEach(function(o) {
					var children = o.__children;
					delete o.__children;
					
					var edge = o.__edge;
					delete o.__edge;

					var tmpArticle = new global.Appacitive.Article(o, true);
					tmpArticle.children = {};
					for (var key in children) {
						tmpArticle.children[key] = [];
						tmpArticle.children[key] = parseChildren(children[key].values, children[key].parent, tmpArticle.id);
					}

					if (edge) {
						edge.__endpointa = {
							articleid : parentId,
							label: parentLabel
						};
						edge.__endpointb = {
							articleid: tmpArticle.id(),
							label: edge.__label
						};
						delete edge.__label;
						tmpArticle.connection = new global.Appacitive.Connection(edge);
					}
					props.push(tmpArticle);
				});
				return props;
			};
			return parseChildren(root.values);
		};

		this.fetch = function(onSuccess, onError) {
			
			var request = this.toRequest();
			request.onSuccess = function(d) {
			if (d && d.status && d.status.code == '200') {
				   if (typeof onSuccess == 'function') {
				   		onSuccess(_parseResult(d));
					}
				} else {
					d = d || {};
					if (typeof onError == 'function') onError(d.status || { message : 'Server error', code: 400 });
				}
			};
			request.onError = function(d) {
				d = d || {};
				if (typeof onError == 'function') onError(d.status || { message : 'Server error', code: 400 });
			};
			global.Appacitive.http.send(request);
			return this;
		};
	};

})(global);(function(global) {

	"use strict";

	//base object for articles and connections
	/**
	* @constructor
	**/
	var _BaseObject = function(objectOptions, setSnapShot) {

		var _snapshot = {};

		//Copy properties to current object
		var _copy = function(src, des) {
			for (var property in src) {
				if (typeof src[property] == 'string') {
					des[property] = src[property];
				} else if (typeof src[property] == 'object')  {
					if (src[property].length >=0 ) des[property] = [];
					else des[property] = {};
					for (var p in src[property]) {
						des[property][p] = src[property][p];
					}
				} else {
					des[property] = src[property];
				}
			}
		};

		var raw = {};
		_copy(objectOptions, raw);
		var article = raw;

		//will be used in case of creating an appacitive article for internal purpose
		if (setSnapShot) {
			_copy(article, _snapshot);
		}

		if (!_snapshot.__id && raw.__id) _snapshot.__id = raw.__id;

		//Check whether __schematype or __relationtype is mentioned and set type property
		if (raw.__schematype) { 
			raw.__schematype = raw.__schematype.toLowerCase();
			this.entityType = raw.__schematype;
			this.schema = this.entityType;
			//if __schematype is user/device then set specific
			if (raw.__schematype == 'user' || raw.__schematype == 'device') this.type = raw.__schematype;
			else this.type = 'article';
		} else if (raw.__relationtype) {
			raw.__relationtype = raw.__relationtype.toLowerCase();
			this.entityType = raw.__relationtype;
			this.relation = this.entityType;
			this.type = 'connection';
		}

		var __cid = parseInt(Math.random() * 1000000, 10);

		this.cid = __cid;

		//Fileds to be ignored while update operation
		var _ignoreTheseFields = ["__id", "__revision", "__endpointa", "__endpointb", "__createdby", "__lastmodifiedby", "__schematype", "__relationtype", "__schemaid", "__relationid", "__utcdatecreated", "__utclastupdateddate", "__tags", "__authType", "__link"];
		
		var _allowObjectSetOperations = ["__link", "__endpointa", "__endpointb"];

		/* parse api output to get error info
		   TODO: define error objects in future depending on codes and messages */
		var _getOutpuStatus = function(data) {
			data = data || {};
			data.message = data.message || 'Server error';
			data.code = data.code || '500';
			return data;
		};

		this.attributes = this.toJSON = this.getObject = function() { return JSON.parse(JSON.stringify(article)); };

		this.properties = function() {
			var properties = this.attributes();
			delete properties.__attributes;
			delete properties.__tags;
			return properties;
		};

		this.id = function() {
			if (arguments.length === 1) {
				this.set('__id', arguments[0]);
				return this;
			}
			return this.get('__id');	
		};

		if (!article.__attributes) article.__attributes = {};
		if (!_snapshot.__attributes) _snapshot.__attributes = {};

		// accessor function for the article's attributes
		this.attr = function() {
			if (arguments.length === 0) {
				if (!article.__attributes) article.__attributes = {};
				return article.__attributes;
			} else if (arguments.length == 1) {
				if (!article.__attributes) article.__attributes = {};
				return article.__attributes[arguments[0]];
			} else if (arguments.length == 2) {
				if (typeof(arguments[1]) !== 'string' && arguments[1] != null)
					throw new Error('only string values can be stored in attributes.');
				if (!article.__attributes) article.__attributes = {};
				article.__attributes[arguments[0]] = arguments[1];
			} else throw new Error('.attr() called with an incorrect number of arguments. 0, 1, 2 are supported.');

			return article.__attributes;
		};

		//accessor function to get changed attributes
		var _getChangedAttributes = function() {
			if (!_snapshot.__attributes) return null;

			var isDirty = false;
			var changeSet = JSON.parse(JSON.stringify(_snapshot.__attributes));
			for (var property in article.__attributes) {
				if (typeof article.__attributes[property] == 'undefined' || article.__attributes[property] === null) {
					changeSet[property] = null;
					isDirty = true;
				} else if (article.__attributes[property] != _snapshot.__attributes[property]) {
					changeSet[property] = article.__attributes[property];
					isDirty = true;
				} else if (article.__attributes[property] == _snapshot.__attributes[property]) {
					delete changeSet[property];
				}
			}
			if (!isDirty) return null;
			return changeSet;
		};

		this.getChangedAttributes = _getChangedAttributes;

		// accessor function for the article's aggregates
		this.aggregates = function() {
			var aggregates = {};
			for (var key in article) {
				if (!article.hasOwnProperty(key)) return;
				if (key[0] == '$') {
					aggregates[key] = article[key];
				}
			}
			if (arguments.length === 0) return aggregates;
			else if (arguments.length == 1) return aggregates[arguments[0]];
			else throw new Error('.aggregates() called with an incorrect number of arguments. 0, and 1 are supported.');
		};

		var _removeTags = []; 
		if (!article.__tags) article.__tags = [];
		if (!_snapshot.__tags) _snapshot.__tags = [];

		this.tags = function()  {
			if (!article.__tags) return [];
			return article.__tags;
		};

		this.addTag = function(tag) {
			if (!tag || typeof tag != 'string' || !tag.length) return this;
		    
		    if (!article.__tags) article.__tags = [];

		    article.__tags.push(tag);
		    article.__tags = Array.distinct(article.__tags);

		    if (!_removeTags || !_removeTags.length) return this;;
			var index = _removeTags.indexOf(tag);
			if (index != -1) _removeTags.splice(index, 1);
			return this;
		};

		this.removeTag = function(tag) {
			if (!tag || typeof tag != 'string' || !tag.length) return this;
			//tag = tag.toLowerCase();
			_removeTags.push(tag);
			_removeTags = Array.distinct(_removeTags);

			if (!article.__tags || !article.__tags.length) return this;
			var index = article.__tags.indexOf(tag);
			if (index != -1) article.__tags.splice(index, 1);
			return this;
		};

		var _getChangedTags = function() {
			if (!article.__tags) return [];
			if (!_snapshot.__tags) return article.__tags;

			var _tags = [];
			article.__tags.every(function(a) {
				if (_snapshot.__tags.indexOf(a) == -1)
					_tags.push(a);
			});
			return _tags;
		};

		this.getChangedTags = _getChangedTags;

		this.getRemovedTags = function() { return _removetags; };

		var _getChanged = function(isInternal) {
			var isDirty = false;
			var changeSet = JSON.parse(JSON.stringify(_snapshot));
			for (var property in article) {
				if (typeof article[property] == 'undefined' || article[property] === null) {
					changeSet[property] = null;
					isDirty = true;
				} else if (article[property] != _snapshot[property]) {
					if (property == '__tags' || property == '__attributes') {
						delete changeSet[property];
					} else {
						changeSet[property] = article[property];
						isDirty = true;
					}
				} else if (article[property] == _snapshot[property]) {
					delete changeSet[property];
				}
			}

			try {
				_ignoreTheseFields.forEach(function(c) {
					if (changeSet[c]) delete changeSet[c];
				});
			} catch(e) {}

			if (isInternal) {
				if (article.__tags && article.__tags.length > 0) { 
					changeSet["__addtags"] = _getChangedTags(); 
					isDirty = true;
				}
				if (_removeTags && _removeTags.length > 0) {
				    changeSet["__removetags"] = _removeTags;
				    isDirty = true;
				}
			} else {
				if (article.__tags && article.__tags.length > 0) { 
					changeSet["__tags"] = _getChangedTags();
					isDirty = true;
			  	}
			}

			var attrs = _getChangedAttributes();
			if (attrs) { 
				changeSet["__attributes"] = attrs;
				isDirty = true;
			}
			else delete changeSet["__attributes"];

			if (isDirty) return changeSet;
			return false;
		};

		this.changed = function() {
			return _getChanged();
		};

		this.hasChanged = function() {
			var changeSet = _getChanged(true);
			if (arguments.length === 0) {
				return Object.isEmpty(changeSet) ? false : true;
			} else if (arguments.length == 1 && typeof arguments[0] == 'string' && arguments[0].length > 0) {
				if (changeSet && changeSet[arguments[0]]) {
					return true;
				} return false;
			}
			return false;
		};

		this.changedAttributes  = function() {
			var changeSet = _getChanged(true);
			
			if (arguments.length === 0) {
				return changeSet;
			} else if (arguments.length == 1 && typeof arguments[0] == 'object' && arguments[0].length) {
				var attrs = {};
				arguments[0].forEach(function(c) {
					if (changeSet[c]) attrs.push(changeSet[c]);
				});
				return attrs;
			}
			return false;
		};

		this.previous = function() {
			if (arguments.length == 1 && typeof arguments[0] == 'string' && arguments[0].length) {
				return _snapshot[arguments[0]];	
			}
			return null
		};

		this.previousAttributes = function() { return _snapshot; };

		var _fields = '';

		this.fields = function() {
			if (arguments.length == 1) {
				var value = arguments[0];
				if (typeof value == 'string') _fields = value;
				else if (typeof value == 'object' && value.length) _fields = value.join(',');
				return this;
			} else {
				return _fields;
			}
		};

		var _types = {
			"integer": function(value) { 
				if (value) {
					var res = parseInt(value);
					if (!isNaN(res)) return res;
				}
				return value;
			}, 
			"decimal": function(value) { 
				if (value) {
					var res = parseFloat(value);
					if (!isNaN(res)) return res;
				}
				return value;
			}, "boolean": function(value) { 
				if (value == 'true' || value == true || value > 0) return true;
				return false;
			}, "date": function(value) { 
				if (value) {
					var res = global.Appacitive.Date.parseISODate(value);
					if (res) return res;
				}
				return value;
			}, "datetime": function(value) { 
				if (value) {
					var res = global.Appacitive.Date.parseISODate(value);
					if (res) return res;
				}
				return value;
			}, "time": function(value) { 
				if (value) {
					var res = global.Appacitive.Date.parseISOTime(value);
					if (res) return res;
				}
				return value;
			}, "string": function(value) { 
				if (value) return value.toSting();
				return value;
			}
		};

		this.get = function(key, type) { 
			var val = "";
			if (key) { 
				if (type && _types[type.toLowerCase()]) {
					var res = _types[type.toLowerCase()](article[key]);
					return res;
				} 
				return article[key]; 
			}
		};

		this.tryGet = function(key, value, type) {
			var res = this.get(key, type);
			if (res != undefined) return res;
			return value;
		};

		this.set = function(key, value) {

			if(!key || typeof key != 'string' ||  key.length == 0 || key.trim().indexOf('$') == 0) return this; 
		 	
		 	if (value == null || value == 'undefined') { article[key] = null;}
		 	else if (typeof value == 'string') { article[key] = value; }
		 	else if (typeof value == 'number' || typeof value == 'boolean') { article[key] = value + ''; }
		 	else if (typeof value == 'object') {
		 		if (value instanceof Date) {
		 			article[key] = global.Appacitive.Date.toISOString(value);
		 		} else {
			 		if (value.length >= 0) article[key] = value; 
			 		else if (_allowObjectSetOperations.indexOf(key) !== -1) article[key] = value;
			 	}
			}
		 	
		 	return this;
		};

		this.unset = function(key) {
			if (!key || typeof key != 'string' ||  key.length == 0 || key.indexOf('__') == 0) return this; 
		 	try { delete article[key]; } catch(e) {}
			return this;
		};

		this.has = function(key) {
			if (!key || typeof key != 'string' ||  key.length == 0) return false; 
			if (article[key] && typeof article[key] != 'undefined') return true;
			return false;
		};

		this.isNew = function() {
			if (article.__id && article.__id.length) return false;
			return true;
		};

		this.clone = function() {
			if (this.type == 'article') return new global.Appacitive.Article(this.toJSON());
			return new global.Appacitive.connection(article);
		};

		this.copy = function(properties, setSnapShot) { 
			if (properties) { 
				_copy(properties, article);
				if (setSnapShot) {
					_copy(properties,_snapshot);
				}
			}
			return this;
		};

		/* crud operations  */

		/* save
		   if the object has an id, then it has been created -> update
		   else create */
		this.save = function(onSuccess, onError) {
			if (article.__id) _update.apply(this, arguments);
			else _create.apply(this, arguments);
			return this;
		};

		// to create the article
		var _create = function(onSuccess, onError, fields) {
			onSuccess = onSuccess || function() {};
			onError = onError || function() {};

			if (typeof fields == 'string') _fields = value;
			else if (typeof fields == 'object' && fields.length) fields = fields.join(',');
			else fields = _fields;

			// save this article
			var that = this;
			var url = global.Appacitive.config.apiBaseUrl + global.Appacitive.storage.urlFactory[this.type].getCreateUrl(article.__schematype || article.__relationtype, fields);

			// for User and Device articles
			if (article.__schematype &&  ( article.__schematype.toLowerCase() == 'user' ||  article.__schematype.toLowerCase() == 'device')) 
				url = global.Appacitive.config.apiBaseUrl + global.Appacitive.storage.urlFactory[article.__schematype.toLowerCase()].getCreateUrl();

			var _saveRequest = new global.Appacitive.HttpRequest();
			_saveRequest.url = url;
			_saveRequest.method = 'put';
			if (article["__revision"]) delete article["__revision"];
			_saveRequest.data = article;
			_saveRequest.onSuccess = function(data) {
				var savedState = null;
				if (data && (data.article || data.connection || data.user || data.device)) {
					savedState = data.article || data.connection || data.user || data.device;
				}
				if (data && savedState) {
					_snapshot = savedState;
					article.__id = savedState.__id;
					_copy(savedState, article);

					// if this is an article and there are collections 
					// of connected articles, set the article Id in them
					if (that.connectionCollections && that.connectionCollections.length > 0) {
						that.connectionCollections.forEach(function (collection) {
							collection.getQuery().extendOptions({ articleId: article.__id });
						});
					}

					if (that.type == 'connection') that.parseConnection();
					global.Appacitive.eventManager.fire((that.schema || that.relation) + '.' + that.type + '.created', that, { object : that });
					if (typeof onSuccess == 'function') onSuccess(that);
				} else {
					data = data || {};
					data.status =  data.status || {};
					data.status = _getOutpuStatus(data.status);
					global.Appacitive.eventManager.fire((that.schema || that.relation) + '.' + that.type + '.createFailed', that, { error: data.status });
					if (typeof onError == 'function') onError(data.status, that);
				}
			};
			_saveRequest.onError = function(err) {
				err = _getOutpuStatus(err);
				if (typeof onError == 'function') onError(err, that);
			}
			global.Appacitive.http.send(_saveRequest);
			return this;
		};

		// to update the article
		var _update = function(onSuccess, onError, fields) {
			onSuccess = onSuccess || function(){};
			onError = onError || function(){};

			var changeSet = _getChanged(true);
			var that = this;
			if (changeSet) {

				if (typeof fields == 'string') _fields = value;
				else if (typeof fields == 'object' && fields.length) fields = fields.join(',');
				else fields = _fields;

				var _updateRequest = new global.Appacitive.HttpRequest();
				var url = global.Appacitive.config.apiBaseUrl + global.Appacitive.storage.urlFactory[this.type].getUpdateUrl(article.__schematype || article.__relationtype, (_snapshot.__id) ? _snapshot.__id : article.__id, fields);
				
				// for User and Device articles
				if (article && article.__schematype &&  ( article.__schematype.toLowerCase() == 'user' ||  article.__schematype.toLowerCase() == 'device')) 
					url = global.Appacitive.config.apiBaseUrl + global.Appacitive.storage.urlFactory[article.__schematype.toLowerCase()].getUpdateUrl(_snapshot.__id);
				
				_updateRequest.url = url;
				_updateRequest.method = 'post';
				_updateRequest.data = changeSet;
				_updateRequest.onSuccess = function(data) {
					if (data && (data.article || data.connection || data.user || data.device)) {
						_snapshot = data.article || data.connection || data.user || data.device;
						_copy(_snapshot, article);
						_removeTags = [];
						global.Appacitive.eventManager.fire((that.schema || that.relation)  + '.' + that.type + "." + article.__id +  '.updated', that, { object : that });
						if (typeof onSuccess == 'function') onSuccess(that);
					} else {
						data = data || {};
						data.status =  data.status || {};
						data.status = _getOutpuStatus(data.status);
						global.Appacitive.eventManager.fire((that.schema || that.relation)  + '.' + that.type + "." + article.__id +  '.updateFailed', that, { object : data.status });
						if (typeof onError == 'function') onError(data.status, that);
					}
				};
				_updateRequest.onError = function(err) {
					err = err || {};
					err.message = err.message || 'Server error';
					err.code = err.code || '500';
					if (typeof onError == 'function') onError(err, that);
				}
				global.Appacitive.http.send(_updateRequest);
			} else {
				if (typeof onSuccess == 'function') onSuccess(that);
			}
			return this;
		};

		// fetch ( by id )
		this.fetch = function(onSuccess, onError, fields) {
			onSuccess = onSuccess || function() {};
			onError = onError || function() {};
			if (!article.__id) {
				if (typeof onError == 'function') onError( {code:'400', message: 'Please specify id for get operation'} ,this);
				return;
			}

			if (typeof fields == 'string') _fields = value;
			else if (typeof fields == 'object' && fields.length) fields = fields.join(',');
			else fields = _fields;

			// get this article by id
			var that = this;
			var url = global.Appacitive.config.apiBaseUrl  + global.Appacitive.storage.urlFactory[this.type].getGetUrl(article.__schematype || article.__relationtype, article.__id, fields);
			var _getRequest = new global.Appacitive.HttpRequest();
			_getRequest.url = url;
			_getRequest.method = 'get';
			_getRequest.onSuccess = function(data) {
				if (data && (data.article || data.connection || data.user || data.device)) {
					_snapshot = data.article || data.connection || data.user || data.device;
					_copy(_snapshot, article);
					if (data.connection) {
						if (!that.endpoints && (!that.endpointA || !that.endpointB)) {
							that.setupConnection(article.__endpointa, article.__endpointb);
						}
					}
					if (that.___collection && ( that.___collection.collectionType == 'article')) that.___collection.addToCollection(that);
					if (typeof onSuccess == 'function') onSuccess(that);
				} else {
					data = data || {};
					data.status =  data.status || {};
					data.status = _getOutpuStatus(data);
					if (typeof onError == 'function') onError(data.status, that);
				}
			};
			_getRequest.onError = function(err) {
				err = _getOutpuStatus(err);
				if (typeof onError == 'function') onError(err, that);
			}
			global.Appacitive.http.send(_getRequest);
			return this;
		};

		// delete the article
		this.del = function(onSuccess, onError, deleteConnections) {

			// if the article does not have __id set, 
			// just remove it from the collection
			// else delete the article and remove from collection

			if (!article['__id']) {
				if (this.___collection) this.___collection.removeByCId(__cid);
				if (typeof onSuccess == 'function') onSuccess(this);
				return;
			}

			onSuccess = onSuccess || function(){};
			onError = onError || function(){};

			// delete this article
			var that = this;
			var url = global.Appacitive.config.apiBaseUrl;
			url += global.Appacitive.storage.urlFactory[this.type].getDeleteUrl(article.__schematype || article.__relationtype, article.__id);

			// for User and Device articles
			if (article && article.__schematype &&  ( article.__schematype.toLowerCase() == 'user' ||  article.__schematype.toLowerCase() == 'device')) {
				url = global.Appacitive.config.apiBaseUrl;
				url += global.Appacitive.storage.urlFactory[article.__schematype.toLowerCase()].getDeleteUrl(article.__id);
			}

			// if deleteConnections is specified
			if (deleteConnections && deleteConnections === true) {
				if (url.indexOf('?') == -1) url += '?deleteconnections=true';
				else url += '&deleteconnections=true';
			}

			var _deleteRequest = new global.Appacitive.HttpRequest();
			_deleteRequest.url = url;
			_deleteRequest.method = 'delete';
			_deleteRequest.onSuccess = function(data) {
				if (data.code == '200') {
					if (that.___collection)
						that.___collection.removeById(article.__id);
					if (typeof onSuccess == 'function') onSuccess(data);
				} else {
					data = _getOutpuStatus(data);
					if (typeof onError == 'function') onError(data, that);
				}
			};
			_deleteRequest.onError = function(err) {
				err = _getOutpuStatus(err);
				if (typeof onError == 'function') onError(err, that);
			}
			global.Appacitive.http.send(_deleteRequest);
		};
	};

	global.Appacitive.BaseObject = _BaseObject;

	global.Appacitive.BaseObject.prototype.toString = function() {
		return JSON.stringify(this.getObject());
	};

})(global);(function (global) {

	"use strict";

	var S4 = function () {
		return Math.floor(Math.random() * 0x10000).toString(16);
	};

	var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

	var _utf8_encode = function (string) {
		string = string.replace(/\r\n/g, "\n");
		var utftext = "";
		for (var n = 0; n < string.length; n++) {
			var c = string.charCodeAt(n);
			if (c < 128) {
				utftext += String.fromCharCode(c);
			} else if ((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			} else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
		}
		return utftext;
	};

	var encodeToBase64 = function (input) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;
		input = _utf8_encode(input);
		while (i < input.length) {

			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);

			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;

			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}

			output = output +
				_keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
				_keyStr.charAt(enc3) + _keyStr.charAt(enc4);
		}

		return output;
	};

	/**
	 * @constructor
	 **/
	global.Appacitive.GUID = function () {
		return encodeToBase64(
		S4() + S4() + "-" +
			S4() + "-" +
			S4() + "-" +
			S4() + "-" +
			S4() + S4() + S4()).toString();
	};

})(global);(function(global) {

	"use strict";

	/** 
	* @constructor
	**/
	var _ArticleCollection = function(options) {

		var _schema = null;
		var _query = null;
		var _articles = [];
		var _options = {};

		if (typeof options == 'string') _options.schema = options;
		else _options = options;

		this.collectionType = 'article';

		this.type = function() { return _schema; };

		if (!_options || !_options.schema) throw new Error('Must provide schema while initializing ArticleCollection.');
		
		_schema = _options.schema;
		
		var that = this;
		var _parseOptions = function(options) {
			options.type = 'article';

			if (options.schema) _schema = options.schema;
			else options.schema = _schema;

			_query = new global.Appacitive.Queries.FindAllQuery(options);
			_options = options;
			that.extendOptions = _query.extendOptions;
		};

		this.setFilter = function(filter) {
			_options.filter = filter;
			_options.type = 'article';
			if (_query) _query.filter(filter);
			else {
				_query = new global.Appacitive.Queries.FindAllQuery(_options);
				that.extendOptions = _query.extendOptions;
			}
			return this;
		};

        this.setFreeText = function(tokens) {
            if(!tokens && tokens.trim().length==0)
                _options.freeText = "";
            _options.freeText = tokens;
            _options.type = 'article';
            if (_query) _query.freeText(tokens);
			else {
				_query = new global.Appacitive.Queries.FindAllQuery(_options);
				that.extendOptions = _query.extendOptions;
			}
			return this;
        };

        this.setFields = function(fields) {
        	if (!fields) fields = "";
            _options.fields = fields;
            _options.type = 'article';
            if (_query) _query.fields(fields);
			else {
				_query = new global.Appacitive.Queries.FindAllQuery(_options);
				that.extendOptions = _query.extendOptions;
			}
			return this;
        };

		this.reset = function() {
			_options = null;
			_schema = null;
			_articles.length = 0;
			_query = null;
		};

		var _supportedQueryType = ["BasicFilterQuery"];

		this.query = function() {
			if (arguments.length == 1) {
				var query = arguments[0];
				if (!query || !query.toRequest) throw new Error('Invalid  appacitive query passed to articleCollection');
				if (_supportedQueryType.indexOf(query.queryType()) == -1) throw new Error('ArticleCollection only accepts ' + _supportedQueryType.join(', '));
				_articles.length = 0;
				_query = query;
				return this;
			}
			return _query;
		};

		this.setOptions = _parseOptions;
		
		_parseOptions(_options);

		// getters
		this.get = function(index) {
			if (index != parseInt(index, 10)) return null;
			index = parseInt(index, 10);
			if (typeof index != 'number') return null;
			if (index >= _articles.length)  return null;
			return _articles.slice(index, index + 1)[0];
		};

		this.addToCollection = function(article) {
			if (!article || article.get('__schematype') != _schema)
				throw new Error('Null article passed or schema type mismatch');
			var index =  null;
			_articles.forEach(function(a, i) {
				if (a.get('__id') == article.get('__id')) {
					index = i;
				}
			});
			if (index != null) {
				_articles.splice(index, 1);
			} else {
				_articles.push(article);
			}
			return this;
		};

		this.getArticleById = function(id) {
			var existingArticle = _articles.filter(function (article) {
				return article.get('__id') == id;
			});
			if (existingArticle.length == 1) return existingArticle[0];
			return null;
		};

		this.getAll = function() { return Array.prototype.slice.call(_articles); };

		this.getAllArticles = function() {
			return Array.prototype.slice.call(_articles).map(function (a) {
				return a.getArticle();
			});
		};

		this.removeById = function(id) {
			if (!id) return false;
			var index = null;
			_articles.forEach(function(article, i) {
				if (article.getArticle().__id && article.getArticle().__id == id) {
					index = i;
				}
			});
			if (index !== null) {
				_articles.splice(index, 1);
			}
			return this;
		};

		this.removeByCId = function(id) {
			if (!id) return false;
			var index = null;
			_articles.forEach(function(article, i) {
				if (article.cid && article.cid == id) {
					index = i;
				}
			});
			if (index !== null) _articles.splice(index, 1);
			return this;
		};

		var parseArticles = function (articles, pagingInfo, onSuccess) {
			if (!articles.length || articles.length === 0) articles = [];
			
			articles.forEach(function (article) {
				article.___collection = that;
				_articles.push(article);
			});

			if (typeof onSuccess == 'function') onSuccess(pagingInfo, that);
		};

		this.fetch = function(onSuccess, onError) {

			_articles.length = 0;
			
			_query.fetch(function(articles, pagingInfo) {
				parseArticles(articles, pagingInfo, onSuccess);
			}, function(err) {
				if (typeof onError == 'function') onError(err, that);
			});

			return this;
		};

		this.count = function(onSuccess, onError) {
			this.query.count(onSuccess, onError);
			return this;
		};

		this.fetchByPageNumber = function(onSuccess, onError, pageNumber) {
			var pInfo = _query.getOptions().pageQuery;
			pInfo.pageNumber = pageNumber;
			this.fetch(onSuccess, onError);
			return this;
		};

		this.fetchNextPage = function(onSuccess, onError) {
			var pInfo = _query.getOptions().pageQuery;
			pInfo.pageNumber += 1;
			this.fetch(onSuccess, onError);
			return this;
		};

		this.fetchPreviousPage = function(onSuccess, onError) {
			var pInfo = _query.getOptions().pageQuery;
			pInfo.pageNumber -= 1;
			if (pInfo.pageNumber === 0) pInfo.pageNumber = 1;
			this.fetch(onSuccess, onError);
			return this;
		};

		this.createNewArticle = function(values) {
			values = values || {};
			values.__schematype = _schema;
			var _a = new global.Appacitive.Article(values);
			_a.___collection = that;
			_articles.push(_a);
			return _a;
		};

		this.map = function(delegate, context) { return _articles.map.apply(delegate, context || this); };
		this.forEach = function(delegate, context) { return _articles.forEach(delegate, context); };
		this.filter = function(delegate, context) { return _articles.filter.apply(delegate, context || this); };

	};

	global.Appacitive.ArticleCollection = _ArticleCollection;

	global.Appacitive.ArticleCollection.prototype.toString = function() {
		return JSON.stringify(this.getAllArticles());
	};

	global.Appacitive.ArticleCollection.prototype.toJSON = function() {
		return this.getAllArticles();
	};

	global.Appacitive.ArticleCollection.prototype.articles = function() {
		return this.getAll();
	};

	global.Appacitive.ArticleCollection.prototype.length = function() {
		return this.articles().length;
	};

})(global);(function(global) {

	"use strict";

	/** 
	* @constructor
	**/
	var _ConnectionCollection = function(options) {

		var _relation = null;
		var _schema = null;

		var _query = null;

		var _connections = [];
		var _articles = [];

		var _options = {};

		if (typeof options == 'string') _options.relation = options;
		else _options = options;

		var connectionMap = {};

		this.collectionType = 'connection';

		this.type = function() { return _relation; };

		var that = this;

		if (!options || !options.relation) throw new Error('Must provide relation while initializing ConnectionCollection.');
		
		_relation = options.relation;

		var _parseOptions = function(options) {
			options.type = 'connection';

			if (options.relation) _relation = options.relation;
			else options.relation = _relation;

			_query = new global.Appacitive.Queries.FindAllQuery(options);
			_options = options;

			return that;
		};

		this.setFilter = function(filter) {
			_options.filter = filter;
			_options.type = 'connection';
			if (_query) _query.filter(filter);
			else {
				_query = new global.Appacitive.Queries.FindAllQuery(_options);
				that.extendOptions = _query.extendOptions;
			}
			return this;
		};

		this.setFreeText = function(tokens) {
            if (!tokens && tokens.trim().length == 0) _options.freeText = "";
            _options.freeText = tokens;
            _options.type = 'connection';
            if (_query) _query.freeText(tokens);
			else {
				_query = new global.Appacitive.Queries.FindAllQuery(_options);
				that.extendOptions = _query.extendOptions;
			}

			return this;
        };

        this.setFields = function(fields) {
        	if (!fields)
                _options.fields = "";
            _options.fields = fields;
            _options.type = 'connection';
            if (_query) _query.fields(fields);
			else {
				_query = new global.Appacitive.Queries.FindAllQuery(_options);
				that.extendOptions = _query.extendOptions;
			}
			return this;
        };

        this.query = function() {
        	if (arguments.length == 1) {
        		var query = arguments[0];
				if (!query || !query.toRequest) throw new Error('Invalid  appacitive query passed to connectionCollection');
				if (_supportedQueryType.indexOf(query.queryType()) == -1) throw new Error('ConnectionCollection only accepts ' + _supportedQueryType.join(', '));
				_articles.length = 0;
				_connections.length = 0;
				_query = query;
				return this;
        	}
        	return _query;
        };

		var _supportedQueryType = ["BasicFilterQuery", "ConnectedArticlesQuery","GetConnectionsQuery"];
		
		this.reset = function() {
			_options = null;
			_relation = null;
			_articles.length = 0;
			_connections.length = 0;
			_query = null;
		};

		this.setOptions = _parseOptions;
		_parseOptions(_options);

		// getters
		this.get = function(index) {
			if (index != parseInt(index, 10)) return null;
			index = parseInt(index, 10);
			if (typeof index != 'number') return null;
			if (index >= _connections.length)  return null;
			return _connections.slice(index, index + 1)[0];
		};

		this.addToCollection = function(connection) {
			if (!connection || connection.get('__relationtype') != _relation)
				throw new Error('Null connection passed or relation type mismatch');
			var index =  null;
			_connections.forEach(function(c, i) {
				if (c.get('__id') == connection.get('__id')) {
					index = i;
				}
			});
			if (index !== null) _connections.splice(index, 1);
			else _connections.push(connection);
			
			return this;
		};

		this.getConnection = function(id, onSuccess, onError) {
			onSuccess = onSuccess || function() {};
			onError = onError || function() {};
			var existingConnection = _connections.filter(function (connection) {
				return connection.get('__id') == id;
			});
			if (existingConnection.length == 1) return existingConnection[0];
			return null;
		};

		this.getAll = function() { return Array.prototype.slice.call(_connections); };

		this.getAllConnections = function() {
			return Array.prototype.slice.call(_connections).map(function (c) {
				return c.getConnection();
			});
		};

		this.removeById = function(id) {
			if (!id) return false;
			var index = null;
			_connections.forEach(function(connection, i) {
				if (connection.getConnection().__id && connection.getConnection().__id == id) {
					index = i;
				}
			});
			if (index !== null) _connections.splice(index, 1);
			return this;
		};

		this.removeByCId = function(id) {
			if (!id) return false;
			var index = null;
			_connections.forEach(function(connection, i) {
				if (connection.cid && connection.cid == id) {
					index = i;
				}
			});
			if (index !== null) _connections.splice(index, 1);
			return this;
		};

		var parseConnections = function (connections, pagingInfo, onSuccess) {
			if (_query.queryType == "GetConnectionsBetweenArticlesForRelationQuery") connections = [connections];

			if (!connections.length || connections.length === 0) connections = [];
			connections.forEach(function (connection) {
				connection.___collection = that;
				
				// if this is a connected articles call...
				if (connection.endpointA.article || connection.endpointB.article) {
					var _a = connection.endpointA.article || connection.endpointB.article;
					_a.___collection = that;
					_articles.push(_a);
				}
				try {
					if (!connection.___collection.connectedArticle)
						delete connection.connectedArticle;
				} catch(e) {}

				_connections.push(connection);
			});

			if (typeof onSuccess == 'function') onSuccess(pagingInfo, that);
		};

		this.getConnectedArticle = function(articleId) {
			if (!_articles || _articles.length === 0) return null;
			var article = _articles.filter(function(a) { return a.get('__id') == articleId; });
			if (article.length > 0) return article[0];
			return null;
		};

		this.fetch = function(onSuccess, onError) {
			_connections.length = 0;
			_query.prev = true;
			_query.fetch(function(connections, pagingInfo) {
				parseConnections(connections, pagingInfo, onSuccess);
			}, function(err) {
				if (typeof onError == 'function') onError(err, that);
			});

			return this;
		};

		this.count = function(onSuccess, onError) {
			_query.count(onSuccess, onError);
			return this;
		};

		this.fetchByPageNumber = function(onSuccess, onError, pageNumber) {
			var pInfo = _query.getOptions().pageQuery;
			pInfo.pageNumber = pageNumber;
			this.fetch(onSuccess, onError);
			return this;
		};

		this.fetchNextPage = function(onSuccess, onError) {
			var pInfo = _query.getOptions().pageQuery;
			pInfo.pageNumber += 1;
			this.fetch(onSuccess, onError);
			return this;
		};

		this.fetchPreviousPage = function(onSuccess, onError) {
			var pInfo = _query.getOptions().pageQuery;
			pInfo.pageNumber -= 1;
			if (pInfo.pageNumber === 0) pInfo.pageNumber = 1;
			this.fetch(onSuccess, onError);
			return this;
		};

		this.createNewConnection = function(values) {
			values = values || {};
			values.__relationtype = _relation;
			var _a = new global.Appacitive.Connection(values);
			_a.___collection = that;
			_connections.push(_a);
			return _a;
		};

		this.map = function(delegate, context) { return _connections.map.apply(delegate, context || this); };
		this.forEach = function(delegate, context) { return _connections.forEach(delegate, context); };
		this.filter = function(delegate, context) { return _connections.filter.apply(delegate, context || this); };
	};

	global.Appacitive.ConnectionCollection = _ConnectionCollection;

	global.Appacitive.ConnectionCollection.prototype.toString = function() {
		return JSON.stringify(this.getAllConnections());
	};

	global.Appacitive.ConnectionCollection.prototype.toJSON = function() {
		return this.getAllConnections();
	};

	global.Appacitive.ConnectionCollection.prototype.connections = function() {
		return this.getAll();
	};

	global.Appacitive.ConnectionCollection.prototype.length = function() {
		return this.connections().length;
	};

})(global);(function (global) {

	"use strict";

	var _getFacebookProfile = function(onSuccess, onError) {
		onSuccess = onSuccess || function() {};
		onError = onError || function(){};
		
		var r = new global.Appacitive.HttpRequest();
		r.method = 'get';
		r.url = global.Appacitive.config.apiBaseUrl + global.Appacitive.storage.urlFactory.user.getGetAllLinkedAccountsUrl(this.get('__id'));
		r.onSuccess = function(d) {
			var fbUsername = null;
			if (d && d.identities && d.identities.length > 0) {
				var fb = d.identities.filter(function(identity) {
					return identity.authtype.toLowerCase() == 'facebook';
				});
				if (fb.length == 1) fbUsername = fb[0].username;
			}
			if (fbUsername !== null) {
				FB.api('/' + fbUsername, function(response) {
					if (response) onSuccess(response);
					else onError();
				});
			} else  onError({code: '404' , message: 'fb account not found'});
		};
		r.onError = onError;
		global.Appacitive.http.send(r);
	};

	global.Appacitive.Article = function(options, setSnapShot) {
		options = options || {};

		if (typeof options == 'string') {
			var sName = options;
			options = { __schematype : sName };
		}

		if (!options.__schematype && !options.schema ) throw new Error("Cannot set article without __schematype");

		if (options.schema) {
			options.__schematype = options.schema;
			delete options.schema;
		}
		
		global.Appacitive.BaseObject.call(this, options, setSnapShot);

		this.type = 'article';
		this.connectionCollections = [];
		this.getArticle = this.getObject;
		this.children = {};

		if (this.get('__schematype').toLowerCase() == 'user') this.getFacebookProfile = _getFacebookProfile;

		this.toJSON = function(recursive) {
			if (recursive) {
				var parseChildren = function(root) {
					var articles = [];
					root.forEach(function(obj) {
						var tmp = obj.getObject();
						if (obj.children && !Object.isEmpty(obj.children)) {
							tmp.children = {};
							for (var c in obj.children) {
								tmp.children[c] = parseChildren(obj.children[c]);
							}
						}
						if (obj.connection) tmp.__connection = obj.connection.toJSON();
						articles.push(tmp);
					});
					return articles;
				};
				return parseChildren([this])[0];
			} else {
				return this.getObject();
			}
		};
		return this;
	};

	global.Appacitive.Article.prototype = new global.Appacitive.BaseObject();

	global.Appacitive.Article.prototype.constructor = global.Appacitive.Article;

	global.Appacitive.Article.prototype.getConnections = function(options) {

		if (this.type != 'article') return null;
		
		options = options || {};
		options.articleId = this.get('__id');
		var collection = new global.Appacitive.ConnectionCollection({ relation: options.relation });
		this.connectionCollections.push(collection);
		
		collection.query(new global.Appacitive.Queries.GetConnectionsQuery(options));
		
		return collection;
	};

	global.Appacitive.Article.prototype.getConnectedArticles = function(options) {

		options = options || {};
		if (typeof options == 'string') {
			options = { relation: options };
		}

		options.schema = this.entityType;
		options.articleId = this.get('__id');
		options.prev = true;

		var collection = new global.Appacitive.ConnectionCollection({ relation: options.relation });
		collection.query(new global.Appacitive.Queries.ConnectedArticlesQuery(options));
		collection.connectedArticle = this;
		this.connectionCollections.push(collection);

		return collection;
	};

	global.Appacitive.Article.prototype.fetchConnectedArticles = function(options, onSuccess, onError) {
		options = options || {};
		if (typeof options == 'string') {
			options = { relation: options };
		}

		options.schema = this.entityType;
		options.articleId = this.get('__id');

		var that = this;

		var query = new global.Appacitive.Queries.ConnectedArticlesQuery(options);

		query.fetch(function(articles, pagingInfo) {
			that.children[options.relation] = articles;
			if (onSuccess && typeof onSuccess == 'function') onSuccess(that, pagingInfo);
		}, onError);		

		return query; 
	};

	global.Appacitive.Article.multiDelete = function(options, onSuccess, onError) {
		options = options || {};

		if (!options.schema || typeof options.schema!= 'string' || options.schema.length == 0) throw new Error("Specify valid schema");

		if (options.schema.toLowerCase() == 'user' || options.schema.toLowerCase() == 'device') throw new Error("Cannot delete user and devices using multidelete");

		if (options.ids && options.ids.length > 0) {

			onSuccess = onSuccess || function(){};
			onError = onError || function(){};

			var request = new global.Appacitive.HttpRequest();
			request.url = global.Appacitive.config.apiBaseUrl + global.Appacitive.storage.urlFactory.article.getMultiDeleteUrl(options.schema);
			request.method = 'post';
			request.data = { idlist : options.ids };
			request.onSuccess = function(d) {
				if (d && d.code == '200') {
					if (typeof onSuccess == 'function') onSuccess();
				} else {
					d = d || {};
					if (typeof onError == 'function') onError (d.status || { message : 'Server error', code: 400 });
				}
			};
			request.onError = function(d) {
				d = d || {};
				if (typeof onError == 'function') onError (d.status || { message : 'Server error', code: 400 });
			}
			global.Appacitive.http.send(request);
		} else onSuccess();
	};

	var _parseArticles = function(articles) {
		var articleObjects = [];
		articles.forEach(function(a){
			articleObjects.push(new global.Appacitive.Article(a));
		});
		return articleObjects;
	};

	//takes relationaname and array of articleids and returns an array of Appacitive article objects
	global.Appacitive.Article.multiGet = function(options, onSuccess, onError) {
		options = options || {};
		if (!options.schema || typeof options.schema!= 'string' || options.schema.length == 0) throw new Error("Specify valid schema");
		if (options.ids && options.ids.length > 0) {
			var request = new global.Appacitive.HttpRequest();
			request.url = global.Appacitive.config.apiBaseUrl + global.Appacitive.storage.urlFactory.article.getMultiGetUrl(options.schema, options.ids.join(','), options.fields);
			request.method = 'get';
			request.onSuccess = function(d) {
				if (d && d.articles) {
				   if (typeof onSuccess == 'function') onSuccess(_parseArticles(d.articles), d.paginginfo);
				} else {
					d = d || {};
					if (typeof onError == 'function') onError(d.status || { message : 'Server error', code: 400 });
				}
			};
			request.onError = function(d) {
				d = d || { message : 'Server error', code: 400 };
				if (typeof onError == 'function') onError(d);
			}
			global.Appacitive.http.send(request);
		} else {
			if (typeof onSuccess == 'function') onSuccess([]);
		}
	};

	global.Appacitive.Article.get = function(options, onSuccess, onError) {
		options = options || {};
		if (!options.schema) throw new Error("Specify schema");
		if (!options.id) throw new Error("Specify id to fetch");

		var obj = {};
		if (options.schema.toLowerCase() == 'user') obj = new global.Appacitive.User({ __id: options.id });
		else obj = new global.Appacitive.Article({ __schematype: options.schema, __id: options.id });
		
		obj.fetch(onSuccess, onError, options.fields);

		return obj;
	};

})(global);(function (global) {

	"use strict";

	var _parseEndpoint = function(endpoint, type, base) {
		var result = { label: endpoint.label };
		if (endpoint.articleid)  result.articleid = endpoint.articleid;
		if (endpoint.article) {
			if (typeof endpoint.article.getArticle == 'function') {
				// provided an instance of Appacitive.ArticleCollection
				// stick the whole article if there is no __id
				// else just stick the __id
				if (endpoint.article.get('__id')) result.articleid = endpoint.article.get('__id');
				else result.article = endpoint.article.getArticle();
			} else if (typeof endpoint.article == 'object' && endpoint.article.__schematype) {
				// provided a raw article
				// if there is an __id, just add that
				// else add the entire article
				if (endpoint.article.__id) result.articleid = endpoint.article.__id;
				else result.article = endpoint.article;

				endpoint.article =  new global.Appacitive.Article(endpoint.article);
			} 
		} else {
			if (!result.articleid && !result.article) throw new Error('Incorrectly configured endpoints provided to setupConnection');
		}

		base["endpoint" + type] = endpoint;
		return result;
	};

	var _convertEndpoint = function(endpoint, type, base) {
		if ( endpoint.article && typeof endpoint.article == 'object') {
			if (!base['endpoint' + type]) {
				base["endpoint" + type] = {};
				base['endpoint' + type].article = new global.Appacitive.Article(endpoint.article, true);
			} else {
				if (base['endpoint' + type] && base['endpoint' + type].article && base['endpoint' + type].article instanceof global.Appacitive.Article)
					base["endpoint" + type].article.copy(endpoint.article, true);
				else 
					base['endpoint' + type].article = new global.Appacitive.Article(endpoint.article, true);
			}
			base["endpoint" + type].articleid = endpoint.article.__id;
			base["endpoint" + type].label = endpoint.label;
			base["endpoint" + type].type = endpoint.type;

			base["endpoint" + type].article.___collection = base.___collection;
		} else {
			base["endpoint" + type] = endpoint;
		}
	};

	global.Appacitive.Connection = function(options, doNotSetup) {
		options = options || {};
		
		if (typeof options == 'string') {
			var rName = options;
			options = { __relationtype : rName };
		}

		if (!options.__relationtype && !options.relation ) throw new Error("Cannot set connection without relation");

		if (options.relation) {
			options.__relationtype = options.relation;
			delete options.relation;
		}

		if (options.endpoints && options.endpoints.length == 2) {
			options.__endpointa = options.endpoints[0];
			options.__endpointb = options.endpoints[1];
			delete options.endpoints;
		}

		global.Appacitive.BaseObject.call(this, options, doNotSetup);
		this.type = 'connection';
		this.getConnection = this.getObject;

		this.parseConnection = function() {
			
			var typeA = 'A', typeB ='B';
			if ( options.__endpointa.label == this.get('__endpointb').label ) {
				if ((options.__endpointa.label != options.__endpointb.label) && (options.__endpointa.articleid == this.get('__endpointb').articleid || !options.__endpointa.articleid)) {
				 	typeA = 'B', typeB = 'A';
				}
			}

			_convertEndpoint(this.get('__endpointa'), typeA, this);
			_convertEndpoint(this.get('__endpointb'), typeB, this);

			this.endpoints = function() {
				var endpoints = [];
				endpoints.push(this.endpointA);
				endpoints.push(this.endpointB);
				return endpoints;
			};

			return this;
		};

		if (doNotSetup) {
			this.connectedArticle = function() {
				if (!this.___collection.connectedArticle) {
					throw new Error('connectedArticle can be accessed only by using the getConnectedArticles call');
				}
				var articleId = this.___collection.connectedArticle.get('__id');
				if (!articleId) return null;
				var otherArticleId = this.endpointA.articleid;
				if (otherArticleId == articleId)
					otherArticleId = this.endpointB.articleid;
				return this.___collection.getConnectedArticle(otherArticleId);
			};
			this.parseConnection(options);
		} else {
			if (options.__endpointa && options.__endpointb) this.setupConnection(this.get('__endpointa'), this.get('__endpointb'));
		} 

		return this;
	};

	global.Appacitive.Connection.prototype = new global.Appacitive.BaseObject();

	global.Appacitive.Connection.prototype.constructor = global.Appacitive.Connection;

	global.Appacitive.Connection.prototype.setupConnection = function(endpointA, endpointB) {
		
		// validate the endpoints
		if (!endpointA || (!endpointA.articleid &&  !endpointA.article) || !endpointA.label || !endpointB || (!endpointB.articleid && !endpointB.article) || !endpointB.label) {
			throw new Error('Incorrect endpoints configuration passed.');
		}

		// there are two ways to do this
		// either we are provided the article id
		// or a raw article
		// or an Appacitive.Article instance
		// sigh
		
		// 1
		this.set('__endpointa', _parseEndpoint(endpointA, 'A', this));

		// 2
		this.set('__endpointb', _parseEndpoint(endpointB, 'B', this));

		// 3
		this.endpoints = function() {
			var endpoints = [];
			endpoints.push(this.endpointA);
			endpoints.push(this.endpointB);
			return endpoints;
		};

	};

	global.Appacitive.Connection.get = function(options, onSuccess, onError) {
		options = options || {};
		if (!options.relation) throw new Error("Specify relation");
		if (!options.id) throw new Error("Specify id to fetch");
		var obj = new global.Appacitive.Connection({ __relationtype: options.relation, __id: options.id });
		obj.fields = options.fields;
		obj.fetch(onSuccess, onError);
	};

    //private function for parsing api connections in sdk connection object
	var _parseConnections = function(connections) {
		var connectionObjects = [];
		if (!connections) connections = [];
		connections.forEach(function(c){
			connectionObjects.push(new global.Appacitive.Connection(c));
		});
		return connectionObjects;
	};

	//private function for firing a request
	var _fetch = function(request, onSuccess, onError) {
		request.onSuccess = function(d) {
			if (d && d.status && d.status.code == '200') {
			   if (typeof onSuccess == 'function') onSuccess(_parseConnections(d.connections), d.paginginfo);
			} else {
				d = d || {};
				if (typeof onError == 'function') onError(d.status || { message : 'Server error', code: 400 });
			}
		};
		request.onError = function(d) {
			d = d || { message : 'Server error', code: 400 };
			if (typeof onError == 'function') onError(d);
		};
		global.Appacitive.http.send(request);
	};

	//takes relationname and array of connectionids and returns an array of Appacitive article objects
	global.Appacitive.Connection.multiGet = function(options, onSuccess, onError) {
		options = options || {};
		if (!options.relation || typeof options.relation!= 'string' || options.relation.length == 0) throw new Error("Specify valid relation");
		if (options.ids && options.ids.length > 0) {
			var request = new global.Appacitive.HttpRequest();
			request.url = global.Appacitive.config.apiBaseUrl + global.Appacitive.storage.urlFactory.connection.getMultiGetUrl(options.relation, options.ids.join(','), options.fields);
			request.method = 'get';
			return _fetch(request, onSuccess, onError); 
		} else { 
			if (typeof onSuccess == 'function') onSuccess([]);
		}
	};

	//takes relationame, and array of connections ids
	global.Appacitive.Connection.multiDelete = function(options, onSuccess, onError) {
		options = options || {};
		
		if (!options.relation || typeof options.relation!= 'string' || options.relation.length == 0) throw new Error("Specify valid relation");

		if (options.ids && options.ids.length > 0) {
			var request = new global.Appacitive.HttpRequest();
			request.url = global.Appacitive.config.apiBaseUrl + global.Appacitive.storage.urlFactory.connection.getMultiDeleteUrl(options.relation);
			request.method = 'post';
			request.data = { idlist : options.ids };
			request.onSuccess = function(d) {
				if (d && d.code == '200') {
					if (typeof onSuccess == 'function') onSuccess();
				} else {
					d = d || {};
					if (typeof onError == 'function') onError(d || { message : 'Server error', code: 400 });
				}
			};
			request.onError = function(d) {
				d = d || {};
				if (typeof onError == 'function') onError(d || { message : 'Server error', code: 400 });
			}
			global.Appacitive.http.send(request);
		} else onSuccess();
	};

	//takes 1 articleid and multiple aricleids and returns connections between both 
	global.Appacitive.Connection.getInterconnects = function(options, onSuccess, onError) {
		var q = new global.Appacitive.Queries.InterconnectsQuery(options);
		_fetch(q.toRequest(), request, onSuccess, onError);
	};

	//takes 2 articleids and returns connections between them
	global.Appacitive.Connection.getBetweenArticles = function(options, onSuccess, onError) {
		var q = new global.Appacitive.Queries.GetConnectionsBetweenArticlesQuery(options);
		_fetch(q.toRequest(), onSuccess, onError);
	};

	//takes 2 articles and returns connections between them of particluar relationtype
	global.Appacitive.Connection.getBetweenArticlesForRelation = function(options, onSuccess, onError) {
		new global.Appacitive.Queries.GetConnectionsBetweenArticlesForRelationQuery(options).fetch(onSuccess, onError);
	};

})(global);(function (global) {

	"use strict";

	var UserManager = function() {

		var _authenticatedUser = null;

		this.currentUser = function() {
			return _authenticatedUser;
		}

		var _updatePassword = function(base, oldPassword, newPassword, onSuccess, onError) {
			var userId = base.get('__id');
			if (!userId || typeof userId !== 'string' || userId.length == 0) throw new Error("Please specify valid userid");
			if (!oldPassword || typeof oldPassword !== 'string' || oldPassword.length == 0) throw new Error("Please specify valid oldPassword");
			if (!newPassword || typeof newPassword !== 'string' || newPassword.length == 0) throw new Error("Please specify valid newPassword");

			onSuccess = onSuccess || function(){};
			onError = onError || function(){};

			if (oldPassword == newPassword) {
			 	if (typeof onSuccess == 'function') onSuccess(base); return;
			}

			var updatedPasswordOptions = { oldpassword : oldPassword, newpassword: newPassword };
			var request = new global.Appacitive.HttpRequest();
			request.url = global.Appacitive.config.apiBaseUrl + global.Appacitive.storage.urlFactory.user.getUpdatePasswordUrl(userId);
			request.method = 'post';
			request.data = updatedPasswordOptions;
			request.onSuccess = function(a) {
				if (a && a.code == '200') {
					if (typeof onSuccess == 'function') onSuccess(base);
				}
				else { onError(a, base); }
			};
			request.onError = onError;
			global.Appacitive.http.send(request);
		};

		var _getAllLinkedAccounts = function(base, onSuccess, onError) {
			var userId = base.get('__id');
			if (!userId || typeof userId !== 'string' || userId.length == 0) {
				if (typeof onSuccess == 'function') onSuccess(base.linkedAccounts(), base);
			}

			onSuccess = onSuccess || function(){};
			onError = onError || function(){};

			var request = new global.Appacitive.HttpRequest();
			request.url = global.Appacitive.config.apiBaseUrl + global.Appacitive.storage.urlFactory.user.getGetAllLinkedAccountsUrl(userId);
			request.method = 'get';
			request.onSuccess = function(a) {
				if (a && a.status && a.status.code == '200') { 
					var accounts = a.identities || []; 
					if (accounts.length > 0) base.set('__link', accounts);
					else base.set('__link', null);
					if (typeof onSuccess == 'function') onSuccess(accounts, base);
				}
				else { onError(a.status, base); }
			};
			request.onError = onError;
			global.Appacitive.http.send(request);
		};

		var _checkin = function(coords, base, onSuccess, onError) {
			var userId = base.get('__id');
			if (!userId || typeof userId !== 'string' || userId.length == 0) {
				if (onSuccess && typeof onSuccess == 'function') onSuccess();
			}
			if (!coords || !coords.lat || !coords.lng) throw new Error("Invalid coordinates provides");

			onSuccess = onSuccess || function(){};
			onError = onError || function(){};

			var request = new global.Appacitive.HttpRequest();
			request.url = global.Appacitive.config.apiBaseUrl + global.Appacitive.storage.urlFactory.user.getCheckinUrl(userId, coords.lat, coords.lng);
			request.method = 'post';
			request.onSuccess = function(a) {
				if (a && a.code == '200') { 
					if (typeof onSuccess == 'function') onSuccess(accounts, base);
				}
				else { if (typeof onError == 'function') onError(a, base); }
			};
			request.onError = onError;
			global.Appacitive.http.send(request);
		};

		var _link = function(accessToken, base, onSuccess, onError) {

			onSuccess = onSuccess || function() {};
			onError = onError || function() {};
			
			var payload = {
				"authtype": "facebook",
				"accesstoken": accessToken,
				"name": "facebook"
			};

			var userId = base.get('__id');

			if (!base.get('__id')) {
				base.set('__link', payload);
				if (typeof onSuccess == 'function') onSuccess(base);
				return;
			}

			var request = new global.Appacitive.HttpRequest();
			request.url = global.Appacitive.config.apiBaseUrl + global.Appacitive.storage.urlFactory.user.getLinkAccountUrl(userId);
			request.method = 'post';
			request.data = payload;
			request.onSuccess = function(a) {
				if (a && a.code == '200') {
					base.set('__link', payload);
					if (typeof onSuccess == 'function') onSuccess(base);
				}
				else { onError(a, base); }
			};
			request.onError = onError;
			global.Appacitive.http.send(request);
		};

		var _unlink = function(name, base, onSuccess, onError) {
			onSuccess = onSuccess || function() {};
			onError = onError || function() {};
			
			var userId = base.get('__id');

			if (!base.get('__id')) {
				if (typeof onSuccess == 'function') onSuccess(base);
				return;
			}

			var request = new global.Appacitive.HttpRequest();
			request.url = global.Appacitive.config.apiBaseUrl + global.Appacitive.storage.urlFactory.user.getLinkAccountUrl(userId, name);
			request.method = 'post';
			request.onSuccess = function(a) {
				if (a && a.code == '200') {
					base.set('__link', null);
					if (typeof onSuccess == 'function') onSuccess(base);
				}
				else { onError(a, base); }
			};
			request.onError = onError;
			global.Appacitive.http.send(request);
		};

		this.setCurrentUser = function(user, token, expiry) {
			if (!user) throw new Error('Cannot set null object as user');
			var userObject = user;
			
			if (!(userObject instanceof global.Appacitive.User)) userObject = new global.Appacitive.User(user, true); 
			else if (!userObject.get('__id') || userObject.get('__id').length == 0) throw new Error('Specify user __id');
			else user = userObject.toJSON(); 

			global.Appacitive.localStorage.set('Appacitive-User', user);
			if (!expiry) expiry = 60;
			_authenticatedUser = userObject;

			if (token) global.Appacitive.Session.setUserAuthHeader(token, expiry);

			_authenticatedUser.logout = function(callback) { global.Appacitive.Users.logout(callback); };

			_authenticatedUser.updatePassword = function(oldPassword, newPassword, onSuccess, onError) {
				_updatePassword(this, oldPassword, newPassword, onSuccess, onError);
				return this;
			};

			_authenticatedUser.linkFacebookAccount = function(onSuccess, onError) {
				var _callback = function() {
					_link(Appacitive.Facebook.accessToken(), _authenticatedUser, function(base) {
						global.Appacitive.eventManager.fire('user..article.' + base.get('__id') + '.updated', base, { object: base });
						if (typeof onSuccess == 'function') onSuccess(base);
					}, onError);
				};

				Appacitive.Facebook.getCurrentUserInfo(function() {
					_callback();
				}, function() {
					Appacitive.Facebook.requestLogin(function() {
						_callback();
					}, onError);
				});

				return this;
			};

			_authenticatedUser.unlinkFacebookAccount = function(onSuccess, onError) {

				_unlink('facebook', this, function(base) {
					global.Appacitive.eventManager.fire('user.article.' + base.get('__id') + '.updated', base, { object: base });
					if (typeof onSuccess == 'function') onSuccess(base);
				}, onError);
				
				return this;
			};

			_authenticatedUser.logout = function(callback) { global.Appacitive.Users.logout(callback); };

			_authenticatedUser.checkin = function(coords, onSuccess, onError) {
				_checkin(coords, this, onSuccess, onError);
				return this;
			};
			global.Appacitive.eventManager.clearAndSubscribe('user.article.' + userObject.get('__id') + '.updated', function(sender, args) {
				global.Appacitive.localStorage.set('Appacitive-User', args.object.getArticle());
			});

			return _authenticatedUser;
		};
		
		global.Appacitive.User = function(options) {
			options = options || {};
			options.__schematype = 'user';
			global.Appacitive.Article.call(this, options);
			return this;
		};

		global.Appacitive.User.prototype = new global.Appacitive.Article('user');

		global.Appacitive.User.prototype.constructor = global.Appacitive.User;

		//getter to get linkedaccounts
		global.Appacitive.User.prototype.linkedAccounts = function() {
			
			var accounts = this.get('__link');
			
			if(!accounts) accounts = [];
			else if(typeof accounts == 'object' && !(accounts.length >= 0)) accounts = [accounts];
			else if(!(accounts.length >= 0)) accounts = accounts[0];

			return accounts;
		};

		//method for getting all linked accounts
		global.Appacitive.User.prototype.getAllLinkedAccounts = function(onSuccess, onError) {
			onSuccess = onSuccess || function(){};
			var that = this;

			_getAllLinkedAccounts(this, function(accounts) {
				if (typeof onSuccess == 'function') onSuccess(accounts, that);
			}, onError);
			return this;
		};

		//method for linking facebook account to a user
		global.Appacitive.User.prototype.linkFacebookAccount = function(accessToken, onSuccess, onError) {
			_link(accessToken, this, onSuccess, onError);
			return this;
		};

		//method for unlinking facebook account for a user
		global.Appacitive.User.prototype.unlinkFacebookAccount = function(onSuccess, onError) {
			var that = this;
			_unlink('facebook', this, function() {
				var accounts = that.get('__link');
			
				if (!accounts) accounts = [];
				else if(!(accounts.length >= 0)) accounts = [accounts];

				if (accounts.length > 0) {
					if (accounts[0].name == 'facebook') {
						that.set('__link', null);
					}
				}

				if (typeof onSuccess == 'function') onSuccess(that);
			}, onError);
			return this;
		};

		global.Appacitive.User.prototype.clone = function() {
			return new global.Appacitive.User(this.getObject());
		};

		this.deleteUser = function(userId, onSuccess, onError) {
			if (!userId) throw new Error('Specify userid for user delete');

			onSuccess = onSuccess || function(){};
			onError = onError || function(){};

			var userObject = new global.Appacitive.Article({ __schematype: 'user', __id: userId });
			userObject.del(onSuccess, onError);
		};

		this.deleteCurrentUser = function(onSuccess, onError) {
			
			var _callback = function() {
				global.Appacitive.Session.removeUserAuthHeader();
				if (typeof onSuccess == 'function') onSuccess();
			}
			if (_authenticatedUser === null) { 
				_callback();
				return;
			}
			var currentUserId = _authenticatedUser.get('__id');
			this.deleteUser(currentUserId, function() { 
				_callback();
			}, onError);
		};

		this.createNewUser = function(user, onSuccess, onError) {
			user = user || {};
			user.__schematype = 'user';
			if (!user.username || !user.password || !user.firstname || user.username.length == 0 || user.password.length == 0 || user.firstname.length == 0) 
				throw new Error('username, password and firstname are mandatory');

			var userObject = new global.Appacitive.User(user);
			userObject.save(onSuccess, onError);
		};
		this.createUser = this.createNewUser;

		//method to allow user to signup and then login 
		this.signup = function(user, onSuccess, onError) {
			var that = this;
			this.createUser(user, function() {
				that.login(user.username, user.password, onSuccess, onError);
			}, function(status) {
				onError(status);
			});
		};

		//authenticate user with authrequest that contains username , password and expiry
		this.authenticateUser = function(authRequest, onSuccess, onError, provider) {
			onSuccess = onSuccess || function(){};
			onError = onError || function(){};

			if (!authRequest.expiry) authRequest.expiry = 86400000;
			var that = this;
			var request = new global.Appacitive.HttpRequest();
			request.method = 'post';
			request.url = global.Appacitive.config.apiBaseUrl + global.Appacitive.storage.urlFactory.user.getAuthenticateUserUrl();
			request.data = authRequest;
			request.onSuccess = function(data) {
				if (data && data.user) {
					if (provider) { 
						data.user.__authType = provider;
					}
					that.setCurrentUser(data.user, data.token, authRequest.expiry);
					onSuccess({ user : _authenticatedUser, token: data.token });
				} else {
					data = data || {};
					onError(data.status);
				}
			};
			request.onError = onError;
			global.Appacitive.http.send(request);
		};

		//An overrride for user login with username and password directly
		this.login = function(username, password, onSuccess, onError) {
			onSuccess = onSuccess || function(){};
			onError = onError || function(){};

			if (!username || !password || username.length ==0 || password.length == 0) 
				throw new Error('Please specify username and password');

			var authRequest = {
				username : username,
				password: password,
				expiry: 86400000
			};

			this.authenticateUser(authRequest, onSuccess, onError, 'BASIC');
		};

		this.signupWithFacebook = function(onSuccess, onError) {
			this.loginWithFacebook(onSuccess, onError, false, true);
		};

		this.loginWithFacebook = function(onSuccess, onError, ignoreFBLogin, isNew) {
			onSuccess = onSuccess || function(){};
			onError = onError || function(){};
			var that = this;

			var _callback = function() {

				var authRequest = {
					"accesstoken": global.Appacitive.Facebook.accessToken(),
					"type": "facebook",
					"expiry": 86400000,
					"createnew": true
				};

				that.authenticateUser(authRequest, function(a) {
					if (a.user) {
						a.user.__authType = 'FB';
						if (typeof onSuccess == 'function') onSuccess({ user : _authenticatedUser, token: a.token });
					} else {
						a = a || {};
						if (typeof onError == 'function') onError(a.status);
					}
				}, onError, 'FB');
			};
			if (ignoreFBLogin) {
				_callback();
			} else { 
				Appacitive.Facebook.requestLogin(function(authResponse) {
					_callback();
				}, onError);
			}
		};

		this.authenticateWithFacebook = this.signupWithFacebook;

		this.validateCurrentUser = function(callback, avoidApiCall) {

			if (callback && typeof callback != 'function' && typeof callback == 'boolean') {
				avoidApiCall = callback;
				callback = function() {}; 
			}

			var token = global.Appacitive.Cookie.readCookie('Appacitive-UserToken');

			if (!token) {
				if (typeof(callback) == 'function') callback(false);
				return false;
			}

			if (!avoidApiCall) {
				try {
					var that = this;
					this.getUserByToken(token, function(user) {
						that.setCurrentUser(user, token);
						if (typeof(callback) == 'function') callback(true);
					}, function() {
						if (typeof(callback) == 'function') callback(false);
					});
				} catch (e) { callback(false);}
			} else {
				if (typeof(callback) == 'function') callback(true);
				return true;
			}
		};

		this.sendResetPasswordEmail = function(username, subject, onSuccess, onError) {
			onSuccess = onSuccess || function(){};
			onError = onError || function(){};

			if (!username || typeof username != 'string' || username.length == 0) throw new Error("Please specify valid username");
			if (subject && typeof subject == 'string' && subject.length == 0) throw new Error('Plase specify subject for email');

			var passwordResetOptions = { username: username, subject: subject };
			var request = new global.Appacitive.HttpRequest();
			request.url = global.Appacitive.config.apiBaseUrl + global.Appacitive.storage.urlFactory.user.getSendResetPasswordEmailUrl();
			request.method = 'post';
			request.data = passwordResetOptions;
			request.onSuccess = function(a) {
				if (a && a.code == '200') {
				 	if (typeof onSuccess == 'function') onSuccess();
				} else { onError(a); }
			};
			request.onError = onError;
			global.Appacitive.http.send(request); 
		};

		var _getUserByIdType = function(url, onSuccess, onError){
			onSuccess = onSuccess || function(){};
			onError = onError || function(){};

			var request = new global.Appacitive.HttpRequest();
			request.url = url;
			request.method = 'get';
			request.onSuccess = function(data) {
				if (data && data.user) { 
					if (typeof onSuccess == 'function') onSuccess(new global.Appacitive.User(data.user));
				} else if (typeof onError == 'function') onError(data.status);
			};
			request.onError = onError;
			global.Appacitive.http.send(request);
		};

		this.getUserByToken = function(token, onSuccess, onError) {
			if (!token || typeof token != 'string' || token.length == 0) throw new Error("Please specify valid token");
			var url = global.Appacitive.config.apiBaseUrl + global.Appacitive.storage.urlFactory.user.getUserByTokenUrl(token);
			_getUserByIdType(url, onSuccess, onError);
		};

		this.getUserByUsername = function(username, onSuccess, onError) {
			if (!username || typeof username != 'string' || username.length == 0) throw new Error("Please specify valid username");
			var url = global.Appacitive.config.apiBaseUrl + global.Appacitive.storage.urlFactory.user.getUserByUsernameUrl(username);
			_getUserByIdType(url, onSuccess, onError);
		};

		this.logout = function(callback, avoidApiCall) {
			callback = callback || function() {};
			_authenticatedUser = null;
			global.Appacitive.Session.removeUserAuthHeader(callback, avoidApiCall);
		};

		this.resetPassword = function(token, newPassword, onSuccess, onError) {
			onSuccess = onSuccess || function(){};
			onError = onError || function(){};

			if (!token) throw new Error("Please specify token");
			if (!newPassword || newPassword.length == 0) throw new Error("Please specify password");

			var request = new global.Appacitive.HttpRequest();
			request.url = global.Appacitive.config.apiBaseUrl + global.Appacitive.storage.urlFactory.user.getResetPasswordUrl(token);
			request.method = 'post';
			request.data = { newpassword: newPassword };
			request.onSuccess = function(a) {
				if (a && a.code == '200') {
				 	if (typeof onSuccess == 'function') onSuccess();
				} else { onError(a); }
			};
			request.onError = onError;
			global.Appacitive.http.send(request); 
		};

		this.validateResetPasswordToken = function(token, onSuccess, onError) {
			onSuccess = onSuccess || function(){};
			onError = onError || function(){};

			if (!token) throw new Error("Please specify token");

			var request = new global.Appacitive.HttpRequest();
			request.url = global.Appacitive.config.apiBaseUrl + global.Appacitive.storage.urlFactory.user.getValidateResetPasswordUrl(token);
			request.method = 'post';
			request.data = {};
			request.onSuccess = function(a) {
				if (a.status && a.status.code == '200') {
				 	if (typeof onSuccess == 'function') onSuccess(a.user);
				} else { onError(a.status); }
			};
			request.onError = onError;
			global.Appacitive.http.send(request); 
		};
	};

	global.Appacitive.Users = new UserManager();

})(global);(function(global) {

	"use strict";

	var _emailManager = function() {

		var config = {
			smtp: {
				username: null,
				password: null,
				host: "smtp.gmail.com",
				port: 465,
				enablessl: true
			},
			from: null,
			replyto: null
		}

		this.getConfig = function() {
			var _copy = config;
			return _copy;
		};

		var _sendEmail = function (email, onSuccess, onError) {
			var request = new global.Appacitive.HttpRequest();
			request.url = global.Appacitive.config.apiBaseUrl + global.Appacitive.storage.urlFactory.email.getSendEmailUrl();
			request.method = 'post';
			request.data = email;
			request.onSuccess = function(d) {
				if (d && d.status && d.status.code == '200') {
					onSuccess(d.email);
				} else {
					d = d || {};
					d.status = d.status || { message: 'Server Error', code: '400'};
					onError(d.status);
				}
			};
			global.Appacitive.http.send(request);
		};

		this.setupEmail = function(options) {
			options = options || {};
			config.smtp.username = options.username || config.smtp.username;
			config.from = options.from || config.from;
			config.smtp.password = options.password || config.smtp.password;
			config.smtp.host = options.smtp.host || config.smtp.host;
			config.smtp.port = options.smtp.port || config.smtp.port;
			config.smtp.enablessl = options.enableSSL || config.smtp.enablessl;
			config.replyto = options.replyTo || config.replyto;
		};


		this.sendTemplatedEmail = function(options, onSuccess, onError) {
			onSuccess = onSuccess || function(){};
			onError = onError || function(){};

			if (!options || !options.to || !options.to.length || options.to.length == 0) {
				throw new Error('Atleast one receipient is mandatory to send an email');
			}
			if (!options.subject || options.subject.trim().length == 0) {
				throw new Error('Subject is mandatory to send an email');
			}

			if(!options.from && config.from) {
				throw new Error('from is mandatory to send an email. Set it in config or send it in options on the portal');
			} 

			if (!options.templateName) {
				throw new Error('template name is mandatory to send an email');
			}

			var email = {
				to: options.to || [],
				cc: options.cc || [],
				bcc: options.bcc || [],
				subject: options.subject,
				from: options.from,
				body: {
					templatename: options.templateName || '',
					data : options.data || {},
					ishtml: (options.isHtml == false) ? false : true
				}
			};

			if (options.useConfig) {
				email.smtp = config.smtp;
				if(!options.from && !config.from) {
					throw new Error('from is mandatory to send an email. Set it in config or send it in options');
				}
				email.from = options.from || config.from;
				email.replyto = options.replyTo || config.replyto;
			}

			_sendEmail(email, onSuccess, onError);
		};

		this.sendRawEmail = function(options, onSuccess, onError) {
			onSuccess = onSuccess || function(){};
			onError = onError || function(){};

			if (!options || !options.to || !options.to.length || options.to.length == 0) {
				throw new Error('Atleast one receipient is mandatory to send an email');
			}
			if (!options.subject || options.subject.trim().length == 0) {
				throw new Error('Subject is mandatory to send an email');
			}

			if(!options.from && config.from) {
				throw new Error('from is mandatory to send an email. Set it in config or send it in options on the portal');
			} 

			if (!options.body) {
				throw new Error('body is mandatory to send an email');
			} 

			var email = {
				to: options.to || [],
				cc: options.cc || [],
				bcc: options.bcc || [],
				subject: options.subject,
				from: options.from,
				body: {
					content: options.body || '',
					ishtml: (options.isHtml == false) ? false : true
				}
			};

			if (options.useConfig) {
				email.smtp = config.smtp;
				if(!options.from && !config.from) {
					throw new Error('from is mandatory to send an email. Set it in config or send it in options');
				}
				email.from = options.from || config.from;
				email.replyto = options.replyTo || config.replyto;
			}

			_sendEmail(email, onSuccess, onError);
		};

	};

	global.Appacitive.Email = new _emailManager();

})(global);(function (global) {

 	"use strict";

    var _browserFacebook = function() {

		var _accessToken = null;

		var _initialized = true;

		var _app_id = null;

		this.initialize = function(options) {
		  if (!FB) throw "Facebook SDK needs be loaded before calling initialize.";
		  if (!options.appId) throw new Error("Please provide appid");
		  _app_id = options.appId;
		  FB.init(options);
		  _initialized = true;
		};

		this.requestLogin = function(onSuccess, onError) {
			if (!_initialized) throw new Error("Either facebook sdk has not yet been initialized, or not yet loaded.");
		    onSuccess = onSuccess || function(){};
			onError = onError || function(){};
			FB.login(function(response) {
				if (response && response.status === 'connected' && response.authResponse) {
					_accessToken = response.authResponse.accessToken;
					if (typeof onSuccess == 'function') onSuccess(response.authResponse);
				} else {
					if (typeof onError == 'function') onError();
				}
			}, { scope:'email,user_birthday' });
		};

		this.getCurrentUserInfo = function(onSuccess, onError) {
			if (!_initialized) throw new Error("Either facebook sdk has not yet been initialized, or not yet loaded.");
			onSuccess = onSuccess || function(){};
			onError = onError || function(){};
			FB.api('/me', function(response) {
				if (response && !response.error) {
					_accessToken = FB.getAuthResponse().accessToken;
					if (typeof onSuccess == 'function') onSuccess(response);
				} else {
					if (typeof onError == 'function') onError();
				}
			});
		};

		this.accessToken = function() {
			if (arguments.length == 1) {
				_accessToken = arguments[0];
				return this;
			}
			return _accessToken;
		};

		this.getProfilePictureUrl = function(username) {
			return 'https://graph.facebook.com/' + username + '/picture';
		};

		this.logout = function(onSuccess, onError) {
			onSuccess = onSuccess || function() {};
			onError = onError || function(){};
			Appacitive.Facebook.accessToken = "";
			try {
				FB.logout(function(response) {
					Appacitive.Users.logout();
					if (typeof onSuccess == 'function') onSuccess();
				});
			} catch(e) {
				if (typeof onError == 'function') onError(e.message);
			}
		};
	};

	var _nodeFacebook = function() {

		var Facebook = require('facebook-node-sdk');

		var _accessToken = null;

		this.FB = null;

		var _app_id = null;

		var _app_secret = null;

		var _initialized = true;

		this.initialize = function (options) { 
			if (!Facebook) throw new Error("node-facebook SDK needs be loaded before calling initialize.");
			if (!options.appId) throw new Error("Please provide appid");
			if (!options.appSecret) throw new Error("Please provide app secret");

			_app_id = options.appId;
			_app_secret = options.appSecret;
		    this.FB = new Facebook({ appId: _appId, secret: _app_secret });
		    _initialized = true;
		}

		this.requestLogin = function(onSuccess, onError, accessToken) {
			if (!_initialized) {
			  if (typeof onError == 'function') onError("Intialize facebook with your appid and appsecret");
			  return;
			}
			_accessToken = accesstoken;
			FB.setAccessToken(accessToken);
			Appacitive.Users.loginWithFacebook(onSuccess, onError, true);
		};

		this.getCurrentUserInfo = function(onSuccess, onError) {
			if (!_initialized) throw new Error("Either facebook sdk has not yet been initialized, or not yet loaded.");

			if(this.FB && _accessToken){
				onSuccess = onSuccess || function(){};
				onError = onError || function(){};
				this.FB.api('/me', function(err, response) {
					if (response) {
						if (typeof onSuccess == 'function') onSuccess(response);
					} else {
						if (typeof onError == 'function') onError("Access token is invalid");
					}
				});
			} else {
				onError("Either intialize facebook with your appid and appsecret or set accesstoken");
			}
		};

		this.accessToken = function() {
			if (arguments.length == 1) {
				_accessToken = arguments[0];
				return this;
			}
			return _accessToken;
		};

		this.getProfilePictureUrl = function(username) {
			return 'https://graph.facebook.com/' + username + '/picture';
		};

		this.logout = function(onSuccess, onError) {
			onSuccess = onSuccess || function() {};
			onError = onError || function(){};
			Appacitive.Facebook.accessToken = "";
			if (typeof onSuccess == 'function') onSuccess();
		}
	}

	global.Appacitive.Facebook = global.Appacitive.runtime.isBrowser ? new _browserFacebook() : new _nodeFacebook();

})(global);(function(global) {

	"use strict";

	var _pushManager = function() {

		this.send = function(options, onSuccess, onError) {
			onSuccess = onSuccess || function(){};
			onError = onError || function(){};

			if(!options)
				throw new Error("Please specify push options");

			var request =  new global.Appacitive.HttpRequest();
			request.url = global.Appacitive.config.apiBaseUrl + Appacitive.storage.urlFactory.push.getPushUrl();

			request.method = 'post';
			request.data = options;

			request.onSuccess = function(d) {
				if (d && d.status && d.status.code == '200') {
					onSuccess(d.id);
				} else {
					d = d || {};
					d.status = d.status || {};
					onError(d.status.message || 'Server error');
				}
			};

			request.onError = function(d){
				onError(d || "Server error");
			}

			global.Appacitive.http.send(request);
		};

		this.getNotification = function(notificationId, onSuccess, onError) {
			onSuccess = onSuccess || function(){};
			onError = onError || function(){};

			if(!notificationId)
				throw new Error("Please specify notification id");

			var request =  new global.Appacitive.HttpRequest();
			request.url = global.Appacitive.config.apiBaseUrl + Appacitive.storage.urlFactory.push.getGetNotificationUrl(notificationId);

			request.method = 'get';

			request.onSuccess = function(d) {
				if (d && d.status && d.status.code == '200') {
					onSuccess(d.pushnotification);
				} else {
					d = d || {};
					d.status = d.status || {};
					onError(d.status.message || 'Server error');
				}
			};

			request.onError = function(d){
				onError(d || "Server error");
			}

			global.Appacitive.http.send(request);
		};

		this.getAllNotifications = function(pagingInfo, onSuccess, onError) {
			onSuccess = onSuccess || function(){};
			onError = onError || function(){};

			if(!pagingInfo)
				pagingInfo = { pnum: 1, psize: 20 };
			else {
				pagingInfo.pnum = pagingInfo.pnum || 1;
				pagingInfo.psize = pagingInfo.psize || 20;
			}

			var request =  new global.Appacitive.HttpRequest();
			request.url = global.Appacitive.config.apiBaseUrl + Appacitive.storage.urlFactory.push.getGetAllNotificationsUrl(pagingInfo);

			request.method = 'get';

			request.onSuccess = function(d) {
				if (d && d.status && d.status.code == '200') {
					onSuccess(d.pushnotifications, d.paginginfo);
				} else {
					d = d || {};
					d.status = d.status || {};
					onError(d.status.message || 'Server error');
				}
			};

			request.onError = function(d){
				onError(d || "Server error");
			}

			global.Appacitive.http.send(request);
		};

	};

	global.Appacitive.Push = new _pushManager();

})(global);(function(global) {

  "use strict";

  var _file = function(options) {
      
      options = options || {}; 
      this.fileId = options.fileId;
      this.contentType = options.contentType;
      this.fileData = options.fileData;

      var _getUrls = function(url, onSuccess, onError) {
          var request = new global.Appacitive.HttpRequest();
          request.url = url;
          request.method = 'GET';
          request.onSuccess = onSuccess;
          request.onError = onError;
          global.Appacitive.http.send(request); 
      };

      var _upload = function(url, file, type, onSuccess, onError) {
          var fd = new FormData();
          fd.append("fileToUpload", file);
          var request = new global.Appacitive.HttpRequest();
          request.url = url;
          request.method = 'PUT';
          request.data = file;
          request.headers.push({ key:'content-type', value: type });
          request.onSuccess = onSuccess;
          request.onError = onError;
          request.send();
      };

      this.save = function(onSuccess, onError, contentType) {
        if (this.fileId && typeof this.fileId == 'string' && this.fileId.length > 0)
          _update(this, onSuccess, onError, contentType);
        else
          _create(this, onSuccess, onError, contentType);
      };

      var _create = function(that, onSuccess, onError, contentType) {
          if (!that.fileData) throw new Error('Please specify filedata');
          if (contentType || typeof contentType == 'string') that.contentType = contentType;
          else {
              if (!that.contentType || typeof that.contentType !== 'string' || that.contentType.length == 0) that.contentType = 'text/plain';
              try { that.contentType = file.type; } catch(e) {}
          }
          var url = global.Appacitive.config.apiBaseUrl + global.Appacitive.storage.urlFactory.file.getUploadUrl(that.contentType, that.fileId ? that.fileId : '');
          onSuccess = onSuccess || function(){};
          onError = onError || function(){};

          _getUrls(url, function(response) {
              if (response && response.status && response.status.code == '200') {
                _upload(response.url, that.fileData, that.contentType, function() {
                    that.fileId = response.id;
                    that.getDownloadUrl(function(res) {
                       onSuccess(res, that);
                    }, onError);
                }, onError);
              } else {
                if (typeof onError == 'function') onError(response.status, that);
              }
          }, onError);
          return this;
      };

      var _update = function(that, onSuccess, onError, contentType) {
          if (!that.fileData) throw new Error('Please specify filedata');
          if (contentType || typeof contentType == 'string') that.contentType = contentType;
          else {
              if (!that.contentType || typeof contentType !== 'string' || that.contentType.length == 0) that.contentType = 'text/plain';
              try { that.contentType = file.type; } catch(e) {}
          }

          var url = global.Appacitive.config.apiBaseUrl + global.Appacitive.storage.urlFactory.file.getUpdateUrl(that.fileId, that.contentType);
          onSuccess = onSuccess || function() {};
          onError = onError || function() {};

          _getUrls(url, function(response) {
              if (response && response.status && response.status.code == '200') {
                _upload(response.url, that.fileData, that.contentType, function() {
                    that.getDownloadUrl(function(res) {
                       onSuccess(res, that);
                    }, onError);
                }, onError);
              } else {
                if (typeof onError == 'function') onError(response.status, that);
              }
          }, onError);
          return this;
      };

      this.deleteFile = function(onSuccess, onError) {
          if (!this.fileId) throw new Error('Please specify fileId to delete');

          onSuccess = onSuccess || function() {};
          onError = onError || function() {};

          var request = new global.Appacitive.HttpRequest();
          request.url = global.Appacitive.config.apiBaseUrl + global.Appacitive.storage.urlFactory.file.getDeleteUrl(this.fileId);;
          request.method = 'DELETE';

          request.onSuccess = function(response) {
              if (response && response.code == '200') {
                  if (typeof onSuccess == 'function') onSuccess();
              } else if (typeof onError == 'function') {
                  if (typeof onError == 'function') onError(response, that);
              }
          };
          request.onError = onError;
          global.Appacitive.http.send(request);  
          return this;
      };

      this.getDownloadUrl = function(onSuccess, onError) {
          if (!this.fileId) throw new Error('Please specify fileId to download');
          var expiry = 5560000;
          
          var that = this;
          onSuccess = onSuccess || function() {};
          onError = onError || function() {};

          var request = new global.Appacitive.HttpRequest();
          request.url = global.Appacitive.config.apiBaseUrl + global.Appacitive.storage.urlFactory.file.getDownloadUrl(this.fileId, expiry);
          request.method = 'GET';

          request.onSuccess = function(response) {
              if (response && response.status && response.status.code == '200') {
                  that.url = response.uri;
                  if (typeof onSuccess == 'function') onSuccess(response.uri);
              } else if (typeof onError == 'function') {
                  if (typeof onError == 'function') onError(response.status, that);
              }
          };
          request.onError = onError;
          global.Appacitive.http.send(request); 
          return this;
      };

      this.getUploadUrl = function(onSuccess, onError, contentType) {
          var that = this;

          if (contentType || typeof contentType == 'string') this.contentType = contentType;
          else {
              if (!this.contentType || typeof this.contentType !== 'string' || this.contentType.length == 0) this.contentType = 'text/plain';
          }

          var url = global.Appacitive.config.apiBaseUrl + global.Appacitive.storage.urlFactory.file.getUploadUrl(this.contentType, this.fileId ? this.fileId : '');
          onSuccess = onSuccess || function() {};
          onError = onError || function() {};

          _getUrls(url, function(response) {
              if (response && response.status && response.status.code == '200') {
                  that.url = response.url;
                  onSuccess(response.url, that);
              } else if (typeof onError == 'function') {
                  onError(response.status, that);
              }
          }, onError);
      };

      return this;
  };

  global.Appacitive.File = _file;

}(global));(function(global) {
  
  global.Appacitive.Date = {};

  global.Appacitive.Date.parseISODate = function (str) {
    try {
      var date = new Date(str);
      if (isNaN(date)) {
        var regexp = new RegExp("^([0-9]{1,4})-([0-9]{1,2})-([0-9]{1,2})" + "T" + "([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2})" + "(.([0-9]+))?" + "Z$");
        var isOnlyDate = false;
        if (!regexp.exec(str)) {
           regexp = new RegExp("^([0-9]{1,4})-([0-9]{1,2})-([0-9]{1,2})");
           if (!regexp.exec(str)) {
              return null  
           } else {
              isOnlyDate = true;
           }
        }  

        var parts = str.split('T'),
        dateParts = parts[0].split('-'),
        timeParts = parts[1].split('Z'),
        timeSubParts = timeParts[0].split(':'),
        timeSecParts = timeSubParts[2].split('.'),
        timeHours = Number(timeSubParts[0]),
        date = new Date();

        date.setUTCFullYear(Number(dateParts[0]));
        date.setUTCMonth(Number(dateParts[1])-1);
        date.setUTCDate(Number(dateParts[2]));
        
        if (!isOnlyDate) {
          date.setUTCHours(Number(timeHours));
          date.setUTCMinutes(Number(timeSubParts[1]));
          date.setUTCSeconds(Number(timeSecParts[0]));
          if (timeSecParts[1]) date.setUTCMilliseconds(Number(timeSecParts[1]));
        }
        return date;
      } else {
        return date;
      }
    } catch(e) {return null;}
  };

  global.Appacitive.Date.toISOString = function (date) {
    try {
      date = date.toISOString();
      date = date.replace('Z','0000Z');
      return date;
    } catch(e) { return null;}
  };

  global.Appacitive.Date.toISODate = function(date) {
    try {
      date = date.toISOString().split('T')[0];
      return date;
    } catch(e) { return null; }
  };

  global.Appacitive.Date.toISOTime = function(date) {
    try {
      date = date.toISOString().split('T')[1];
      date = date.replace('Z','0000Z');
      return date;
    } catch(e) { return null; }
  };

  global.Appacitive.Date.parseISOTime = function(str) {
    try {
      var date = new Date();
    
      var parts = str.split('T');
      if (parts.length == 1) parts.push(parts[0]);
      
      var regexp = new RegExp("^([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2})" + "(.([0-9]+))?" + "Z$");
      if (!regexp.exec(parts[1])) {
         return null;
      }

      var timeParts = parts[1].split('Z'),
      timeSubParts = timeParts[0].split(':'),
      timeSecParts = timeSubParts[2].split('.'),
      timeHours = Number(timeSubParts[0]);
      
      date.setUTCHours(Number(timeHours));
      date.setUTCMinutes(Number(timeSubParts[1]));
      date.setUTCSeconds(Number(timeSecParts[0]));
      if (timeSecParts[1]) date.setUTCMilliseconds(Number(timeSecParts[1]));
    
      return date;
    } catch(e) {return null;}
  };

})(global);(function (global) {

	"use strict";

	var A_LocalStorage = function() {

		var _localStorage = (global.Appacitive.runtime.isBrowser) ? window.localStorage : { getItem: function() { return null } };

		this.set = function(key, value) {
			value = value || '';
			if (!key) return false;

		    if (typeof value == "object") {
		    	try {
			      value = JSON.stringify(value);
			    } catch(e){}
		    }
		    key = global.Appacitive.getAppPrefix(key);

			_localStorage[key] = value;
			return true;
		};

		this.get = function(key) {
			if (!key) return null;

			key = global.Appacitive.getAppPrefix(key);

			var value = _localStorage.getItem(key);
		   	if (!value) { return null; }

		    // assume it is an object that has been stringified
		    if (value[0] == "{") {
		    	try {
			      value = JSON.parse(value);
			    } catch(e){}
		    }

		    return value;
		};
		
		this.remove = function(key) {
			if (!key) return;
			key = global.Appacitive.getAppPrefix(key);
			try { delete _localStorage[key]; } catch(e){}
		}
	};

	global.Appacitive.localStorage = new A_LocalStorage();

})(global);(function (global) {

var cookieManager = function () {

	this.setCookie = function (name, value, minutes, erase) {
		name = global.Appacitive.getAppPrefix(name);
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
		var domain = 'domain=' + window.location.hostname;
		if (window.location.hostname == 'localhost') domain = '';
		
		document.cookie = name + "=" + value + expires + "; path=/;" + domain;
	};

	this.readCookie = function (name) {
		name = global.Appacitive.getAppPrefix(name);
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for (var i=0; i < ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1,c.length);
			if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
		}
		return null;
	};

	this.eraseCookie = function (name) {
		this.setCookie(name, "" ,-1, true);
	};

};

if (global.Appacitive.runtime.isBrowser)
	global.Appacitive.Cookie = new cookieManager();

})(global);
if (typeof module != 'undefined' && !global.Appacitive.runtime.isBrowser) module.exports =  global.Appacitive;
