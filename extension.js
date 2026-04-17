/* You can do whatever you want with this code, but I hope that, if you want to
 * improve it, you will talk to me so we can discuss and implement your idea into
 * this very same extension. It's just to keep things neat and clean, instead of
 * polluting EGO with plenty of similar extensions that do almost the same thing.
 *
 * If you want to debug this extension, open 'metadata.json' and set 'debug' to true.
 * You can read the debugging messages in the terminal if you give the following:
 * $ journalctl --user -f -o cat | grep Show-Desktop-Debug
 */

import GObject from 'gi://GObject';
import St from 'gi://St';
import Clutter from 'gi://Clutter';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import GLib from 'gi://GLib';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

const ShowDesktopButton = GObject.registerClass(
class ShowDesktopButton extends PanelMenu.Button {
    _init(extension) {
        super._init(0.0, extension.metadata.name, true);
        this._extension = extension;
        this._timerId = 0;

        const settings = extension.getSettings();
        let iconPath = settings.get_string('indicator-icon-name');
        let iconBaseName = GLib.path_get_basename(iconPath);
        let iconName = iconBaseName.slice(0, iconBaseName.lastIndexOf('.'));

        this.add_child(new St.Icon({
            icon_name: iconName,
            style_class: 'system-status-icon',
        }));

        this.connect('enter-event', () => {
            if (this._extension.getSettings().get_boolean('hover-preview')) {
                this._clearTimer();
                this._timerId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 500, () => {
                    this._extension.logDebug("Hover timeout triggered");
                    this._extension.previewDesktop(true);
                    this._timerId = 0;
                    return GLib.SOURCE_REMOVE;
                });
            }
        });

        this.connect('leave-event', () => {
            this._clearTimer();
            this._extension.previewDesktop(false);
        });
    }

    _clearTimer() {
        if (this._timerId > 0) {
            GLib.source_remove(this._timerId);
            this._timerId = 0;
        }
    }

    vfunc_event(event) {
        if (event.type() === Clutter.EventType.BUTTON_PRESS) {
            this._clearTimer();
            this._extension.toggleDesktop();
            return Clutter.EVENT_STOP;
        }
        return Clutter.EVENT_PROPAGATE;
    }
    
    destroy() {
        this._clearTimer();
        super.destroy();
    }
});

export default class ShowDesktopExtension extends Extension {
    enable() {
        this._settings = this.getSettings();
        this._signals = [];

        // Legge "debug": true dal metadata.json
        this._debugEnabled = this.metadata['debug'] === true;
        
        this.logDebug("Extension enabled - Logging is active");

        this._signals.push(
            this._settings.connect('changed::indicator-position', () => this._refreshIndicator()),
            this._settings.connect('changed::indicator-icon-name', () => this._refreshIndicator())
        );

        this._refreshIndicator();

        Main.wm.addKeybinding(
            'shortcut',
            this._settings,
            Meta.KeyBindingFlags.NONE,
            Shell.ActionMode.ALL,
            () => {
                this.logDebug("Shortcut pressed");
                this.toggleDesktop();
            }
        );
    }

    // Usiamo console.warn per assicurarci che journalctl lo mostri sempre
    logDebug(message) {
        if (this._debugEnabled) {
            console.warn(`[Show-Desktop-Debug] ${message}`);
        }
    }

    _refreshIndicator() {
        this.logDebug("Refreshing Indicator UI");
        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }

        this._indicator = new ShowDesktopButton(this);

        const position = ['left', 'left', 'center', 'center', 'right', 'right'];
        const qualifier = [0, 1, 0, 1, 1, -1];
        const index = this._settings.get_enum('indicator-position');
        
        Main.panel.addToStatusArea(
            `${this.metadata.name} Indicator`, 
            this._indicator, 
            qualifier[index], 
            position[index]
        );
    }

    previewDesktop(enable) {
        const workspace = global.workspace_manager.get_active_workspace();
        const windows = workspace.list_windows();
        
        windows.forEach(w => {
            if (this._shouldIgnore(w)) return;
            let actor = w.get_compositor_private();
            if (actor) actor.opacity = enable ? 80 : 255;
        });
    }

    toggleDesktop() {
        if (Main.overview.visible) return;
        const workspace = global.workspace_manager.get_active_workspace();
        const windows = workspace.list_windows();

        const validWindows = windows.filter(w => !this._shouldIgnore(w));
        const hasUnminimized = validWindows.some(w => !w.minimized);

        this.logDebug(`Toggle: valid windows count = ${validWindows.length}, hasUnminimized = ${hasUnminimized}`);

        if (hasUnminimized) {
            const focusedWindow = global.display.get_focus_window();
            const keepFocused = this._settings.get_boolean('keep-focused');
            
            validWindows.forEach(w => {
                if (keepFocused && w === focusedWindow) {
                    this.logDebug(`Keeping focused window: ${w.get_title()}`);
                    return;
                }
                w.minimize();
            });
        } else {
            this.logDebug("Unminimizing all valid windows");
            validWindows.forEach(w => w.unminimize());
        }
    }

    _shouldIgnore(window) {
        if (!window) return true;

        const title = window.get_title() ?? 'Unknown';
        const window_type = window.get_window_type();
        const wm_class = (window.get_wm_class() ?? '').toLowerCase();
        const focusedWindow = global.display.get_focus_window();

        if (window === focusedWindow && this._settings.get_boolean('keep-focused')) {
            this.logDebug(`Ignoring: ${title} (Focused)`);
            return true;
        }

        if (window_type === Meta.WindowType.DESKTOP || 
            window_type === Meta.WindowType.DOCK || 
            window_type === Meta.WindowType.MODAL_DIALOG) {
            this.logDebug(`Ignoring: ${title} (Type: ${window_type})`);
            return true;
        }

        if (wm_class.includes('ding') || wm_class.includes('desktop')) {
            this.logDebug(`Ignoring: ${title} (DING/Desktop class)`);
            return true;
        }

        if (wm_class.endsWith('notejot') || wm_class === 'conky' || wm_class === 'gjs') {
            this.logDebug(`Ignoring: ${title} (Specific class: ${wm_class})`);
            return true;
        }

        if (title.startsWith('@!') && (title.endsWith('BDH') || title.endsWith('BDHF'))) {
            this.logDebug(`Ignoring: ${title} (Special title pattern)`);
            return true;
        }

        return false;
    }

    disable() {
        this.logDebug("Extension Disabled");
        this.previewDesktop(false);
        this._signals.forEach(id => this._settings.disconnect(id));
        Main.wm.removeKeybinding('shortcut');
        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }
        this._settings = null;
    }
}