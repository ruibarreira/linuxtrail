/*!--------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/**
 * marked - a markdown parser
 * Copyright (c) 2011-2014, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/chjj/marked
 */
function Lexer(e){this.tokens=[],this.tokens.links={},this.options=e||marked.defaults,this.rules=block.normal,this.options.gfm&&(this.options.tables?this.rules=block.tables:this.rules=block.gfm)}function InlineLexer(e,t){if(this.options=t||marked.defaults,this.links=e,this.rules=inline.normal,this.renderer=this.options.renderer||new Renderer,this.renderer.options=this.options,!this.links)throw new Error("Tokens array requires a `links` property.");this.options.gfm?this.options.breaks?this.rules=inline.breaks:this.rules=inline.gfm:this.options.pedantic&&(this.rules=inline.pedantic)}function Renderer(e){this.options=e||{}}function Parser(e){this.tokens=[],this.token=null,this.options=e||marked.defaults,this.options.renderer=this.options.renderer||new Renderer,this.renderer=this.options.renderer,this.renderer.options=this.options}function escape(e,t){return e.replace(t?/&/g:/&(?!#?\w+;)/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function unescape(e){return e.replace(/&([#\w]+);/g,function(e,t){return t=t.toLowerCase(),"colon"===t?":":"#"===t.charAt(0)?"x"===t.charAt(1)?String.fromCharCode(parseInt(t.substring(2),16)):String.fromCharCode(+t.substring(1)):""})}function replace(e,t){return e=e.source,t=t||"",function r(n,s){return n?(s=s.source||s,s=s.replace(/(^|[^\[])\^/g,"$1"),e=e.replace(n,s),r):new RegExp(e,t)}}function noop(){}function merge(e){for(var t,r,n=1;n<arguments.length;n++){t=arguments[n];for(r in t)Object.prototype.hasOwnProperty.call(t,r)&&(e[r]=t[r])}return e}function marked(e,t,r){if(r||"function"==typeof t){r||(r=t,t=null),t=merge({},marked.defaults,t||{});var n,s,i=t.highlight,o=0;try{n=Lexer.lex(e,t)}catch(l){return r(l)}s=n.length;var a=function(e){if(e)return t.highlight=i,r(e);var s;try{s=Parser.parse(n,t)}catch(o){e=o}return t.highlight=i,e?r(e):r(null,s)};if(!i||i.length<3)return a();if(delete t.highlight,!s)return a();for(;o<n.length;o++)!function(e){return"code"!==e.type?--s||a():i(e.text,e.lang,function(t,r){return t?a(t):null==r||r===e.text?--s||a():(e.text=r,e.escaped=!0,void(--s||a()))})}(n[o])}else try{return t&&(t=merge({},marked.defaults,t)),Parser.parse(Lexer.lex(e,t),t)}catch(l){if(l.message+="\nPlease report this to https://github.com/chjj/marked.",(t||marked.defaults).silent)return"<p>An error occured:</p><pre>"+escape(l.message+"",!0)+"</pre>";throw l}}var block={newline:/^\n+/,code:/^( {4}[^\n]+\n*)+/,fences:noop,hr:/^( *[-*_]){3,} *(?:\n+|$)/,heading:/^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,nptable:noop,lheading:/^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/,blockquote:/^( *>[^\n]+(\n(?!def)[^\n]+)*\n*)+/,list:/^( *)(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,html:/^ *(?:comment *(?:\n|\s*$)|closed *(?:\n{2,}|\s*$)|closing *(?:\n{2,}|\s*$))/,def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,table:noop,paragraph:/^((?:[^\n]+\n?(?!hr|heading|lheading|blockquote|tag|def))+)\n*/,text:/^[^\n]+/};block.bullet=/(?:[*+-]|\d+\.)/,block.item=/^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/,block.item=replace(block.item,"gm")(/bull/g,block.bullet)(),block.list=replace(block.list)(/bull/g,block.bullet)("hr","\\n+(?=\\1?(?:[-*_] *){3,}(?:\\n+|$))")("def","\\n+(?="+block.def.source+")")(),block.blockquote=replace(block.blockquote)("def",block.def)(),block._tag="(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|[^\\w\\s@]*@)\\b",block.html=replace(block.html)("comment",/<!--[\s\S]*?-->/)("closed",/<(tag)[\s\S]+?<\/\1>/)("closing",/<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)(/tag/g,block._tag)(),block.paragraph=replace(block.paragraph)("hr",block.hr)("heading",block.heading)("lheading",block.lheading)("blockquote",block.blockquote)("tag","<"+block._tag)("def",block.def)(),block.normal=merge({},block),block.gfm=merge({},block.normal,{fences:/^ *(`{3,}|~{3,}) *(\S+)? *\n([\s\S]+?)\s*\1 *(?:\n+|$)/,paragraph:/^/}),block.gfm.paragraph=replace(block.paragraph)("(?!","(?!"+block.gfm.fences.source.replace("\\1","\\2")+"|"+block.list.source.replace("\\1","\\3")+"|")(),block.tables=merge({},block.gfm,{nptable:/^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,table:/^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/}),Lexer.rules=block,Lexer.lex=function(e,t){var r=new Lexer(t);return r.lex(e)},Lexer.prototype.lex=function(e){return e=e.replace(/\r\n|\r/g,"\n").replace(/\t/g,"    ").replace(/\u00a0/g," ").replace(/\u2424/g,"\n"),this.token(e,!0)},Lexer.prototype.token=function(e,t,r){for(var n,s,i,o,l,a,h,c,u,e=e.replace(/^ +$/gm,"");e;)if((i=this.rules.newline.exec(e))&&(e=e.substring(i[0].length),i[0].length>1&&this.tokens.push({type:"space"})),i=this.rules.code.exec(e))e=e.substring(i[0].length),i=i[0].replace(/^ {4}/gm,""),this.tokens.push({type:"code",text:this.options.pedantic?i:i.replace(/\n+$/,"")});else if(i=this.rules.fences.exec(e))e=e.substring(i[0].length),this.tokens.push({type:"code",lang:i[2],text:i[3]});else if(i=this.rules.heading.exec(e))e=e.substring(i[0].length),this.tokens.push({type:"heading",depth:i[1].length,text:i[2]});else if(t&&(i=this.rules.nptable.exec(e))){for(e=e.substring(i[0].length),a={type:"table",header:i[1].replace(/^ *| *\| *$/g,"").split(/ *\| */),align:i[2].replace(/^ *|\| *$/g,"").split(/ *\| */),cells:i[3].replace(/\n$/,"").split("\n")},c=0;c<a.align.length;c++)/^ *-+: *$/.test(a.align[c])?a.align[c]="right":/^ *:-+: *$/.test(a.align[c])?a.align[c]="center":/^ *:-+ *$/.test(a.align[c])?a.align[c]="left":a.align[c]=null;for(c=0;c<a.cells.length;c++)a.cells[c]=a.cells[c].split(/ *\| */);this.tokens.push(a)}else if(i=this.rules.lheading.exec(e))e=e.substring(i[0].length),this.tokens.push({type:"heading",depth:"="===i[2]?1:2,text:i[1]});else if(i=this.rules.hr.exec(e))e=e.substring(i[0].length),this.tokens.push({type:"hr"});else if(i=this.rules.blockquote.exec(e))e=e.substring(i[0].length),this.tokens.push({type:"blockquote_start"}),i=i[0].replace(/^ *> ?/gm,""),this.token(i,t,!0),this.tokens.push({type:"blockquote_end"});else if(i=this.rules.list.exec(e)){for(e=e.substring(i[0].length),o=i[2],this.tokens.push({type:"list_start",ordered:o.length>1}),i=i[0].match(this.rules.item),n=!1,u=i.length,c=0;u>c;c++)a=i[c],h=a.length,a=a.replace(/^ *([*+-]|\d+\.) +/,""),~a.indexOf("\n ")&&(h-=a.length,a=this.options.pedantic?a.replace(/^ {1,4}/gm,""):a.replace(new RegExp("^ {1,"+h+"}","gm"),"")),this.options.smartLists&&c!==u-1&&(l=block.bullet.exec(i[c+1])[0],o===l||o.length>1&&l.length>1||(e=i.slice(c+1).join("\n")+e,c=u-1)),s=n||/\n\n(?!\s*$)/.test(a),c!==u-1&&(n="\n"===a.charAt(a.length-1),s||(s=n)),this.tokens.push({type:s?"loose_item_start":"list_item_start"}),this.token(a,!1,r),this.tokens.push({type:"list_item_end"});this.tokens.push({type:"list_end"})}else if(i=this.rules.html.exec(e))e=e.substring(i[0].length),this.tokens.push({type:this.options.sanitize?"paragraph":"html",pre:"pre"===i[1]||"script"===i[1]||"style"===i[1],text:i[0]});else if(!r&&t&&(i=this.rules.def.exec(e)))e=e.substring(i[0].length),this.tokens.links[i[1].toLowerCase()]={href:i[2],title:i[3]};else if(t&&(i=this.rules.table.exec(e))){for(e=e.substring(i[0].length),a={type:"table",header:i[1].replace(/^ *| *\| *$/g,"").split(/ *\| */),align:i[2].replace(/^ *|\| *$/g,"").split(/ *\| */),cells:i[3].replace(/(?: *\| *)?\n$/,"").split("\n")},c=0;c<a.align.length;c++)/^ *-+: *$/.test(a.align[c])?a.align[c]="right":/^ *:-+: *$/.test(a.align[c])?a.align[c]="center":/^ *:-+ *$/.test(a.align[c])?a.align[c]="left":a.align[c]=null;for(c=0;c<a.cells.length;c++)a.cells[c]=a.cells[c].replace(/^ *\| *| *\| *$/g,"").split(/ *\| */);this.tokens.push(a)}else if(t&&(i=this.rules.paragraph.exec(e)))e=e.substring(i[0].length),this.tokens.push({type:"paragraph",text:"\n"===i[1].charAt(i[1].length-1)?i[1].slice(0,-1):i[1]});else if(i=this.rules.text.exec(e))e=e.substring(i[0].length),this.tokens.push({type:"text",text:i[0]});else if(e)throw new Error("Infinite loop on byte: "+e.charCodeAt(0));return this.tokens};var inline={escape:/^\\([\\`*{}\[\]()#+\-.!_>])/,autolink:/^<([^ >]+(@|:\/)[^ >]+)>/,url:noop,tag:/^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,link:/^!?\[(inside)\]\(href\)/,reflink:/^!?\[(inside)\]\s*\[([^\]]*)\]/,nolink:/^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,strong:/^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,em:/^\b_((?:__|[\s\S])+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,code:/^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,br:/^ {2,}\n(?!\s*$)/,del:noop,text:/^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/};inline._inside=/(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/,inline._href=/\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/,inline.link=replace(inline.link)("inside",inline._inside)("href",inline._href)(),inline.reflink=replace(inline.reflink)("inside",inline._inside)(),inline.normal=merge({},inline),inline.pedantic=merge({},inline.normal,{strong:/^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,em:/^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/}),inline.gfm=merge({},inline.normal,{escape:replace(inline.escape)("])","~|])")(),url:/^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,del:/^~~(?=\S)([\s\S]*?\S)~~/,text:replace(inline.text)("]|","~]|")("|","|https?://|")()}),inline.breaks=merge({},inline.gfm,{br:replace(inline.br)("{2,}","*")(),text:replace(inline.gfm.text)("{2,}","*")()}),InlineLexer.rules=inline,InlineLexer.output=function(e,t,r){var n=new InlineLexer(t,r);return n.output(e)},InlineLexer.prototype.output=function(e){for(var t,r,n,s,i="";e;)if(s=this.rules.escape.exec(e))e=e.substring(s[0].length),i+=s[1];else if(s=this.rules.autolink.exec(e))e=e.substring(s[0].length),"@"===s[2]?(r=":"===s[1].charAt(6)?this.mangle(s[1].substring(7)):this.mangle(s[1]),n=this.mangle("mailto:")+r):(r=escape(s[1]),n=r),i+=this.renderer.link(n,null,r);else if(this.inLink||!(s=this.rules.url.exec(e))){if(s=this.rules.tag.exec(e))!this.inLink&&/^<a /i.test(s[0])?this.inLink=!0:this.inLink&&/^<\/a>/i.test(s[0])&&(this.inLink=!1),e=e.substring(s[0].length),i+=this.options.sanitize?escape(s[0]):s[0];else if(s=this.rules.link.exec(e))e=e.substring(s[0].length),this.inLink=!0,i+=this.outputLink(s,{href:s[2],title:s[3]}),this.inLink=!1;else if((s=this.rules.reflink.exec(e))||(s=this.rules.nolink.exec(e))){if(e=e.substring(s[0].length),t=(s[2]||s[1]).replace(/\s+/g," "),t=this.links[t.toLowerCase()],!t||!t.href){i+=s[0].charAt(0),e=s[0].substring(1)+e;continue}this.inLink=!0,i+=this.outputLink(s,t),this.inLink=!1}else if(s=this.rules.strong.exec(e))e=e.substring(s[0].length),i+=this.renderer.strong(this.output(s[2]||s[1]));else if(s=this.rules.em.exec(e))e=e.substring(s[0].length),i+=this.renderer.em(this.output(s[2]||s[1]));else if(s=this.rules.code.exec(e))e=e.substring(s[0].length),i+=this.renderer.codespan(escape(s[2],!0));else if(s=this.rules.br.exec(e))e=e.substring(s[0].length),i+=this.renderer.br();else if(s=this.rules.del.exec(e))e=e.substring(s[0].length),i+=this.renderer.del(this.output(s[1]));else if(s=this.rules.text.exec(e))e=e.substring(s[0].length),i+=escape(this.smartypants(s[0]));else if(e)throw new Error("Infinite loop on byte: "+e.charCodeAt(0))}else e=e.substring(s[0].length),r=escape(s[1]),n=r,i+=this.renderer.link(n,null,r);return i},InlineLexer.prototype.outputLink=function(e,t){var r=escape(t.href),n=t.title?escape(t.title):null;return"!"!==e[0].charAt(0)?this.renderer.link(r,n,this.output(e[1])):this.renderer.image(r,n,escape(e[1]))},InlineLexer.prototype.smartypants=function(e){return e},InlineLexer.prototype.mangle=function(e){for(var t,r="",n=e.length,s=0;n>s;s++)t=e.charCodeAt(s),Math.random()>.5&&(t="x"+t.toString(16)),r+="&#"+t+";";return r},Renderer.prototype.code=function(e,t,r){if(this.options.highlight){var n=this.options.highlight(e,t);null!=n&&n!==e&&(r=!0,e=n)}return t?'<pre><code class="'+this.options.langPrefix+escape(t,!0)+'">'+(r?e:escape(e,!0))+"\n</code></pre>\n":"<pre><code>"+(r?e:escape(e,!0))+"\n</code></pre>"},Renderer.prototype.blockquote=function(e){return"<blockquote>\n"+e+"</blockquote>\n"},Renderer.prototype.html=function(e){return e},Renderer.prototype.heading=function(e,t,r){return"<h"+t+' id="'+this.options.headerPrefix+r.toLowerCase().replace(/[^\w]+/g,"-")+'">'+e+"</h"+t+">\n"},Renderer.prototype.hr=function(){return this.options.xhtml?"<hr/>\n":"<hr>\n"},Renderer.prototype.list=function(e,t){var r=t?"ol":"ul";return"<"+r+">\n"+e+"</"+r+">\n"},Renderer.prototype.listitem=function(e){return"<li>"+e+"</li>\n"},Renderer.prototype.paragraph=function(e){return"<p>"+e+"</p>\n"},Renderer.prototype.table=function(e,t){return"<table>\n<thead>\n"+e+"</thead>\n<tbody>\n"+t+"</tbody>\n</table>\n"},Renderer.prototype.tablerow=function(e){return"<tr>\n"+e+"</tr>\n"},Renderer.prototype.tablecell=function(e,t){var r=t.header?"th":"td",n=t.align?"<"+r+' style="text-align:'+t.align+'">':"<"+r+">";return n+e+"</"+r+">\n"},Renderer.prototype.strong=function(e){return"<strong>"+e+"</strong>"},Renderer.prototype.em=function(e){return"<em>"+e+"</em>"},Renderer.prototype.codespan=function(e){return"<code>"+e+"</code>"},Renderer.prototype.br=function(){return this.options.xhtml?"<br/>":"<br>"},Renderer.prototype.del=function(e){return"<del>"+e+"</del>"},Renderer.prototype.link=function(e,t,r){if(this.options.sanitize){try{var n=decodeURIComponent(unescape(e)).replace(/[^\w:]/g,"").toLowerCase()}catch(s){return""}if(0===n.indexOf("javascript:"))return""}var i='<a href="'+e+'"';return t&&(i+=' title="'+t+'"'),i+=">"+r+"</a>"},Renderer.prototype.image=function(e,t,r){var n='<img src="'+e+'" alt="'+r+'"';return t&&(n+=' title="'+t+'"'),n+=this.options.xhtml?"/>":">"},Parser.parse=function(e,t,r){var n=new Parser(t,r);return n.parse(e)},Parser.prototype.parse=function(e){this.inline=new InlineLexer(e.links,this.options,this.renderer),this.tokens=e.reverse();for(var t="";this.next();)t+=this.tok();return t},Parser.prototype.next=function(){return this.token=this.tokens.pop()},Parser.prototype.peek=function(){return this.tokens[this.tokens.length-1]||0},Parser.prototype.parseText=function(){for(var e=this.token.text;"text"===this.peek().type;)e+="\n"+this.next().text;return this.inline.output(e)},Parser.prototype.tok=function(){switch(this.token.type){case"space":return"";case"hr":return this.renderer.hr();case"heading":return this.renderer.heading(this.inline.output(this.token.text),this.token.depth,this.token.text);case"code":return this.renderer.code(this.token.text,this.token.lang,this.token.escaped);case"table":var e,t,r,n,s,i="",o="";for(r="",e=0;e<this.token.header.length;e++)n={header:!0,align:this.token.align[e]},r+=this.renderer.tablecell(this.inline.output(this.token.header[e]),{header:!0,align:this.token.align[e]});for(i+=this.renderer.tablerow(r),e=0;e<this.token.cells.length;e++){for(t=this.token.cells[e],r="",s=0;s<t.length;s++)r+=this.renderer.tablecell(this.inline.output(t[s]),{header:!1,align:this.token.align[s]});o+=this.renderer.tablerow(r)}return this.renderer.table(i,o);case"blockquote_start":for(var o="";"blockquote_end"!==this.next().type;)o+=this.tok();return this.renderer.blockquote(o);case"list_start":for(var o="",l=this.token.ordered;"list_end"!==this.next().type;)o+=this.tok();return this.renderer.list(o,l);case"list_item_start":for(var o="";"list_item_end"!==this.next().type;)o+="text"===this.token.type?this.parseText():this.tok();return this.renderer.listitem(o);case"loose_item_start":for(var o="";"list_item_end"!==this.next().type;)o+=this.tok();return this.renderer.listitem(o);case"html":var a=this.token.pre||this.options.pedantic?this.token.text:this.inline.output(this.token.text);return this.renderer.html(a);case"paragraph":return this.renderer.paragraph(this.inline.output(this.token.text));case"text":return this.renderer.paragraph(this.parseText())}},noop.exec=noop,marked.options=marked.setOptions=function(e){return merge(marked.defaults,e),marked},marked.defaults={gfm:!0,tables:!0,breaks:!1,pedantic:!1,sanitize:!1,smartLists:!1,silent:!1,highlight:null,langPrefix:"lang-",smartypants:!1,headerPrefix:"",renderer:new Renderer,xhtml:!1},marked.Parser=Parser,marked.parser=Parser.parse,marked.Renderer=Renderer,marked.Lexer=Lexer,marked.lexer=Lexer.lex,marked.InlineLexer=InlineLexer,marked.inlineLexer=InlineLexer.output,marked.parse=marked,this.marked=marked,define("vs/languages/markdown/common/raw.marked",[],function(){return this.marked}),require.config({shim:{"vs/languages/markdown/common/raw.marked":{exports:function(){return this.marked}}}}),define("vs/languages/markdown/common/marked",["./raw.marked"],function(e){return{marked:e}});var __extends=this&&this.__extends||function(e,t){function r(){this.constructor=e}for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n]);e.prototype=null===t?Object.create(t):(r.prototype=t.prototype,new r)},__decorate=this&&this.__decorate||function(e,t,r,n){if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)return Reflect.decorate(e,t,r,n);switch(arguments.length){case 2:return e.reduceRight(function(e,t){return t&&t(e)||e},t);case 3:return e.reduceRight(function(e,n){return void(n&&n(t,r))},void 0);case 4:return e.reduceRight(function(e,n){return n&&n(t,r,e)||e},n)}},__param=this&&this.__param||function(e,t){return function(r,n){t(r,n,e)}};define("vs/languages/markdown/common/markdownWorker",["require","exports","vs/base/common/winjs.base","vs/editor/common/modes/abstractModeWorker","vs/base/common/network","vs/base/common/types","vs/base/common/strings","vs/base/common/paths","vs/languages/markdown/common/marked","vs/editor/common/modes/modesRegistry","vs/editor/common/modes/textToHtmlTokenizer","vs/platform/platform","vs/base/common/platform","vs/editor/common/services/modeService","vs/editor/common/services/resourceService","vs/platform/markers/common/markers"],function(e,t,r,n,s,i,o,l,a,h,c,u,p,g,d,k){var m;!function(e){e[e.LIGHT=0]="LIGHT",e[e.DARK=1]="DARK",e[e.HC_BLACK=2]="HC_BLACK"}(m||(m={}));var f=function(e){function t(t,r,n,s,i){e.call(this,t,r,n,s),this.theme=m.DARK,this.modeService=i}return __extends(t,e),t.prototype._doConfigure=function(e){return e&&e.theme&&(this.theme="vs-dark"===e.theme?m.DARK:"vs"===e.theme?m.LIGHT:m.HC_BLACK),e&&i.isArray(e.styles)&&(this.cssLinks=e.styles),r.TPromise.as(!1)},t.prototype.getEmitOutput=function(e,n,s){var i=this,o=this.resourceService.get(e),l=this.cssLinks||[],g=new a.marked.Renderer,d=this;g.image=function(t,r,s){var i='<img src="'+d.fixHref(e,t,n)+'" alt="'+s+'"';return r&&(i+=' title="'+r+'"'),i+=this.options&&this.options.xhtml?"/>":">"};var k=g.link;g.link=function(e,t,r){var n=k.call(this,e,t,r);return n=e&&"#"===e[0]?n.replace("href=","localhref="):n.replace("<a",'<a target="_blank"')};var f=this.modeService,b=function(e,r,n){var s=u.Registry.as(h.Extensions.EditorModes),i=s.getModeIdForLanguageName(r)||r||t.DEFAULT_MODE;f.getOrCreateMode(i).then(function(t){n(null,c.tokenizeToString(e,t))})};return new r.Promise(function(r,h){a.marked(o.getValue(),{gfm:!0,renderer:g,highlight:b},function(o,a){var h=["<!DOCTYPE html>","<html>","<head>",'<meta http-equiv="Content-type" content="text/html;charset=UTF-8">',0===l.length?'<link rel="stylesheet" href="'+s+'/markdown.css" type="text/css" media="screen">':"",0===l.length?'<link rel="stylesheet" href="'+s+'/tokens.css" type="text/css" media="screen">':"",'<base href="'+n+'" />',i.theme===m.LIGHT?t.LIGHT_SCROLLBAR_CSS:i.theme===m.DARK?t.DARK_SCROLLBAR_CSS:t.HC_BLACK_SCROLLBAR_CSS,l.map(function(t){return'<link rel="stylesheet" href="'+i.fixHref(e,t,n)+'" type="text/css" media="screen">'}).join("\n"),"</head>",p.isMacintosh?'<body class="mac">':"<body>"].join("\n"),c=[i.theme===m.LIGHT?'<div class="monaco-editor vs">':i.theme===m.DARK?'<div class="monaco-editor vs-dark">':'<div class="monaco-editor hc-black">',a,"</div>"].join("\n"),u=["</body>","</html>"].join("\n");r({head:h,body:c,tail:u})})})},t.prototype.fixHref=function(e,t,r){if(t){var n=new s.URL(t);if(!n.getScheme()){var i=t;if(i=o.replaceAll(i,"\\","/"),"/"===i[0])return l.join(r,i);var a=e.getPath();return l.join(l.dirname(a),i)}}return t},t.DEFAULT_MODE="text/plain",t.LIGHT_SCROLLBAR_CSS=['<style type="text/css">',"	::-webkit-scrollbar {","		width: 14px;","		height: 14px;","	}","","	::-webkit-scrollbar-thumb {","		background-color: rgba(100, 100, 100, 0.4);","	}","","	::-webkit-scrollbar-thumb:hover {","		background-color: rgba(100, 100, 100, 0.7);","	}","","	::-webkit-scrollbar-thumb:active {","		background-color: rgba(0, 0, 0, 0.6);","	}","</style>"].join("\n"),t.DARK_SCROLLBAR_CSS=['<style type="text/css">',"	::-webkit-scrollbar {","		width: 14px;","		height: 14px;","	}","","	::-webkit-scrollbar-thumb {","		background-color: rgba(121, 121, 121, 0.4);","	}","","	::-webkit-scrollbar-thumb:hover {","		background-color: rgba(100, 100, 100, 0.7);","	}","","	::-webkit-scrollbar-thumb:active {","		background-color: rgba(85, 85, 85, 0.8);","	}","</style>"].join("\n"),t.HC_BLACK_SCROLLBAR_CSS=['<style type="text/css">',"	::-webkit-scrollbar {","		width: 14px;","		height: 14px;","	}","","	::-webkit-scrollbar-thumb {","		background-color: rgba(111, 195, 223, 0.3);","	}","","	::-webkit-scrollbar-thumb:hover {","		background-color: rgba(111, 195, 223, 0.4);","	}","","	::-webkit-scrollbar-thumb:active {","		background-color: rgba(111, 195, 223, 0.4);","	}","</style>"].join("\n"),t=__decorate([__param(2,d.IResourceService),__param(3,k.IMarkerService),__param(4,g.IModeService)],t)}(n.AbstractModeWorker);t.MarkdownWorker=f});