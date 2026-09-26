# Cope Manager

[![English](https://img.shields.io/badge/lang-English-0A66C2?style=for-the-badge)](README.md)
[![Tiếng Việt](https://img.shields.io/badge/lang-Tiếng%20Việt-DA251D?style=for-the-badge)](README-vi.md)

Web-based file manager and code editor — a rewrite / upgrade of [php-filemanager](https://github.com/cubiclesoft/php-filemanager) by [CubicleSoft](https://github.com/cubiclesoft).

![Cope Manager — File Explorer](https://i.imgur.com/RlwVp8i.png)

![Cope Manager — Code Editor](https://i.imgur.com/xIqgc0K.png)

## Overview

Cope Manager keeps the lightweight, easy-to-install architecture of the original and improves the file management / code editing experience: a full-featured explorer, tabbed ACE editor, compress / extract, recycle bin, and more flexible file-extension rules.

Useful for managing files on PHP hosting, editing source code in the browser, or embedding into an existing app via `index_hook.php`.

## Features

- **File Explorer** — browse, create, rename, copy / move / delete, upload, download.
- **Tabbed code editor** — [ACE Editor](https://ace.c9.io/), themes / keybindings (including VS Code), file preview.
- **Compress & extract** — zip compress / extract from the explorer.
- **Recycle Bin** — soft delete (toggle during install).
- **File extension modes** — All / Allow (whitelist) / Exclude (blacklist).
- **Mobile-friendly** — usable on phones.
- **Quick setup** — `install.php` wizard on any PHP host.
- **Login integration** — `index_hook.php` for your own auth system.

## Requirements

- PHP 5.6+ (PHP 7+ / 8+ recommended)
- A writable storage directory for the web server

## Installation

1. Clone or upload the source to a web server directory:

```bash
git clone https://github.com/copecute/cope-manager.git
```

2. Open `install.php` in a browser and follow the wizard.
3. Set **File storage path** (the folder to manage) and optionally **File storage base URL**.
4. Set a login password (or leave blank and use `index_hook.php` with your own login).
5. After install, lock down the install directory if needed, then open the main page.

If you do not need the tabbed editor / previewer, disable **Use Tabbed Editor/Viewer** during install — File Explorer will fill the whole UI.

Configuration is stored in `config.php` (not committed; see `.gitignore`).

## Embedding

Create `index_hook.php` to validate the user session / permissions and adjust `$config` as needed.

Optional hooks:

- `ModifyFileExplorerOptions(&$options)` — tweak server-side options before actions run.
- `ModifyFileManagerOptions()` — emit extra JS to adjust client options (e.g. extra XHR params).

Always validate access on the server for every client request.

## Credits

Based on:

- [cubiclesoft/php-filemanager](https://github.com/cubiclesoft/php-filemanager)
- [cubiclesoft/js-fileexplorer](https://github.com/cubiclesoft/js-fileexplorer)

Cope Manager is a rewrite / upgrade by [copecute](https://github.com/copecute). Thanks to CubicleSoft for the original open-source foundation.

## License

Same as upstream php-filemanager: **MIT** or **LGPL**, your choice.
