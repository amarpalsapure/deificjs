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
		getError: function(code, message, severity, location, callback) {
			if (Deific.ApplicationController.debug) {
				console.debug('Deific - ' + severity + ' - Code: ' + code + ' Message: ' + message + ' Location: ' + location);
			}
			return {
				code: code,
				message: message,
				severity: severity,
				location: location
			};
		}
	});
}).call(this);