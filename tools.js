const {Gio} = imports.gi;
//const Gettext = imports.gettext;
const Me = imports.misc.extensionUtils.getCurrentExtension();


//function getGettext() {
//	
//	let domain = Me.metadata['gettext-domain'];
//	
//	Gettext.bindtextdomain(domain, Me.dir.get_child("locale").get_path());
//	Gettext.textdomain(domain);
//	
//	return Gettext;
//}

function getSettings() {

	let GioSSS = Gio.SettingsSchemaSource;
	
	let schemaSource = GioSSS.new_from_directory(
		Me.dir.get_child("schemas").get_path(),
		GioSSS.get_default(),
		false
	);
	
	let schemaObj = schemaSource.lookup(Me.metadata['settings-schema'], true);
	
	if (!schemaObj) {
		throw new Error('Cannot find schemas');
	}
	
	return new Gio.Settings({ settings_schema : schemaObj });
}

