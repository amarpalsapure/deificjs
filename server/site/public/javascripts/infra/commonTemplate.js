(function() {
	window.templates = new (function() {
		//Paging template
		var _pagingTemplate =
		"{{#if isvisible}}	\
	  		<ul class='pagination'>	\
	    		<li {{bindAttr class='view.disableprepage:disabled'}}><a {{bindAttr href='view.jumpfirstpage'}}>&laquo;</a></li>	\
				{{#each page in pages itemController='paging'}}	\
	      			<li {{bindAttr class='isactivepage:active'}}><a {{bindAttr href='jumptopage'}}>{{pagenumber}}</a></li>	\
	    		{{/each}}	\
	    		<li {{bindAttr class='view.disablenextpage:disabled'}}><a {{bindAttr href='view.jumplastpage'}}>&raquo;</a></li>	\
	  		</ul>	\
	  	{{/if}}";

	  	//Tag Template
	  	var _tagTemplate = 
	  	"<span class='label label-default mrm'> \
    		<a data-toggle='popover' 	\
    			{{bindAttr data-content='description'}} 	\
    			{{bindAttr data-original-title='name'}} 	\
    			{{bindAttr href='selfurl'}}>	\
    				{{name}}	\
			</a>	\
  		</span>";

	  	//Entity template
	  	var _entityTemplate = 
	  	"<div {{bindAttr class=':row view.questionpage:border-bottom'}}>	\
          	<div class='col-xs-12 col-sm-12 col-lg-12'>	\
            	<div class='entity-info-container'>	\
              		<div {{ bindAttr class='view.questionpage:question-bookmark:hide'}}>	\
                		<i class='icon-star'></i>	\
              		</div>	\
              		<div class='entity-info'>	\
                		<div class='entity-title'>	\
                  			<div class='pbxs'>	\
                    			<h1>	\
                      				<a {{bindAttr title='text'}} {{bindAttr href='url'}}>	\
	                        			{{#if view.entitylist}}	\
	                          				{{#if isquestion}}	\
	                            				Q: 	\
	                          				{{else}}	\
	                            				A: 	\
	                          				{{/if}}	\
	                        			{{/if}}	\
	                        			{{title}}	\
                  					</a>	\
                    			</h1>	\
                  			</div>	\
                		</div>	\
                		<div class='divUser'>	\
                  			<span class='spanPosted muted font9'>asked by </span>	\
              				<a {{bindAttr href='author.url'}} {{bindAttr title='author.fullname'}}>	\
                				<span class='name'>{{author.fullname}}</span>	\
              				</a>	\
                		</div>	\
                		<div class='separator'></div>	\
                		<div class='entity-details'>	\
		                  <span class='mrs'>{{votecount}} {{pluralize votecount s='vote'}}</span>	\
		                  <span class='mrs'>&#8226; {{answercount}} {{pluralize answercount s='answer'}} </span>	\
		                  <span class='mrs'>&#8226; {{viewcount}} {{pluralize viewcount s='view'}}</span>	\
                		</div>	\
                		<div class='question-tag'>	\
                  			<div class='pts pbm tag-container'>	\
                    			{{#each tag in tags}}	\
                      				{{render 'tag' tag}}	\
                    			{{/each}}	\
                  			</div>	\
                		</div>	\
              		</div>	\
        		</div>	\
          	</div>	\
        </div>";

	  	this.pagingTemplate = _pagingTemplate;
	  	this.tagTemplate = _tagTemplate;
  		this.entityTemplate = _entityTemplate;
	})();
}).call(this);

Ember.TEMPLATES.paging = Ember.Handlebars.compile(templates.pagingTemplate);
Ember.TEMPLATES.tag = Ember.Handlebars.compile(templates.tagTemplate);
Ember.TEMPLATES.entity = Ember.Handlebars.compile(templates.entityTemplate);