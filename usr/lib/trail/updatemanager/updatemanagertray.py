#! /usr/bin/env python3

from gi.repository import Gtk, GObject
import threading
import argparse
import os
from umglobal import UmGlobal
from umnotifier import UmNotifier
from umrefresh import UmRefresh
from os.path import join, abspath, dirname, basename
from dialogs import MessageDialog
from execcmd import ExecCmd

# i18n: http://docs.python.org/3/library/gettext.html
import gettext
from gettext import gettext as _
gettext.textdomain('updatemanager')

# Need to initiate threads for Gtk
GObject.threads_init()


class UpdateManagerTray(object):

    def __init__(self):
        # Check if script is running
        self.scriptDir = abspath(dirname(__file__))
        self.filesDir = join(self.scriptDir, "files")
        self.scriptName = basename(__file__)
        self.umglobal = UmGlobal()
        self.ec = ExecCmd()

        # Handle arguments
        parser = argparse.ArgumentParser(description='Trail Update Manager Tray')
        parser.add_argument('-r','--reload', action="store_true", help='')
        args, extra = parser.parse_known_args()

        print((">> args = {}".format(args)))
        if args.reload:
            pids = self.umglobal.getScriptPids("updatemanagertray.py")
            if len(pids) > 1:
                print(("updatemanagertray.py already running - kill pid {}".format(pids[0])))
                os.system("kill {}".format(pids[0]))

        # Build status icon menu
        self.refreshText = _("Refresh")
        self.quitText = _("Quit")
        menu = Gtk.Menu()
        menuUm = Gtk.MenuItem(_("Update Manager"))
        menuUm.connect('activate', self.open_um)
        menu.append(menuUm)
        # Separator not functioning in wheezy
        #menuSep1 = Gtk.SeparatorMenuItem()
        #menu.append(menuSep1)
        menuPref = Gtk.MenuItem(_("Preferences"))
        menuPref.connect('activate', self.open_preferences)
        menu.append(menuPref)
        menuRefresh = Gtk.MenuItem(self.refreshText)
        menuRefresh.connect('activate', self.manualRefresh)
        menu.append(menuRefresh)
        menuQuit = Gtk.MenuItem(self.quitText)
        menuQuit.connect('activate', self.quit_tray)
        menu.append(menuQuit)

        self.statusIcon = Gtk.StatusIcon()
        self.umrefresh = UmRefresh(self.statusIcon, self.umglobal)
        self.notifier = UmNotifier(self.statusIcon, self.umglobal, self.umrefresh)

        self.statusIcon.connect('activate', self.icon_activate)
        self.statusIcon.connect('popup-menu', self.popup_menu, menu)

        # Initiate first check
        self.refresh()

        # Loop the refresh function
        # For some reason you cannot start a threaded class from init
        self.timeout = int(self.umglobal.settings["hrs-check-status"] * 60 * 60)
        GObject.timeout_add_seconds(self.timeout, self.refresh)

    def refresh(self, widget=None):
        self.umrefresh.refresh()
        # Return True or timeout_add_seconds will only run once
        return True

    def manualRefresh(self, widget=None):
        self.umrefresh.refresh()

    def popup_menu(self, widget, button, time, data):
        data.show_all()
        data.popup(None, None, None, None, button, time)

    def open_um(self, widget):
        if not self.umglobal.isSrciptRunning("updatemanager.py"):
            # Run UM in its own thread
            pref_thread = threading.Thread(target=self.ec.run, args=("updatemanager",))
            pref_thread.setDaemon(True)
            pref_thread.start()

    def icon_activate(self, widget):
        if not self.umglobal.isSrciptRunning("updatemanager.py"):
            parm = ""
            if not self.umglobal.newUpd:
                # Quick update
                parm = " -q"
            # Run UM in its own thread
            pref_thread = threading.Thread(target=self.ec.run, args=("updatemanager{}".format(parm),))
            pref_thread.setDaemon(True)
            pref_thread.start()

    def open_preferences(self, widget):
        # Run preferences in its own thread
        if not self.umglobal.isSrciptRunning("updatemanagerpref.py"):
            pref_thread = threading.Thread(target=self.ec.run, args=("updatemanager -p",))
            pref_thread.setDaemon(True)
            pref_thread.start()

    def showInfoDlg(self, title, message):
        MessageDialog(title, message)

    def quit_tray(self, widget):
        if self.umglobal.isUpgrading():
            self.showInfoDlg(self.quitText, _("Cannot quit: upgrade in progress"))
        else:
            self.umglobal.killScriptProcess("updatemanager.py")
            self.umglobal.killScriptProcess("updatemanagerpref.py")
            self.notifier.quit()
            Gtk.main_quit()

if __name__ == '__main__':
    # Create an instance of our GTK application
    try:
        UpdateManagerTray()
        Gtk.main()
    except KeyboardInterrupt:
        pass
