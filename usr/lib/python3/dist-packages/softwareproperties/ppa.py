#  software-properties PPA support
#
#  Copyright (c) 2004-2009 Canonical Ltd.
#
#  Author: Michael Vogt <mvo@debian.org>
#
#  This program is free software; you can redistribute it and/or
#  modify it under the terms of the GNU General Public License as
#  published by the Free Software Foundation; either version 2 of the
#  License, or (at your option) any later version.
#
#  This program is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#  GNU General Public License for more details.
#
#  You should have received a copy of the GNU General Public License
#  along with this program; if not, write to the Free Software
#  Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307
#  USA

from __future__ import print_function

import apt_pkg
import json
import os
import re
import shutil
import subprocess
import tempfile

from threading import Thread

try:
    import urllib.request
    from urllib.error import URLError
    import urllib.parse
    from http.client import HTTPException
    NEED_PYCURL = False
except ImportError:
    NEED_PYCURL = True
    import pycurl

DEFAULT_KEYSERVER = "hkp://keyserver.ubuntu.com:80/"
# maintained until 2015
LAUNCHPAD_PPA_API = 'https://launchpad.net/api/1.0/~%s/+archive/%s'
# Specify to use the system default SSL store; change to a different path
# to test with custom certificates.
LAUNCHPAD_PPA_CERT = "/etc/ssl/certs/ca-certificates.crt"


class CurlCallback:
    def __init__(self):
        self.contents = ''

    def body_callback(self, buf):
        self.contents = self.contents + buf


class PPAException(Exception):

    def __init__(self, value, original_error=None):
        self.value = value
        self.original_error = original_error

    def __str__(self):
        return repr(self.value)


def encode(s):
    return re.sub("[^a-zA-Z0-9_-]", "_", s)


def expand_ppa_line(abrev, distro_codename):
    """ Convert an abbreviated ppa name of the form 'ppa:$name' to a
        proper sources.list line of the form 'deb ...' """
    # leave non-ppa: lines unchanged
    if not abrev.startswith("ppa:"):
        return (abrev, None)
    # FIXME: add support for dependency PPAs too (once we can get them
    #        via some sort of API, see LP #385129)
    abrev = abrev.split(":")[1]
    ppa_owner = abrev.split("/")[0]
    try:
        ppa_name = abrev.split("/")[1]
    except IndexError as e:
        ppa_name = "ppa"
    sourceslistd = apt_pkg.config.find_dir("Dir::Etc::sourceparts")
    line = "deb http://ppa.launchpad.net/%s/%s/ubuntu %s main" % (
        ppa_owner, ppa_name, distro_codename)
    filename = os.path.join(sourceslistd, "%s-%s-%s.list" % (
        encode(ppa_owner), encode(ppa_name), distro_codename))
    return (line, filename)


def get_ppa_info_from_lp(owner_name, ppa_name):
    lp_url = LAUNCHPAD_PPA_API % (owner_name, ppa_name)
    if NEED_PYCURL:
        # python2 has no cert verification so we need pycurl
        return _get_https_content_pycurl(lp_url)
    else:
        # python3 has cert verification so we can use the buildin urllib
        return _get_https_content_py3(lp_url)

def _get_https_content_py3(lp_url):
    try:
        request = urllib.request.Request(str(lp_url), headers={"Accept":" application/json"})
        lp_page = urllib.request.urlopen(request, cafile=LAUNCHPAD_PPA_CERT)
        json_data = lp_page.read().decode("utf-8", "strict")
    except (URLError, HTTPException) as e:
        # HTTPException doesn't have a reason but might have a string
        # representation
        reason = hasattr(e, "reason") and e.reason or e
        raise PPAException("Error reading %s: %s" % (lp_url, reason), e)
    return json.loads(json_data)

def _get_https_content_pycurl(lp_url):
    # this is the fallback code for python2
    try:
        callback = CurlCallback()
        curl = pycurl.Curl()
        curl.setopt(pycurl.SSL_VERIFYPEER, 1)
        curl.setopt(pycurl.SSL_VERIFYHOST, 2)
        curl.setopt(pycurl.WRITEFUNCTION, callback.body_callback)
        if LAUNCHPAD_PPA_CERT:
            curl.setopt(pycurl.CAINFO, LAUNCHPAD_PPA_CERT)
        curl.setopt(pycurl.URL, str(lp_url))
        curl.setopt(pycurl.HTTPHEADER, ["Accept: application/json"])
        curl.perform()
        curl.close()
        json_data = callback.contents
    except pycurl.error as e:
        raise PPAException("Error reading %s: %s" % (lp_url, e), e)
    return json.loads(json_data)

def verify_keyid_is_v4(signing_key_fingerprint):
    """Verify that the keyid is a v4 fingerprint with at least 160bit"""
    return len(signing_key_fingerprint) >= 160/8


