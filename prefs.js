import {ExtensionPreferences, gettext as _} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';
import Adw from "gi://Adw";
import Gio from "gi://Gio";
import GLib from "gi://GLib";
import Gtk from "gi://Gtk";

export default class ShowDesktopButtonPrefs extends ExtensionPreferences {
	fillPreferencesWindow(window) {
		const settings = this.getSettings();
		const page = new Adw.PreferencesPage();
		const group = new Adw.PreferencesGroup();
		let fileChooserKey = '';
		page.add(group);
		
		// this tells to gnome that we have a fileChooser window
		this._fileChooser = new Gtk.FileChooserNative({
			title: _('Select an Image for the Panel Indicator'),
			modal: true,
		});
		
		// we must set the fileChooser so that it only shows images
		// so we create a filter
		const filter = new Gtk.FileFilter();
		// we say that the filter is for images
		filter.add_pixbuf_formats();
		// and then we apply the filter to the fileChooser
		this._fileChooser.set_filter(filter);
		
		// we must define what happens when we interact with the fileChooser
		this._fileChooser.connect('response', (dlg, response) => {
			// if the user clicks on anything else than "accept", we stop the function
			if (response !== Gtk.ResponseType.ACCEPT) return;
			// otherwise we set the new icon name in fileChooserkey and its path
			settings.set_string(fileChooserKey, dlg.get_file().get_path());

		});
		
		// indicator icon name title and subtitle
		const rowIndicatorIconName = new Adw.ActionRow({
			title: _("Icon Name"),
			activatable: true,
			subtitle: _("Icons must be located only in the following paths:\n") +
						"/usr/share/icons/\n" +
						"~/.icons/\n" +
						"~/.local/share/icons/\n" +
						_("Only SVG format is accepted.")
		});
		rowIndicatorIconName.connect('activated', () => {
			fileChooserKey = 'indicator-icon-name';
			this._fileChooser.transient_for = window;
            const initialFolder = Gio.file_new_for_path("/usr/share/icons/");
            this._fileChooser.set_current_folder(initialFolder);
			this._fileChooser.show();
		});
		
		// indicator icon name entry
		this._labelIndicatorIconName = new Gtk.Label();
		
		settings.connect('changed::indicator-icon-name', () => {
			this._updateLabelIndicatorIconName()
		});
		this._updateLabelIndicatorIconName();
		
		rowIndicatorIconName.add_suffix(this._labelIndicatorIconName);
		
		group.add(rowIndicatorIconName);
		
		// indicator position
		const indicatorPosition = new Adw.ComboRow({
			title: _('Position on Panel'),
			model: new Gtk.StringList({strings: [_("Far Left"), _("Left"), _("Center-left"), _("Center-right"), _("Right"), _("Far Right")]}),
		})
		indicatorPosition.set_selected(settings.get_enum('indicator-position'));
		indicatorPosition.connect('notify::selected', ()=> {settings.set_enum('indicator-position', indicatorPosition.selected);});
		
		group.add(indicatorPosition)
		
		window.add(page);
		window.connect('close-request', this.on_destroy.bind(this));
	}
	_updateLabelIndicatorIconName() {
		const settings = this.getSettings();
		const filename = settings.get_string('indicator-icon-name');
		this._labelIndicatorIconName.label = GLib.basename(filename);
	}
	on_destroy() {
		if (this._fileChooser) {
			this._fileChooser.destroy();
			this._fileChooser = null;
		}
		if (this._labelIndicatorIconName) {
			this._labelIndicatorIconName.destroy();
			this._labelIndicatorIconName = null;
		}
	}
}
