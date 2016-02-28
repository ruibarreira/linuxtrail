String.prototype.trim = function() {
    return this.replace(/(^\s*)|(\s*$)/g, '');
}
String.prototype.repeat = function(nTimes) {
    var oRep = [];
    for (var i = 0; i < nTimes; i++) {
        oRep.push(this);
    };
    return oRep.join('');
};
String.prototype.padded = function(nLen) {
    return '0'.repeat(nLen - this.length) + this;
}
String.prototype.encode = function() {
    return this.split('').reverse().join('').replace(/[a-z]/ig, function(str) {
        if (str.charCodeAt(0) > 96) {
            return str.toUpperCase();
        } else {
            return str.toLowerCase();
        };
    }).replace(/[a-zA-Z]/g, function(str) {
        var d = str.charCodeAt(0);
        if (d > 64 && d <= 90) {
            d += 13;
            if (d > 90) {
                d = 64 + (d - 90);
            };
        } else {
            d += 13;
            if (d > 122) {
                d = 96 + (d - 122);
            };
        }
        return String.fromCharCode(d);
    })
}
String.prototype.escape = function() {
    return encodeURIComponent(this);
}
String.prototype.unescape = function() {
    return decodeURIComponent(this);
}
String.prototype.toObject = function() {
    return eval(this);
}
String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
        return typeof args[number] != 'undefined' ? args[number] : match;
    });
};
String.prototype.contains = function(str, ignorecase) {
    return ignorecase ? (this.toLowerCase().indexOf(str.toLowerCase()) >= 0) : (this.indexOf(str) >= 0);
}
String.prototype.insert = function(nIndex, sToInsert) {
    return this.substr(0, nIndex) + sToInsert + this.substr(nIndex);
}
String.prototype.startsWith = function(str) {
    return this.slice(0, str.length) == str;
}
String.prototype.endsWith = function(str) {
    return this.slice(-str.length) == str;
}
Array.prototype.contains = function(obj) {
    for (var i = 0, l = this.length; i < l; i++) {
        if (obj == this[i]) {
            return true;
        }
    }
    return false;
}
Array.prototype.set = function(obj) {
    if (!this.contains(obj)) {
        this.push(obj);
    }
}
Array.prototype.remove = function(obj) {
    for (var i = 0, l = this.length; i < l; i++) {
        if (obj == this[i]) {
            this.splice(i, 1);
            return i;
        }
    }
    return -1;
}
Array.prototype.compact = function() {
    var oUnique = [],
        oHash = {};
    for (var i = 0, l = this.length; i < l; i++) {
        var oObj = this[i];
        if (typeof oObj == "undefined" || oObj == null || typeof oObj == "string" && oObj == "") continue;
        var oBucket = oHash[oObj];
        if (!oBucket) {
            oHash[oObj] = [oObj];
            oUnique.push(oObj)
        } else {
            var bContains = false;
            for (var b = 0, bl = oBucket.length; b < bl; b++)
                if (oBucket[b] == oObj) {
                    bContains = true;
                    break
                }
            if (!bContains) {
                oBucket.push(oObj);
                oUnique.push(oObj)
            }
        }
    }
    return oUnique
};
Array.prototype.indexOf = function(obj) {
    for (var i = 0, l = this.length; i < l; i++) {
        if (obj == this[i]) {
            return i;
        }
    }
    return -1;
}
if (!Array.prototype.forEach)
    Array.prototype.forEach = function(fn, scope) {
        for (var i = 0, l = this.length; i < l; ++i) {
            fn.call(scope, this[i], i, this);
        }
    }
if (typeof(FileList) !== 'undefined')
    FileList.prototype.forEach = function(fn, scope) {
        for (var i = 0, l = this.length; i < l; ++i) {
            fn.call(scope, this[i], i, this);
        }
    }
Math.log10 = function(nValue) {
    return Math.log(nValue) / Math.log(10);
}
RegExp.escape = function(sPattern) {
    return sPattern.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}
RegExp.prototype.matches = function(sHaystack) {
    var oMatch = null;
    var oMatches = [];
    while (oMatch = this.exec(sHaystack)) {
        var oCaptured = [];
        for (i in oMatch)
            if (parseInt(i) == i)
                oCaptured.push(oMatch[i]);
        oMatches.push(oCaptured);
    }
    return oMatches;
}
Date.prototype.monthName = function(abbreviate) {
    return (abbreviate ? Date.abreviatedMonthNames : Date.monthNames)[this.getMonth()];
}
Date.prototype.weekDayName = function(abbreviate) {
    return (abbreviate ? ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"] : ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"])[this.getDay()];
}
Date.prototype.format = function(sFormat) {
    var oStrings = [];
    var oThat = this;
    sFormat = sFormat.replace(/'([^']*)'/ig, function(a, i) {
        oStrings.push(i);
        return "'" + (oStrings.length - 1) + "'"
    });
    sFormat = sFormat.replace(/[a-z]+/ig, function(w) {
        switch (w) {
            case 'yyyy':
                return oThat.getFullYear();
            case 'yyy':
                return oThat.getFullYear();
            case 'yy':
                return oThat.getFullYear().toString().substr(2);
            case 'y':
                return oThat.getFullYear().toString().substr(2);
            case 'MMMM':
                return oThat.monthName(false);
            case 'MMM':
                return oThat.monthName(false);
            case 'MM':
                return (oThat.getMonth() + 1).toString().padded(2);
            case 'M':
                return oThat.getMonth() + 1;
            case 'dddd':
                return oThat.weekDayName(false);
            case 'ddd':
                return oThat.weekDayName(true);
            case 'dd':
                return oThat.getDate().toString().padded(2)
            case 'd':
                return oThat.getDate();
            case 'HH':
                return oThat.getHours().toString().padded(2)
            case 'H':
                return oThat.getHours()
            case 'hh':
                return ((oThat.getHours() % 12) + 1).toString().padded(2)
            case 'h':
                return ((oThat.getHours() % 12) + 1)
            case 'mm':
                return oThat.getMinutes().toString().padded(2)
            case 'm':
                return oThat.getMinutes()
            case 'ss':
                return oThat.getSeconds().toString().padded(2)
            case 's':
                return oThat.getSeconds()
            default:
                return w;
        }
    });
    sFormat = sFormat.replace(/'(\d+)'/ig, function(a, i) {
        return oStrings[parseInt(i)];
    });
    return sFormat;
}
Date.prototype.addDays = function(nDays) {
    var oDate = new Date(this.valueOf());
    oDate.setDate(oDate.getDate() + nDays);
    return oDate;
}
Date.prototype.addMonths = function(nMonths) {
    var oDate = new Date(this.valueOf());
    oDate.setMonth(oDate.getMonth() + nMonths);
    return oDate;
}
Date.parseFormat = function(sValue, sFormat) {
    var oPlaceHolders = /([a-z])\1*/ig;
    var oWildcards = oPlaceHolders.matches(sFormat);
    var sFormatValidator = RegExp.escape(sFormat).replace(/([a-z])\1*/ig, '[0-9]+');
    var oFormatValidator = new RegExp("^" + sFormatValidator + "$", "ig");
    if (!oFormatValidator.exec(sValue))
        return null;
    var oParts = /[0-9]+/ig;
    var oValues = oParts.matches(sValue);
    if (oWildcards.length != oValues.length)
        return null;
    var oNow = new Date();
    var nYear = oNow.getUTCFullYear();
    var nMonth = oNow.getUTCMonth();
    var nDay = oNow.getUTCDate();
    var nHour = oNow.getUTCHours();
    var nMinute = oNow.getUTCMinutes();
    for (var i = 0; i < oWildcards.length; i++) {
        var sType = oWildcards[i][0];
        var sValue = oValues[i][0];
        switch (sType) {
            case 'yyyy':
            case 'yyy':
            case 'yy':
            case 'y':
                nYear = parseInt(sValue);
                break;
            case 'MM':
            case 'M':
                nMonth = parseInt(sValue);
                break;
            case 'dd':
            case 'd':
                nDay = parseInt(sValue);
                break;
            case 'hh':
            case 'h':
                nHour = parseInt(sValue);
                break;
            case 'mm':
            case 'm':
                nMinute = parseInt(sValue);
                break;
            default:
                return null;
        }
    }
    return new Date(nYear, nMonth - 1, nDay, nHour, nMinute, 0, 0);
}

