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
const St = imports.gi.St;
const Main = imports.ui.main;
const Utils = imports.misc.util;
const Lang = imports.lang;
const Gio = imports.gi.Gio;
const Clutter=imports.gi.Clutter;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const Lib = Me.imports.lib;
const CLICKSAVER_SETTINGS_KEY_POSITION = 'position';
	let extensionPath,
	buttons = [{ name: 'apps',action: function () { return 'nautilus /usr/share/applications'},icon:'preferences-system-search-symbolic'},
	{name: 'launcher',action: function () { return 'launcher'},icon:'web-browser-symbolic'},
	{name: 'gedit',action: function () { return 'gedit'},icon:'text-editor-symbolic'},
	{name:'terminal',action: function () { return 'gnome-terminal'},icon:'utilities-terminal-symbolic'}],
	oButtons,
	settings,
	activeBox,
	sigid = 0;
const hotButton = new Lang.Class ( {
	Name : 'hotButton',
	Extends : St.Bin,
	_init : function (btype) {
		this.parent({ style_class: 'panel-button',
							reactive: true,
							can_focus: true,
							x_fill: true,
							y_fill: false,
							track_hover: true });
		this._btype = btype;
		this._icon = new St.Icon({ icon_name: btype.icon,
                             style_class: 'system-status-icon' });

		this.set_child(this._icon);
		this.connect('button-press-event', Lang.bind(this, function (object,value ) {
			Utils.trySpawnCommandLine (this._btype.action.call())}));
	}
} );

function init(extensionMeta) {
	extensionPath=extensionMeta.path;
	settings = Lib.getSettings(Me);	
	oButtons=[];
	
};

function enable() {
	for (let i=0 ;i< buttons.length;i++) {
		oButtons.push(new hotButton(buttons[i]));
	}
	sigid = settings.connect("changed::position", function() {
        disable();
        let position = settings.get_string(CLICKSAVER_SETTINGS_KEY_POSITION);
		if (position == 'center') {
				activeBox = Main.panel._centerBox;
			} else {
				activeBox = Main.panel._leftBox;
			}
        enable();
    });
	let position = settings.get_string(CLICKSAVER_SETTINGS_KEY_POSITION);
	if (position == 'center') {
		activeBox = Main.panel._centerBox;
	} else {
		activeBox = Main.panel._leftBox;
	}
	let len = activeBox.get_children().length
	for (let i=0 ;i<buttons.length;i++) {
		activeBox.insert_child_at_index(oButtons[i], 		
		(position == 'center') ? i+len : i+1
		);
	}
};

function disable() {
	settings.disconnect(sigid);
	for (let i=0 ;i<buttons.length;i++) {
		activeBox.remove_child(oButtons[i]);
	}
};
