(function() {
	window.templates = new (function() {
		var _error = 
		"{{outlet headerBar}}	\
		  <div class='container'>	\
		    <div class='content'>	\
		      <div class='mainSection' style='margin-right: 0;'>	\
		        <div class='row error-page'>	\
		          <div class='col-lg-12 z-index-1 text-center'>	\
		            <h3 class='transform-upper ptxl'>{{markdown message}}</h3>	\
		            {{#if code}}	\
			            <p class='font110 mtl mbm'>We are investigating the issue.</p>	\
			            <p>Please try again after some time. Thanks.</p>	\
		            {{/if}}	\
		          </div>	\
		        </div>	\
		      </div>	\
		    </div>	\
		  </div>	\
		{{render 'footer'}}";

		//Paging template
		var _pagingTemplate =
		"{{#if isvisible}}	\
	  		<ul class='pagination'>	\
	    		<li {{bindAttr class='view.disableprepage:disabled view.hiddenprepage:hide'}}><a {{bindAttr href='view.jumpfirstpage'}}>&laquo;</a></li>	\
				{{#each page in pages itemController='paging'}}	\
	      			<li {{bindAttr class='isactivepage:active'}}><a {{bindAttr href='jumptopage'}}>{{pagenumber}}</a></li>	\
	    		{{/each}}	\
	    		<li {{bindAttr class='view.disablenextpage:disabled view.hiddennextpage:hide'}}><a {{bindAttr href='view.jumplastpage'}}>&raquo;</a></li>	\
	  		</ul>	\
	  	{{/if}}";

	  	//Tag Template
	  	var _tagTemplate = 
	  	"<span class='label label-default mrm'> \
    		<a data-toggle='popover' data-html='true'	\
    			{{bindAttr data-content='hoverContent'}} 	\
    			{{bindAttr data-original-title='title'}} 	\
    			{{bindAttr href='selfurl'}}>	\
    				{{name}}	\
			</a>	\
  		</span>";

  		var _relatedtagsTemplate = 
  		"<ul class='tagCloud-container pan mtm'>	\
  			{{#each tag in tags itemController='question'}}	\
    			<li class='tag-container'>	\
      				{{render 'tag' tag}}<small class='muted'>x {{abbreviateNumber tag.questioncount}}</small>	\
    			</li>	\
  			{{else}}	\
    			<div class='row'>	\
      				<div class='col-xs-12 col-sm-12 col-lg-12'>	\
        				<h5 class='muted mtm'>No related tags.</h5>	\
      				</div>	\
    			</div>	\
  			{{/each}}	\
  		</ul>";

  		var _timeTemplate = 
  		"<div class='time-container'>	\
        	<div class='time-date'>	\
          		{{getdate __utcdatecreated}}	\
    		</div>	\
        	<div class='time-details'>	\
          		<div class='time-day'>	\
            		{{getday __utcdatecreated}}	\
          		</div>	\
              	<div class='time-month'>	\
                	{{getmonth __utcdatecreated}} {{getyear __utcdatecreated}}	\
              	</div>	\
        	</div>	\
      	</div>";

      	var _shareTemplate =
      	"<a href='javascript:void(0)' data-original-title='' data-toggle='popover' data-placement='left' data-html='true'	\
      	data-content='<div class=\"share-popup\"><span class=\"pbxs pull-left\">share a link to this {{unbound type}}</span><input type=\"text\" {{bindAttr value='murl'}}><a class=\"close-share pull-right\" style=\"padding:2px 0\">close</a></div>'	\
      	data-trigger='click'>	\
			<i title='Share the link' class='icon-large icon-link'></i>	\
		</a>";

	  	//Entity template
	  	var _entityTemplate = 
	  	"<div {{bindAttr id='entityid'}} {{bindAttr class='istypeanswer:answer:question istypeanswer:hide :row isanswered:isanswered'}}> \
		    <div class='col-xs-12 col-sm-1 col-lg-1'>   \
		    	<div class='row'>	\
				    <div {{bindAttr class='view.questionpage:col-xs-7:col-xs-12 :col-sm-12 :col-lg-12 :prni'}}>	\
		    			<!-- Entity posted by goes here --> \
				        <div class='user-profile'>  \
				            <div class='divPic'>    \
				                <a class='user-img' {{bindAttr href='author.url'}} {{bindAttr title='author.fullname'}}>    \
				                    <img {{bindAttr src='author.smallimgurl'}} {{bindAttr title='author.fullname'}}/>    \
				                </a>    \
				            </div>  \
				            <div class='divUserDetails'>    \
				                <div class='divUser'>   \
				                    <a {{bindAttr href='author.url'}} {{bindAttr title='author.fullname'}}> \
				                        <span class='name'>{{author.fullname}}</span>&nbsp;<span class='spanPosted'>{{postedaction}}</span> \
				                    </a>    \
				                </div>  \
				                <div class='divPts'>{{abbreviateNumber author.reputation}}</div>    \
				            </div>  \
				        </div>  \
			       	</div>	\
			       	<div {{bindAttr class=':col-xs-5 :plni :col-sm-12 :col-lg-12 view.questionpage:show:hide'}}>	\
			       		<div class='vote-panel'>	\
				       		{{#if isLoggedIn}}	\
								<a {{action registerVote true target=view}} {{bindAttr class='hasupvoted'}} href='javascript:void(0)'>	\
									<i class='icon-large icon-thumbs-up'></i>	\
								</a>	\
								<div class='vote-cast'>	\
									{{#if view.isVoteOpen}}	\
										<span class='vote-up-count'>{{abbreviateNumber upvotecount}}</span>	\
										<span class='vote-separator'>/</span>	\
										<span class='vote-down-count'>{{abbreviateNumber downvotecount}}</span>	\
									{{else}}	\
										<a {{action voteDetails target=view}} href='javascript:void(0)' title='View up and down vote count'>	\
	  										<span class='vote-count'>{{abbreviateNumber votecount}}</span>	\
										</a>	\
									{{/if}}	\
								</div>	\
								<a {{action registerVote false target=view}} {{bindAttr class='hasdownvoted'}} href='javascript:void(0)'>	\
									<i class='icon-large icon-thumbs-down'></i>	\
								</a>	\
							{{else}}	\
								<a class='btn btn-success btn-sm' {{bindAttr href='loginurl'}} title='Login to up vote'>	\
									<i class='icon-large icon-thumbs-up'></i>	\
								</a>	\
								<div class='vote-cast'>	\
									<a {{bindAttr href='loginurl'}} title='Login to view up and down vote count'>	\
										<span class='vote-count'>{{abbreviateNumber votecount}}</span>	\
									</a>	\
								</div>	\
								<a class='btn btn-danger btn-sm' {{bindAttr href='loginurl'}} title='Login to down vote'>	\
									<i class='icon-large icon-thumbs-down'></i>	\
								</a>	\
							{{/if}}	\
							<div class='alert-dismiss-container voteError'>	\
							</div>	\
							<div class='progress progress-striped active mtm voteProgress hide'>	\
								<div class='progress-bar'  role='progressbar' aria-valuemin='0' aria-valuemax='100' style='width: 100%'>	\
								</div>	\
							</div>	\
						</div>	\
			       	</div>	\
			    </div>	\
		    </div>	\
		    <div {{bindAttr class=':col-entity-details :col-xs-12 view.questionlist:col-sm-9:col-sm-11 view.questionlist:col-lg-9:col-lg-11'}}>	\
		    	<div {{bindAttr class='istypeanswer:callout :odd iscorrectanswer:answer-accepted'}}>	\
          			<div {{bindAttr class='istypeanswer:arrow-container:hide'}}>	\
	            		<div class='arrow-left'></div>	\
	            		<div class='arrow-up'></div>	\
          			</div>	\
			        <div class='row'>	\
			            <div class='col-xs-12 col-sm-12 col-lg-12'>	\
			            	<div {{bindAttr class=':pull-left :width-100p view.questionpage:border-bottom view.questionpage:pbm istypeanswer:pbsi istypeanswer:answer-accept-container'}}>	\
				            	<div {{bindAttr class=':pull-left istypeanswer:width-90p:width-100p'}}>	\
					                <div class='entity-info-container'>	\
					                	<!-- Question bookmark goes here --> \
					                    <div {{ bindAttr class='view.questionpage:question-bookmark:hide istypeanswer:hide'}}>	\
					                    {{#if isLoggedIn}}	\
					                        <a href='javascript:void(0)' {{action toggleBookmark target=view}}> \
					                        	<i {{bindAttr class='isbookmarked:icon-star:icon-star-empty'}}></i>	\
					                        </a>	\
					                        <div class='alert-dismiss-container action-error position-absolute action-toggle-bookmark-error font9'>	\
											</div>	\
										{{else}}	\
											<a {{bindAttr href='loginurl'}} title='Login to bookmark this question'>	\
												<i {{bindAttr class='isbookmarked:icon-star:icon-star-empty'}}></i>	\
											</a>	\
										{{/if}}	\
					                    </div>	\
					                    <div class='entity-info'>	\
					                    	<!-- Entity title goes here --> \
					                        <div class='entity-title'>	\
					                            <div class='pbxs'>	\
					                                <h1>	\
					                                    <a {{bindAttr title='text'}} {{bindAttr href='url'}} {{bindAttr class='view.questionpage:font120'}}>	\
					                                        {{#if view.entitylist}}	\
					                                        	<span class='abbreviation'>	\
					                                            {{#if isquestion}}	\
					                                                Q: 	\
					                                            {{else}}	\
					                                                A: 	\
					                                            {{/if}}	\
					                                            </span>	\
					                                        {{/if}}	\
					                                        {{title}}	\
					                                    </a>	\
					                                </h1>	\
					                            </div>	\
					                        </div>	\
					                        <!-- Entity posted by goes here (for mobile users) --> \
					                        <div class='divUser'>	\
					                            <span class='spanPosted muted font9'>{{postedaction}} by</span>	\
					                            <a {{bindAttr href='author.url'}} {{bindAttr title='author.fullname'}}>	\
					                                <span class='name'>{{author.fullname}}</span>	\
					                            </a>	\
					                        </div>	\
					                        <div class='separator'></div>	\
					                        <!-- Question stats goes here --> \
					                        <div class='entity-details'>	\
					                            <span {{bindAttr class=':mrs :nowrap view.hidevotecount:hide'}}>{{votecount}} {{pluralize votecount s='vote'}}</span>	\
					                            <span {{bindAttr class=':mrs :nowrap view.hideviewcount:hide'}}><span {{bindAttr class='view.questionpage:hide'}}>&#8226;</span> {{answercount}} {{pluralize answercount s='answer'}} </span>	\
					                            <span {{bindAttr class=':mrs :nowrap view.hideanswercount:hide'}}>&#8226; {{viewcount}} {{pluralize viewcount s='view'}}</span>	\
					                            <span {{bindAttr class=':mrs :nowrap view.hidebookmarkcount:hide'}}>&#8226; {{bookmarkcount}} {{pluralize bookmarkcount s='bookmark'}}</span>	\
					                        </div>	\
					                        <!-- Question tags goes here --> \
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
				                {{#if ownsparent}}	\
				                <div {{bindAttr class=':accept-answer-container istypeanswer:width-10p:hide :text-right :pull-right :mbxs :position-relative'}}> \
				                	<div class='progress progress-striped active mts hide action-toggle-accept-progress position-absolute width-100p'>	\
										<div class='progress-bar'  role='progressbar' aria-valuemin='0' aria-valuemax='100' style='width: 100%'>	\
										</div>	\
									</div>	\
									<div class='alert-dismiss-container action-error position-absolute action-toggle-accept-error font9'>	\
									</div>	\
		                        	<div {{bindAttr class=':btn-group :answer-accept iscorrectanswer:iscorrectanswer'}}>	\
		                        		<a class='action-toggle-accept' data-toggle='dropdown'>	\
  											<i class='pls icon-ok mrs'></i>	<i class='icon-caret-down prs'></i>	\
  										</a>	\
  										<ul class='dropdown-menu' role='menu'>	\
  											{{#if iscorrectanswer}}	\
  												<li>	\
  													<a href='javascript:void(0)' {{action toggleAnswer false target=view}}>	\
  														<i class='icon-remove'></i> <span class='font9'>Unaccept</span>	\
													</a>	\
												</li>	\
											{{else}}	\
										    	<li>	\
										    		<a href='javascript:void(0)' {{action  toggleAnswer true target=view}}>	\
										    			<i class='icon-ok'></i> <span class='font9'>Accept</span>	\
									    			</a>	\
								    			</li>	\
										    {{/if}} \
									  	</ul>	\
									</div>	\
		                        </div>	\
		                        {{/if}}	\
	                        </div>	\
			            </div>	\
			        </div>	\
			        <!-- Entity description or text -->	\
			        <div class='row'>	\
			            <div class='col-xs-12 col-sm-12 col-lg-12 font9'>	\
			                <div {{bindAttr class='view.questionpage:hide :pbm'}}>	\
			                    {{text}}... <a {{bindAttr href='url' title='Click to read more'}}>more</a>	\
			                </div>	\
			                <div {{bindAttr class='view.questionpage:ptm:hide :pbm :entity-description'}}>	\
			                	{{markdown text}}	\
			                </div>	\
			            </div>	\
			        </div>	\
			        <!-- Entity comments goes here --> \
					<div {{bindAttr class=':comment-container :ptm view.questionpage:show:hide'}}>	\
						{{#each comment in comments}}	\
							<div {{bindAttr id='comment.id'}} {{bindAttr class='comment.ishidden:hide :comment'}}>	\
								<div class='row'>	\
									<div class='col-lg-12 position-relative'>	\
										<span class='comment-text'>{{markdown comment.text}}</span> - 	\
										<a {{bindAttr href='comment.author.url'}} {{bindAttr title='comment.author.fullname'}} class='commentor'>	\
											{{comment.author.fullname}}	\
										</a>	\
										<span class='divTime'>{{sincetime comment.__utcdatecreated}}</span>	\
										{{#if comment.isowner}}	\
											<a {{action 'deleteComment' comment target=view}} title='Delete the comment' href='javascript:void(0)' class='action icon-remove-sign pas mlm'></a>	\
										{{/if}}	\
										<div class='alert-dismiss-container action-delete-comment-error'>	\
										</div>	\
									</div>	\
								</div>	\
							</div>	\
						{{/each}}	\
						<div class='mtm mbm'>	\
							<a href='javascript:void(0)' title='Show more Comments' class='showMore hide' {{action showAllComment target=view}}>	\
								<i class='icon-ellipsis-horizontal'></i> \
							</a>	\
						</div>	\
					</div>	\
					<!-- Entity action bar goes here -->	\
					<div {{bindAttr class=':row :entity-action-container view.questionpage:show:hide'}}>	\
						<div class='col-lg-12'>	\
							<div class='border-top-dashed'>	\
								<div class='row'>	\
									<div class='col-xs-12 col-sm-12 col-lg-12'>	\
										<div class='progress progress-striped active mts hide actionProgress'>	\
											<div class='progress-bar'  role='progressbar' aria-valuemin='0' aria-valuemax='100' style='width: 100%'>	\
											</div>	\
										</div>	\
									</div>	\
									{{#if view.isCommenting}}	\
										<div class='col-xs-12 col-sm-12 col-lg-12 mbs'>	\
											{{view Ember.TextArea placeholder='If you want more information or want to provide any suggestion, use comments.' valueBinding='view.newComment'}}	\
										</div>	\
										<div class='col-xs-12 col-sm-12 col-lg-12'>	\
											<div class='pull-left'>	\
												<button class='btn btn-xs btn-primary mrs' href='javascript:void(0)' {{action saveComment target=view}}>Post</button>	\
												<a {{action commentAction target=view}} class='comment-cancel font9' href='javascript:void()'>Cancel</a>	\
											</div>	\
										</div>	\
										<div class='alert-dismiss-container action-save-comment-error position-absolute width-100p'>	\
										</div>	\
									{{else}}	\
										<div class='col-lg-12'>	\
											<div class='entity-action'>	\
												<div class='comment-add pull-left'>	\
												{{#if isLoggedIn}}	\
													<a {{action commentAction target=view}} class='comment-add-action' href='javascript:void()'></a>	\
												{{else}}	\
													<a {{bindAttr href='loginurl'}} class='comment-add-action' title='Login to add Comment'></a>	\
												{{/if}}	\
												</div>	\
												<div class='entity-action-menu pull-right'>	\
													<div class='btn-group ptxs share'>	\
														<a href='javascript:void(0)' {{action showShare target=view}}>	\
						      								<i title='Share the link' class='icon-large icon-link'></i>	\
														</a>	\
													</div> \
													<div {{bindAttr class=':btn-group isowner:owner:hide'}}>	\
													    <a type='button' class='' data-toggle='dropdown'>	\
													    	<i class='icon-large icon-sort-down pls prs'></i>	\
													    </a>	\
													    <ul class='dropdown-menu'>	\
													    	{{#if isowner}}	\
													      		<li>	\
													      			<a {{bindAttr href='editUrl'}}>	\
													      				<i class='icon-edit mrm'></i><span class='font9'>Edit</span>	\
												      				</a>	\
											      				</li>	\
													      		<li>	\
													      			<a href='javascript:void(0)' {{action deleteEntity target=view}}>	\
													      				<i class='icon-remove mrm'></i><span class='font9'> Delete</span>	\
												      				</a>	\
											      				</li>	\
												      		{{/if}}	\
													    </ul>	\
												  	</div>	\
												</div>	\
											</div>	\
										</div>	\
									{{/if}}	\
									<div class='alert-dismiss-container action-delete-entity-error'>	\
									</div>	\
								</div>	\
							</div>	\
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

		var _answerLoaderTemplate = 
		"<a {{bindAttr id='id'}}></a>	\
	    <div {{bindAttr id='loaderid'}} class='progress progress-striped active mtl mbl'>	\
		    <div class='progress-bar'  role='progressbar' aria-valuemin='0' aria-valuemax='100' style='width: 100%'>	\
		    </div>	\
	    </div>";

	    this.errorTemplate = _error;
	  	this.pagingTemplate = _pagingTemplate;
	  	this.tagTemplate = _tagTemplate;
	  	this.relatedtagsTemplate = _relatedtagsTemplate;
	  	this.timeTemplate = _timeTemplate;
	  	this.shareTemplate = _shareTemplate;
  		this.entityTemplate = _entityTemplate;
  		this.answerLoaderTemplate = _answerLoaderTemplate;
	})();
}).call(this);

Ember.TEMPLATES.error = Ember.Handlebars.compile(templates.errorTemplate);
Ember.TEMPLATES.paging = Ember.Handlebars.compile(templates.pagingTemplate);
Ember.TEMPLATES.tag = Ember.Handlebars.compile(templates.tagTemplate);
Ember.TEMPLATES.relatedtags = Ember.Handlebars.compile(templates.relatedtagsTemplate);
Ember.TEMPLATES.time = Ember.Handlebars.compile(templates.timeTemplate);
Ember.TEMPLATES.share = Ember.Handlebars.compile(templates.shareTemplate);
Ember.TEMPLATES.entity = Ember.Handlebars.compile(templates.entityTemplate);
Ember.TEMPLATES.answer = Ember.Handlebars.compile(templates.entityTemplate);
Ember.TEMPLATES.answerloader = Ember.Handlebars.compile(templates.answerLoaderTemplate);