function getLambda(oFunction) {
    var oParams = [];
    for (var i = 1; i < arguments.length; i++) {
        oParams.push(arguments[i]);
    }
    return function() {
        return oFunction.apply(window, oParams);
    }
}

function asyncCaller(oFunction, nDelay) {
    return function() {
        var oThat = this;
        var oParams = [];
        for (var i = 0; i < arguments.length; i++) {
            oParams.push(arguments[i]);
        }
        setTimeout(function() {
            oFunction.apply(oThat, oParams)
        }, nDelay || 0);
    }
}

function Rect(x, y, w, h) {
    this.left = parseInt(x)
    this.top = parseInt(y)
    this.width = parseInt(w)
    this.height = parseInt(h)
    this.bottom = this.top + this.height;
    this.right = this.left + this.width;
}
Rect.prototype.contains = function(oRect) {
    return this.left <= oRect.left && oRect.left + oRect.width <= this.left + this.width && this.top <= oRect.top && oRect.top + oRect.height <= this.top + this.height;
}
Rect.prototype.union = function(oRect) {
    return new Rect(Math.min(this.left, oRect.left), Math.Min(this.top, oRect.top), Math.max(this.right, oRect.right) - Math.min(this.left, oRect.left), Math.Max(this.bottom, oRect.bottom) - Math.Min(this.top, oRect.top));
}
Rect.prototype.toString = function() {
    return '{"top":' + this.top + ',"left":' + this.left + ',"width":' + this.width + ',"height":' + this.height + ',"right":' + this.right + ',"bottom":' + this.bottom + "}"
}
Rect.prototype.debug = function(sColor) {
    var oShow = document.createElement('DIV');
    oShow.style.position = 'absolute';
    oShow.style.pointerEvents = 'none';
    oShow.style.top = this.top + 'px';
    oShow.style.left = this.left + 'px';
    oShow.style.width = this.width + 'px';
    oShow.style.height = this.height + 'px';
    oShow.style.border = '1px dashed ' + (sColor || 'red');
    document.body.appendChild(oShow);
}
document.init = function(oCallBack) {
    if (prototypeGlobal.initialized)
        setTimeout(oCallBack, 0);
    for (var i = 0; i < prototypeGlobal.initializers.length; i++)
        if (prototypeGlobal.initializers[i].toString() == oCallBack.toString())
            return;
    prototypeGlobal.initializers.push(oCallBack);
}
document._runInitializers = function() {
    if (prototypeGlobal.initialized)
        return;
    prototypeGlobal.initialized = true;
    for (var i = 0; i < prototypeGlobal.initializers.length; i++) {
        prototypeGlobal.initializers[i].call(window);
    }
}
document.load = function(oCallBack) {
    if (prototypeGlobal.loaded)
        setTimeout(oCallBack, 0);
    for (var i = 0; i < prototypeGlobal.loaders.length; i++)
        if (prototypeGlobal.loaders[i].toString() == oCallBack.toString())
            return;
    prototypeGlobal.loaders.push(oCallBack);
}
document._runLoaders = function() {
    document._runActivatores();
    if (prototypeGlobal.loaded)
        return;
    prototypeGlobal.loaded = true;
    for (var i = 0; i < prototypeGlobal.loaders.length; i++) {
        prototypeGlobal.loaders[i].call(window);
    }
}
document.active = function(oCallBack) {
    if (prototypeGlobal.activated)
        setTimeout(oCallBack, 0);
    for (var i = 0; i < prototypeGlobal.activators.length; i++)
        if (prototypeGlobal.activators[i].toString() == oCallBack.toString())
            return;
    prototypeGlobal.activators.push(oCallBack);
}
document._runActivatores = function() {
    if (prototypeGlobal.activated) {
        return;
    }
    prototypeGlobal.activated = true;
    for (var i = 0; i < prototypeGlobal.activators.length; i++) {
        prototypeGlobal.activators[i].call(window);
    }
}
document._monitorActivate = function() {
    if (document.styleSheets) {
        var oFontFaceRule = [];
        var oSheets = document.styleSheets;
        for (var s = 0; s < oSheets.length; s++) {
            try {
                var oSheet = oSheets[s];
                var oRules = oSheet.cssRules || oSheet.rules || [];
                for (var r = 0; r < oRules.length; r++) {
                    var oRule = oRules[r];
                    if (oRule.type == 5)
                        oFontFaceRule.push(oRule)
                }
                var oImports = oSheet.imports;
                if (!oImports)
                    continue;
                for (var i = 0; i < oImports.length; i++) {
                    var oImport = oImports[i];
                    var oRules = oImport.cssRules || oImport.rules || [];
                    for (var r = 0; r < oRules.length; r++) {
                        var oRule = oRules[r];
                        if (oRule.type == 5)
                            oFontFaceRule.push(oRule)
                    }
                }
            } catch (e) {}
        }
        var urlPattern = /font-family:\s*("[^"]+"|'[^']+'|\w+)\s*;/ig;
        var oFonts = [];
        for (var i = 0; i < oFontFaceRule.length; i++) {
            var sText = oFontFaceRule[i].cssText;
            var sUrl = urlPattern.exec(sText);
            while (sUrl != null) {
                sUrl = sUrl[1];
                oFonts.push(sUrl);
                sUrl = urlPattern.exec(sText);
            }
        }
        oFonts = oFonts.compact();
        if (oFonts.length == 0) {
            setTimeout(document._runActivatores, 0);
            return;
        }
        var oHiddenElements = [];
        var SAMPLEA = "arial,'URW Gothic L',sans-serif";
        var SAMPLEB = "Georgia,'Century Schoolbook L',serif";
        var oSampleA = createHiddenElement(SAMPLEA);
        var oSampleB = createHiddenElement(SAMPLEB);
        var nSampleA = oSampleA.offsetWidth;
        var nSampleB = oSampleB.offsetWidth;
        for (var i = 0; i < oFonts.length; i++) {
            var oFontSamplerA = createHiddenElement(oFonts[i] + ',' + SAMPLEA);
            var oFontSamplerB = createHiddenElement(oFonts[i] + ',' + SAMPLEB);
            oFonts[i] = {
                font: oFonts[i],
                samplerA: oFontSamplerA,
                samplerB: oFontSamplerB,
                lastSizeA: oFontSamplerA.offsetWidth,
                lastSizeB: oFontSamplerB.offsetWidth
            }
        }
        setTimeout(function() {
            if (prototypeGlobal.activated) {
                clearHiddenElement();
                return;
            }
            var nFontsLoaded = 0;
            for (var i = 0; i < oFonts.length; i++) {
                var oFont = oFonts[i];
                var nCurrentA = oFont.samplerA.offsetWidth;
                var nCurrentB = oFont.samplerB.offsetWidth;
                if ((nSampleA != nCurrentA || nSampleB != nCurrentB) && oFont.lastSizeA == nCurrentA && oFont.lastSizeB == nCurrentB) {
                    nFontsLoaded++;
                } else {
                    oFont.lastSizeA = nCurrentA;
                    oFont.lastSizeB = nCurrentB;
                }
            }
            if (nFontsLoaded == oFonts.length) {
                clearHiddenElement();
                document._runActivatores();
            } else {
                setTimeout(arguments.callee, 25);
            }
        }, 0);
    }

    function clearHiddenElement() {
        for (var i = 0; i < oHiddenElements.length; i++)
            oHiddenElements[i].remove();
    }

    function createHiddenElement(sFonts) {
        var oElement = document.createElement('span');
        oElement.innerText = "BESbswy";
        oElement.style.top = '-999px';
        oElement.style.left = '-999px';
        oElement.style.position = 'absolute';
        oElement.style.fontSize = '300px';
        oElement.style.width = 'auto';
        oElement.style.height = 'auto';
        oElement.style.lineHeight = 'normal';
        oElement.style.margin = '0px';
        oElement.style.padding = '0px';
        oElement.style.fontVariant = 'normal';
        oElement.style.fontWeight = 'normal';
        oElement.style.fontFamily = sFonts;
        document.body.appendChild(oElement);
        oHiddenElements.push(oElement);
        return oElement;
    }
}
document.defer = function(sUrl) {
    prototypeGlobal.defers.push(sUrl);
    if (prototypeGlobal.loaded) {
        var oJS = document.createElement('script');
        oJS.setAttribute('type', 'text/javascript');
        oJS.setAttribute('src', sUrl);
        oHead.appendChild(oJS);
    }
}
document._deferScripts = function() {
    prototypeGlobal.loaded = true;
    var oHead = document.getElementsByTagName('head')[0];
    for (var i = 0; i < prototypeGlobal.defers.length; i++) {
        setTimeout(getLambda(function(sUrl) {
            var oJS = document.createElement('script');
            oJS.setAttribute('type', 'text/javascript');
            oJS.setAttribute('src', sUrl);
            oHead.appendChild(oJS);
        }, prototypeGlobal.defers[i]), 0)
    }
}
document.getCookie = function(sName) {
    sName = sName.toLowerCase();
    var oCrumbles = document.cookie.split(';');
    for (var i = 0; i < oCrumbles.length; i++) {
        var oPair = oCrumbles[i].split('=');
        var sKey = oPair[0].trim().toLowerCase();
        var sValue = oPair.length > 1 ? oPair[1] : '';
        if (sKey == sName)
            return sValue.unescape();
    }
    return '';
}
document.setCookie = function(sName, sValue) {
    var oDate = new Date();
    oDate.setYear(oDate.getFullYear() + 1);
    var sCookie = sName.escape() + '=' + sValue.escape() + ';expires=' + oDate.toGMTString() + ';path=/';
    document.cookie = sCookie;
}
document.clearCookie = function(sName) {
    setCookie(sName, '');
}
document.urlParam = function(sName) {
    var sQuery = window.location.search.substring(1);
    var oVars = sQuery.split('&');
    for (var i = 0; i < oVars.length; i++) {
        var oPair = oVars[i].split('=');
        if (decodeURIComponent(oPair[0]) == sName) {
            return decodeURIComponent(oPair[1]);
        }
    }
}
window.getEvent = function(oEvent) {
    if (window.protoEvent)
        return window.protoEvent;
    if (!oEvent)
        oEvent = window.event;
    if (!oEvent) {
        var oStackEvent = null;
        var oCaller = arguments.callee.caller;
        while (oCaller) {
            var oStackEvent = oCaller.arguments[0];
            if (oStackEvent && oStackEvent.constructor == Event)
                break;
            oCaller = oCaller.caller;
        }
        oEvent = oStackEvent;
    }
    if (oEvent) {
        var oNormalizedEvent = {
            _oEvent: oEvent,
            _bCanceled: false,
            type: oEvent.type || 'onevent',
            button: oEvent.button || 0,
            element: oEvent.target || oEvent.srcElement || (oEvent.touches && oEvent.touches[0].target) || window,
            offsetX: oEvent.offsetX || oEvent.layerX || 0,
            offsetY: oEvent.offsetY || oEvent.layerY || 0,
            related: oEvent.relatedTarget || (oEvent.type == 'mouseover' ? oEvent.fromElement : oEvent.toElement) || window,
            clientX: oEvent.clientX || (oEvent.touches && oEvent.touches[0].clientX) || 0,
            clientY: oEvent.clientY || (oEvent.touches && oEvent.touches[0].clientY) || 0,
            screenX: oEvent.screenX || (oEvent.touches && oEvent.touches[0].screenX) || 0,
            screenY: oEvent.screenY || (oEvent.touches && oEvent.touches[0].screenY) || 0,
            pageX: oEvent.pageX || (oEvent.touches && oEvent.touches[0].pageX) || window.pageXOffset + oEvent.clientX || 0,
            pageY: oEvent.pageY || (oEvent.touches && oEvent.touches[0].pageY) || window.pageYOffset + oEvent.clientY || 0,
            keyCode: oEvent.keyCode || 0,
            charCode: oEvent.charCode || oEvent.keyCode || oEvent.which || 0,
            altKey: oEvent.altKey || false,
            ctrlKey: oEvent.ctrlKey || false,
            shiftKey: oEvent.shiftKey || false,
            metaKey: oEvent.metaKey || oEvent.altKey || oEvent.ctrlKey || oEvent.shiftKey || false,
            source: oEvent.source || null,
            data: oEvent.data || null,
            origin: oEvent.origin || '',
            wheelDelta: oEvent.wheelDelta || 0,
            cancel: function() {
                this._bCanceled = true;
                if (this._oEvent.stopPropagation)
                    this._oEvent.stopPropagation();
                else
                    this._oEvent.cancelBubble = true;
                if (this._oEvent.preventDefault)
                    this._oEvent.preventDefault();
                else
                    this._oEvent.returnValue = false;
                return false;
            }
        };
        if (oNormalizedEvent.element && oNormalizedEvent.element.nodeType === 3) oNormalizedEvent.element = oNormalizedEvent.element.parentNode;
        return oNormalizedEvent;
    }
    return null;
}
Element.prototype.addEvent = window.addEvent = document.addEvent = function(sEvents, oCallback) {
    if (typeof sEvents !== "string" || typeof oCallback !== "function")
        return false;
    var oEvents = sEvents.split(',');
    for (var i = 0; i < oEvents.length; i++)
        HookEvent(this, oEvents[i].trim(), oCallback);

    function HookEvent(oObj, sEvent, oCallback) {
        if (oObj.addEventListener) {
            oObj.addEventListener(sEvent.substr(2), oCallback, false);
        } else if (oObj.attachEvent) {
            if (['SCRIPT', 'LINK'].contains(oObj.tagName) && sEvent == 'onload') {
                if (oObj.readyState && oObj.readyState == 'complete')
                    setTimeout(oCallBack, 0);
                else {
                    var oThat = oObj;
                    oObj.attachEvent("onreadystatechange", function() {
                        if (oThat.readyState === "loaded") {
                            oCallback();
                        }
                    })
                }
            } else if (!oObj.attachEvent(sEvent, oCallback)) {
                var _oOldEvent = oObj[sEvent];
                oObj[sEvent] = function() {
                    if (typeof _oOldEvent == "function")
                        _oOldEvent.call(oObj);
                    else if (_oOldEvent)
                        eval(_oOldEvent);
                    oCallback.call(oObj);
                }
            }
        } else {
            var _oOldEvent = oObj[sEvent];
            oObj[sEvent] = function() {
                if (typeof _oOldEvent == "function")
                    _oOldEvent.call(oObj);
                else if (_oOldEvent)
                    eval(_oOldEvent);
                oCallback.call(oObj);
            }
        }
    }
};
if (!Element.prototype.triggerEvent) {
    Element.prototype.triggerEvent = function(sEvent, bSync) {
        if (!bSync) {
            var oObj = this;
            setTimeout(function() {
                oObj._triggerEvent(sEvent)
            }, 0);
        } else
            return this._triggerEvent(sEvent);
    }
    Element.prototype._triggerEvent = function(sEvent) {
        var bCanceled = false;
        if (document.createEvent) {
            var oEvent = document.createEvent('HTMLEvents');
            oEvent.initEvent(sEvent.substr(2), true, true);
            bCanceled = this.dispatchEvent(oEvent) === false;
            if (typeof this[sEvent] !== "function")
                _bubbleEvent(this, sEvent)
        } else if (document.createEventObject) {
            try {
                var oEvent = document.createEventObject();
                bCanceled = this.fireEvent(sEvent, oEvent) === false;
            } catch (e) {
                _bubbleEvent(this, sEvent)
            }
        } else {
            bCanceled = _bubbleEvent(this, sEvent) === false;
        }
        return !bCanceled;
    }
}

