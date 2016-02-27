#!/usr/bin/env python3

from execcmd import ExecCmd


class UmApt(object):

    def __init__(self, umglobal):
        self.ec = ExecCmd()
        self.umglobal = umglobal
        self.kernelArchitecture = self.umglobal.getKernelArchitecture()

        self.packagesInfo = []

        self.downgradablePackages = []
        self.kernelPackages = []
        self.upgradablePackages = []
        self.newPackages = []
        self.removedPackages = []
        self.heldbackPackages = []
        self.notavailablePackages = []
        self.orphanedPackages = []

        # Build installed packages info list
        #self.createPackagesInfoList()

    def createPackagesInfoList(self):
        # Reset variables
        self.packagesInfo = []

        # Use env LANG=C to ensure the output of apt-show-versions is always en_US
        cmd = "env LANG=C bash -c 'apt-show-versions'"
        # Get the output of the command in a list
        lst = self.ec.run(cmd=cmd, realTime=False)

        # Loop through each line and fill the package lists
        for line in lst:
            items = line.split(" ")

            # Get package name
            if self.kernelArchitecture == "x86_64" and "i386" in items[0]:
                pck = items[0].split("/")[0]
            else:
                pck = items[0].split(":")[0]

            # In case your in Wheezy or older
            if "/" in pck:
                pck = pck.split("/")[0]
                ver = items[len(items) - 3]
            else:
                ver = items[1]

            # Get available version
            avVer = ''
            if "uptodate" in line:
                avVer = ver
            elif "upgradeable" in line:
                avVer = items[len(items) - 1]

            # Add info to list
            self.packagesInfo.append([pck, ver, avVer])

    def createPackageLists(self, customAptGetCommand=""):
        # Reset variables
        upgradablePackagesTmp = []
        heldbackPackagesTmp = []
        self.upgradablePackages = []
        self.newPackages = []
        self.removedPackages = []
        self.heldbackPackages = []

        # Create approriate command
        # Use env LANG=C to ensure the output of dist-upgrade is always en_US
        cmd = "env LANG=C bash -c 'apt-get dist-upgrade --assume-no'"
        #cmd = "env LANG=C bash -c 'apt-get upgrade --assume-no'"
        if "apt-get" in customAptGetCommand:
            customAptGetCommand = customAptGetCommand.replace("--force-yes", "")
            customAptGetCommand = customAptGetCommand.replace("--assume-yes", "")
            customAptGetCommand = customAptGetCommand.replace("--yes", "")
            customAptGetCommand = customAptGetCommand.replace("-y", "")
            cmd = "env LANG=C bash -c '%s --assume-no'" % customAptGetCommand

        # Get the output of the command in a list
        lst = self.ec.run(cmd=cmd, realTime=False)

        # Loop through each line and fill the package lists
        prevLine = None
        for line in lst:
            if line[0:1].strip() == "":
                if "removed:" in prevLine.lower():
                    self.fillPackageList(self.removedPackages, line.strip())
                elif "new packages" in prevLine.lower():
                    self.fillPackageList(self.newPackages, line.strip(), True)
                elif "kept back:" in prevLine.lower():
                    heldbackPackagesTmp.append(line.strip())
                elif "upgraded:" in prevLine.lower():
                    upgradablePackagesTmp.append(line.strip())
            else:
                prevLine = line

        # Create upgradable packages list without held back packages
        for pck in upgradablePackagesTmp:
            if pck not in heldbackPackagesTmp:
                self.fillPackageList(self.upgradablePackages, pck)

        # Create list with held back packages
        for pck in heldbackPackagesTmp:
            self.fillPackageList(self.heldbackPackages, pck)

    def initAptShowVersions(self):
        # Initialize or update package cache only
        cmd = "apt-show-versions -i"
        self.ec.run(cmd=cmd, realTime=False)

    def fillPackageList(self, packageList, line, new=False):
        packages = line.split(" ")
        for package in packages:
            package = package.strip().replace("*", "")
            if new:
                # We're not going to show version info for new packages
                packageList.append([package, "", ""])
            else:
                for info in self.packagesInfo:
                    if package == info[0] or "%s:i386" % package == info[0]:
                        packageList.append(info)
                        break

    def fillNotAvailablePackages(self):
        self.notavailablePackages = []
        # Use env LANG=C to ensure the output of apt-show-versions is always en_US
        cmd = "env LANG=C bash -c 'apt-show-versions' | grep 'available'"
        # Get the output of the command in a list
        lst = self.ec.run(cmd=cmd, realTime=False)

        # Loop through each line and fill the package lists
        for line in lst:
            items = line.split(" ")
            pck = items[0].split(":")[0]
            if pck != "updatemanager":
                if self.kernelArchitecture == "x86_64" and "i386" in items[0]:
                    pck = items[0].split("/")[0]
                ver = items[1]
                avVer = ""
                self.notavailablePackages.append([pck, ver, avVer])

    def fillDowngradablePackages(self):
        self.downgradablePackages = []
        # Use env LANG=C to ensure the output of apt-show-versions is always en_US
        cmd = "env LANG=C bash -c 'apt-show-versions' | grep 'newer'"
        # Get the output of the command in a list
        lst = self.ec.run(cmd=cmd, realTime=False)

        # Loop through each line and fill the package lists
        for line in lst:
            items = line.split(" ")
            pck = items[0].split(":")[0]
            if pck != "updatemanager":
                if self.kernelArchitecture == "x86_64" and "i386" in items[0]:
                    pck = items[0].split("/")[0]
                ver = items[1]
                avVer = self.getDowngradablePackageVersion(pck)
                if ver != avVer:
                    self.downgradablePackages.append([pck, ver, avVer])

    def fillKernelPackages(self):
        self.kernelPackages = []
        # Use env LANG=C to ensure the output of apt-show-versions is always en_US
        cmd = "env LANG=C bash -c 'apt-show-versions | grep ^linux-'"
        # Get the output of the command in a list
        lst = self.ec.run(cmd=cmd, realTime=False)

        # Loop through each line and fill the package lists
        for line in lst:
            items = line.split(" ")
            pck = items[0].split(":")[0]
            if "-image-" in pck \
            or "-headers-" in pck \
            or "-kbuild-" in pck:
                self.kernelPackages.append([pck, items[1], ""])

    def fillOrphanedPackages(self):
        self.orphanedPackages = []
        # Use env LANG=C to ensure the output of apt-show-versions is always en_US
        cmd = "env LANG=C bash -c 'deborphan'"
        # Get the output of the command in a list
        lst = self.ec.run(cmd=cmd, realTime=False)

        # Loop through each line and fill the package lists
        for line in lst:
            pck = line.split(":")[0]
            if pck != "updatemanager":
                if self.kernelArchitecture == "x86_64" and "i386" in line:
                    pck = line
                ver = ""
                avVer = ""
                for info in self.packagesInfo:
                    if pck == info[0]:
                        ver = info[1]
                        avVer = info[2]
                self.orphanedPackages.append([pck, ver, avVer])

    # Get the package version number
    def getDowngradablePackageVersion(self, package):
        cmd = "env LANG=C bash -c 'apt-cache show %s | grep \"^Version:\" | cut -d\" \" -f 2'" % package
        lst = self.ec.run(cmd, realTime=False)
        if len(lst) > 1:
            return lst[1]
        else:
            return lst[0]

    def getPackageVersion(self, package, candidate=False):
        cmd = "env LANG=C bash -c 'apt-cache policy %s | grep \"Installed:\"'" % package
        if candidate:
            cmd = "env LANG=C bash -c 'apt-cache policy %s | grep \"Candidate:\"'" % package
        #lst = self.ec.run(cmd, realTime=False)[0].strip().split(' ')
        #return lst[-1]
        return "1.0"

    def aptHasErrors(self):
        ret = self.ec.run("apt-get --assume-no upgrade", False, False)
        if ret[0:2].upper() == "E:":
            return ret
        return None

    def getAptCacheLockedProgram(self, aptPackages):
        procLst = self.ec.run("ps -U root -u root -o comm=", False)
        for aptProc in aptPackages:
            if aptProc in procLst:
                return aptProc
        return None

    def cleanCache(self, safe=True):
        cmd = "apt-get --yes --force-yes autoclean"
        if not safe:
            cmd = "apt-get --yes --force-yes clean"
        self.ec.run(cmd, realTime=False)
