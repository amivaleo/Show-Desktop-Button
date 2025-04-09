# Show-desktop-button

A button that hide/show all the open windows on desktop


## Installation

You can automatically install the extension from [webpage](https://extensions.gnome.org/extension/1194/show-desktop-button/) on gnome extension website.


## Translation

If you'd like to translate the extension in your native language, you can download `show-desktop-button.pot` and edit that using, for example, `Poedit`. Then send me the `.mo` e `.po` files you produce.


## Version history

| Version | Changes |
|---------|---------|
| 45    | Extended support to Gnome 48 by [nater1983](https://github.com/amivaleo/Show-Desktop-Button/pull/53) and Gnome 49| 
| 44    | Corrected a mistake in prefs.js... |
| 43    | Added reset button for the indicator icon name & merged with Hide-Unfocused |
| 42    | Added shortcut |
| 41    | Fix an issue with the icon_name and added touchscreen compatibility |
| 40    | Added back translations |
| 39    | Fixed an error introduced in v38 |
| 38    | Implemented a better interface for choosing the indicator icon name |
| 37    | Getting rid of prefs.ui, newer prefs.js, added "change icon name" feature. Temporary rollback: messed up the translations |
| 36    | Extended support to Gnome 47 by [nater1983](https://github.com/amivaleo/Show-Desktop-Button/pull/49) |
| 35    | Extended support to Gnome 46 by [nater1983](https://github.com/amivaleo/Show-Desktop-Button/pull/45) |
| 34    | Bug fix related to modal dialog |
| 33    | Gnome 45 port by [JustPerfection](https://github.com/amivaleo/Show-Desktop-Button/pull/23) |
| 32    | Extended support to Gnome 44 |
| 31    | Added translations into a few languages (DeepL) |
| 30    | Added "Center-right" for the indicator's position |
| 29    | Removing unnecessary files |
| 28    | Added "Far left" and "Far right" for the indicator's position |
| 27    | Fixed error in pruneWindows(windows) |
| 26    | New algorithm: if you have at least one unminimized window, the extension will minimize it. Otherwise, if all your windows are minimized, the extension will unminimize them all. |
| 25    | Extended support to Gnome 43 |
| 24    | Added Settings = null in "disable" |
| 23    | Added support to GNOME 42. Many thanks to [xiaozhangup](https://github.com/amivaleo/Show-Desktop-Button/issues?q=is%3Aissue+author%3Axiaozhangup) |
| 22    | Now works fine with [DING extension](https://gitlab.com/rastersoft/desktop-icons-ng), fixed by [proninyaroslav](https://github.com/proninyaroslav) |
| 19    | Gnome 41 port by [JustPerfection](https://github.com/amivaleo/Show-Desktop-Button/pull/23) |
| 18    | Gnome 40 port by [JustPerfection](https://github.com/amivaleo/Show-Desktop-Button/pull/20) |
| 15    | Extend support to gnome 3.36 |
| 14    | Fix localization |
| 13    | Ignores docks, conky and DING extension |
| 12    | Minor typo... |
| 11    | Minor typo... |
| 10    | Minor typo fixed |
| 9     | Restored panel position feature; Modern pref dialog (contributions by [JustPerfection](https://gitlab.gnome.org/justperfection.channel)) |
| 8     | Restored old pref dialogue |
| 7     | Added rough support for changing indicator position on the panel |
| 6     | Minor fixes so that, when the extension is disabled, no error is (should be?) displayed |
| 5     | Added support for gnome-shell 3.38; only unminimize those windows that weren't already minimized by the user (windows-like behaviour); REMOVED FEATURE: the indicator will only appear on the right side of the panel |


## Credits

[l300lvl](https://extensions.gnome.org/accounts/profile/l300lvl), author of the [original extension](https://extensions.gnome.org/extension/64/show-desktop-button/)

[JustPerfection](https://gitlab.gnome.org/justperfection.channel) for [his tutorials](https://gitlab.gnome.org/justperfection.channel/gnome-shell-extension-samples) and his substantial help