function _bubbleEvent(oObj, sEvent) {
    var oEvent = window.getEvent();
    if (!oEvent)
        window.protoEvent = window.getEvent({
            type: sEvent
        });
    var bCanceled = false;
    for (var oNode = oObj; oNode; oNode = oNode.parentNode) {
        if (typeof oObj[sEvent] == "function")
            oObj[sEvent].call(oObj, oEvent);
        else if (oObj.getAttribute(sEvent)) {
            var oFunction = Function(oObj.getAttribute(sEvent));
            oFunction.call(oObj, oEvent);
        }
        if (window.getEvent()._bCanceled) {
            bCanceled = true;
            break;
        }
    }
    window.protoEvent = null;
    return !bCanceled;
}
if (!Element.prototype.getAttribute)
    Element.prototype.getAttribute = function(sName) {
        if (this[sName])
            return this[sName];
        sName = sName.toUpperCase();
        return this.attributes && this.attributes[sName] ? this.attributes[sName].value : null;
    }
if (!Element.prototype.setAttribute)
    Element.prototype.setAttribute = function(sName, sValue) {
        var sAttName = sName.toUpperCase();
        if (!this.attributes[sAttName]) {
            var oAtt = document.createAttribute(sAttName);
            oAtt.value = sValue;
            oAtt.nodeValue = sValue;
            this.setAttributeNode(oAtt);
        } else {
            this.attributes[sAttName].value = sValue
            this.attributes[sAttName].nodeValue = sValue
        }
        this[sName] = sValue;
    }
