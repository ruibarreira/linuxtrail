#! /usr/bin/env python3

import sys
import subprocess
from treeview import TreeViewHandler
from gi.repository import Gtk


# Class to execute a command and return the output in an array
class ExecCmd(object):

    def __init__(self, loggerObject=None):
        self.log = loggerObject

    def run(self, cmd, realTime=True, returnAsList=True, outputTreeView=None):
        tvHandler = None
        if outputTreeView is not None:
            tvHandler = TreeViewHandler(outputTreeView)
            tvHandler.fillTreeview([], columnTypesList=['str'])
        msg = "Command to execute: %(cmd)s" % { "cmd": cmd }
        if self.log:
            self.log.write(msg, 'execcmd.run', 'debug')
        else:
            print(msg)

        p = subprocess.Popen([cmd], shell=True, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        lstOut = []
        while True:
            line = p.stdout.readline()
            if not line:
                break
            # Strip the line, also from null spaces (strip() only strips white spaces)
            line = line.decode('utf-8').rstrip().rstrip("\0")
            lstOut.append(line)
            if realTime:
                if tvHandler is not None:
                    tvHandler.fillTreeview([line], columnTypesList=['str'], appendToExisting=True, setCursor=tvHandler.getRowCount())
                if self.log:
                    self.log.write(line, 'execcmd.run', 'info')
                else:
                    print(line)
            sys.stdout.flush()
            while Gtk.events_pending():
                Gtk.main_iteration()

        ret = lstOut
        if not returnAsList:
            ret = "\n".join(lstOut).strip()
        return ret
