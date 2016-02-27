#! /usr/bin/env python3

from gi.repository import Gtk, GObject, GdkPixbuf


# Show message dialog
# Usage:
# MessageDialog(_("My Title"), "Your (error) message here", Gtk.MessageType.ERROR).show()
# Message types:
# Gtk.MessageType.INFO
# Gtk.MessageType.WARNING
# Gtk.MessageType.ERROR
# ThreadedMessageDialog can be called from a working thread
class ThreadedMessageDialog(Gtk.MessageDialog):
    def __init__(self, title, message, style=Gtk.MessageType.INFO, parent=None):
        if isinstance(message, tuple):
            message, text = message
        else:
            text = None

        Gtk.MessageDialog.__init__(self, parent, Gtk.DialogFlags.MODAL | Gtk.DialogFlags.DESTROY_WITH_PARENT, style, Gtk.ButtonsType.OK, message)

        if text:
            self.format_secondary_text(text)
        self.set_default_response(Gtk.ResponseType.OK)
        self.set_position(Gtk.WindowPosition.CENTER)
        self.set_title(title)
        if parent is not None:
            self.set_icon(parent.get_icon())

        self.connect('response', self._handle_clicked)

    def _handle_clicked(self, *args):
        self.destroy()

    def run(self):
        GObject.timeout_add(0, self._do_show_dialog)

    def _do_show_dialog(self):
        self.show_all()
        return False


# Show unthreaded message dialog
# Usage:
# MessageDialog(_("My Title"), "Your (error) message here", Gtk.MessageType.ERROR).show()
# Message types:
# Gtk.MessageType.INFO
# Gtk.MessageType.WARNING
# Gtk.MessageType.ERROR
# MessageDialog can NOT be called from a working thread, only from main (UI) thread
class MessageDialog(Gtk.MessageDialog):
    def __init__(self, title, message, style=Gtk.MessageType.INFO, parent=None):
        if isinstance(message, tuple):
            message, text = message
        else:
            text = None

        Gtk.MessageDialog.__init__(self, parent, Gtk.DialogFlags.MODAL | Gtk.DialogFlags.DESTROY_WITH_PARENT, style, Gtk.ButtonsType.OK, message)

        if text:
            self.format_secondary_text(text)
        self.set_default_response(Gtk.ResponseType.OK)
        self.set_position(Gtk.WindowPosition.CENTER)
        self.set_title(title)
        if parent is not None:
            self.set_icon(parent.get_icon())

        self.connect('response', self._handle_clicked)

        self.run()

    def _handle_clicked(self, *args):
        self.destroy()


# Create question dialog
# Usage:
# dialog = QuestionDialog(_("My Title"), _("Put your question here?"))
#    if (dialog.show()):
# QuestionDialog can NOT be called from a working thread, only from main (UI) thread
class QuestionDialog(Gtk.MessageDialog):
    def __init__(self, title, question, parent=None):
        if isinstance(question, tuple):
            question, text = question
        else:
            text = None

        self.question = question
        self.response = None

        Gtk.MessageDialog.__init__(self, parent, Gtk.DialogFlags.MODAL | Gtk.DialogFlags.DESTROY_WITH_PARENT, Gtk.MessageType.QUESTION, Gtk.ButtonsType.YES_NO, question)

        if text:
            self.format_secondary_text(text)
        self.set_title(title)
        self.set_position(Gtk.WindowPosition.CENTER)
        if parent is not None:
            self.set_icon(parent.get_icon())

        self.connect('response', self.__class__.do_response)

    def do_response(self, id):
        self.response = id

    #''' Show me on screen '''
    def run(self):
        Gtk.MessageDialog.run(self)
        self.destroy()
        if self.response == Gtk.ResponseType.YES:
            return True
        else:
            return False


