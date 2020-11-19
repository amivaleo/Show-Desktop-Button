# Show-desktop-button
A button that hide/show all the open windows on desktop

## Installation
You can automatically install the extension from the website (automatic installation) or you can download the repo files (manual installation) .


**Automatic installation (best option):**

* Install from [webpage](https://extensions.gnome.org/extension/1194/show-desktop-button/) on gnome extension website.


**Manual installation:**

* Download the zip file
* Unzip it 
* Put the folder `show-desktop-button@amivaleo` in `~/.local/share/gnome-shell/extensions/`
* Restart the gnome shell environnment (reboot, logout and login again, or `alt+f2` then write `r` and press enter).

## Translation

If you'd like to translate the extension in your native language, you can

* download the file `show-desktop-button.pot` which is in the `locale` folder
* open it using `Poedit` or using any other software or by terminal
* translate the string in your language
* save and compile the translation
* rename the resulting file with extension `.mo` to `show-desktop-button.mo`
* send that file to me by opening an issue (in which you MUST specify the language short code, like `it_IT`, `es_ES`, `en_US`, etc) or by a pulling request

## Version history

v5:

* added support for gnome-shell 3.38
* only unminimize those windows that weren't already minimized by the user (windows-like behaviour)
* REMOVED FEATURE: the indicator will only appear on the right side of the panel

v6:

* minor fixes so that, when the extension is disabled, no error is (should be?) displayed

v7:

* Added rough support for changing indicator position on the panel

v8:

* Restored old pref dialogue

v9:

* Restored panel position feature
* Modern pref dialog (contributions from [JustPerfection](https://gitlab.gnome.org/justperfection.channel))

v10:

* Minor typo fixed

v11:

* Minor typo...

v12:

* Minor typo...

v13:

* Ignores docks, conky and DING extension

v14:

* Fix localization

## Credits

[l300lvl](https://extensions.gnome.org/accounts/profile/l300lvl), author of the [original extension](https://extensions.gnome.org/extension/64/show-desktop-button/)

[JustPerfection](https://gitlab.gnome.org/justperfection.channel) for [his tutorials](https://gitlab.gnome.org/justperfection.channel/gnome-shell-extension-samples) and his substantial help