if (/Firefox/.test(navigator.userAgent)) {
    HTMLElement.prototype.__defineSetter__("innerText", function(sText) {
        this.textContent = sText;
    });
    HTMLElement.prototype.__defineGetter__("innerText", function() {
        return this.textContent
    });
}
if (!Element.prototype.clearChildS)
    Element.prototype.clearChildS = function() {
        while (this.lastChild)
            this.removeChild(this.lastChild);
    };
if (!Element.prototype.remove)
    Element.prototype.remove = function() {
        if (this.parentNode)
            this.parentNode.removeChild(this);
    };
if (!Element.prototype.replace)
    Element.prototype.replace = function(oNode) {
        return this.parentNode.replaceChild(oNode, this);
    };
if (!Element.prototype.placeBefore)
    Element.prototype.placeBefore = function(oNode) {
        return oNode.parentNode.insertBefore(this, oNode);
    };
if (!Element.prototype.placeAfter)
    Element.prototype.placeAfter = function(oNode) {
        return oNode.parentNode.insertBefore(this, oNode.nextSibling);
    };
if (!Element.prototype.hasClass)
    Element.prototype.hasClass = function(sClass) {
        var oClasses = this.className.split(' ');
        for (var i = 0, l = oClasses.length; i < l; i++)
            if (oClasses[i] == sClass)
                return true;
        return false
    }
if (!Element.prototype.addClass)
    Element.prototype.addClass = function(sClass) {
        if (!this.hasClass(sClass))
            this.className += " " + sClass;
    }
if (!Element.prototype.removeClass)
    Element.prototype.removeClass = function(sClass) {
        var oClasses = this.className.split(' ');
        var oResult = [];
        for (var i = 0, l = oClasses.length; i < l; i++)
            if (oClasses[i] != sClass)
                oResult.push(oClasses[i]);
        this.className = oResult.join(' ');
    }
if (!Element.prototype.getChildren)
    Element.prototype.getChildren = function() {
        var oResult = [];
        for (var i = 0, l = this.childNodes.length; i < l; i++)
            if (this.childNodes[i].nodeType == 1)
                oResult.push(this.childNodes[i]);
        return oResult;
    }
if (!NodeList.prototype.forEach)
    NodeList.prototype.forEach = HTMLCollection.prototype.forEach = Array.prototype.forEach;
if (/Firefox/.test(navigator.userAgent)) {
    Element.prototype.__defineGetter__("outerHTML", function() {
        var oOut = [];
        oOut.push("<");
        oOut.push(this.tagName);
        for (var i = 0; i < this.attributes.length; i++)
            if (this.attributes[i].specified)
                oOut.push(' {0}="{1}"'.format(this.attributes[i].name, this.attributes[i].value));
        if (!this.canHaveChildren) {
            oOut.push("/>");
            return oOut.join('');
        }
        oOut.push(">{0}</{1}>", this.innerHTML, this.tagName);
        return oOut.join('');
    });
    Element.prototype.__defineSetter__("outerHTML", function(sHtml) {
        var sTextRange = this.ownerDocument.createRange();
        sTextRange.setStartBefore(this);
        var oFragment = sTextRange.createContextualFragment(sHtml);
        this.parentNode.replaceChild(oFragment, this);
        return sHtml;
    });
    Element.prototype.__defineGetter__("canHaveChildren", function() {
        return !/^(area|base|basefont|col|frame|hr|img|br|input|isindex|link|meta|param)$/i.test(this.tagName);
    });
}
if (!document.getElementsByClassName)
    document.getElementsByClassName = Element.prototype.getElementsByClassName = function(sClass) {
        var oReturn = [];
        var oNodes = this.getElementsByTagName('*')
        for (var i = 0, l = oNodes.length; i < l; i++)
            if (oNodes[i].hasClass(sClass))
                oReturn.push(oNodes[i]);
        return oReturn;
    }
