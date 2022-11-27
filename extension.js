/* You can do whatever you want with this code, but I hope that, if you want to
 * improve it, you will talk to me so we can discuss and implement your idea into
 * this very same extension. It's just to keep things neat and clean, instead of
 * polluting EGO with plenty of similar extensions that do almost the same thing.
 *
 * If you want to debug this extension, open 'metadata.json' and set 'debug' to true.
 * You can read the debugging messages in the terminal if you give the following:
 * $ journalctl -f -o cat /usr/bin/gnome-shell
 */

// If you want to debug the extension,

const {St} = imports.gi;
const Main = imports.ui.main;
const Meta = imports.gi.Meta;
const PanelMenu = imports.ui.panelMenu;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const extensionName = Me.metadata.name;

const TOGGLE_STATUS = {
	UNMINIMIZE: 0,
	MINIMIZE: 1,
};

let toggleStatus = TOGGLE_STATUS.UNMINIMIZE;
let Settings;
let panelButton;
let ignoredWindows = [];

function logDebug(message) {
	if (Me.metadata.debug)
		log(message);
}

/* make a list of all open windows
 * populate: ignoredWindows , windowsToMinimize
 */
function populateIgnoredWindows(windows) {
	for (let i = 0; i < windows.length; ++i) {
		let wm_classInitial = windows[i].wm_class ?? '';
		let wm_class = wm_classInitial.toLowerCase();
		let window_type = windows[i].window_type ?? '';
		let title = windows[i].title ?? '';
		logDebug(`minimize i: ${i}`);
		logDebug(`\t title: ${title}`);
		logDebug(`\t window_type: ${window_type}`);
		logDebug(`\t wm_class: ${wm_class}`);

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
	let icon = new St.Icon({
		icon_name: 'user-home-symbolic',
		style_class: 'system-status-icon',
	});
	panelButton.add_child(icon);
	panelButton.connect('button-press-event', toggleDesktop);
	return panelButton;
}

/* add button to panel
 */
function addButton() {
	let role = `${extensionName} Indicator`;
	let position = ['left', 'left', 'center', 'center', 'right', 'right'];
	let qualifier = [0, 1, 0, 1, 1, -1];
	let index = Settings.get_enum('panel-position');
	Main.panel.addToStatusArea(role, getPanelButton(), qualifier[index], position[index]);
}

/* remove button from panel
 */
function removeButton() {
	panelButton.destroy();
	panelButton = null;
}

/* initiate extension
 */
function init() {
}

/* enable extension
 */
function enable() {
	Settings = ExtensionUtils.getSettings();
	Settings.connect('changed::panel-position', () => {
		removeButton();
		addButton();
	});
	resetToggleStatus();
	addButton();
}

/* disable extension
 */
function disable() {
	resetToggleStatus();
	ignoredWindows = null;
	Settings = null;
	removeButton();
}

