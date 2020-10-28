const St = imports.gi.St;
const Main = imports.ui.main;
const Util = imports.misc.util;
const Shell = imports.gi.Shell;

let panelIndicator;

function toggleDesktop() {
	let metaWorkspace = global.workspace_manager.get_active_workspace();
	let windows = metaWorkspace.list_windows();
	let minimizedWindows = [];
	
	for ( let i = 0; i < windows.length; ++i ) {																	// list all the already minimized windows in a separate array
		if (windows[i].minimized) {
			minimizedWindows.push(windows[i]);
		}
	}
	
	if (Main.overview.visible) {																									// if the user click on the panelIndicator while the overview is open -> close the overview
		Main.overview.hide();
	} else {
		if (allWindowsAreMinimized) {
			for ( let i = 0; i < windows.length; ++i ) {
				for (let j = 0; j < minimizedWindows.length; j++) {
					if (windows[i] != minimizedWindows[j]) {															// if the window was already minimized before, do not unimimize it
						windows[i].unminimize(global.get_current_time());
					}
				}
			}
		} else {
			for ( let i = 0; i < windows.length; ++i ) {
				windows[i].minimize(global.get_current_time());
			}
		}
	
		allWindowsAreMinimized = !allWindowsAreMinimized;
	}
}

function init(extensionMeta) {
	allWindowsAreMinimized = false;
}

function enable() {
	panelIndicator = new St.Bin({
		style_class: 'panel-button',
		reactive: true,
		can_focus: true,
		track_hover: true});
		
	let icon = new St.Icon({
		icon_name: 'user-home-symbolic',
		style_class: 'system-status-icon'});
		
	panelIndicator.set_child(icon);
	panelIndicator.connect('button-press-event', toggleDesktop);
	
	Main.panel._rightBox.insert_child_at_index(panelIndicator, 0);
}

function disable() {
	Main.panel._rightBox.remove_child(panelIndicator);
}
