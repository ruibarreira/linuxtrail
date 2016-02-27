#! /usr/bin/python3

# Depends: python3-gi, python-vte, gir1.2-vte-2.90

# Password settings
# http://docs.python.org/2/library/spwd.html#module-spwd

# sudo apt-get install python3-gi
from gi.repository import Gtk, GdkPixbuf, GObject, Pango, Gdk
from gi.repository import Gtk, GLib
import argparse
import os
# abspath, dirname, join, expanduser, exists, basename
from os.path import join, abspath, dirname, basename
from execcmd import ExecCmd
from treeview import TreeViewHandler
from dialogs import MessageDialog
from mirror import MirrorGetSpeed, Mirror
from umglobal import UmGlobal
from logger import Logger
from os import remove, system

# i18n: http://docs.python.org/3/library/gettext.html
import gettext
from gettext import gettext as _
gettext.textdomain('updatemanager')


#class for the main window
class UpdateManagerPref(object):

    def __init__(self):
        # Check if script is running
        self.scriptName = basename(__file__)
        self.umglobal = UmGlobal()

        # Handle arguments
        parser = argparse.ArgumentParser(description='Trail Update Manager Preferences')
        parser.add_argument('-r','--reload', action="store_true", help='')
        args, extra = parser.parse_known_args()

        print(("args = {}".format(args)))
        if args.reload:
            pids = self.umglobal.getScriptPids("updatemanagerpref.py")
            if len(pids) > 1:
                print(("updatemanagerpref.py already running - kill pid {}".format(pids[0])))
                os.system("kill {}".format(pids[0]))

        # Initiate logging
        self.logFile = join('/var/log', self.umglobal.settings['log'])
        self.log = Logger(self.logFile)

        # Load window and widgets
        self.scriptDir = abspath(dirname(__file__))
        self.filesDir = join(self.scriptDir, "files")
        self.builder = Gtk.Builder()
        self.builder.add_from_file(join(self.scriptDir, '../../../share/trail/updatemanager/updatemanagerpref.glade'))

        # Preferences window objects
        go = self.builder.get_object
        self.window = go("windowPref")
        self.window.set_icon_from_file(self.umglobal.settings["icon-base"])
        self.nbPref = go('nbPref')
        self.btnSaveMirrors = go('btnSaveMirrors')
        self.btnCheckMirrorsSpeed = go("btnCheckMirrorsSpeed")
        self.lblMirrors = go('lblMirrors')
        self.tvMirrors = go("tvMirrors")
        self.btnRemoveBlackList = go("btnRemoveBlacklist")
        self.btnAddBlackList = go("btnAddBlacklist")
        self.tvBlacklist = go("tvBlacklist")
        self.tvAvailable = go("tvAvailable")
        self.lblGeneral = go("lblGeneral")
        self.txtCheckStatus = go("txtCheckStatus")
        self.btnSaveGeneral = go("btnSaveGeneral")
        self.chkHideMaintenance = go("chkHideMaintenance")

        # Only allow numbers
        self.filterText(self.txtCheckStatus)

        # GUI translations
        self.window.set_title(_("Update Manager Preferences"))
        self.btnSaveMirrors.set_label(_("Save mirrors"))
        self.btnCheckMirrorsSpeed.set_label(_("Check mirrors speed"))
        self.btnRemoveBlackList.set_label(_("Remove"))
        self.btnAddBlackList.set_label(_("Blacklist"))
        self.lblMirrors.set_label(_("Repository mirrors"))
        self.lblGeneral.set_label(_("General"))
        go("lblHideMaintenance").set_label(_("Hide maintenance"))
        go("lblBlacklist").set_label(_("Blacklisted packages"))
        go("lblMirrorsText").set_label(_("Select the fastest repository"))
        go("lblBlacklistText").set_label(_("Blacklisted packages"))
        go("lblAvailableText").set_label(_("Available packages"))
        go("lblGlobalSettings").set_label(_("Global settings"))
        go("lblCheckStatus").set_label(_("Check status every"))
        go("lblCheckStatusHour").set_label(_("hours"))

        # Initiate the treeview handler and connect the custom toggle event with on_tvMirrors_toggle
        self.tvMirrorsHandler = TreeViewHandler(self.tvMirrors)
        self.tvMirrorsHandler.connect('checkbox-toggled', self.on_tvMirrors_toggle)

        self.tvBlacklistHandler = TreeViewHandler(self.tvBlacklist)
        self.tvAvailableHandler = TreeViewHandler(self.tvAvailable)

        # Initialize
        self.ec = ExecCmd(loggerObject=self.log)
        self.excludeMirrors = ['security', 'community']
        self.activeMirrors = self.umglobal.getMirrorData(excludeMirrors=self.excludeMirrors)
        self.deadMirrors = self.umglobal.getMirrorData(getDeadMirrors=True)
        self.mirrors = self.getMirrors()
        self.threads = {}
        self.blacklist = []
        self.available = []

        self.fillGeneralSettings()
        self.fillTreeViewMirrors()
        self.fillTreeViewBlackList()
        self.fillTreeViewAvailable()

        # Connect the signals and show the window
        self.builder.connect_signals(self)
        self.window.show()

    # ===============================================
    # Main window functions
    # ===============================================

    def on_btnSaveGeneral_clicked(self, widget):
        self.saveGeneralSettings()

    def on_btnCheckMirrorsSpeed_clicked(self, widget):
        self.checkMirrorsSpeed()

    def on_btnSaveMirrors_clicked(self, widget):
        self.saveMirrors()

    def on_btnCancel_clicked(self, widget):
        self.window.destroy()

    def on_btnRemoveBlacklist_clicked(self, widget):
        self.removeBlacklist()

    def on_btnAddBlacklist_clicked(self, widget):
        self.addBlacklist()

    # ===============================================
    # Blacklist functions
    # ===============================================

    def fillGeneralSettings(self):
        self.txtCheckStatus.set_text(str(self.umglobal.settings["hrs-check-status"]))
        for tab in self.umglobal.settings["hide-tabs"]:
            if tab == "maintenance":
                self.chkHideMaintenance.set_active(True)

    def fillTreeViewBlackList(self):
        self.blacklist = []
        cmd = "env LANG=C dpkg --get-selections | grep hold$ | awk '{print $1}'"
        lst = self.ec.run(cmd, False)
        for pck in lst:
            self.blacklist.append([False, pck.strip()])
        # Fill treeview
        columnTypesList = ['bool', 'str']
        self.tvBlacklistHandler.fillTreeview(self.blacklist, columnTypesList, 0, 400, False)

    def fillTreeViewAvailable(self):
        self.available = []
        cmd = "env LANG=C dpkg --get-selections | grep install$ | awk '{print $1}'"
        lst = self.ec.run(cmd, False)
        for pck in lst:
            self.available.append([False, pck.strip()])
        # Fill treeview
        columnTypesList = ['bool', 'str']
        self.tvAvailableHandler.fillTreeview(self.available, columnTypesList, 0, 400, False)

    def addBlacklist(self):
        packages = self.tvAvailableHandler.getToggledValues()
        for pck in packages:
            self.log.write("Blacklist package: %s" % pck, "UMPref.addBlacklist", "debug")
            cmd = "echo '%s hold' | dpkg --set-selections" % pck
            system(cmd)
        self.fillTreeViewBlackList()
        self.fillTreeViewAvailable()

    def removeBlacklist(self):
        packages = self.tvBlacklistHandler.getToggledValues()
        for pck in packages:
            self.log.write("Remove package from blacklist: %s" % pck, "UMPref.removeBlacklist", "debug")
            cmd = "echo '%s install' | dpkg --set-selections" % pck
            system(cmd)
        self.fillTreeViewBlackList()
        self.fillTreeViewAvailable()

    # ===============================================
    # Mirror functions
    # ===============================================

    def fillTreeViewMirrors(self):
        # Fill mirror list
        if len(self.mirrors) > 1:
            # Fill treeview
            columnTypesList = ['bool', 'str', 'str', 'str', 'str']
            self.tvMirrorsHandler.fillTreeview(self.mirrors, columnTypesList, 0, 400, True)

            # TODO - We have no mirrors: hide the tab until we do
            #self.nbPref.get_nth_page(1).set_visible(False)
        else:
            self.nbPref.get_nth_page(1).set_visible(False)

    def saveMirrors(self):
        # Safe mirror settings
        replaceRepos = []
        # Get user selected mirrors
        model = self.tvMirrors.get_model()
        itr = model.get_iter_first()
        while itr is not None:
            sel = model.get_value(itr, 0)
            if sel:
                repo = model.get_value(itr, 2)
                url = model.get_value(itr, 3)
                # Get currently selected data
                for mirror in self.mirrors:
                    if mirror[0] and mirror[2] == repo and mirror[3] != url:
                        # Currently selected mirror
                        replaceRepos.append([mirror[3], url])
                        break
            itr = model.iter_next(itr)

        if not replaceRepos:
            # Check for dead mirrors
            model = self.tvMirrors.get_model()
            itr = model.get_iter_first()
            while itr is not None:
                sel = model.get_value(itr, 0)
                if sel:
                    repo = model.get_value(itr, 2)
                    url = model.get_value(itr, 3)
                    # Get currently selected data
                    for mirror in self.deadMirrors:
                        if mirror[1] == repo and mirror[2] != url:
                            # Currently selected mirror
                            replaceRepos.append([mirror[2], url])
                            break
                itr = model.iter_next(itr)

        if replaceRepos:
            self.btnSaveMirrors.set_sensitive(False)
            self.btnCheckMirrorsSpeed.set_sensitive(False)
            cmd = "touch %s" % self.umglobal.umfiles["umrefresh"]
            system(cmd)

            m = Mirror()
            m.save(replaceRepos, self.excludeMirrors)
            self.ec.run(cmd="apt-get update", outputTreeView=self.tvMirrors)
            self.umglobal.getLocalInfo()
            self.mirrors = self.getMirrors()
            self.fillTreeViewMirrors()

            remove(self.umglobal.umfiles["umrefresh"])
            self.btnSaveMirrors.set_sensitive(True)
            self.btnCheckMirrorsSpeed.set_sensitive(True)

    def getMirrors(self):
        mirrors = [[_("Current"), _("Country"), _("Repository"), _("URL"), _("Speed")]]
        for mirror in  self.activeMirrors:
            if mirror:
                self.log.write("Mirror data: %s" % ' '.join(mirror), "UMPref.getMirrors", "debug")
                blnCurrent = self.isUrlInSources(mirror[2])
                mirrors.append([blnCurrent, mirror[0], mirror[1], mirror[2], ''])
        return mirrors

    #def isUrlInSources(self, url):
    #    blnRet = False
	#
        # Change old URL
    #    url = url.replace("packages.solydxk.com", "home.solydxk.com")
	#
    #    for repo in self.umglobal.repos:
    #        if url in repo:
                #print((">>> add %s" % url))
    #            blnRet = True
    #            for excl in self.excludeMirrors:
                    #print((">>> excl=%s - repo=%s" % (excl, repo)))
    #                if excl in repo:
                        #print(">>> skip")
    #                    blnRet = False
    #                    break
    #            break
    #    return blnRet

    def checkMirrorsSpeed(self):
        name = 'mirrorspeed'
        self.btnCheckMirrorsSpeed.set_sensitive(False)
        self.btnSaveMirrors.set_sensitive(False)
        t = MirrorGetSpeed(self.mirrors, self.queue, self.umglobal)
        self.threads[name] = t
        t.daemon = True
        t.start()
        self.queue.join()
        GLib.timeout_add(5, self.checkThread, name)

    def checkThread(self, name):
        if self.threads[name].is_alive():
            lst = self.queue.get()
            if lst:
                self.writeSpeed(lst[0], lst[1])
            self.queue.task_done()
            return True

        # Thread is done
        if not self.queue.empty():
            lst = self.queue.get()
            if lst:
                self.writeSpeed(lst[0], lst[1])
            self.queue.task_done()
        del self.threads[name]
        self.btnCheckMirrorsSpeed.set_sensitive(True)
        self.btnSaveMirrors.set_sensitive(True)
        return False

    def writeSpeed(self, url, speed):
        model = self.tvMirrors.get_model()
        itr = model.get_iter_first()
        while itr is not None:
            repo = model.get_value(itr, 3)
            if repo == url:
                self.log.write("Mirror speed for %s = %s" % (url, speed), "UMPref.writeSpeed", "debug")
                model.set_value(itr, 4, speed)
                path = model.get_path(itr)
                self.tvMirrors.scroll_to_cell(path)
            itr = model.iter_next(itr)
        self.tvMirrors.set_model(model)
        # Repaint GUI, or the update won't show
        while Gtk.events_pending():
            Gtk.main_iteration()

    def on_tvMirrors_toggle(self, obj, path, colNr, toggleValue):
        path = int(path)
        model = self.tvMirrors.get_model()
        selectedIter = model.get_iter(path)
        selectedRepo = model.get_value(selectedIter, 2)

        rowCnt = 0
        itr = model.get_iter_first()
        while itr is not None:
            if rowCnt != path:
                repo = model.get_value(itr, 2)
                if repo == selectedRepo:
                    model[itr][0] = False
            itr = model.iter_next(itr)
            rowCnt += 1

    # ===============================================
    # General functions
    # ===============================================

    def saveGeneralSettings(self):
        #print("> saveGeneralSettings")

        hrs = self.umglobal.strToNumber(self.txtCheckStatus.get_text(), True)
        #print(hrs)
        if self.umglobal.settings["hrs-check-status"] != hrs:
            #print("> save hrs-check-status 1")
            self.umglobal.saveSettings('misc', 'hrs-check-status', hrs)
            #print("> save hrs-check-status 2")

        lst = []
        for tab in self.umglobal.settings["hide-tabs"]:
            if tab != "maintenance":
                lst.append(tab)
        if self.chkHideMaintenance.get_active():
            lst.append("maintenance")
        if lst:
            self.umglobal.saveSettings('misc', 'hide-tabs', ",".join(lst))
        else:
            self.umglobal.saveSettings('misc', 'hide-tabs', "")

        msg = _("The new settings will take effect after UM restart.")
        self.showInfo(self.lblGeneral.get_label(), msg, self.window)

    def filterText(self, widget):
        def filter(entry, *args):
            text = entry.get_text().strip().lower()
            entry.set_text(''.join([i for i in text if i in '0123456789']))
        widget.connect('changed', filter)

    def showInfo(self, title, message, parent):
        MessageDialog(title, message, parent=parent)

    # Close the gui
    def on_windowPref_destroy(self, widget):
        Gtk.main_quit()

if __name__ == '__main__':
    # Create an instance of our GTK application
    try:
        UpdateManagerPref()
        Gtk.main()
    except KeyboardInterrupt:
        pass
