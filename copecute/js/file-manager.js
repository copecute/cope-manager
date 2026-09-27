// File Manager.
/*
//                       _oo0oo_
//                      o8888888o
//                      88" . "88
//                      (| -_- |)
//                      0\  =  /0
//                    ___/`---'\___
//                  .' \\|     |// '.
//                 / \\|||  :  |||// \
//                / _||||| -:- |||||- \
//               |   | \\\  -  /// |   |
//               | \_|  ''\---/''  |_/ |
//               \  .-\__  '-'  ___/-. /
//             ___'. .'  /--.--\  `. .'___
//          ."" '<  `.___\_<|>_/___.' >' "".
//         | | :  `- \`.;`\ _ /`;.`/ - ` : | |
//         \  \ `_.   \_ __\ /__ _/   .-` /  /
//     =====`-.____`.___ \_____/___.-`___.-'=====
//                       `=---='
//
//     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//            amen đà phật github copecute
//     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */

// TextEncoder/TextDecoder polyfill.
// Source:  https://raw.githubusercontent.com/anonyco/FastestSmallestTextEncoderDecoder/master/EncoderDecoderTogether.min.js
(function(r){function x(){}function y(){}var z=String.fromCharCode,v={}.toString,A=v.call(r.SharedArrayBuffer),B=v(),q=r.Uint8Array,t=q||Array,w=q?ArrayBuffer:t,C=w.isView||function(g){return g&&"length"in g},D=v.call(w.prototype);w=y.prototype;var E=r.TextEncoder,a=new (q?Uint16Array:t)(32);x.prototype.decode=function(g){if(!C(g)){var l=v.call(g);if(l!==D&&l!==A&&l!==B)throw TypeError("Failed to execute 'decode' on 'TextDecoder': The provided value is not of type '(ArrayBuffer or ArrayBufferView)'");
g=q?new t(g):g||[]}for(var f=l="",b=0,c=g.length|0,u=c-32|0,e,d,h=0,p=0,m,k=0,n=-1;b<c;){for(e=b<=u?32:c-b|0;k<e;b=b+1|0,k=k+1|0){d=g[b]&255;switch(d>>4){case 15:m=g[b=b+1|0]&255;if(2!==m>>6||247<d){b=b-1|0;break}h=(d&7)<<6|m&63;p=5;d=256;case 14:m=g[b=b+1|0]&255,h<<=6,h|=(d&15)<<6|m&63,p=2===m>>6?p+4|0:24,d=d+256&768;case 13:case 12:m=g[b=b+1|0]&255,h<<=6,h|=(d&31)<<6|m&63,p=p+7|0,b<c&&2===m>>6&&h>>p&&1114112>h?(d=h,h=h-65536|0,0<=h&&(n=(h>>10)+55296|0,d=(h&1023)+56320|0,31>k?(a[k]=n,k=k+1|0,n=-1):
(m=n,n=d,d=m))):(d>>=8,b=b-d-1|0,d=65533),h=p=0,e=b<=u?32:c-b|0;default:a[k]=d;continue;case 11:case 10:case 9:case 8:}a[k]=65533}f+=z(a[0],a[1],a[2],a[3],a[4],a[5],a[6],a[7],a[8],a[9],a[10],a[11],a[12],a[13],a[14],a[15],a[16],a[17],a[18],a[19],a[20],a[21],a[22],a[23],a[24],a[25],a[26],a[27],a[28],a[29],a[30],a[31]);32>k&&(f=f.slice(0,k-32|0));if(b<c){if(a[0]=n,k=~n>>>31,n=-1,f.length<l.length)continue}else-1!==n&&(f+=z(n));l+=f;f=""}return l};w.encode=function(g){g=void 0===g?"":""+g;var l=g.length|
0,f=new t((l<<1)+8|0),b,c=0,u=!q;for(b=0;b<l;b=b+1|0,c=c+1|0){var e=g.charCodeAt(b)|0;if(127>=e)f[c]=e;else{if(2047>=e)f[c]=192|e>>6;else{a:{if(55296<=e)if(56319>=e){var d=g.charCodeAt(b=b+1|0)|0;if(56320<=d&&57343>=d){e=(e<<10)+d-56613888|0;if(65535<e){f[c]=240|e>>18;f[c=c+1|0]=128|e>>12&63;f[c=c+1|0]=128|e>>6&63;f[c=c+1|0]=128|e&63;continue}break a}e=65533}else 57343>=e&&(e=65533);!u&&b<<1<c&&b<<1<(c-7|0)&&(u=!0,d=new t(3*l),d.set(f),f=d)}f[c]=224|e>>12;f[c=c+1|0]=128|e>>6&63}f[c=c+1|0]=128|e&63}}return q?
f.subarray(0,c):f.slice(0,c)};E||(r.TextDecoder=x,r.TextEncoder=y)})(""+void 0==typeof global?""+void 0==typeof self?this:self:global);

