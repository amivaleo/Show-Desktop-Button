const {St} = imports.gi;
const Main = imports.ui.main;
const Meta = imports.gi.Meta;
const PanelMenu = imports.ui.panelMenu;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

/* toggle status
 * @member {Object}
 */
const TOGGLE_STATUS = {
    UNMINIMIZED: 0,
    MINIMIZED: 1,
};

/* current toggle status
 * @member {number}
 */
let toggleStatus = TOGGLE_STATUS.UNMINIMIZED;

/* extension gsettings
 * @member {Gio.Settings}
 */
let Settings;

/* extension name
 * @member {string}
 */
const extensionName = Me.metadata.name;

/* panel menu button
 * @member {PanelMenu.Button}
 */
let panelButton;

/* windows that needs to be ignored in unminimize
 * @member {Array}
 */
let ignoredWindows = [];

/* log debug
 * @param {string} message text that needs to be logged
 */
function logDebug(message) {
    if (Me.metadata.debug)
        log(message);
}

/* unminimize windows
 * @param {Array} windows array of windows from metaWorkspace.list_windows()
 */
function unminimizeWindows(windows) {

    for (let i = 0; i < windows.length; ++i) {

        let wm_classInitial = windows[i].wm_class ?? '';
        let wm_class = wm_classInitial.toLowerCase();
        let window_type = windows[i].window_type ?? '';
        let title = windows[i].title ?? '';

        logDebug(`unminimize i: ${i}`);
        logDebug(`\t title: ${title}`);
        logDebug(`\t window_type: ${window_type}`);
        logDebug(`\t wm_class: ${wm_class}`);

        // check if the window was already minimized in the previous state
        // since we don't want to uniminimize them, nor we want to do something
        // to conky, desktop apps, ding, etc.
        // it that's the case, splice that window from the array
        for (let j = 0; j < ignoredWindows.length; j++) {
            if (ignoredWindows[j] === windows[i]) {
                logDebug(`\t this was in ignoredWindows: ${title}`);
                windows.splice(i, 1);
            }
        }
    }

    // after the pruning, unminimize only those windows in the 'windows' array
    for (let i = 0; i < windows.length; ++i) {
        windows[i].unminimize();
    }

    // unminimze doesn't need the ignored windows anymore
    ignoredWindows = [];
}

/* minimize windows
 * @param {Array} windows array of windows from metaWorkspace.list_windows()
 */
function minimizeWindows(windows) {

    for (let i = 0; i < windows.length; ++i) {

        let wm_classInitial = windows[i].wm_class ?? '';
        let wm_class = wm_classInitial.toLowerCase();
        let window_type = windows[i].window_type ?? '';
        let title = windows[i].title ?? '';

        logDebug(`minimize i: ${i}`);
        logDebug(`\t title: ${title}`);
        logDebug(`\t window_type: ${window_type}`);
        logDebug(`\t wm_class: ${wm_class}`);

        if (windows[i].minimized) {
            logDebug(`\t ${title} ignored: it was already minimized`);
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

        windows[i].minimize();
    }
}

/* toggle desktop windows
 */
function toggleDesktop() {

    let metaWorkspace = global.workspace_manager.get_active_workspace();
    let windows = metaWorkspace.list_windows();

    // do not toggle when overview is open
    if (Main.overview.visible) {
        return;
    }

    if (toggleStatus === TOGGLE_STATUS.UNMINIMIZED) {
        minimizeWindows(windows);
        toggleStatus = TOGGLE_STATUS.MINIMIZED;
    } else if (toggleStatus === TOGGLE_STATUS.MINIMIZED) {
        unminimizeWindows(windows);
        toggleStatus = TOGGLE_STATUS.UNMINIMIZED;
    }
}

/* reset toggle status
 */
function resetToggleStatus() {
    toggleStatus = TOGGLE_STATUS.UNMINIMIZED;
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
    let positions = ['left', 'center', 'right'];
    let position = Settings.get_enum('panel-position');
    Main.panel.addToStatusArea(role, getPanelButton(), 1, positions[position]);
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
