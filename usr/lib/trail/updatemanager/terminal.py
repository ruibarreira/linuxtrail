#! /usr/bin/env python3

#      Reference documentation: https://developer.gnome.org/vte/0.28/VteTerminal.html

# Imports
import os
from gi.repository import Vte, Gdk, GObject, Gtk, GLib


class VirtualTerminal(Vte.Terminal):

    __gsignals__ = {
        'command-done': (GObject.SignalFlags.RUN_LAST, GObject.TYPE_NONE, (GObject.TYPE_INT, GObject.TYPE_STRING,)),
        'line-added': (GObject.SignalFlags.RUN_LAST, GObject.TYPE_NONE, (GObject.TYPE_STRING,)),
        }

    def __init__(self, userInputAllowed=True):
        # Set up terminal
        Vte.Terminal.__init__(self)

        #Popup Menu
        self.menu = Gtk.Menu()
        menu_item = Gtk.MenuItem("copy")
        menu_item.connect("activate", lambda w: self.copy_clipboard())
        self.menu.add(menu_item)
        self.menu.show_all()

        self.pid = None
        self.nid = None
        self.uid = os.geteuid()
        self.lastLine = ""

        # Strings to skip starting the timer
        # ==================================
        # pos1 = position of search string:
        #        None = anywhere in the string
        #        Negative number = position from the end of the string
        # pos2 = string list to search for
        #        if a numerical position is given, the list can only contain 1 string
        self.skipOnString = [
                            [None, ["man-db"]],
                            [None, ["run-parts"]],
                            [-1, ["%"]],
                            [-3, ["..."]]
                            ]

        # Terminal settings
        self.set_scroll_on_output(True)
        self.set_scroll_on_keystroke(True)
        self.set_visible(True)
        self.set_encoding("UTF-8")
        self.set_scrollback_lines(-1)
        try:
            self.set_font_from_string("monospace 10")
        except:
            pass
        if not userInputAllowed:
            self.set_can_focus(False)

        self.connect_after('eof', self.on_command_done)
        self.connect_after('child-exited', self.on_command_done)
        self.connect('event', self.on_event)
        self.connect_after("popup-menu", self.on_popup_menu)
        self.connect("button-release-event", self.on_popup_menu)

        # It seems that only KDE testing can handle this
        if os.path.exists("/usr/bin/kde-add-printer"):
            self.connect('contents-changed', self.on_contents_changed)

    def getRGBA(self, hexColor):
        color = Gdk.RGBA()
        color.parse(hexColor)
        return color

    def setTerminalColors(self, foreground, background, palletList=[]):
        # palletList = ['#4A4A4A', '#BD1919', '#118011', '#CE6800', '#1919BC', '#8D138D', '#139494', '#A7A7A7']
        palette = []
        for hexColor in palletList:
            palette.append(self.getRGBA(hexColor))
        # foreground, background, pallete
        try:
            # Jessie
            self.set_colors(self.getRGBA(foreground), self.getRGBA(background), palette)
        except:
            # Wheezy
            self.set_colors_rgba(self.getRGBA(foreground), self.getRGBA(background), palette)

    def on_contents_changed(self, terminal):
        # Get current visible text
        termText = self.get_text(None, None)[0].split('\n')

        for line in reversed(termText):
            line = line.strip()
            if line != "" and not "%" in line:
                if line == self.lastLine:
                    break
                else:
                    self.lastLine = line
                    Gdk.threads_enter()
                    self.emit('line-added', self.lastLine)
                    Gdk.threads_leave()
                    break

    def executeCommand(self, command_string, id_name):
        '''executeCommand runs the command_string in the terminal. This
        function will only return when on_command_done has been triggered.'''
        #if self.pid is not None:
            #raise ValueError("Terminal already running a command")

        # cwd
        working_directory = ''

        env = os.environ.copy()
        env['TERM'] = "xterm"
        envv = ['%s=%s' % kv for kv in list(env.items())]

        if isinstance(command_string, (tuple, list)):
            argv = command_string
        else:
            argv = ['/bin/bash', '-c', 'clear;echo;echo;' + command_string]

        self.nid = id_name
        print(("Terminal execute command: %s" % command_string))
        try:
            # Jessie
            self.pid = self.spawn_sync(Vte.PtyFlags.DEFAULT,
                                           working_directory,
                                           argv,
                                           envv,
                                           GLib.SpawnFlags.DO_NOT_REAP_CHILD,
                                           None,
                                           None)[1]
        except:
            # Wheezy
            self.pid = self.fork_command_full(Vte.PtyFlags.DEFAULT,
                                           working_directory,
                                           argv,
                                           envv,
                                           GLib.SpawnFlags.DO_NOT_REAP_CHILD,
                                           None,
                                           None)[1]

    def on_command_done(self, status=None, user_data=None):
        Gdk.threads_enter()
        self.emit('command-done', self.pid, self.nid)
        Gdk.threads_leave()
        '''When called this function sets the pid to None, allowing
        the executeCommand function to exit'''
        self.pid = None

    def on_popup_menu(self, terminal, event=None):
        # Display contextual menu on right-click
        if event and self.get_has_selection():
            if event.type == Gdk.EventType.BUTTON_RELEASE and event.button == 3:
                return self.menu.popup(None, None, None, None, 3, 0)

    def on_event(self, terminal, event):
        if (event.type == Gdk.EventType.ENTER_NOTIFY):
            self.grab_focus()
