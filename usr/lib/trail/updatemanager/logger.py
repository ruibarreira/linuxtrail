#! /usr/bin/env python3

import os
import pwd
import logging
import re
from shutil import move
from gi.repository import Gtk
from dialogs import MessageDialog
from treeview import TreeViewHandler


class Logger():

    def __init__(self, logPath='', defaultLogLevel='debug', addLogTime=True, rtObject=None, parent=None, maxSizeKB=None):
        self.logPath = logPath
        if self.logPath != '':
            if self.logPath[:1] != '/':
                homeDir = pwd.getpwuid(os.getuid()).pw_dir
                self.logPath = os.path.join(homeDir, self.logPath)
        self.defaultLevel = getattr(logging, defaultLogLevel.upper())
        self.logTime = addLogTime
        self.rtobject = rtObject
        self.typeString = self.getTypeString(self.rtobject)
        self.parent = parent
        self.maxSizeKB = maxSizeKB

        if self.logPath == '':
            # Log only to console
            logging.basicConfig(level=self.defaultLevel, format='%(levelname)-10s%(message)s')
        else:
            if os.path.exists(self.logPath) and self.maxSizeKB is not None:
                b = os.path.getsize(self.logPath)
                if b > self.maxSizeKB * 1024:
                    old = "%s.old" % self.logPath
                    if os.path.exists(old):
                        os.remove(old)
                    move(self.logPath, "%s.old" % self.logPath)
            # Set basic configuration
            formatStr = '%(name)-30s%(levelname)-10s%(message)s'
            dateFmtStr = None
            if addLogTime:
                formatStr = '%(asctime)s ' + formatStr
                dateFmtStr = '%d-%m-%Y %H:%M:%S'

            # Log to file
            logging.basicConfig(filename=self.logPath, level=self.defaultLevel, format=formatStr, datefmt=dateFmtStr)

            # Define a Handler which writes INFO messages or higher to the console
            # Debug messages are written to a specified log file
            console = logging.StreamHandler()
            console.setLevel(logging.INFO)
            formatter = logging.Formatter('%(levelname)-10s%(message)s')
            console.setFormatter(formatter)
            logging.getLogger('').addHandler(console)

    # Write message
    def write(self, message, loggerName='log', logLevel='debug', showErrorDialog=True):
        message = str(message).strip()
        if message != '':
            logLevel = logLevel.lower()
            myLogger = logging.getLogger(loggerName)
            if logLevel == 'debug':
                myLogger.debug(message)
            elif logLevel == 'info':
                myLogger.info(message)
                self.rtobjectWrite(message)
            elif logLevel == 'warning':
                myLogger.warning(message)
                self.rtobjectWrite(message)
            elif logLevel == 'error':
                myLogger.error(message)
                self.rtobjectWrite(message)
                if showErrorDialog:
                    MessageDialog('Error', message, Gtk.MessageType.ERROR, self.parent).show()
            elif logLevel == 'critical':
                myLogger.critical(message)
                self.rtobjectWrite(message)
                if showErrorDialog:
                    MessageDialog('Critical', message, Gtk.MessageType.ERROR, self.parent).show()
            elif logLevel == 'exception':
                myLogger.exception(message)
                self.rtobjectWrite(message)
                if showErrorDialog:
                    MessageDialog('Exception', message, Gtk.MessageType.ERROR, self.parent).show()

    # Return messge to given object
    def rtobjectWrite(self, message):
        if self.rtobject is not None and self.typeString != '':
            if 'label' in self.typeString.lower():
                self.rtobject.set_text(message)
            elif 'treeview' in self.typeString.lower():
                tvHandler = TreeViewHandler(self.rtobject)
                tvHandler.fillTreeview([message], ['str'], [-1], 0, 400, False, True, True, fontSize=10000)
            elif 'statusbar' in self.typeString.lower():
                self.pushMessage(message)
            else:
                # For obvious reasons: do not log this...
                print(('Return object type not implemented: %s' % self.typeString))

    # Return the type string of a object
    def getTypeString(self, object):
        tpString = ''
        tp = str(type(object))
        matchObj = re.search("'(.*)'", tp)
        if matchObj:
            tpString = matchObj.group(1)
        return tpString

    def pushMessage(self, message):
        if message is not None:
            context = self.rtobject.get_context_id('message')
            self.rtobject.push(context, message)


# Test
#log = Logger('myapp.log') # Log file and console
#log = Logger() # Console only
#log.write('Dit is een debug test', 'myapp.gui', 'debug') # Should not end up in console when writing to log file
#log.write('Dit is een info test', 'myapp.gui', 'info')
#log.write('Dit is een warning test', 'myapp.gui', 'warning')
#log.write('Dit is een error test', 'myapp.gui', 'error')
