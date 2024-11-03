import Adw from "gi://Adw";
import Gio from "gi://Gio";
import GLib from "gi://GLib";
import Gdk from 'gi://Gdk';
import Gtk from "gi://Gtk";
import GObject from 'gi://GObject';
import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class ShowDesktopButtonPrefs extends ExtensionPreferences {
	fillPreferencesWindow(window) {
		const settings = this.getSettings();
		const page = new Adw.PreferencesPage();
		const group = new Adw.PreferencesGroup();
		page.add(group);
		
		// Create a file chooser dialog for selecting images
		this._fileChooser = new Gtk.FileChooserNative({
			title: _('Select an SVG for the Panel Indicator'),
			modal: true,
		});
		
		// Create a filter to show only image formats
		const filter = new Gtk.FileFilter();
		filter.set_name(_('SVG Images')); // Set a name for the filter
		filter.add_pattern('*.svg'); // Only show SVG files
		this._fileChooser.set_filter(filter);
		
		// Define the action on response from the file chooser
		this._fileChooser.connect('response', (dlg, response) => {
			// Proceed only if the user clicks "Accept"
			if (response !== Gtk.ResponseType.ACCEPT) return;
			// Set the chosen file path in the settings
			settings.set_string('indicator-icon-name', dlg.get_file().get_path());
		});
		
		// Create a row for the icon name with title and subtitle
		const rowIndicatorIconName = new Adw.ActionRow({
			title: _("Icon Name"),
			activatable: true,
			subtitle: _("Icons must be located only in the following paths:\n") +
						"/usr/share/icons/\n" +
						"~/.icons/\n" +
						"~/.local/share/icons/\n"
		});
		
		// Open file chooser when the row is activated
		rowIndicatorIconName.connect('activated', () => {
			this._fileChooser.transient_for = window;
			const initialFolder = Gio.file_new_for_path("/usr/share/icons/");
			this._fileChooser.set_current_folder(initialFolder);
			this._fileChooser.show();
		});
		
		// Label to display the selected icon name
		this._labelIndicatorIconName = new Gtk.Label();
		this._labelIndicatorIconName.set_tooltip_text(_('Click to change icon')); // Set tooltip text
		
		// Update the label when the icon name setting changes
		settings.connect('changed::indicator-icon-name', () => {
			this._updateLabelIndicatorIconName();
		});
		this._updateLabelIndicatorIconName(); // Initialize label with current setting
		
		rowIndicatorIconName.add_suffix(this._labelIndicatorIconName);
		group.add(rowIndicatorIconName);
		
		// Create a dropdown for selecting the position of the indicator
		const indicatorPosition = new Adw.ComboRow({
			title: _('Position on Panel'),
			model: new Gtk.StringList({ strings: [_("Far Left"), _("Left"), _("Center-left"), _("Center-right"), _("Right"), _("Far Right")] }),
		});
		indicatorPosition.set_selected(settings.get_enum('indicator-position'));
		indicatorPosition.connect('notify::selected', () => {
			settings.set_enum('indicator-position', indicatorPosition.selected);
		});
		
		group.add(indicatorPosition);
		
		// Row for the shortcut key settings
		const rowIndicatorShortcut = new Adw.ActionRow({
			title: _("Shortcut"),
			activatable: true,
		});
		
		const boxIndicatorShortcut = new Gtk.Box({
			halign: Gtk.Align.END,
			valign: Gtk.Align.CENTER,
			hexpand: true,
			spacing: 8,
		});
		
		const buttonIndicatorShortcut = new Gtk.Button();
		buttonIndicatorShortcut.set_tooltip_text(_('Click to set shortcut'));
		buttonIndicatorShortcut.connect('clicked', () => {
			this.createShortcutDialog('indicator-shortcut', settings, window);
		});
		this.updateHotkeyButton(buttonIndicatorShortcut, 'indicator-shortcut', settings);
		
		// Update the shortcut button when the setting changes
		settings.connect(`changed::indicator-shortcut`, () => {
			this.updateHotkeyButton(buttonIndicatorShortcut, 'indicator-shortcut', settings);
		});
		
		// Initialize button label with current shortcut
		this.updateHotkeyButton(buttonIndicatorShortcut, 'indicator-shortcut', settings);
		
		// Button to delete the existing shortcut
		const deleteIndicatorShortcut = new Gtk.Button();
		deleteIndicatorShortcut.set_child(new Gtk.Image({ icon_name: 'edit-delete-symbolic' }));
		deleteIndicatorShortcut.set_tooltip_text(_('Remove shortcut'));
		deleteIndicatorShortcut.connect('clicked', () => {
			settings.set_strv('indicator-shortcut', []); // Remove the shortcut
			this.updateHotkeyButton(buttonIndicatorShortcut, 'indicator-shortcut', settings);
		});
		
		boxIndicatorShortcut.append(buttonIndicatorShortcut);
		boxIndicatorShortcut.append(deleteIndicatorShortcut);
		
		// Add the shortcut box to the preferences group
		rowIndicatorShortcut.add_suffix(boxIndicatorShortcut);
		group.add(rowIndicatorShortcut);
		
		window.add(page); // Add the preferences page to the window
		window.connect('close-request', this.on_destroy.bind(this)); // Cleanup on close
	}
	
	_updateLabelIndicatorIconName() {
		const settings = this.getSettings();
		const filename = settings.get_string('indicator-icon-name');
		this._labelIndicatorIconName.label = GLib.basename(filename); // Display only the filename
	}

	updateHotkeyButton(btn, hotkeyKey, settings) {
		const text = settings.get_strv(hotkeyKey)[0];
		btn.set_label(text ? text : _('Click to assign shortcut')); // Set button label based on shortcut
	}

	createShortcutDialog(hotkeyKey, settings, window) {
		const dialog = new Gtk.Dialog({
			title: 'Set shortcut',
			use_header_bar: true,
			modal: true,
			resizable: false,
		});
		dialog.set_transient_for(window);
		dialog.set_size_request(440, 200);

		const box = new Gtk.Box({
			orientation: Gtk.Orientation.VERTICAL,
			spacing: 2,
			marginStart: 16,
			marginEnd: 16,
			marginTop: 16,
			marginBottom: 16,
		});
		dialog.get_content_area().append(box);

		const label = new Gtk.Label({
			vexpand: true,
			label: _('Press keyboard shortcut, or Escape to cancel, or BackSpace to clear the shortcut.'),
		});
		box.append(label);

		const eventController = new Gtk.EventControllerKey();
		dialog.add_controller(eventController);

		eventController.connect('key-pressed', (_widget, keyval, keycode, state) => {
			let mask = state & Gtk.accelerator_get_default_mod_mask();
			mask &= ~Gdk.ModifierType.LOCK_MASK;

			// Close dialog on Escape key
			if (mask === 0 && keyval === Gdk.KEY_Escape) {
				dialog.visible = false;
				return Gdk.EVENT_STOP;
			}

			// Clear shortcut on BackSpace key
			if (keyval === Gdk.KEY_BackSpace) {
				settings.set_strv(hotkeyKey, []); // Clear the shortcut setting
				dialog.close();
				return Gdk.EVENT_STOP;
			}

			// Validate and set new shortcut binding
			if (this.isBindingValid({ mask, keycode, keyval })) {
				const binding = Gtk.accelerator_name_with_keycode(null, keyval, keycode, mask);
				settings.set_strv(hotkeyKey, [binding]);
				dialog.close();
			}
			return Gdk.EVENT_STOP;
		});

		dialog.show(); // Show the dialog
	}

	isBindingValid({ mask, keycode, keyval }) {
		// Validate the key binding to ensure it's a usable key combination
		if ((mask === 0 || mask === Gdk.ModifierType.SHIFT_MASK) && keycode !== 0) {
			if (
				(keyval >= Gdk.KEY_a && keyval <= Gdk.KEY_z) ||
				(keyval >= Gdk.KEY_A && keyval <= Gdk.KEY_Z) ||
				(keyval >= Gdk.KEY_0 && keyval <= Gdk.KEY_9) ||
				(keyval === Gdk.KEY_space && mask === 0)
			) {
				return false; // Prevent common keys from being used
			}
		}
		// Allow valid accelerators
		return Gtk.accelerator_valid(keyval, mask) ||
			(keyval === Gdk.KEY_Tab && mask !== 0) ||
			(keyval === Gdk.KEY_Scroll_Lock) ||
			(keyval === Gdk.KEY_Break);
	}

	on_destroy() {
		// Clean up resources when the preferences window is closed
		if (this._fileChooser) {
			this._fileChooser.destroy(); // Destroy file chooser dialog
			this._fileChooser = null;
		}
		if (this._labelIndicatorIconName) {
			this._labelIndicatorIconName.destroy(); // Destroy label displaying icon name
			this._labelIndicatorIconName = null;
		}
	}
}