(function() {
	// Prevent multiple instances.
	if (window.hasOwnProperty('FileManager'))  return;

	var EscapeHTML = FlexForms.EscapeHTML;
	var FormatStr = FlexForms.FormatStr;
	var CreateNode = FlexForms.CreateNode;
	var DebounceAttributes = FlexForms.DebounceAttributes;

	function GetScrollLineHeight() {
		var iframe = document.createElement('iframe');
		iframe.src = '#';
		document.body.appendChild(iframe);
		var iwin = iframe.contentWindow;
		var idoc = iwin.document;
		idoc.open();
		idoc.write('<!DOCTYPE html><html><head></head><body><span>a</span></body></html>');
		idoc.close();
		var span = idoc.body.firstElementChild;
		var r = span.offsetHeight;
		document.body.removeChild(iframe);

		return r;
	}

	var scrolllineheight = GetScrollLineHeight();

	var DecodeUTF8 = function(data) {
		var bytes = new Uint8Array(data.length);

		for (var x = 0; x < data.length; x++)
		{
			bytes[x] = data.charCodeAt(x);
		}

		var decoder = new TextDecoder();

		return decoder.decode(bytes);
	};

	var EncodeUTF8 = function(str) {
		var encoder = new TextEncoder();
		var bytes = encoder.encode(str);

		return String.fromCharCode.apply(null, bytes);
	};

	// File Manager.
	window.FileManager = function(parentelem, options) {
		if (!(this instanceof FileManager))  return new FileManager(parentelem, options);

		if (!window.hasOwnProperty('FileExplorer'))
		{
			console.error('[FileManager] The FileExplorer object does not exist.  Did you forget to include "file-explorer.js"?');

			return;
		}

		var triggers = {}, openfilesmap = {}, activefile = false, destroyinprogress = false;
		var $this = this;

		var defaults = {
			messagetimeout: 2000,

			fileexplorer: null,
			fe_group: null,
			fe_capturebrowser: true,
			fe_initpath: [
				[ '', '/' ]
			],
			fe_displayunits: 'iec_windows',
			fe_adjustprecision: true,
			fe_refreshall: true,
			fe_requestvar: 'action',
			fe_requestprefix: 'file_explorer_',
			fe_uploadchunksize: 0,
			fe_concurrentuploads: 4,

			fe_tools: {},

			fe_downloadiframe: true,

			ace_modes: [],
			ace_themes: [],

			recycling: true,
			tabbed: true,
			has_password: true,
			cope_url: 'copecute',
			settings: {},
			mysqlmanager: null,

			onxhrparams: null,

			langmap: {}
		};

		$this.settings = Object.assign({}, defaults, options);

		// Internal DOM-style function.
		var DispatchEvent = function(eventname, params) {
			if (!triggers[eventname])  return;

			triggers[eventname].forEach(function(callback) {
				if (Array.isArray(params))  callback.apply($this, params);
				else  callback.call($this, params);
			});
		};

		// Public DOM-style functions.
		$this.addEventListener = function(eventname, callback) {
			if (!triggers[eventname])  triggers[eventname] = [];

			for (var x in triggers[eventname])
			{
				if (triggers[eventname][x] === callback)  return;
			}

			triggers[eventname].push(callback);
		};

		$this.removeEventListener = function(eventname, callback) {
			if (!triggers[eventname])  return;

			for (var x in triggers[eventname])
			{
				if (triggers[eventname][x] === callback)
				{
					triggers[eventname].splice(x, 1);

					return;
				}
			}
		};

		$this.hasEventListener = function(eventname) {
			return (triggers[eventname] && triggers[eventname].length);
		};

		// Multilingual translation.
		$this.Translate = function(str) {
			return ($this.settings.langmap[str] ? $this.settings.langmap[str] : str);
		};

		// Initialize the UI elements.
		var elems = {
			mainwrap: CreateNode('div', ['fm_file_editor_wrap']),
			innerwrap: CreateNode('div', ['fm_file_editor_wrap_inner']),

			openfileswrap: CreateNode('div', ['fm_file_editor_open_files_wrap']),
			openfilesbuttonswrap: CreateNode('div', ['fm_file_editor_open_files_buttons_wrap']),
			buttonfileexplorerwrap: CreateNode('button', ['fm_file_editor_open_file_explorer_wrap'], { title: $this.Translate('Open/Manage Files... (Ctrl + O)') }),
			buttonfileexplorericon: CreateNode('div', ['fe_fileexplorer_open_icon']),
			buttonmysqlwrap: CreateNode('button', ['fm_file_editor_open_mysql_wrap'], { title: $this.Translate('MySQL Manager... (Ctrl + Shift + M)') }),
			buttonmysqlicon: CreateNode('div', ['fm_mysql_icon']),
			buttontabviewwrap: CreateNode('button', ['fm_file_editor_tab_view_wrap', 'fm_file_editor_hidden']),
			buttontabviewicon: CreateNode('div', ['fm_file_editor_tab_view_icon']),
			buttonmenuwrap: CreateNode('button', ['fm_file_editor_open_menu_wrap', 'fm_file_editor_hidden'], { title: $this.Translate('Options Menu... (Ctrl + M)') }),
			buttonmenuicon: CreateNode('div', ['fm_file_editor_menu_icon']),
			buttonuserwrap: CreateNode('button', ['fm_file_editor_user_menu_wrap'], { title: $this.Translate('Account & Settings') }),
			buttonusericon: CreateNode('div', ['fm_file_editor_user_icon']),

			openfiletabsscrollwrap: CreateNode('div', ['fm_file_editor_open_file_tabs_scroll_wrap']),
			openfiletabswrap: CreateNode('div', ['fm_file_editor_open_file_tabs_wrap']),
			openfiletabs: [],

			editorswrap: CreateNode('div', ['fm_file_editor_editors_wrap']),

			statusbar: CreateNode('div', ['fm_file_editor_statusbar_wrap']),
			statusbarmeasuresize: CreateNode('div', ['fm_file_editor_statusbar_measure_em_size']),
			statusbartextwrap: CreateNode('div', ['fm_file_editor_statusbar_text_wrap']),
			statusbartextsegments: [],
			statusbartextsegmentmap: {},
			statusbartextwrap2: CreateNode('div', ['fm_file_editor_statusbar_text2_wrap']),
			statusbartextsegments2: [],
			statusbartextsegmentmap2: {},

			clipboardoverlay: CreateNode('textarea', ['fm_file_editor_clipboard_overlay', 'fm_file_editor_hidden']),

			fileexplorerwrap: CreateNode('div', ['fm_file_editor_file_explorer_wrap']),
			fileexplorerwrapinner: CreateNode('div', ['fm_file_editor_file_explorer_wrap_inner']),
		};

		elems.buttonfileexplorerwrap.appendChild(elems.buttonfileexplorericon);
		elems.buttonmysqlwrap.appendChild(elems.buttonmysqlicon);
		elems.buttontabviewwrap.appendChild(elems.buttontabviewicon);
		elems.buttonmenuwrap.appendChild(elems.buttonmenuicon);
		elems.buttonuserwrap.appendChild(elems.buttonusericon);
		elems.openfilesbuttonswrap.appendChild(elems.buttonfileexplorerwrap);
		elems.openfilesbuttonswrap.appendChild(elems.buttonmysqlwrap);
		elems.openfilesbuttonswrap.appendChild(elems.buttontabviewwrap);
		elems.openfilesbuttonswrap.appendChild(elems.buttonmenuwrap);

		elems.openfiletabsscrollwrap.appendChild(elems.openfiletabswrap);

		elems.openfileswrap.appendChild(elems.openfilesbuttonswrap);
		elems.openfileswrap.appendChild(elems.openfiletabsscrollwrap);
		elems.openfileswrap.appendChild(elems.buttonuserwrap);

		elems.statusbar.appendChild(elems.statusbarmeasuresize);
		elems.statusbar.appendChild(elems.statusbartextwrap);
		elems.statusbar.appendChild(elems.statusbartextwrap2);

		elems.innerwrap.appendChild(elems.openfileswrap);
		elems.innerwrap.appendChild(elems.editorswrap);
		elems.innerwrap.appendChild(elems.statusbar);

		elems.mainwrap.appendChild(elems.innerwrap);
		elems.mainwrap.appendChild(elems.clipboardoverlay);

		parentelem.appendChild(elems.mainwrap);

		elems.fileexplorerwrap.appendChild(elems.fileexplorerwrapinner);
		document.body.appendChild(elems.fileexplorerwrap);

		// Sets a text segment's displayed text in the status bar.
		$this.SetNamedStatusBarText = function(name, text, timeout) {
			if (destroyinprogress)  return;

			if (!(name in elems.statusbartextsegmentmap))
			{
				elems.statusbartextsegmentmap[name] = { pos: elems.statusbartextsegments.length, timeout: null };

				var node = CreateNode('div', ['fm_file_editor_statusbar_text_segment_wrap']);

				elems.statusbartextsegments.push(node);
				elems.statusbartextwrap.appendChild(node);
			}

			var currsegment = elems.statusbartextsegmentmap[name];

			if (currsegment.timeout)
			{
				clearTimeout(currsegment.timeout);

				currsegment.timeout = null;
			}

			var elem = elems.statusbartextsegments[currsegment.pos];

			if (text === '')
			{
				elem.innerHTML = '';
				elem.classList.add('fm_file_editor_hidden');
			}
			else
			{
				elem.innerHTML = text;
				elem.classList.remove('fm_file_editor_hidden');

				if (timeout)
				{
					elems.statusbartextsegmentmap[name].timeout = setTimeout(function() {
						$this.SetNamedStatusBarText(name, '');
					}, timeout);

					// Recalculate widths.
					var widthmap = [], totalwidth = 1.5 * elems.statusbarmeasuresize.offsetWidth;
					for (var x = 0; x < elems.statusbartextsegments.length; x++)
					{
						var elem2 = elems.statusbartextsegments[x];

						if (elem2.classList.contains('fm_file_editor_hidden'))  widthmap.push(0);
						else
						{
							var currstyle = elem2.currentStyle || window.getComputedStyle(elem2);
							var elemwidth = elem2.offsetWidth + parseFloat(currstyle.marginLeft) + parseFloat(currstyle.marginRight);

							widthmap.push(elemwidth);

							totalwidth += elemwidth;
						}
					}

					for (var x = elems.statusbartextsegments.length; totalwidth >= elems.statusbartextwrap.offsetWidth && x; x--)
					{
						if (widthmap[x - 1] && elem !== elems.statusbartextsegments[x - 1])
						{
							elems.statusbartextsegments[x - 1].classList.add('fm_file_editor_hidden');

							totalwidth -= widthmap[x - 1];
						}
					}
				}
			}

			// Adjust the last visible class.
			elem = null;
			elems.statusbartextsegments.forEach(function(elem2) {
				if (!timeout && elem2.innerHTML !== '')  elem2.classList.remove('fm_file_editor_hidden');

				if (!elem2.classList.contains('fm_file_editor_hidden'))
				{
					elem2.classList.remove('fm_file_editor_statusbar_text_segment_wrap_last');

					elem = elem2;
				}
			});

			if (elem)  elem.classList.add('fm_file_editor_statusbar_text_segment_wrap_last');
		};

		$this.SetNamedStatusBarText('status', '<span class="fm_statusbar_console_ready">' + EscapeHTML($this.Translate('Ready')) + '</span>');
		$this.SetNamedStatusBarText('message', '');

		// In-app debug console: click the left status bar text to open.
		var debuglogentries = [];
		var debuglogmax = 300;
		var debugconsolenode = null;
		var debugconsolebody = null;
		var debugconsolebadge = null;
		var debugfilter = 'all';
		var sessionExpiredShown = false;
		var showModalDialogFn = null;

		var LooksLikeSessionExpired = function(raw) {
			if (raw == null)  return false;
			var text = String(raw).replace(/^\uFEFF/, '').replace(/^\s+/, '');
			if (!text.length)  return false;
			if (text.indexOf('<!--fm_session_login-->') !== -1)  return true;
			if (text.indexOf('Invalid security token') !== -1)  return true;
			if (/^<!DOCTYPE\s+html/i.test(text) || /^<html[\s>]/i.test(text))  return true;
			if (/name=["']password["']/i.test(text) && /fm_login|Sign in|proptitle/i.test(text))  return true;
			return false;
		};

		var LooksLikeInstallPage = function(raw) {
			var text = String(raw || '');
			return text.indexOf('fm_install') !== -1 || /File Manager Installer|Cope Manager Setup|install\.php/i.test(text);
		};

		var GetAuthRedirectUrl = function(raw) {
			try
			{
				var base = window.location.href.split('#')[0].split('?')[0];
				var dir = base.replace(/\/[^\/]*$/, '/');
				if (LooksLikeInstallPage(raw))
				{
					var installSeg = ($this.settings && $this.settings.cope_url) ? String($this.settings.cope_url).replace(/^\/+|\/+$/g, '') : 'copecute';
					return dir + installSeg + '/install.php';
				}
				return base;
			}
			catch (ex)
			{
				return window.location.href;
			}
		};

		// Clear client storage + fire server logout immediately (do not wait for redirect).
		var ClearAuthState = function() {
			try  { sessionStorage.clear(); } catch (ex) {}
			try
			{
				var drop = [];
				for (var i = 0; i < localStorage.length; i++)
				{
					var k = localStorage.key(i);
					if (k && /^fm_|^cope_|^FileManager/i.test(k))  drop.push(k);
				}
				for (var j = 0; j < drop.length; j++)  localStorage.removeItem(drop[j]);
			}
			catch (ex2) {}

			try
			{
				var params = { action: 'logout' };
				if (typeof $this.settings.onxhrparams === 'function')  $this.settings.onxhrparams('logout', params);

				var body = [];
				for (var key in params)
				{
					if (params.hasOwnProperty(key))  body.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
				}
				var payload = body.join('&');
				var logoutUrl = window.location.href.split('#')[0].split('?')[0];

				if (navigator.sendBeacon)
				{
					try
					{
						if (navigator.sendBeacon(logoutUrl, new Blob([payload], { type: 'application/x-www-form-urlencoded' })))  return;
					}
					catch (ex3) {}
				}

				if (window.fetch)
				{
					fetch(logoutUrl, {
						method: 'POST',
						credentials: 'same-origin',
						cache: 'no-store',
						keepalive: true,
						headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
						body: payload
					}).catch(function() {});
					return;
				}

				// Last resort: sync XHR so logout finishes before the user navigates.
				try
				{
					var xhr = new XMLHttpRequest();
					xhr.open('POST', logoutUrl, true);
					xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
					xhr.send(payload);
				}
				catch (ex4) {}
			}
			catch (ex5) {}
		};

		// Hard-navigate to login/install after auth was already cleared.
		var ForceReauthRedirect = function(url) {
			var target = String(url || window.location.href.split('#')[0].split('?')[0]);
			ClearAuthState();

			var sep = (target.indexOf('?') >= 0) ? '&' : '?';
			var next = target + sep + 'reauth=' + Date.now();
			try  { window.location.replace(next); }
			catch (ex)  { window.location.href = next; }
		};

		var ShowSessionExpiredDialog = function(reason, raw) {
			if (sessionExpiredShown || destroyinprogress)  return;
			sessionExpiredShown = true;

			// Clear session immediately when the popup appears — do not wait for click/reload.
			ClearAuthState();

			try  { $this.DebugLog('warn', ['[Session] ' + (reason || 'Session expired') + ' — auth cleared']); } catch (ex) {}

			var isInstall = LooksLikeInstallPage(raw);
			var redirectUrl = GetAuthRedirectUrl(raw);
			var title = isInstall ? $this.Translate('Setup required') : $this.Translate('Session expired');
			var msg = isInstall
				? $this.Translate('Configuration is missing or incomplete. You will be taken to the installer.')
				: $this.Translate('Your login session has expired or is no longer valid. Sign in again to continue.');
			var btnLabel = isInstall ? $this.Translate('Open installer') : $this.Translate('Sign in again');

			var go = function() { ForceReauthRedirect(redirectUrl); };

			if (typeof showModalDialogFn === 'function')
			{
				var html = '';
				html += '<div class="fm_modal_session_icon" aria-hidden="true">!</div>';
				html += '<p class="fm_modal_session_text">' + EscapeHTML(msg) + '</p>';
				html += '<div class="fm_modal_actions"><button type="button" class="fm_modal_btn_primary" data-act="reload">' + EscapeHTML(btnLabel) + '</button></div>';

				showModalDialogFn(title, html, function(overlay, modal, body) {
					var btn = body.querySelector('[data-act="reload"]');
					if (btn)  btn.addEventListener('click', go);
					setTimeout(go, 2500);
				}, 'fm_modal_session', { hideClose: true, persist: true });
			}
			else
			{
				try  { window.alert(title + '\n\n' + msg); } catch (ex2) {}
				go();
			}
		};

		$this.CheckSessionResponse = function(raw) {
			if (LooksLikeSessionExpired(raw))
			{
				ShowSessionExpiredDialog('Authentication required', raw);
				return true;
			}
			return false;
		};

		window.FileManager.CheckActiveSessionResponse = function(raw) {
			return $this.CheckSessionResponse(raw);
		};

		var origconsole = {
			log: console.log.bind(console),
			warn: console.warn.bind(console),
			error: console.error.bind(console)
		};

		var FormatDebugArg = function(arg) {
			if (arg === null)  return 'null';
			if (arg === undefined)  return 'undefined';
			if (typeof arg === 'string')  return arg;
			if (typeof arg === 'number' || typeof arg === 'boolean')  return String(arg);
			if (arg instanceof Error)  return arg.name + ': ' + arg.message + (arg.stack ? '\n' + arg.stack : '');

			try  { return JSON.stringify(arg, null, 2); }
			catch (e)  { return String(arg); }
		};

		var UpdateStatusBarConsoleLine = function(entry) {
			if (!entry)
			{
				$this.SetNamedStatusBarText('status', '<span class="fm_statusbar_console_ready">' + EscapeHTML($this.Translate('Ready')) + '</span>');
				return;
			}

			var oneline = String(entry.message || '').split('\n')[0].replace(/\s+/g, ' ').trim();
			if (oneline.length > 140)  oneline = oneline.slice(0, 137) + '…';
			var level = entry.level || 'log';
			var cls = 'fm_statusbar_console_' + (level === 'error' || level === 'warn' ? level : 'log');
			var prefix = level === 'error' ? '✗ ' : (level === 'warn' ? '! ' : '› ');
			$this.SetNamedStatusBarText('status', '<span class="' + cls + '">' + EscapeHTML(prefix + oneline) + '</span>');
		};

		var UpdateDebugBadge = function() {
			if (!debugconsolebadge)  return;
			var errors = 0;
			for (var i = 0; i < debuglogentries.length; i++)
			{
				if (debuglogentries[i].level === 'error')  errors++;
			}
			debugconsolebadge.textContent = String(debuglogentries.length);
			if (errors)  debugconsolebadge.classList.add('has_error');
			else  debugconsolebadge.classList.remove('has_error');
		};

		var RenderDebugConsole = function() {
			if (!debugconsolebody)  return;

			UpdateDebugBadge();

			var html = [];
			var shown = 0;
			for (var x = 0; x < debuglogentries.length; x++)
			{
				var entry = debuglogentries[x];
				if (debugfilter !== 'all' && entry.level !== debugfilter)  continue;
				shown++;
				html.push('<div class="fm_debug_console_entry fm_debug_console_entry_' + EscapeHTML(entry.level) + '">');
				html.push('<span class="fm_debug_console_time">' + EscapeHTML(entry.time) + '</span>');
				html.push('<span class="fm_debug_console_level">' + EscapeHTML(entry.level) + '</span>');
				html.push('<pre class="fm_debug_console_msg">' + EscapeHTML(entry.message) + '</pre>');
				html.push('</div>');
			}

			if (!shown)  html.push('<div class="fm_debug_console_empty">' + EscapeHTML($this.Translate('No log entries.')) + '</div>');

			debugconsolebody.innerHTML = html.join('');
			debugconsolebody.scrollTop = debugconsolebody.scrollHeight;
		};

		$this.DebugLog = function(level, args) {
			if (destroyinprogress)  return;

			var parts = [];
			for (var x = 0; x < args.length; x++)  parts.push(FormatDebugArg(args[x]));

			var now = new Date();
			var pad = function(n) { return (n < 10 ? '0' : '') + n; };
			var timestr = pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());

			var entry = {
				time: timestr,
				level: level || 'log',
				message: parts.join(' ')
			};

			debuglogentries.push(entry);

			if (debuglogentries.length > debuglogmax)  debuglogentries.splice(0, debuglogentries.length - debuglogmax);

			UpdateStatusBarConsoleLine(entry);

			if (debugconsolenode && !debugconsolenode.classList.contains('fm_file_editor_hidden'))  RenderDebugConsole();
			else  UpdateDebugBadge();
		};

		// Audit-style activity trail (open/save/delete/…) — not just errors.
		$this.LogActivity = function(action, detail) {
			var parts = ['[Activity]', action];
			if (detail != null && detail !== '')  parts.push(String(detail));
			$this.DebugLog('log', parts);
		};

		var ActivityNames = function(entries) {
			if (!entries || !entries.length)  return '';
			if (entries.length === 1)  return entries[0].name || entries[0].id || '';
			return entries.length + ' items';
		};

		console.log = function() {
			origconsole.log.apply(console, arguments);
			$this.DebugLog('log', Array.prototype.slice.call(arguments));
		};
		console.warn = function() {
			origconsole.warn.apply(console, arguments);
			$this.DebugLog('warn', Array.prototype.slice.call(arguments));
		};
		console.error = function() {
			origconsole.error.apply(console, arguments);
			$this.DebugLog('error', Array.prototype.slice.call(arguments));
		};

		window.addEventListener('error', function(e) {
			$this.DebugLog('error', [e.message, e.filename + ':' + e.lineno + ':' + e.colno, e.error]);
			OpenDebugConsole();
		});
		window.addEventListener('unhandledrejection', function(e) {
			$this.DebugLog('error', ['Unhandled promise rejection:', e.reason]);
			OpenDebugConsole();
		});

		var CloseDebugConsole = function() {
			if (!debugconsolenode)  return;

			debugconsolenode.classList.add('fm_file_editor_hidden');
		};

		var OpenDebugConsole = function() {
			if (!debugconsolenode)
			{
				debugconsolenode = CreateNode('div', ['fm_debug_console_wrap', 'fm_file_editor_hidden']);
				var header = CreateNode('div', ['fm_debug_console_header']);
				var titlewrap = CreateNode('div', ['fm_debug_console_title_wrap']);
				var title = CreateNode('div', ['fm_debug_console_title']);
				title.appendChild(document.createTextNode($this.Translate('Debug Console')));
				debugconsolebadge = CreateNode('span', ['fm_debug_console_badge']);
				debugconsolebadge.textContent = '0';
				titlewrap.appendChild(title);
				titlewrap.appendChild(debugconsolebadge);

				var filters = CreateNode('div', ['fm_debug_console_filters']);
				var makefilter = function(id, label) {
					var btn = CreateNode('button', ['fm_debug_console_filter'].concat(id === 'all' ? ['active'] : []), { type: 'button', 'data-filter': id });
					btn.appendChild(document.createTextNode(label));
					btn.addEventListener('click', function(e) {
						e.preventDefault();
						e.stopPropagation();
						debugfilter = id;
						filters.querySelectorAll('.fm_debug_console_filter').forEach(function(b) {
							b.classList.toggle('active', b.getAttribute('data-filter') === id);
						});
						RenderDebugConsole();
					});
					filters.appendChild(btn);
				};
				makefilter('all', $this.Translate('All'));
				makefilter('log', 'Log');
				makefilter('warn', 'Warn');
				makefilter('error', 'Error');

				var actions = CreateNode('div', ['fm_debug_console_actions']);
				var copybtn = CreateNode('button', ['fm_debug_console_btn'], { type: 'button' });
				copybtn.appendChild(document.createTextNode($this.Translate('Copy')));
				var clearbtn = CreateNode('button', ['fm_debug_console_btn'], { type: 'button' });
				clearbtn.appendChild(document.createTextNode($this.Translate('Clear')));
				var closebtn = CreateNode('button', ['fm_debug_console_btn'], { type: 'button' });
				closebtn.appendChild(document.createTextNode($this.Translate('Close')));
				actions.appendChild(copybtn);
				actions.appendChild(clearbtn);
				actions.appendChild(closebtn);
				header.appendChild(titlewrap);
				header.appendChild(filters);
				header.appendChild(actions);
				debugconsolebody = CreateNode('div', ['fm_debug_console_body']);
				debugconsolenode.appendChild(header);
				debugconsolenode.appendChild(debugconsolebody);
				document.body.appendChild(debugconsolenode);

				copybtn.addEventListener('click', function(e) {
					e.preventDefault();
					e.stopPropagation();
					var lines = debuglogentries.map(function(en) {
						return '[' + en.time + '] [' + en.level + '] ' + en.message;
					});
					var text = lines.join('\n');
					if (navigator.clipboard && navigator.clipboard.writeText)
					{
						navigator.clipboard.writeText(text).then(function() {
							$this.SetNamedStatusBarText('message', EscapeHTML($this.Translate('Console copied')), $this.settings.messagetimeout);
						}).catch(function() {});
					}
					else
					{
						var ta = document.createElement('textarea');
						ta.value = text;
						document.body.appendChild(ta);
						ta.select();
						try  { document.execCommand('copy'); } catch (ex) {}
						document.body.removeChild(ta);
						$this.SetNamedStatusBarText('message', EscapeHTML($this.Translate('Console copied')), $this.settings.messagetimeout);
					}
				});
				clearbtn.addEventListener('click', function(e) {
					e.preventDefault();
					e.stopPropagation();
					debuglogentries = [];
					UpdateStatusBarConsoleLine(null);
					RenderDebugConsole();
				});
				closebtn.addEventListener('click', function(e) {
					e.preventDefault();
					e.stopPropagation();
					CloseDebugConsole();
				});

				document.addEventListener('keydown', function(e) {
					if (e.keyCode === 27 && debugconsolenode && !debugconsolenode.classList.contains('fm_file_editor_hidden'))
					{
						CloseDebugConsole();
					}
				});
			}

			debugconsolenode.classList.remove('fm_file_editor_hidden');
			RenderDebugConsole();
		};

		var ToggleDebugConsole = function(e) {
			if (!e.isTrusted)  return;

			e.preventDefault();
			e.stopPropagation();

			if (debugconsolenode && !debugconsolenode.classList.contains('fm_file_editor_hidden'))  CloseDebugConsole();
			else  OpenDebugConsole();
		};

		elems.statusbartextwrap.title = $this.Translate('Click to open debug console');
		elems.statusbartextwrap.style.cursor = 'pointer';
		elems.statusbartextwrap.addEventListener('click', ToggleDebugConsole);

		var DebugConsoleOutsideClick = function(e) {
			if (!debugconsolenode || debugconsolenode.classList.contains('fm_file_editor_hidden'))  return;
			if (!e.isTrusted)  return;
			var t = e.target;
			if (debugconsolenode.contains(t))  return;
			if (elems.statusbartextwrap.contains(t))  return;
			if (t.closest && t.closest('.fm_file_editor_statusbar_text_wrap'))  return;
			CloseDebugConsole();
		};
		document.addEventListener('mousedown', DebugConsoleOutsideClick, true);

		$this.DebugLog('log', ['[FileManager] Activity console ready. File operations are logged here.']);

		// Sets a secondary text segment's displayed text in the status bar.
		$this.SetNamedStatusBarText2 = function(name, text, timeout, width) {
			if (destroyinprogress)  return;

			if (!(name in elems.statusbartextsegmentmap2))
			{
				elems.statusbartextsegmentmap2[name] = { pos: elems.statusbartextsegments2.length, timeout: null };

				var node = CreateNode('div', ['fm_file_editor_statusbar_text2_segment_wrap']);

				if (width)  node.style.minWidth = width;

				elems.statusbartextsegments2.push(node);
				elems.statusbartextwrap2.appendChild(node);
			}

			var currsegment = elems.statusbartextsegmentmap2[name];

			if (currsegment.timeout)
			{
				clearTimeout(currsegment.timeout);

				currsegment.timeout = null;
			}

			var elem = elems.statusbartextsegments2[currsegment.pos];

			if (text === '')
			{
				elem.innerHTML = '';
				elem.classList.add('fm_file_editor_hidden');
			}
			else
			{
				elem.innerHTML = text;
				elem.classList.remove('fm_file_editor_hidden');

				if (timeout)
				{
					elems.statusbartextsegmentmap2[name].timeout = setTimeout(function() {
						$this.SetNamedStatusBarText(name, '');
					}, timeout);

					// Recalculate widths.
					var widthmap = [], totalwidth = 1.5 * elems.statusbarmeasuresize.offsetWidth;
					for (var x = 0; x < elems.statusbartextsegments2.length; x++)
					{
						var elem2 = elems.statusbartextsegments2[x];

						if (elem2.classList.contains('fm_file_editor_hidden'))  widthmap.push(0);
						else
						{
							var currstyle = elem2.currentStyle || window.getComputedStyle(elem2);
							var elemwidth = elem2.offsetWidth + parseFloat(currstyle.marginLeft) + parseFloat(currstyle.marginRight);

							widthmap.push(elemwidth);

							totalwidth += elemwidth;
						}
					}

					for (var x = elems.statusbartextsegments2.length; totalwidth >= elems.statusbartextwrap2.offsetWidth && x; x--)
					{
						if (widthmap[x - 1] && elem !== elems.statusbartextsegments2[x - 1])
						{
							elems.statusbartextsegments2[x - 1].classList.add('fm_file_editor_hidden');

							totalwidth -= widthmap[x - 1];
						}
					}
				}
			}

			// Adjust the last visible class.
			elem = null;
			elems.statusbartextsegments2.forEach(function(elem2) {
				if (!timeout && elem2.innerHTML !== '')  elem2.classList.remove('fm_file_editor_hidden');

				if (!elem2.classList.contains('fm_file_editor_hidden'))
				{
					elem2.classList.remove('fm_file_editor_statusbar_text2_segment_wrap_last');

					elem = elem2;
				}
			});

			if (elem)  elem.classList.add('fm_file_editor_statusbar_text2_segment_wrap_last');
		};

		var ResetNamedStatusBar2 = function() {
			for (var name in elems.statusbartextsegmentmap2)
			{
				$this.SetNamedStatusBarText2(name, '');
			}
		}

		// Register settings callbacks.
		if ($this.settings.onxhrparams)  $this.addEventListener('xhr_params', $this.settings.onxhrparams);

		// Converts a file key string into a tab view.
		$this.GetActiveTabViewFromFileKey = function(filekey) {
			if (typeof(filekey) !== 'string' || !openfilesmap[filekey])  return false;

			var tabnum = openfilesmap[filekey].activeview;
			if (tabnum === false)  return false;

			var tabname = openfilesmap[filekey].tabviews[tabnum];
			var tabview = openfilesmap[filekey].tabviewmap[tabname];

			return tabview;
		};

		$this.GetActiveTabView = function() {
			return $this.GetActiveTabViewFromFileKey(activefile);
		};

		// Adjusts the edited status of a specific tab.
		$this.SetTabEdited = function(filekey, edited) {
			if (typeof(filekey) !== 'string' || !openfilesmap[filekey])  return;

			if (edited)  elems.openfiletabs[openfilesmap[filekey].tabpos].classList.add('fm_file_editor_open_file_tab_edit_status_edited');
			else  elems.openfiletabs[openfilesmap[filekey].tabpos].classList.remove('fm_file_editor_open_file_tab_edit_status_edited');
		};

		// Deactivates the current tab view.
		var DeactivateCurrentTabView = function() {
			var tabview = $this.GetActiveTabView();

			if (tabview === false)  return;

			tabview.Deactivate.call($this);

			ResetNamedStatusBar2();

			// Cancel any active popup menu.
			if (popupmenu)  popupmenu.Cancel();
		};

		// Activates a specific tab via its file key.
		$this.ActivateTab = function(filekey) {
			if (!openfilesmap[filekey])  return;

			if (filekey !== activefile)
			{
				var origactivefile = activefile;

				// Deactivate the existing tab.
				DeactivateCurrentTabView();

				if (activefile !== false)  elems.openfiletabs[openfilesmap[activefile].tabpos].classList.remove('fm_file_editor_open_file_tab_active');

				activefile = filekey;
				elems.openfiletabs[openfilesmap[activefile].tabpos].classList.add('fm_file_editor_open_file_tab_active');
				elems.openfiletabs[openfilesmap[activefile].tabpos].tabIndex = 0;

				if (origactivefile !== false)
				{
					if (document.activeElement === elems.openfiletabs[openfilesmap[origactivefile].tabpos])  elems.openfiletabs[openfilesmap[activefile].tabpos].focus();

					elems.openfiletabs[openfilesmap[origactivefile].tabpos].tabIndex = -1;
				}

				elems.buttontabviewwrap.classList.remove('fm_file_editor_hidden');
				elems.buttonmenuwrap.classList.remove('fm_file_editor_hidden');
			}

			if (activefile !== false && openfilesmap[activefile].activeview !== false)  $this.SetTabView(openfilesmap[activefile].activeview);
		};

		// Sets a specific tab view.
		$this.SetTabView = function(tabnum) {
			if (activefile === false || tabnum >= openfilesmap[activefile].tabviews.length || openfilesmap[activefile].closing)  return;

			DeactivateCurrentTabView();

			openfilesmap[activefile].activeview = tabnum;

			var tabview = $this.GetActiveTabView();
			var config = tabview.GetConfig.call($this);

			tabview.Activate.call($this);

			elems.buttontabviewwrap.title = FormatStr($this.Translate('{0} (Ctrl + {1})'), config.tabview_title, tabnum + 1);
			elems.buttontabviewicon.classList = 'fm_file_editor_tab_view_icon ' + config.tabview_icon;

			if (openfilesmap[activefile].tabviews.length < 2)
			{
				elems.buttontabviewwrap.classList.add('fm_file_editor_disabled');
				elems.buttontabviewwrap.tabIndex = -1;
			}
			else
			{
				elems.buttontabviewwrap.classList.remove('fm_file_editor_disabled');
				elems.buttontabviewwrap.tabIndex = 0;
			}
		};

		// Activates the next tab view.
		$this.NextTabView = function(e) {
			if (e && !e.isTrusted)  return;

			if (activefile === false)  return;

			$this.SetTabView(openfilesmap[activefile].activeview === false ? 0 : (openfilesmap[activefile].activeview + 1) % openfilesmap[activefile].tabviews.length);
		};

		elems.buttontabviewwrap.addEventListener('click', $this.NextTabView);

		$this.CloseActiveTab = function() {
			if (activefile === false)  return;

			DeactivateCurrentTabView();

			var origactivefile = activefile;
			var numleft = openfilesmap[activefile].tabviews.length;
			var finalstatus = true;
			var closereadycallback = function(success) {
				if (!numleft || destroyinprogress)  return;

				if (success !== true)  finalstatus = success;

				numleft--;

				if (numleft)  return;

				if (finalstatus === true)
				{
					$this.SetNamedStatusBarText('message', '');

					var pos = openfilesmap[origactivefile].tabpos;

					// Switch tabs.
					if (origactivefile === activefile)
					{
						var node = elems.openfiletabs[pos];

						if (node.nextSibling)  $this.ActivateTab(node.nextSibling.dataset.file_key);
						else if (node.previousSibling)  $this.ActivateTab(node.previousSibling.dataset.file_key);
						else  activefile = false;
					}

					// Remove the tab views.
					for (var x = 0; x < openfilesmap[origactivefile].tabviews.length; x++)
					{
						var tabname = openfilesmap[origactivefile].tabviews[x];
						var tabview = openfilesmap[origactivefile].tabviewmap[tabname];

						tabview.Destroy.call($this);
					}

					// Remove the tab.
					elems.openfiletabswrap.removeChild(elems.openfiletabs[pos]);
					elems.openfiletabs.splice(pos, 1);

					openfilesmap[origactivefile].tabviews = [];
					openfilesmap[origactivefile].tabviewmap = {};
					delete openfilesmap[origactivefile];

					// Adjust tab position list.
					for (var x in openfilesmap)
					{
						if (openfilesmap.hasOwnProperty(x) && openfilesmap[x].tabpos > pos)  openfilesmap[x].tabpos--;
					}

					// If the last tab was closed, hide buttons and show File Explorer.
					if (activefile === false)
					{
						elems.buttontabviewwrap.classList.add('fm_file_editor_hidden');
						elems.buttonmenuwrap.classList.add('fm_file_editor_hidden');

						$this.ShowFileExplorer();
					}
				}
				else
				{
					elems.openfiletabs[openfilesmap[origactivefile].tabpos].classList.remove('fm_file_editor_open_file_tab_closing');

					$this.SetNamedStatusBarText('message', EscapeHTML(FormatStr($this.Translate('Unable to close the tab.' + (typeof finalstatus === 'string' ? '  {0}' : '')), finalstatus)), $this.settings.messagetimeout);

					openfilesmap[activefile].closing = false;

					if (activefile === origactivefile && openfilesmap[activefile].activeview !== false)  $this.SetTabView(openfilesmap[activefile].activeview);
				}
			};

			elems.openfiletabs[openfilesmap[activefile].tabpos].classList.add('fm_file_editor_open_file_tab_closing');

			$this.SetNamedStatusBarText('message', EscapeHTML($this.Translate('Closing the tab...')), $this.settings.messagetimeout);

			openfilesmap[activefile].closing = true;

			var data = openfilesmap[activefile];
			for (var x = 0; x < data.tabviews.length; x++)
			{
				var tabname = data.tabviews[x];
				var tabview = data.tabviewmap[tabname];

				tabview.Close.call($this, closereadycallback);
			}
		};

		// Returns the active file key.
		$this.GetActiveFileKey = function() {
			return activefile;
		};

		// Returns the active file (if any).
		$this.GetActiveFile = function() {
			return (activefile !== false ? openfilesmap[activefile] : false);
		};

		// Initializes parameters to retrieve file content.  Used by extensions.
		$this.InitLoadFileParams = function() {
			var params = {};

			params[$this.settings.fe_requestvar] = $this.settings.fe_requestprefix + 'load_file';

			DispatchEvent('xhr_params', [$this.settings.fe_requestprefix + 'load_file', params]);

			return params;
		};

		// Initializes parameters to retrieve file content.  Used by extensions.
		$this.InitSaveFileParams = function() {
			var params = {};

			params[$this.settings.fe_requestvar] = $this.settings.fe_requestprefix + 'save_file';

			DispatchEvent('xhr_params', [$this.settings.fe_requestprefix + 'save_file', params]);

			return params;
		};

		// Create the FileExplorer instance (FileExplorerFSHelper compatible).
		if (!$this.settings.fileexplorer)
		{
			var feoptions = {
				group: ($this.settings.fe_group ? $this.settings.fe_group : window.location.href),

				capturebrowser: $this.settings.fe_capturebrowser,

				messagetimeout: $this.settings.messagetimeout,

				displayunits: $this.settings.fe_displayunits,
				adjustprecision: $this.settings.fe_adjustprecision,

				initpath: $this.settings.fe_initpath,

				onblur: function(e) {
					if (e && e.type === 'mousedown' && e.target.closest('.fm_file_editor_open_file_explorer_wrap'))  elems.buttonfileexplorerwrap.classList.add('fm_file_editor_block_popup');

					$this.HideFileExplorer();
				},

				onrefresh: function(folder, required) {
					// Ignore non-required refresh requests.  By default, folders are refreshed every 5 minutes so the widget has up-to-date information.
					if (!required && !$this.settings.fe_refreshall)  return;

					var $this2 = this;

					var params = {
						path: JSON.stringify(folder.GetPathIDs())
					};

					params[$this.settings.fe_requestvar] = $this.settings.fe_requestprefix + 'refresh';

					DispatchEvent('xhr_params', [$this.settings.fe_requestprefix + 'refresh', params]);

					var xhr = new this.PrepareXHR({
						url: window.location.href,
						params: params,
						onsuccess: function(e) {
							var raw = e.target.responseText;
							if (typeof $this.CheckSessionResponse === 'function' && $this.CheckSessionResponse(raw))  return;

							var data;
							try  { data = JSON.parse(raw); }
							catch (ex) {
								if (typeof $this.CheckSessionResponse === 'function')  $this.CheckSessionResponse(raw);
								if (required)  $this2.SetNamedStatusBarText('folder', $this2.EscapeHTML('Failed to load folder.  Invalid server response.'));
								return;
							}

							if (data.success)
							{
								if ($this2.IsMappedFolder(folder))  folder.SetEntries(data.entries);
							}
							else if (required)
							{
								$this2.SetNamedStatusBarText('folder', $this2.EscapeHTML('Failed to load folder.  ' + data.error));
							}
						},
						onerror: function(e) {
							// Output a nice message if the request fails for some reason.
							if (required)  $this2.SetNamedStatusBarText('folder', 'Failed to load folder.  Server error.');
						}
					});

					xhr.Send();
				},

				onrename: function(renamed, folder, entry, newname) {
					var params = {
						path: JSON.stringify(folder.GetPathIDs()),
						id: entry.id,
						newname: newname
					};

					params[$this.settings.fe_requestvar] = $this.settings.fe_requestprefix + 'rename';

					DispatchEvent('xhr_params', [$this.settings.fe_requestprefix + 'rename', params]);

					var xhr = new this.PrepareXHR({
						url: window.location.href,
						params: params,
						onsuccess: function(e) {
							var data = JSON.parse(e.target.responseText);
//console.log(data);

							if (data.success)
							{
								$this.LogActivity('rename', entry.name + ' → ' + newname);
								renamed(data.entry);
							}
							else  renamed(data.error);
						},
						onerror: function(e) {
console.log(e);
							renamed('Server/network error.');
						}
					});

					xhr.Send();
				},

				onopenfile: function(folder, entry) {
					if (!$this.settings.tabbed)  return;

//console.log(entry);
					$this.HideFileExplorer();

					$this.SetNamedStatusBarText('message', FormatStr($this.Translate('Opening "{0}"...'), EscapeHTML(entry.name)), $this.settings.messagetimeout);

					var params = {
						path: JSON.stringify(folder.GetPathIDs()),
						id: entry.id
					};

					params[$this.settings.fe_requestvar] = $this.settings.fe_requestprefix + 'file_info';

					DispatchEvent('xhr_params', [$this.settings.fe_requestprefix + 'file_info', params]);

					var xhr = new this.PrepareXHR({
						url: window.location.href,
						params: params,
						onsuccess: function(e) {
							var data = JSON.parse(e.target.responseText);
//console.log(data);

							if (destroyinprogress)  return;

							if (!data.success)  $this.SetNamedStatusBarText('message', FormatStr($this.Translate('Failed to get information for "{0}".  {1}'), EscapeHTML(entry.name), EscapeHTML(data.error || '')), $this.settings.messagetimeout);
							else
							{
								$this.LogActivity('open', entry.name);
								// Prefer file extension over MIME so PHP/JS/etc. keep correct ACE mode
								// even when file content looks like HTML.
								var mapkey;
								if (fileexthandlermap[data.ext])  mapkey = data.ext;
								else if (fileexthandlermap[data.mime_type])  mapkey = data.mime_type;
								else  mapkey = '';

								if (typeof fileexthandlermap[mapkey] === 'string')  mapkey = fileexthandlermap[mapkey];

								if (Array.isArray(fileexthandlermap[mapkey]))
								{
									var lastmodified = Date.now();

									for (var x = 0; x < fileexthandlermap[mapkey].length; x++)
									{
										var config = fileexthandlermap[mapkey][x].handler.config;

										if ((!config.browseronly || (data.browser && data.url)) && (!config.textonly || data.text))
										{
//console.log(fileexthandlermap[mapkey][x]);
											if (openfilesmap.hasOwnProperty(data.file_key) && elems.openfiletabs[openfilesmap[data.file_key].tabpos].classList.contains('fm_file_editor_open_file_tab_edit_status_edited'))
											{
												if (!confirm(FormatStr($this.Translate('Unsaved changes in "{0}" will be lost.  Reload anyway?'), entry.name)))  return;

												$this.SetTabEdited(data.file_key, false);
											}

											// Create a new tab if one does not exist.
											if (!openfilesmap.hasOwnProperty(data.file_key))
											{
												var tabwrap = CreateNode('div', ['fm_file_editor_open_file_tab_wrap'], { tabIndex: -1 });
												var tabeditstatus = CreateNode('div', ['fm_file_editor_open_file_tab_edit_status']);
												var tabfilename = CreateNode('div', ['fm_file_editor_open_file_tab_filename'], { title: data.file_key });
												var tabclose = CreateNode('div', ['fm_file_editor_open_file_tab_close'], { title: $this.Translate('Close tab (Ctrl + Q)') });

												tabfilename.innerHTML = EscapeHTML(data.name);

												tabwrap.dataset.file_key = data.file_key;

												tabwrap.appendChild(tabeditstatus);
												tabwrap.appendChild(tabfilename);
												tabwrap.appendChild(tabclose);

												elems.openfiletabswrap.appendChild(tabwrap);

												data.tabpos = elems.openfiletabs.length;
												data.tabviews = [];
												data.tabviewmap = {};
												data.activeview = false;
												data.closing = false;

												elems.openfiletabs.push(tabwrap);

												openfilesmap[data.file_key] = data;
											}

											// Activate and trigger a data reload.
											openfilesmap[data.file_key].lastmodified = lastmodified;

											$this.ActivateTab(data.file_key);

											// Set up the tab view if it does not exist.
											if (!openfilesmap[data.file_key].tabviewmap.hasOwnProperty(config.name))
											{
												var tabview = new fileexthandlermap[mapkey][x].handler(elems.editorswrap, $this, fileexthandlermap[mapkey][x].opts, openfilesmap[data.file_key]);

												openfilesmap[data.file_key].tabviewmap[config.name] = tabview;
												openfilesmap[data.file_key].tabviews.push(config.name);

												if (openfilesmap[data.file_key].activeview === false)  $this.SetTabView(0);
												else  $this.SetTabView(openfilesmap[data.file_key].activeview);
											}
										}
									}
								}
							}
						},
						onerror: function(e) {
console.log(e);
							$this.SetNamedStatusBarText('message', FormatStr($this.Translate('Failed to get information for "{0}".  Server/network error.'), entry.name), $this.settings.messagetimeout);
						}
					});

					xhr.Send();
				},

				onnewfolder: function(created, folder) {
					var params = {
						path: JSON.stringify(folder.GetPathIDs())
					};

					params[$this.settings.fe_requestvar] = $this.settings.fe_requestprefix + 'new_folder';

					DispatchEvent('xhr_params', [$this.settings.fe_requestprefix + 'new_folder', params]);

					var xhr = new this.PrepareXHR({
						url: window.location.href,
						params: params,
						onsuccess: function(e) {
							var data = JSON.parse(e.target.responseText);
//console.log(data);

							if (data.success)
							{
								$this.LogActivity('new folder', (data.entry && data.entry.name) ? data.entry.name : '');
								created(data.entry);
							}
							else  created(data.error);
						},
						onerror: function(e) {
console.log(e);
							created('Server/network error.');
						}
					});

					xhr.Send();
				},

				onnewfile: function(created, folder) {
					var params = {
						path: JSON.stringify(folder.GetPathIDs())
					};

					params[$this.settings.fe_requestvar] = $this.settings.fe_requestprefix + 'new_file';

					DispatchEvent('xhr_params', [$this.settings.fe_requestprefix + 'new_file', params]);

					var xhr = new this.PrepareXHR({
						url: window.location.href,
						params: params,
						onsuccess: function(e) {
							var data = JSON.parse(e.target.responseText);
//console.log(data);

							if (data.success)
							{
								$this.LogActivity('new file', (data.entry && data.entry.name) ? data.entry.name : '');
								created(data.entry);
							}
							else  created(data.error);
						},
						onerror: function(e) {
console.log(e);
							created('Server/network error.');
						}
					});

					xhr.Send();
				},

				oninitupload: function(startupload, fileinfo, queuestarted) {
//console.log(fileinfo.file);
//console.log(JSON.stringify(fileinfo.folder.GetPathIDs()));

					var $this2 = this;

					if (fileinfo.type === 'dir')
					{
						// Create a directory.  This type only shows up if the directory is empty.
						// Set a URL, headers, and params to send to the server.
						fileinfo.url = window.location.href;

						fileinfo.headers = {
						};

						fileinfo.params = {
							path: JSON.stringify(fileinfo.folder.GetPathIDs()),
							name: fileinfo.fullPath
						};

						fileinfo.params[$this.settings.fe_requestvar] = $this.settings.fe_requestprefix + 'new_folder';

						DispatchEvent('xhr_params', [$this.settings.fe_requestprefix + 'new_folder', fileinfo.params]);

						fileinfo.currpathparam = 'currpath';

						// Automatic retry count for the directory on failure.
						fileinfo.retries = 3;

						// Create the directory.
						startupload(true);
					}
					else
					{
						var origcurrfolder = $this2.GetCurrentFolder();

						var initparams = {
							path: JSON.stringify(fileinfo.folder.GetPathIDs()),
							name: fileinfo.fullPath,
							size: fileinfo.file.size,
							currpath: JSON.stringify(origcurrfolder.GetPathIDs()),
							queuestarted: queuestarted
						};

						initparams[$this.settings.fe_requestvar] = $this.settings.fe_requestprefix + 'upload_init';

						DispatchEvent('xhr_params', [$this.settings.fe_requestprefix + 'upload_init', initparams]);

						// Prepare the file upload on the server.
						var xhr = new this.PrepareXHR({
							url: window.location.href,
							params: initparams,
							onsuccess: function(e) {
								var data = JSON.parse(e.target.responseText);
//console.log(data);

								if (!data.success)  startupload(data.error);
								else
								{
									if (data.entry && $this2.IsMappedFolder(origcurrfolder))  origcurrfolder.SetEntry(data.entry);

									// Set a URL, headers, and params to send with the file data to the server.
									fileinfo.url = window.location.href;

									fileinfo.headers = {
									};

									fileinfo.params = {
										path: JSON.stringify(fileinfo.folder.GetPathIDs()),
										name: fileinfo.fullPath,
										size: fileinfo.file.size,
										queuestarted: queuestarted
									};

									fileinfo.params[$this.settings.fe_requestvar] = $this.settings.fe_requestprefix + 'upload';

									DispatchEvent('xhr_params', [$this.settings.fe_requestprefix + 'upload', fileinfo.params]);

									fileinfo.fileparam = 'file';
									fileinfo.currpathparam = 'currpath';

									// Send chunked uploads.  Requires the server to know how to put chunks back together.
									if ($this.settings.fe_uploadchunksize)  fileinfo.chunksize = $this.settings.fe_uploadchunksize;

									// Automatic retry count for the file on failure.
									fileinfo.retries = 3;

									// Start the upload.
									$this.LogActivity('upload', fileinfo.fullPath || (fileinfo.file && fileinfo.file.name) || '');
									startupload(true);
								}
							},
							onerror: function(e) {
console.log(e);
								startupload('Server/network error.');
							}
						});

						xhr.Send();
					}
				},

				concurrentuploads: $this.settings.fe_concurrentuploads,

				tools: $this.settings.fe_tools,

				oninitdownload: function(startdownload, folder, ids, entries) {
					// Set a URL and params to send with the request to the server.
					var options = {};
					$this.LogActivity('download', ActivityNames(entries));

					options.url = window.location.href;

					options.params = {
						path: JSON.stringify(folder.GetPathIDs()),
						ids: JSON.stringify(ids)
					};

					options.params[$this.settings.fe_requestvar] = $this.settings.fe_requestprefix + 'download';

					DispatchEvent('xhr_params', [$this.settings.fe_requestprefix + 'download', options.params]);

					// Control the download via an in-page iframe (default) vs. form only (new tab).
					options.iframe = $this.settings.fe_downloadiframe;

					startdownload(options);
				},

				ondownloadurl: function(result, folder, ids, entry) {
					result.name = (ids.length === 1 ? (entry.type === 'file' ? entry.name : entry.name + '.zip') : 'download-' + Date.now() + '.zip');
					result.url = window.location.href;

					var params = {
						path: JSON.stringify(folder.GetPathIDs()),
						ids: JSON.stringify(ids)
					};

					params[$this.settings.fe_requestvar] = $this.settings.fe_requestprefix + 'download';

					DispatchEvent('xhr_params', [$this.settings.fe_requestprefix + 'download', params]);

					for (var x in params)
					{
						if (params.hasOwnProperty(x))  result.url += (result.url.indexOf('?') < 0 ? '?' : '&') + encodeURIComponent(x) + '=' + encodeURIComponent(params[x]);
					}
				},

				oncopy: function(copied, srcpath, srcids, destfolder) {
					var $this2 = this;

					var initparams = {
						srcpath: JSON.stringify($this2.GetPathIDs(srcpath)),
						srcids: JSON.stringify(srcids),
						destpath: JSON.stringify(destfolder.GetPathIDs())
					};

					initparams[$this.settings.fe_requestvar] = $this.settings.fe_requestprefix + 'copy_init';

					DispatchEvent('xhr_params', [$this.settings.fe_requestprefix + 'copy_init', initparams]);

					var xhr = new this.PrepareXHR({
						url: window.location.href,
						params: initparams,
						onsuccess: function(e) {
							var data = JSON.parse(e.target.responseText);
//console.log(data);

							if (!data.success)  copied(data.error);
							else if (data.overwrite > 0 && !confirm($this2.FormatStr($this2.Translate('Copying will overwrite {0} ' + (data.overwrite === 1 ? 'item' : 'items') + '.  Proceed?'), data.overwrite)))  copied('Copy cancelled.');
							else
							{
								var runxhr, origcurrfolder;

								var CancelXHR = function() {
									runxhr.Abort();
								};

								var progresstracker = $this2.CreateProgressTracker(CancelXHR);

								var options = {
									url: window.location.href,
									params: {
										copykey: data.copykey
									},
									onsuccess: function(e) {
										var data = JSON.parse(e.target.responseText);
//console.log(data);

										if (!data.success)  copied(data.error, data.finalentries);
										else
										{
											progresstracker.totalbytes = data.totalbytes;
											progresstracker.queueditems = data.queueditems;
											progresstracker.queuesizeunknown = data.queuesizeunknown;
											progresstracker.itemsdone = data.itemsdone;
											progresstracker.faileditems = data.faileditems;

											if ($this2.IsMappedFolder(origcurrfolder))  origcurrfolder.UpdateEntries(data.currentries);

											if (data.queueditems)  NextRun();
											else
											{
												$this2.RemoveProgressTracker(progresstracker, 'Copying done');
												progresstracker = null;

												$this.LogActivity('copy', (srcids && srcids.length ? srcids.length + ' item(s)' : ''));
												copied(true, data.finalentries);

												runxhr.Destroy();
												runxhr = null;
											}
										}
									},
									onerror: function(e) {
console.log(e);
										copied('Server/network error.');

										runxhr.Destroy();
										runxhr = null;
									},
									onabort: function(e) {
										progresstracker.queueditems = 0;
										progresstracker.queuesizeunknown = false;

										$this2.RemoveProgressTracker(progresstracker, 'Copying stopped');
										progresstracker = null;

										copied(false);

										runxhr.Destroy();
										runxhr = null;
									}
								};

								options.params[$this.settings.fe_requestvar] = $this.settings.fe_requestprefix + 'copy';

								DispatchEvent('xhr_params', [$this.settings.fe_requestprefix + 'copy', options.params]);

								// Performs another copy operation cycle.
								var NextRun = function() {
									if (runxhr)  runxhr.Destroy();

									origcurrfolder = $this2.GetCurrentFolder();
									options.params.currpath = JSON.stringify(origcurrfolder.GetPathIDs());

									runxhr = new $this2.PrepareXHR(options);

									runxhr.Send();
								};

								NextRun();
							}
						},
						onerror: function(e) {
console.log(e);
							copied('Server/network error.');
						}
					});

					xhr.Send();
				},

				onmove: function(moved, srcpath, srcids, destfolder) {
					var params = {
						srcpath: JSON.stringify(this.GetPathIDs(srcpath)),
						srcids: JSON.stringify(srcids),
						destpath: JSON.stringify(destfolder.GetPathIDs())
					};

					params[$this.settings.fe_requestvar] = $this.settings.fe_requestprefix + 'move';

					DispatchEvent('xhr_params', [$this.settings.fe_requestprefix + 'move', params]);

					var xhr = new this.PrepareXHR({
						url: window.location.href,
						params: params,
						onsuccess: function(e) {
							var data = JSON.parse(e.target.responseText);
//console.log(data);

							if (!data.success)  moved(data.error);
							else
							{
								$this.LogActivity('move', (srcids && srcids.length ? srcids.length + ' item(s)' : ''));
								moved(true, data.entries);
							}
						},
						onerror: function(e) {
console.log(e);
							moved('Server/network error.');
						}
					});

					xhr.Send();
				},

				ondelete: function(deleted, folder, ids, entries, recycle) {
					// Ask the user if they really want to delete/recycle the items.
					if (!$this.settings.recycling)  recycle = false;
					if (!recycle && !confirm('Are you sure you want to permanently delete ' + (entries.length == 1 ? '"' + entries[0].name + '"' : entries.length + ' items') +  '?'))  deleted('Cancelled deletion');
					else
					{
						var params = {
							path: JSON.stringify(folder.GetPathIDs()),
							ids: JSON.stringify(ids)
						};

						params[$this.settings.fe_requestvar] = $this.settings.fe_requestprefix + (recycle ? 'recycle' : 'delete');

						DispatchEvent('xhr_params', [$this.settings.fe_requestprefix + (recycle ? 'recycle' : 'delete'), params]);

						var xhr = new this.PrepareXHR({
							url: window.location.href,
							params: params,
							onsuccess: function(e) {
								var data = JSON.parse(e.target.responseText);
//console.log(data);

								if (!data.success)  deleted(data.error);
								else
								{
									$this.LogActivity(recycle ? 'recycle' : 'delete', ActivityNames(entries));
									deleted(true);
								}
							},
							onerror: function(e) {
console.log(e);
								deleted('Server/network error.');
							}
						});

						xhr.Send();
					}
				},

				onextract: function(extracted, folder, ids, entries) {
					var params = {
						path: JSON.stringify(folder.GetPathIDs()),
						ids: JSON.stringify(ids)
					};

					params[$this.settings.fe_requestvar] = $this.settings.fe_requestprefix + 'extract';

					DispatchEvent('xhr_params', [$this.settings.fe_requestprefix + 'extract', params]);

					$this.LogActivity('extract', ActivityNames(entries));

					var xhr = new this.PrepareXHR({
						url: window.location.href,
						params: params,
						onsuccess: function(e) {
							var raw = e.target.responseText;
							var data;

							try  { data = JSON.parse(raw); }
							catch (ex) {
								console.error('[FileManager] extract invalid JSON', ex, raw);
								extracted('Invalid server response (not JSON).');
								return;
							}

							if (!data.success)  extracted(data.error);
							else
							{
								$this.LogActivity('extract done', ActivityNames(entries));
								extracted(true, data.entries);
							}
						},
						onerror: function(e) {
							console.error('[FileManager] extract network error', e);
							extracted('Server/network error.');
						}
					});

					xhr.Send();
				},

				oncompress: function(compressed, folder, ids, entries) {
					var params = {
						path: JSON.stringify(folder.GetPathIDs()),
						ids: JSON.stringify(ids)
					};

					params[$this.settings.fe_requestvar] = $this.settings.fe_requestprefix + 'compress';

					DispatchEvent('xhr_params', [$this.settings.fe_requestprefix + 'compress', params]);

					$this.LogActivity('compress', ActivityNames(entries));

					var xhr = new this.PrepareXHR({
						url: window.location.href,
						params: params,
						onsuccess: function(e) {
							var raw = e.target.responseText;
							var data;

							try  { data = JSON.parse(raw); }
							catch (ex) {
								console.error('[FileManager] compress invalid JSON', ex, raw);
								compressed('Invalid server response (not JSON).');
								return;
							}

							if (!data.success)  compressed(data.error);
							else
							{
								$this.LogActivity('compress done', ActivityNames(entries));
								compressed(true, data.entries);
							}
						},
						onerror: function(e) {
							console.error('[FileManager] compress network error', e);
							compressed('Server/network error.');
						}
					});

					xhr.Send();
				},

				onchmod: function(done, folder, ids, mode, recursive) {
					var params = {
						path: JSON.stringify(folder.GetPathIDs()),
						ids: JSON.stringify(ids),
						mode: mode,
						recursive: recursive ? '1' : '0'
					};

					params[$this.settings.fe_requestvar] = $this.settings.fe_requestprefix + 'chmod';

					DispatchEvent('xhr_params', [$this.settings.fe_requestprefix + 'chmod', params]);

					var xhr = new this.PrepareXHR({
						url: window.location.href,
						params: params,
						onsuccess: function(e) {
							var raw = e.target.responseText;
							var data;

							try  { data = JSON.parse(raw); }
							catch (ex) {
								done('Invalid server response (not JSON).');
								return;
							}

							if (!data.success)  done(data.error);
							else
							{
								$this.LogActivity('chmod', mode + (recursive ? ' (recursive)' : '') + (ids && ids.length ? ' — ' + ids.length + ' item(s)' : ''));
								done(true, data.entries);
							}
						},
						onerror: function() {
							done('Server/network error.');
						}
					});

					xhr.Send();
				},

				langmap: $this.settings.langmap
			};

			$this.settings.fileexplorer = new FileExplorer(elems.fileexplorerwrapinner, feoptions);

			// Wrap XHR ASAP so HTML login/install responses never hit JSON.parse.
			(function() {
				var fe = $this.settings.fileexplorer;
				if (!fe || typeof fe.PrepareXHR !== 'function')  return;
				if (fe.PrepareXHR.__fmSessionWrapped)  return;

				var basePrepareXHR = fe.PrepareXHR;
				var WrappedPrepareXHR = function(options) {
					if (!(this instanceof WrappedPrepareXHR))  return new WrappedPrepareXHR(options);

					var opts = Object.assign({}, options || {});
					var origSuccess = opts.onsuccess || opts.onload;
					var origError = opts.onerror;

					opts.onsuccess = function(e) {
						var raw = (e && e.target) ? e.target.responseText : '';
						if (typeof $this.CheckSessionResponse === 'function' && $this.CheckSessionResponse(raw))
						{
							if (origError)  origError.call(this, e);
							return;
						}
						if (origSuccess)  origSuccess.call(this, e);
					};
					delete opts.onload;

					return new basePrepareXHR(opts);
				};
				WrappedPrepareXHR.__fmSessionWrapped = true;
				fe.PrepareXHR = WrappedPrepareXHR;
				$this.PrepareXHR = WrappedPrepareXHR;
			})();

			// Click File Explorer status bar text to open the same debug console.
			try
			{
				var feelems = $this.settings.fileexplorer.GetElements();
				if (feelems && feelems.statusbartextwrap)
				{
					feelems.statusbartextwrap.title = $this.Translate('Click to open debug console');
					feelems.statusbartextwrap.style.cursor = 'pointer';
					feelems.statusbartextwrap.addEventListener('click', ToggleDebugConsole);
				}
			}
			catch (ex)
			{
				console.warn('[FileManager] Unable to attach debug console to FileExplorer status bar', ex);
			}
		}

		$this.ShowFileExplorer = function() {
			if ($this.settings.mysqlmanager && $this.settings.mysqlmanager.IsVisible())  $this.settings.mysqlmanager.Hide();

			elems.fileexplorerwrap.style.left = '0px';
			elems.fileexplorerwrap.style.top = ($this.settings.tabbed ? (elems.openfileswrap.offsetTop + elems.openfileswrap.offsetHeight - 1) : 0) + 'px';
			elems.fileexplorerwrap.classList.remove('fm_file_editor_hidden');

			if ($this.settings.tabbed)  elems.fileexplorerwrap.classList.remove('fm_file_editor_fullscreen');
			else  elems.fileexplorerwrap.classList.add('fm_file_editor_fullscreen');

			$this.settings.fileexplorer.Focus(true, true);
			$this.settings.fileexplorer.RefreshFolders();
		};

		$this.HideFileExplorer = function() {
			if (!$this.settings.tabbed)  return;

			if ($this.settings.fileexplorer.HasFocus())  elems.buttonfileexplorerwrap.focus();

			elems.fileexplorerwrap.classList.add('fm_file_editor_hidden');
		};

		$this.ShowMySQLManager = function() {
			$this.HideFileExplorer();
			if (!$this.settings.mysqlmanager && window.MySQLManager)
			{
				$this.settings.mysqlmanager = new window.MySQLManager($this, {
					onxhrparams: $this.settings.onxhrparams,
					onreposition: function() {
						$this.PositionMySQLManager();
					}
				});
			}
			$this.PositionMySQLManager();
			if ($this.settings.mysqlmanager)  $this.settings.mysqlmanager.Show();
		};

		$this.PositionMySQLManager = function() {
			if (!$this.settings.mysqlmanager)  return;

			// Fill workspace from the left edge (like a full work pane), under the tab bar.
			var left = 0;
			var top = ($this.settings.tabbed ? (elems.openfileswrap.offsetTop + elems.openfileswrap.offsetHeight - 1) : 0);
			var fullscreen = !$this.settings.tabbed;

			$this.settings.mysqlmanager.Position(left, top, fullscreen);
		};

		$this.HideMySQLManager = function() {
			if ($this.settings.mysqlmanager)  $this.settings.mysqlmanager.Hide();
		};

		$this.ShowFileExplorer();

		var FileExplorerButtonHandler = function(e) {
			if (!e.isTrusted)  return;

			// Stop the button from stealing focus.
			e.preventDefault();

			// Block the popup if the button was clicked to close the popup.
			if (e.type === 'mousedown')
			{
				var blockpopup = elems.buttonfileexplorerwrap.classList.contains('fm_file_editor_block_popup');

				if (blockpopup)  elems.buttonfileexplorerwrap.classList.remove('fm_file_editor_block_popup');

				if (document.activeElement === elems.buttonfileexplorerwrap)
				{
					if (blockpopup)  return;
				}
			}

			$this.ShowFileExplorer();
		};

		elems.buttonfileexplorerwrap.addEventListener('mousedown', FileExplorerButtonHandler);

		var FileExplorerButtonKeyHandler = function(e) {
			if (!e.isTrusted)  return;

			if (e.keyCode == 13 || e.keyCode == 32)  FileExplorerButtonHandler(e);
		};

		elems.buttonfileexplorerwrap.addEventListener('keydown', FileExplorerButtonKeyHandler);

		var FileExplorerCloseKeyHandler = function(e) {
			if (!e.isTrusted)  return;

			if (e.keyCode == 27)  $this.HideFileExplorer();
		};

		elems.fileexplorerwrap.addEventListener('keydown', FileExplorerCloseKeyHandler);

		var MySQLButtonHandler = function(e) {
			if (!e.isTrusted)  return;

			e.preventDefault();

			if (e.type === 'mousedown')
			{
				var blockpopup = elems.buttonmysqlwrap.classList.contains('fm_file_editor_block_popup');

				if (blockpopup)  elems.buttonmysqlwrap.classList.remove('fm_file_editor_block_popup');

				if (document.activeElement === elems.buttonmysqlwrap || ($this.settings.mysqlmanager && $this.settings.mysqlmanager.IsVisible()))
				{
					if (blockpopup)
					{
						$this.HideMySQLManager();
						return;
					}

					if ($this.settings.mysqlmanager && $this.settings.mysqlmanager.IsVisible())
					{
						// Clicking the button while open: hide (same pattern as closing FE via blur).
						elems.buttonmysqlwrap.classList.add('fm_file_editor_block_popup');
						$this.HideMySQLManager();
						return;
					}
				}
			}

			$this.ShowMySQLManager();
		};

		elems.buttonmysqlwrap.addEventListener('mousedown', MySQLButtonHandler);
		elems.buttonmysqlwrap.addEventListener('keydown', function(e) {
			if (!e.isTrusted)  return;
			if (e.keyCode == 13 || e.keyCode == 32)  MySQLButtonHandler(e);
		});

		var popupmenu = null;
		$this.ShowOptionsMenu = function(e) {
			if (e)
			{
				if (!e.isTrusted)  return;

				// Stop the button from stealing focus.
				e.preventDefault();
			}

			// Cancel any active popup menu.
			if (popupmenu)  popupmenu.Cancel();

			// Block the popup if the button was clicked to close the menu.
			if (e && e.type === 'mousedown')
			{
				elems.buttonmenuwrap.focus();

				var blockpopup = elems.buttonmenuwrap.classList.contains('fm_file_editor_block_popup');

				if (blockpopup)
				{
					elems.buttonmenuwrap.classList.remove('fm_file_editor_block_popup');

					return;
				}
			}

			var tabview = $this.GetActiveTabView();
			if (tabview === false)  return;

			// Setup popup menu options.
			var options = {
				items: [],

				onposition: function(popupelem) {
					popupelem.style.left = elems.buttonmenuwrap.offsetLeft + 'px';
					popupelem.style.top = (elems.openfileswrap.offsetTop + elems.openfileswrap.offsetHeight) + 'px';
				},

				onselected: function(id, item, lastelem, etype) {
					popupmenu = null;
					if (lastelem)  lastelem.focus();
					this.Destroy();

					if ($this.GetActiveTabView() === tabview)  tabview.SelectedMenuItem.call($this, id, item, lastelem, etype);
				},

				oncancel: function(lastelem, etype) {
					popupmenu = null;

					if (lastelem)  lastelem.focus();

					if (etype === 'mouse' && (lastelem === elems.buttonmenuwrap || lastelem === elems.buttonmenuicon))  elems.buttonmenuwrap.classList.add('fm_file_editor_block_popup');

					this.Destroy();
				}
			};

			// Set up menu items.
			options.items = tabview.GetOptionsMenuItems.call($this);

			popupmenu = new window.FileExplorer.PopupMenu(elems.mainwrap, options);
		};

		elems.buttonmenuwrap.addEventListener('mousedown', $this.ShowOptionsMenu);

		var OptionsMenuKeyHander = function(e) {
			if (!e.isTrusted)  return;

			if (e.keyCode == 13 || e.keyCode == 32)  $this.ShowOptionsMenu(e);
		};

		elems.buttonmenuwrap.addEventListener('keydown', OptionsMenuKeyHander);

		var CloseModalDialog = function(node) {
			if (node && node.parentNode)  node.parentNode.removeChild(node);
		};

		var ShowModalDialog = function(title, bodyhtml, onready, extraOverlayClass, options) {
			options = options || {};
			var overlay = CreateNode('div', ['fm_modal_overlay'].concat(extraOverlayClass ? [extraOverlayClass] : []));
			var modal = CreateNode('div', ['fm_modal']);
			var header = CreateNode('div', ['fm_modal_header']);
			var titleel = CreateNode('div', ['fm_modal_title']);
			titleel.appendChild(document.createTextNode(title));
			var closebtn = CreateNode('button', ['fm_modal_close'], { type: 'button', title: $this.Translate('Close') });
			closebtn.appendChild(document.createTextNode('\u00D7'));
			header.appendChild(titleel);
			header.appendChild(closebtn);
			var body = CreateNode('div', ['fm_modal_body']);
			body.innerHTML = bodyhtml;
			modal.appendChild(header);
			modal.appendChild(body);
			overlay.appendChild(modal);
			document.body.appendChild(overlay);

			var closefn = function() { CloseModalDialog(overlay); };
			if (options.hideClose)  closebtn.style.display = 'none';
			else  closebtn.addEventListener('click', closefn);

			if (!options.persist)
			{
				overlay.addEventListener('click', function(e) {
					if (e.target === overlay)  closefn();
				});
			}

			if (onready)  onready(overlay, modal, body, closefn);

			return { overlay: overlay, modal: modal, body: body, close: closefn };
		};

		showModalDialogFn = ShowModalDialog;

		var SendAccountAction = function(action, fields, done) {
			var params = Object.assign({}, fields || {});
			params.action = action;

			DispatchEvent('xhr_params', [action, params]);

			var xhr = new $this.PrepareXHR({
				url: window.location.href,
				params: params,
				onsuccess: function(e) {
					var data;
					try  { data = JSON.parse(e.target.responseText); }
					catch (ex) {
						done({ success: false, error: 'Invalid server response.' });
						return;
					}
					done(data);
				},
				onerror: function() {
					done({ success: false, error: 'Server/network error.' });
				}
			});

			xhr.Send();
		};

		$this.ShowSettingsDialog = function() {
			var s = Object.assign({
				projects_path: '',
				projects_url: '',
				dot_folders: false,
				file_exts_mode: 'allow',
				file_exts: '',
				allow_empty_ext: true,
				new_file_ext: '.html',
				upload_limit: '-1',
				recycling: true,
				tabbed: true,
				hide_manager: true
			}, $this.settings.settings || {});

			var html = '';
			html += '<form class="fm_settings_form">';
			html += '<label class="fm_settings_field"><span>' + EscapeHTML($this.Translate('Projects path')) + '</span><input type="text" name="projects_path" value="' + EscapeHTML(s.projects_path) + '"></label>';
			html += '<label class="fm_settings_field"><span>' + EscapeHTML($this.Translate('Projects URL')) + '</span><input type="text" name="projects_url" value="' + EscapeHTML(s.projects_url) + '"></label>';
			html += '<label class="fm_settings_field"><span>' + EscapeHTML($this.Translate('File extensions mode')) + '</span><select name="file_exts_mode">';
			html += '<option value="all"' + (s.file_exts_mode === 'all' ? ' selected' : '') + '>' + EscapeHTML($this.Translate('All extensions')) + '</option>';
			html += '<option value="allow"' + (s.file_exts_mode === 'allow' ? ' selected' : '') + '>' + EscapeHTML($this.Translate('Allow only (whitelist)')) + '</option>';
			html += '<option value="exclude"' + (s.file_exts_mode === 'exclude' ? ' selected' : '') + '>' + EscapeHTML($this.Translate('Exclude (blacklist)')) + '</option>';
			html += '</select></label>';
			html += '<label class="fm_settings_field fm_settings_exts_field"><span>' + EscapeHTML($this.Translate('File extensions list')) + '</span><textarea name="file_exts" rows="4">' + EscapeHTML(s.file_exts) + '</textarea><small>' + EscapeHTML($this.Translate('Comma-separated, e.g. .jpg, .png, .zip. Used for Allow/Exclude modes.')) + '</small></label>';
			html += '<label class="fm_settings_field"><span>' + EscapeHTML($this.Translate('New file extension')) + '</span><input type="text" name="new_file_ext" value="' + EscapeHTML(s.new_file_ext) + '"></label>';
			html += '<label class="fm_settings_field"><span>' + EscapeHTML($this.Translate('Upload limit')) + '</span><input type="text" name="upload_limit" value="' + EscapeHTML(String(s.upload_limit)) + '"><small>' + EscapeHTML($this.Translate('Use -1 for unlimited.')) + '</small></label>';
			html += '<label class="fm_settings_check"><input type="checkbox" name="dot_folders"' + (s.dot_folders ? ' checked' : '') + '> ' + EscapeHTML($this.Translate('Allow dot folders')) + '</label>';
			html += '<label class="fm_settings_check"><input type="checkbox" name="allow_empty_ext"' + (s.allow_empty_ext ? ' checked' : '') + '> ' + EscapeHTML($this.Translate('Allow empty extensions')) + '</label>';
			html += '<label class="fm_settings_check"><input type="checkbox" name="recycling"' + (s.recycling ? ' checked' : '') + '> ' + EscapeHTML($this.Translate('Enable recycling bin')) + '</label>';
			html += '<label class="fm_settings_check"><input type="checkbox" name="tabbed"' + (s.tabbed ? ' checked' : '') + '> ' + EscapeHTML($this.Translate('Tabbed editor')) + '</label>';
			html += '<label class="fm_settings_check"><input type="checkbox" name="hide_manager"' + (s.hide_manager ? ' checked' : '') + '> ' + EscapeHTML($this.Translate('Hide Cope Manager folder in File Explorer')) + '</label>';
			html += '<small>' + EscapeHTML($this.Translate('Hides the whole install folder (e.g. cope-manager / manager), not only the copecute subfolder.')) + '</small>';
			html += '<div class="fm_modal_msg"></div>';
			html += '<div class="fm_modal_actions"><button type="submit" class="fm_modal_btn_primary">' + EscapeHTML($this.Translate('Save')) + '</button><button type="button" class="fm_modal_btn_cancel">' + EscapeHTML($this.Translate('Cancel')) + '</button></div>';
			html += '</form>';

			ShowModalDialog($this.Translate('Settings'), html, function(overlay, modal, body, closefn) {
				var form = body.querySelector('form');
				var modeel = form.file_exts_mode;
				var extsfield = body.querySelector('.fm_settings_exts_field');
				var msgel = body.querySelector('.fm_modal_msg');

				var SyncExtsVisibility = function() {
					if (modeel.value === 'all')  extsfield.classList.add('fm_file_editor_hidden');
					else  extsfield.classList.remove('fm_file_editor_hidden');
				};
				SyncExtsVisibility();
				modeel.addEventListener('change', SyncExtsVisibility);

				body.querySelector('.fm_modal_btn_cancel').addEventListener('click', closefn);

				form.addEventListener('submit', function(e) {
					e.preventDefault();
					msgel.textContent = $this.Translate('Saving...');
					msgel.className = 'fm_modal_msg fm_modal_msg_info';

					SendAccountAction('save_settings', {
						projects_path: form.projects_path.value,
						projects_url: form.projects_url.value,
						file_exts_mode: form.file_exts_mode.value,
						file_exts: form.file_exts.value,
						new_file_ext: form.new_file_ext.value,
						upload_limit: form.upload_limit.value,
						dot_folders: form.dot_folders.checked ? '1' : '0',
						allow_empty_ext: form.allow_empty_ext.checked ? '1' : '0',
						recycling: form.recycling.checked ? '1' : '0',
						tabbed: form.tabbed.checked ? '1' : '0',
						hide_manager: form.hide_manager.checked ? '1' : '0'
					}, function(data) {
						if (!data.success)
						{
							msgel.textContent = data.error || $this.Translate('Save failed.');
							msgel.className = 'fm_modal_msg fm_modal_msg_error';
							return;
						}

						$this.settings.settings = data.settings;
						$this.settings.recycling = !!data.settings.recycling;
						$this.settings.tabbed = !!data.settings.tabbed;
						$this.LogActivity('settings', 'saved');
						msgel.textContent = $this.Translate('Saved. Reload the page for all changes to take effect.');
						msgel.className = 'fm_modal_msg fm_modal_msg_ok';

						setTimeout(function() {
							closefn();
							window.location.reload();
						}, 900);
					});
				});
			});
		};

		$this.ShowChangePasswordDialog = function() {
			var html = '';
			html += '<form class="fm_settings_form">';
			if ($this.settings.has_password)
			{
				html += '<label class="fm_settings_field"><span>' + EscapeHTML($this.Translate('Current password')) + '</span><input type="password" name="current_password" autocomplete="current-password"></label>';
			}
			html += '<label class="fm_settings_field"><span>' + EscapeHTML($this.Translate('New password')) + '</span><input type="password" name="new_password" autocomplete="new-password"></label>';
			html += '<label class="fm_settings_field"><span>' + EscapeHTML($this.Translate('Confirm new password')) + '</span><input type="password" name="confirm_password" autocomplete="new-password"></label>';
			html += '<div class="fm_modal_msg"></div>';
			html += '<div class="fm_modal_actions"><button type="submit" class="fm_modal_btn_primary">' + EscapeHTML($this.Translate('Change password')) + '</button><button type="button" class="fm_modal_btn_cancel">' + EscapeHTML($this.Translate('Cancel')) + '</button></div>';
			html += '</form>';

			ShowModalDialog($this.Translate('Change password'), html, function(overlay, modal, body, closefn) {
				var form = body.querySelector('form');
				var msgel = body.querySelector('.fm_modal_msg');
				body.querySelector('.fm_modal_btn_cancel').addEventListener('click', closefn);

				form.addEventListener('submit', function(e) {
					e.preventDefault();
					msgel.textContent = $this.Translate('Saving...');
					msgel.className = 'fm_modal_msg fm_modal_msg_info';

					SendAccountAction('change_password', {
						current_password: form.current_password ? form.current_password.value : '',
						new_password: form.new_password.value,
						confirm_password: form.confirm_password.value
					}, function(data) {
						if (!data.success)
						{
							msgel.textContent = data.error || $this.Translate('Change password failed.');
							msgel.className = 'fm_modal_msg fm_modal_msg_error';
							return;
						}

						$this.settings.has_password = true;
						$this.LogActivity('password', 'changed');
						msgel.textContent = $this.Translate('Password updated.');
						msgel.className = 'fm_modal_msg fm_modal_msg_ok';
						setTimeout(closefn, 700);
					});
				});
			});
		};

		$this.Logout = function() {
			$this.LogActivity('logout');
			SendAccountAction('logout', {}, function(data) {
				ForceReauthRedirect(window.location.href.split('#')[0].split('?')[0]);
			});
		};

		$this.ShowUserMenu = function(e) {
			if (e)
			{
				if (!e.isTrusted)  return;
				e.preventDefault();
			}

			if (popupmenu)  popupmenu.Cancel();

			if (e && e.type === 'mousedown')
			{
				elems.buttonuserwrap.focus();

				var blockpopup = elems.buttonuserwrap.classList.contains('fm_file_editor_block_popup');
				if (blockpopup)
				{
					elems.buttonuserwrap.classList.remove('fm_file_editor_block_popup');
					return;
				}
			}

			var options = {
				items: [
					{ id: 'settings', name: EscapeHTML($this.Translate('Settings...')), icon: 'fe_fileexplorer_popup_item_icon_folder' },
					{ id: 'password', name: EscapeHTML($this.Translate('Change password...')), icon: 'fe_fileexplorer_popup_item_icon_rename' },
					{ id: 'debug', name: EscapeHTML($this.Translate('Debug console')), icon: 'fe_fileexplorer_popup_item_icon_refresh' },
					'split',
					{ id: 'logout', name: EscapeHTML($this.Translate('Log out')), icon: 'fe_fileexplorer_popup_item_icon_delete' }
				],

				onposition: function(popupelem) {
					var left = elems.mainwrap.clientWidth - popupelem.offsetWidth - 8;
					if (left < 4)  left = 4;
					popupelem.style.left = left + 'px';
					popupelem.style.top = (elems.openfileswrap.offsetTop + elems.openfileswrap.offsetHeight) + 'px';
				},

				onselected: function(id, item, lastelem, etype) {
					popupmenu = null;
					if (lastelem)  lastelem.focus();
					this.Destroy();

					if (id === 'settings')  $this.ShowSettingsDialog();
					else if (id === 'password')  $this.ShowChangePasswordDialog();
					else if (id === 'debug')  OpenDebugConsole();
					else if (id === 'logout')  $this.Logout();
				},

				oncancel: function(lastelem, etype) {
					popupmenu = null;
					if (lastelem)  lastelem.focus();
					if (etype === 'mouse' && (lastelem === elems.buttonuserwrap || lastelem === elems.buttonusericon))  elems.buttonuserwrap.classList.add('fm_file_editor_block_popup');
					this.Destroy();
				}
			};

			popupmenu = new window.FileExplorer.PopupMenu(elems.mainwrap, options);
		};

		elems.buttonuserwrap.addEventListener('mousedown', $this.ShowUserMenu);

		var UserMenuKeyHandler = function(e) {
			if (!e.isTrusted)  return;
			if (e.keyCode == 13 || e.keyCode == 32)  $this.ShowUserMenu(e);
		};

		elems.buttonuserwrap.addEventListener('keydown', UserMenuKeyHandler);

		var beforecopyelem;
		var ClipboardCopyHandler = function(e) {
			if (!e.isTrusted)  return;

			e.preventDefault();

			e.clipboardData.dropEffect = 'copy';
			e.clipboardData.setData('text/plain', elems.clipboardoverlay.value);

			beforecopyelem.focus();

			elems.clipboardoverlay.classList.add('fm_file_editor_hidden');

			$this.SetNamedStatusBarText('message', $this.Translate('Copied to clipboard.'), $this.settings.messagetimeout);
		};

		elems.clipboardoverlay.addEventListener('copy', ClipboardCopyHandler);

		// Must be run within a user-initiated context (e.g. a click handler).
		$this.CopyToClipboard = function(data) {
			beforecopyelem = document.activeElement;

			elems.clipboardoverlay.value = data;
			elems.clipboardoverlay.classList.remove('fm_file_editor_hidden');
			elems.clipboardoverlay.focus();

			document.execCommand('copy');
		}

		var ConvertVertToHorzScroll = function(e) {
			var mult = (e.deltaMode == 1 ? scrolllineheight * 2 : (e.deltaMode == 2 ? document.documentElement.clientHeight - (2 * scrolllineheight) : 1));
			if (e.deltaY)  e.currentTarget.scrollLeft += e.deltaY * mult;

			// Only viable option is to completely prevent scrolling.  Very strange behavior occurs otherwise in all browsers.
			if (e.currentTarget.scrollWidth > e.currentTarget.clientWidth)  e.preventDefault();
		};

		elems.openfiletabsscrollwrap.addEventListener('wheel', ConvertVertToHorzScroll);

		var TabSelectHandler = function(e) {
			if (!e.isTrusted)  return;

			var elem = e.target.closest('.fm_file_editor_open_file_tab_wrap');

			if (e.target.classList.contains('fm_file_editor_open_file_tab_close'))
			{
				// Close the active tab.
				$this.CloseActiveTab();
			}
			else if (elem)
			{
				// Activate the selected tab.
				$this.ActivateTab(elem.dataset.file_key);
			}
			else if (activefile !== false)
			{
				// Focus on the active tab.
				elems.openfiletabs[openfilesmap[activefile].tabpos].focus();
			}
			else
			{
				// Focus on the open button.
				elems.buttonfileexplorerwrap.focus();
			}
		};

		elems.openfiletabsscrollwrap.addEventListener('click', TabSelectHandler);

		var TabSelectKeyHandler = function(e) {
			if (!e.isTrusted)  return;

			if (e.keyCode == 37)
			{
				// Left Arrow.  Activate previous tab.
				var node = (activefile !== false ? elems.openfiletabs[openfilesmap[activefile].tabpos] : false);

				if (node && node.previousSibling)
				{
					e.preventDefault();

					$this.ActivateTab(node.previousSibling.dataset.file_key);
				}
			}
			else if (e.keyCode == 39)
			{
				// Right Arrow.  Activate next tab.
				var node = (activefile !== false ? elems.openfiletabs[openfilesmap[activefile].tabpos] : false);

				if (node && node.nextSibling)
				{
					e.preventDefault();

					$this.ActivateTab(node.nextSibling.dataset.file_key);
				}
			}
		};

		elems.openfiletabsscrollwrap.addEventListener('keydown', TabSelectKeyHandler);

		var TabFocusScrollHandler = function(e) {
			var node = e.target;

			if (node.parentNode === elems.openfiletabswrap)
			{
				if (node.offsetLeft - 1 < elems.openfiletabsscrollwrap.scrollLeft)  elems.openfiletabsscrollwrap.scrollLeft = node.offsetLeft - 1;
				else if (node.offsetLeft + node.offsetWidth + 1 > elems.openfiletabsscrollwrap.scrollLeft + elems.openfiletabsscrollwrap.clientWidth)  elems.openfiletabsscrollwrap.scrollLeft = (node.offsetLeft + node.offsetWidth + 1) - elems.openfiletabsscrollwrap.clientWidth;
			}
		};

		elems.openfiletabsscrollwrap.addEventListener('focus', TabFocusScrollHandler, true);

		// Global keyboard handler.
		var GlobalKeyHandler = function(e) {
			if (!e.isTrusted)  return;

			if (e.ctrlKey && e.keyCode == 79)
			{
				// Ctrl + O.  Open.
				e.preventDefault();

				$this.ShowFileExplorer();
			}
			else if (e.ctrlKey && e.shiftKey && e.keyCode == 77)
			{
				// Ctrl + Shift + M.  MySQL Manager.
				e.preventDefault();

				$this.ShowMySQLManager();
			}
			else if (e.ctrlKey && e.keyCode >= 49 && e.keyCode <= 57)
			{
				// Ctrl + 1-9.  Tab view.
				e.preventDefault();

				$this.SetTabView(e.keyCode - 49);
			}
			else if (e.ctrlKey && e.keyCode == 77)
			{
				// Ctrl + M.  Menu.
				e.preventDefault();

				$this.ShowOptionsMenu(e);
			}
			else if (e.ctrlKey && e.keyCode == 81)
			{
				// Ctrl + Q.  Close tab.
				e.preventDefault();

				$this.CloseActiveTab();
			}

			// Pass key handler to the active tab view.
			var tabview = $this.GetActiveTabView();
			if (tabview !== false && tabview.hasOwnProperty('KeyHandler'))  tabview.KeyHandler.call($this, e);
		};

		window.addEventListener('keydown', GlobalKeyHandler);

		var BeforeUnloadHandler = function(e) {
			if (elems.openfiletabswrap.querySelector('.fm_file_editor_open_file_tab_edit_status_edited'))
			{
				e.preventDefault();
				e.returnValue = $this.Translate('A file has not been saved.  Are you sure you want to close the tab?');

				return e.returnValue;
			}
		};

		window.addEventListener('beforeunload', BeforeUnloadHandler, true);

		// Returns the internal elements object for use with custom editors.
		$this.GetElements = function() {
			return elems;
		};

		// Export internal functions.  Useful for creating custom editors.
		$this.EscapeHTML = EscapeHTML;
		$this.FormatStr = FormatStr;
		$this.CreateNode = CreateNode;
		$this.DebounceAttributes = DebounceAttributes;

		var basePrepareXHR = $this.settings.fileexplorer.PrepareXHR;
		if (!basePrepareXHR.__fmSessionWrapped)
		{
			var WrappedPrepareXHR = function(options) {
				if (!(this instanceof WrappedPrepareXHR))  return new WrappedPrepareXHR(options);

				var opts = Object.assign({}, options || {});
				var origSuccess = opts.onsuccess || opts.onload;
				var origError = opts.onerror;

				opts.onsuccess = function(e) {
					var raw = (e && e.target) ? e.target.responseText : '';
					if ($this.CheckSessionResponse(raw))
					{
						if (origError)  origError.call(this, e);
						return;
					}
					if (origSuccess)  origSuccess.call(this, e);
				};
				delete opts.onload;

				return new basePrepareXHR(opts);
			};
			WrappedPrepareXHR.__fmSessionWrapped = true;
			$this.PrepareXHR = WrappedPrepareXHR;
			if ($this.settings.fileexplorer)  $this.settings.fileexplorer.PrepareXHR = WrappedPrepareXHR;
		}
		else
		{
			$this.PrepareXHR = basePrepareXHR;
		}

		$this.GetScrollLineHeight = function() {
			return scrolllineheight;
		};

		// Checks whether or not Destroy was called.
		$this.IsDestroyed = function() {
			return destroyinprogress;
		};

		// Destroys the instance.
		$this.Destroy = function() {
			// Remove event listeners, timeouts, and intervals.  There are quite a few.
			destroyinprogress = true;

			// Close all tabs to trigger saves and then destroy all tab views.
			for (var x in openfilesmap)
			{
				if (openfilesmap.hasOwnProperty(x))
				{
					$this.ActivateTab(x);
					$this.CloseActiveTab();

					var data = openfilesmap[x];
					for (var x2 = 0; x2 < data.tabviews.length; x2++)
					{
						var tabname = data.tabviews[x2];
						var tabview = data.tabviewmap[tabname];

						tabview.Destroy.call($this);
					}

					data.activeview = false;
				}
			}

			// Notify anything that is listening for the destroy event.
			DispatchEvent('destroy');

			// Reset a number of instance globals.
			triggers = {};
			openfilesmap = {};
			activefile = false;

			// Destroy the global FileExplorer instance.
			$this.settings.fileexplorer.Destroy();
			$this.settings.fileexplorer = null;

			if ($this.settings.mysqlmanager)
			{
				$this.settings.mysqlmanager.Destroy();
				$this.settings.mysqlmanager = null;
			}

			// Remove event listeners.
			elems.buttonfileexplorerwrap.removeEventListener('mousedown', FileExplorerButtonHandler);
			elems.buttonfileexplorerwrap.removeEventListener('keydown', FileExplorerButtonKeyHandler);
			elems.fileexplorerwrap.removeEventListener('keydown', FileExplorerCloseKeyHandler);
			elems.buttonmenuwrap.removeEventListener('mousedown', $this.ShowOptionsMenu);
			elems.buttonmenuwrap.removeEventListener('keydown', OptionsMenuKeyHander);
			elems.buttonuserwrap.removeEventListener('mousedown', $this.ShowUserMenu);
			elems.buttonuserwrap.removeEventListener('keydown', UserMenuKeyHandler);
			elems.clipboardoverlay.removeEventListener('copy', ClipboardCopyHandler);
			elems.openfiletabsscrollwrap.removeEventListener('wheel', ConvertVertToHorzScroll);
			elems.openfiletabsscrollwrap.removeEventListener('click', TabSelectHandler);
			elems.openfiletabsscrollwrap.removeEventListener('keydown', TabSelectKeyHandler);
			elems.openfiletabsscrollwrap.removeEventListener('focus', TabFocusScrollHandler, true);
			elems.statusbartextwrap.removeEventListener('click', ToggleDebugConsole);
			document.removeEventListener('mousedown', DebugConsoleOutsideClick, true);
			window.removeEventListener('keydown', GlobalKeyHandler);
			window.removeEventListener('beforeunload', BeforeUnloadHandler, true);

			if (debugconsolenode && debugconsolenode.parentNode)  debugconsolenode.parentNode.removeChild(debugconsolenode);
			debugconsolenode = null;
			debugconsolebody = null;
			console.log = origconsole.log;
			console.warn = origconsole.warn;
			console.error = origconsole.error;

			// Remove DOM elements.
			for (var node in elems)
			{
				if (Array.isArray(elems[node]))
				{
					for (var x = 0; x < elems[node].length; x++)
					{
						if (elems[node][x].parentNode)  elems[node][x].parentNode.removeChild(elems[node][x]);
					}
				}
				else if (elems[node].parentNode)
				{
					elems[node].parentNode.removeChild(elems[node]);
				}
			}

			// Remaining cleanup.
			elems = null;

			$this.settings = Object.assign({}, defaults);

			$this = null;
			parentelem = null;
			options = null;
		};
	};


	// File extention to handler mapping.
	var fileexthandlermap = {};

	window.FileManager.RegisterFileExtensionHandler = function(ext, handler, opts) {
		if (typeof(handler) === 'string')  fileexthandlermap[ext] = handler;
		else
		{
			if (!handler.config)  return;

			if (!fileexthandlermap[ext])  fileexthandlermap[ext] = [];

			fileexthandlermap[ext].push({ handler: handler, opts: opts });
		}
	};


	// View-only handler for native types.  Ideally replace with an image editor for the images.
	window.FileManager.BrowserFileViewerHandler = function(parentelem, fm, handleropts, fileinfo) {
		if (!(this instanceof window.FileManager.BrowserFileViewerHandler))  return new window.FileManager.BrowserFileViewerHandler(parentelem, fm, handleropts, fileinfo);

		var lastreloadfor = false;
		var $this = this;

		var viewwrap = CreateNode('div', ['fm_file_editor_editor_wrap', 'fm_file_editor_hidden']);
		var iframenode;

		parentelem.appendChild(viewwrap);

		var Reload = function() {
			lastreloadfor = fileinfo.lastmodified;

			if (fm.IsDestroyed())  return;

			if (iframenode)  viewwrap.removeChild(iframenode);

			iframenode = CreateNode('iframe', ['fm_file_editor_browser'], { src: fileinfo.url + (fileinfo.url.indexOf('?') > -1 ? '&' : '?') + '_ts=' + lastreloadfor, width: '100%', height: '100%', frameBorder: '0' });

			viewwrap.appendChild(iframenode);
		};

		// Public functions.
		$this.Activate = function() {
			viewwrap.classList.remove('fm_file_editor_hidden');

			if (lastreloadfor !== fileinfo.lastmodified)  Reload();
		};

		$this.GetConfig = function() {
			return window.FileManager.BrowserFileViewerHandler.config;
		};

		$this.SelectedMenuItem = function(id, item, lastelem, etype) {
			if (id === 'reload')  Reload();

			if (id === 'clipboard_url')  fm.CopyToClipboard(fileinfo.url);
			if (id === 'clipboard_embed')  fm.CopyToClipboard('<iframe src="' + fm.EscapeHTML(fileinfo.url) + '" width="100%" height="600" frameborder="0"></iframe>');
		};

		$this.GetOptionsMenuItems = function() {
			var items = [
				{ id: 'reload', name: fm.Translate('Reload') },
				{ id: 'clipboard_url', name: fm.Translate('Copy URL'), enabled: (fileinfo.url !== false) },
				{ id: 'clipboard_embed', name: fm.Translate('Copy Embed'), enabled: (fileinfo.url !== false) }
			];

			return items;
		};

		$this.Deactivate = function() {
			viewwrap.classList.add('fm_file_editor_hidden');
		};

		$this.Close = function(closeready) {
			closeready(true);
		};

		$this.Destroy = function() {
			if (iframenode)
			{
				viewwrap.removeChild(iframenode);

				iframenode = null;
			}

			parentelem.removeChild(viewwrap);

			viewwrap = null;

			$this = null;
		};
	};

	window.FileManager.BrowserFileViewerHandler.config = {
		name: 'browser_preview',
		tabview_title: 'Preview',
		tabview_icon: 'fm_file_editor_preview_icon',
		browseronly: true,
		textonly: false
	};

	window.FileManager.RegisterFileExtensionHandler('jpg', window.FileManager.BrowserFileViewerHandler, {});
	window.FileManager.RegisterFileExtensionHandler('jpeg', 'jpg');
	window.FileManager.RegisterFileExtensionHandler('png', window.FileManager.BrowserFileViewerHandler, {});
	window.FileManager.RegisterFileExtensionHandler('gif', window.FileManager.BrowserFileViewerHandler, {});
	window.FileManager.RegisterFileExtensionHandler('svg', window.FileManager.BrowserFileViewerHandler, {});
	window.FileManager.RegisterFileExtensionHandler('mp3', window.FileManager.BrowserFileViewerHandler, {});
	window.FileManager.RegisterFileExtensionHandler('mp4', window.FileManager.BrowserFileViewerHandler, {});

	window.FileManager.RegisterFileExtensionHandler('image/jpeg', 'jpg');
	window.FileManager.RegisterFileExtensionHandler('image/png', 'png');
	window.FileManager.RegisterFileExtensionHandler('image/gif', 'gif');
	window.FileManager.RegisterFileExtensionHandler('image/svg+xml', 'svg');
	window.FileManager.RegisterFileExtensionHandler('audio/mp3', 'mp3');
	window.FileManager.RegisterFileExtensionHandler('video/mp4', 'mp4');


	// ACE handler.
	if (window.hasOwnProperty('ace'))
	{
		var acedefaults = {
			theme: 'ace/theme/chrome',
			fontSize: 14,
			fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace",
			tabSize: 4,
			useSoftTabs: false,
			navigateWithinSoftTabs: false,
			showGutter: true,
			showLineNumbers: true,
			highlightGutterLine: true,
			showFoldWidgets: false,
			foldStyle: 'markbegin',
			fadeFoldWidgets: false,
			behavioursEnabled: false,
			wrapBehavioursEnabled: false,
			enableAutoIndent: false,
			displayIndentGuides: false,
			showInvisibles: false,
			wrap: 'off',
			indentedSoftWrap: true,
			keyboardHandler: 'ace/keyboard/vscode',
			cursorStyle: 'ace',
			useWorker: true,
			newLineMode: 'auto',
			highlightActiveLine: true,
			highlightSelectedWord: true,
			selectionStyle: 'line',
			mergeUndoDeltas: false,
			showPrintMargin: false,
			printMarginColumn: 80,
			scrollSpeed: 2,
			scrollPastEnd: 0.5,
			animatedScroll: false,
			vScrollBarAlwaysVisible: false,
			hScrollBarAlwaysVisible: false,
			useTextareaForIME: true,
			dragEnabled: true,
			tooltipFollowsMouse: true
		};

		var ACE_SETTINGS_VERSION = 3;

		window.FileManager.ACEFileEditorHandler = function(parentelem, fm, handleropts, fileinfo) {
			if (!(this instanceof window.FileManager.ACEFileEditorHandler))  return new window.FileManager.ACEFileEditorHandler(parentelem, fm, handleropts, fileinfo);

			var aceviewwrap, aceeditor, acesession, lastreloadfor = false, editedtimeout, saveinprogress = false, saveclosereadycallback, currdlg;
			var $this = this;

			// Initialize the editor only one time.
			if (!fm.settings.aceeditor)
			{
				fm.settings.aceviewwrap = CreateNode('div', ['fm_file_editor_editor_wrap', 'fm_file_editor_hidden']);

				parentelem.appendChild(fm.settings.aceviewwrap);

				fm.settings.aceeditor = window.ace.edit(fm.settings.aceviewwrap);
				fm.settings.aceeditorrefs = 0;

				fm.settings.aceeditor.commands.removeCommand('find');

				// Scroll editor into view when selecting.
				fm.settings.aceeditor.setOption('autoScrollEditorIntoView', true);

				acedefaults.useTextareaForIME = fm.settings.aceeditor.getOption('useTextareaForIME');
			}

			aceviewwrap = fm.settings.aceviewwrap;
			aceeditor = fm.settings.aceeditor;
			fm.settings.aceeditorrefs++;

			// Initialize an ACE session for the editor.
			acesession = ace.createEditSession('', 'ace/mode/' + handleropts.mode);
			aceeditor.setSession(acesession);

			var settings = localStorage.getItem('ace_settings');
			var saved = (settings ? JSON.parse(settings) : {});

			// Bump defaults for theme/gutter/line numbers/vscode keybindings once.
			if (!saved || saved._v !== ACE_SETTINGS_VERSION)
			{
				saved = Object.assign({}, saved, {
					theme: acedefaults.theme,
					showGutter: acedefaults.showGutter,
					showLineNumbers: acedefaults.showLineNumbers,
					keyboardHandler: acedefaults.keyboardHandler,
					_v: ACE_SETTINGS_VERSION
				});
				try  { localStorage.setItem('ace_settings', JSON.stringify(Object.assign({}, acedefaults, saved))); }  catch (ex)  {}
			}

			settings = Object.assign({}, acedefaults, saved);
			delete settings._v;

			aceeditor.setOptions(settings);

			// Always apply syntax mode from the file extension handler (never from stale settings).
			acesession.setMode('ace/mode/' + handleropts.mode);

			var CursorMovedHandler = function(e) {
				var posinfo = aceeditor.selection.getCursor();

				fm.SetNamedStatusBarText2('ace_position', fm.FormatStr(fm.Translate('Ln {0}, Ch {1}'), posinfo.row + 1, posinfo.column + 1), null, '12em');
				fm.SetNamedStatusBarText2('ace_lines', acesession.getLength(), null, '6em');
			};

			acesession.selection.on('changeCursor', CursorMovedHandler);

			// Start a find operation.
			var StartFind = function() {
				if (currdlg)  return;

				var lastsearchopts = localStorage.getItem('ace_last_search');

				var defaultsearchopts = {
					search: '',

					wholeWord: false,
					caseSensitive: false,
					regExp: false
				};

				lastsearchopts = Object.assign({}, defaultsearchopts, (lastsearchopts ? JSON.parse(lastsearchopts) : {}));

				var currtext = aceeditor.getSelectedText();

				if (currtext !== '')  lastsearchopts.search = currtext;

				var options = {
					title: 'Find',

					content: {
						fields: [
							{
								title: 'Search For',
								width: '37em',
								type: 'text',
								name: 'search',
								default: lastsearchopts.search,
								focus: true
							},
							{
								width: '37em',
								type: 'checkbox',
								name: 'wholeWord',
								value: 'Yes',
								default: settings.wholeWord,
								display: 'Match whole word only'
							},
							{
								width: '37em',
								type: 'checkbox',
								name: 'caseSensitive',
								value: 'Yes',
								default: settings.caseSensitive,
								display: 'Match case (case-sensitive)'
							},
							{
								width: '37em',
								type: 'checkbox',
								name: 'regExp',
								value: 'Yes',
								default: settings.regExp,
								display: 'Match regular expression (regex)'
							},
						],
						submit: ['Find Next', 'Cancel'],
						submitname: 'button'
					},

					onsubmit: function(formvars, formnode, e) {
						if (formvars.button === FlexForms.Translate('Find Next'))
						{
							// Apply and save the settings.
							var lastsearchopts = {
								search: formvars.search,

								wholeWord: (formvars.wholeWord === 'Yes'),
								caseSensitive: (formvars.caseSensitive === 'Yes'),
								regExp: (formvars.regExp === 'Yes'),
							};

							aceeditor.find(lastsearchopts.search, lastsearchopts);

							localStorage.setItem('ace_last_search', JSON.stringify(lastsearchopts));
						}

						this.Destroy();

						currdlg = null;
					},

					onclose: function() {
						this.Destroy();

						currdlg = null;
					}
				};

				currdlg = FlexForms.Dialog(document.body, options);
			};

			// Send just what has changed to the server.
			var SaveDiff = function() {
				if (!editedtimeout)  return;

				clearTimeout(editedtimeout);

				editedtimeout = null;

				// Do not send a diff if the file changed elsewhere in File Manager as it is probably reloading.
				if (lastreloadfor !== fileinfo.lastmodified)  return;

				var newdata = EncodeUTF8(acesession.getValue());

				for (var x = 0; x < fileinfo.lastdata.length && x < newdata.length && fileinfo.lastdata[x] === newdata[x]; x++);

				var startpos = x;

				for (var x = fileinfo.lastdata.length, x2 = newdata.length; x && x2 && x > startpos && x2 > startpos && fileinfo.lastdata[x - 1] === newdata[x2 - 1]; x--, x2--);

				var endpos = x;
				var diffdata = newdata.substring(startpos, x2);

				var params = fm.InitSaveFileParams();

				params.path = fileinfo.path;
				params.id = fileinfo.id;
				params.hash = fileinfo.lasthash;
				params.start = startpos;
				params.end = endpos;
				params.data = btoa(diffdata);

				saveinprogress = true;
				aceeditor.setReadOnly(true);

				var xhr;
				var xhroptions = {
					url: window.location.href,
					params: params,
					onsuccess: function(e) {
						var data = JSON.parse(e.target.responseText);
//console.log(data);

						if (fm.IsDestroyed())  return;

						if (data.success)
						{
							// Save was successful.  Clean up the UI.
							$this.LogActivity('save', fileinfo.name || fileinfo.id || '');
							fileinfo.lasthash = data.hash;
							fileinfo.lastdata = newdata;
							fileinfo.stat = data.stat;
							fileinfo.lastmodified = Date.now();
							lastreloadfor = fileinfo.lastmodified;

							saveinprogress = false;
							aceeditor.setReadOnly(false);

							if (saveclosereadycallback)
							{
								saveclosereadycallback(true);

								saveclosereadycallback = null;
							}
							else
							{
								fm.SetTabEdited(fileinfo.file_key, false);

								acesession.getUndoManager().markClean();

								// Trigger a refresh of the active tab view if it is not the current view.
								if (fileinfo.file_key === fm.GetActiveFileKey() && fileinfo.tabviewmap[fileinfo.tabviews[fileinfo.activeview]] !== $this)
								{
									fm.SetTabView(fileinfo.activeview);
								}
							}
						}
						else if (data.errorcode === 'file_changed' && confirm(fm.FormatStr(fm.Translate('The file data on the server for "{0}" was changed by someone else.  Overwrite?'), fileinfo.name)))
						{
							// Diff save was not successful.  Attempt a full save.
							var params = fm.InitSaveFileParams();

							params.path = fileinfo.path;
							params.id = fileinfo.id;
							params.data = btoa(newdata);

							xhroptions.params = params;

							xhr = new fm.PrepareXHR(xhroptions);
							xhr.Send();
						}
						else
						{
							// Unhandled error condition.  Clean up the UI.
							saveinprogress = false;
							aceeditor.setReadOnly(false);

							if (saveclosereadycallback)
							{
								saveclosereadycallback(true);

								saveclosereadycallback = null;
							}
							else
							{
								editedtimeout = setTimeout(SaveDiff, 30000);
							}

							fm.SetNamedStatusBarText('message', fm.FormatStr(fm.Translate('Failed to save file data for "{0}".  {1}'), fileinfo.name, data.error), fm.settings.messagetimeout);
						}
					},
					onerror: function(e) {
						fm.SetNamedStatusBarText('message', fm.FormatStr(fm.Translate('Failed to save file data for "{0}".  Server/network error.'), fileinfo.name), fm.settings.messagetimeout);
					}
				};

				xhr = new fm.PrepareXHR(xhroptions);
				xhr.Send();
			};

			var BrowserBlurHandler = function(e) {
				if (e.target === window || e.target === document)  SaveDiff();
			};

			var ChangeHandler = function(delta) {
				// The ACE session undo manager does not update until after the change operation completes.
				setTimeout(function() {
					if (acesession.getUndoManager().isClean())
					{
						fm.SetTabEdited(fileinfo.file_key, false);

						clearTimeout(editedtimeout);

						editedtimeout = null;
					}
					else if (!editedtimeout)
					{
						fm.SetTabEdited(fileinfo.file_key, true);

						editedtimeout = setTimeout(SaveDiff, 30000);
					}
				}, 0);
			};

			acesession.on('change', ChangeHandler);

			var Reload = function() {
				lastreloadfor = fileinfo.lastmodified;

				if (fm.IsDestroyed())  return;

				var params = fm.InitLoadFileParams();

				params.path = fileinfo.path;
				params.id = fileinfo.id;

				var xhr = new fm.PrepareXHR({
					url: window.location.href,
					params: params,
					onsuccess: function(e) {
						var data = JSON.parse(e.target.responseText);
//console.log(data);

						if (fm.IsDestroyed())  return;

						if (!data.success)  fm.SetNamedStatusBarText('message', fm.FormatStr(fm.Translate('Failed to retrieve file data for "{0}".  {1}'), fileinfo.name, data.error), fm.settings.messagetimeout);
						else
						{
							fileinfo.lasthash = data.hash;
							fileinfo.lastdata = atob(data.data);
							fileinfo.stat = data.stat;

							acesession.setValue(DecodeUTF8(fileinfo.lastdata));
							acesession.getUndoManager().markClean();
						}
					},
					onerror: function(e) {
						fm.SetNamedStatusBarText('message', fm.FormatStr(fm.Translate('Failed to retrieve file data for "{0}".  Server/network error.'), fileinfo.name), fm.settings.messagetimeout);
					}
				});

				xhr.Send();
			};

			// Public functions.
			$this.Activate = function() {
				aceeditor.setSession(acesession);

				aceviewwrap.classList.remove('fm_file_editor_hidden');

				CursorMovedHandler();

				if (lastreloadfor !== fileinfo.lastmodified)  Reload();

				window.addEventListener('blur', BrowserBlurHandler, true);
			};

			$this.GetConfig = function() {
				return window.FileManager.ACEFileEditorHandler.config;
			};

			$this.SelectedMenuItem = function(id, item, lastelem, etype) {
				if (id === 'save')  SaveDiff();

				if (id === 'reload')
				{
					if (!editedtimeout || confirm(fm.FormatStr(fm.Translate('Unsaved changes in "{0}" will be lost.  Reload anyway?'), fileinfo.name)))  Reload();
				}

				if (id === 'clipboard_url')  fm.CopyToClipboard(fileinfo.url);
				if (id === 'clipboard_embed')  fm.CopyToClipboard('<iframe src="' + fm.EscapeHTML(fileinfo.url) + '" width="100%" height="600" frameborder="0"></iframe>');

				if (id === 'find')  StartFind();
				if (id === 'find_next')  aceeditor.findNext();
				if (id === 'find_prev')  aceeditor.findPrevious();

				if (id === 'settings')
				{
					var settings = localStorage.getItem('ace_settings');

					settings = Object.assign({}, acedefaults, (settings ? JSON.parse(settings) : {}));

					var options = {
						title: 'Editor Settings',

						content: {
							fields: [
								'startrow',
								{
									title: 'Theme',
									width: '18em',
									type: 'select',
									name: 'theme',
									options: fm.settings.ace_themes,
									default: settings.theme,
									desc: 'The visual theme of the editor.'
								},
								{
									title: 'Mode',
									width: '18em',
									type: 'select',
									name: 'mode',
									options: fm.settings.ace_modes,
									default: acesession.$modeId,
									desc: 'The current syntax mode.'
								},
								'startrow',
								{
									title: 'Font Size',
									width: '18em',
									type: 'text',
									name: 'fontSize',
									default: settings.fontSize.toString()
								},
								{
									title: 'Font Family',
									width: '18em',
									type: 'text',
									name: 'fontFamily',
									default: settings.fontFamily
								},
								'startrow',
								{
									title: 'Tab Size',
									width: '18em',
									type: 'text',
									name: 'tabSize',
									default: settings.tabSize.toString(),
									desc: 'Number of spaces per tab character.'
								},
								{
									width: '18em',
									type: 'custom',
									value: ''
								},
								'endrow',
								{
									title: 'Soft Tabs',
									width: '37em',
									type: 'checkbox',
									name: 'useSoftTabs',
									value: 'Yes',
									default: settings.useSoftTabs,
									display: 'Emit soft tabs (spaces) instead of actual tabs'
								},
								{
									width: '37em',
									type: 'checkbox',
									name: 'navigateWithinSoftTabs',
									value: 'Yes',
									default: settings.navigateWithinSoftTabs,
									display: 'Allow keyboard navigation within soft tabs'
								},
								{
									title: 'Gutter Region',
									width: '37em',
									type: 'checkbox',
									name: 'showGutter',
									value: 'Yes',
									default: settings.showGutter,
									display: 'Show the gutter'
								},
								{
									width: '37em',
									type: 'checkbox',
									name: 'showLineNumbers',
									value: 'Yes',
									default: settings.showLineNumbers,
									display: 'Show line numbers in the gutter'
								},
								{
									width: '37em',
									type: 'checkbox',
									name: 'highlightGutterLine',
									value: 'Yes',
									default: settings.highlightGutterLine,
									display: 'Highlight the current line in the gutter'
								},
								{
									width: '37em',
									type: 'checkbox',
									name: 'showFoldWidgets',
									value: 'Yes',
									default: settings.showFoldWidgets,
									display: 'Enable code folding'
								},
								{
									width: '37em',
									type: 'select',
									name: 'foldStyle',
									options: [
										{ key: 'markbegin', display: 'Mark beginning of code folds' },
										{ key: 'markbeginend', display: 'Mark beginning and end of code folds' },
										{ key: 'manual', display: 'Manual code folds' }
									],
									default: settings.foldStyle
								},
								{
									width: '37em',
									type: 'checkbox',
									name: 'fadeFoldWidgets',
									value: 'Yes',
									default: settings.fadeFoldWidgets,
									display: 'Fade out code folding widgets'
								},
								{
									title: 'Automatic Closing Behaviors',
									width: '37em',
									type: 'checkbox',
									name: 'behavioursEnabled',
									value: 'Yes',
									default: settings.behavioursEnabled,
									display: 'Auto-insert closing parenthesis, brackets, braces but not quotes'
								},
								{
									width: '37em',
									type: 'checkbox',
									name: 'wrapBehavioursEnabled',
									value: 'Yes',
									default: settings.wrapBehavioursEnabled,
									display: 'Auto-insert closing quote marks as well'
								},
								{
									title: 'Indentation',
									width: '37em',
									type: 'checkbox',
									name: 'enableAutoIndent',
									value: 'Yes',
									default: settings.enableAutoIndent,
									display: 'Auto-indent upon pressing Enter/Return'
								},
								{
									width: '37em',
									type: 'checkbox',
									name: 'displayIndentGuides',
									value: 'Yes',
									default: settings.displayIndentGuides,
									display: 'Show vertical bar indent guides'
								},
								'startrow',
								{
									title: 'Show Invisibles',
									width: '11em',
									type: 'checkbox',
									name: 'showInvisibles_tabs',
									value: 'Yes',
									default: (settings.showInvisibles === true || (typeof(settings.showInvisibles) === 'string' && settings.showInvisibles.indexOf('tab') > -1) ? true : false),
									display: 'Tabs'
								},
								{
									htmltitle: '&nbsp;',
									width: '11em',
									type: 'checkbox',
									name: 'showInvisibles_spaces',
									value: 'Yes',
									default: (settings.showInvisibles === true || (typeof(settings.showInvisibles) === 'string' && settings.showInvisibles.indexOf('space') > -1) ? true : false),
									display: 'Spaces'
								},
								{
									htmltitle: '&nbsp;',
									width: '11em',
									type: 'checkbox',
									name: 'showInvisibles_eol',
									value: 'Yes',
									default: (settings.showInvisibles === true || (typeof(settings.showInvisibles) === 'string' && settings.showInvisibles.indexOf('eol') > -1) ? true : false),
									display: 'End of line'
								},
								'endrow',
								{
									title: 'Wrap Lines',
									width: '37em',
									type: 'select',
									name: 'wrap',
									options: [
										{ key: 'off', display: 'Off' },
										{ key: 'free', display: 'On' },
										{ key: 'printMargin', display: 'Print Margin' }
									],
									default: settings.wrap
								},
								{
									width: '37em',
									type: 'checkbox',
									name: 'indentedSoftWrap',
									value: 'Yes',
									default: settings.indentedSoftWrap,
									display: 'Indent wrapped text'
								},
								'startrow',
								{
									title: 'Key Bindings',
									width: '18em',
									type: 'select',
									name: 'keyboardHandler',
									options: [
										{ key: '', display: 'Default' },
										{ key: 'ace/keyboard/vim', display: 'Vim' },
										{ key: 'ace/keyboard/emacs', display: 'Emacs' },
										{ key: 'ace/keyboard/sublime', display: 'Sublime' },
										{ key: 'ace/keyboard/vscode', display: 'Visual Studio Code' }
									],
									default: settings.keyboardHandler
								},
								{
									title: 'Keyboard Caret Style',
									width: '18em',
									type: 'select',
									name: 'cursorStyle',
									options: [
										{ key: 'ace', display: 'Default' },
										{ key: 'slim', display: 'Slim' },
										{ key: 'smooth', display: 'Smooth blink' },
										{ key: 'smooth slim', display: 'Slim and smooth blink' },
										{ key: 'wide', display: 'Wide/No blink' }
									],
									default: settings.cursorStyle
								},
								'endrow',
								{
									title: 'Linting',
									width: '37em',
									type: 'checkbox',
									name: 'useWorker',
									value: 'Yes',
									default: settings.useWorker,
									display: 'Enable live linting of code (may need to reload the page)'
								},
								{
									title: 'Newline Mode',
									width: '37em',
									type: 'select',
									name: 'newLineMode',
									options: [
										{ key: 'auto', display: 'Automatic' },
										{ key: 'unix', display: 'Unix' },
										{ key: 'windows', display: 'Windows' }
									],
									default: settings.newLineMode
								},
								{
									title: 'Highlights and Selections',
									width: '37em',
									type: 'checkbox',
									name: 'highlightActiveLine',
									value: 'Yes',
									default: settings.highlightActiveLine,
									display: 'Highlight the currently active line'
								},
								{
									width: '37em',
									type: 'checkbox',
									name: 'highlightSelectedWord',
									value: 'Yes',
									default: settings.highlightSelectedWord,
									display: 'Highlight all matching content to selected content'
								},
								{
									width: '37em',
									type: 'checkbox',
									name: 'selectionStyle',
									value: 'Yes',
									default: (settings.selectionStyle === 'line'),
									display: 'Select to end of the row when an EOL is selected'
								},
								{
									title: 'Merge Undo Stack Changes',
									width: '37em',
									type: 'select',
									name: 'mergeUndoDeltas',
									options: [
										{ key: 'false', display: 'Never (recommended)' },
										{ key: 'true', display: 'Timed (slightly buggy)' },
										{ key: 'always', display: 'Always (slightly buggy)' }
									],
									default: (settings.mergeUndoDeltas === true ? 'true' : (settings.mergeUndoDeltas === false ? 'false' : 'always'))
								},
								'startrow',
								{
									title: 'Print Margin',
									width: '18em',
									type: 'checkbox',
									name: 'showPrintMargin',
									value: 'Yes',
									default: settings.showPrintMargin,
									display: 'Show print margin'
								},
								{
									title: 'Print Margin Column',
									width: '18em',
									type: 'text',
									name: 'printMarginColumn',
									default: settings.printMarginColumn.toString()
								},
								'startrow',
								{
									title: 'Scroll Speed',
									width: '18em',
									type: 'text',
									name: 'scrollSpeed',
									default: settings.scrollSpeed.toString()
								},
								{
									title: 'Scroll Past End (%)',
									width: '18em',
									type: 'text',
									name: 'scrollPastEnd',
									default: (settings.scrollPastEnd * 100).toString()
								},
								'endrow',
								{
									width: '37em',
									type: 'checkbox',
									name: 'animatedScroll',
									value: 'Yes',
									default: settings.animatedScroll,
									display: 'Smooth scrolling'
								},
								{
									width: '37em',
									type: 'checkbox',
									name: 'vScrollBarAlwaysVisible',
									value: 'Yes',
									default: settings.vScrollBarAlwaysVisible,
									display: 'Always show a vertical scrollbar'
								},
								{
									width: '37em',
									type: 'checkbox',
									name: 'hScrollBarAlwaysVisible',
									value: 'Yes',
									default: settings.hScrollBarAlwaysVisible,
									display: 'Always show a horizontal scrollbar'
								},
								{
									title: 'Miscellaneous',
									width: '37em',
									type: 'checkbox',
									name: 'useTextareaForIME',
									value: 'Yes',
									default: settings.useTextareaForIME,
									display: 'Use a textarea for IME'
								},
								{
									width: '37em',
									type: 'checkbox',
									name: 'dragEnabled',
									value: 'Yes',
									default: settings.dragEnabled,
									display: 'Allow text drag-and-drop'
								},
								{
									width: '37em',
									type: 'checkbox',
									name: 'tooltipFollowsMouse',
									value: 'Yes',
									default: settings.tooltipFollowsMouse,
									display: 'Tooltips follow the mouse cursor'
								},
							],
							submit: ['OK', 'Cancel'],
							submitname: 'button'
						},

						onsubmit: function(formvars, formnode, e) {
							if (formvars.button === FlexForms.Translate('OK'))
							{
								// Apply and save the settings.
								var settings = {
									theme: formvars.theme,
									fontSize: parseInt(formvars.fontSize, 10),
									fontFamily: formvars.fontFamily,
									tabSize: parseInt(formvars.tabSize, 10),
									useSoftTabs: (formvars.useSoftTabs === 'Yes'),
									navigateWithinSoftTabs: (formvars.navigateWithinSoftTabs === 'Yes'),
									showGutter: (formvars.showGutter === 'Yes'),
									showLineNumbers: (formvars.showLineNumbers === 'Yes'),
									highlightGutterLine: (formvars.highlightGutterLine === 'Yes'),
									showFoldWidgets: (formvars.showFoldWidgets === 'Yes'),
									foldStyle: formvars.foldStyle,
									fadeFoldWidgets: (formvars.fadeFoldWidgets === 'Yes'),
									behavioursEnabled: (formvars.behavioursEnabled === 'Yes'),
									wrapBehavioursEnabled: (formvars.wrapBehavioursEnabled === 'Yes'),
									enableAutoIndent: (formvars.enableAutoIndent === 'Yes'),
									displayIndentGuides: (formvars.displayIndentGuides === 'Yes'),
									showInvisibles: (formvars.showInvisibles_tabs === 'Yes' ? 'tab ' : '') + (formvars.showInvisibles_spaces === 'Yes' ? 'space ' : '') + (formvars.showInvisibles_eol === 'Yes' ? 'eol ' : ''),
									wrap: formvars.wrap,
									indentedSoftWrap: (formvars.indentedSoftWrap === 'Yes'),
									keyboardHandler: formvars.keyboardHandler,
									cursorStyle: formvars.cursorStyle,
									useWorker: (formvars.useWorker === 'Yes'),
									newLineMode: formvars.newLineMode,
									highlightActiveLine: (formvars.highlightActiveLine === 'Yes'),
									highlightSelectedWord: (formvars.highlightSelectedWord === 'Yes'),
									selectionStyle: (formvars.selectionStyle === 'Yes' ? 'line' : 'text'),
									mergeUndoDeltas: (formvars.mergeUndoDeltas === 'false' ? false : (formvars.mergeUndoDeltas === 'true' ? true : 'always')),
									showPrintMargin: (formvars.showPrintMargin === 'Yes'),
									printMarginColumn: parseInt(formvars.printMarginColumn, 10),
									scrollSpeed: parseInt(formvars.scrollSpeed, 10),
									scrollPastEnd: Math.min(Math.max(parseInt(formvars.scrollPastEnd, 10) / 100, 0), 1),
									animatedScroll: (formvars.animatedScroll === 'Yes'),
									vScrollBarAlwaysVisible: (formvars.vScrollBarAlwaysVisible === 'Yes'),
									hScrollBarAlwaysVisible: (formvars.hScrollBarAlwaysVisible === 'Yes'),
									useTextareaForIME: (formvars.useTextareaForIME === 'Yes'),
									dragEnabled: (formvars.dragEnabled === 'Yes'),
									tooltipFollowsMouse: (formvars.tooltipFollowsMouse === 'Yes')
								};

								aceeditor.setOptions(settings);

								aceeditor.session.setMode(formvars.mode);

								settings._v = ACE_SETTINGS_VERSION;
								localStorage.setItem('ace_settings', JSON.stringify(settings));
							}

							this.Destroy();

							currdlg = null;
						},

						onclose: function() {
							this.Destroy();

							currdlg = null;
						}
					};

					currdlg = FlexForms.Dialog(document.body, options);
				}
			};

			$this.GetOptionsMenuItems = function() {
				var items = [
					{ id: 'save', name: fm.Translate('Save (' + (navigator.platform.indexOf('Mac') > -1 ? '\u2318' : 'Ctrl') + ' + S)') },
					{ id: 'reload', name: fm.Translate('Reload') },
					{ id: 'clipboard_url', name: fm.Translate('Copy URL'), enabled: (fileinfo.url !== false) },
					{ id: 'clipboard_embed', name: fm.Translate('Copy Embed'), enabled: (fileinfo.url !== false) },
					'split',
					{ id: 'find', name: fm.Translate('Find... (' + (navigator.platform.indexOf('Mac') > -1 ? '\u2318' : 'Ctrl') + ' + F)') },
					{ id: 'find_next', name: fm.Translate('Find Next (F3)') },
					{ id: 'find_prev', name: fm.Translate('Find Prev (F4)') },
					'split',
					{ id: 'settings', name: fm.Translate('Settings...') }
				];

				return items;
			};

			$this.KeyHandler = function(e) {
				if (!e.isTrusted)  return;

				if ((e.ctrlKey || e.metaKey) && e.keyCode == 83)
				{
					// Ctrl/Meta + S.  Save.
					e.preventDefault();

					SaveDiff();
				}
				else if ((e.ctrlKey || e.metaKey) && e.keyCode == 70)
				{
					// Ctrl/Meta + F.  Find.
					e.preventDefault();

					StartFind();
				}
				else if (!e.shiftKey && e.keyCode == 114)
				{
					// F3.  Find Next.
					e.preventDefault();

					aceeditor.findNext();
				}
				else if (!e.shiftKey && e.keyCode == 115)
				{
					// F4.  Find Previous.
					e.preventDefault();

					aceeditor.findPrevious();
				}
			};

			$this.Deactivate = function() {
				aceviewwrap.classList.add('fm_file_editor_hidden');

				SaveDiff();

				window.removeEventListener('blur', BrowserBlurHandler, true);
			};

			$this.Close = function(closeready) {
				if (currdlg)
				{
					currdlg.Close();
					if (currdlg)  currdlg.Destroy();

					currdlg = null;
				}

				if (saveinprogress)  saveclosereadycallback = closeready;
				else  closeready(true);
			};

			$this.Destroy = function() {
				if (currdlg)
				{
					currdlg.Close();
					if (currdlg)  currdlg.Destroy();

					currdlg = null;
				}

				aceeditor.setSession(null);

				acesession.destroy();
				acesession = null;

				aceviewwrap = null;
				aceeditor = null;

				fm.settings.aceeditorrefs--;
				if (fm.settings.aceeditorrefs < 1)
				{
					fm.settings.aceeditor.destroy();
					fm.settings.aceeditor = null;

					parentelem.removeChild(fm.settings.aceviewwrap);
					fm.settings.aceviewwrap = null;
				}

				if (editedtimeout)
				{
					clearTimeout(editedtimeout);

					editedtimeout = null;
				}

				window.removeEventListener('blur', BrowserBlurHandler, true);

				$this = null;
			};
		};

		window.FileManager.ACEFileEditorHandler.config = {
			name: 'ace_editor',
			tabview_title: 'Text Editor',
			tabview_icon: 'fm_file_editor_text_edit_icon',
			browseronly: false,
			textonly: true
		};

		window.FileManager.RegisterFileExtensionHandler('', window.FileManager.ACEFileEditorHandler, { mode: 'text' });
		window.FileManager.RegisterFileExtensionHandler('htaccess', window.FileManager.ACEFileEditorHandler, { mode: 'apache_conf' });
		window.FileManager.RegisterFileExtensionHandler('css', window.FileManager.ACEFileEditorHandler, { mode: 'css' });
		window.FileManager.RegisterFileExtensionHandler('diff', window.FileManager.ACEFileEditorHandler, { mode: 'diff' });
		window.FileManager.RegisterFileExtensionHandler('html', window.FileManager.ACEFileEditorHandler, { mode: 'html' });
		window.FileManager.RegisterFileExtensionHandler('htm', 'html');
		window.FileManager.RegisterFileExtensionHandler('xhtml', 'html');
		window.FileManager.RegisterFileExtensionHandler('js', window.FileManager.ACEFileEditorHandler, { mode: 'javascript' });
		window.FileManager.RegisterFileExtensionHandler('mjs', 'js');
		window.FileManager.RegisterFileExtensionHandler('json', window.FileManager.ACEFileEditorHandler, { mode: 'json' });
		window.FileManager.RegisterFileExtensionHandler('md', window.FileManager.ACEFileEditorHandler, { mode: 'markdown' });
		window.FileManager.RegisterFileExtensionHandler('markdown', 'md');
		window.FileManager.RegisterFileExtensionHandler('php', window.FileManager.ACEFileEditorHandler, { mode: 'php' });
		window.FileManager.RegisterFileExtensionHandler('phtml', 'php');
		window.FileManager.RegisterFileExtensionHandler('php3', 'php');
		window.FileManager.RegisterFileExtensionHandler('php4', 'php');
		window.FileManager.RegisterFileExtensionHandler('php5', 'php');
		window.FileManager.RegisterFileExtensionHandler('php7', 'php');
		window.FileManager.RegisterFileExtensionHandler('inc', 'php');
		window.FileManager.RegisterFileExtensionHandler('svg', window.FileManager.ACEFileEditorHandler, { mode: 'svg' });
		window.FileManager.RegisterFileExtensionHandler('xml', window.FileManager.ACEFileEditorHandler, { mode: 'xml' });
		window.FileManager.RegisterFileExtensionHandler('txt', window.FileManager.ACEFileEditorHandler, { mode: 'text' });
		window.FileManager.RegisterFileExtensionHandler('log', 'txt');
		window.FileManager.RegisterFileExtensionHandler('conf', window.FileManager.ACEFileEditorHandler, { mode: 'apache_conf' });
		window.FileManager.RegisterFileExtensionHandler('ini', window.FileManager.ACEFileEditorHandler, { mode: 'text' });
		window.FileManager.RegisterFileExtensionHandler('yml', window.FileManager.ACEFileEditorHandler, { mode: 'text' });
		window.FileManager.RegisterFileExtensionHandler('yaml', 'yml');
	}

	window.FileManager.RegisterFileExtensionHandler('html', window.FileManager.BrowserFileViewerHandler, {});

	window.FileManager.RegisterFileExtensionHandler('text/css', 'css');
	window.FileManager.RegisterFileExtensionHandler('text/diff', 'diff');
	window.FileManager.RegisterFileExtensionHandler('text/html', 'html');
	window.FileManager.RegisterFileExtensionHandler('text/javascript', 'js');
	window.FileManager.RegisterFileExtensionHandler('application/json', 'json');
	window.FileManager.RegisterFileExtensionHandler('text/markdown', 'md');
	window.FileManager.RegisterFileExtensionHandler('application/php', 'php');
	window.FileManager.RegisterFileExtensionHandler('text/xml', 'xml');
})();
