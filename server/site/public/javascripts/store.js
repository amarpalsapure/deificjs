(function() {
	Deific.AppacitiveSerializer = DS.RESTSerializer.extend({
		//primary key is '__id' in appacitive, overriding default behaviour
		primaryKey: function(type){
			return	'__id';
		},
		//serialize id as string not number
		serializeId: function(id) {
    		return id;    		
  		}
	});

	Deific.Store = DS.Store.extend({
	  	revision: 12,
	  	adapter: DS.RESTAdapter.extend({
    		namespace: 'service',
    		serializer: Deific.AppacitiveSerializer
		}),
	});
	
	
	DS.JSONTransforms.array = {
  		serialize: function(value) {
    		return Em.isNone(value) ? [] : value ;
  		},
		deserialize: function(value) {
    		return Em.isNone(value) ? [] : value ;
  		}
	};


	Deific.localDataSource = Ember.Object.create({
		getCurrentUser: function() {
			
			if (window.init && window.init.user) {
				var user = window.init.user;
				return Deific.LocalUser.create({
					userid: user.id,
					firstname: user.fname,
					lastname: user.lname
				});
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