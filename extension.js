const {St, Shell, Atk} = imports.gi;
const Main = imports.ui.main;
const Util = imports.misc.util;
const Meta = imports.gi.Meta;
const PanelMenu = imports.ui.panelMenu;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const Tools = Me.imports.tools;
const Settings = Tools.getSettings();
const Gettext = Tools.getGettext();
const _ = Gettext.gettext;

const ExtensionName = Me.metadata.name;
const ExtensionVersion = Me.metadata.version;

let allWindowsAreMinimized = false;
let panelButton;

function toggleDesktop() {

	let metaWorkspace = global.workspace_manager.get_active_workspace();
	let windows = metaWorkspace.list_windows();
	let minimizedWindows = [];
	
	// if the user click on the panelButton while the overview
	// is open -> do nothing.
	if (!Main.overview.visible) {
		if (allWindowsAreMinimized) {
			for ( let i = 0; i < windows.length; ++i ) {
				for (let j = 0; j < minimizedWindows.length; j++) {
					// if the window was already minimized before, remove that window from
					// the list of windows that will be uniminimized
					if (windows[i] == minimizedWindows[j]) {
						windows.splice(i, 1);
					}
				}
			}
			// unminimize only those windows there were not minimized before
			for ( let i = 0; i < windows.length; ++i ) {
				windows[i].unminimize();
			}
			minimizedWindows = [];
		} else {
			for ( let i = 0; i < windows.length; ++i ) {
				// if the window is already minimized, add it to a separate array...
				if (windows[i].minimized || windows[i].get_window_type() == Meta.WindowType.DESKTOP) {
					minimizedWindows.push(windows[i]);
				// ... otherwise minimize that window
				} else {
					windows[i].minimize();
				}
			}
		}
		
		allWindowsAreMinimized = !allWindowsAreMinimized;
	}
}

function getPanelButton() {

	panelButton = new PanelMenu.Button(0.0, null, true);
	
	let icon = new St.Icon({
		icon_name: 'user-home-symbolic',
		style_class: 'system-status-icon',
	});
	
	panelButton.add_child(icon);
	panelButton.connect('button-press-event', toggleDesktop);
	
	return panelButton;
}

function addButton() {

	let role = `${ExtensionName} Indicator`;
	let positions = ['left', 'center', 'right'];	
	
	Main.panel.addToStatusArea(role, getPanelButton(), 1, positions[Settings.get_enum('panel-position')]);
}

function removeButton() {
	panelButton.destroy();
	panelButton = null;
}

function init() {
	Settings.connect('changed', (s) => {
		removeButton();
		addButton();
  });
}

function enable() {
	addButton();
}

function disable() {
	removeButton();
}
