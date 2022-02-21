# Show-desktop-button

A button that hide/show all the open windows on desktop


## Installation

You can automatically install the extension from the website (automatic installation) or you can download the repo files (manual installation).


**Automatic installation (best option):**

* Install from [webpage](https://extensions.gnome.org/extension/1194/show-desktop-button/) on gnome extension website.


**Manual installation:**

* Open a terminal and give the command
```
git clone https://github.com/amivaleo/Show-Desktop-Button.git ~/.local/share/gnome-shell/extensions/show-desktop-button@amivaleo
```
* Restart the gnome shell by rebooting or by logout&login or by pressing `alt+f2` then writing `r` and pressing enter.

* Enable the extension in Tweaks.


## Translation

If you'd like to translate the extension in your native language, you can

* download the file `show-desktop-button.pot` which is in the `locale` folder
* open it using `Poedit` or using any other software or by terminal
* translate the string in your language
* save and compile the translation
* rename the resulting file with extension `.mo` to `show-desktop-button.mo`
* send that file to me by opening an issue (in which you MUST specify the language short code, like `it_IT`, `es_ES`, `en_US`, etc) or by a pulling request


## Version history

v22:

* Now works fine with [DING extension](https://gitlab.com/rastersoft/desktop-icons-ng), fixed by [proninyaroslav](https://github.com/proninyaroslav)

v19:

* Gnome 41 port by [JustPerfection](https://github.com/amivaleo/Show-Desktop-Button/pull/23)

v18:

* Gnome 40 port by [JustPerfection](https://github.com/amivaleo/Show-Desktop-Button/pull/20)

v15:

* Extend support to gnome 3.36

v14:

* Fix localization

v13:

* Ignores docks, conky and DING extension

v12:

* Minor typo...

v11:

* Minor typo...

v10:

* Minor typo fixed

v9:

* Restored panel position feature
* Modern pref dialog (contributions by [JustPerfection](https://gitlab.gnome.org/justperfection.channel))

v8:

* Restored old pref dialogue

v7:

* Added rough support for changing indicator position on the panel

v6:

* minor fixes so that, when the extension is disabled, no error is (should be?) displayed

v5:

* added support for gnome-shell 3.38
* only unminimize those windows that weren't already minimized by the user (windows-like behaviour)
* REMOVED FEATURE: the indicator will only appear on the right side of the panel

## Credits

[l300lvl](https://extensions.gnome.org/accounts/profile/l300lvl), author of the [original extension](https://extensions.gnome.org/extension/64/show-desktop-button/)

[JustPerfection](https://gitlab.gnome.org/justperfection.channel) for [his tutorials](https://gitlab.gnome.org/justperfection.channel/gnome-shell-extension-samples) and his substantial help

