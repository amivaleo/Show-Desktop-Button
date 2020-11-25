const {St, Shell, Atk} = imports.gi;
const Main = imports.ui.main;
const Util = imports.misc.util;
const Meta = imports.gi.Meta;
const PanelMenu = imports.ui.panelMenu;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const Tools = Me.imports.tools;
const Settings = Tools.getSettings();
const Gettext = imports.gettext.domain(Me.metadata['gettext-domain']);
const _ = Gettext.gettext;

const ExtensionName = Me.metadata.name;
const ExtensionVersion = Me.metadata.version;

let panelButton;

// the panelButton works as a toggle button.
// the two states on/off correspond to panelButtonStatus = true/false
// true :: when the button has minimized the windows
let panelButtonStatus;
let ignoredWindows = [];


function toggleDesktop() {

	let metaWorkspace = global.workspace_manager.get_active_workspace();
	let windows = metaWorkspace.list_windows();
	let wm_class;
	
	log("\n### " + ExtensionName + " debugging START ###");
	
	log('panelButtonStatus: ' + panelButtonStatus);
	
	// if the user click on the panelButton while the overview
	// is open -> do nothing.
	if (!Main.overview.visible) {
	
		// if panelButtonStatus == false <=> the button is in status off...
		// this is the MINIMIZING action =>
		// panelButtonStatus WAS false and WILL BE true
		if (panelButtonStatus == false) {
			
			// cyle through all windows
			for ( let i = 0; i < windows.length; ++i ) {
				
				wm_class = windows[i].wm_class.toLowerCase();
				if (windows[i].wm_class == null) {
					wm_class = 'null';
				}
				
				log("i: " + i +
						"\ttitle: " + windows[i].title + 
						"\twindow_type: " + windows[i].window_type + 
						"\twm_class: " + wm_class);

				// if the window is already minimized or is a DESKTOP type
				// or is the DING extension,
				// add it to a separate array 'ignoredWindows'...
				if (windows[i].minimized ||
							windows[i].window_type == Meta.WindowType.DESKTOP ||
							windows[i].window_type == Meta.WindowType.DOCK ||
							windows[i].title.startsWith('DING') ||
							wm_class == 'conky' ||
							( windows[i].title.startsWith('@!') && windows[i].title.endsWith('BDH') ) ) {
					ignoredWindows.push(windows[i]);

					log('\t pushed into ignoredWindows: ' + windows[i].title);
					if (windows[i].minimized) {
						log('\t because it was already minimized');
					}
					if (windows[i].window_type == Meta.WindowType.DESKTOP) {
						log('\t because window_type == DESKTOP');
					}
					if (windows[i].window_type == Meta.WindowType.DOCK) {
						log('\t because window_type == DOCK');
					}
					if (windows[i].title.startsWith('DING')) {
						log('\t because name starts with DING');
					}
					if (wm_class == 'conky') {
						log('\t because wm_class is conky');
					}
					if	( windows[i].title.startsWith('@!') && windows[i].title.endsWith('BDH') ) {
						log('\t because title starts with @! and ends with BDH');
					}
					
				// ... otherwise minimize that window
				} else {
					windows[i].minimize();
				}
			}
		
		// if panelButtonStatus == true <=> the button is in status on...
		// this is the UNMINIMIZING action =>
		// panelButtonStatus WAS true and WILL BE false
		} else if (panelButtonStatus == true) {
			
			// cyle through all windows
			for ( let i = 0; i < windows.length; ++i ) {
				
				wm_class = windows[i].wm_class.toLowerCase();
				if (windows[i].wm_class == null) {
					wm_class = 'null';
				}
				
				log("i: " + i +
						"\ttitle: " + windows[i].title + 
						"\twindow_type: " + windows[i].window_type + 
						"\twm_class: " + wm_class);
				
				// check if the window was already minimized in the previous state
				// since we don't want to uniminimize them, nor we want to do something
				// to conky, desktop apps, ding, etc.
				// it that's the case, splice that window from the array
				for (let j = 0; j < ignoredWindows.length; j++) {
					if (ignoredWindows[j] == windows[i]) {
						log('\t this was in ignoredWindows: ' + windows[i].title);
						windows.splice(i, 1);
					}
				}
			}
			
			// after the pruning, unminimize only those windows in the 'windows' array
			for ( let i = 0; i < windows.length; ++i ) {
				windows[i].unminimize();
			}
		
			// empty the separate array 'ignoredWindows'
			ignoredWindows = [];
		}
		
		panelButtonStatus = !panelButtonStatus;
	}
}

function getPanelButton() {

	panelButton = new PanelMenu.Button(0.0, null, true);
	
	let icon = new St.Icon({
		icon_name: 'user-home-symbolic',
		style_class: 'system-status-icon',
	});
	
	panelButton.add_child(icon);
	
	panelButtonStatus = false;
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
	ignoredWindows = null;
	panelButtonStatus = null;
	removeButton();
}