window.openDialog = function(sUrl, oCallback, nSugestedWidth, nSugestedHeight) {
    if (typeof oCallback != "function") {
        nSugestedHeight = nSugestedWidth;
        nSugestedWidth = oCallback;
        oCallback = null;
    }
    var _ResizeDialog = function(oFrame) {
        oFrame.focus()
        if (nSugestedWidth && nSugestedHeight) {
            var nTargetHeight = nSugestedHeight;
            var nTargetWidth = nSugestedWidth;
        } else {
            var nTargetHeight = window.screen.height
            var nTargetWidth = window.screen.width;
        }
        try {
            oFrameDoc = (oFrame.contentDocument) ? oFrame.contentDocument : oFrame.contentWindow.document;
            var nTargetHeight = Math.max(oFrameDoc.body.scrollHeight, oFrameDoc.body.offsetHeight, oFrameDoc.documentElement.clientHeight, oFrameDoc.documentElement.scrollHeight, oFrameDoc.documentElement.offsetHeight);
            var nTargetWidth = Math.max(oFrameDoc.body.scrollWidth, oFrameDoc.body.offsetWidth, oFrameDoc.documentElement.clientWidth, oFrameDoc.documentElement.scrollWidth, oFrameDoc.documentElement.offsetWidth);
        } catch (e) {}
        oLoading.remove();
        var oWindowSize = window.getViewportRect();
        var nLimitHeight = oWindowSize.height - 100;
        var nLimitWidth = oWindowSize.width - 100;
        if (nTargetHeight > nLimitHeight) {
            oFrame.scrolling = 'yes';
            oFrame.style.overflowY = 'auto';
            nTargetWidth += 20;
        }
        if (nTargetWidth > nLimitWidth) {
            oFrame.scrolling = 'yes';
            oFrame.style.overflowY = 'auto';
            nTargetHeight += 20;
        }
        if (nLimitWidth < nTargetWidth && nLimitHeight < nTargetHeight) {
            oFrame.scrolling = 'yes';
        }
        nTargetWidth = Math.min(nTargetWidth, nLimitWidth);
        nTargetHeight = Math.min(nTargetHeight, nLimitHeight);

        function _AnimateSize(oElement, nTargetWidth, nTargetHeight) {
            var nWidth = parseInt(oElement.offsetWidth);
            var nHeight = parseInt(oElement.offsetHeight);
            var nDifW = nTargetWidth - nWidth;
            var nDifH = nTargetHeight - nHeight;
            if (nDifW < 2)
                var nNextW = nTargetWidth;
            else
                var nNextW = nWidth + (nDifW / 2);
            if (nDifH < 2)
                var nNextH = nTargetHeight;
            else
                var nNextH = nHeight + (nDifH / 2);
            oElement.style.height = nNextH + 'px';
            oElement.style.width = nNextW + 'px';
            if (nNextW != nTargetWidth || nNextH != nTargetHeight)
                setTimeout(function() {
                    _AnimateSize(oElement, nTargetWidth, nTargetHeight);
                }, 50);
        }
        _AnimateSize(oFrame, nTargetWidth, nTargetHeight);
    }
    var oTopWindow = self.prototypeGlobal.topWindow;
    var oTopDoc = oTopWindow.document;
    var oBlack = oTopDoc.createElement('DIV');
    oBlack.className = 'prototype_blackScreen';
    var oContent = oTopDoc.createElement('DIV');
    oContent.className = 'prototype_centerer_full';
    oContent.addEvent('onclick', function() {
        window.closeDialog(false);
    });
    var oTable = oContent.appendChild(oTopDoc.createElement('TABLE'))
    oTable.className = 'prototype_dialogTable'
    oTable.align = 'center';
    oBody = oTable.appendChild(oTopDoc.createElement('TBODY'))
    oTr = oBody.appendChild(oTopDoc.createElement('TR'))
    oTd = oTr.appendChild(oTopDoc.createElement('TD'))
    oTd.align = 'right';
    oClose = oTd.appendChild(oTopDoc.createElement('SPAN'))
    oClose.className = 'prototype_dialogClose';
    oClose.innerHTML = '&times;';
    oClose.addEvent('onclick', function() {
        window.closeDialog(false);
    });
    oTr = oBody.appendChild(oTopDoc.createElement('TR'))
    oTd = oTr.appendChild(oTopDoc.createElement('TD'))
    oTd.className = 'prototype_dialogBox';
    oLoading = oTd.appendChild(oTopDoc.createElement('IMG'))
    oLoading.src = '/sys/resources/loading.gif'
    oFrame = oTd.appendChild(oTopDoc.createElement('IFRAME'))
    oFrame.className = 'prototype_dialogFrame';
    oFrame.frameBorder = 0;
    oFrame.border = 0;
    oFrame.addEvent('onload', function() {
        _ResizeDialog(oFrame)
    });
    oFrame.src = sUrl;
    oTopDoc.body.appendChild(oBlack);
    oTopDoc.body.appendChild(oContent);
    var oDiag = {};
    oDiag.resize = function() {
        _ResizeDialog(oFrame)
    };
    oDiag.black = oBlack;
    oDiag.content = oContent;
    oDiag.callback = oCallback;
    self.prototypeGlobal.topWindow.prototypeGlobal.dialogs.push(oDiag);
}
window.openDialogFull = function(sUrl, oCallback, nSugestedWidth, nSugestedHeight) {
    if (typeof oCallback != "function") {
        nSugestedHeight = nSugestedWidth;
        nSugestedWidth = oCallback;
        oCallback = null;
    }
    var _ResizeDialog = function(oFrame) {
        oFrame.focus()
        var nTargetHeight = window.screen.height + 20
        var nTargetWidth = window.screen.width - 50;
        try {
            oFrameDoc = (oFrame.contentDocument) ? oFrame.contentDocument : oFrame.contentWindow.document;
            var nTargetHeight = Math.max(oFrameDoc.body.scrollHeight, oFrameDoc.body.offsetHeight, oFrameDoc.documentElement.clientHeight, oFrameDoc.documentElement.scrollHeight, oFrameDoc.documentElement.offsetHeight);
            var nTargetWidth = Math.max(oFrameDoc.body.scrollWidth, oFrameDoc.body.offsetWidth, oFrameDoc.documentElement.clientWidth, oFrameDoc.documentElement.scrollWidth, oFrameDoc.documentElement.offsetWidth);
        } catch (e) {}
        oLoading.remove();
        var oWindowSize = window.getViewportRect();
        var nLimitHeight = oWindowSize.height;
        var nLimitWidth = oWindowSize.width;
        if (nTargetHeight > nLimitHeight) {
            oFrame.scrolling = 'yes';
            oFrame.style.overflowY = 'auto';
            nTargetWidth += 20;
        }
        if (nTargetWidth > nLimitWidth) {
            oFrame.scrolling = 'yes';
            oFrame.style.overflowY = 'auto';
            nTargetHeight += 20;
        }
        if (nLimitWidth < nTargetWidth && nLimitHeight < nTargetHeight)
            oFrame.scrolling = 'no';
        nTargetWidth = Math.min(nTargetWidth, nLimitWidth);
        nTargetHeight = Math.min(nTargetHeight, nLimitHeight);

        function _AnimateSize(oElement, nTargetWidth, nTargetHeight) {
            var nWidth = parseInt(oElement.offsetWidth);
            var nHeight = parseInt(oElement.offsetHeight);
            var nDifW = nTargetWidth - nWidth;
            var nDifH = nTargetHeight - nHeight;
            console.log(nDifW);
            if (nDifW < 2)
                var nNextW = nTargetWidth;
            else
                var nNextW = nWidth + (nDifW / 2);
            if (nDifH < 2)
                var nNextH = nTargetHeight;
            else
                var nNextH = nHeight + (nDifH / 2);
            oElement.style.height = nNextH + 'px';
            oElement.style.width = nNextW + 'px';
            document.getElementById('prototype_dialogTable').style.marginLeft = -(nTargetWidth * 0.5) + "px";
            document.getElementById('prototype_dialogTable').style.marginTop = -(nTargetHeight * 0.5) - 10 + "px";
            document.getElementById('prototype_dialogClose').style.marginLeft = (nTargetWidth * 0.5) - 35 + "px";
            if (nNextW != nTargetWidth || nNextH != nTargetHeight) {
                setTimeout(function() {
                    _AnimateSize(oElement, nTargetWidth, nTargetHeight);
                }, 50);
            }
        }
        _AnimateSize(oFrame, nTargetWidth, nTargetHeight);
    }
    var oTopWindow = self.prototypeGlobal.topWindow;
    var oTopDoc = oTopWindow.document;
    var oBlack = oTopDoc.createElement('DIV');
    oBlack.className = 'prototype_blackScreen';
    var oContent = oTopDoc.createElement('DIV');
    oContent.className = 'prototype_centerer_full';
    oContent.addEvent('onclick', function() {
        window.closeDialog(false);
    });
    var oTable = oContent.appendChild(oTopDoc.createElement('TABLE'))
    oTable.id = 'prototype_dialogTable';
    oTable.align = 'center';
    oBody = oTable.appendChild(oTopDoc.createElement('TBODY'))
    oTr = oBody.appendChild(oTopDoc.createElement('TR'))
    oTd = oTr.appendChild(oTopDoc.createElement('TD'))
    oClose = oTd.appendChild(oTopDoc.createElement('SPAN'))
    oClose.id = 'prototype_dialogClose';
    oClose.innerHTML = '&times;';
    oClose.addEvent('onclick', function() {
        window.closeDialog(false);
    });
    oTd.className = 'prototype_dialogBox';
    oLoading = oTd.appendChild(oTopDoc.createElement('IMG'))
    oLoading.src = '/sys/resources/loading.gif'
    oFrame = oTd.appendChild(oTopDoc.createElement('IFRAME'))
    oFrame.className = 'prototype_dialogFrame';
    oFrame.frameBorder = 0;
    oFrame.border = 0;
    oFrame.addEvent('onload', function() {
        _ResizeDialog(oFrame)
    });
    oFrame.src = sUrl;
    oTopDoc.body.appendChild(oBlack);
    oTopDoc.body.appendChild(oContent);
    var oDiag = {};
    oDiag.resize = function() {
        _ResizeDialog(oFrame)
    };
    oDiag.black = oBlack;
    oDiag.content = oContent;
    oDiag.callback = oCallback;
    self.prototypeGlobal.topWindow.prototypeGlobal.dialogs.push(oDiag);
}
window.closeDialog = function(oReturn) {
    if (self.prototypeGlobal.topWindow.prototypeGlobal.dialogs.length == 0)
        return;
    var oDiag = self.prototypeGlobal.topWindow.prototypeGlobal.dialogs.pop();
    oDiag.black.remove();
    oDiag.content.remove();
    if (oDiag.callback)
        oDiag.callback(oReturn);
    window.getEvent().cancel();
}
window.resizeDialog = function(oReturn) {
    var nCount = self.prototypeGlobal.topWindow.prototypeGlobal.dialogs.length;
    if (nCount == 0)
        return;
    var oDiag = self.prototypeGlobal.topWindow.prototypeGlobal.dialogs[nCount - 1];
    oDiag.resize();
    window.getEvent().cancel();
}
document.extend = function(sSelector, oInitializer, oCallback) {
    if (!oCallback) {
        oCallback = oInitializer;
        oInitializer = null;
    }
    for (var s = 0; s < prototypeGlobal.extenders.length; s++) {
        var oPrevious = prototypeGlobal.extenders[s].callback;
        if (oPrevious.toString() == oCallback.toString())
            return;
    }
    prototypeGlobal.extenders.push({
        'selector': document._parseQuery(sSelector),
        'callback': oCallback,
        'initializer': oInitializer,
        'initialized': false
    })
    if (prototypeGlobal.initialized)
        document._triggerExtenders();
}
document._applyExtenders = function() {
    for (var s = 0; s < prototypeGlobal.extenders.length; s++) {
        var oExtender = prototypeGlobal.extenders[s];
        var oInitializer = oExtender.initializer;
        var bInitialized = oExtender.initialized;
        var oSelector = oExtender.selector;
        var oCallback = oExtender.callback;
        if (oInitializer && !bInitialized) {
            oInitializer.call(window, oSelector)
            oExtender.initialized = true;
        }
        var oColl = document.query(oSelector);
        var nLen = oColl.length;
        for (var i = 0; i < nLen; i++) {
            var oNode = oColl[i];
            if (oNode.extensions) {
                if (oNode.extensions.contains(oCallback))
                    continue;
                else
                    oNode.extensions.push(oCallback);
            } else
                oNode.extensions = [oCallback];
            oCallback.call(oNode, oNode);
        }
    }
}
document._triggerExtenders = function() {
    clearTimeout(prototypeGlobal.extendersTimer);
    prototypeGlobal.extendersTimer = setTimeout(document._applyExtenders, 0);
}
ElementappendChild = Element.prototype.appendChild
Element.prototype.appendChild = function(child) {
    var oNode = ElementappendChild.call(this, child);
    document._triggerExtenders();
    return oNode;
}
ElementinsertBefore = Element.prototype.insertBefore
Element.prototype.insertBefore = function(newElement, referenceElement) {
    var oNode = ElementinsertBefore.call(this, newElement, referenceElement);
    document._triggerExtenders();
    return oNode;
}
ElementreplaceChild = Element.prototype.replaceChild
Element.prototype.replaceChild = function(newChild, oldChild) {
    var oNode = ElementreplaceChild.call(this, newChild, oldChild);;
    document._triggerExtenders();
    return oNode;
}
if (!Element.prototype.getElementById)
    Element.prototype.getElementById = function(id) {
        var oMatches = [];
        oElements = this.getElementsByTagName("*");
        if (oElements.length == 0)
            return oMatches;
        for (var i = 0; i < oElements.length; i++)
            if (oElements[i].id == id)
                oMatches.push(oElements[i]);
        return oMatches;
    };
