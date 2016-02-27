#! /usr/bin/env python3

# Depends: curl

import os
import threading
import datetime
from execcmd import ExecCmd


class MirrorGetSpeed(threading.Thread):
    def __init__(self, mirrors, queue, umglobal):
        threading.Thread.__init__(self)
        self.ec = ExecCmd()
        self.umglobal = umglobal
        self.mirrors = mirrors
        self.queue = queue

    def run(self):
        httpCode = -1
        dlSpeed = 0
        for mirrorData in self.mirrors:
            try:
                mirror = mirrorData[3].strip()
                if mirror.endswith('/'):
                    mirror = mirror[:-1]

                # Check Debian repository
                httpCode = -1
                dlSpeed = 0
                url = "%s/%s" % (mirror, self.umglobal.settings["dl-test"])
                cmd = "curl --connect-timeout %d -m %d -w '%%{http_code}\n%%{speed_download}\n' -o /dev/null -s http://%s" % (int(self.umglobal.settings["timeout-secs"] / 2), self.umglobal.settings["timeout-secs"], url)

                lst = self.ec.run(cmd, False)
                if lst:
                    httpCode = int(lst[0])
                    dlSpeed = lst[1]
                    # Download speed returns as string with decimal separator
                    # On non-US systems converting to float throws an error
                    # Split on the separator, and use the left part only
                    if ',' in dlSpeed:
                        dlSpeed = dlSpeed.split(',')[0]
                    elif '.' in dlSpeed:
                        dlSpeed = dlSpeed.split('.')[0]
                    dlSpeed = int(dlSpeed) / 1000

                    self.queue.put([mirror, "%d Kb/s" % dlSpeed])
                    print(("Server {0} - {1} Kb/s ({2})".format(mirror, dlSpeed, self.getHumanReadableHttpCode(httpCode))))

            except Exception as detail:
                # This is a best-effort attempt, fail graciously
                print(("Error: http code = {} / error = {}".format(self.getHumanReadableHttpCode(httpCode), detail)))

    def getHumanReadableHttpCode(self, httpCode):
        if httpCode == 200:
            return "OK"
        elif httpCode == 403:
            return "403: forbidden"
        elif httpCode == 404:
            return "404: not found"
        elif httpCode >= 500:
            return "%d: server error" % httpCode
        else:
            return "Error: %d" % httpCode


class Mirror():
    def __init__(self):
        self.ec = ExecCmd()

    def save(self, replaceRepos, excludeStrings=[]):
        try:
            src = '/etc/apt/sources.list'
            if os.path.exists(src):
                new_repos = []
                srcList = []
                with open(src, 'r') as f:
                    srcList = f.readlines()
                for line in srcList:
                    line = line.strip()
                    if not line.startswith('#'):
                        for repo in replaceRepos:
                            if repo[0] in line:
                                skip = False
                                for excl in excludeStrings:
                                    if excl in line:
                                        skip = True
                                        break
                                if not skip:
                                    line = line.replace(repo[0], repo[1])
                    new_repos.append(line)

                if new_repos:
                    # Backup the current sources.list
                    dt = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
                    print(("Backup %(src)s to %(src)s.%(date)s" % { "src": src, "src": src, "date": dt }))
                    os.system("cp -f %s %s.%s" % (src, src, dt))
                    # Save the new sources.list
                    with open(src, 'w') as f:
                        for repo in new_repos:
                            f.write("%s\n" % repo)

            return True

        except Exception as detail:
            # This is a best-effort attempt, fail graciously
            print(("Error: %s" % str(detail)))
            return False
