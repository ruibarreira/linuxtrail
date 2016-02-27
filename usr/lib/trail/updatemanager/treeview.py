#! /usr/bin/env python3

import os
from gi.repository import Gtk, GObject, GdkPixbuf

# Treeview needs subclassing of gobject
# http://www.pygtk.org/articles/subclassing-gobject/sub-classing-gobject-in-python.htm

#def myCallback(self, obj, path, colNr, toggleValue, data=None):
#    print str(toggleValue)
#self.myTreeView = TreeViewHandler(self.myTreeView, self.myLogObject)
#self.myTreeView.connect('checkbox-toggled', self.myCallback)

class TreeViewHandler(GObject.GObject):

    __gsignals__ = {
        'checkbox-toggled': (GObject.SignalFlags.RUN_LAST, GObject.TYPE_NONE,
                            (GObject.TYPE_STRING, GObject.TYPE_INT, GObject.TYPE_BOOLEAN,))
        }

    def __init__(self, treeView, loggerObject=None):
        GObject.GObject.__init__(self)
        self.log = loggerObject
        self.treeview = treeView

    # Clear treeview
    def clearTreeView(self):
        liststore = self.treeview.get_model()
        if liststore is not None:
            liststore.clear()
            self.treeview.set_model(liststore)

    # General function to fill a treeview
    # Set setCursorWeight to 400 if you don't want bold font
    def fillTreeview(self, contentList, columnTypesList, setCursor=0, setCursorWeight=400, firstItemIsColName=False, appendToExisting=False, appendToTop=False, fontSize=10000, fixedImgHeight=None):
        # Check if this is a multi-dimensional array
        multiCols = self.isListOfLists(contentList)
        colNameList = []

        if len(contentList) == 0 or (len(self.treeview.get_columns()) !=  len(columnTypesList)):
            # Empty treeview
            self.clearTreeView()

        liststore = self.treeview.get_model()
        if liststore is None or not appendToExisting:
            # Dirty but need to dynamically create a list store
            for col in self.treeview.get_columns():
                self.treeview.remove_column(col)
            dynListStore = 'Gtk.ListStore('
            for i in range(len(columnTypesList)):
                dynListStore += str(columnTypesList[i]) + ', '
            dynListStore += 'int, int)'
            msg = "Create list store eval string: %(eval)s" % { "eval": dynListStore }
            print(msg)
            if self.log:
                self.log.write(msg, 'self.treeview.fillTreeview', 'debug')
            liststore = eval(dynListStore)

        # Create list with column names
        if not appendToExisting:
            if multiCols:
                #for i in range(len(contentList[0])):
                for i in range(len(columnTypesList)):
                    if firstItemIsColName and len(contentList) > 0:
                        msg = "First item is column name (multi-column list): %(iscolname)s" % { "iscolname": contentList[0][i] }
                        print(msg)
                        if self.log:
                            self.log.write(msg, 'self.treeview.fillTreeview', 'debug')
                        colNameList.append(contentList[0][i])
                    else:
                        colNameList.append('Column ' + str(i))
            else:
                if firstItemIsColName and len(contentList) > 0:
                    msg = "First item is column name (single-column list): %(iscolname)s" % { "iscolname": contentList[0] }
                    print(msg)
                    if self.log:
                        self.log.write(msg, 'self.treeview.fillTreeview', 'debug')
                    colNameList.append(contentList[0])
                else:
                    colNameList.append('Column 0')

            msg = "Create column names: %(cols)s" % { "cols": str(colNameList) }
            print(msg)
            if self.log:
                self.log.write(msg, 'self.treeview.fillTreeview', 'debug')

        # Add data to the list store
        for i in range(len(contentList)):
            # Skip first row if that is a column name
            skip = False
            if firstItemIsColName and i == 0:
                msg = "First item is column name: skip first item"
                print(msg)
                if self.log:
                    self.log.write(msg, 'self.treeview.fillTreeview', 'debug')
                skip = True

            if not skip:
                weight = 400
                weightRow = setCursor
                if firstItemIsColName:
                    weightRow += 1
                if i == weightRow:
                    weight = setCursorWeight
                if multiCols:
                    # Dynamically add data for multi-column list store
                    if appendToTop:
                        dynListStoreAppend = 'liststore.insert(0, ['
                    else:
                        dynListStoreAppend = 'liststore.append(['
                    for j in range(len(contentList[i])):
                        val = str(contentList[i][j]).strip()
                        if str(columnTypesList[j]) == 'str':
                            val = '"' + val + '"'
                        if str(columnTypesList[j]) == 'GdkPixbuf.Pixbuf':
                            if os.path.isfile(val):
                                if fixedImgHeight:
                                    pb = GdkPixbuf.Pixbuf.new_from_file(val)
                                    nw = pb.get_width() * (fixedImgHeight / pb.get_height())
                                    val = 'GdkPixbuf.Pixbuf.new_from_file("%(val)s").scale_simple(%(width)s, %(height)s, GdkPixbuf.InterpType.BILINEAR)' % { "val": val, "width": nw, "height": fixedImgHeight }
                                else:
                                    val = 'GdkPixbuf.Pixbuf.new_from_file("%(val)s")' % { "val": val }
                            else:
                                val = None
                        dynListStoreAppend += '%s, ' % val
                    dynListStoreAppend += '%s, %s])' % (str(weight), fontSize)

                    msg = "Add data to list store: %(data)s" % { "data": dynListStoreAppend }
                    #print(msg)
                    if self.log:
                        self.log.write(msg, 'self.treeview.fillTreeview', 'debug')
                    eval(dynListStoreAppend)
                else:
                    if appendToTop:
                        msg = "Add data to top of list store: %(totop)s" % { "totop": str(contentList[i]) }
                        #print(msg)
                        if self.log:
                            self.log.write(msg, 'self.treeview.fillTreeview', 'debug')
                        liststore.insert(0, [contentList[i], weight, fontSize])
                    else:
                        msg = "Add data to bottom of list store: %(tobottom)s" % { "tobottom": str(contentList[i]) }
                        #print(msg)
                        if self.log:
                            self.log.write(msg, 'self.treeview.fillTreeview', 'debug')
                        liststore.append([contentList[i], weight, fontSize])

        # Create columns
        if not appendToExisting:
            for i in range(len(colNameList)):
                # Create a column only if it does not exist
                colFound = ''
                cols = self.treeview.get_columns()
                for col in cols:
                    if col.get_title() == colNameList[i]:
                        colFound = col.get_title()
                        break

                if colFound == '':
                    # Build renderer and attributes to define the column
                    # Possible attributes for text: text, foreground, background, weight
                    attr = ', text=' + str(i) + ', weight=' + str(len(colNameList)) + ', size=' + str(len(colNameList) + 1)
                    renderer = 'Gtk.CellRendererText()'  # an object that renders text into a Gtk.TreeView cell
                    if str(columnTypesList[i]) == 'bool':
                        renderer = 'Gtk.CellRendererToggle()'  # an object that renders a toggle button into a TreeView cell
                        attr = ', active=' + str(i)
                    if str(columnTypesList[i]) == 'GdkPixbuf.Pixbuf':
                        renderer = 'Gtk.CellRendererPixbuf()'  # an object that renders a pixbuf into a Gtk.TreeView cell
                        attr = ', pixbuf=' + str(i)
                    dynCol = 'Gtk.TreeViewColumn("' + str(colNameList[i]) + '", ' + renderer + attr + ')'

                    msg = "Create column: %(col)s" % { "col": dynCol }
                    print(msg)
                    if self.log:
                        self.log.write(msg, 'self.treeview.fillTreeview', 'debug')
                    col = eval(dynCol)

                    # Get the renderer of the column and add type specific properties
                    rend = col.get_cells()[0]
                    #if str(columnTypesList[i]) == 'str':
                        # TODO: Right align text in column - add parameter to function
                        #rend.set_property('xalign', 1.0)
                    if str(columnTypesList[i]) == 'bool':
                        # If checkbox column, add toggle function
                        msg = "Check box found: add toggle function"
                        #print(msg)
                        if self.log:
                            self.log.write(msg, 'self.treeview.fillTreeview', 'debug')
                        rend.connect('toggled', self.tvchk_on_toggle, liststore, i)

                    # Let the last colum fill the treeview
                    if i == len(colNameList):
                        msg = "Last column fills treeview: %(colnr)d" % { "colnr": i }
                        #print(msg)
                        if self.log:
                            self.log.write(msg, 'self.treeview.fillTreeview', 'debug')
                        col.set_sizing(Gtk.TreeViewColumnSizing.FIXED)

                    # Finally add the column
                    self.treeview.append_column(col)
                    msg = "Column added: %(col)s" % { "col": col.get_title() }
                    print(msg)
                    if self.log:
                        self.log.write(msg, 'self.treeview.fillTreeview', 'debug')
                else:
                    msg = "Column already exists: %(col)s" % { "col": colFound }
                    print(msg)
                    if self.log:
                        self.log.write(msg, 'self.treeview.fillTreeview', 'debug')

        # Add liststore, set cursor and set the headers
        self.treeview.set_model(liststore)
        if setCursor >= 0:
            self.treeview.set_cursor(setCursor)
        self.treeview.set_headers_visible(firstItemIsColName)
        if self.log:
            self.log.write("Add Liststore to Treeview", 'self.treeview.fillTreeview', 'debug')

        # Scroll to selected cursor
        selection = self.treeview.get_selection()
        tm, treeIter = selection.get_selected()
        if treeIter:
            path = tm.get_path(treeIter)
            self.treeview.scroll_to_cell(path)
            msg = "Scrolled to selected row: %(row)d" % { "row": setCursor }
            #print(msg)
            if self.log:
                self.log.write(msg, 'self.treeview.fillTreeview', 'debug')

    def tvchk_on_toggle(self, cell, path, liststore, colNr, *ignore):
        if path is not None:
            itr = liststore.get_iter(path)
            toggled = liststore[itr][colNr]
            liststore[itr][colNr] = not toggled
            # Raise the custom trigger
            # parameters: path, column number, toggle value
            self.emit('checkbox-toggled', path, colNr, not toggled)

    # Get the selected value in a treeview
    def getSelectedValue(self, colNr=0):
        # Assume single row selection
        val = None
        (model, pathlist) = self.treeview.get_selection().get_selected_rows()
        if model is not None and pathlist:
            val = model.get_value(model.get_iter(pathlist[0]), colNr)
        return val

    def getSelectedRows(self):
        # Assume single row selection
        rows = []
        colsNr = self.getColumnCount()
        (model, pathlist) = self.treeview.get_selection().get_selected_rows()
        if model is not None:
            for path in pathlist:
                row = []
                for n in range(0, colsNr):
                    row.append(model.get_value(model.get_iter(path), n))
                rows.append([path, row])
        return rows

    # Get the value for a specific path (= row number)
    def getValue(self, path, colNr=0):
        val = None
        model = self.treeview.get_model()
        path = int(path)
        if model is not None and path >= 0:
            val = model.get_value(model.get_iter(path), colNr)
        return val

    # Select the row with a specific value
    def selectValue(self, value, colNr=0):
        if value is not None:
            value = value.strip()
            model = self.treeview.get_model()
            if model is not None:
                i = 0
                itr = model.get_iter_first()
                while itr is not None:
                    if model.get_value(itr, colNr).strip() == value:
                        self.treeview.set_cursor(i)
                        break
                    i += 1
                    itr = model.iter_next(itr)

    # Return all the values in a given column
    def getColumnValues(self, colNr=0):
        cv = []
        model = self.treeview.get_model()
        if model is not None:
            itr = model.get_iter_first()
            while itr is not None:
                cv.append(model.get_value(itr, colNr))
                itr = model.iter_next(itr)
        return cv

    # Return the number of rows counted from iter
    # If iter is None, all rows are counted
    def getRowCount(self, startIter=None):
        nr = 0
        model = self.treeview.get_model()
        if model is not None:
            nr = model.iter_n_children(startIter)
        return nr

    def getColumnCount(self):
        return self.treeview.get_model().get_n_columns()

    def delRow(self, rowNr=None):
        if rowNr is None:
            (model, pathList) = self.treeview.get_selection().get_selected_rows()
            for path in pathList:
                it = model.get_iter(path)
                model.remove(it)
        else:
            model = self.treeview.get_model()
            it = model.get_iter(rowNr)
            model.remove(it)

    def addRow(self, rowList):
        model = self.treeview.get_model()
        model.append(rowList)
        self.treeview.set_model(model)

    def getToggledValues(self, toggleColNr=0, valueColNr=1):
        values = []
        model = self.treeview.get_model()
        if model is not None:
            itr = model.get_iter_first()
            while itr is not None:
                if model[itr][toggleColNr]:
                    values.append(model[itr][valueColNr])
                itr = model.iter_next(itr)
        return values

    # Toggle check box in row
    def treeviewToggleRows(self, toggleColNrList, pathList=None):
        if pathList is None:
            (model, pathList) = self.treeview.get_selection().get_selected_rows()
        else:
            model = self.treeview.get_model()
        # Toggle the check boxes in the given column in the selected rows (=pathList)
        if model is not None:
            for path in pathList:
                for colNr in toggleColNrList:
                    it = model.get_iter(path)
                    model[it][colNr] = not model[it][colNr]

    # Deselect all drivers, except PAE
    def treeviewToggleAll(self, toggleColNrList, toggleValue=False, excludeColNr=-1, excludeValue=''):
        model = self.treeview.get_model()
        if model is not None:
            itr = model.get_iter_first()
            while itr is not None:
                for colNr in toggleColNrList:
                    if excludeColNr >= 0:
                        exclVal = model.get_value(itr, excludeColNr)
                        if exclVal != excludeValue:
                            model[itr][colNr] = toggleValue
                    else:
                        model[itr][colNr] = toggleValue
                    itr = model.iter_next(itr)

    def isListOfLists(self, lst):
        return len(lst) == len([x for x in lst if isinstance(x, list)])

# Register the class
GObject.type_register(TreeViewHandler)


# TODO - implement clickable image in TreeViewHandler
# http://www.daa.com.au/pipermail/pygtk/2010-March/018355.html
#class CellRendererPixbufXt(Gtk.CellRendererPixbuf):
    #"""docstring for CellRendererPixbufXt"""
    #__gproperties__ = {'active-state':
                        #(GObject.TYPE_STRING, 'pixmap/active widget state',
                        #'stock-icon name representing active widget state',
                        #None, GObject.PARAM_READWRITE)}
    #__gsignals__ = {'clicked':
                        #(GObject.SignalFlags.RUN_LAST, GObject.TYPE_NONE, ()), }
    #states = [None, Gtk.STOCK_APPLY, Gtk.STOCK_CANCEL]

    #def __init__(self):
        #Gtk.CellRendererPixbuf.__init__(self)

    #def do_get_property(self, property):
        #"""docstring for do_get_property"""
        #if property.name == 'active-state':
            #return self.active_state
        #else:
            #raise AttributeError('unknown property %s' % property.name)

    #def do_set_property(self, property, value):
        #if property.name == 'active-state':
            #self.active_state = value
        #else:
            #raise AttributeError('unknown property %s' % property.name)
