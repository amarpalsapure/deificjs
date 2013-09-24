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
	  	"<div {{bindAttr class=':question :row isanswered:isanswered'}}> \
		    <div class='col-xs-12 col-sm-1 col-lg-1'>   \
		        <div class='user-profile'>  \
		            <div class='divPic'>    \
		                <a class='user-img' {{bindAttr href='author.url'}} {{bindAttr title='author.fullname'}}>    \
		                    <img {{bindAttr src='author.smallimgurl'}}/>    \
		                </a>    \
		            </div>  \
		            <div class='divUserDetails'>    \
		                <div class='divUser'>   \
		                    <a {{bindAttr href='author.url'}} {{bindAttr title='author.fullname'}}> \
		                        <span class='name'>{{author.fullname}}</span>&nbsp;<span class='spanPosted'>asked...</span> \
		                    </a>    \
		                </div>  \
		                <div class='divPts'>{{abbreviateNumber author.reputation}}</div>    \
		            </div>  \
		        </div>  \
		    </div>	\
		    <div {{bindAttr class=':col-entity-details :col-xs-12 view.questionlist:col-sm-9:col-sm-11 view.questionlist:col-lg-9:col-lg-11'}}>	\
		        <div {{bindAttr class=':row view.questionpage:border-bottom'}}>	\
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
		                            <span {{bindAttr class=':mrs view.hidevotecount:hide'}}>{{votecount}} {{pluralize votecount s='vote'}}</span>	\
		                            <span {{bindAttr class=':mrs view.hideviewcount:hide'}}>&#8226; {{answercount}} {{pluralize answercount s='answer'}} </span>	\
		                            <span {{bindAttr class=':mrs view.hideanswercount:hide'}}>&#8226; {{viewcount}} {{pluralize viewcount s='view'}}</span>	\
		                        </div>	\
		                        <div {{bindAttr class=':question-tag view.hidetag:hide'}}>	\
		                            <div class='pts pbm tag-container'>	\
		                                {{#each tag in tags}}	\
		                                    {{render 'tag' tag}}	\
		                                {{/each}}	\
		                            </div>	\
		                        </div>	\
		                    </div>	\
		                </div>	\
		            </div>	\
		        </div>	\
		        <div class='row'>	\
		            <div class='col-xs-12 col-sm-12 col-lg-12 font9'>	\
		                <div {{bindAttr class='view.questionpage:ptm :pbm'}}>	\
		                    {{text}}... <a {{bindAttr href='url' title='Click to read more'}}>more</a>	\
		                </div>	\
		            </div>	\
		        </div>	\
		    </div>	\
		    <div {{bindAttr class=':col-xs-12 :col-sm-2 :col-lg-2 view.questionlist:show:hide'}} >	\
		        <div class='divTime'>	\
		            {{sincetime __utcdatecreated}}	\
		        </div> 	\
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