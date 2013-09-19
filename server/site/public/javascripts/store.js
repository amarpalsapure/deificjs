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
		debug: true,
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
		handleError: function(promiseError, source, action) {
			if (this.debug) {
				console.debug('Deific=>\n\tStatus Code:' + promiseError.status + 
							  '\n\tStatus Text: ' + promiseError.statusText  + 
							  '\n\tResponse: ' + promiseError.responseText + 
							  '\n\tSource: ' + source);
			}
			return JSON.parse(promiseError.responseText);
		}
	});
}).call(this);