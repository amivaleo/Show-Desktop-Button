const {GObject, Gtk} = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const Tools = Me.imports.tools;
const Settings = Tools.getSettings();
const Gettext = imports.gettext.domain(Me.metadata['gettext-domain']);
const _ = Gettext.gettext;

function init () {
    ExtensionUtils.initTranslations();
}

function buildPrefsWidget () {
	
	let widget = new MyPrefsWidget();
	widget.show_all();
	
	return widget;
}

const MyPrefsWidget = new GObject.Class({

	Name : "show-desktop-button-prefs.Widget",
	GTypeName : "show-desktop-button-prefs_Widget",
	Extends : Gtk.ScrolledWindow,
	
	_init : function (params) {
	
		this.parent(params);
		
		let builder = new Gtk.Builder();
		builder.set_translation_domain(Me.metadata['gettext-domain']);
		builder.add_from_file(Me.path + '/prefs.ui');
		
		this.connect('destroy', Gtk.main_quit);
		
		let SignalHandler = {
		
			panelPositionHandler (w) {
				log(w.get_active());
				let value = w.get_active();
				Settings.set_enum('panel-position', value);
			}
	
		};
		
		builder.connect_signals_full( (builder, object, signal, handler) => {
			object.connect( signal, SignalHandler[handler].bind(this) );
		});
		
		let currentPosition = Settings.get_enum('panel-position');
		builder.get_object("panelButtonPosition_combobox").set_active(currentPosition);
		
		this.add(builder.get_object('main_prefs'));
	}

});

