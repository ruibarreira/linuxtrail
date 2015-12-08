/*!--------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
"use strict";define("vs/languages/json/common/features/jsonTokenTypes",["require","exports"],function(t,e){e.TOKEN_DELIM_OBJECT="punctuation.bracket.json",e.TOKEN_DELIM_ARRAY="punctuation.array.json",e.TOKEN_DELIM_COLON="punctuation.colon.json",e.TOKEN_DELIM_COMMA="punctuation.comma.json",e.TOKEN_VALUE_BOOLEAN="meta.property-value.keyword.json",e.TOKEN_VALUE_NULL="meta.property-value.constant.other.json",e.TOKEN_VALUE_STRING="meta.property-value.string.value.json",e.TOKEN_VALUE_NUMBER="meta.property-value.constant.numeric.json",e.TOKEN_PROPERTY_NAME="support.type.property-name.json",e.TOKEN_COMMENT_BLOCK="comment.block.json",e.TOKEN_COMMENT_LINE="comment.line.json"}),define("vs/languages/json/common/features/tokenization",["require","exports","vs/base/common/json","vs/editor/common/modes","vs/languages/json/common/features/jsonTokenTypes"],function(t,e,n,o,r){function a(t,e){return{shouldGenerateEmbeddedModels:!1,getInitialState:function(){return new s(t,null,null,!1)},tokenize:function(n,o,r,a){return i(t,e,n,o,r,a)}}}function i(t,e,a,i,c,u){void 0===c&&(c=0);var p=0,l=!1;switch(i.scanError){case n.ScanError.UnexpectedEndOfString:a='"'+a,p=1;break;case n.ScanError.UnexpectedEndOfComment:a="/*"+a,p=2}var m,f,h=n.createScanner(a),_=i.lastWasColon;for(f={tokens:[],actualStopOffset:a.length,endState:i.clone(),modeTransitions:[{startIndex:0,mode:t}]};;){var d=c+h.getPosition(),E=o.Bracket.None,g="";if(m=h.scan(),m===n.SyntaxKind.EOF)break;if(d===c+h.getPosition())throw new Error("Scanner did not advance, next 3 characters are: "+a.substr(h.getPosition(),3));switch(l&&(d-=p),l=p>0,m){case n.SyntaxKind.OpenBraceToken:E=o.Bracket.Open,g=r.TOKEN_DELIM_OBJECT,_=!1;break;case n.SyntaxKind.CloseBraceToken:E=o.Bracket.Close,g=r.TOKEN_DELIM_OBJECT,_=!1;break;case n.SyntaxKind.OpenBracketToken:E=o.Bracket.Open,g=r.TOKEN_DELIM_ARRAY,_=!1;break;case n.SyntaxKind.CloseBracketToken:E=o.Bracket.Close,g=r.TOKEN_DELIM_ARRAY,_=!1;break;case n.SyntaxKind.ColonToken:g=r.TOKEN_DELIM_COLON,_=!0;break;case n.SyntaxKind.CommaToken:g=r.TOKEN_DELIM_COMMA,_=!1;break;case n.SyntaxKind.TrueKeyword:case n.SyntaxKind.FalseKeyword:g=r.TOKEN_VALUE_BOOLEAN,_=!1;break;case n.SyntaxKind.NullKeyword:g=r.TOKEN_VALUE_NULL,_=!1;break;case n.SyntaxKind.StringLiteral:g=_?r.TOKEN_VALUE_STRING:r.TOKEN_PROPERTY_NAME,_=!1;break;case n.SyntaxKind.NumericLiteral:g=r.TOKEN_VALUE_NUMBER,_=!1}if(e)switch(m){case n.SyntaxKind.LineCommentTrivia:g=r.TOKEN_COMMENT_LINE;break;case n.SyntaxKind.BlockCommentTrivia:g=r.TOKEN_COMMENT_BLOCK}f.endState=new s(i.getMode(),i.getStateData(),h.getTokenError(),_),f.tokens.push({startIndex:d,type:g,bracket:E})}return f}e.createTokenizationSupport=a;var s=function(){function t(t,e,n,o){this._mode=t,this._state=e,this.scanError=n,this.lastWasColon=o}return t.prototype.clone=function(){return new t(this._mode,this._state,this.scanError,this.lastWasColon)},t.prototype.equals=function(e){return e===this?!0:e&&e instanceof t?this.scanError===e.scanError&&this.lastWasColon===e.lastWasColon:!1},t.prototype.getMode=function(){return this._mode},t.prototype.tokenize=function(t){throw new Error},t.prototype.getStateData=function(){return this._state},t.prototype.setStateData=function(t){this._state=t},t}()});var __extends=this&&this.__extends||function(t,e){function n(){this.constructor=t}for(var o in e)e.hasOwnProperty(o)&&(t[o]=e[o]);t.prototype=null===e?Object.create(e):(n.prototype=e.prototype,new n)},__decorate=this&&this.__decorate||function(t,e,n,o){if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)return Reflect.decorate(t,e,n,o);switch(arguments.length){case 2:return t.reduceRight(function(t,e){return e&&e(t)||t},e);case 3:return t.reduceRight(function(t,o){return void(o&&o(e,n))},void 0);case 4:return t.reduceRight(function(t,o){return o&&o(e,n,t)||t},o)}},__param=this&&this.__param||function(t,e){return function(n,o){e(n,o,t)}};define("vs/languages/json/common/json",["require","exports","vs/editor/common/modes/supports","vs/platform/platform","vs/nls!vs/languages/json/common/json","vs/languages/json/common/features/tokenization","vs/editor/common/modes/abstractMode","vs/platform/thread/common/threadService","vs/platform/thread/common/thread","vs/platform/instantiation/common/descriptors","vs/editor/common/modes/supports/onEnter","vs/languages/json/common/jsonContributionRegistry","vs/platform/instantiation/common/instantiation"],function(t,e,n,o,r,a,i,s,c,u,p,l,m){var f=function(t){function e(e,o,i){var s=this;t.call(this,e,o,i),this.tokenizationSupport=a.createTokenizationSupport(this,!0),this.electricCharacterSupport=new n.BracketElectricCharacterSupport(this,{brackets:[{tokenType:"delimiter.bracket.json",open:"{",close:"}",isElectric:!0},{tokenType:"delimiter.array.json",open:"[",close:"]",isElectric:!0}]}),this.extraInfoSupport=this,this.outlineSupport=this,this.outlineGroupLabel=Object.create(null),this.outlineGroupLabel.object=r.localize(0,null),this.outlineGroupLabel.array=r.localize(1,null),this.outlineGroupLabel.string=r.localize(2,null),this.outlineGroupLabel.number=r.localize(3,null),this.outlineGroupLabel["boolean"]=r.localize(4,null),this.outlineGroupLabel["null"]=r.localize(5,null),this.formattingSupport=this,this.characterPairSupport=new n.CharacterPairSupport(this,{autoClosingPairs:[{open:"{",close:"}",notIn:["string"]},{open:"[",close:"]",notIn:["string"]},{open:'"',close:'"',notIn:["string"]}]}),this.suggestSupport=new n.SuggestSupport(this,{triggerCharacters:[],excludeTokens:["comment.line.json","comment.block.json"],suggest:function(t,e){return s.suggest(t,e)}}),this.onEnterSupport=new p.OnEnterSupport(this.getId(),{brackets:[{open:"{",close:"}"},{open:"[",close:"]"}]})}return __extends(e,t),e.prototype.creationDone=function(){var e=this;if(t.prototype.creationDone.call(this),this._threadService.isInMainThread){this._configureWorkerSchemas(this.getSchemaConfiguration());var n=o.Registry.as(l.Extensions.JSONContribution);n.addRegistryChangedListener(function(t){e._configureWorkerSchemas(e.getSchemaConfiguration())})}},e.prototype.getSchemaConfiguration=function(){var t=o.Registry.as(l.Extensions.JSONContribution);return t.getSchemaContributions()},e.prototype.getSerializableState=function(){return this.getSchemaConfiguration()},e.prototype.setData=function(t){this._worker(function(e){return e.setSchemaContributions(t)})},e.prototype._getWorkerDescriptor=function(){return u.createAsyncDescriptor2("vs/languages/json/common/jsonWorker","JSONWorker")},e.prototype._configureWorkerSchemas=function(t){return this._worker(function(e){return e.setSchemaContributions(t)})},e.prototype.computeInfo=function(t,e){return this._worker(function(n){return n.computeInfo(t,e)})},e.prototype.getOutline=function(t){return this._worker(function(e){return e.getOutline(t)})},e.prototype.formatDocument=function(t,e){return this._worker(function(n){return n.format(t,null,e)})},e.prototype.formatRange=function(t,e,n){return this._worker(function(o){return o.format(t,e,n)})},e.prototype.getCommentsConfiguration=function(){return{lineCommentTokens:["//"],blockCommentStartToken:"/*",blockCommentEndToken:"*/"}},e.prototype.getWordDefinition=function(){return e.WORD_DEFINITION},e.$_configureWorkerSchemas=s.AllWorkersAttr(e,e.prototype._configureWorkerSchemas),e.$computeInfo=s.OneWorkerAttr(e,e.prototype.computeInfo),e.$getOutline=s.OneWorkerAttr(e,e.prototype.getOutline),e.$formatDocument=s.OneWorkerAttr(e,e.prototype.formatDocument),e.$formatRange=s.OneWorkerAttr(e,e.prototype.formatRange),e.WORD_DEFINITION=i.createWordRegExp(".-"),e=__decorate([__param(1,m.IInstantiationService),__param(2,c.IThreadService)],e)}(i.AbstractMode);e.JSONMode=f});