class AddPPASigningKeyThread(Thread):
    " thread class for adding the signing key in the background "

    GPG_DEFAULT_OPTIONS = ["gpg", "--no-default-keyring", "--no-options"]

    def __init__(self, ppa_path, keyserver=None):
        Thread.__init__(self)
        self.ppa_path = ppa_path
        self.keyserver = (keyserver if keyserver is not None
                          else DEFAULT_KEYSERVER)

    def run(self):
        self.add_ppa_signing_key(self.ppa_path)

    def _recv_key(self, keyring, secret_keyring, signing_key_fingerprint, keyring_dir):
        try:
            # double check that the signing key is a v4 fingerprint (160bit)
            if not verify_keyid_is_v4(signing_key_fingerprint):
                print("Error: signing key fingerprint '%s' too short" % 
                    signing_key_fingerprint)
                return False
        except TypeError:
            print("Error: signing key fingerprint does not exist")
            return False
        # then get it
        res = subprocess.call(self.GPG_DEFAULT_OPTIONS + [
            "--homedir", keyring_dir,
            "--secret-keyring", secret_keyring,
            "--keyring", keyring,
            "--keyserver", self.keyserver,
            "--recv", signing_key_fingerprint,
            ])
        return (res == 0)

    def _export_key(self, keyring, export_keyring, signing_key_fingerprint, keyring_dir):
        res = subprocess.call(self.GPG_DEFAULT_OPTIONS + [
          "--homedir", keyring_dir,
          "--keyring", keyring,
          "--output", export_keyring,
          "--export", signing_key_fingerprint,
          ])
        if res != 0:
            return False
        return True

    def _get_fingerprints(self, keyring, keyring_dir):
        cmd = self.GPG_DEFAULT_OPTIONS + [
          "--homedir", keyring_dir,
          "--keyring", keyring,
          "--fingerprint",
          "--batch",
          "--with-colons",
          ]
        output = subprocess.check_output(cmd, universal_newlines=True)
        fingerprints = []
        for line in output.splitlines():
            if line.startswith("fpr:"):
                fingerprints.append(line.split(":")[9])
        return fingerprints

    def _verify_fingerprint(self, keyring, expected_fingerprint, keyring_dir):
        got_fingerprints = self._get_fingerprints(keyring, keyring_dir)
        if len(got_fingerprints) > 1:
            print("Got '%s' fingerprints, expected only one" % 
                  len(got_fingerprints))
            return False
        got_fingerprint = got_fingerprints[0]
        if got_fingerprint != expected_fingerprint:
            print("Fingerprints do not match, not importing: '%s' != '%s'" % (
                    expected_fingerprint, got_fingerprint))
            return False
        return True

    def add_ppa_signing_key(self, ppa_path):
        """Query and add the corresponding PPA signing key.
        
        The signing key fingerprint is obtained from the Launchpad PPA page,
        via a secure channel, so it can be trusted.
        """
        def cleanup(tmpdir):
            shutil.rmtree(tmp_keyring_dir)
        owner_name, ppa_name, distro = ppa_path[1:].split('/')
        try:
            ppa_info = get_ppa_info_from_lp(owner_name, ppa_name)
        except PPAException as e:
            print(e.value)
            return False
        try:
            signing_key_fingerprint = ppa_info["signing_key_fingerprint"]
        except IndexError as e:
            print("Error: can't find signing_key_fingerprint at %s" % ppa_path)
            return False
        # create temp keyrings
        tmp_keyring_dir = tempfile.mkdtemp()
        tmp_secret_keyring = os.path.join(tmp_keyring_dir, "secring.gpg")
        tmp_keyring = os.path.join(tmp_keyring_dir, "pubring.gpg")
        #  download the key into a temp keyring first
        if not self._recv_key(
            tmp_keyring, tmp_secret_keyring, signing_key_fingerprint, tmp_keyring_dir):
            cleanup(tmp_keyring_dir)
            return False
        # now export the key into a temp keyring using the long key id
        tmp_export_keyring = os.path.join(tmp_keyring_dir, "export-keyring.gpg")
        if not self._export_key(
            tmp_keyring, tmp_export_keyring, signing_key_fingerprint, tmp_keyring_dir):
            cleanup(tmp_keyring_dir)
            return False
        # now verify the fingerprint
        if not self._verify_fingerprint(
            tmp_export_keyring, signing_key_fingerprint, tmp_keyring_dir):
            cleanup(tmp_keyring_dir)
            return False
        # and add it
        trustedgpgd = apt_pkg.config.find_dir("Dir::Etc::trustedparts")
        apt_keyring = os.path.join(trustedgpgd, "%s-%s.gpg" % (
            encode(owner_name), encode(ppa_name)))
        res = subprocess.call(["apt-key", "--keyring", apt_keyring, "add",
            tmp_keyring])
        # cleanup
        cleanup(tmp_keyring_dir)
        return (res == 0)


if __name__ == "__main__":
    import sys
    owner_name, ppa_name = sys.argv[1].split(":")[1].split("/")
    print(get_ppa_info_from_lp(owner_name, ppa_name))
