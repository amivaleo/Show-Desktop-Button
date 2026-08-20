import Adw from "gi://Adw";
import Gio from "gi://Gio";
import GLib from "gi://GLib";
import Gtk from "gi://Gtk";
import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class ShowDesktopButtonPrefs extends ExtensionPreferences {
	fillPreferencesWindow(window) {
		const settings = this.getSettings();
		const page = new Adw.PreferencesPage();
		
		const groupBehaviour = new Adw.PreferencesGroup({
			title: _("Behaviour"),
		});
		const groupPanel = new Adw.PreferencesGroup({
			title: _("Aspect"),
		});
		const groupPreview = new Adw.PreferencesGroup({
			title: _("Preview"),
		});
		const groupShortcut = new Adw.PreferencesGroup({
			title: _("Shortcut"),
		});
		
		page.add(groupBehaviour);
		page.add(groupPanel);
		page.add(groupPreview);
		page.add(groupShortcut);
		
		
		
		// File chooser dialog for selecting SVG icon
		this._fileChooser = new Gtk.FileChooserNative({
			title: _('Select an SVG for the Panel Indicator'),
			modal: true,
		});
		const filter = new Gtk.FileFilter();
		filter.set_name(_('SVG Images'));
		filter.add_pattern('*.svg');
		this._fileChooser.set_filter(filter);
		
		this._fileChooser.connect('response', (dlg, response) => {
			if (response !== Gtk.ResponseType.ACCEPT) return;
			settings.set_string('indicator-icon-name', dlg.get_file().get_path());
		});
		
		
		
		// Keep Focused Window
		const rowKeepFocused = new Adw.ActionRow({
			title: _("Keep Focused Window"),
			subtitle: _("Do not hide the focused window"),
		});
		
		const switchKeepFocused = new Gtk.Switch({
			active: settings.get_boolean('keep-focused'),
			valign: Gtk.Align.CENTER,
		});
		switchKeepFocused.connect('state-set', (widget, state) => {
			settings.set_boolean('keep-focused', state);
		});
		settings.connect('changed::keep-focused', () => {
			switchKeepFocused.set_active(settings.get_boolean('keep-focused'));
		});
		rowKeepFocused.add_suffix(switchKeepFocused);
		groupBehaviour.add(rowKeepFocused);
		
		
		
		// Position on Panel
		const indicatorPosition = new Adw.ComboRow({
			title: _('Position on Panel'),
			subtitle: _('Position of the indicator on the panel'),
			model: new Gtk.StringList({ 
				strings: [_("Far Left"), _("Left"), _("Center-left"), _("Center-right"), _("Right"), _("Far Right")] 
			}),
		});
		indicatorPosition.set_selected(settings.get_enum('indicator-position'));
		indicatorPosition.connect('notify::selected', () => {
			settings.set_enum('indicator-position', indicatorPosition.selected);
		});
		groupPanel.add(indicatorPosition);
		
		
		
		// Indicator Icon
		const rowIndicatorIconName = new Adw.ActionRow({
			title: _("Icon"),
			subtitle: _("Icon file used for the panel indicator.\nIcons must be located only in the following paths:\n") +
						"/usr/share/icons/ or ~/.icons/ or ~/.local/share/icons/"
		});
		
		const boxIndicatorIconName = new Gtk.Box({
			halign: Gtk.Align.END,
			valign: Gtk.Align.CENTER,
			hexpand: true,
			spacing: 8,
		});
		
		this.buttonIndicatorIconName = new Gtk.Button();
		this.buttonIndicatorIconName.set_tooltip_text(_('Click to change icon'));
		this.buttonIndicatorIconName.set_child(new Gtk.Label());
		this.buttonIndicatorIconName.connect('clicked', () => {
			this._fileChooser.transient_for = window;
			const initialFolder = Gio.file_new_for_path("/usr/share/icons/");
			this._fileChooser.set_current_folder(initialFolder);
			this._fileChooser.show();
		});
		
		this._labelIndicatorIconName = new Gtk.Label();
		settings.connect('changed::indicator-icon-name', () => {
			this._updateLabelIndicatorIconName();
		});
		this._updateLabelIndicatorIconName();
		
		const buttonResetIndicatorIconName = new Gtk.Button();
		buttonResetIndicatorIconName.set_child(new Gtk.Image({ icon_name: 'edit-undo-symbolic' }));
		buttonResetIndicatorIconName.set_tooltip_text(_('Click to reset the default icon'));
		buttonResetIndicatorIconName.connect('clicked', () => {
			settings.reset('indicator-icon-name');
			this._updateLabelIndicatorIconName();
		});
		
		boxIndicatorIconName.append(this.buttonIndicatorIconName);
		boxIndicatorIconName.append(buttonResetIndicatorIconName);
		rowIndicatorIconName.add_suffix(boxIndicatorIconName);
		groupPanel.add(rowIndicatorIconName);
		
		
		
		// Hover Preview
		const rowHoverPreview = new Adw.ActionRow({
			title: _("Hover Preview"),
			subtitle: _("Windows becomes transparent when hovering the panel indicator"),
		});
		
		const switchHoverPreview = new Gtk.Switch({
			active: settings.get_boolean('hover-preview'),
			valign: Gtk.Align.CENTER,
		});
		
		switchHoverPreview.connect('state-set', (widget, state) => {
			settings.set_boolean('hover-preview', state);
		});
		settings.connect('changed::hover-preview', () => {
			switchHoverPreview.set_active(settings.get_boolean('hover-preview'));
		});
		rowHoverPreview.add_suffix(switchHoverPreview);
		groupPreview.add(rowHoverPreview);
		
		
		
		// Preview Delay
		const rowHoverDelay = new Adw.ActionRow({
			title: _("Preview Delay"),
			subtitle: _("Delay before preview is activated"),
		});
			
		const rowHoverDelayScale = new Gtk.Scale({
			orientation: Gtk.Orientation.HORIZONTAL,
			adjustment: new Gtk.Adjustment({
				lower: 100,
				upper: 2000,
				step_increment: 50,
				page_increment: 100,
			}),
			digits: 0,
			hexpand: true,
			valign: Gtk.Align.CENTER,
			width_request: 100,
		});
		rowHoverDelayScale.add_mark(300, Gtk.PositionType.TOP, null);
		
		const rowHoverDelayScaleLabel = new Gtk.Label({
			xalign: 1,
			hexpand: false,
			justify: Gtk.Justification.RIGHT,
			width_chars: 8,
		});
		rowHoverDelayScaleLabel.get_style_context().add_class('dim-label');
		const rowHoverDelayScaleLabelUpdate = (v) => {
			rowHoverDelayScaleLabel.set_text(`${Math.round(v)} ms`);
		};
		rowHoverDelayScaleLabelUpdate(rowHoverDelayScale.get_value());
		rowHoverDelayScale.connect('value-changed', () => {
			const v = rowHoverDelayScale.get_value();
			rowHoverDelayScaleLabelUpdate(v);
			settings.set_int('hover-delay', Math.round(v));
		});
		rowHoverDelayScale.set_value(settings.get_int('hover-delay'));
		
		settings.connect('changed::hover-delay', () => {
			rowHoverDelayScale.set_value(settings.get_int('hover-delay'));
		});
		
		const rowHoverDelayBox = new Gtk.Box({
			spacing: 10,
			valign: Gtk.Align.CENTER,
		});
		
		rowHoverDelayBox.append(rowHoverDelayScaleLabel);
		rowHoverDelayBox.append(rowHoverDelayScale);			
		rowHoverDelay.add_suffix(rowHoverDelayBox);
		groupPreview.add(rowHoverDelay);
		
		
		
		// Preview Opacity
		const rowPreviewOpacity = new Adw.ActionRow({
			title: _("Windows Opacity"),
			subtitle: _("Windows opacity during preview"),
		});
		
		const rowPreviewOpacityScale = new Gtk.Scale({
			orientation: Gtk.Orientation.HORIZONTAL,
			adjustment: new Gtk.Adjustment({
				lower: 10,
				upper: 90,
				step_increment: 1,
				page_increment: 5,
			}),
			digits: 0,
			hexpand: true,
			valign: Gtk.Align.CENTER,
			width_request: 100,
		});
		rowPreviewOpacityScale.add_mark(40, Gtk.PositionType.TOP, null);
		
		const rowPreviewOpacityScaleLabel = new Gtk.Label({
			xalign: 1,
			hexpand: false,
			justify: Gtk.Justification.RIGHT,
			width_chars: 8,
		});
		rowPreviewOpacityScaleLabel.get_style_context().add_class('dim-label');
		const rowPreviewOpacityScaleLabelUpdate = (v) => {
			rowPreviewOpacityScaleLabel.set_text(`${Math.round(v)}%`);
		};	
		rowPreviewOpacityScaleLabelUpdate(rowPreviewOpacityScale.get_value());
		rowPreviewOpacityScale.connect('value-changed', () => {
			const v = rowPreviewOpacityScale.get_value();
			rowPreviewOpacityScaleLabelUpdate(v);
			settings.set_int('hover-opacity', Math.round(v));
		});
		rowPreviewOpacityScale.set_value(settings.get_int('hover-opacity'));
		
		settings.connect('changed::hover-opacity', () => {
			rowPreviewOpacityScale.set_value(settings.get_int('hover-opacity'));
		});
		
		const rowPreviewOpacityBox = new Gtk.Box({
			spacing: 10,
			valign: Gtk.Align.CENTER,
		});
		rowPreviewOpacityBox.append(rowPreviewOpacityScaleLabel);
		rowPreviewOpacityBox.append(rowPreviewOpacityScale);
		rowPreviewOpacity.add_suffix(rowPreviewOpacityBox);
		groupPreview.add(rowPreviewOpacity);
		
		const setHoverSensitivity = () => {
			const active = settings.get_boolean('hover-preview');
			rowHoverDelay.set_sensitive(active);
			rowPreviewOpacity.set_sensitive(active);
		};
		
		setHoverSensitivity();
		settings.connect('changed::hover-preview', setHoverSensitivity);
		
		
		
		// Link to System Settings for Shortcut Management
		const rowSystemShortcut = new Adw.ActionRow({
			title: _("Edit Settings shortcut"),
			subtitle: _("Keyboard > Navigation > Hide all normal windows"),
			activatable: true,
		});
		
		rowSystemShortcut.add_suffix(new Gtk.Image({
			icon_name: 'adw-external-link-symbolic',
			valign: Gtk.Align.CENTER,
		}));
		
		rowSystemShortcut.connect('activated', () => {
			try {
				Gio.Subprocess.new(
					['gnome-control-center', 'keyboard'],
					Gio.SubprocessFlags.NONE
				);
			} catch (e) {
				console.error(`Failed to open Settings: ${e.message}`);
			}
		});
		
		groupShortcut.add(rowSystemShortcut);
		
		window.add(page);
		window.connect('close-request', this.on_destroy.bind(this));
	}
	
	_updateLabelIndicatorIconName() {
		const settings = this.getSettings();
		const filename = settings.get_string('indicator-icon-name');
		this.buttonIndicatorIconName.get_child().set_label(GLib.basename(filename));
	}
	
	on_destroy() {
		if (this._fileChooser) {
			this._fileChooser.destroy();
			this._fileChooser = null;
		}
		if (this.buttonIndicatorIconName) {
			this.buttonIndicatorIconName.destroy();
			this.buttonIndicatorIconName = null;
		}
		if (this._labelIndicatorIconName) {
			this._labelIndicatorIconName.destroy();
			this._labelIndicatorIconName = null;
		}
	}
}