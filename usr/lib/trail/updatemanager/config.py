#! /usr/bin/env python3

# Class to handle configuration files
# Example:
# [SectionName]
# OptionName = OptionValue

import os
from os.path import dirname, realpath, join, exists
import configparser


class Config():
    def __init__(self, filePath):
        firstChr = filePath[:1]
        if firstChr == '.' or firstChr != '/':
            # Assume only file name
            curDir = dirname(realpath(__file__))
            filePath = join(curDir, filePath)
        else:
            curDir = dirname(filePath)

        self.curDir = curDir
        self.filePath = filePath

        try:
            if not exists(self.curDir):
                os.makedirs(self.curDir)
                print(("> new directory created: %s" % self.curDir))

            if not exists(self.filePath):
                with open(self.filePath, "w") as f:
                    f.write("")
                    print(("> new file created: %s" % self.filePath))
        except Exception as detail:
            print(("ERROR: cannot save configuration file: %s (%s)" % (self.filePath, detail)))

        try:
            if exists(self.filePath):
                os.chmod(self.filePath, 0o666)
        except:
            pass

        self.parser = configparser.ConfigParser(strict=False)
        self.parser.read([self.filePath])

    def getSections(self):
        return self.parser.sections()

    def doesSectionExist(self, section):
        found = False
        for s in self.getSections():
            if s == section:
                found = True
                break
        return found

    def removeSection(self, section):
        self.parser.remove_section(section)
        with open(self.filePath, "w") as f:
            self.parser.write(f)

    def getOptions(self, section):
        options = []
        if self.doesSectionExist(section):
            options = self.parser.items(section)
        return options

    def removeOption(self, section, option):
        self.parser.remove_option(section, option)
        with open(self.filePath, "w") as f:
            self.parser.write(f)

    def getValue(self, section, option):
        value = ''
        try:
            value = self.parser.getint(section, option)
        except ValueError:
            val = self.parser.get(section, option)
            if '\\n' in val:
                valueList = val.split('\\n')
                for v in valueList:
                    value += v + '\n'
            else:
                value = val
        return value

    def setValue(self, section, option, value):
        success = True
        value = str(value)
        try:
            if not self.doesSectionExist(section):
                # Create section first
                print(("> create section %s" % section))
                self.parser.add_section(section)

            self.parser.set(section, option, value)
            with open(self.filePath, "w") as f:
                self.parser.write(f)

        except Exception as detail:
            print(("ERROR: cannot set configuration value: [%s]; %s=%s. %s" % (section, option, value, detail)))
            success = False
        return success
