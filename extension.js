/* You can do whatever you want with this code, but I hope that, if you want to
 * improve it, you will talk to me so we can discuss and implement your idea into
 * this very same extension. It's just to keep things neat and clean, instead of
 * polluting EGO with plenty of similar extensions that do almost the same thing.
 *
 * If you want to debug this extension, open 'metadata.json' and set 'debug' to true.
 * You can read the debugging messages in the terminal if you give the following:
 * $ journalctl -f -o cat /usr/bin/gnome-shell
 */

import Shell from 'gi://Shell';
import St from 'gi://St';
import Meta from 'gi://Meta';
import GLib from 'gi://GLib';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

const TOGGLE_STATUS = {
	UNMINIMIZE: 0,
	MINIMIZE: 1,
};

let extensionName;
let toggleStatus = TOGGLE_STATUS.UNMINIMIZE;
let Settings;
let panelButton;
let ignoredWindows = [];

function logDebug(message) {
	console.debug(message);
}

/* make a list of all open windows
 * populate: ignoredWindows , windowsToMinimize
 */
function populateIgnoredWindows(windows) {
	for (let i = 0; i < windows.length; ++i) {
		let title = windows[i].title ?? '';
		let focusedWindow = global.display.get_focus_window();
		let window_type = windows[i].window_type ?? '';
		let wm_classInitial = windows[i].wm_class ?? '';
		let wm_class = wm_classInitial.toLowerCase();
		logDebug(`minimize i: ${i}`);
		logDebug(`\t title: ${title}`);
		logDebug(`\t window_type: ${window_type}`);
		logDebug(`\t wm_class: ${wm_class}`);
		
		if (windows[i] === focusedWindow && Settings.get_boolean('keep-focused')) {
			logDebug(`\t ${title} ignored: window is focused`);
			ignoredWindows.push(windows[i]);
			continue;
		}
		
		if (window_type === Meta.WindowType.DESKTOP) {
			logDebug(`\t ${title} ignored: window_type is DESKTOP`);
			ignoredWindows.push(windows[i]);
			continue;
		}
		
		if (window_type === Meta.WindowType.DOCK) {
			logDebug(`\t ${title} ignored: window_type is DOCK`);
			ignoredWindows.push(windows[i]);
			continue;
		}
		
		if (window_type === Meta.WindowType.MODAL_DIALOG) {
			logDebug(`\t ${title} ignored: window_type is MODAL DIALOG`);
			ignoredWindows.push(windows[i]);
			continue;
		}
		
		if (title.startsWith('DING')) {
			logDebug(`\t ${title} ignored: name starts with DING`);
			ignoredWindows.push(windows[i]);
			continue;
		}
		
		if (wm_class.endsWith('notejot')) {
			logDebug(`\t ${title} ignored: name ends with notejot`);
			ignoredWindows.push(windows[i]);
			continue;
		}
		
		if (wm_class === 'conky') {
			logDebug(`\t ${title} ignored: wm_class is conky`);
			ignoredWindows.push(windows[i]);
			continue;
		}

		if (wm_class === 'Gjs') {
			logDebug(`\t ${title} ignored: wm_class is Gjs`);
			ignoredWindows.push(windows[i]);
			continue;
		}

		if (title.startsWith('@!')
				&& (title.endsWith('BDH') || title.endsWith('BDHF'))) {
			logDebug(`\t ${title} ignored: title starts with @! and ends with BDH or BDHF`);
			ignoredWindows.push(windows[i]);
			continue;
		}
	}
}

/* not all open windows must be touched.
 * we must remove those that must be ignored (ignoredWindows)
 * from the full list (windows)
 */
function pruneWindows(windows) {
	for (let i = 0; i < windows.length; ++i) {
		for (let j = 0; j < ignoredWindows.length; j++) {
			if (ignoredWindows[j] === windows[i]) {
				logDebug(`\t this was in ignoredWindows: ${windows[i].title}`);
				windows.splice(i, 1);
			}
		}
	}
}

/* if at least one window is unminimized, the button will minimize it.
 * if this has to appen, toggleStatus changes to "MINIMIZE".
 */
