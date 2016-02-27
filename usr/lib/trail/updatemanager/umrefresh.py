#! /usr/bin/env python3

from gi.repository import GdkPixbuf, GObject
from execcmd import ExecCmd
from os.path import join, abspath, dirname
from os import remove
from glob import glob

# i18n: http://docs.python.org/3/library/gettext.html
import gettext
from gettext import gettext as _
gettext.textdomain('updatemanager')

# Need to initiate threads for Gtk
GObject.threads_init()


class UmRefresh(object):

    def __init__(self, statusIcon, umglobal):
        self.scriptDir = abspath(dirname(__file__))
        self.ec = ExecCmd()
        self.statusIcon = statusIcon
        self.umglobal = umglobal
        #self.apt = UmApt(self.umglobal)
        self.pbExec = GdkPixbuf.Pixbuf.new_from_file(self.umglobal.settings["icon-exec"])
        self.pbApply = GdkPixbuf.Pixbuf.new_from_file(self.umglobal.settings["icon-apply"])
        self.pbInfo = GdkPixbuf.Pixbuf.new_from_file(self.umglobal.settings["icon-info"])
        self.pbDisconnected = GdkPixbuf.Pixbuf.new_from_file(self.umglobal.settings["icon-disconnected"])
        self.pbError = GdkPixbuf.Pixbuf.new_from_file(self.umglobal.settings["icon-error"])
        self.counter = 0
        self.quit = False

    def refresh(self):
        uptodateText = _("Your system is up to date")
        updavText = _("There are updates available")
        noConText = _("No internet connection")
        errText = _("Unable to retrieve sources information")
        self.counter += 1
        print(("UmRefresh refresh count #: %d" % self.counter))

        self.statusIcon.set_from_pixbuf(self.pbExec)
        self.statusIcon.set_tooltip_text(_("Refreshing..."))

        if not self.umglobal.isSrciptRunning("updatemanager.py"):
            for fle in glob(join(self.scriptDir, "files/.um*")):
                remove(fle)

        self.umglobal.getLocalInfo()
        if self.umglobal.repos:
            if self.counter > 1:
                self.umglobal.getServerInfo()
            if self.umglobal.hasInternet:
                # Check update status
                if self.checkForUpdates():
                    if self.umglobal.newUpd:
                        self.statusIcon.set_from_pixbuf(self.pbInfo)
                        self.statusIcon.set_tooltip_text(_("New update: %s" % self.umglobal.serverUpdVersion))
                    else:
                        self.statusIcon.set_from_pixbuf(self.pbInfo)
                        self.statusIcon.set_tooltip_text(updavText)
                else:
                    self.statusIcon.set_from_pixbuf(self.pbApply)
                    self.statusIcon.set_tooltip_text(uptodateText)
            else:
                self.statusIcon.set_from_pixbuf(self.pbDisconnected)
                self.statusIcon.set_tooltip_text(noConText)
                # Check every 60 seconds if there is a connection
                GObject.timeout_add_seconds(60, self.refresh)
                return True
        else:
            self.statusIcon.set_from_pixbuf(self.pbError)
            self.statusIcon.set_tooltip_text(errText)

        print("Done refreshing")

    def checkForUpdates(self):
        # Get updateable packages which are not held back"
        cmd = "aptitude search '~U' | grep -v ^ih"

        # Get the output of the command in a list
        lst = self.ec.run(cmd=cmd, realTime=False)

        if lst:
            return True
        else:
            return False
