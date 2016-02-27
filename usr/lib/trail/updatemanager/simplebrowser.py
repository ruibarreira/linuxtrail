#! /usr/bin/env python3

from gi.repository import WebKit
import webbrowser
import re


class SimpleBrowser(WebKit.WebView):

    def __init__(self, url=None):
        WebKit.WebView.__init__(self)

        # listen for clicks of links
        self.connect("new-window-policy-decision-requested", self.on_nav_request)
        self.connect("button-press-event", lambda w, e: e.button == 3)

        if url is not None:
            matchObj = re.search("\:\/\/", url)
            if matchObj:
                self.openUrl(url)
            else:
                self.showHtml(url)
        self.show()

    def openUrl(self, url):
        print(("show URL: %s" % url))
        self.open(url)

    def showHtml(self, html):
        #print(("show HTML: %s" % html))
        self.load_string(html, "text/html", "UTF-8", 'file://')

    def on_nav_request(self, browser, frame, request, action, decision, *args, **kwargs):
        # User clicked on a <a href link: open uri in new tab or new default browser
        reason = action.get_reason()
        if (reason == 0):    # = WEBKIT_WEB_NAVIGATION_REASON_LINK_CLICKED
            if decision is not None:
                decision.ignore()
                uri = request.get_uri()
                webbrowser.open_new_tab(uri)
        else:
            if decision is not None:
                decision.use()