# Create a custom question dialog
# Usage:
# dialog = CustomQuestionDialog(_("My Title"), myCustomObject, 600, 450, parentWindow))
#    if (dialog.show()):
# CustomQuestionDialog can NOT be called from a working thread, only from main (UI) thread
class CustomQuestionDialog(Gtk.Dialog):
    def __init__(self, title, myObject, width=500, height=300, parent=None):
        self.title = title
        self.myObject = myObject
        self.parent = parent
        self.width = width
        self.height = height

    def show(self):
        dialog = Gtk.Dialog(self.title, self.parent, Gtk.DialogFlags.MODAL | Gtk.DialogFlags.DESTROY_WITH_PARENT, (Gtk.STOCK_CANCEL, Gtk.ResponseType.CANCEL, Gtk.STOCK_OK, Gtk.ResponseType.OK))
        dialog.set_position(Gtk.WindowPosition.CENTER)
        dialog.set_default_size(self.width, self.height)
        if self.parent is not None:
            dialog.set_icon(self.parent.get_icon())

        buttonbox = dialog.get_action_area()
        buttons = buttonbox.get_children()
        dialog.set_focus(buttons[0])

        dialog.vbox.pack_start(self.myObject, True, True, 0)
        dialog.show_all()

        answer = dialog.run()
        if answer == Gtk.ResponseType.OK:
            return_value = True
        else:
            return_value = False
        dialog.destroy()
        return return_value


# You can pass a Gtk.FileFilter object.
# Use add_mime_type, and add_pattern.
# Get the mime type of a file: $ mimetype [file]
# e.g.: $ mimetype solydx32_201311.iso
#         solydx32_201311.iso: application/x-cd-image
class SelectFileDialog(object):
    def __init__(self, title, start_directory=None, parent=None, gtkFileFilter=None):
        self.title = title
        self.start_directory = start_directory
        self.parent = parent
        self.gtkFileFilter = gtkFileFilter
        self.isImages = False
        if gtkFileFilter is not None:
            if gtkFileFilter.get_name() == "Images":
                self.isImages = True

    def show(self):
        filePath = None
        image = Gtk.Image()

        # Image preview function
        def image_preview_cb(dialog):
            filename = dialog.get_preview_filename()
            try:
                pixbuf = GdkPixbuf.Pixbuf.new_from_file_at_size(filename, 128, 128)
                image.set_from_pixbuf(pixbuf)
                valid_preview = True
            except:
                valid_preview = False
            dialog.set_preview_widget_active(valid_preview)

        dialog = Gtk.FileChooserDialog(self.title, self.parent, Gtk.FileChooserAction.OPEN, (Gtk.STOCK_CANCEL, Gtk.ResponseType.CANCEL, Gtk.STOCK_OPEN, Gtk.ResponseType.OK))
        dialog.set_default_response(Gtk.ResponseType.OK)
        if self.start_directory is not None:
            dialog.set_current_folder(self.start_directory)
        if self.gtkFileFilter is not None:
            dialog.add_filter(self.gtkFileFilter)

        if self.isImages:
            # Add a preview widget:
            dialog.set_preview_widget(image)
            dialog.connect("update-preview", image_preview_cb)

        answer = dialog.run()
        if answer == Gtk.ResponseType.OK:
            filePath = dialog.get_filename()
        dialog.destroy()
        return filePath


class SelectImageDialog(object):
    def __init__(self, title, start_directory=None, parent=None):
        self.title = title
        self.start_directory = start_directory
        self.parent = parent

    def show(self):
        fleFilter = Gtk.FileFilter()
        fleFilter.set_name("Images")
        fleFilter.add_mime_type("image/png")
        fleFilter.add_mime_type("image/jpeg")
        fleFilter.add_mime_type("image/gif")
        fleFilter.add_pattern("*.png")
        fleFilter.add_pattern("*.jpg")
        fleFilter.add_pattern("*.gif")
        fleFilter.add_pattern("*.tif")
        fleFilter.add_pattern("*.xpm")
        fdg = SelectFileDialog(self.title, self.start_directory, self.parent, fleFilter)
        return fdg.show()


class SelectDirectoryDialog(object):
    def __init__(self, title, start_directory=None, parent=None):
        self.title = title
        self.start_directory = start_directory
        self.parent = parent

    def show(self):
        directory = None
        dialog = Gtk.FileChooserDialog(self.title, self.parent, Gtk.FileChooserAction.SELECT_FOLDER, (Gtk.STOCK_CANCEL, Gtk.ResponseType.CANCEL, Gtk.STOCK_OPEN, Gtk.ResponseType.OK))
        dialog.set_default_response(Gtk.ResponseType.OK)
        if self.start_directory is not None:
            dialog.set_current_folder(self.start_directory)
        answer = dialog.run()
        if answer == Gtk.ResponseType.OK:
            directory = dialog.get_filename()
        dialog.destroy()
        return directory