if (!Element.prototype.getElementByName)
    Element.prototype.getElementsByName = function(name) {
        var oMatches = [];
        oElements = this.getElementsByTagName("*");
        if (oElements.length == 0)
            return oMatches;
        for (var i = 0; i < oElements.length; i++)
            if (oElements[i].name == name)
                oMatches.push(oElements[i]);
        return oMatches;
    };
if (!Element.prototype.getComputedStyle)
    Element.prototype.getComputedStyle = function(sProperty) {
        function _ensureCamel(sName) {
            return sName.replace(/-([a-z])/g, function(oMatch) {
                return oMatch[1].toUpperCase()
            });
        }
        if (window.getComputedStyle)
            return window.getComputedStyle(this).getPropertyValue(sProperty);
        else {
            if (document.defaultView && document.defaultView.getComputedStyle)
                return document.defaultView.getComputedStyle(this).getPropertyValue(sProperty);
            else {
                if (this.currentStyle)
                    return this.currentStyle[_ensureCamel(sProperty)];
                else
                    return this.style[_ensureCamel(sProperty)];
            }
        }
    }
if (!Element.prototype.getRect)
    Element.prototype.getRect = function() {
        var oHiddenHierarchy = [];
        if (this.offsetHeight == 0 && this.offsetWidth == 0)
            for (var oPar = this; oPar.parentNode; oPar = oPar.parentNode)
                if (oPar.offsetHeight == 0 && oPar.offsetWidth == 0 && oPar.getComputedStyle('display') == 'none') {
                    oHiddenHierarchy.push(oPar);
                    oPar.oldInlineDisplay = oPar.style.display;
                    oPar.style.display = '';
                }
        var oRect = this.getBoundingClientRect();
        var nClientTop = document.documentElement.clientTop || document.body.clientTop || 0;
        var nClientLeft = document.documentElement.clientLeft || document.body.clientLeft || 0;
        var nScrollTop = (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop);
        var nScrollLeft = (window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft);
        for (var i = 0, l = oHiddenHierarchy.length; i < l; i++)
            oHiddenHierarchy[i].style.display = oHiddenHierarchy[i].oldInlineDisplay;
        nTop = oRect.top + nScrollTop - nClientTop;
        nLeft = oRect.left + nScrollLeft - nClientLeft;
        nHeight = oRect.bottom - oRect.top;
        nWidth = oRect.right - oRect.left;
        return new Rect(nLeft, nTop, nWidth, nHeight);
    }
if (!Element.prototype.getOffsetRect)
    Element.prototype.getOffsetRect = function() {
        var oHiddenHierarchy = [];
        if (this.offsetHeight == 0 && this.offsetWidth == 0)
            for (var oPar = this; oPar.parentNode; oPar = oPar.parentNode)
                if (oPar.offsetHeight == 0 && oPar.offsetWidth == 0 && oPar.getComputedStyle('display') == 'none') {
                    oHiddenHierarchy.push(oPar);
                    oPar.oldInlineDisplay = oPar.style.display;
                    oPar.style.display = '';
                }
        nTop = this.offsetTop;
        nLeft = this.offsetLeft;
        nHeight = this.offsetHeight;
        nWidth = this.offsetWidth;
        for (var i = 0, l = oHiddenHierarchy.length; i < l; i++)
            oHiddenHierarchy[i].style.display = oHiddenHierarchy[i].oldInlineDisplay;
        return new Rect(nLeft, nTop, nWidth, nHeight);
    }
if (!Element.prototype.getClientSize)
    Element.prototype.getClientSize = function() {
        var oHiddenHierarchy = [];
        if (this.offsetHeight == 0 && this.offsetWidth == 0)
            for (var oPar = this; oPar.parentNode; oPar = oPar.parentNode)
                if (oPar.offsetHeight == 0 && oPar.offsetWidth == 0 && oPar.getComputedStyle('display') == 'none') {
                    oHiddenHierarchy.push(oPar);
                    oPar.oldInlineDisplay = oPar.style.display;
                    oPar.style.display = '';
                }
        nHeight = this.clientHeight;
        nWidth = this.clientWidth;
        for (var i = 0, l = oHiddenHierarchy.length; i < l; i++)
            oHiddenHierarchy[i].style.display = oHiddenHierarchy[i].oldInlineDisplay;
        return new Rect(0, 0, nWidth, nHeight);
    }
if (!document.getRect)
    document.getRect = function() {
        var nHeight = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);
        var nWidth = Math.max(document.body.scrollWidth, document.body.offsetWidth, document.documentElement.clientWidth, document.documentElement.scrollWidth, document.documentElement.offsetWidth);
        return new Rect(0, 0, nWidth, nHeight);
    }
if (!window.getViewportRect)
    document.getViewportRect = window.getViewportRect = function() {
        var nClientTop = (document.documentElement && document.documentElement.clientTop) || (document.body && document.body.clientTop) || 0;
        var nClientLeft = (document.documentElement && document.documentElement.clientLeft) || (document.body && document.body.clientLeft) || 0;
        var nScrollTop = (window.pageYOffset || document.documentElement.scrollTop || (document.body && document.body.scrollTop));
        var nScrollLeft = (window.pageXOffset || document.documentElement.scrollLeft || (document.body && document.body.scrollLeft));
        if (typeof window.innerWidth != 'undefined') {
            var nWidth = window.innerWidth;
            var nHeight = window.innerHeight;
        } else {
            var nWidth = (document.body && document.body.clientWidth) || 0;
            var nHeight = (document.body && document.body.clientHeight) || 0;
        }
        nTop = nScrollTop - nClientTop;
        nLeft = nScrollLeft - nClientLeft;
        return new Rect(nLeft, nTop, nWidth, nHeight);
    }
