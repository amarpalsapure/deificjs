(function() {
	Deific.AppacitiveSerializer = DS.RESTSerializer.extend({
		primaryKey: function(type){
			return	'__id';
		}
	});

	Deific.Store = DS.Store.extend({
	  	revision: 12,
	  	adapter: DS.RESTAdapter.extend({
    		url: 'http://localhost:3000',
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
			if (true) {
				return Deific.LocalUser.create({
					username: 'john.doe',
				  	firstname: 'Amar',
				  	lastname: 'Palsapure'
				});
			} else {
				return null;
			}
		}
	});
}).call(this);