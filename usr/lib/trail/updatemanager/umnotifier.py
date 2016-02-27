#! /usr/bin/env python3

# Depends: python3-pyinotify
# Documentation: http://pyinotify.sourceforge.net/

import pyinotify
from os.path import abspath, dirname, join
from gi.repository import GObject, GdkPixbuf

# Need to initiate threads for Gtk,
# or else EventHandler will not get called from ThreadedNotifier
GObject.threads_init()

# i18n: http://docs.python.org/3/library/gettext.html
import gettext
from gettext import gettext as _
gettext.textdomain('updatemanager')


class EventHandler(pyinotify.ProcessEvent):
    def __init__(self, statusIcon, umglobal, umrefresh):
        self.executing = False
        self.statusIcon = statusIcon
        self.umglobal = umglobal
        self.umrefresh = umrefresh

    def process_IN_CREATE(self, event):
        print((">>> process_IN_CREATE: %s" % event.pathname))
        if not self.executing:
            if event.pathname == self.umglobal.umfiles['umrefresh']:
                print(("Creating: %s" % event.pathname))
                self.executing = True
                # You cannot handle GUI changes in a thread
                # Use idle_add to let the calling thread handle GUI stuff when there's time left
                GObject.idle_add(self.changeIcon, "icon-exec", _("Refreshing update list..."))
            if not self.executing:
                if event.pathname == self.umglobal.umfiles['umupd']:
                    print(("Creating: %s" % event.pathname))
                    self.executing = True
                    GObject.idle_add(self.changeIcon, "icon-exec", _("Installing updates..."))

    def process_IN_DELETE(self, event):
        print((">>> process_IN_DELETE: %s" % event.pathname))
        if event.pathname == self.umglobal.umfiles['umupd'] or \
           event.pathname == self.umglobal.umfiles['umrefresh']:
            print(("Deleting: %s" % event.pathname))
            self.executing = False
            GObject.idle_add(self.refresh)

    def process_IN_MODIFY(self, event):
        if '/sources.list' in event.pathname:
            print(("Modifying: %s" % event.pathname))
            GObject.idle_add(self.changeIcon, "icon-warning", _("Sources changed: start UM to refresh"))

    def changeIcon(self, iconName=None, text=None):
        if iconName is not None:
            pb = GdkPixbuf.Pixbuf.new_from_file(self.umglobal.settings[iconName])
            self.statusIcon.set_from_pixbuf(pb)
        if text is not None:
            self.statusIcon.set_tooltip_text(text)

    def refresh(self):
        self.umrefresh.refresh()


class UmNotifier(object):

    def __init__(self, statusIcon, umglobal, umrefresh):
        self.statusIcon = statusIcon
        self.umglobal = umglobal
        self.umrefresh = umrefresh
        self.scriptDir = abspath(dirname(__file__))
        self.filesDir = join(self.scriptDir, "files")

        self.wm = pyinotify.WatchManager()  # Watch Manager
        self.notifier = pyinotify.ThreadedNotifier(self.wm, EventHandler(self.statusIcon, self.umglobal, self.umrefresh))
        self.notifier.start()

        # rec = recursion - if set to True, sub directories are included
        src = '/etc/apt/sources.list'
        self.srcWatch = self.wm.add_watch(src, pyinotify.IN_MODIFY, rec=False)
        self.srcdWatch = self.wm.add_watch("%s.d/" % src, pyinotify.IN_MODIFY, rec=False)
        self.umWatch = self.wm.add_watch(self.filesDir, pyinotify.IN_CREATE | pyinotify.IN_DELETE, rec=False)
        #self.lockWatch = self.wm.add_watch('/var/lib/dpkg/lock', pyinotify.IN_CLOSE_NOWRITE, rec=False)
        print("Added file watches on %s, %s.d/, %s" % (src, src, self.filesDir))

    def quit(self):
        #print("Quit UmNotifier")
        try:
            self.wm.rm_watch(list(self.srcWatch.values()))
            self.wm.rm_watch(list(self.srcdWatch.values()))
            self.wm.rm_watch(list(self.umWatch.values()))
            #self.wm.rm_watch(list(self.lockWatch.values()))
            self.notifier.stop()
        except Exception as details:
            print(("Exception while quitting UmNotifier: %s" % details))