function checkUnminimizedWindows(windows) {
	toggleStatus = TOGGLE_STATUS.UNMINIMIZE;
	for (let i = 0; i < windows.length; ++i) {
		if (!windows[i].minimized) {
			logDebug(`\t ${windows[i].title} is unminimized`);
			toggleStatus = TOGGLE_STATUS.MINIMIZE;
			continue;
		}
	}
}

/* unminimize windows
 */
function unminimizeWindows(windows) {
	logDebug(`executing unminimizeWindows(windows)`);
	for (let i = 0; i < windows.length; ++i) {
		logDebug(`\t ${windows[i].title} is getting unminimized}`);
		windows[i].unminimize();
	}
}

/* minimize windows
 */
function minimizeWindows(windows) {
	logDebug(`executing minimizeWindows(windows)`);
	for (let i = 0; i < windows.length; i++) {
		logDebug(`\t ${windows[i].title} is getting minimized}`);
		windows[i].minimize();
	}
}

/* toggle desktop windows
 */
function toggleDesktop() {
	// do not toggle when overview is open
	if (Main.overview.visible) {
		return;
	}
	let metaWorkspace = global.workspace_manager.get_active_workspace();
	let windows = metaWorkspace.list_windows();
	
	// 1 make a list of all windows 
	// 2 not all windows must be touched by this extension, some must be ignored
	// 3 check if there are unminimized windows in the remaining windows list
	// 4 if so -> the extension minimizes them, otherwise it unminimizes them all.
	
	populateIgnoredWindows(windows);
	pruneWindows(windows);
	checkUnminimizedWindows(windows);
	
	logDebug(`toggleStatus is ${toggleStatus}`);
	
	if (toggleStatus === TOGGLE_STATUS.UNMINIMIZE) {
		logDebug(`loading unminimizeWindows(windows)`);
		unminimizeWindows(windows);
	} else if (toggleStatus === TOGGLE_STATUS.MINIMIZE) {
		logDebug(`loading minimizeWindows(windows)`);
		minimizeWindows(windows);
	}
}

/* reset toggle status
 */
function resetToggleStatus() {
	toggleStatus = TOGGLE_STATUS.MINIMIZE;
	ignoredWindows = [];
}

/* get panel button
 */
function getPanelButton() {
	panelButton = new PanelMenu.Button(0.0, `${extensionName}`, false);
	let iconName = GLib.path_get_basename(Settings.get_string('indicator-icon-name'));
	let icon = new St.Icon({
		icon_name: iconName.slice(0, iconName.lastIndexOf('.')),
		style_class: 'system-status-icon',
	});
	
	panelButton.add_child(icon);
	panelButton.connect('button-press-event', toggleDesktop);
	panelButton.connect('touch-event', toggleDesktop);
	return panelButton;
}

/* add button to panel
 */
function addButton() {
	let role = `${extensionName} Indicator`;
	let position = ['left', 'left', 'center', 'center', 'right', 'right'];
	let qualifier = [0, 1, 0, 1, 1, -1];
	let index = Settings.get_enum('indicator-position');
	Main.panel.addToStatusArea(role, getPanelButton(), qualifier[index], position[index]);
}

/* remove button from panel
 */
function removeButton() {
	panelButton.destroy();
	panelButton = null;
}

export default class extends Extension {
	/* enable extension
	*/
	enable() {
		extensionName = this.metadata.name;
		Settings = this.getSettings();
		Settings.connect('changed::keep-focused', () => {
			resetToggleStatus();
			removeButton();
			addButton();
		});
		Settings.connect('changed::indicator-position', () => {
			removeButton();
			addButton();
		});
		Settings.connect('changed::indicator-icon-name', () => {
			removeButton();
			addButton();
		});
		resetToggleStatus();
		addButton();
		
		Main.wm.addKeybinding(
			'shortcut',
			Settings,
			Meta.KeyBindingFlags.NONE,
			Shell.ActionMode.ALL,
			() => {
				toggleDesktop();
			}
		);
	}
	
	/* disable extension
	*/
	disable() {
		resetToggleStatus();
		ignoredWindows = [];
		Settings = null;
		removeButton();
		Main.wm.removeKeybinding('shortcut');
	}
}
