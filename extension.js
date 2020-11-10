const St = imports.gi.St;
const Main = imports.ui.main;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;
const Util = imports.misc.util;
const Shell = imports.gi.Shell;
const Atk = imports.gi.Atk;
const Keys = Me.imports.keys;
const PanelMenu = imports.ui.panelMenu;

let panelIndicator, position, _settings;
let minimizedWindows = [];

function toggleDesktop() {
	let metaWorkspace = global.workspace_manager.get_active_workspace();
	let windows = metaWorkspace.list_windows();

	// if the user click on the panelIndicator while the overview is open -> do nothing.
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

function ShowDesktopButton() {
	panelIndicator = new PanelMenu.Button(0.0, null, true);
	panelIndicator.actor.accessible_role = Atk.Role.TOGGLE_BUTTON;
	
	let icon = new St.Icon({
		icon_name: 'user-home-symbolic',
		style_class: 'system-status-icon'});
		
	panelIndicator.actor.add_actor(icon);
	panelIndicator.actor.connect('button-press-event', toggleDesktop);

	Main.panel.addToStatusArea("ShowDesktop", panelIndicator, 1, position);
}

function init(extensionMeta) {
	_settings = Convenience.getSettings();
	allWindowsAreMinimized = false;
}

function _setPosition() {
	if (panelIndicator !== null){
		disable();
		enable();
	}
}

function enable() {
  this._settingsSignals = [];
  this._settingsSignals.push(_settings.connect('changed::' + Keys.position, _setPosition));
  
  position = _settings.get_string(Keys.position);
  
	new ShowDesktopButton();
}

function disable() {
	_settings.disconnect(this._settingsSignals);
	Main.panel._rightBox.remove_child(panelIndicator);
	panelIndicator.destroy();
	panelIndicator = null;
}
