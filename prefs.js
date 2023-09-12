import Gtk from 'gi://Gtk';
import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class ShowDesktopButtonPrefs extends ExtensionPreferences {
    /* prefs widget
    */
    fillPreferencesWindow(window) {

        let settings = this.getSettings();

        let builder = new Gtk.Builder();
        builder.set_translation_domain(this.metadata['gettext-domain']);
        builder.add_from_file(this.dir.get_child('prefs.ui').get_path());

        let panelPosition = settings.get_enum('panel-position');
        let comboRow = builder.get_object('panel_button_position');

        comboRow.set_selected(panelPosition);

        comboRow.connect('notify::selected-item', w => {
            let value = w.get_selected();
            settings.set_enum('panel-position', value);
        });

        window.add(builder.get_object('position_page'));
    }
}