const St = imports.gi.St;
const Main = imports.ui.main;
const Util = imports.misc.util;
const Shell = imports.gi.Shell;

let panelIndicator;
let minimizedWindows = [];

function toggleDesktop() {
	let metaWorkspace = global.workspace_manager.get_active_workspace();
	let windows = metaWorkspace.list_windows();
	
	if (!Main.overview.visible) {																									// if the user click on the panelIndicator while the overview is open -> do nothing.
		if (allWindowsAreMinimized) {
			for ( let i = 0; i < windows.length; ++i ) {
				for (let j = 0; j < minimizedWindows.length; j++) {
					if (windows[i] == minimizedWindows[j]) {															// if the window was already minimized before...
						windows.splice(i, 1);																								// ... remove that window from the list of windows that will be uniminimized...
					}
				}
			}
			for ( let i = 0; i < windows.length; ++i ) {															// ... in this loop!
				windows[i].unminimize(global.get_current_time());
			}
			minimizedWindows = [];
		} else {
			for ( let i = 0; i < windows.length; ++i ) {
				if (windows[i].minimized) {																							// if the window is already minimized, add it to a separate array...
					minimizedWindows.push(windows[i]);
				} else {
					windows[i].minimize(global.get_current_time());												// ... otherwise minimize that window.
				}
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
