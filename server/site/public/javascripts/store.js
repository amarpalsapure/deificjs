(function() {
	Deific.AppacitiveRESTSerializer = DS.RESTSerializer.extend({
		//primary key is '__id' in appacitive, overriding default behaviour
		primaryKey: '__id',
		
		serializeHasMany: function(record, json, relationship) {
			var key = relationship.key;

			var relationshipType = DS.RelationshipChange.determineRelationshipType(record.constructor, relationship);

			if (relationshipType === 'manyToNone' || relationshipType === 'manyToMany' || relationshipType === 'manyToOne') {
				json[key] = record.get(key).mapBy('id');
			// TODO support for polymorphic manyToNone and manyToMany relationships
			}
		}
	});

	Deific.Store = DS.Store.extend({
	  	revision: 12,
	  	adapter: DS.RESTAdapter.extend({
    		namespace: 'service',
    		defaultSerializer: 'Deific/appacitiveREST'
		}),
	});
	
	
	Deific.ArrayTransform = DS.Transform.extend({
  		serialize: function(value) {
    		return Em.isNone(value) ? [] : value ;
  		},
		deserialize: function(value) {
    		return Em.isNone(value) ? [] : value ;
  		}
	});


	Deific.localDataSource = Ember.Object.create({
		debug: window.init.config.env === 'sandbox',

		error: [],

		getCurrentUser: function() {
			if (window.init && window.init.user) {
				var user = window.init.user;
				var lUser = Deific.LocalUser.create();
				lUser.userid = user.id;
				lUser.firstname = user.fname;
				lUser.lastname = user.lname;
				return lUser;
			} else {
				return null;
			}
		},

		getLatestRouteError: function() {
			if(this.error.length > 0) return this.error.pop();
			else return {
					referenceid: 'notavailble',
					code: '56789', //this code value is handled differently on client side
					error: 'Something went wrong. Check your network connection.'	  				
				};
		},

		handleRouteError:  function(promiseError) {
			this._logError(promiseError, 'baseRoute');
			var errorObj;
			try {
				errorObj = JSON.parse(promiseError.responseText);	
			}catch(e){
				errorObj = {
					referenceid: 'notavailble',
					code: '56789', //this code value is handled differently on client side
					error: 'Something went wrong. Check your network connection.'	  				
				}
			}
			this.error.push(errorObj);
		},

		handleError: function(promiseError, source, action) {
			this._logError(promiseError, source);
			try {
				return JSON.parse(promiseError.responseText).error;	
			}catch(e){
				return 'Network failure';
			}			
		},

		_logError: function(promiseError, source) {
			if (this.debug) {
				console.debug('Deific=>\n\tStatus Code:' + promiseError.status + 
							  '\n\tStatus Text: ' + promiseError.statusText  + 
							  '\n\tResponse: ' + promiseError.responseText + 
							  '\n\tSource: ' + source);
			}
		}
	});
}).call(this);