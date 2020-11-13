const St = imports.gi.St;
const Main = imports.ui.main;

const Gio = imports.gi.Gio;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const Gettext = imports.gettext;
const _ = Gettext.domain('show-desktop-button').gettext;

const Util = imports.misc.util;
const Shell = imports.gi.Shell;
const Atk = imports.gi.Atk;
const PanelMenu = imports.ui.panelMenu;

const ExtensionName = Me.metadata.name;
const ExtensionVersion = Me.metadata.version;

let allWindowsAreMinimized = false;
let position = "left";
let panelButton;
let minimizedWindows = [];

let settings;

function getSettings() {
	let GioSSS = Gio.SettingsSchemaSource;
	let schemaSource = GioSSS.new_from_directory(
		Me.dir.get_child("schemas").get_path(),
		GioSSS.get_default(),
		false
	);
	
	let schemaObj = schemaSource.lookup('org.gnome.shell.extensions.show-desktop-button', true);
	
	if (!schemaObj) {
		throw new Error('cannot find schemas');
	}
	
	return new Gio.Settings({ settings_schema : schemaObj });
}

function toggleDesktop() {
	let metaWorkspace = global.workspace_manager.get_active_workspace();
	let windows = metaWorkspace.list_windows();
	
	// if the user click on the panelButton while the overview is open -> do nothing.
	if (!Main.overview.visible) {
		if (allWindowsAreMinimized) {
			for ( let i = 0; i < windows.length; ++i ) {
				for (let j = 0; j < minimizedWindows.length; j++) {
					// if the window was already minimized before remove that window from the list of windows that will be uniminimized
					if (windows[i] == minimizedWindows[j]) {
						windows.splice(i, 1);
					}
				}
			}
			// unminimize only those windows there were not minimized before
			for ( let i = 0; i < windows.length; ++i ) {
				windows[i].unminimize(global.get_current_time());
			}
			minimizedWindows = [];
		} else {
			for ( let i = 0; i < windows.length; ++i ) {
				// if the window is already minimized, add it to a separate array...
				if (windows[i].minimized) {
					minimizedWindows.push(windows[i]);
				// ... otherwise minimize that window
				} else {
					windows[i].minimize(global.get_current_time());
				}
			}
		}
		
		allWindowsAreMinimized = !allWindowsAreMinimized;
	}
}

function buildExtensionButton() {
	panelButton = new PanelMenu.Button(0.0, null, true);
	
	let icon = new St.Icon({
		icon_name: 'user-home-symbolic',
		style_class: 'system-status-icon'});
	
	panelButton.actor.add_actor(icon);
	panelButton.connect('button-press-event', toggleDesktop);
	Main.panel.addToStatusArea(`${ExtensionName} Indicator`, panelButton, 1, position);	
}

function init() {

	let localeDir = Me.dir.get_child('locale');
	Gettext.bindtextdomain('show-desktop-button', localeDir.get_path());

	settings = getSettings();
	log ("AAAAAAAAAAAAAAAA my string: " + settings.get_string('panel-position-key'));
		
}

function enable() {
	log ( _("Hello!") );
	let key_name = "panel-position-key";
	
  // use 'changed::my-integer' signal for only my-integer change
  // use 'changed' signal for any change



  settings.connect('changed', (s, key_name) => {
    let value = s.get_int(key_name);
    log(`${key_name} value has been changed to ${value}`);
   	Main.notify("Whatever");
  });

	new buildExtensionButton();
}

function disable() {
	panelButton.destroy();
	panelButton = null;
}
