/*
 * Copyright (c) 2012 Adam Jabłoński
 *
 * Clicksaver Extension is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by the
 * Free Software Foundation; either version 2 of the License, or (at your
 * option) any later version.
 *
 * Clicksaver is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
 * for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with Gnome Documents; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
 *
 * Author: Adam Jabłoński <jablona123@gmail.com>
 *
 */
const Gtk = imports.gi.Gtk;

const Gettext = imports.gettext.domain('gnome-shell-extensions-clicksaver');
const _ = Gettext.gettext;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Lib = Me.imports.lib;

let settings;
let settings_bool;
let settings_range;
let settings_combo;

function init() {
	Lib.initTranslations(Me);
	settings = Lib.getSettings(Me);    
	settings_combo = {
		position: { label : _("Clicksaver position"),help : _("Where to position clicksaver icons")
				}
	};
}

function createComboSetting(setting) {

	let hbox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL });
	let setting_label = new Gtk.Label({label: settings_combo[setting].label,
                                       xalign: 0 });
	let setting_combo = new Gtk.ComboBoxText({});
	setting_combo.append("left",_("Left"));
	setting_combo.append("center",_("Center"));
	setting_combo.set_active_id(settings.get_string(setting))
	setting_combo.connect('changed', function(button) {
		settings.set_string(setting, button.get_active_id());
	});
	if (settings_combo[setting].help) {
		setting_label.set_tooltip_text(settings_combo[setting].help)
		setting_combo.set_tooltip_text(settings_combo[setting].help)
	}
	hbox.pack_start(setting_label, true, true, 0);
	hbox.add(setting_combo);
	return hbox;
}

function buildPrefsWidget() {
	let setting;
	let frame = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL,
				border_width: 10 });
    let vbox = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL,
			margin: 20, margin_top: 10 });
	for (setting in settings_combo) {
		let hbox = createComboSetting(setting);
		vbox.add(hbox);
	}
	frame.add(vbox);
	frame.show_all();
	return frame;
}