window.showTooltip = function(oElement, sMessage, bError, nDelay) {
    if (!oElement)
        throw 'Element is null';
    if (!oElement.protoTooltip) {
        sMessage = sMessage || oElement.getAttribute('title');
        if (!sMessage)
            throw 'Message is empty';
        oElement.protoTooltip = document.createElement('SPAN');
        var oTooltip = oElement.protoTooltip;
        oTooltip.forElement = oElement;
        oTooltip.className = 'prototype_tooltip';
        oTooltip.innerHTML = sMessage;
        oTooltip.arrow = document.createElement('SPAN');
        oTooltip.arrow.className = 'prototype_tooltipDownArrow';
        document.body.appendChild(oTooltip);
        document.body.appendChild(oTooltip.arrow);
        oElementRect = oElement.getRect();
        var tY = (oElementRect.top - (oTooltip.offsetHeight + 10))
        var aY = (oElementRect.top - (11))
        if (tY < 0) {
            oTooltip.arrow.className = 'prototype_tooltipUpArrow';
            tY = oElementRect.bottom + 10;
            aY = oElementRect.bottom + 1;
        }
        oTooltip.style.top = tY + 'px';
        oTooltip.style.left = (oElementRect.left) + 'px';
        oTooltip.arrow.style.top = aY + 'px';
        oTooltip.arrow.style.left = (oElementRect.left + 10) + 'px';
        if (bError)
            oTooltip.style.color = '#C80000';
        oTooltip.addEvent('onclick', function() {
            clearTimeout(oTooltip.timer);
            if (window.currentToolTip) {
                window.currentToolTip.forElement.protoTooltip = null;
                window.currentToolTip = null;
                oTooltip.arrow.remove();
                oTooltip.remove();
            }
        });
    } else {
        var oTooltip = oElement.protoTooltip;
        oTooltip.style.opacity = 1;
        oTooltip.style.MozOpacity = 1;
        oTooltip.style.filter = 'alpha(opacity=100)';
        oTooltip.arrow.style.opacity = 1;
        oTooltip.arrow.style.MozOpacity = 1;
        oTooltip.arrow.style.filter = 'alpha(opacity=100)';
        clearTimeout(oTooltip.timer);
    }
    if (window.currentToolTip && window.currentToolTip != oTooltip) {
        window.currentToolTip.forElement.protoTooltip = null;
        window.currentToolTip.arrow.remove();
        window.currentToolTip.remove();
    }
    window.currentToolTip = oTooltip;
    nDelay = nDelay || 2000;
    oTooltip.opacity = 100;
    oTooltip.timer = window.setTimeout(function() {
        oTooltip.opacity -= 5;
        oTooltip.style.opacity = (oTooltip.opacity / 100);
        oTooltip.style.MozOpacity = oTooltip.style.opacity;
        oTooltip.style.filter = 'alpha(opacity=' + oTooltip.opacity + ')';
        oTooltip.arrow.style.opacity = (oTooltip.opacity / 100);
        oTooltip.arrow.style.MozOpacity = oTooltip.style.opacity;
        oTooltip.arrow.style.filter = 'alpha(opacity=' + oTooltip.opacity + ')';
        if (oTooltip.opacity > 0)
            oTooltip.timer = setTimeout(arguments.callee, 50);
        else {
            oElement.protoTooltip = null;
            oTooltip.arrow.remove();
            oTooltip.remove();
        }
    }, nDelay)
}
window.post = function(sUrl, oPost, oCallback) {
    if (typeof oPost == "function") {
        oCallback = oPost;
        oPost = '';
    } else if (typeof oPost != "string") {
        var oParams = [];
        for (sName in oPost)
            oParams.push(sName.toString().escape() + '=' + oPost[sName].toString().escape());
        oPost = oParams.join('&');
    }
    if (typeof XMLHttpRequest != "undefined")
        var oXmlHttp = new XMLHttpRequest();
    else {
        var aProgID = ["MSXML2.XMLHttp.5.0", "MSXML2.XMLHttp.4.0", "MSXML2.XMLHttp.3.0", "MSXML2.XMLHTTP", "Microsoft.XMLHTTP"];
        for (var i = 0; i < aProgID.length; i++)
            try {
                var oXmlHttp = new ActiveXObject(aProgID[i]);
                break;
            } catch (ex) {}
    }
    if (!oXmlHttp)
        throw 'Your browser does not support asynchronous requests';
    oXmlHttp.open('POST', sUrl, true);
    oXmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    oXmlHttp.onreadystatechange = function() {
        if (oXmlHttp.readyState == 4) {
            oXmlHttp.onreadystatechange = function() {};
            if (oCallback)
                oCallback.apply(oXmlHttp);
        }
    };
    oXmlHttp.send(oPost || '');
}
Element.prototype.query = document.query = function(oQuery) {
    {
        if (typeof(oQuery) == 'string')
            oQuery = document._parseQuery(oQuery);
        var oReturn = [];
        for (var i = 0, l = oQuery.length; i < l; i++)
            oReturn = oReturn.concat(getQueryResult(this, oQuery[i]));
        return oReturn.compact();
    }

    function ensureArray(oNodeList) {
        if (oNodeList instanceof Array)
            return oNodeList;
        var oArray = [],
            nLen = oNodeList.length >>> 0;
        for (var i = 0; i < nLen; i++)
            oArray.push(oNodeList[i]);
        return oArray;
    }

    function getQueryResult(oRoot, oQuery) {
        var oLevel = [oRoot];
        for (var i = 0, l = oQuery.length; i < l; i++)
            oLevel = moveDownLevel(oQuery[i], oLevel);
        return oLevel;
    }

    function moveDownLevel(oQuery, oParents) {
        var oChilds = [];
        for (var i = 0, l = oParents.length; i < l; i++)
            oChilds = oChilds.concat(findChilds(oQuery, oParents[i]));
        return oChilds;
    }

    function findChilds(oCriteria, oParent) {
        var oFiltering = [];
        var bFilteringEmpty = true;
        if (oCriteria.relation == 'child') {
            oFiltering = (oParent.getChildren());
            bFilteringEmpty = false;
        } else if (oCriteria.relation == 'sibling') {
            var oObj = oParent;
            do {
                oObj = oObj.nextSibling;
            } while (oObj && oObj.nodeType != 1);
            if (oObj) oFiltering.push(oObj);
            bFilteringEmpty = false;
        }
        if (oCriteria.id) {
            if (bFilteringEmpty) {
                var oObj = oParent.getElementById(oCriteria.id);
                if (oObj)
                    oFiltering.push(oObj);
            } else if (oFiltering.length > 0) {
                var oFiltered = [];
                for (var i = 0, l = oFiltering.length; i < l; i++)
                    if (oFiltering[i].id == oCriteria.id)
                        oFiltered.push(oFiltering[i])
                oFiltering = oFiltered
            }
            bFilteringEmpty = false;
        }
        if (oCriteria.tag) {
            if (bFilteringEmpty)
                oFiltering = (oParent.getElementsByTagName(oCriteria.tag));
            else if (oFiltering.length > 0) {
                var oFiltered = [];
                for (var i = 0, l = oFiltering.length; i < l; i++)
                    if (oFiltering[i].tagName == oCriteria.tag)
                        oFiltered.push(oFiltering[i])
                oFiltering = oFiltered
            }
            bFilteringEmpty = false;
        }
        if (oCriteria.cssClass) {
            if (bFilteringEmpty)
                oFiltering = (oParent.getElementsByClassName(oCriteria.cssClass));
            else if (oFiltering.length > 0) {
                var oFiltered = [];
                for (var i = 0, l = oFiltering.length; i < l; i++)
                    if (oFiltering[i].hasClass(oCriteria.cssClass))
                        oFiltered.push(oFiltering[i])
                oFiltering = oFiltered
            }
            bFilteringEmpty = false;
        }
        if (oCriteria.attributes.length > 0) {
            if (bFilteringEmpty)
                oFiltering = (oParent.getElementsByTagName("*"));
            for (var a = 0, al = oCriteria.attributes.length; a < al; a++) {
                var oAtt = oCriteria.attributes[a];
                var oFiltered = [];
                for (var i = 0, l = oFiltering.length; i < l; i++) {
                    if (oAtt.operator) {
                        if (!oFiltering[i].hasAttribute(oAtt.name))
                            continue;
                        var sValue = oFiltering[i].getAttribute(oAtt.name) || '';
                        switch (oAtt.operator) {
                            case '=':
                                if (sValue == oAtt.value)
                                    oFiltered.push(oFiltering[i])
                                break;
                            case '^':
                                if (sValue.indexOf(oAtt.value) == 0)
                                    oFiltered.push(oFiltering[i])
                                break;
                            case '$':
                                if (sValue.indexOf(oAtt.value) == sValue.length - oAtt.value.length)
                                    oFiltered.push(oFiltering[i])
                                break;
                            case '*':
                                if (sValue.indexOf(oAtt.value) >= 0)
                                    oFiltered.push(oFiltering[i])
                                break;
                        }
                    } else if (oFiltering[i].hasAttribute(oAtt.name))
                        oFiltered.push(oFiltering[i])
                }
                oFiltering = oFiltered
            }
        }
        return ensureArray(oFiltering);
    }
}
document._parseQuery = function(sQuery) {
    sQuery = sQuery.trim();
    var oQuery = [];
    var oQueryRX = (/([ ,>+])*\s*([a-zA-Z*]*)(([\.#][a-zA-Z0-9_-]+)*)((\[\w+([$^\*]?=((\w+)|((['"])[^"']*\11)))?\])*)/g);
    var oMatch = null;
    while ((oMatch = oQueryRX.exec(sQuery)) != null) {
        if (oMatch[0].trim() == '')
            break;
        var sRelation = oMatch[1];
        var sTag = oMatch[2];
        sTag = sTag && sTag.toUpperCase();
        var sIdentifiers = oMatch[3];
        var sAttributes = oMatch[5];
        if (sIdentifiers) {
            var sClass = (/([\.][a-zA-Z0-9_-]+)/).exec(sIdentifiers);
            var sID = (/([#][a-zA-Z0-9_-]+)/).exec(sIdentifiers);
            sClass = sClass && sClass[0].substr(1);
            sID = sID && sID[0].substr(1);
        }
        var oAttributes = [];
        if (sAttributes) {
            var oRX = /\[(\w+)(([\$\^\*]?=)((\w+)|((['"])[^"']*\7)))?\]/g;
            while ((oMatch = oRX.exec(sAttributes)) != null) {
                var sName = oMatch[1];
                var sOperator = oMatch[3];
                if (sOperator && sOperator.length > 1)
                    sOperator = sOperator.substr(0, 1);
                var sValue = oMatch[4];
                sValue = sValue && sValue.replace(/(^["']*)|(["']*$)/g, '');
                oAttributes.push({
                    'name': sName,
                    'value': sValue,
                    'operator': sOperator
                });
            }
        }
        if (!sRelation || sRelation == ',') {
            oQuery.push([]);
            sRelation = 'descendante';
        } else if (sRelation == ' ')
            sRelation = 'descendante';
        else if (sRelation == '>')
            sRelation = 'child';
        else if (sRelation == '+')
            sRelation = 'sibling';
        var oCriteria = {
            'relation': sRelation,
            'tag': sTag,
            'id': sID,
            'cssClass': sClass,
            'attributes': oAttributes
        }
        if (oQuery.length == 0)
            throw 'Invalid selector : ' + sQuery;
        oQuery[oQuery.length - 1].push(oCriteria);
    }
    if (oQuery.length == 0)
        throw 'Invalid selector : ' + sQuery;
    return oQuery;
}
if (!document.styles) {
    document.styles = {};
    document.styles.protoloadedcss = [];
    document.styles.protocssfile = null;
    document.styles.selectorExists = function(sExpression) {
        sExpression = sExpression.trim().replace(/\s+/, ' ');
        if (document.styleSheets) {
            var oSheets = document.styleSheets;
            for (var s = 0; s < oSheets.length; s++) {
                try {
                    var oSheet = oSheets[s];
                    var oRules = oSheet.cssRules || oSheet.rules || [];
                    for (var r = 0; r < oRules.length; r++) {
                        var oRule = oRules[r];
                        var sSelector = oRule.selectorText.trim().replace(/\s+/, ' ');;
                        var oSelectors = sSelector.split(',')
                        for (var c = 0; c < oSelectors.length; c++)
                            if (oSelectors[c].trim() == sExpression)
                                return true;
                    }
                    var oImports = oSheet.imports;
                    if (!oImports)
                        continue;
                    for (var i = 0; i < oImports.length; i++) {
                        var oImport = oImports[i];
                        var oRules = oImport.cssRules || oImport.rules || [];
                        for (var r = 0; r < oRules.length; r++) {
                            var oRule = oRules[r];
                            var sSelector = oRule.selectorText.trim().replace(/\s+/, ' ');;
                            var oSelectors = sSelector.split(',')
                            for (var c = 0; c < oSelectors.length; c++)
                                if (oSelectors[c].trim() == sExpression)
                                    return true;
                        }
                    }
                } catch (e) {}
            }
        }
        return false;
    }
    document.styles.addSelector = function(sSelector, sStyle) {
        if (!document.styleSheets)
            return;
        if (document.getElementsByTagName("head").length == 0)
            return;
        if (!document.styles.protocssfile) {
            var oSheet = document.createElement("style");
            oSheet.type = "text/css";
            document.getElementsByTagName("head")[0].appendChild(oSheet);
            document.styles.protocssfile = document.styleSheets[document.styleSheets.length - 1];
        }
        if (document.styles.protocssfile.addRule)
            document.styles.protocssfile.addRule(sSelector, sStyle);
        else
            document.styles.protocssfile.insertRule(sSelector + "{" + sStyle + "}", 0);
    }
    document.styles.loadCSS = function(sUrl) {
        if (document.styles.protoloadedcss.contains(sUrl))
            return;
        var oHead = document.getElementsByTagName('head')[0];
        var oLink = document.createElement('link');
        oLink.rel = 'stylesheet';
        oLink.type = 'text/css';
        oLink.href = sUrl + '?' + +new Date().getTime();
        oLink.media = 'all';
        oHead.appendChild(oLink);
        document.styles.protoloadedcss.push(sUrl);
    }
    document.styles.addCSS = function(sStyle) {
        if (!document.styleSheets)
            return;
        if (document.getElementsByTagName("head").length == 0)
            return;
        var oSheet = document.createElement("style");
        oSheet.type = "text/css";
        if (oSheet.textContent)
            oSheet.textContent = sStyle;
        else if (oSheet.styleSheet)
            oSheet.styleSheet.cssText = sStyle;
        else
            oSheet.innerText = sStyle;
        document.getElementsByTagName("head")[0].appendChild(oSheet);
    }
}
if (document.addEventListener) {
    document.addEventListener("DOMContentLoaded", document._runInitializers, false);
} else if (document.attachEvent) {
    if (document.readyState && document.readyState == 'complete')
        setTimeout(document._runInitializers, 0);
    else
        document.attachEvent("onreadystatechange", function() {
            if (document.readyState === "complete") {
                document._runInitializers();
            }
        })
} else {
    var oOldLoad = window.onload;
    window.onload = function() {
        if (oOldLoad) oOldLoad();
        document._runInitializers();
    }
}
if (window.addEventListener)
    window.addEventListener('load', document._runLoaders, false);
else if (window.attachEvent)
    window.attachEvent('onload', document._runLoaders)
else {
    var _oOldWindowOnloadEvent = window['onload'];
    window['onload'] = function() {
        if (typeof _oOldWindowOnloadEvent == "function")
            _oOldWindowOnloadEvent.call(oObj);
        else if (_oOldWindowOnloadEvent)
            eval(_oOldWindowOnloadEvent);
        document._runLoaders.call(window);
    }
}
if (window.prototypeGlobal)
    console.log("Error:prototype.js can only be included once");
if (!window.prototypeGlobal)
    window.prototypeGlobal = {
        topWindow: self,
        dialogs: [],
        extenders: [],
        extendersTimer: null,
        initialized: false,
        initializers: [],
        activated: false,
        activators: [],
        loaded: false,
        loaders: [],
        defers: []
    }
if (self != top) {
    try {
        if (parent && parent.postMessage)
            parent.postMessage("ping", window.location.protocol + '//' + window.location.host);
        else {
            window.prototypeGlobal.topWindow = top.prototypeGlobal.topWindow;
        }
    } catch (e) {}
}
window.addEvent("onmessage", function() {
    var oEvent = window.getEvent();
    if (oEvent.origin !== window.location.protocol + '//' + window.location.host)
        return;
    if (oEvent.data == "ping") {
        oEvent.source.postMessage("echo", "*");
    } else if (oEvent.data == "echo") {
        window.prototypeGlobal.topWindow = window.parent.prototypeGlobal.topWindow;
    }
});
window.addEvent('onkeyup', function() {
    var oEvent = window.getEvent();
    if (oEvent.key == 27)
        window.closeDialog(false);
});
document.styles.loadCSS('prototype.css');
document.init(document._monitorActivate);
document.init(document._applyExtenders);
document.load(document._deferScripts);
