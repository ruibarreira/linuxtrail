/*!--------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
define("vs/css!vs/workbench/parts/search/browser/media/searchviewlet",["vs/css!vs/workbench/parts/search/browser/searchViewlet"],{});var __extends=this&&this.__extends||function(e,t){function n(){this.constructor=e}for(var i in t)t.hasOwnProperty(i)&&(e[i]=t[i]);e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)},__decorate=this&&this.__decorate||function(e,t,n,i){if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)return Reflect.decorate(e,t,n,i);switch(arguments.length){case 2:return e.reduceRight(function(e,t){return t&&t(e)||e},t);case 3:return e.reduceRight(function(e,i){return void(i&&i(t,n))},void 0);case 4:return e.reduceRight(function(e,i){return i&&i(t,n,e)||e},i)}},__param=this&&this.__param||function(e,t){return function(n,i){t(n,i,e)}};define("vs/workbench/parts/search/common/searchModel",["require","exports","vs/base/common/async","vs/base/common/strings","vs/base/common/paths","vs/base/common/lifecycle","vs/base/common/collections","vs/base/common/eventEmitter","vs/editor/common/editorCommon","vs/editor/common/core/range","vs/editor/common/services/modelService"],function(e,t,n,i,o,s,r,a,c,l,u){var h=function(){function e(e,t,n,i,o){this._parent=e,this._lineText=t,this._id=e.id()+">"+n+">"+i,this._range=new l.Range(1+n,1+i,1+n,1+i+o)}return e.prototype.id=function(){return this._id},e.prototype.parent=function(){return this._parent},e.prototype.text=function(){return this._lineText},e.prototype.range=function(){return this._range},e.prototype.preview=function(){var e=this._lineText.substring(0,this._range.startColumn-1),t=this._lineText.substring(this._range.startColumn-1,this._range.endColumn-1),n=this._lineText.substring(this._range.endColumn-1,Math.min(this._range.endColumn+150,this._lineText.length));return e=i.lcut(e,26),{before:e,inside:t,after:n}},e}();t.Match=h;var p=function(e){function t(t){e.call(this,t,null,Date.now(),Date.now(),Date.now())}return __extends(t,e),t}(h);t.EmptyMatch=p;var d=function(){function e(e,t){this._resource=t,this._parent=e,this._matches=Object.create(null)}return e.prototype.dispose=function(){},e.prototype.id=function(){return this.resource().toString()},e.prototype.parent=function(){return this._parent},e.prototype.add=function(e){this._matches[e.id()]=e},e.prototype.remove=function(e){delete this._matches[e.id()]},e.prototype.matches=function(){return r.values(this._matches)},e.prototype.count=function(){var e=0;for(var t in this._matches)this._matches[t]instanceof p||(e+=1);return e},e.prototype.resource=function(){return this._resource},e.prototype.name=function(){return o.basename(this.resource().fsPath)},e}();t.FileMatch=d;var f=function(e){function t(t,i,o,s,r){var a=this;e.call(this,t,i),this._modelDecorations=[],this._unbind=[],this._query=o,this._model=s,this._diskFileMatch=r,this._updateScheduler=new n.RunOnceScheduler(this._updateMatches.bind(this),250),this._unbind.push(this._model.addListener(c.EventType.ModelContentChanged,function(e){return a._updateScheduler.schedule()})),this._updateMatches()}return __extends(t,e),t.prototype.dispose=function(){this._unbind=s.cAll(this._unbind),this._isTextModelDisposed()||this._model.deltaDecorations(this._modelDecorations,[])},t.prototype._updateMatches=function(){var e=this;if(!this._isTextModelDisposed()){this._matches=Object.create(null);var t=this._model.findMatches(this._query.pattern,this._model.getFullModelRange(),this._query.isRegExp,this._query.isCaseSensitive,this._query.isWordMatch);0===t.length?this.add(new p(this)):t.forEach(function(t){return e.add(new h(e,e._model.getLineContent(t.startLineNumber),t.startLineNumber-1,t.startColumn-1,t.endColumn-t.startColumn))}),this.parent().emit("changed",this),this.updateHighlights()}},t.prototype.updateHighlights=function(){this._model.isDisposed()||(this.parent()._showHighlights?this._modelDecorations=this._model.deltaDecorations(this._modelDecorations,this.matches().filter(function(e){return!(e instanceof p)}).map(function(e){return{range:e.range(),options:t.DecorationOption}})):this._modelDecorations=this._model.deltaDecorations(this._modelDecorations,[]))},t.prototype._isTextModelDisposed=function(){return!this._model||this._model.isDisposed()},t.DecorationOption={stickiness:c.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,className:"findMatch",overviewRuler:{color:"rgba(246, 185, 77, 0.7)",darkColor:"rgba(246, 185, 77, 0.7)",position:c.OverviewRulerLane.Center}},t}(d);t.LiveFileMatch=f;var v=function(e){function t(t,n){e.call(this),this._disposables=[],this._matches=Object.create(null),this._modelService=n,this._query=t,this._query&&(this._modelService.onModelAdded.add(this._onModelAdded,this,this._disposables),this._modelService.onModelRemoved.add(this._onModelRemoved,this,this._disposables))}return __extends(t,e),t.prototype._onModelAdded=function(e){var t=e.getAssociatedResource(),n=this._matches[t.toString()];if(n){var i=new f(this,t,this._query,e,n);i.updateHighlights(),this._matches[t.toString()]=i,this.emit("changed",this)}},t.prototype._onModelRemoved=function(e){var t=this,n=e.getAssociatedResource(),i=this._matches[n.toString()];i instanceof f&&this.deferredEmit(function(){t.remove(i),t._matches[n.toString()]=i._diskFileMatch})},t.prototype.append=function(e){var t=this;e.forEach(function(e){var n=t._getOrAdd(e);n instanceof f&&(n=n._diskFileMatch),e.lineMatches.forEach(function(e){e.offsetAndLengths.forEach(function(t){var i=new h(n,e.preview,e.lineNumber,t[0],t[1]);n.add(i)})})})},t.prototype._getOrAdd=function(e){var t=this;return r.lookupOrInsert(this._matches,e.resource.toString(),function(){var n=t._modelService.getModel(e.resource),i=new d(t,e.resource);return n&&t._query&&(i=new f(t,e.resource,t._query,n,i)),i})},t.prototype.remove=function(e){delete this._matches[e.resource().toString()],e.dispose(),this.emit("changed",this)},t.prototype.matches=function(){return r.values(this._matches)},t.prototype.isEmpty=function(){return 0===this.fileCount()},t.prototype.fileCount=function(){return Object.keys(this._matches).length},t.prototype.count=function(){return this.matches().reduce(function(e,t){return e+t.count()},0)},t.prototype.toggleHighlights=function(e){if(this._showHighlights!==e){this._showHighlights=e;for(var t in this._matches){var n=this._matches[t];n instanceof f&&n.updateHighlights()}}},t.prototype.dispose=function(){this._disposables=s.disposeAll(this._disposables),s.disposeAll(this.matches()),e.prototype.dispose.call(this)},t=__decorate([__param(1,u.IModelService)],t)}(a.EventEmitter);t.SearchResult=v});var __decorate=this&&this.__decorate||function(e,t,n,i){if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)return Reflect.decorate(e,t,n,i);switch(arguments.length){case 2:return e.reduceRight(function(e,t){return t&&t(e)||e},t);case 3:return e.reduceRight(function(e,i){return void(i&&i(t,n))},void 0);case 4:return e.reduceRight(function(e,i){return i&&i(t,n,e)||e},i)}},__param=this&&this.__param||function(e,t){return function(n,i){t(n,i,e)}};define("vs/workbench/parts/search/common/searchQuery",["require","exports","vs/base/common/objects","vs/platform/search/common/search","vs/platform/configuration/common/configuration"],function(e,t,n,i,o){function s(e){var t=e&&e.files&&e.files.exclude,i=e&&e.search&&e.search.exclude;if(!t&&!i)return null;if(!t||!i)return t||i;var o=Object.create(null);return o=n.mixin(o,t),o=n.mixin(o,i,!0)}t.getExcludes=s;var r=function(){function e(e){this.configurationService=e}return e.prototype.text=function(e,t){return this.query(i.QueryType.Text,e,t)},e.prototype.file=function(e){return this.query(i.QueryType.File,null,e)},e.prototype.query=function(e,t,i){return void 0===i&&(i={}),this.configurationService.loadConfiguration().then(function(o){var r=s(o);return i.excludePattern?n.mixin(i.excludePattern,r,!1):i.excludePattern=r,{type:e,rootResources:i.rootResources,filePatterns:i.filePatterns||[],excludePattern:i.excludePattern,includePattern:i.includePattern,maxResults:i.maxResults,fileEncoding:i.fileEncoding,contentPattern:t}})},e=__decorate([__param(0,o.IConfigurationService)],e)}();t.QueryBuilder=r});var __extends=this&&this.__extends||function(e,t){function n(){this.constructor=e}for(var i in t)t.hasOwnProperty(i)&&(e[i]=t[i]);e.prototype=null===t?Object.create(t):(n.prototype=t.prototype,new n)},__decorate=this&&this.__decorate||function(e,t,n,i){if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)return Reflect.decorate(e,t,n,i);switch(arguments.length){case 2:return e.reduceRight(function(e,t){return t&&t(e)||e},t);case 3:return e.reduceRight(function(e,i){return void(i&&i(t,n))},void 0);case 4:return e.reduceRight(function(e,i){return i&&i(t,n,e)||e},i)}},__param=this&&this.__param||function(e,t){return function(n,i){t(n,i,e)}};define("vs/workbench/parts/search/browser/searchViewlet",["require","exports","vs/base/common/winjs.base","vs/nls!vs/workbench/parts/search/browser/searchViewlet","vs/editor/common/editorCommon","vs/base/common/lifecycle","vs/base/common/errors","vs/base/common/assert","vs/base/common/glob","vs/base/common/types","vs/base/common/strings","vs/base/browser/dom","vs/base/common/actions","vs/base/browser/keyboardEvent","vs/base/common/timer","vs/base/browser/builder","vs/base/browser/ui/filelabel/fileLabel","vs/base/browser/ui/findinput/findInput","vs/base/browser/ui/leftRightWidget/leftRightWidget","vs/base/browser/ui/countBadge/countBadge","vs/base/parts/tree/browser/treeImpl","vs/base/parts/tree/browser/treeDefaults","vs/base/parts/tree/browser/actionsRenderer","vs/workbench/browser/actionBarRegistry","vs/workbench/common/memento","vs/workbench/browser/actions/openSettings","vs/workbench/browser/events","vs/workbench/parts/files/common/files","vs/platform/files/common/files","vs/workbench/browser/viewlet","vs/workbench/parts/search/common/searchModel","vs/workbench/parts/search/common/searchQuery","vs/base/browser/ui/checkbox/checkbox","vs/workbench/parts/search/browser/search.contribution","vs/base/browser/ui/inputbox/inputBox","vs/workbench/services/editor/common/editorService","vs/workbench/services/viewlet/common/viewletService","vs/editor/common/core/range","vs/platform/storage/common/storage","vs/platform/configuration/common/configuration","vs/platform/contextview/browser/contextView","vs/platform/event/common/event","vs/platform/instantiation/common/instantiation","vs/platform/message/common/message","vs/platform/search/common/search","vs/platform/progress/common/progress","vs/platform/workspace/common/workspace","vs/platform/selection/common/selection","vs/platform/keybinding/common/keybindingService","vs/platform/telemetry/common/telemetry","vs/base/common/keyCodes","vs/css!./media/searchviewlet"],function(e,t,n,i,o,s,r,a,c,l,u,h,p,d,f,v,m,g,y,_,w,b,S,x,E,C,R,I,M,P,T,A,O,k,F,q,D,N,L,G,W,V,H,z,U,B,K,j,Q,$,Y){var X=k.VIEWLET_ID,J=function(e){function t(t,n){e.call(this,"workbench.search.action.findInFolder",i.localize(0,null)),this.viewletService=n,this.resource=t}return __extends(t,e),t.prototype.run=function(e){var t=this;return this.viewletService.openViewlet(X,!0).then(function(e){e.searchInFolder(t.resource)})},t=__decorate([__param(1,D.IViewletService)],t)}(p.Action);t.FindInFolderAction=J;var Z=function(){function e(){}return e.prototype.getId=function(e,t){return t instanceof T.FileMatch?t.id():t instanceof T.Match?t.id():t instanceof T.SearchResult?"root":void a.ok(!1)},e.prototype.getChildren=function(e,t){var i=[];return t instanceof T.FileMatch?i=t.matches():t instanceof T.SearchResult&&(i=t.matches()),n.Promise.as(i)},e.prototype.hasChildren=function(e,t){return t instanceof T.FileMatch||t instanceof T.SearchResult},e.prototype.getParent=function(e,t){var i=null;return t instanceof T.Match?i=t.parent():t instanceof T.FileMatch&&(i=t.parent()),n.Promise.as(i)},e}();t.SearchDataSource=Z;var ee=function(){function e(){}return e.prototype.compare=function(e,t,n){return t instanceof T.FileMatch&&n instanceof T.FileMatch?u.localeCompare(t.resource().fsPath,n.resource().fsPath)||u.localeCompare(t.name(),n.name()):t instanceof T.Match&&n instanceof T.Match?N.Range.compareRangesUsingStarts(t.range(),n.range()):void 0},e}();t.SearchSorter=ee;var te=function(e){function t(){var t=this;e.call(this,{clickBehavior:b.ClickBehavior.ON_MOUSE_DOWN}),this.downKeyBindingDispatcher.set(Y.CommonKeybindings.DELETE,function(e,n){t.onDelete(e,n)})}return __extends(t,e),t.prototype.onDelete=function(e,t){for(var n=!1,i=e.getSelection(),o=0;o<i.length;o++){var s=i[o];s instanceof T.FileMatch&&(new oe(e,s).run().done(null,r.onUnexpectedError),n=!0)}return n},t}(b.DefaultController),ne=function(){function e(){}return e.prototype.isVisible=function(e,t){return!(t instanceof T.FileMatch)||t.matches().length>0},e}(),ie=function(e){function t(){e.apply(this,arguments)}return __extends(t,e),t.prototype.hasActions=function(t,n){return n instanceof T.FileMatch||e.prototype.hasActions.call(this,t,n)},t.prototype.getActions=function(t,n){return e.prototype.getActions.call(this,t,n).then(function(e){return n instanceof T.FileMatch&&e.unshift(new oe(t,n)),e})},t}(x.ContributableActionProvider),oe=function(e){function t(t,n){e.call(this,"remove",i.localize(1,null),"action-remove"),this._viewer=t,this._fileMatch=n}return __extends(t,e),t.prototype.run=function(){var e=this._fileMatch.parent();return e.remove(this._fileMatch),this._viewer.refresh(e)},t}(p.Action),se=function(e){function t(t,n){e.call(this,{actionProvider:new ie,actionRunner:t}),this._contextService=n}return __extends(t,e),t.prototype.getContentHeight=function(e,t){return 24},t.prototype.renderContents=function(e,t,n,o){var s=this;if(t instanceof T.FileMatch){var r,a,c,l=t,p=v.$(".filematch");return r=function(e){return new m.FileLabel(e,l.resource(),s._contextService),null},a=function(e){var t=l.count();return new _.CountBadge(e,t,t>1?i.localize(2,null,t):i.localize(3,null,t))},c=new y.LeftRightWidget(p,r,a),p.appendTo(n),c.dispose.bind(c)}if(t instanceof T.EmptyMatch)h.addClass(n,"linematch"),v.$("a.plain.label").innerHtml(i.localize(4,null)).appendTo(n);else if(t instanceof T.Match){h.addClass(n,"linematch");var d=[],f=t.preview();d.push("<span>"),d.push(u.escape(f.before)),d.push('</span><span class="findInFileMatch">'),d.push(u.escape(f.inside)),d.push("</span><span>"),d.push(u.escape(f.after)),d.push("</span>"),v.$("a.plain").innerHtml(d.join(u.empty)).appendTo(n)}return null},t=__decorate([__param(1,K.IWorkspaceContextService)],t)}(S.ActionsRenderer),re=function(e){function t(t){e.call(this,"refresh"),this.label=i.localize(5,null),this.enabled=!1,this["class"]="search-action refresh",this.viewlet=t}return __extends(t,e),t.prototype.run=function(){return this.viewlet.onQueryChanged(!0),n.Promise.as(null)},t}(p.Action);t.RefreshAction=re;var ae=function(e){function t(t){e.call(this,"selectOrRemove"),this.label=i.localize(6,null),this.enabled=!1,this.selectMode=!0,this.viewlet=t}return __extends(t,e),t.prototype.run=function(){var e;return e=this.selectMode?this.runAsSelect():this.runAsRemove(),this.selectMode=!this.selectMode,this.label=this.selectMode?i.localize(7,null):i.localize(8,null),e},t.prototype.runAsSelect=function(){return this.viewlet.getResults().addClass("select"),n.Promise.as(null)},t.prototype.runAsRemove=function(){var e=[],t=this.viewlet.getControl();return t.getInput().matches().forEach(function(t){t.matches().filter(function(e){return e.$checked}).forEach(function(t){t.parent().remove(t),e.push(t.parent())})}),this.viewlet.getResults().removeClass("select"),e.length>0?t.refreshAll(e).then(function(){return t.refresh()}):n.Promise.as(null)},t}(p.Action);t.SelectOrRemoveAction=ae;var ce=function(e){function t(t){e.call(this,"collapseAll"),this.label=i.localize(9,null),this.enabled=!1,this["class"]="search-action collapse",this.viewlet=t}return __extends(t,e),t.prototype.run=function(){return this.viewlet.getControl()?this.viewlet.getControl().collapseAll():n.Promise.as(null)},t}(p.Action);t.CollapseAllAction=ce;var le=function(e){function t(t){e.call(this,"clearSearchResults"),this.label=i.localize(10,null),this.enabled=!1,this["class"]="search-action clear-search-results",this.viewlet=t}return __extends(t,e),t.prototype.run=function(){return this.viewlet.clearSearchResults(),n.Promise.as(null)},t}(p.Action);t.ClearSearchResultsAction=le;var ue=function(e){function t(t){e.call(this,"configureGlobalExclusionsAction"),this.label=i.localize(11,null),this.enabled=!0,this["class"]="search-configure-exclusions",this.instantiationService=t}return __extends(t,e),t.prototype.run=function(){var e=this.instantiationService.createInstance(C.OpenGlobalSettingsAction,C.OpenGlobalSettingsAction.ID,C.OpenGlobalSettingsAction.LABEL);return e.run().done(function(){return e.dispose()},r.onUnexpectedError),n.Promise.as(null)},t=__decorate([__param(0,H.IInstantiationService)],t)}(p.Action),he=function(){function e(e,t,n){void 0===n&&(n=Object.create(null)),this.contextViewProvider=t,this.onOptionChange=null,this.width=n.width||100,this.placeholder=n.placeholder||"",this.label=n.label||i.localize(12,null),this.listenersToRemove=[],this.pattern=null,this.domNode=null,this.inputNode=null,this.inputBox=null,this.buildDomNode(),Boolean(e)&&e.appendChild(this.domNode)}return e.prototype.destroy=function(){this.pattern.destroy(),this.listenersToRemove.forEach(function(e){e()}),this.listenersToRemove=[]},e.prototype.on=function(t,n){switch(t){case"keydown":case"keyup":v.$(this.inputBox.inputElement).on(t,n);break;case e.OPTION_CHANGE:this.onOptionChange=n}return this},e.prototype.setWidth=function(e){this.width=e,this.domNode.style.width=this.width+"px",this.contextViewProvider.layout(),this.setInputWidth()},e.prototype.getValue=function(){return this.inputBox.value},e.prototype.setValue=function(e){this.inputBox.value!==e&&(this.inputBox.value=e)},e.prototype.getGlob=function(){var e=this.getValue(),t=this.isGlobPattern();if(e){var n,i=Object.create(null);return n=t?c.splitGlobAware(e,",").map(function(e){return e.trim()}).filter(function(e){return!!e.length}):e.split(",").map(function(e){return u.trim(e.trim(),"/")}).filter(function(e){return!!e.length}).map(function(e){return"."===e[0]&&(e="*"+e),u.format("{{0}/**,**/{1}}",e,e)}),n.reduce(function(e,t){return i[t]=!0,i},i)}},e.prototype.select=function(){this.inputBox.select()},e.prototype.focus=function(){this.inputBox.focus()},e.prototype.isGlobPattern=function(){return this.pattern.isChecked},e.prototype.setIsGlobPattern=function(e){this.pattern.setChecked(e),this.setInputWidth()},e.prototype.setInputWidth=function(){var e=this.width-this.pattern.width();this.inputBox.width=e},e.prototype.buildDomNode=function(){var e=this;this.domNode=document.createElement("div"),this.domNode.style.width=this.width+"px",v.$(this.domNode).addClass("monaco-findInput"),this.inputBox=new F.InputBox(this.domNode,this.contextViewProvider,{placeholder:this.placeholder||"",ariaLabel:this.label||"",validationOptions:{validation:null,showMessage:!0}}),this.pattern=new O.Checkbox("pattern",i.localize(13,null),!1,function(){e.onOptionChange(null),e.inputBox.focus(),e.setInputWidth(),e.isGlobPattern()?e.showGlobHelp():e.inputBox.hideMessage()}),v.$(this.pattern.domNode).on("mouseover",function(){e.isGlobPattern()&&e.showGlobHelp()}),v.$(this.pattern.domNode).on(["mouseleave","mouseout"],function(){e.inputBox.hideMessage()}),this.setInputWidth();var t=document.createElement("div");t.className="controls",t.appendChild(this.pattern.domNode),this.domNode.appendChild(t)},e.prototype.showGlobHelp=function(){this.inputBox.showMessage({type:F.MessageType.INFO,formatContent:!0,content:i.localize(14,null)},!0)},e.OPTION_CHANGE="optionChange",e}(),pe=function(e){function t(t,n,i,o,s,r,a,c,l,u,h,p,d){var f=this;e.call(this,X,t),this.eventService=n,this.editorService=i,this.progressService=o,this.messageService=s,this.storageService=r,this.contextViewService=a,this.instantiationService=c,this.configurationService=l,this.searchService=h,this.textFileService=p,this.contextService=u,this._viewletVisible=d.createKey("searchViewletVisible",!0),this.callOnModelChange=[],this.queryBuilder=this.instantiationService.createInstance(A.QueryBuilder),this.viewletSettings=this.getMemento(r,E.Scope.WORKSPACE),this.toUnbind.push(this.eventService.addListener(M.EventType.FILE_CHANGES,function(e){return f.onFilesChanged(e)})),this.toUnbind.push(this.eventService.addListener(R.EventType.UNTITLED_FILE_DELETED,function(e){return f.onUntitledFileDeleted(e)})),this.toUnbind.push(this.configurationService.addListener(G.ConfigurationServiceEventTypes.UPDATED,function(e){return f.onConfigurationUpdated(e.config)}))}return __extends(t,e),t.prototype.onConfigurationUpdated=function(e){this.updateGlobalPatternExclusions(e)},t.prototype.getResults=function(){return this.results},t.prototype.create=function(t){var o=this;e.prototype.create.call(this,t);var s,a=this.viewletSettings["query.filePatterns"]||"",c=this.viewletSettings["query.folderExclusions"]||"",l=this.viewletSettings["query.exclusionsUsePattern"],p=this.viewletSettings["query.includesUsePattern"],f=this.viewletSettings["query.folderIncludes"]||"",m=this.viewletSettings["query.contentPattern"]||"",y=this.viewletSettings["query.regex"]===!0,_=this.viewletSettings["query.wholeWords"]===!0,b=this.viewletSettings["query.caseSensitive"]===!0;this.domNode=t.div({"class":"search-viewlet"},function(e){s=e});var S=function(e){var t=new d.StandardKeyboardEvent(e);t.keyCode===Y.KeyCode.Enter?o.onQueryChanged(!0):t.keyCode===Y.KeyCode.Escape&&(o.findInput.focus(),o.findInput.select(),o.currentRequest&&(o.currentRequest.cancel(),o.currentRequest=null))};this.queryBox=s.div({"class":"query-box"},function(e){var t={label:i.localize(15,null),validation:function(e){if(0===e.length)return null;if(!o.findInput.getRegex())return null;var t;try{t=new RegExp(e)}catch(n){return{content:n.message}}return u.regExpLeadsToEndlessLoop(t)?{content:i.localize(16,null)}:void 0}};o.findInput=new g.FindInput(e.getHTMLElement(),o.contextViewService,t).on(h.EventType.KEY_UP,S).on(h.EventType.KEY_DOWN,function(e){var t=new d.StandardKeyboardEvent(e);t.keyCode===Y.KeyCode.DownArrow&&(h.EventHelper.stop(e),o.showsFileTypes()?o.toggleFileTypes(!0):o.selectTreeIfNotSelected(t))}).on(g.FindInput.OPTION_CHANGE,function(e){o.onQueryChanged(!0)}),o.findInput.setValue(m),o.findInput.setRegex(y),o.findInput.setCaseSensitive(b),o.findInput.setWholeWords(_)}).style({position:"relative"}).getHTMLElement(),this.queryDetails=s.div({"class":["query-details","separator"]},function(e){e.div({"class":"more",text:"…"}).on(h.EventType.CLICK,function(e){h.EventHelper.stop(e),o.toggleFileTypes()}),e.div({"class":"file-types"},function(e){var t=i.localize(17,null);e.element("h4",{text:t}),o.inputPatternIncludes=new he(e.getContainer(),o.contextViewService,{label:i.localize(18,null)}),o.inputPatternIncludes.setIsGlobPattern(p),o.inputPatternIncludes.setValue(f),o.inputPatternIncludes.on(h.EventType.KEY_UP,S).on(h.EventType.KEY_DOWN,function(e){var t=new d.StandardKeyboardEvent(e);t.equals(Y.CommonKeybindings.UP_ARROW)?(h.EventHelper.stop(e),o.findInput.focus(),o.findInput.select()):t.equals(Y.CommonKeybindings.DOWN_ARROW)&&(h.EventHelper.stop(e),o.inputPatternExclusions.focus(),o.inputPatternExclusions.select())}).on(g.FindInput.OPTION_CHANGE,function(e){o.onQueryChanged(!1)})}),e.div({"class":"file-types"},function(e){var t=i.localize(19,null);e.element("h4",{text:t}),o.inputPatternExclusions=new he(e.getContainer(),o.contextViewService,{label:i.localize(20,null)}),o.inputPatternExclusions.setIsGlobPattern(l),o.inputPatternExclusions.setValue(c),o.inputPatternExclusions.on(h.EventType.KEY_UP,S).on(h.EventType.KEY_DOWN,function(e){var t=new d.StandardKeyboardEvent(e);t.equals(Y.CommonKeybindings.UP_ARROW)?(h.EventHelper.stop(e),o.inputPatternIncludes.focus(),o.inputPatternIncludes.select()):t.equals(Y.CommonKeybindings.DOWN_ARROW)&&(h.EventHelper.stop(e),o.selectTreeIfNotSelected(t))}).on(g.FindInput.OPTION_CHANGE,function(e){o.onQueryChanged(!1)})}),o.inputPatternGlobalExclusionsContainer=e.div({"class":"file-types global-exclude disabled"},function(e){var t=i.localize(21,null);e.element("h4",{text:t}),o.inputPatternGlobalExclusions=new F.InputBox(e.getContainer(),o.contextViewService,{actions:[o.instantiationService.createInstance(ue)]}),o.inputPatternGlobalExclusions.inputElement.readOnly=!0,v.$(o.inputPatternGlobalExclusions.inputElement).addClass("disabled")}).hide()}).getHTMLElement(),this.messages=s.div({"class":"messages"}).hide().clone(),s.div({"class":"results"},function(e){o.results=e;var t=new Z,n=o.instantiationService.createInstance(se,o.getActionRunner());o.tree=new w.Tree(e.getHTMLElement(),{dataSource:t,renderer:n,sorter:new ee,filter:new ne,controller:new te}),o.toUnbind.push(function(){return n.dispose()}),o.toUnbind.push(o.tree.addListener("selection",function(e){var t,n=e.payload&&"keyboard"===e.payload.origin;t=n?o.tree.getFocus():e.selection[0];var i=e.payload&&e.payload.originalEvent,s=e.payload&&"mouse"===e.payload.origin&&i&&2===i.detail;s&&i.preventDefault();var r=i&&(i.ctrlKey||i.metaKey);o.onFocus(t,!n&&!s,r)}))}),this.actionRegistry={};var x=[new ce(this),new re(this),new le(this),new ae(this)];return x.forEach(function(e){o.actionRegistry[e.id]=e}),(""!==a||""!==c||""!==f)&&this.toggleFileTypes(!0,!0),this.configurationService.loadConfiguration().then(function(e){o.updateGlobalPatternExclusions(e)}).done(null,r.onUnexpectedError),n.Promise.as(null)},t.prototype.updateGlobalPatternExclusions=function(e){if(this.inputPatternGlobalExclusionsContainer){var t=A.getExcludes(e);if(t){var n=Object.getOwnPropertyNames(t).filter(function(e){return t[e]===!0||"string"==typeof t[e].when}).map(function(e){return t[e]===!0?e:i.localize(22,null,e,t[e].when)});if(n.length){var o=n.join(", ");this.inputPatternGlobalExclusions.value=o,this.inputPatternGlobalExclusions.inputElement.title=o,this.inputPatternGlobalExclusionsContainer.show()}else this.inputPatternGlobalExclusionsContainer.hide()}}},t.prototype.setVisible=function(t){var n;if(this._viewletVisible.set(t),t?(n=e.prototype.setVisible.call(this,t),this.tree.onVisible()):(this.tree.onHidden(),n=e.prototype.setVisible.call(this,t)),this.viewModel&&this.viewModel.toggleHighlights(t),t&&!this.editorService.getActiveEditorInput()){var i=this.tree.getFocus();i&&this.onFocus(i,!1,!1)}return n},t.prototype.focus=function(){e.prototype.focus.call(this);var t=this.getSelectionFromEditor();t&&this.findInput.setValue(t),this.findInput.focus(),this.findInput.select()},t.prototype.reLayout=function(){if(!this.isDisposed){this.findInput.setWidth(this.size.width-34),this.inputPatternExclusions.setWidth(this.size.width-42),this.inputPatternIncludes.setWidth(this.size.width-42),this.inputPatternGlobalExclusions.width=this.size.width-42-24;var e=h.getTotalHeight(this.queryBox),t=h.getTotalHeight(this.queryDetails),n=this.size.height-e-t;this.results.style({height:n+"px"}),this.tree.layout(n)}},t.prototype.layout=function(e){var t=this;this.size=e,n.Promise.timeout(10).done(function(){t.reLayout()},r.onUnexpectedError)},t.prototype.getControl=function(){return this.tree},t.prototype.clearSearchResults=function(){this.disposeModel(),this.showEmptyStage(),this.findInput.clear(),this.currentRequest&&(this.currentRequest.cancel(),this.currentRequest=null)},t.prototype.selectTreeIfNotSelected=function(e){if(this.tree.getInput()){this.tree.DOMFocus();var t=this.tree.getSelection();0===t.length&&this.tree.focusNext()}},t.prototype.getSelectionFromEditor=function(){if(!this.editorService.getActiveEditor())return null;var e=this.editorService.getActiveEditor().getControl();if(!e||!l.isFunction(e.getEditorType)||e.getEditorType()!==o.EditorType.ICodeEditor)return null;var t=e.getSelection();if(t&&!t.isEmpty()&&t.startLineNumber===t.endLineNumber){var n=e.getModel().getLineContent(t.startLineNumber);return n=n.substring(t.startColumn-1,t.endColumn-1)}return null},t.prototype.showsFileTypes=function(){return h.hasClass(this.queryDetails,"more")},t.prototype.toggleFileTypes=function(e,t){var n="more";e="undefined"==typeof e?!h.hasClass(this.queryDetails,n):Boolean(e),t=Boolean(t),e?(h.addClass(this.queryDetails,n),this.inputPatternIncludes.focus(),this.inputPatternIncludes.select()):h.removeClass(this.queryDetails,n),!t&&this.size&&this.layout(this.size)},t.prototype.searchInFolder=function(e){this.showsFileTypes()||this.toggleFileTypes(!0,!1);var t=this.contextService.toWorkspaceRelativePath(e);t&&(this.inputPatternIncludes.setIsGlobPattern(!1),this.inputPatternIncludes.setValue(t),this.findInput.focus())},t.prototype.onQueryChanged=function(e){var n=this,i=this.findInput.getRegex(),o=this.findInput.getWholeWords(),s=this.findInput.getCaseSensitive(),a=this.findInput.getValue(),c=this.inputPatternExclusions.getValue().trim(),l=this.inputPatternExclusions.isGlobPattern(),h=this.inputPatternIncludes.getValue().trim(),p=this.inputPatternIncludes.isGlobPattern();if(this.viewletSettings["query.contentPattern"]=a,this.viewletSettings["query.regex"]=i,this.viewletSettings["query.wholeWords"]=o,this.viewletSettings["query.caseSensitive"]=s,this.viewletSettings["query.folderExclusions"]=c,this.viewletSettings["query.exclusionsUsePattern"]=l,this.viewletSettings["query.folderIncludes"]=h,this.viewletSettings["query.includesUsePattern"]=p,e&&(/^\s+|\s$/.test(a)&&(a=u.escapeRegExpCharacters(a),i=!0),0!==a.length)){if(i){var d;try{d=new RegExp(a)}catch(f){return}if(u.regExpLeadsToEndlessLoop(d))return}var v={pattern:a,isRegExp:i,isCaseSensitive:s,isWordMatch:o},m=this.inputPatternExclusions.getGlob(),g=this.inputPatternIncludes.getGlob(),y=this.textFileService.getWorkingFilesModel().getOutOfWorkspaceContextEntries().map(function(e){return e.resource});this.contextService.getWorkspace()&&y.push(this.contextService.getWorkspace().resource);var _={rootResources:y,excludePattern:m,includePattern:g,maxResults:t.MAX_TEXT_RESULTS};this.queryBuilder.text(v,_).then(function(e){return n.onQueryTriggered(e,c,h)},r.onUnexpectedError)}},t.prototype.onQueryTriggered=function(e,t,n){var o=this;this.currentRequest&&(this.currentRequest.cancel(),this.currentRequest=null);var s=this.telemetryService.start("searchResultsFirstRender"),a=this.telemetryService.start("searchResultsFinished"),c=100,l=this.progressService.show(c),u=0;this.loading=!0,this.findInput.clearMessage(),this.disposeModel(),this.showEmptyStage();var p=function(e){if(o.viewModel){var t=o.viewModel.matches();t.forEach(function(n){var i=n.matches().length;10>i||e&&1===t.length&&50>i?o.tree.expand(n).done(null,r.onUnexpectedError):o.tree.collapse(n).done(null,r.onUnexpectedError)})}},d=f.start(f.Topic.WORKBENCH,"Search"),m=!1,g=function(s){d.stop(),m=!0,l.worked(c-u),setTimeout(function(){return l.done()},200),o.viewModel=o.viewModel||o.instantiationService.createInstance(T.SearchResult,e.contentPattern),o.viewModel.append(s.results),o.tree.refresh().then(function(){p(!0)}).done(void 0,r.onUnexpectedError);var f=!o.viewModel.isEmpty();if(o.loading=!1,o.telemetryService.publicLog("searchResultsShown",{count:o.viewModel.count(),fileCount:o.viewModel.fileCount()}),o.actionRegistry.refresh.enabled=!0,o.actionRegistry.selectOrRemove.enabled=f,o.actionRegistry.collapseAll.enabled=f,o.actionRegistry.clearSearchResults.enabled=f,s.limitHit&&o.findInput.showMessage({content:i.localize(23,null),type:F.MessageType.WARNING}),f)o.viewModel.toggleHighlights(!0);else{var g,y=!!t,_=!!n;g=_&&y?i.localize(24,null,n,t):_?i.localize(25,null,n):y?i.localize(26,null,t):i.localize(27,null),o.tree.onHidden(),o.results.hide();var w=o.messages.empty().show().asContainer().div({"class":"message",text:g});_||y?v.$(w).a({"class":["pointer","prominent"],text:i.localize(28,null)}).on(h.EventType.CLICK,function(e){h.EventHelper.stop(e,!1),o.inputPatternExclusions.setValue(""),o.inputPatternIncludes.setValue(""),o.onQueryChanged(!0)}):v.$(w).a({"class":["pointer","prominent"],text:i.localize(29,null)}).on(h.EventType.CLICK,function(e){
h.EventHelper.stop(e,!1);var t=o.instantiationService.createInstance(C.OpenGlobalSettingsAction,C.OpenGlobalSettingsAction.ID,C.OpenGlobalSettingsAction.LABEL);t.run().done(function(){return t.dispose()},r.onUnexpectedError)})}a.stop()},y=function(e){o.loading=!1,m=!0,l.done(),s.stop(),a.stop(),e&&"Canceled"===e.message||o.messageService.show(2,e)},_=0,w=0,b=0,S=[],x=function(t){t.total&&(_=t.total),t.worked&&(w=t.worked),t.resource&&(S.push(t),o.viewModel||(o.viewModel=o.instantiationService.createInstance(T.SearchResult,e.contentPattern),o.tree.setInput(o.viewModel).then(function(){p(!1),o.callOnModelChange.push(o.viewModel.addListener("changed",function(e){return o.tree.refresh(e,!0)}))}).done(null,r.onUnexpectedError)),o.viewModel.append(S),s.stop())},E=setInterval(function(){if(m)return void window.clearInterval(E);var e=!0;if(_>0&&w>0){var t=Math.round(w/_*100);t>u&&(l.worked(t-u),u=t,e=!1)}e&&90>u&&(u++,l.worked(1)),b!==S.length&&(b=S.length,o.tree.refresh().then(function(){p(!1)}).done(null,r.onUnexpectedError))},200);this.currentRequest=this.searchService.search(e),this.currentRequest.then(g,y,x)},t.prototype.showEmptyStage=function(){this.actionRegistry.refresh.enabled=!1,this.actionRegistry.selectOrRemove.enabled=!1,this.actionRegistry.collapseAll.enabled=!1,this.actionRegistry.clearSearchResults.enabled=!1,this.messages.hide(),this.tree.setInput(this.instantiationService.createInstance(T.SearchResult,null)).done(null,r.onUnexpectedError),this.results.show(),this.tree.onVisible()},t.prototype.onFocus=function(e,t,i){return e instanceof T.Match?(this.telemetryService.publicLog("searchResultChosen"),this.editorService.openEditor({resource:e.parent().resource(),options:{preserveFocus:t,selection:e instanceof T.EmptyMatch?void 0:e.range()}},i)):n.Promise.as(!0)},t.prototype.onUntitledFileDeleted=function(e){if(this.viewModel)for(var t=this.viewModel.matches(),n=0,i=t.length;i>n;n++)e.resource.toString()===t[n].resource().toString()&&this.viewModel.remove(t[n])},t.prototype.onFilesChanged=function(e){if(this.viewModel)for(var t=this.viewModel.matches(),n=0,i=t.length;i>n;n++)e.contains(t[n].resource(),M.FileChangeType.DELETED)&&this.viewModel.remove(t[n])},t.prototype.getSelection=function(){return new j.StructuredSelection(this.tree.getSelection())},t.prototype.getActions=function(){return[this.actionRegistry.refresh,this.actionRegistry.collapseAll,this.actionRegistry.clearSearchResults]},t.prototype.dispose=function(){this.isDisposed=!0,this.tree&&this.tree.dispose(),this.disposeModel(),e.prototype.dispose.call(this)},t.prototype.disposeModel=function(){this.viewModel&&(this.viewModel.dispose(),this.viewModel=null),s.cAll(this.callOnModelChange)},t.MAX_TEXT_RESULTS=2048,t=__decorate([__param(0,$.ITelemetryService),__param(1,V.IEventService),__param(2,q.IWorkbenchEditorService),__param(3,B.IProgressService),__param(4,z.IMessageService),__param(5,L.IStorageService),__param(6,W.IContextViewService),__param(7,H.IInstantiationService),__param(8,G.IConfigurationService),__param(9,K.IWorkspaceContextService),__param(10,U.ISearchService),__param(11,I.ITextFileService),__param(12,Q.IKeybindingService)],t)}(P.Viewlet);t.SearchViewlet=pe});