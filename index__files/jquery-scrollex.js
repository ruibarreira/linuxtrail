/* jquery.scrollex v0.2.0 | (c) n33 | n33.co @n33co | MIT */
(function(e){function g(e,r,i){return typeof e=="string"&&(e.slice(-1)=="%"?e=parseInt(e[t](0,e[n]-1))/100*r:e.slice(-2)=="vh"?e=parseInt(e[t](0,e[n]-2))/100*i:e.slice(-2)=="px"&&(e=parseInt(e[t](0,e[n]-2)))),e}var t="substring",n="length",r="scroll",i="clearTimeout",s="timeoutId",o="options",u="_scrollexId",a="default",f=null,l="apply",c="element",h="initialize",p="unscrollex",d=e(window),v=1,m={};d.on(r,function(){var t=d.scrollTop();e.map(m,function(e){window[i](e[s]),e[s]=window.setTimeout(function(){e.handler(t)},e[o].delay)})}).on("load",function(){d.trigger(r)}),jQuery.fn.scrollex=function(t){var i,s,p,y,b,w,E=e(this);if(this[n]==0)return E;if(this[n]>1){for(i=0;i<this[n];i++)e(this[i]).scrollex(t);return E}if(E.data(u))return E;s=v++,p=jQuery.extend({top:0,bottom:0,delay:0,mode:a,enter:f,leave:f,initialize:f,terminate:f,scroll:f},t);switch(p.mode){case"top":y=function(e,t,n,r,i){return e>=r&&e<=i};break;case"bottom":y=function(e,t,n,r,i){return n>=r&&n<=i};break;case"middle":y=function(e,t,n,r,i){return t>=r&&t<=i};break;case"top-only":y=function(e,t,n,r){return e<=r&&r<=n};break;case"bottom-only":y=function(e,t,n,r,i){return n>=i&&i>=e};break;default:case a:y=function(e,t,n,r,i){return n>=r&&e<=i}}return b=function(e){var t=this.state,n=!1,i=this.$element.offset(),s=d.height(),u=e+s/2,a=e+s,f=this.$element.outerHeight(),h=i.top+g(this[o].top,f,s),p=i.top+f-g(this[o].bottom,f,s);n=this.test(e,u,a,h,p),n!=t&&(this.state=n,n?this[o].enter&&this[o].enter[l](this[c]):this[o].leave&&this[o].leave[l](this[c])),this[o][r]&&this[o][r][l](this[c],[(u-h)/(p-h)])},w={id:s,options:p,test:y,handler:b,state:!1,element:this,$element:E,timeoutId:f},m[s]=w,E.data(u,w.id),w[o][h]&&w[o][h][l](this),E},jQuery.fn[p]=function(){var t,r,a,f=e(this);if(this[n]==0)return f;if(this[n]>1){for(t=0;t<this[n];t++)e(this[t])[p]();return f}return r=f.data(u),r?(a=m[r],window[i](a[s]),delete m[r],f.removeData(u),a[o].terminate&&a[o].terminate[l](this),f):f}})(jQuery);