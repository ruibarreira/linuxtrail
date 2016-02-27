#! /usr/bin/env python3

# from gi.repository import Gtk, GdkPixbuf, GObject, Pango, Gdk
import argparse
from dialogs import CustomQuestionDialog
from dialogs import MessageDialog
from dialogs import QuestionDialog
from execcmd import ExecCmd
from gi.repository import GObject
from gi.repository import Gdk
from gi.repository import Gtk
from glob import glob
from logger import Logger
import os
from os import chmod
from os import makedirs
from os import remove
from os.path import abspath
from os.path import basename
from os.path import dirname
from os.path import exists
from os.path import join
from shutil import move
from simplebrowser import SimpleBrowser
import sys
from terminal import VirtualTerminal
import threading
from treeview import TreeViewHandler
from umapt import UmApt
from umglobal import UmGlobal
try:
    # For Python 3.0 and later
    from urllib.request import urlopen
except ImportError:
    # Fall back to Python 2's urllib2
    from urllib2 import urlopen

# i18n: http://docs.python.org/3/library/gettext.html
import gettext
from gettext import gettext as _
gettext.textdomain('updatemanager')

# Need to initiate threads for Gtk
GObject.threads_init()


#class for the main window
class UpdateManager(object):

    def __init__(self):
        # Check if script is running
        self.scriptName = basename(__file__)
        self.scriptDir = abspath(dirname(__file__))
        self.filesDir = join(self.scriptDir, "files")
        self.umglobal = UmGlobal()
        self.user = self.umglobal.getLoginName()

        # Initiate logging
        self.logFile = join('/var/log', self.umglobal.settings['log'])
        print(("UM log = %s" % self.logFile))
        self.log = Logger(self.logFile, maxSizeKB=5120)

        # Remove scripts
        self.deleteScripts(self.umglobal.localUpdVersion)

        # Initialize
        self.ec = ExecCmd(loggerObject=self.log)
        self.apt = UmApt(self.umglobal)
        self.kernelVersion = self.umglobal.getKernelVersion()
        self.upgradables = []
        self.upgradableUM = []
        self.window = None

        # Handle arguments
        parser = argparse.ArgumentParser(description='Trail Update Manager')
        parser.add_argument('-q','--quick', action="store_true", help='Quick upgrade')
        parser.add_argument('-r','--reload', action="store_true", help='')
        args, extra = parser.parse_known_args()

        self.quickUpdate = False
        #print((">> opts = {} / args = {}".format(opts, args)))
        #print((">> opt = {} / arg = {}".format(opt, arg)))
        if args.quick:
            self.quickUpdate = True
        if args.reload:
            pids = self.umglobal.getScriptPids("updatemanager.py")
            if len(pids) > 1:
                print(("updatemanager.py already running - kill pid {}".format(pids[0])))
                os.system("kill {}".format(pids[0]))

        # Set some global translations
        self.aptErrorText = _("Apt error")
        self.upgradablePackagesText = _("The following packages will be upgraded:")
        self.newPackagesText = _("The following NEW packages will be installed:")
        self.removedPackagesText = _("The following packages will be REMOVED:")
        self.heldbackPackagesText = _("The following packages have been kept back:")
        self.downgradePackagesText = _("The following packages are going to be downgraded:")

        # Cleanup first
        for fle in glob(join(self.filesDir, '.um*')):
            remove(fle)

        # Load window and widgets
        self.builder = Gtk.Builder()
        self.builder.add_from_file(join(self.scriptDir, '../../../share/trail/updatemanager/updatemanager.glade'))
        go = self.builder.get_object

        # Quick update
        if self.quickUpdate:
            #print((">> Run minimal upgrade"))
            # Refresh data
            self.umglobal.collectData()
            self.apt.createPackagesInfoList()
            self.apt.createPackageLists()
            self.fillTreeView()

            # Run upgrade
            nid = self.run_upgrade()

            if nid != "":
                self.on_command_done(None, 0, nid)

            #print((">> Minimal upgrade done"))
            sys.exit(2)

        # Make sure the files directory is set correctly
        self.checkFilesDir()

        # Main window objects
        self.window = go("windowMain")
        self.window.set_icon_from_file(self.umglobal.settings["icon-base"])
        self.tvPck = go("tvPck")
        self.swTerminal = go("swTerminal")
        self.statusbar = go("statusbar")
        self.btnInstall = go("btnInstall")
        self.btnRefresh = go("btnRefresh")
        self.btnPackages = go("btnPackages")
        self.btnOutput = go("btnOutput")
        self.btnInfo = go("btnInfo")
        self.btnPreferences = go("btnPreferences")
        self.nbMain = go("nbMain")
        self.swInfo = go("swInfo")
        self.btnMaintenance = go("btnMaintenance")
        self.lblMaintenance = go("lblMaintenance")
        self.tvMaintenance = go("tvMaintenance")
        self.btnMaintenanceExecute = go("btnMaintenanceExecute")
        self.chkMaintenanceSelectAll = go("chkMaintenanceSelectAll")
        self.radUnneeded = go("radUnneeded")
        self.radCleanCache = go("radCleanCache")
        self.radDowngradable = go("radDowngradable")
        self.radNotavailable = go("radNotavailable")
        self.radOldKernel = go("radOldKernel")
        self.lblMaintenanceHelp = go("lblMaintenanceHelp")

        # Translations
        self.window.set_title(_("Trail Update Manager"))
        self.btnInstall.set_label(_("Install"))
        self.btnRefresh.set_label(_("Refresh"))
        self.btnOutput.set_label(_("Output"))
        self.btnInfo.set_label(_("Information"))
        self.btnPreferences.set_label(_("Preferences"))
        self.btnPackages.set_label(_("Packages"))
        self.uptodateText = _("Your system is up to date")
        self.lblMaintenance.set_label(_("Maintenance"))
        self.btnMaintenanceExecute.set_label(_("Execute"))
        self.chkMaintenanceSelectAll.set_label(_("Select all"))
        self.radCleanCache.set_label(_("Clean up the apt cache"))
        self.radUnneeded.set_label(_("Remove unneeded packages"))
        self.radNotavailable.set_label(_("Remove packages not available\nin the repositories"))
        self.radOldKernel.set_label(_("Remove old kernels"))
        self.radDowngradable.set_label(_("Downgrade packages with\nonly lower versions available"))
        self.lblMaintenanceHelp.set_label(_("Make sure you create\n"
                                             "a system image before you\n"
                                             "continue (e.g. Clonezilla)."))

        # VTE Terminal
        self.terminal = VirtualTerminal(userInputAllowed=self.umglobal.settings["allow-terminal-user-input"])
        self.swTerminal.add(self.terminal)
        self.terminal.set_vexpand(True)
        self.terminal.set_hexpand(True)
        self.terminal.connect('command-done', self.on_command_done)
        self.terminal.connect('line-added', self.on_line_added)
        palletList = ['#4A4A4A', '#BD1919', '#118011', '#CE6800', '#1919BC', '#8D138D', '#139494', '#A7A7A7']
        self.terminal.setTerminalColors("#000000", "#FFFFFF", palletList)
        self.swTerminal.modify_bg(Gtk.StateType.NORMAL, Gdk.color_parse("#FFFFFF"))

        # Disable all buttons
        self.btnInfo.set_sensitive(False)
        self.btnPreferences.set_sensitive(False)
        self.btnOutput.set_sensitive(False)
        self.btnRefresh.set_sensitive(False)
        self.btnInstall.set_sensitive(False)
        self.btnPackages.set_sensitive(False)
        self.btnMaintenance.set_sensitive(False)

        # Hide tabs if needed
        for tab in self.umglobal.settings["hide-tabs"]:
            if tab == "packages":
                self.nbMain.get_nth_page(0).set_visible(False)
                self.btnPackages.set_visible(False)
            elif tab == "output":
                self.nbMain.get_nth_page(1).set_visible(False)
                self.btnOutput.set_visible(False)
            elif tab == "info":
                self.nbMain.get_nth_page(2).set_visible(False)
                self.btnInfo.set_visible(False)
            elif tab == "maintenance":
                self.nbMain.get_nth_page(3).set_visible(False)
                self.btnMaintenance.set_visible(False)

        # Connect the signals and show the window
        self.builder.connect_signals(self)
        self.window.show()

        # Force the window to show
        while Gtk.events_pending():
            Gtk.main_iteration()

        # Just show something that we're busy
        msg = _("Gathering information...")
        self.terminal.executeCommand('echo "%s"' % msg, 'init')
        self.showOutput()

        # Treeview handlers
        self.tvHandler = TreeViewHandler(self.tvPck)
        self.tvMaintenanceHandler = TreeViewHandler(self.tvMaintenance)

        # Version information
        ver = _("Version")
        pckVer = self.apt.getPackageVersion('updatemanager')
        versionInfo = "%(ver)s: %(pckVer)s" % { "ver": ver, "pckVer": pckVer }
        if self.umglobal.localUpdVersion != "2000.01.01":
            versionInfo = "%(ver)s: %(pckVer)s" % { "ver": ver, "pckVer": pckVer }
        self.pushMessage(versionInfo)

        # Log basic information
        self.log.write("==============================================", "UM.init", "debug")
        self.log.write("UM version = %s" % versionInfo, "UM.init", "debug")
        self.log.write("==============================================", "UM.init", "debug")
        mirrorsList = join(self.filesDir, basename(self.umglobal.settings["mirrors-list"]))
        if exists(mirrorsList):
            self.log.write("Mirrors list", "UM.init", "debug")
            with open(mirrorsList, 'r') as f:
                for line in f.readlines():
                    self.log.write(line, "UM.init", "debug")
            self.log.write("==============================================", "UM.init", "debug")

        # Load the initial information page
        self.loadInfo()

        # Refresh apt cache
        self.refresh()

        # Initialize maintenance screen
        self.fillTreeViewMaintenance()

    # ===============================================
    # Main window functions
    # ===============================================

    def on_btnInstall_clicked(self, widget):
        self.run_upgrade()

    def run_upgrade(self):
        nid = ""
        aptHasErrors = self.apt.aptHasErrors()
        #print((">> aptHassError = {} / self.upgradables = {} / self.upgradableUM = {}".format(aptHasErrors, self.upgradables, self.upgradableUM)))
        if aptHasErrors is not None:
            self.showInfoDlg(self.aptErrorText, aptHasErrors)
        elif self.upgradables:

            if self.apt.upgradablePackages:
                self.log.write("=================== upgradable pacages ====================", "UM.on_command_done", "debug")
                self.log.write(self.createLogString(self.apt.upgradablePackages), "UM.on_command_done", "debug")
            if self.apt.removedPackages:
                self.log.write("==================== removed packages =====================", "UM.on_command_done", "debug")
                self.log.write(self.createLogString(self.apt.removedPackages), "UM.on_command_done", "debug")
            if self.apt.newPackages:
                self.log.write("======================= new packages =======================", "UM.on_command_done", "debug")
                self.log.write(self.createLogString(self.apt.newPackages), "UM.on_command_done", "debug")
            if self.apt.heldbackPackages:
                self.log.write("=================== kept back packages =====================", "UM.on_command_done", "debug")
                self.log.write(self.createLogString(self.apt.heldbackPackages), "UM.on_command_done", "debug")

            if not self.quickUpdate:
                self.showOutput()
            contMsg = _("Continue installation?")
            if self.upgradableUM:
                cmd = "%s install updatemanager" % self.umglobal.settings['apt-get-string']
                cmd += "; %s install %s" % (self.umglobal.settings['apt-get-string'], " ".join(self.umglobal.settings["um-dependencies"]))
                nid = 'uminstallum'
                self.prepForCommand(nid)
                if self.quickUpdate:
                    self.ec.run(cmd)
                else:
                    self.terminal.executeCommand(cmd, nid)
                self.log.write("Execute command: %s (%s)" % (cmd, nid), "UM.on_btnInstall_clicked", "debug")
            else:
                msg = self.getDistUpgradeInfo()
                answer = True
                if msg != "":
                    answer = self.showConfirmationDlg(contMsg, msg)
                if answer:
                    cmd = "%s dist-upgrade" % self.umglobal.settings['apt-get-string']
                    #if self.umglobal.newUpd:
                    pre = join(self.filesDir, self.umglobal.settings['pre-upd'].replace("[VERSION]", self.umglobal.serverUpdVersion))
                    post = join(self.filesDir, self.umglobal.settings['post-upd'].replace("[VERSION]", self.umglobal.serverUpdVersion))
                    if exists(pre):
                        cmd = "/bin/bash %(pre)s; %(cmd)s" % { "pre": pre, "cmd": cmd }
                    if exists(post):
                        cmd = "%(cmd)s; /bin/bash %(post)s" % { "cmd": cmd, "post": post }
                    nid = 'umupd'
                    self.prepForCommand(nid)
                    if self.quickUpdate:
                        self.ec.run(cmd)
                    else:
                        self.terminal.executeCommand(cmd, nid)
                    self.log.write("Execute command: %s (%s)" % (cmd, nid), "UM.on_btnInstall_clicked", "debug")

        else:
            if not self.quickUpdate:
                self.showInfoDlg(self.btnInstall.get_label(), self.uptodateText)

        return nid

    def on_btnRefresh_clicked(self, widget):
        self.refresh()

    def on_btnPackages_clicked(self, widget):
        self.showPackages()

    def on_btnOutput_clicked(self, widget):
        self.showOutput()

    def on_btnInfo_clicked(self, widget):
        self.showInfo()

    def on_btnPreferences_clicked(self, widget):
        # Run preferences in its own thread
        pref_thread = threading.Thread(target=self.openPreferences)
        pref_thread.setDaemon(True)
        pref_thread.start()

    def openPreferences(self):
        #os.system("updatemanager -p")
        os.system('cd /usr/lib/trail/updatemanager && python updatemanagerpref.py && exit')

    def on_btnMaintenance_clicked(self, widget):
        self.showMaintenance()

    def on_radCleanCache_toggled(self, widget):
        if widget.get_active():
            self.fillTreeViewMaintenance()

    def on_radUnneeded_toggled(self, widget):
        if widget.get_active():
            message = _("You might need to run this several times.\n\n%s" % self.lblMaintenanceHelp.get_label().replace("\n", " "))
            MessageDialog(self.btnMaintenance.get_label(), message, Gtk.MessageType.WARNING, self.window)
            self.fillTreeViewMaintenance()

    def on_radNotavailable_toggled(self, widget):
        if widget.get_active():
            message = _("Removing not available packages may break your system!\n\n%s" % self.lblMaintenanceHelp.get_label().replace("\n", " "))
            MessageDialog(self.btnMaintenance.get_label(), message, Gtk.MessageType.WARNING, self.window)
            self.fillTreeViewMaintenance()

    def on_radOldKernel_toggled(self, widget):
        if widget.get_active():
            message = _("Once removed you will not be able to boot these kernels!\n\n%s" % self.lblMaintenanceHelp.get_label().replace("\n", " "))
            MessageDialog(self.btnMaintenance.get_label(), message, Gtk.MessageType.WARNING, self.window)
            self.fillTreeViewMaintenance()

    def on_radDowngradable_toggled(self, widget):
        if widget.get_active():
            message = _("Downgrading packages may break your system!\n\n%s" % self.lblMaintenanceHelp.get_label().replace("\n", " "))
            MessageDialog(self.btnMaintenance.get_label(), message, Gtk.MessageType.WARNING, self.window)
            self.fillTreeViewMaintenance()

    def on_btnMaintenanceExecute_clicked(self, widget):
        self.executeMaintenance()

    def on_chkMaintenanceSelectAll_toggled(self, widget):
        self.tvMaintenanceHandler.treeviewToggleAll(toggleColNrList=[0], toggleValue=widget.get_active())

    # ===============================================
    # Maintenance functions
    # ===============================================

    def enableMaintenance(self, enable=True):
        self.btnMaintenanceExecute.set_sensitive(enable)
        self.radUnneeded.set_sensitive(enable)
        self.radCleanCache.set_sensitive(enable)
        self.radDowngradable.set_sensitive(enable)
        self.radOldKernel.set_sensitive(enable)
        self.radNotavailable.set_sensitive(enable)
        self.chkMaintenanceSelectAll.set_sensitive(enable)
        if enable:
            self.chkMaintenanceSelectAll.set_active(False)

    def fillTreeViewMaintenance(self):
        blnCleanCache = self.radCleanCache.get_active()
        blnUnneeded = self.radUnneeded.get_active()
        blnDowngradable = self.radDowngradable.get_active()
        blnNotavailable = self.radNotavailable.get_active()
        blnOldKernels = self.radOldKernel.get_active()

        self.enableMaintenance(False)

        columnTypesList = ['bool', 'str', 'str', 'str']
        packages = [["", _("Package"), _("Installed"), _("Available")]]
        # Clear the treeview first
        self.tvMaintenanceHandler.fillTreeview(packages, columnTypesList, 0, 400, True)

        msg = ""
        if blnCleanCache:
            msg = _("Hit the Execute button to clean the cache.")
            columnTypesList = ['str']
            packages.append([msg])
        elif blnUnneeded:
            msg = self.radUnneeded.get_label()
            self.apt.createPackageLists("apt-get autoremove")
            for pck in self.apt.removedPackages:
                packages.append([False, pck[0], pck[1], pck[2]])
            self.apt.createPackageLists()
            # Add orphaned files
            self.apt.fillOrphanedPackages()
            for pck in self.apt.orphanedPackages:
                packages.append([False, pck[0], pck[1], pck[2]])
        elif blnNotavailable:
            msg = self.radNotavailable.get_label()
            self.apt.fillNotAvailablePackages()
            for pck in self.apt.notavailablePackages:
                if pck[0][0:6] != "linux-":
                    packages.append([False, pck[0], pck[1], ""])
        elif blnOldKernels:
            msg = self.radOldKernel.get_label()
            self.apt.fillKernelPackages()
            for pck in self.apt.kernelPackages:
                if "headers-486" not in pck[0] \
                    and "headers-586" not in pck[0] \
                    and "headers-686" not in pck[0] \
                    and "headers-amd64" not in pck[0] \
                    and "image-486" not in pck[0] \
                    and "image-586" not in pck[0] \
                    and "image-686" not in pck[0] \
                    and "image-amd64" not in pck[0]:

                    checkVersion = self.kernelVersion
                    if "kbuild" in pck[0]:
                        indMinus = self.kernelVersion.index("-")
                        indZero = self.kernelVersion.index("0")
                        if indZero > 0 and indZero < indMinus:
                            ind = indZero - 1
                        else:
                            ind = indMinus
                        if ind > 0:
                            checkVersion = self.kernelVersion[0:ind]
                    if checkVersion not in pck[0]:
                        packages.append([False, pck[0], pck[1], ""])
        elif blnDowngradable:
            msg = self.radDowngradable.get_label()
            self.apt.fillDowngradablePackages()
            for pck in self.apt.downgradablePackages:
                packages.append([False, pck[0], pck[1], pck[2]])

        if len(packages) > 1:
            self.tvMaintenanceHandler.fillTreeview(packages, columnTypesList, 0, 400, True)
        else:
            if not blnCleanCache:
                msg = _("\"%s\"\n did not return any results.") % msg
                self.showInfoDlg(self.btnMaintenance.get_label(), msg)

        self.enableMaintenance(True)

    def executeMaintenance(self):
        blnCleanCache = self.radCleanCache.get_active()
        blnDowngradable = self.radDowngradable.get_active()
        blnNotNeeded = self.radUnneeded.get_active()
        downgradeString = ""
        deleteString = ""
        updateGrub = False
        cmd = ""

        self.enableMaintenance(False)

        if blnCleanCache:
            safe = False
            msg = _("Do you want to completely clean the apt cache?\n\n"
                    "When No, only unavailable installation packages are removed.")
            dialog = QuestionDialog(self.radCleanCache.get_label(), msg, self.window)
            if (dialog.run()):
                safe = True
            self.apt.cleanCache(safe)
            msg = _("Apt cache has been cleaned.")
            self.showInfoDlg(self.radCleanCache.get_label(), msg)
        else:
            # Get user selected packages
            model = self.tvMaintenance.get_model()
            itr = model.get_iter_first()
            while itr is not None:
                sel = model.get_value(itr, 0)
                if sel:
                    pck = model.get_value(itr, 1)
                    avVer = model.get_value(itr, 3)
                    if blnDowngradable:
                        downgradeString += " %(pck)s=%(avVer)s" % {"pck": pck, "avVer": avVer}
                    else:
                        deleteString += " %s" % pck
                        if "linux-image" in pck:
                            updateGrub = True
                itr = model.iter_next(itr)

            if downgradeString != "":
                cmd = "%s install %s" % (self.umglobal.settings['apt-get-string'], downgradeString)
            elif deleteString != "":
                cmd = "%s purge %s" % (self.umglobal.settings['apt-get-string'], deleteString)

        if cmd != "":
            self.apt.createPackageLists(cmd)
            msg = self.getDistUpgradeInfo()
            answer = True
            if msg != "":
                contMsg = _("Execute maintenance changes?")
                answer = self.showConfirmationDlg(contMsg, msg)
            if answer:
                if updateGrub:
                    cmd += "; update-grub"
                if blnNotNeeded:
                    cmd += "; %s purge $(COLUMNS=132 dpkg -l | grep ^rc | awk '{ print $2 }')" % self.umglobal.settings['apt-get-string']
                self.showOutput()
                nid = 'ummaintenance'
                self.prepForCommand(nid)
                self.terminal.executeCommand(cmd, nid)
                self.log.write("Execute command: %s (%s)" % (cmd, nid), "UM.executeMaintenance", "debug")

        self.enableMaintenance(True)

    # ===============================================
    # General functions
    # ===============================================

    def prepForCommand(self, nid):
        os.system("touch %s" % self.umglobal.umfiles[nid])
        if not self.quickUpdate:
            self.btnRefresh.set_sensitive(False)
            self.btnInstall.set_sensitive(False)
            self.btnMaintenance.set_sensitive(False)

    def on_line_added(self, terminal, line):
        if line.strip()[0:2].upper() == "E:":
            self.log.write(line, "UM.on_line_added", "error")
        else:
            self.log.write(line, "UM.on_line_added", "info")

    def on_command_done(self, terminal, pid, nid):
        if nid != "init":
            self.log.write("Command finished (pid=%s, nid=%s)" % (pid, nid), "UM.on_command_done", "info")
            if nid == "uminstallum":
                # Reload UM
                self.log.write("Updating UM: kill process of updatemanagerpref.py", "UM.on_command_done", "debug")
                self.umglobal.killScriptProcess("updatemanagerpref.py")
                # Reload tray as user
                self.log.write("Updating UM: kill process of updatemanagertray.py", "UM.on_command_done", "debug")
                self.umglobal.killScriptProcess("updatemanagertray.py")
                cmd = "sudo -u {} updatemanager -t -r".format(self.user)
                os.system(cmd)
                self.log.write("UM updated: reload tray as user {}".format(self.user), "UM.on_command_done", "debug")
                # Reload UM window
                cmd = join(self.scriptDir, "updatemanager.py")
                if self.quickUpdate:
                    cmd = join(self.scriptDir, "updatemanager.py -q")
                self.umglobal.reloadWindow(cmd, self.user)
                self.log.write("UM updated: reload {0} as user {1}".format(cmd, self.user), "UM.on_command_done", "debug")

            if nid == "umrefresh":
                # Build installed packages info list
                self.apt.createPackagesInfoList()
                # Run post update when needed
                self.postUpdate()

            if nid == "ummaintenance":
                self.enableMaintenance(True)
                self.fillTreeViewMaintenance()
                self.btnInstall.set_sensitive(True)
                self.btnRefresh.set_sensitive(True)
                self.btnPackages.set_sensitive(True)
                self.btnMaintenance.set_sensitive(True)
                self.showMaintenance()
            else:
                if nid == 'umupd':
                    # Save update version in hist file
                    self.umglobal.saveHistVersion("upd", self.umglobal.serverUpdVersion)
                    self.log.write("Save history upd=%s" % self.umglobal.serverUpdVersion, "UM.on_btnInstall_clicked", "debug")
                    self.deleteScripts()

                # Refresh data after install or update
                self.umglobal.collectData()
                self.apt.createPackageLists()
                self.fillTreeView()

                if not self.quickUpdate:
                    self.btnInstall.set_sensitive(True)
                    self.btnRefresh.set_sensitive(True)
                    self.btnPackages.set_sensitive(True)
                    self.btnMaintenance.set_sensitive(True)
                    self.loadInfo()

                if self.umglobal.newUpd:
                    self.showInfo()
                else:
                    aptHasErrors = self.apt.aptHasErrors()
                    if aptHasErrors is not None:
                        self.showInfoDlg(self.aptErrorText, aptHasErrors)
                    elif self.upgradables:
                        if not self.quickUpdate:
                            self.showPackages()
                    else:
                        if not self.quickUpdate:
                            self.showInfo()
                            self.showInfoDlg(self.btnInfo.get_label(), self.uptodateText)

            # Cleanup name file(s)
            for fle in glob(join(self.filesDir, '.um*')):
                remove(fle)

    def createLogString(self, packagesList):
        lst = []
        for data in packagesList:
            lst.append(data[0])
        return ' '.join(lst)

    def refresh(self):
        prog = self.apt.getAptCacheLockedProgram(self.umglobal.settings["apt-packages"])
        if prog is not None:
            msg = _("Another program is locking the apt cache\n\n"
                    "Please, close the program before refreshing:\n"
                    "* %s" % prog)
            self.showInfoDlg(self.btnRefresh.get_label(), msg)
            self.log.write("%s is locking the apt cache" % prog, "UM.refresh", "warning")
        else:
            self.btnInfo.set_sensitive(True)
            self.btnPreferences.set_sensitive(True)
            self.btnOutput.set_sensitive(True)
            self.btnRefresh.set_sensitive(False)
            self.btnInstall.set_sensitive(False)
            self.btnMaintenance.set_sensitive(False)
            self.btnPackages.set_sensitive(True)

            self.showOutput()
            cmd = "dpkg --configure -a; %s -f install; apt-get update" % self.umglobal.settings['apt-get-string']
            nid = 'umrefresh'
            self.prepForCommand(nid)
            self.terminal.executeCommand(cmd, nid)
            self.apt.initAptShowVersions()
            self.log.write("Execute command: %s (%s)" % (cmd, nid), "UM.refresh", "debug")

    def postUpdate(self):
        # Check for changed version information
        if self.umglobal.newUpd and self.umglobal.serverUpdVersion is not None:
            self.getScripts([self.umglobal.settings['pre-upd'].replace("[VERSION]", self.umglobal.serverUpdVersion),
                            self.umglobal.settings['post-upd'].replace("[VERSION]", self.umglobal.serverUpdVersion)])

    def fillTreeView(self):
        # First check if this application is upgradable
        self.upgradableUM = self.getUpgradablePackages(packageNames=["updatemanager"])
        if self.upgradableUM:
            self.upgradables = self.upgradableUM
        else:
            # Get a list of packages that can be upgraded
            self.upgradableUM = []
            self.upgradables = self.getUpgradablePackages()
            #if not self.upgradables:
                ## Check for black listed packages
                #cmd = "dpkg --get-selections | grep hold$ | awk '{print $1}'"
                #lst = self.ec.run(cmd, False)
                #for pck in lst:
                    #self.upgradables.append([pck.strip(), _("blacklisted"), ""])

        if not self.quickUpdate:
            contentList = [[_("Package"), _("Current version"), _("New version")]] + self.upgradables
            self.tvHandler.fillTreeview(contentList=contentList, columnTypesList=['str', 'str', 'str'], firstItemIsColName=True)

    def getUpgradablePackages(self, packageNames=[]):
        upckList = []
        if packageNames:
            upckList = []
            for packageName in packageNames:
                for upck in self.apt.upgradablePackages:
                    if upck[0] == packageName:
                        upckList.append(upck)
                        break
        else:
            upckList = self.apt.upgradablePackages
        return upckList

    def getDistUpgradeInfo(self, upgradablesOnly=False):
        info = ""
        if upgradablesOnly:
            if self.apt.upgradablePackages:
                info = "<strong>%s</strong><br>" % self.apt.upgradablePackagesText
                for pck in self.apt.upgradablePackages:
                    info += "%s " % pck[0]
        else:
            if self.apt.removedPackages:
                info = "<strong>%s</strong><br>" % self.removedPackagesText
                for pck in self.apt.removedPackages:
                    info += "%s " % pck[0]
            if self.apt.newPackages:
                if info != "":
                    info += "<p>&nbsp;</p>"
                info += "<strong>%s</strong><br>" % self.newPackagesText
                for pck in self.apt.newPackages:
                    info += "%s " % pck[0]
            if self.apt.heldbackPackages:
                if info != "":
                    info += "<p>&nbsp;</p>"
                info += "<strong>%s</strong><br>" % self.heldbackPackagesText
                for pck in self.apt.heldbackPackages:
                    info += "%s " % pck[0]
            if self.apt.downgradablePackages:
                if info != "":
                    info += "<p>&nbsp;</p>"
                info += "<strong>%s</strong><br>" % self.downgradePackagesText
                for pck in self.apt.downgradablePackages:
                    info += "%s " % pck[0]
        return info

    def showPackages(self):
        self.nbMain.set_current_page(0)

    def showOutput(self):
        self.nbMain.set_current_page(1)
        self.terminal.grab_focus()

    def showInfo(self):
        #self.nbMain.set_current_page(2)
        self.showInfoDlg("Trail Update Manager", "Version: 1.0")

    def showMaintenance(self):
        self.nbMain.set_current_page(3)

    def showInfoDlg(self, title, message):
        MessageDialog(title, message, parent=self.window)

    def showConfirmationDlg(self, title, message):
        head = "<html><head><style>body { font-family: Arial, Helvetica, Verdana, Sans-serif; font-size: 12px; color: #555555; background: #ffffff; }</style></head><body>"
        end = "</body></html>"
        html = "%s%s%s" % (head, message, end)
        sw = Gtk.ScrolledWindow()
        sw.add(SimpleBrowser(html))
        return CustomQuestionDialog(title, sw, 550, 300, self.window).show()

    # Get pre-install script and post-install script from the server
    def getScripts(self, files):
        for fle in files:
            flePath = join(self.filesDir, fle)
            if not exists(flePath):
                # Get the new scripts if they exist
                url = join(self.umglobal.umfilesUrl, fle)
                try:
                    txt = urlopen(url).read().decode('utf-8')
                    if txt != '':
                        # Save to a file and make executable
                        self.log.write("Save script = %s" % flePath, "UM.getScripts", "debug")
                        with open(flePath, 'w') as f:
                            f.write(txt)
                        chmod(flePath, 0o755)
                except:
                    pass

    def loadInfo(self):
        url = join("file://%s" % self.scriptDir, self.umglobal.settings['not-found'])
        self.btnInfo.set_icon_name("help-about")
        if self.umglobal.umfilesUrl is not None:
            url = "%s/%s" % (self.umglobal.umfilesUrl, self.umglobal.settings['upd-info'])

        self.log.write("Load info url: %s" % url, "UM.loadInfo", "debug")

        children = self.swInfo.get_children()
        if children:
            children[0].openUrl(url)
        else:
            self.swInfo.add(SimpleBrowser(url))

    def pushMessage(self, message):
        if message is not None:
            context = self.statusbar.get_context_id('message')
            self.statusbar.push(context, message)

    def checkFilesDir(self):
        if not exists(self.filesDir):
            makedirs(self.filesDir)
        oldFiles = glob(join(self.scriptDir, 'pre-*')) + \
                   glob(join(self.scriptDir, 'post-*')) + \
                   [join(self.scriptDir, 'updatemanager.hist')] + \
                   [join(self.scriptDir, 'mirrors.list')]
        for fle in oldFiles:
            if exists(fle):
                fleName = basename(fle)
                if not exists(join(self.filesDir, fleName)):
                    move(fle, self.filesDir)
                else:
                    remove(fle)
        chmod(self.filesDir, 0o777)

    def deleteScripts(self, UpdVersion=None):
        UpdVersion = "*"
        if UpdVersion is not None:
            UpdVersion = "*%s" % UpdVersion

        oldFiles = glob(join(self.filesDir, "pre-%s" % UpdVersion)) + glob(join(self.filesDir, "post-%s" % UpdVersion))
        for fle in oldFiles:
            remove(fle)
            self.log.write("Cleanup file: %s" % fle, "UM.deleteScripts", "debug")

    # Close the gui
    def on_windowMain_destroy(self, widget):
        # Close the app
        Gtk.main_quit()

if __name__ == '__main__':
    # Create an instance of our GTK application
    try:
        UpdateManager()
        Gtk.main()
    except KeyboardInterrupt:
        pass
