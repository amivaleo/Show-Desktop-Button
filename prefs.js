const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;
const GObject = imports.gi.GObject;
const Config = imports.misc.config;

const Gettext = imports.gettext.domain('show-desktop-button');
const _ = Gettext.gettext;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;
const Lang = imports.lang;

const Keys = Me.imports.keys;


const RADIO_BTNS = [
	_("left"),
	_("center"),
	_("right")
];

function init() {
//	Convenience.initTranslations();
}

function ShowDesktopSettingsWidget() {
	this._init();
}

ShowDesktopSettingsWidget.prototype = {

	_init: function() {
		this._grid = new Gtk.Grid();
		this._grid.margin = this._grid.row_spacing = this._grid.column_spacing = 10;
		this._settings = Convenience.getSettings();

			let panelPositionLabel = _("Panel Position");
			let radio = null;

			this._grid.attach(
				new Gtk.Label({
					label: panelPositionLabel,
					wrap: true,
					sensitive: true,
					margin_bottom: 10,
					margin_top: 10 }),
				0, 1, 1, 1);

			let currentPosition = this._settings.get_string(Keys.position);
			let count = 3;
			let str = '';

			for (let element in RADIO_BTNS) {
				let str = RADIO_BTNS[element];
				radio = new Gtk.RadioButton({ group: radio, label: this._capitalised(_(str)), valign: Gtk.Align.START });
				this._grid.attach(radio, count, 1, 1, 1);

				radio.connect('toggled', Lang.bind(this, function(widget) {
				if (widget.active)
					this._settings.set_string(Keys.position, str);
				}));

				if (currentPosition == str) radio.active = true;
					count++
			}
	},

	_capitalised: function(str) {
		return str.charAt(0).toUpperCase() + str.slice(1);
	},

	_completePrefsWidget: function() {
		let scollingWindow = new Gtk.ScrolledWindow({
			'hscrollbar-policy': Gtk.PolicyType.AUTOMATIC,
			'vscrollbar-policy': Gtk.PolicyType.AUTOMATIC,
			'hexpand': true, 'vexpand': true});
		scollingWindow.add_with_viewport(this._grid);
		scollingWindow.show_all();
		return scollingWindow;}
		
};

function buildPrefsWidget() {
	let widget = new ShowDesktopSettingsWidget();
	return widget._completePrefsWidget();
}
