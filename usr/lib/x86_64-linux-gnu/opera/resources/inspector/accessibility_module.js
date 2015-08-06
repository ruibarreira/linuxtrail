WebInspector.AccessibilityModel=function(target)
{WebInspector.SDKModel.call(this,WebInspector.AccessibilityModel,target);this._agent=target.accessibilityAgent();};WebInspector.AccessibilityModel.prototype={getAXNode:function(nodeId,userCallback)
{var wrappedCallback=InspectorBackend.wrapClientCallback(userCallback,"AccessibilityAgent.getAXNode(): ");this._agent.getAXNode(nodeId,wrappedCallback);},__proto__:WebInspector.SDKModel.prototype}
WebInspector.AccessibilityModel._symbol=Symbol("AccessibilityModel");WebInspector.AccessibilityModel.fromTarget=function(target)
{if(!target[WebInspector.AccessibilityModel._symbol])
target[WebInspector.AccessibilityModel._symbol]=new WebInspector.AccessibilityModel(target);return target[WebInspector.AccessibilityModel._symbol];};WebInspector.AccessibilitySidebarView=function()
{WebInspector.ThrottledElementsSidebarView.call(this);}
WebInspector.AccessibilitySidebarView.prototype={doUpdate:function(finishCallback)
{if(this._axNodeSubPane)
this._axNodeSubPane.doUpdate(finishCallback);},wasShown:function()
{WebInspector.ElementsSidebarPane.prototype.wasShown.call(this);if(this._axNodeSubPane)
return;this._axNodeSubPane=new WebInspector.AXNodeSubPane();this._axNodeSubPane.show(this.element);this._axNodeSubPane.expand();var sidebarPaneStack=new WebInspector.SidebarPaneStack();sidebarPaneStack.element.classList.add("flex-auto");sidebarPaneStack.show(this.element);sidebarPaneStack.addPane(this._axNodeSubPane);},__proto__:WebInspector.ThrottledElementsSidebarView.prototype};WebInspector.AXNodeSubPane=function()
{WebInspector.SidebarPane.call(this,WebInspector.UIString("Accessibility Node"));this.registerRequiredCSS("elements/accessibilityNode.css");this._computedNameElement=this.bodyElement.createChild("div","ax-computed-name");this._infoElement=createElementWithClass("div","info hidden");this._infoElement.textContent=WebInspector.UIString("No Accessibility Node");this.bodyElement.appendChild(this._infoElement);this._treeOutline=new TreeOutlineInShadow('monospace');this._treeOutline.registerRequiredCSS("elements/accessibilityNode.css");this._treeOutline.registerRequiredCSS("components/objectValue.css");this.bodyElement.appendChild(this._treeOutline.element);};WebInspector.AXNodeSubPane.prototype={doUpdate:function(callback)
{function accessibilityNodeCallback(accessibilityNode)
{this._setAXNode(accessibilityNode);callback();}
var node=this.parentView().parentView().node();WebInspector.AccessibilityModel.fromTarget(node.target()).getAXNode(node.id,accessibilityNodeCallback.bind(this));},wasShown:function()
{WebInspector.SidebarPane.prototype.wasShown.call(this);WebInspector.targetManager.addModelListener(WebInspector.DOMModel,WebInspector.DOMModel.Events.AttrModified,this._onNodeChange,this);WebInspector.targetManager.addModelListener(WebInspector.DOMModel,WebInspector.DOMModel.Events.AttrRemoved,this._onNodeChange,this);WebInspector.targetManager.addModelListener(WebInspector.DOMModel,WebInspector.DOMModel.Events.CharacterDataModified,this._onNodeChange,this);WebInspector.targetManager.addModelListener(WebInspector.DOMModel,WebInspector.DOMModel.Events.ChildNodeCountUpdated,this._onNodeChange,this);},willHide:function()
{WebInspector.targetManager.removeModelListener(WebInspector.DOMModel,WebInspector.DOMModel.Events.AttrModified,this._onNodeChange,this);WebInspector.targetManager.removeModelListener(WebInspector.DOMModel,WebInspector.DOMModel.Events.AttrRemoved,this._onNodeChange,this);WebInspector.targetManager.removeModelListener(WebInspector.DOMModel,WebInspector.DOMModel.Events.CharacterDataModified,this._onNodeChange,this);WebInspector.targetManager.removeModelListener(WebInspector.DOMModel,WebInspector.DOMModel.Events.ChildNodeCountUpdated,this._onNodeChange,this);},_setAXNode:function(axNode)
{if(this._axNode===axNode)
return;this._axNode=axNode;var treeOutline=this._treeOutline;treeOutline.removeChildren();if(!axNode){this._computedNameElement.classList.add("hidden");treeOutline.element.classList.add("hidden");this._infoElement.classList.remove("hidden");return;}
this._computedNameElement.classList.remove("hidden");treeOutline.element.classList.remove("hidden");this._infoElement.classList.add("hidden");var target=this.parentView().parentView().node().target();this._computedNameElement.removeChildren();if(axNode.name&&axNode.name.value)
this._computedNameElement.textContent=axNode.name.value;function addProperty(property)
{treeOutline.appendChild(new WebInspector.AXNodePropertyTreeElement(property,target));}
addProperty({name:"role",value:axNode.role});for(var propertyName of["description","help","value"]){if(propertyName in axNode)
addProperty({name:propertyName,value:axNode[propertyName]});}
var propertyMap={};for(var property of axNode.properties)
propertyMap[property.name]=property;for(var propertySet of[AccessibilityAgent.AXWidgetAttributes,AccessibilityAgent.AXWidgetStates,AccessibilityAgent.AXGlobalStates,AccessibilityAgent.AXLiveRegionAttributes,AccessibilityAgent.AXRelationshipAttributes]){for(var propertyKey in propertySet){var property=propertySet[propertyKey];if(property in propertyMap)
addProperty(propertyMap[property]);}}},_onNodeChange:function(event)
{var node=this._axNode;this._axNode=null;this._setAXNode(node);},__proto__:WebInspector.SidebarPane.prototype};WebInspector.AXNodePropertyTreeElement=function(property,target)
{this._property=property;this._target=target;TreeElement.call(this,"");this.toggleOnClick=true;this.selectable=false;}
WebInspector.AXNodePropertyTreeElement.prototype={onattach:function()
{this._update();},_update:function()
{this._nameElement=WebInspector.AXNodePropertyTreeElement.createNameElement(this._property.name);var value=this._property.value;if(this._property.name==="role"&&value.value===""){this._valueElement=createElement("span");this._valueElement.textContent=WebInspector.UIString("<No matching ARIA role>");}else if(value.type==="idref"){this._valueElement=WebInspector.AXNodePropertyTreeElement.createRelationshipValueElement(value,this._target);}else if(value.type==="idrefList"){var relatedNodes=value.relatedNodeArrayValue;var numNodes=relatedNodes.length;var description="("+numNodes+(numNodes==1?" node":" nodes")+")";value.value=description;for(var i=0;i<relatedNodes.length;i++){var backendId=relatedNodes[i].backendNodeId;var deferredNode=new WebInspector.DeferredDOMNode(this._target,relatedNodes[i].backendNodeId);var child=new WebInspector.AXRelatedNodeTreeElement(deferredNode);this.appendChild(child);}
this._valueElement=WebInspector.AXNodePropertyTreeElement.createValueElement(value,this.listItemElement);}else{this._valueElement=WebInspector.AXNodePropertyTreeElement.createValueElement(value,this.listItemElement);}
var separatorElement=createElementWithClass("span","separator");separatorElement.textContent=": ";this.listItemElement.removeChildren();this.listItemElement.appendChildren(this._nameElement,separatorElement,this._valueElement);},__proto__:TreeElement.prototype}
WebInspector.AXNodePropertyTreeElement.populateWithNode=function(treeNode,axNode,target)
{}
WebInspector.AXNodePropertyTreeElement.createNameElement=function(name)
{var nameElement=createElementWithClass("span","ax-name");if(/^\s|\s$|^$|\n/.test(name))
nameElement.createTextChildren("\"",name.replace(/\n/g,"\u21B5"),"\"");else
nameElement.textContent=name;return nameElement;}
WebInspector.AXNodePropertyTreeElement.createRelationshipValueElement=function(value,target)
{var deferredNode=new WebInspector.DeferredDOMNode(target,value.relatedNodeValue.backendNodeId);var valueElement=createElement("span");function onNodeResolved(node)
{valueElement.appendChild(WebInspector.DOMPresentationUtils.linkifyNodeReference(node));}
deferredNode.resolve(onNodeResolved);return valueElement;}
WebInspector.AXNodePropertyTreeElement.createValueElement=function(value,parentElement)
{var valueElement=createElementWithClass("span","object-value");var type=value.type;var prefix;var valueText;var suffix;switch(type){case"string":prefix="\"";valueText=value.value.replace(/\n/g,"\u21B5");suffix="\"";valueElement._originalTextContent="\""+value.value+"\"";valueElement.classList.add("object-value-string");break;case"boolean":case"booleanOrUndefined":case"tristate":valueText=String(value.value);valueElement.classList.add("object-value-boolean");break;case"number":case"integer":valueText=String(value.value);valueElement.classList.add("object-value-number");break;default:valueText=String(value.value);}
valueElement.setTextContentTruncatedIfNeeded(valueText||"");if(prefix)
valueElement.insertBefore(createTextNode(prefix),valueElement.firstChild);if(suffix)
valueElement.createTextChild(suffix);valueElement.title=String(value.value)||"";return valueElement;}
WebInspector.AXRelatedNodeTreeElement=function(deferredNode)
{this._deferredNode=deferredNode;TreeElement.call(this,"");};WebInspector.AXRelatedNodeTreeElement.prototype={onattach:function()
{this._update();},_update:function()
{var valueElement=createElement("div");this.listItemElement.appendChild(valueElement);function onNodeResolved(node)
{valueElement.appendChild(WebInspector.DOMPresentationUtils.linkifyNodeReference(node));}
this._deferredNode.resolve(onNodeResolved);},__proto__:TreeElement.prototype};;