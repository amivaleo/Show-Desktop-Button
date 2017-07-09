const GdkPixbuf = imports.gi.GdkPixbuf;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const Lang = imports.lang;
const Gettext = imports.gettext.domain('show-desktop-button');
const _ = Gettext.gettext;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;
const Keys = Me.imports.keys;

//const _N = function(x) { return x; }

//const SHOW_OVERVIEW = _N("Show Overview");
const RADIO_BTNS = [
        _("left"),
        _("center"),
        _("right")
    ];

function init() {
    Convenience.initTranslations();
}

function ShowDesktopSettingsWidget() {
    this._init();
}

ShowDesktopSettingsWidget.prototype = {

    _init: function() {
        this._grid = new Gtk.Grid();
        this._grid.margin = this._grid.row_spacing = this._grid.column_spacing = 10;
	    this._settings = Convenience.getSettings();

        //overview switch
//        this._grid.attach(new Gtk.Label({ label: _(SHOW_OVERVIEW), wrap: true, xalign: 0.0 }), 0,  0, 1, 1);
//        let overlaySwitch = new Gtk.Switch({active: this._settings.get_boolean(Keys.OVERVIEW_MODE)});
//        this._grid.attach(overlaySwitch, 4, 0, 1, 1);

//        overlaySwitch.connect('notify::active', Lang.bind(this, this._setOverViewMode));


        let introLabel = _("Panel Position");
        let radio = null;

        this._grid.attach(new Gtk.Label({ label: introLabel, wrap: true, sensitive: true,
                                     margin_bottom: 10, margin_top: 5 }),
                                    0, 1, 1, 1);

        //build radio buttons
        let currentPosition = this._settings.get_string(Keys.POSITION);
        let count = 3;
        let str = '';
        for (let element in RADIO_BTNS) {
            let str = RADIO_BTNS[element];
            radio = new Gtk.RadioButton({ group: radio, label: this._capitalised(_(str)), valign: Gtk.Align.START });
            this._grid.attach(radio, count, 1, 1, 1);

            radio.connect('toggled', Lang.bind(this, function(widget) {
                if (widget.active)
                    this._settings.set_string(Keys.POSITION, str);
                }));

            if (currentPosition == str) radio.active = true;
            count++
        }
    },

    _capitalised: function(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

//    _setOverViewMode: function(object) {
//        this._settings.set_boolean(Keys.OVERVIEW_MODE, object.active);
//    },

//    _resetSettings: function() {
//        this._settings.set_boolean(Keys.OVERVIEW_MODE, false);
//    },

    _completePrefsWidget: function() {
        let scollingWindow = new Gtk.ScrolledWindow({
                                 'hscrollbar-policy': Gtk.PolicyType.AUTOMATIC,
                                 'vscrollbar-policy': Gtk.PolicyType.AUTOMATIC,
                                 'hexpand': true, 'vexpand': true});
        scollingWindow.add_with_viewport(this._grid);
        scollingWindow.show_all();
        return scollingWindow;
    }
};

function buildPrefsWidget() {
    let widget = new ShowDesktopSettingsWidget();
    return widget._completePrefsWidget();
}
