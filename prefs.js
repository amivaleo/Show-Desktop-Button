const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const Me = imports.misc.extensionUtils.getCurrentExtension();

function init () {}

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
    builder.set_translation_domain('show-desktop-button');
    builder.add_from_file(Me.path + '/prefs.ui');
    
    this.connect("destroy", Gtk.main_quit);
    
    let SignalHandler = {
    
      panelPositionHandler (w) {
        log( w.get_active() );
      }
    
    };
    
    builder.connect_signals_full( (builder, object, signal, handler) => {
      object.connect( signal, SignalHandler[handler].bind(this) );
    } );
    
    this.add( builder.get_object('main_prefs') );
  }

});

