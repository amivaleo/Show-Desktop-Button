import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

import Adw from "gi://Adw";
import Gio from "gi://Gio";
import GLib from "gi://GLib";
import Gtk from "gi://Gtk";

export default class ShowDesktopButtonPrefs extends ExtensionPreferences {
	fillPreferencesWindow(window) {
		const settings = this.getSettings();
		const page = new Adw.PreferencesPage();
		const group = new Adw.PreferencesGroup();
		page.add(group);
		
		
		// indicator icon name title and subtitle
		const rowIndicatorIconName = new Adw.ActionRow({
			title: "Icon Name",
			subtitle: "Choose a file from /usr/share/icons/",
		});
		group.add(rowIndicatorIconName);
		
		// indicator icon name entry
		const entryIndicatorIconName = new Gtk.Entry({
			placeholder_text: "user-home-symbolic",
			text: settings.get_string("indicator-icon-name"),
			valign: Gtk.Align.CENTER,
			hexpand: true,
		});
		
		// put title and subtitle on the left, entry on the right
		rowIndicatorIconName.add_suffix(entryIndicatorIconName);
		// can write without having to delete the text
		rowIndicatorIconName.activatable_widget = entryIndicatorIconName;
		
        entryIndicatorIconName.connect("changed", (entry) => {
            settings.set_string("indicator-icon-name", entry.text);
            console.log("Icon name changed to: " + entry.text);
        });
        
        
		// indicator position
		const indicatorPosition = new Adw.ComboRow({
			title: 'Position on Panel',
			model: new Gtk.StringList({strings: ["Far Left", "Left", "Center-left", "Center-right", "Right", "Far Right"]}),
		})
		indicatorPosition.set_selected(settings.get_enum('indicator-position'));
		indicatorPosition.connect('notify::selected', ()=> {settings.set_enum('indicator-position', indicatorPosition.selected);});
		group.add(indicatorPosition)
		
		window.add(page);
	}
}
