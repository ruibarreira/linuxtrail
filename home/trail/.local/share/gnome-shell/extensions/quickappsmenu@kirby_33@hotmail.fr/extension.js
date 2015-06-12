const ShellVersion = imports.misc.config.PACKAGE_VERSION.split(".");
const Main = imports.ui.main;
const Lang    = imports.lang;
const PanelMenu = imports.ui.panelMenu;
const St = imports.gi.St;
const HIGHT_SPEED = 0.01;

const ApplicationsButton = new Lang.Class({
    Name: 'QuickApps.ApplicationsButton',
    Extends: PanelMenu.Button,
    _init: function() {
        this.parent(0.0,'QuickApps');
        this.buttonIcon = new St.Icon({ style_class: 'system-status-icon' });
        this.actor.add_actor(this.buttonIcon);
        this.buttonIcon.icon_name='quickapp-icons-symbolic';
        this.actor.connect('button-press-event', Lang.bind(this, this._refresh));
        this.original_speed = St.get_slow_down_factor();
        this.modified_speed = HIGHT_SPEED;
     },

    _refresh: function() {

        this.original_speed = St.get_slow_down_factor();
        St.set_slow_down_factor(this.modified_speed);
        if (Main.overview._shown)
            Main.overview.hide();
        else
            {
				Main.overview.show();
				if (ShellVersion[1]>4) {Main.overview.viewSelector._showAppsButton.checked = true;}
				else {Main.overview._viewSelector.switchTab('applications');}
            }
        St.set_slow_down_factor(this.original_speed);

    }

});

function init(extensionMeta) {
    let theme = imports.gi.Gtk.IconTheme.get_default();
    theme.append_search_path(extensionMeta.path + "/icons");
}

let QuickAppsButton;

function enable() {
    QuickAppsButton = new ApplicationsButton();

    if (ShellVersion[1]>4) {
        Main.panel.addToStatusArea('quickapps-menu', QuickAppsButton, 0, 'left');
        let indicator = Main.panel.statusArea['activities'];
        if(indicator != null)
        indicator.container.hide();
    } else {
        Main.panel._leftBox.insert_child_at_index(QuickAppsButton.actor,0);
        Main.panel._menus.addMenu(QuickAppsButton.menu);
        Main.panel._activitiesButton.actor.hide();
    }

}

function disable() {
    QuickAppsButton.destroy();
    if (ShellVersion[1]>4) {
        let indicator = Main.panel.statusArea['activities'];
        if(indicator != null)
        indicator.container.show();
    } else {
        Main.panel._activitiesButton.actor.show();
    }
}

