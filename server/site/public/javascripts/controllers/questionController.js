(function() {
  Deific.QuestionController = Ember.ObjectController.extend({
  	

  	
  	isCommenting: true,

  	edit: function() {
   		this.set('isCommenting', true);
  	},
  	cancelEditing: function(){
  		this.set('isCommenting', false);
  	},
	doneEditing: function() {
		this.set('isCommenting', false);
	    //this.get('store').commit();
	}
  });
}).call(this);