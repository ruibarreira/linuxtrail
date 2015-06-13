from gi.repository import Caribou, GObject
from window import AntlerWindowEntry
from keyboard_view import AntlerKeyboardView
import sys

class AntlerKeyboardService(Caribou.KeyboardService):
    def __init__(self):
        GObject.GObject.__init__(self)
        self.register_keyboard("Antler")
        self.window = AntlerWindowEntry(AntlerKeyboardView)

    def run(self):
        loop = GObject.MainLoop()
        loop.run()

    def do_show(self, timestamp):
        self.window.show_all()

    def do_hide(self, timestamp):
        self.window.hide()

    def do_set_cursor_location (self, x, y, w, h):
        self.window.set_cursor_location(x, y, w, h)

    def do_set_entry_location (self, x, y, w, h):
        self.window.set_entry_location(x, y, w, h)

    def do_name_lost (self, name):
        sys.stderr.write("Another service acquired %s, quitting..\n" % name)
        sys.exit(0)

if __name__ == "__main__":
    antler_keyboard_service = AntlerKeyboardService()
    antler_keyboard_service.run()
