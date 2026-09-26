// MySQL Manager UI for Cope Manager (File Explorer–style workspace).
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

(function() {
	if (window.hasOwnProperty('MySQLManager'))  return;

	var EscapeHTML = (window.FlexForms && FlexForms.EscapeHTML) ? FlexForms.EscapeHTML : function(s) {
		return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	};

	var CreateNode = (window.FlexForms && FlexForms.CreateNode) ? FlexForms.CreateNode : function(tag, classes, attrs) {
		var el = document.createElement(tag);
		if (classes)  el.className = (Array.isArray(classes) ? classes.join(' ') : classes);
		if (attrs) {
			for (var k in attrs) {
				if (attrs.hasOwnProperty(k))  el.setAttribute(k, attrs[k]);
			}
		}
		return el;
	};

	window.MySQLManager = function(fm, options) {
		var $this = this;
		var opts = options || {};
		var translate = function(str) {
			return (fm && fm.Translate) ? fm.Translate(str) : str;
		};

		var state = {
			servers: [],
			serverId: null,
			databases: [],
			database: '',
			tables: [],
			table: '',
			view: 'welcome',
			browse: { offset: 0, limit: 50, total: 0, columns: [], rows: [], sql: '', primary_keys: [], search: '' },
			selected: {},
			selectedTables: {},
			events: [],
			triggers: [],
			createSqlPreview: '',
			structure: { columns: [], indexes: [] },
			edit: null,
			inlineEdit: null,
			sqlText: '',
			sqlResult: null,
			message: '',
			error: '',
			loading: false,
			status: '',
			sidebarOpen: false,
			treeCollapsed: {}
		};

		var root = CreateNode('div', ['fm_mysql_wrap', 'fm_file_editor_hidden']);
		var inner = CreateNode('div', ['fm_mysql_inner']);
		var nav = CreateNode('div', ['fm_mysql_nav']);
		var body = CreateNode('div', ['fm_mysql_body']);
		var backdrop = CreateNode('div', ['fm_mysql_sidebar_backdrop']);
		var sidebar = CreateNode('div', ['fm_mysql_sidebar']);
		var main = CreateNode('div', ['fm_mysql_main']);
		var tabsEl = CreateNode('div', ['fm_mysql_tabs']);
		var toolbar = CreateNode('div', ['fm_mysql_toolbar']);
		var content = CreateNode('div', ['fm_mysql_content']);
		var statusbar = CreateNode('div', ['fm_mysql_statusbar']);

		main.appendChild(tabsEl);
		main.appendChild(toolbar);
		main.appendChild(content);
		main.appendChild(statusbar);
		body.appendChild(backdrop);
		body.appendChild(sidebar);
		body.appendChild(main);
		inner.appendChild(nav);
		inner.appendChild(body);
		root.appendChild(inner);
		document.body.appendChild(root);

		var request = function(action, fields, done) {
			var params = Object.assign({}, fields || {});
			params.action = action;

			if (fm && typeof fm.settings.onxhrparams === 'function')  fm.settings.onxhrparams(action, params);
			else if (opts.onxhrparams)  opts.onxhrparams(action, params);

			var xhrFactory = (fm && fm.PrepareXHR) ? fm.PrepareXHR : null;
			if (!xhrFactory) {
				done({ success: false, error: 'XHR not ready.' });
				return;
			}

			if (fm && typeof fm.LogActivity === 'function')  fm.LogActivity('mysql', action);

			var xhr = new xhrFactory({
				url: window.location.href,
				params: params,
				onsuccess: function(e) {
					var data;
					try { data = JSON.parse(e.target.responseText); }
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

		var setError = function(msg) { state.error = msg || ''; state.message = ''; };
		var setMessage = function(msg) { state.message = msg || ''; state.error = ''; };

		var currentServer = function() {
			for (var i = 0; i < state.servers.length; i++) {
				if (state.servers[i].id === state.serverId)  return state.servers[i];
			}
			return null;
		};

		var downloadText = function(filename, content, mime) {
			var blob = new Blob([content], { type: mime || 'text/plain;charset=utf-8' });
			var url = URL.createObjectURL(blob);
			var a = document.createElement('a');
			a.href = url;
			a.download = filename || 'export.txt';
			document.body.appendChild(a);
			a.click();
			setTimeout(function() {
				URL.revokeObjectURL(url);
				document.body.removeChild(a);
			}, 500);
		};

		var treeKey = function(kind, id) {
			return kind + ':' + (id || '');
		};

		var isCollapsed = function(kind, id) {
			return !!state.treeCollapsed[treeKey(kind, id)];
		};

		var toggleCollapsed = function(kind, id) {
			var k = treeKey(kind, id);
			state.treeCollapsed[k] = !state.treeCollapsed[k];
		};

		var closeSidebarMobile = function() {
			state.sidebarOpen = false;
			root.classList.remove('fm_mysql_sidebar_open');
		};

		var toggleSidebarMobile = function() {
			state.sidebarOpen = !state.sidebarOpen;
			root.classList.toggle('fm_mysql_sidebar_open', state.sidebarOpen);
		};

		var renderCell = function(v) {
			if (v === null)  return '<span class="fm_mysql_null">NULL</span>';
			return EscapeHTML(String(v));
		};

		var rowWhere = function(row) {
			var pks = state.browse.primary_keys || [];
			var where = {};
			if (pks.length) {
				for (var i = 0; i < pks.length; i++)  where[pks[i]] = row[pks[i]];
			}
			else {
				for (var k in row) {
					if (row.hasOwnProperty(k))  where[k] = row[k];
				}
			}
			return where;
		};

		var renderNav = function() {
			nav.innerHTML = '';

			var btnMenu = CreateNode('button', ['fm_mysql_nav_btn', 'fm_mysql_nav_btn_menu'], { type: 'button', title: translate('Navigation') });
			btnMenu.textContent = '☰';
			btnMenu.addEventListener('click', toggleSidebarMobile);
			nav.appendChild(btnMenu);

			var btnRefresh = CreateNode('button', ['fm_mysql_nav_btn'], { type: 'button', title: translate('Refresh') });
			btnRefresh.textContent = '↻';
			btnRefresh.addEventListener('click', function() {
				if (state.view === 'browse' && state.table)  loadBrowse();
				else if (state.view === 'structure' && state.table)  loadStructure();
				else if (state.database)  loadTables();
				else if (state.serverId)  loadDatabases();
				else  loadServers();
			});
			nav.appendChild(btnRefresh);

			var path = CreateNode('div', ['fm_mysql_nav_path']);
			var addSeg = function(label, onClick) {
				if (path.childNodes.length) {
					var sep = CreateNode('span', ['fm_mysql_path_sep']);
					sep.textContent = '›';
					path.appendChild(sep);
				}
				var b = CreateNode('button', ['fm_mysql_path_seg'], { type: 'button' });
				b.textContent = label;
				if (onClick)  b.addEventListener('click', onClick);
				path.appendChild(b);
			};

			addSeg(translate('MySQL'), function() {
				state.serverId = null;
				state.database = '';
				state.table = '';
				state.view = 'welcome';
				state.edit = null;
				closeSidebarMobile();
				render();
			});

			var srv = currentServer();
			if (srv) {
				addSeg(srv.name, function() {
					state.database = '';
					state.table = '';
					state.view = 'welcome';
					state.edit = null;
					closeSidebarMobile();
					loadDatabases();
				});
			}
			if (state.database) {
				addSeg(state.database, function() {
					state.table = '';
					state.view = 'welcome';
					state.edit = null;
					closeSidebarMobile();
					loadTables();
				});
			}
			if (state.table) {
				addSeg(state.table, function() {
					state.view = 'browse';
					state.edit = null;
					closeSidebarMobile();
					loadBrowse();
				});
			}

			nav.appendChild(path);

			var actions = CreateNode('div', ['fm_mysql_nav_actions']);
			var btnAdd = CreateNode('button', ['fm_mysql_btn', 'fm_mysql_btn_primary', 'fm_mysql_btn_sm', 'fm_mysql_btn_hide_sm'], { type: 'button' });
			btnAdd.textContent = translate('Add server');
			btnAdd.addEventListener('click', function() { showServerForm(null); });
			actions.appendChild(btnAdd);

			var btnClose = CreateNode('button', ['fm_mysql_nav_btn'], { type: 'button', title: translate('Close') });
			btnClose.textContent = '×';
			btnClose.addEventListener('click', function() { $this.Hide(); });
			actions.appendChild(btnClose);
			nav.appendChild(actions);
		};

		var renderSidebar = function() {
			sidebar.innerHTML = '';

			var tools = CreateNode('div', ['fm_mysql_sidebar_tools']);
			var btnAdd = CreateNode('button', ['fm_mysql_btn', 'fm_mysql_btn_sm', 'fm_mysql_btn_primary'], { type: 'button' });
			btnAdd.textContent = translate('Add server');
			btnAdd.addEventListener('click', function() { showServerForm(null); closeSidebarMobile(); });
			tools.appendChild(btnAdd);

			if (state.serverId) {
				var btnNewDb = CreateNode('button', ['fm_mysql_btn', 'fm_mysql_btn_sm'], { type: 'button' });
				btnNewDb.textContent = translate('New DB');
				btnNewDb.addEventListener('click', function() { createDatabasePrompt(); });
				tools.appendChild(btnNewDb);
			}
			sidebar.appendChild(tools);

			var tree = CreateNode('div', ['fm_mysql_tree']);
			var gSrv = CreateNode('div', ['fm_mysql_tree_group'].concat(isCollapsed('root', 'servers') ? ['collapsed'] : []));
			var labS = CreateNode('div', ['fm_mysql_tree_label']);
			labS.innerHTML = '<span class="fm_mysql_tree_twist">' + (isCollapsed('root', 'servers') ? '▶' : '▼') + '</span> ' + EscapeHTML(translate('Servers'));
			labS.addEventListener('click', function() {
				toggleCollapsed('root', 'servers');
				renderSidebar();
			});
			gSrv.appendChild(labS);

			var children = CreateNode('div', ['fm_mysql_tree_children']);

			if (!state.servers.length) {
				var empty = CreateNode('div', ['fm_mysql_empty']);
				empty.style.padding = '8px';
				empty.textContent = translate('No servers yet.');
				children.appendChild(empty);
			}
			else {
				state.servers.forEach(function(s) {
					var srvWrap = CreateNode('div', ['fm_mysql_tree_group'].concat(isCollapsed('server', s.id) ? ['collapsed'] : []));
					var btn = CreateNode('button', ['fm_mysql_tree_item'].concat(s.id === state.serverId && !state.database ? ['active'] : []), { type: 'button' });
					btn.innerHTML = '<span class="fm_mysql_tree_twist">' + (isCollapsed('server', s.id) ? '▶' : '▼') + '</span><span class="fm_mysql_tree_ico srv"></span><span class="fm_mysql_tree_text">' + EscapeHTML(s.name) + '</span>';
					btn.addEventListener('click', function() {
						if (state.serverId === s.id) {
							toggleCollapsed('server', s.id);
							renderSidebar();
							return;
						}
						state.treeCollapsed[treeKey('server', s.id)] = false;
						selectServer(s.id);
						closeSidebarMobile();
					});
					srvWrap.appendChild(btn);

					if (s.id === state.serverId) {
						var dbChildren = CreateNode('div', ['fm_mysql_tree_children']);
						state.databases.forEach(function(db) {
							var dbWrap = CreateNode('div', ['fm_mysql_tree_group'].concat(isCollapsed('db', db) ? ['collapsed'] : []));
							var dbBtn = CreateNode('button', ['fm_mysql_tree_item', 'fm_mysql_tree_item_nested'].concat(db === state.database && !state.table ? ['active'] : []), { type: 'button' });
							dbBtn.innerHTML = '<span class="fm_mysql_tree_twist">' + (isCollapsed('db', db) ? '▶' : '▼') + '</span><span class="fm_mysql_tree_ico db"></span><span class="fm_mysql_tree_text">' + EscapeHTML(db) + '</span>';
							dbBtn.addEventListener('click', function() {
								if (state.database === db) {
									toggleCollapsed('db', db);
									renderSidebar();
									return;
								}
								state.treeCollapsed[treeKey('db', db)] = false;
								selectDatabase(db);
								closeSidebarMobile();
							});
							dbBtn.addEventListener('contextmenu', function(e) {
								e.preventDefault();
								if (confirm(translate('Drop database') + ' "' + db + '"?'))  dropDatabase(db);
							});
							dbWrap.appendChild(dbBtn);

							if (db === state.database) {
								var tblChildren = CreateNode('div', ['fm_mysql_tree_children']);
								state.tables.forEach(function(t) {
									var tBtn = CreateNode('button', ['fm_mysql_tree_item', 'fm_mysql_tree_item_nested2'].concat(t.name === state.table ? ['active'] : []), { type: 'button' });
									tBtn.innerHTML = '<span class="fm_mysql_tree_ico tbl"></span><span class="fm_mysql_tree_text">' + EscapeHTML(t.name) + '</span>' +
										(t.type === 'VIEW' ? '<span class="fm_mysql_tree_meta">view</span>' : '');
									tBtn.addEventListener('click', function() {
										selectTable(t.name);
										closeSidebarMobile();
									});
									tBtn.addEventListener('contextmenu', function(e) {
										e.preventDefault();
										if (confirm(translate('Drop table') + ' "' + t.name + '"?'))  dropTable(t.name);
									});
									tblChildren.appendChild(tBtn);
								});
								dbWrap.appendChild(tblChildren);
							}
							dbChildren.appendChild(dbWrap);
						});
						srvWrap.appendChild(dbChildren);
					}
					children.appendChild(srvWrap);
				});
			}

			gSrv.appendChild(children);
			tree.appendChild(gSrv);
			sidebar.appendChild(tree);
		};

		var renderTabs = function() {
			tabsEl.innerHTML = '';
			// Remove previous floating More menus.
			document.querySelectorAll('.fm_mysql_more_menu_body').forEach(function(m) {
				if (m.parentNode)  m.parentNode.removeChild(m);
			});

			var goView = function(id) {
				state.edit = null;
				state.view = id;
				if (id === 'browse' && state.table)  loadBrowse();
				else if (id === 'structure' && state.table)  loadStructure();
				else if (id === 'events')  loadEvents();
				else if (id === 'triggers')  loadTriggers();
				else if (id === 'insert' && state.table)  startInsert();
				else  render();
			};

			var addTab = function(id, label) {
				var active = (state.view === id) || (state.view === 'edit' && id === 'browse' && state.edit && state.edit.mode !== 'insert') || (state.view === 'edit' && id === 'insert' && state.edit && state.edit.mode === 'insert');
				var b = CreateNode('button', ['fm_mysql_tab'].concat(active ? ['active'] : []), { type: 'button' });
				b.textContent = label;
				b.addEventListener('click', function() { goView(id); });
				tabsEl.appendChild(b);
			};

			if (state.table) {
				addTab('browse', translate('Browse'));
				addTab('structure', translate('Structure'));
				addTab('sql', translate('SQL'));
				addTab('insert', translate('Insert'));
			}
			else {
				addTab('welcome', translate('Overview'));
				if (state.serverId) {
					addTab('sql', translate('SQL'));
					addTab('import', translate('Import'));
					addTab('export', translate('Export'));
				}
			}

			if (state.view === 'edit' && state.edit) {
				var eb = CreateNode('button', ['fm_mysql_tab', 'active'], { type: 'button' });
				eb.textContent = state.edit.mode === 'insert' ? translate('Insert') : translate('Edit');
				tabsEl.appendChild(eb);
			}

			// More menu for secondary actions
			var moreItems = [];
			if (state.table) {
				moreItems = [
					{ id: 'rename', label: translate('Rename') },
					{ id: 'copy', label: translate('Copy') },
					{ id: 'export_sql', label: translate('Export SQL') },
					{ id: 'export_csv', label: translate('Export CSV') },
					{ id: 'empty', label: translate('Empty'), danger: true },
					{ id: 'drop', label: translate('Drop'), danger: true },
					{ sep: true },
					{ id: 'import', label: translate('Import') },
					{ id: 'export', label: translate('Export…') },
					{ id: 'events', label: translate('Events') },
					{ id: 'triggers', label: translate('Triggers') }
				];
			}
			else if (state.serverId) {
				moreItems = [
					{ id: 'events', label: translate('Events') },
					{ id: 'triggers', label: translate('Triggers') }
				];
			}

			if (!moreItems.length)  return;

			var moreWrap = CreateNode('div', ['fm_mysql_more_wrap']);
			var moreBtn = CreateNode('button', ['fm_mysql_tab', 'fm_mysql_more_btn'], { type: 'button' });
			moreBtn.textContent = translate('More') + ' ▾';
			var moreMenu = CreateNode('div', ['fm_mysql_more_menu', 'fm_mysql_more_menu_body', 'fm_file_editor_hidden']);

			var hideMoreMenu = function() {
				moreMenu.classList.add('fm_file_editor_hidden');
				moreMenu.classList.remove('fm_mysql_more_menu_fixed');
			};

			var showMoreMenu = function() {
				var rect = moreBtn.getBoundingClientRect();
				moreMenu.classList.add('fm_mysql_more_menu_fixed');
				moreMenu.style.top = (rect.bottom + 2) + 'px';
				moreMenu.style.left = 'auto';
				moreMenu.style.right = Math.max(8, window.innerWidth - rect.right) + 'px';
				moreMenu.classList.remove('fm_file_editor_hidden');
			};

			moreItems.forEach(function(item) {
				if (item.sep) {
					moreMenu.appendChild(CreateNode('div', ['fm_mysql_more_sep']));
					return;
				}
				var mi = CreateNode('button', ['fm_mysql_more_item'].concat(item.danger ? ['fm_mysql_more_danger'] : []), { type: 'button' });
				mi.textContent = item.label;
				mi.addEventListener('click', function(e) {
					e.stopPropagation();
					hideMoreMenu();
					runMoreAction(item.id);
				});
				moreMenu.appendChild(mi);
			});

			moreBtn.addEventListener('click', function(e) {
				e.stopPropagation();
				var isOpen = !moreMenu.classList.contains('fm_file_editor_hidden');
				if (isOpen)  hideMoreMenu();
				else  showMoreMenu();
			});

			moreWrap.appendChild(moreBtn);
			document.body.appendChild(moreMenu);
			tabsEl.appendChild(moreWrap);
		};

		var runMoreAction = function(id) {
			if (id === 'rename')  renameTablePrompt();
			else if (id === 'copy')  copyTablePrompt();
			else if (id === 'export_sql')  exportTable('sql');
			else if (id === 'export_csv')  exportTable('csv');
			else if (id === 'empty')  truncateTablePrompt();
			else if (id === 'drop') {
				if (confirm(translate('Drop table') + ' "' + state.table + '"?'))  dropTable(state.table);
			}
			else if (id === 'import') { state.view = 'import'; render(); }
			else if (id === 'export') { state.view = 'export'; render(); }
			else if (id === 'events')  loadEvents();
			else if (id === 'triggers')  loadTriggers();
			else if (id === 'insert')  startInsert();
			else if (id === 'sql') { state.view = 'sql'; render(); }
		};

		var renderToolbar = function() {
			toolbar.innerHTML = '';
			toolbar.style.display = '';

			if (state.view === 'browse' && state.table) {
				var searchWrap = CreateNode('div', ['fm_mysql_search']);
				var searchInput = CreateNode('input', [], { type: 'search', placeholder: translate('Search…'), value: state.browse.search || '' });
				var btnSearch = CreateNode('button', ['fm_mysql_btn', 'fm_mysql_btn_sm'], { type: 'button' });
				btnSearch.textContent = translate('Search');
				var doSearch = function() {
					state.browse.search = searchInput.value;
					state.browse.offset = 0;
					state.selected = {};
					loadBrowse();
				};
				btnSearch.addEventListener('click', doSearch);
				searchInput.addEventListener('keydown', function(e) {
					if (e.keyCode === 13) { e.preventDefault(); doSearch(); }
				});
				searchWrap.appendChild(searchInput);
				searchWrap.appendChild(btnSearch);
				toolbar.appendChild(searchWrap);

				var btnIns = CreateNode('button', ['fm_mysql_btn', 'fm_mysql_btn_primary', 'fm_mysql_btn_sm'], { type: 'button' });
				btnIns.textContent = translate('Insert');
				btnIns.addEventListener('click', function() { startInsert(); });
				toolbar.appendChild(btnIns);

				var btnDelSel = CreateNode('button', ['fm_mysql_btn', 'fm_mysql_btn_sm', 'fm_mysql_btn_danger'], { type: 'button' });
				btnDelSel.textContent = translate('Delete');
				btnDelSel.addEventListener('click', bulkDeleteSelected);
				toolbar.appendChild(btnDelSel);

				var btnExport = CreateNode('button', ['fm_mysql_btn', 'fm_mysql_btn_sm'], { type: 'button' });
				btnExport.textContent = translate('Export');
				btnExport.addEventListener('click', function() { exportTable('sql'); });
				toolbar.appendChild(btnExport);

				var btnCsv = CreateNode('button', ['fm_mysql_btn', 'fm_mysql_btn_sm'], { type: 'button' });
				btnCsv.textContent = 'CSV';
				btnCsv.addEventListener('click', function() { exportTable('csv'); });
				toolbar.appendChild(btnCsv);

				var btnRef = CreateNode('button', ['fm_mysql_btn', 'fm_mysql_btn_sm'], { type: 'button' });
				btnRef.textContent = translate('Refresh');
				btnRef.addEventListener('click', loadBrowse);
				toolbar.appendChild(btnRef);
			}
			else if (state.view === 'sql') {
				var btnRun = CreateNode('button', ['fm_mysql_btn', 'fm_mysql_btn_primary', 'fm_mysql_btn_sm'], { type: 'button' });
				btnRun.textContent = translate('Run SQL');
				btnRun.addEventListener('click', function() {
					var ta = content.querySelector('#fm_mysql_sql_input');
					if (ta)  state.sqlText = ta.value;
					runSql();
				});
				toolbar.appendChild(btnRun);
			}
			else if (state.view === 'import') {
				var btnImp = CreateNode('button', ['fm_mysql_btn', 'fm_mysql_btn_primary', 'fm_mysql_btn_sm'], { type: 'button' });
				btnImp.textContent = translate('Go');
				btnImp.addEventListener('click', runImport);
				toolbar.appendChild(btnImp);
			}
			else if (state.view === 'export') {
				var btnExpSql = CreateNode('button', ['fm_mysql_btn', 'fm_mysql_btn_primary', 'fm_mysql_btn_sm'], { type: 'button' });
				btnExpSql.textContent = translate('Export SQL');
				btnExpSql.addEventListener('click', function() { exportSelectedOrCurrent('sql'); });
				toolbar.appendChild(btnExpSql);
				var btnExpCsv = CreateNode('button', ['fm_mysql_btn', 'fm_mysql_btn_sm'], { type: 'button' });
				btnExpCsv.textContent = translate('Export CSV');
				btnExpCsv.addEventListener('click', function() { exportSelectedOrCurrent('csv'); });
				toolbar.appendChild(btnExpCsv);
			}
			else if (state.view === 'events' || state.view === 'triggers') {
				var btnRef2 = CreateNode('button', ['fm_mysql_btn', 'fm_mysql_btn_sm'], { type: 'button' });
				btnRef2.textContent = translate('Refresh');
				btnRef2.addEventListener('click', function() {
					if (state.view === 'events')  loadEvents();
					else  loadTriggers();
				});
				toolbar.appendChild(btnRef2);
			}
			else if (state.view === 'welcome') {
				if (state.serverId) {
					var btnEdit = CreateNode('button', ['fm_mysql_btn', 'fm_mysql_btn_sm'], { type: 'button' });
					btnEdit.textContent = translate('Edit server');
					btnEdit.addEventListener('click', function() { showServerForm(currentServer()); });
					toolbar.appendChild(btnEdit);

					var btnDel = CreateNode('button', ['fm_mysql_btn', 'fm_mysql_btn_sm', 'fm_mysql_btn_danger'], { type: 'button' });
					btnDel.textContent = translate('Delete server');
					btnDel.addEventListener('click', function() {
						if (!confirm(translate('Delete this server configuration?')))  return;
						deleteServer(state.serverId);
					});
					toolbar.appendChild(btnDel);

					if (state.database) {
						var bSqlDb = CreateNode('button', ['fm_mysql_btn', 'fm_mysql_btn_sm'], { type: 'button' });
						bSqlDb.textContent = translate('SQL');
						bSqlDb.addEventListener('click', function() { state.view = 'sql'; render(); });
						toolbar.appendChild(bSqlDb);

						var bRef = CreateNode('button', ['fm_mysql_btn', 'fm_mysql_btn_sm'], { type: 'button' });
						bRef.textContent = translate('Refresh');
						bRef.addEventListener('click', loadTables);
						toolbar.appendChild(bRef);
					}
					else {
						var btnSql = CreateNode('button', ['fm_mysql_btn', 'fm_mysql_btn_sm'], { type: 'button' });
						btnSql.textContent = translate('SQL');
						btnSql.addEventListener('click', function() { state.view = 'sql'; render(); });
						toolbar.appendChild(btnSql);

						var btnRefDb = CreateNode('button', ['fm_mysql_btn', 'fm_mysql_btn_sm'], { type: 'button' });
						btnRefDb.textContent = translate('Refresh');
						btnRefDb.addEventListener('click', loadDatabases);
						toolbar.appendChild(btnRefDb);
					}
				}
				else {
					var btnAdd2 = CreateNode('button', ['fm_mysql_btn', 'fm_mysql_btn_primary', 'fm_mysql_btn_sm'], { type: 'button' });
					btnAdd2.textContent = translate('Add server');
					btnAdd2.addEventListener('click', function() { showServerForm(null); });
					toolbar.appendChild(btnAdd2);
				}
			}
			else if (state.view === 'edit') {
				toolbar.style.display = 'none';
			}
			else {
				toolbar.style.display = 'none';
			}
		};

		var renderOverviewList = function(headers, rowsHtml) {
			var html = '<div class="fm_mysql_table_wrap"><table class="fm_mysql_table"><thead><tr>';
			headers.forEach(function(h) { html += '<th>' + EscapeHTML(h) + '</th>'; });
			html += '</tr></thead><tbody>' + rowsHtml + '</tbody></table></div>';
			return html;
		};

		var renderOverview = function() {
			var html = '';

			// Root: servers
			if (!state.serverId) {
				html += '<h3 style="margin:0 0 10px">' + EscapeHTML(translate('MySQL servers')) + '</h3>';
				if (!state.servers.length) {
					html += '<div class="fm_mysql_empty">' + EscapeHTML(translate('Add a MySQL server to get started.')) + '</div>';
					return html;
				}
				var rows = '';
				state.servers.forEach(function(s) {
					rows += '<tr>';
					rows += '<td><button type="button" class="fm_mysql_btn fm_mysql_btn_sm fm_mysql_btn_primary" data-act="ov-server" data-id="' + EscapeHTML(s.id) + '">' + EscapeHTML(s.name) + '</button></td>';
					rows += '<td>' + EscapeHTML(s.host + ':' + s.port) + '</td>';
					rows += '<td>' + EscapeHTML(s.user) + '</td>';
					rows += '<td>' + EscapeHTML(s.database || '—') + '</td>';
					rows += '<td class="fm_mysql_row_actions">';
					rows += '<button type="button" class="fm_mysql_btn fm_mysql_btn_sm" data-act="ov-edit-server" data-id="' + EscapeHTML(s.id) + '">' + EscapeHTML(translate('Edit')) + '</button> ';
					rows += '<button type="button" class="fm_mysql_btn fm_mysql_btn_sm fm_mysql_btn_danger" data-act="ov-del-server" data-id="' + EscapeHTML(s.id) + '">' + EscapeHTML(translate('Delete')) + '</button>';
					rows += '</td></tr>';
				});
				html += renderOverviewList([translate('Server'), translate('Host'), translate('User'), translate('Default DB'), translate('Action')], rows);
				return html;
			}

			var s = currentServer();

			// Table selected → Browse is the home view; no action menu page.
			if (state.table) {
				html += '<div class="fm_mysql_empty">' + EscapeHTML(translate('Opening browse…')) + '</div>';
				return html;
			}

			// Database level: list tables with multi-select
			if (state.database) {
				html += '<h3 style="margin:0 0 6px">' + EscapeHTML(translate('Database') + ': ' + state.database) + '</h3>';
				html += '<p style="margin:0 0 12px;color:#526074">' + EscapeHTML((s ? s.name + ' · ' : '') + state.tables.length + ' ' + translate('tables')) + '</p>';
				if (!state.tables.length) {
					html += '<div class="fm_mysql_empty">' + EscapeHTML(translate('No tables.')) + '</div>';
					return html;
				}

				var selCount = 0;
				for (var tk in state.selectedTables) {
					if (state.selectedTables[tk])  selCount++;
				}

				html += '<div class="fm_mysql_multibar">';
				html += '<label><input type="checkbox" data-act="select-all-tables"' + (selCount && selCount === state.tables.length ? ' checked' : '') + '> ' + EscapeHTML(translate('Check all')) + '</label>';
				html += '<select id="fm_mysql_table_mult">';
				html += '<option value="">' + EscapeHTML(translate('With selected:')) + '</option>';
				html += '<option value="copy_tbl">' + EscapeHTML(translate('Copy table')) + '</option>';
				html += '<option value="show_create">' + EscapeHTML(translate('Show create')) + '</option>';
				html += '<option value="export">' + EscapeHTML(translate('Export')) + '</option>';
				html += '<optgroup label="' + EscapeHTML(translate('Delete data or table')) + '">';
				html += '<option value="empty_tbl">' + EscapeHTML(translate('Empty')) + '</option>';
				html += '<option value="drop_tbl">' + EscapeHTML(translate('Drop')) + '</option>';
				html += '</optgroup>';
				html += '<optgroup label="' + EscapeHTML(translate('Table maintenance')) + '">';
				html += '<option value="analyze_tbl">' + EscapeHTML(translate('Analyze table')) + '</option>';
				html += '<option value="check_tbl">' + EscapeHTML(translate('Check table')) + '</option>';
				html += '<option value="checksum_tbl">' + EscapeHTML(translate('Checksum table')) + '</option>';
				html += '<option value="optimize_tbl">' + EscapeHTML(translate('Optimize table')) + '</option>';
				html += '<option value="repair_tbl">' + EscapeHTML(translate('Repair table')) + '</option>';
				html += '</optgroup>';
				html += '<optgroup label="' + EscapeHTML(translate('Prefix')) + '">';
				html += '<option value="add_prefix_tbl">' + EscapeHTML(translate('Add prefix to table name')) + '</option>';
				html += '<option value="replace_prefix_tbl">' + EscapeHTML(translate('Replace table prefix')) + '</option>';
				html += '<option value="copy_tbl_change_prefix">' + EscapeHTML(translate('Copy table with prefix')) + '</option>';
				html += '</optgroup>';
				html += '</select>';
				html += '<button type="button" class="fm_mysql_btn fm_mysql_btn_primary fm_mysql_btn_sm" data-act="run-table-mult">' + EscapeHTML(translate('Go')) + '</button>';
				html += '<span style="color:#6A7B8D;font-size:12px">' + EscapeHTML(selCount + ' ' + translate('selected')) + '</span>';
				html += '</div>';

				var trows = '';
				state.tables.forEach(function(t) {
					var checked = !!state.selectedTables[t.name];
					trows += '<tr>';
					trows += '<td class="fm_mysql_check_cell"><input type="checkbox" class="fm_mysql_row_check" data-act="select-table" data-name="' + EscapeHTML(t.name) + '"' + (checked ? ' checked' : '') + '></td>';
					trows += '<td><button type="button" class="fm_mysql_btn fm_mysql_btn_sm fm_mysql_btn_primary" data-act="ov-table" data-name="' + EscapeHTML(t.name) + '">' + EscapeHTML(t.name) + '</button></td>';
					trows += '<td>' + EscapeHTML(t.type === 'VIEW' ? 'VIEW' : 'BASE TABLE') + '</td>';
					trows += '<td class="fm_mysql_row_actions">';
					trows += '<button type="button" class="fm_mysql_btn fm_mysql_btn_sm" data-act="ov-table-browse" data-name="' + EscapeHTML(t.name) + '">' + EscapeHTML(translate('Browse')) + '</button> ';
					trows += '<button type="button" class="fm_mysql_btn fm_mysql_btn_sm" data-act="ov-table-structure" data-name="' + EscapeHTML(t.name) + '">' + EscapeHTML(translate('Structure')) + '</button> ';
					trows += '<button type="button" class="fm_mysql_btn fm_mysql_btn_sm fm_mysql_btn_danger" data-act="ov-table-drop" data-name="' + EscapeHTML(t.name) + '">' + EscapeHTML(translate('Drop')) + '</button>';
					trows += '</td></tr>';
				});
				html += renderOverviewList(['', translate('Table'), translate('Type'), translate('Action')], trows);
				if (state.createSqlPreview) {
					html += '<h4 style="margin:16px 0 8px">' + EscapeHTML(translate('Show create')) + '</h4>';
					html += '<pre class="fm_mysql_codeblock">' + EscapeHTML(state.createSqlPreview) + '</pre>';
				}
				return html;
			}

			// Server level: list databases
			html += '<h3 style="margin:0 0 6px">' + EscapeHTML(s.name) + '</h3>';
			html += '<p style="margin:0 0 12px;color:#526074">' + EscapeHTML(s.user + '@' + s.host + ':' + s.port) + ' — ' + EscapeHTML(String(state.databases.length)) + ' ' + EscapeHTML(translate('databases')) + '</p>';
			if (!state.databases.length) {
				html += '<div class="fm_mysql_empty">' + EscapeHTML(translate('No databases.')) + '</div>';
				return html;
			}
			var drows = '';
			state.databases.forEach(function(db) {
				drows += '<tr>';
				drows += '<td><button type="button" class="fm_mysql_btn fm_mysql_btn_sm fm_mysql_btn_primary" data-act="ov-db" data-name="' + EscapeHTML(db) + '">' + EscapeHTML(db) + '</button></td>';
				drows += '<td class="fm_mysql_row_actions">';
				drows += '<button type="button" class="fm_mysql_btn fm_mysql_btn_sm" data-act="ov-db" data-name="' + EscapeHTML(db) + '">' + EscapeHTML(translate('Open')) + '</button> ';
				drows += '<button type="button" class="fm_mysql_btn fm_mysql_btn_sm fm_mysql_btn_danger" data-act="ov-db-drop" data-name="' + EscapeHTML(db) + '">' + EscapeHTML(translate('Drop')) + '</button>';
				drows += '</td></tr>';
			});
			html += renderOverviewList([translate('Database'), translate('Action')], drows);
			return html;
		};

		var renderBrowseTable = function() {
			var columns = state.browse.columns || [];
			var rows = state.browse.rows || [];
			var html = '';
			var selectedCount = 0;
			for (var sk in state.selected) {
				if (state.selected.hasOwnProperty(sk) && state.selected[sk])  selectedCount++;
			}

			html += '<div class="fm_mysql_table_wrap"><table class="fm_mysql_table"><thead><tr>';
			html += '<th class="fm_mysql_check_cell"><input type="checkbox" class="fm_mysql_row_check" data-act="select-all"' + (rows.length && selectedCount === rows.length ? ' checked' : '') + '></th>';
			html += '<th></th>';
			for (var c = 0; c < columns.length; c++)  html += '<th>' + EscapeHTML(columns[c]) + '</th>';
			html += '</tr></thead><tbody>';

			if (!rows.length) {
				html += '<tr><td colspan="' + (columns.length + 2) + '">' + EscapeHTML(translate('No rows.')) + '</td></tr>';
			}
			else {
				for (var r = 0; r < rows.length; r++) {
					var checked = !!state.selected[String(r)];
					html += '<tr data-row="' + r + '">';
					html += '<td class="fm_mysql_check_cell"><input type="checkbox" class="fm_mysql_row_check" data-act="select-row" data-row="' + r + '"' + (checked ? ' checked' : '') + '></td>';
					html += '<td class="fm_mysql_row_actions">';
					html += '<button type="button" class="fm_mysql_btn fm_mysql_btn_sm" data-act="edit-row" data-row="' + r + '">' + EscapeHTML(translate('Edit')) + '</button> ';
					html += '<button type="button" class="fm_mysql_btn fm_mysql_btn_sm fm_mysql_btn_danger" data-act="del-row" data-row="' + r + '">' + EscapeHTML(translate('Delete')) + '</button>';
					html += '</td>';
					for (var i = 0; i < columns.length; i++) {
						var key = columns[i];
						var editing = state.inlineEdit && state.inlineEdit.row === r && state.inlineEdit.col === key;
						if (editing) {
							html += '<td class="fm_mysql_cell_editing"><input type="text" data-inline-row="' + r + '" data-inline-col="' + EscapeHTML(key) + '" value="' + EscapeHTML(rows[r][key] === null ? '' : String(rows[r][key])) + '"></td>';
						}
						else {
							html += '<td data-act="cell-edit" data-row="' + r + '" data-col="' + EscapeHTML(key) + '" title="' + EscapeHTML(rows[r][key] === null ? 'NULL' : String(rows[r][key])) + '">' + renderCell(rows[r][key]) + '</td>';
						}
					}
					html += '</tr>';
				}
			}
			html += '</tbody></table></div>';

			var from = state.browse.total ? (state.browse.offset + 1) : 0;
			var to = Math.min(state.browse.offset + state.browse.limit, state.browse.total);
			html += '<div class="fm_mysql_pager">';
			html += '<span>' + EscapeHTML(translate('Rows') + ' ' + from + '–' + to + ' / ' + state.browse.total) + (selectedCount ? ' · ' + selectedCount + ' ' + translate('selected') : '') + '</span>';
			html += '<button type="button" class="fm_mysql_btn fm_mysql_btn_sm" data-act="prev"' + (state.browse.offset <= 0 ? ' disabled' : '') + '>' + EscapeHTML(translate('Prev')) + '</button>';
			html += '<button type="button" class="fm_mysql_btn fm_mysql_btn_sm" data-act="next"' + (state.browse.offset + state.browse.limit >= state.browse.total ? ' disabled' : '') + '>' + EscapeHTML(translate('Next')) + '</button>';
			html += '</div>';
			html += '<p style="margin:8px 0 0;color:#8A97A8;font-size:11px">' + EscapeHTML(translate('Tip: double-click or long-press a cell to quick-edit. Check rows for bulk delete.')) + '</p>';

			return html;
		};

		var renderStructureTable = function() {
			var cols = ['Field', 'Type', 'Collation', 'Null', 'Key', 'Default', 'Extra', 'Comment'];
			var rows = (state.structure.columns || []).map(function(c) {
				return { Field: c.Field, Type: c.Type, Collation: c.Collation, Null: c.Null, Key: c.Key, Default: c.Default, Extra: c.Extra, Comment: c.Comment };
			});
			var html = '<h4 style="margin:0 0 8px">' + EscapeHTML(translate('Columns')) + '</h4>';
			html += '<div class="fm_mysql_table_wrap"><table class="fm_mysql_table"><thead><tr>';
			for (var i = 0; i < cols.length; i++)  html += '<th>' + EscapeHTML(cols[i]) + '</th>';
			html += '</tr></thead><tbody>';
			rows.forEach(function(row) {
				html += '<tr>';
				cols.forEach(function(c) { html += '<td>' + renderCell(row[c]) + '</td>'; });
				html += '</tr>';
			});
			html += '</tbody></table></div>';

			var icols = ['Key_name', 'Column_name', 'Non_unique', 'Index_type'];
			html += '<h4 style="margin:16px 0 8px">' + EscapeHTML(translate('Indexes')) + '</h4>';
			html += '<div class="fm_mysql_table_wrap"><table class="fm_mysql_table"><thead><tr>';
			icols.forEach(function(c) { html += '<th>' + EscapeHTML(c) + '</th>'; });
			html += '</tr></thead><tbody>';
			(state.structure.indexes || []).forEach(function(row) {
				html += '<tr>';
				icols.forEach(function(c) { html += '<td>' + renderCell(row[c]) + '</td>'; });
				html += '</tr>';
			});
			html += '</tbody></table></div>';
			return html;
		};

		var renderEditForm = function() {
			var edit = state.edit;
			if (!edit)  return '';
			var columns = state.structure.columns.length ? state.structure.columns : (state.browse.columns || []).map(function(n) {
				return { Field: n, Type: '', Null: 'YES', Default: null, Extra: '' };
			});

			var html = '<h3 style="margin:0 0 12px">' + EscapeHTML(edit.mode === 'insert' ? translate('Insert row') : translate('Edit row')) + '</h3>';
			html += '<div class="fm_mysql_form_grid" id="fm_mysql_edit_form">';

			columns.forEach(function(col) {
				var name = col.Field || col;
				var val = edit.row.hasOwnProperty(name) ? edit.row[name] : (col.Default !== undefined ? col.Default : '');
				var isNull = (val === null);
				var display = isNull ? '' : (val === undefined ? '' : String(val));
				var typeHint = col.Type || '';

				html += '<label>' + EscapeHTML(name) + (typeHint ? '<span class="fm_mysql_field_hint">' + EscapeHTML(typeHint) + '</span>' : '') + '</label>';
				html += '<div class="fm_mysql_field_ctrl">';
				if (typeHint && /blob|text|json/i.test(typeHint)) {
					html += '<textarea name="col_' + EscapeHTML(name) + '" data-col="' + EscapeHTML(name) + '"' + (isNull ? ' disabled' : '') + '>' + EscapeHTML(display) + '</textarea>';
				}
				else {
					html += '<input type="text" name="col_' + EscapeHTML(name) + '" data-col="' + EscapeHTML(name) + '" value="' + EscapeHTML(display) + '"' + (isNull ? ' disabled' : '') + '>';
				}
				if (col.Null === 'YES') {
					html += '<label class="fm_mysql_check"><input type="checkbox" data-null="' + EscapeHTML(name) + '"' + (isNull ? ' checked' : '') + '><span>NULL</span></label>';
				}
				html += '</div>';
			});

			html += '<div class="fm_mysql_form_actions">';
			html += '<button type="button" class="fm_mysql_btn fm_mysql_btn_primary" data-act="save-row">' + EscapeHTML(translate('Go')) + '</button>';
			html += '<button type="button" class="fm_mysql_btn" data-act="cancel-edit">' + EscapeHTML(translate('Cancel')) + '</button>';
			html += '</div></div>';
			return html;
		};

		var renderContent = function() {
			var html = '';
			if (state.error)  html += '<div class="fm_mysql_error">' + EscapeHTML(state.error) + '</div>';
			if (state.message)  html += '<div class="fm_mysql_success">' + EscapeHTML(state.message) + '</div>';
			if (state.loading)  html += '<div class="fm_mysql_empty">' + EscapeHTML(translate('Loading…')) + '</div>';

			if (state.view === 'edit') {
				html += renderEditForm();
			}
			else if (state.view === 'browse') {
				if (!state.table)  html += '<div class="fm_mysql_empty">' + EscapeHTML(translate('Select a table.')) + '</div>';
				else {
					if (state.browse.sql)  html += '<div style="margin-bottom:8px;color:#6A7B8D;font-family:monospace;font-size:11px;word-break:break-all">' + EscapeHTML(state.browse.sql) + '</div>';
					html += renderBrowseTable();
				}
			}
			else if (state.view === 'structure') {
				if (!state.table)  html += '<div class="fm_mysql_empty">' + EscapeHTML(translate('Select a table.')) + '</div>';
				else  html += renderStructureTable();
			}
			else if (state.view === 'sql') {
				html += '<div class="fm_mysql_sql_area">';
				html += '<textarea id="fm_mysql_sql_input" spellcheck="false" placeholder="SELECT * FROM ...">' + EscapeHTML(state.sqlText) + '</textarea>';
				if (state.sqlResult && state.sqlResult.success) {
					html += '<div class="fm_mysql_success">' + EscapeHTML(translate('Done') + ' — ' + (state.sqlResult.elapsed_ms || 0) + ' ms') + '</div>';
					(state.sqlResult.sets || []).forEach(function(set, idx) {
						if (set.columns) {
							html += '<h4 style="margin:12px 0 8px">' + EscapeHTML(translate('Result') + ' #' + (idx + 1)) + '</h4>';
							html += '<div class="fm_mysql_table_wrap"><table class="fm_mysql_table"><thead><tr>';
							set.columns.forEach(function(c) { html += '<th>' + EscapeHTML(c) + '</th>'; });
							html += '</tr></thead><tbody>';
							(set.rows || []).forEach(function(row) {
								html += '<tr>';
								set.columns.forEach(function(c) { html += '<td>' + renderCell(row[c]) + '</td>'; });
								html += '</tr>';
							});
							html += '</tbody></table></div>';
						}
						else {
							html += '<div class="fm_mysql_success">' + EscapeHTML(translate('Affected rows') + ': ' + set.affected_rows) + '</div>';
						}
					});
				}
				html += '</div>';
			}
			else if (state.view === 'import') {
				html += '<h3 style="margin:0 0 10px">' + EscapeHTML(translate('Import')) + '</h3>';
				html += '<p style="margin:0 0 10px;color:#526074">' + EscapeHTML(translate('Paste SQL or choose a .sql file (max 8MB). Runs on the current server') + (state.database ? ' / ' + state.database : '') + '.)') + '</p>';
				html += '<div class="fm_mysql_import_area">';
				html += '<p style="margin:0 0 8px"><input type="file" id="fm_mysql_import_file" accept=".sql,.txt,text/plain,text/sql"></p>';
				html += '<textarea id="fm_mysql_import_sql" spellcheck="false" placeholder="CREATE TABLE ...; INSERT INTO ..."></textarea>';
				html += '</div>';
			}
			else if (state.view === 'export') {
				html += '<h3 style="margin:0 0 10px">' + EscapeHTML(translate('Export')) + '</h3>';
				if (!state.database) {
					html += '<div class="fm_mysql_empty">' + EscapeHTML(translate('Select a database first (or open a table).')) + '</div>';
				}
				else {
					html += '<p style="margin:0 0 10px;color:#526074">' + EscapeHTML(translate('Export checked tables, or the current table if none checked.')) + '</p>';
					html += '<div class="fm_mysql_multibar">';
					html += '<button type="button" class="fm_mysql_btn fm_mysql_btn_primary fm_mysql_btn_sm" data-act="export-sql-now">' + EscapeHTML(translate('Export SQL')) + '</button>';
					html += '<button type="button" class="fm_mysql_btn fm_mysql_btn_sm" data-act="export-csv-now">' + EscapeHTML(translate('Export CSV')) + '</button>';
					html += '</div>';
					var erows = '';
					state.tables.forEach(function(t) {
						var checked = !!state.selectedTables[t.name] || t.name === state.table;
						erows += '<tr><td class="fm_mysql_check_cell"><input type="checkbox" data-act="select-table" data-name="' + EscapeHTML(t.name) + '"' + (checked ? ' checked' : '') + '></td>';
						erows += '<td>' + EscapeHTML(t.name) + '</td></tr>';
					});
					html += renderOverviewList(['', translate('Table')], erows);
				}
			}
			else if (state.view === 'events') {
				html += '<h3 style="margin:0 0 10px">' + EscapeHTML(translate('Events')) + '</h3>';
				if (!(state.events || []).length) {
					html += '<div class="fm_mysql_empty">' + EscapeHTML(translate('No events (or EVENT privilege missing).')) + '</div>';
				}
				else {
					var evrows = '';
					state.events.forEach(function(ev) {
						var n = ev.Name || ev.EVENT_NAME || '';
						evrows += '<tr>';
						evrows += '<td>' + EscapeHTML(n) + '</td>';
						evrows += '<td>' + EscapeHTML(ev.Status || ev.STATUS || '') + '</td>';
						evrows += '<td>' + EscapeHTML(ev.Execute_at || ev.EXECUTE_AT || ev.Interval_value || '') + '</td>';
						evrows += '<td class="fm_mysql_row_actions">';
						evrows += '<button type="button" class="fm_mysql_btn fm_mysql_btn_sm" data-act="show-event" data-name="' + EscapeHTML(n) + '">' + EscapeHTML(translate('Show create')) + '</button> ';
						evrows += '<button type="button" class="fm_mysql_btn fm_mysql_btn_sm fm_mysql_btn_danger" data-act="drop-event" data-name="' + EscapeHTML(n) + '">' + EscapeHTML(translate('Drop')) + '</button>';
						evrows += '</td></tr>';
					});
					html += renderOverviewList([translate('Name'), translate('Status'), translate('Schedule'), translate('Action')], evrows);
				}
				if (state.createSqlPreview) {
					html += '<h4 style="margin:16px 0 8px">' + EscapeHTML(translate('Show create')) + '</h4>';
					html += '<pre class="fm_mysql_codeblock">' + EscapeHTML(state.createSqlPreview) + '</pre>';
				}
			}
			else if (state.view === 'triggers') {
				html += '<h3 style="margin:0 0 10px">' + EscapeHTML(translate('Triggers')) + '</h3>';
				if (!(state.triggers || []).length) {
					html += '<div class="fm_mysql_empty">' + EscapeHTML(translate('No triggers.')) + '</div>';
				}
				else {
					var trrows = '';
					state.triggers.forEach(function(tr) {
						var n = tr.Trigger || tr.TRIGGER_NAME || '';
						trrows += '<tr>';
						trrows += '<td>' + EscapeHTML(n) + '</td>';
						trrows += '<td>' + EscapeHTML(tr.Event || tr.EVENT_MANIPULATION || '') + '</td>';
						trrows += '<td>' + EscapeHTML(tr.Table || tr.EVENT_OBJECT_TABLE || '') + '</td>';
						trrows += '<td>' + EscapeHTML(tr.Timing || tr.ACTION_TIMING || '') + '</td>';
						trrows += '<td class="fm_mysql_row_actions">';
						trrows += '<button type="button" class="fm_mysql_btn fm_mysql_btn_sm" data-act="show-trigger" data-name="' + EscapeHTML(n) + '">' + EscapeHTML(translate('Show create')) + '</button> ';
						trrows += '<button type="button" class="fm_mysql_btn fm_mysql_btn_sm fm_mysql_btn_danger" data-act="drop-trigger" data-name="' + EscapeHTML(n) + '">' + EscapeHTML(translate('Drop')) + '</button>';
						trrows += '</td></tr>';
					});
					html += renderOverviewList([translate('Name'), translate('Event'), translate('Table'), translate('Timing'), translate('Action')], trrows);
				}
				if (state.createSqlPreview) {
					html += '<h4 style="margin:16px 0 8px">' + EscapeHTML(translate('Show create')) + '</h4>';
					html += '<pre class="fm_mysql_codeblock">' + EscapeHTML(state.createSqlPreview) + '</pre>';
				}
			}
			else {
				html += renderOverview();
			}

			content.innerHTML = html;
			bindContentActions();
		};

		var bindContentActions = function() {
			content.querySelectorAll('[data-null]').forEach(function(cb) {
				cb.addEventListener('change', function() {
					var name = cb.getAttribute('data-null');
					var input = content.querySelector('[data-col="' + name.replace(/"/g, '\\"') + '"]');
					if (input)  input.disabled = cb.checked;
				});
			});

			content.querySelectorAll('[data-inline-row]').forEach(function(input) {
				input.focus();
				input.select();
				var commit = function() {
					var r = parseInt(input.getAttribute('data-inline-row'), 10);
					var col = input.getAttribute('data-inline-col');
					saveInlineEdit(r, col, input.value);
				};
				input.addEventListener('keydown', function(e) {
					if (e.keyCode === 13) { e.preventDefault(); commit(); }
					if (e.keyCode === 27) { state.inlineEdit = null; render(); }
				});
				input.addEventListener('blur', function() { setTimeout(commit, 100); });
			});

			content.querySelectorAll('[data-act]').forEach(function(el) {
				el.addEventListener('click', function(e) {
					var act = el.getAttribute('data-act');
					var rowIdx = parseInt(el.getAttribute('data-row'), 10);
					var id = el.getAttribute('data-id');
					var name = el.getAttribute('data-name');
					var col = el.getAttribute('data-col');

					if (act === 'prev') {
						state.browse.offset = Math.max(0, state.browse.offset - state.browse.limit);
						state.selected = {};
						loadBrowse();
					}
					else if (act === 'next') {
						state.browse.offset += state.browse.limit;
						state.selected = {};
						loadBrowse();
					}
					else if (act === 'select-all') {
						var on = el.checked;
						state.selected = {};
						if (on) {
							for (var i = 0; i < state.browse.rows.length; i++)  state.selected[String(i)] = true;
						}
						render();
					}
					else if (act === 'select-row') {
						state.selected[String(rowIdx)] = !!el.checked;
						renderStatus();
					}
					else if (act === 'edit-row') {
						startEdit(state.browse.rows[rowIdx]);
					}
					else if (act === 'del-row') {
						if (!confirm(translate('Delete this row?')))  return;
						deleteRow(state.browse.rows[rowIdx]);
					}
					else if (act === 'save-row') {
						saveEditForm();
					}
					else if (act === 'cancel-edit') {
						state.edit = null;
						state.view = 'browse';
						render();
					}
					else if (act === 'ov-server') {
						selectServer(id);
					}
					else if (act === 'ov-edit-server') {
						var srv = null;
						for (var i = 0; i < state.servers.length; i++) {
							if (state.servers[i].id === id) { srv = state.servers[i]; break; }
						}
						if (srv)  showServerForm(srv);
					}
					else if (act === 'ov-del-server') {
						if (!confirm(translate('Delete this server configuration?')))  return;
						deleteServer(id);
					}
					else if (act === 'ov-db') {
						selectDatabase(name);
					}
					else if (act === 'ov-db-drop') {
						if (confirm(translate('Drop database') + ' "' + name + '"?'))  dropDatabase(name);
					}
					else if (act === 'ov-table') {
						selectTable(name);
					}
					else if (act === 'ov-table-browse') {
						state.table = name;
						state.edit = null;
						state.browse.offset = 0;
						state.browse.search = '';
						state.selected = {};
						state.structure = { columns: [], indexes: [] };
						state.view = 'browse';
						loadBrowse();
					}
					else if (act === 'ov-table-structure') {
						state.table = name;
						state.edit = null;
						state.structure = { columns: [], indexes: [] };
						state.view = 'structure';
						loadStructure();
					}
					else if (act === 'ov-table-rename') {
						state.table = name;
						renameTablePrompt();
					}
					else if (act === 'ov-table-export') {
						state.table = name;
						exportTable('sql');
					}
					else if (act === 'ov-table-drop') {
						if (confirm(translate('Drop table') + ' "' + name + '"?'))  dropTable(name);
					}
					else if (act === 'ov-browse') {
						state.view = 'browse';
						loadBrowse();
					}
					else if (act === 'ov-structure') {
						state.view = 'structure';
						loadStructure();
					}
					else if (act === 'ov-insert') {
						startInsert();
					}
					else if (act === 'ov-sql-table') {
						state.sqlText = 'SELECT * FROM `' + state.table.replace(/`/g, '``') + '` LIMIT 50';
						state.view = 'sql';
						render();
					}
					else if (act === 'ov-rename') {
						renameTablePrompt();
					}
					else if (act === 'ov-copy') {
						copyTablePrompt();
					}
					else if (act === 'ov-export') {
						var fmt = confirm(translate('OK = SQL export, Cancel = CSV export')) ? 'sql' : 'csv';
						exportTable(fmt);
					}
					else if (act === 'ov-empty') {
						truncateTablePrompt();
					}
					else if (act === 'ov-drop-table') {
						if (confirm(translate('Drop table') + ' "' + state.table + '"?'))  dropTable(state.table);
					}
					else if (act === 'select-all-tables') {
						state.selectedTables = {};
						if (el.checked) {
							state.tables.forEach(function(t) { state.selectedTables[t.name] = true; });
						}
						render();
					}
					else if (act === 'select-table') {
						state.selectedTables[name] = !!el.checked;
						renderStatus();
					}
					else if (act === 'run-table-mult') {
						runTableMultAction();
					}
					else if (act === 'export-sql-now') {
						exportSelectedOrCurrent('sql');
					}
					else if (act === 'export-csv-now') {
						exportSelectedOrCurrent('csv');
					}
					else if (act === 'show-event') {
						showCreateEvent(name);
					}
					else if (act === 'drop-event') {
						if (!confirm(translate('Drop event') + ' "' + name + '"?'))  return;
						request('mysql_drop_event', { server_id: state.serverId, database: state.database || '', name: name }, function(data) {
							if (!data.success) { setError(data.error || 'Error'); render(); return; }
							setMessage(translate('Event dropped.'));
							loadEvents();
						});
					}
					else if (act === 'show-trigger') {
						showCreateTrigger(name);
					}
					else if (act === 'drop-trigger') {
						if (!confirm(translate('Drop trigger') + ' "' + name + '"?'))  return;
						request('mysql_drop_trigger', { server_id: state.serverId, database: state.database || '', name: name }, function(data) {
							if (!data.success) { setError(data.error || 'Error'); render(); return; }
							setMessage(translate('Trigger dropped.'));
							loadTriggers();
						});
					}
				});

				if (el.getAttribute('data-act') === 'cell-edit') {
					var startCellEdit = function(e) {
						if (e)  e.preventDefault();
						var r = parseInt(el.getAttribute('data-row'), 10);
						var c = el.getAttribute('data-col');
						state.inlineEdit = { row: r, col: c };
						render();
					};

					el.addEventListener('dblclick', startCellEdit);

					// Mobile: long-press (~450ms) or double-tap.
					var pressTimer = null;
					var lastTap = 0;
					el.addEventListener('touchstart', function(e) {
						if (pressTimer)  clearTimeout(pressTimer);
						pressTimer = setTimeout(function() {
							pressTimer = null;
							startCellEdit(e);
						}, 450);
					}, { passive: true });
					el.addEventListener('touchend', function(e) {
						if (pressTimer) {
							clearTimeout(pressTimer);
							pressTimer = null;
							var now = Date.now();
							if (now - lastTap < 350) {
								startCellEdit(e);
								lastTap = 0;
							}
							else  lastTap = now;
						}
					});
					el.addEventListener('touchmove', function() {
						if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; }
					}, { passive: true });
					el.addEventListener('touchcancel', function() {
						if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; }
					});
				}
			});

			var fileInput = content.querySelector('#fm_mysql_import_file');
			if (fileInput) {
				fileInput.addEventListener('change', function() {
					var f = fileInput.files && fileInput.files[0];
					if (!f)  return;
					var reader = new FileReader();
					reader.onload = function() {
						var ta = content.querySelector('#fm_mysql_import_sql');
						if (ta)  ta.value = String(reader.result || '');
					};
					reader.readAsText(f);
				});
			}
		};

		var renderStatus = function() {
			var parts = [];
			if (state.status)  parts.push(state.status);
			else if (state.loading)  parts.push(translate('Loading…'));
			else if (state.table && state.view === 'browse') {
				parts.push(translate('Rows') + ': ' + state.browse.total);
				var sel = 0;
				for (var k in state.selected) {
					if (state.selected[k])  sel++;
				}
				if (sel)  parts.push(sel + ' ' + translate('selected'));
				if (state.browse.search)  parts.push(translate('Search') + ': ' + state.browse.search);
			}
			else if (state.database)  parts.push(state.tables.length + ' ' + translate('tables'));
			else if (state.serverId)  parts.push(state.databases.length + ' ' + translate('databases'));
			statusbar.innerHTML = '<span>' + EscapeHTML(parts.join(' · ') || translate('Ready')) + '</span>';
		};

		var render = function() {
			if (state.table && state.view === 'welcome') {
				state.view = 'browse';
				loadBrowse();
				return;
			}
			renderNav();
			renderSidebar();
			renderTabs();
			renderToolbar();
			renderContent();
			renderStatus();
		};

		var startInsert = function() {
			var ensureStructure = function() {
				var row = {};
				(state.structure.columns || []).forEach(function(c) {
					row[c.Field] = (c.Default !== undefined && c.Default !== null) ? c.Default : null;
				});
				if (!(state.structure.columns || []).length) {
					(state.browse.columns || []).forEach(function(c) { row[c] = null; });
				}
				state.edit = { mode: 'insert', row: row, where: null };
				state.view = 'edit';
				render();
			};

			if (!(state.structure.columns || []).length && state.table) {
				request('mysql_table_structure', {
					server_id: state.serverId,
					database: state.database,
					table: state.table
				}, function(data) {
					if (data.success) {
						state.structure.columns = data.columns || [];
						state.structure.indexes = data.indexes || [];
					}
					ensureStructure();
				});
			}
			else  ensureStructure();
		};

		var startEdit = function(row) {
			if (!row)  return;
			var ensureStructure = function() {
				state.edit = { mode: 'edit', row: Object.assign({}, row), where: rowWhere(row) };
				state.view = 'edit';
				render();
			};

			if (!(state.structure.columns || []).length && state.table) {
				request('mysql_table_structure', {
					server_id: state.serverId,
					database: state.database,
					table: state.table
				}, function(data) {
					if (data.success) {
						state.structure.columns = data.columns || [];
						state.structure.indexes = data.indexes || [];
					}
					ensureStructure();
				});
			}
			else  ensureStructure();
		};

		var saveEditForm = function() {
			var values = {};
			var nulls = {};
			content.querySelectorAll('[data-col]').forEach(function(input) {
				var col = input.getAttribute('data-col');
				var nullCb = content.querySelector('[data-null="' + col.replace(/"/g, '\\"') + '"]');
				if (nullCb && nullCb.checked) {
					nulls[col] = 1;
					values[col] = '';
				}
				else {
					values[col] = input.value;
				}
			});

			state.loading = true;
			render();

			if (state.edit.mode === 'insert') {
				request('mysql_insert_row', {
					server_id: state.serverId,
					database: state.database,
					table: state.table,
					values: JSON.stringify(values),
					nulls: JSON.stringify(nulls)
				}, function(data) {
					state.loading = false;
					if (!data.success) { setError(data.error || 'Error'); render(); return; }
					setMessage(translate('Row inserted.'));
					state.edit = null;
					state.view = 'browse';
					loadBrowse();
				});
			}
			else {
				request('mysql_update_row', {
					server_id: state.serverId,
					database: state.database,
					table: state.table,
					values: JSON.stringify(values),
					nulls: JSON.stringify(nulls),
					where: JSON.stringify(state.edit.where)
				}, function(data) {
					state.loading = false;
					if (!data.success) { setError(data.error || 'Error'); render(); return; }
					setMessage(translate('Row updated.'));
					state.edit = null;
					state.view = 'browse';
					loadBrowse();
				});
			}
		};

		var deleteRow = function(row) {
			request('mysql_delete_row', {
				server_id: state.serverId,
				database: state.database,
				table: state.table,
				where: JSON.stringify(rowWhere(row))
			}, function(data) {
				if (!data.success) { setError(data.error || 'Error'); render(); return; }
				setMessage(translate('Row deleted.'));
				loadBrowse();
			});
		};

		var showServerForm = function(existing) {
			state.view = 'welcome';
			state.edit = null;
			state.error = '';
			state.message = '';
			renderNav();
			renderSidebar();
			renderTabs();
			toolbar.style.display = 'none';
			toolbar.innerHTML = '';

			var isEdit = !!(existing && existing.id);
			var html = '<h3 style="margin:0 0 12px">' + EscapeHTML(isEdit ? translate('Edit server') : translate('Add server')) + '</h3>';
			html += '<div class="fm_mysql_form_grid">';
			html += '<label>' + EscapeHTML(translate('Name')) + '</label><input type="text" name="name" value="' + EscapeHTML(existing ? existing.name : '') + '">';
			html += '<label>' + EscapeHTML(translate('Host')) + '</label><input type="text" name="host" value="' + EscapeHTML(existing ? existing.host : '127.0.0.1') + '" autocomplete="off">';
			html += '<label>' + EscapeHTML(translate('Port')) + '</label><input type="number" name="port" value="' + EscapeHTML(String(existing ? existing.port : 3306)) + '">';
			html += '<label>' + EscapeHTML(translate('User')) + '</label><input type="text" name="user" value="' + EscapeHTML(existing ? existing.user : '') + '" autocomplete="off">';
			html += '<label>' + EscapeHTML(translate('Password')) + '</label><input type="password" name="password" value="" placeholder="' + EscapeHTML(isEdit ? translate('Leave blank to keep') : '') + '" autocomplete="new-password">';
			html += '<label>' + EscapeHTML(translate('Default DB')) + '</label><input type="text" name="database" value="' + EscapeHTML(existing && existing.database ? existing.database : '') + '">';
			html += '<div class="fm_mysql_form_actions">';
			html += '<button type="button" class="fm_mysql_btn fm_mysql_btn_primary" data-act="save">' + EscapeHTML(translate('Save')) + '</button>';
			html += '<button type="button" class="fm_mysql_btn" data-act="test">' + EscapeHTML(translate('Test connection')) + '</button>';
			html += '<button type="button" class="fm_mysql_btn" data-act="cancel">' + EscapeHTML(translate('Cancel')) + '</button>';
			html += '</div></div><div id="fm_mysql_form_msg"></div>';

			content.innerHTML = html;
			renderStatus();

			var getFields = function() {
				return {
					id: isEdit ? existing.id : '',
					name: content.querySelector('[name="name"]').value,
					host: content.querySelector('[name="host"]').value,
					port: content.querySelector('[name="port"]').value,
					user: content.querySelector('[name="user"]').value,
					password: content.querySelector('[name="password"]').value,
					database: content.querySelector('[name="database"]').value,
					keep_password: (isEdit && content.querySelector('[name="password"]').value === '') ? '1' : '0'
				};
			};

			var msg = content.querySelector('#fm_mysql_form_msg');

			content.querySelector('[data-act="cancel"]').addEventListener('click', function() {
				state.view = 'welcome';
				render();
			});

			content.querySelector('[data-act="save"]').addEventListener('click', function() {
				var fields = getFields();
				request('mysql_save_server', fields, function(data) {
					if (!data.success) {
						msg.innerHTML = '<div class="fm_mysql_error">' + EscapeHTML(data.error || 'Error') + '</div>';
						return;
					}
					state.servers = data.servers || [];
					state.serverId = data.id;
					setMessage(translate('Server saved.'));
					loadDatabases();
				});
			});

			content.querySelector('[data-act="test"]').addEventListener('click', function() {
				var fields = getFields();
				var payload = {
					host: fields.host,
					port: fields.port,
					user: fields.user,
					password: fields.password,
					database: fields.database
				};
				if (isEdit && fields.password === '')  payload = { server_id: existing.id };
				request('mysql_test_connection', payload, function(data) {
					if (!data.success) {
						msg.innerHTML = '<div class="fm_mysql_error">' + EscapeHTML(data.error || 'Error') + '</div>';
						return;
					}
					var info = data.info || {};
					msg.innerHTML = '<div class="fm_mysql_success">' + EscapeHTML(translate('Connected') + ': ' + (info.server_info || '') + ' — ' + (info.host_info || '')) + '</div>';
				});
			});
		};

		var saveInlineEdit = function(rowIdx, col, value) {
			if (!state.inlineEdit || state.inlineEdit.row !== rowIdx || state.inlineEdit.col !== col)  return;
			var row = state.browse.rows[rowIdx];
			if (!row) { state.inlineEdit = null; return; }
			if (String(row[col] === null ? '' : row[col]) === String(value)) {
				state.inlineEdit = null;
				render();
				return;
			}

			var values = {};
			values[col] = value;
			request('mysql_update_row', {
				server_id: state.serverId,
				database: state.database,
				table: state.table,
				values: JSON.stringify(values),
				nulls: JSON.stringify({}),
				where: JSON.stringify(rowWhere(row))
			}, function(data) {
				state.inlineEdit = null;
				if (!data.success) { setError(data.error || 'Error'); render(); return; }
				row[col] = value;
				setMessage(translate('Cell updated.'));
				render();
			});
		};

		var bulkDeleteSelected = function() {
			var rows = [];
			for (var k in state.selected) {
				if (!state.selected[k])  continue;
				var idx = parseInt(k, 10);
				if (state.browse.rows[idx])  rows.push(rowWhere(state.browse.rows[idx]));
			}
			if (!rows.length) {
				setError(translate('No rows selected.'));
				render();
				return;
			}
			if (!confirm(translate('Delete') + ' ' + rows.length + ' ' + translate('selected rows') + '?'))  return;

			request('mysql_bulk_delete_rows', {
				server_id: state.serverId,
				database: state.database,
				table: state.table,
				rows: JSON.stringify(rows)
			}, function(data) {
				if (!data.success) { setError(data.error || 'Error'); render(); return; }
				state.selected = {};
				setMessage(translate('Deleted') + ': ' + (data.affected_rows || 0));
				loadBrowse();
			});
		};

		var exportTable = function(format) {
			if (!state.table)  return;
			request('mysql_export_table', {
				server_id: state.serverId,
				database: state.database,
				table: state.table,
				format: format || 'sql'
			}, function(data) {
				if (!data.success) { setError(data.error || 'Error'); render(); return; }
				downloadText(data.filename || (state.table + '.' + format), data.content || '', format === 'csv' ? 'text/csv;charset=utf-8' : 'application/sql;charset=utf-8');
				setMessage(translate('Export ready.'));
				render();
			});
		};

		var renameTablePrompt = function() {
			if (!state.table)  return;
			var name = prompt(translate('New table name:'), state.table);
			if (!name || name === state.table)  return;
			request('mysql_rename_table', {
				server_id: state.serverId,
				database: state.database,
				table: state.table,
				new_name: name
			}, function(data) {
				if (!data.success) { setError(data.error || 'Error'); render(); return; }
				state.table = data.new_name || name;
				setMessage(translate('Table renamed.'));
				loadTables();
			});
		};

		var truncateTablePrompt = function() {
			if (!state.table)  return;
			if (!confirm(translate('Empty (TRUNCATE) table') + ' "' + state.table + '"?\n' + translate('All rows will be deleted.')))  return;
			request('mysql_truncate_table', {
				server_id: state.serverId,
				database: state.database,
				table: state.table
			}, function(data) {
				if (!data.success) { setError(data.error || 'Error'); render(); return; }
				setMessage(translate('Table emptied.'));
				if (state.view === 'browse')  loadBrowse();
				else  render();
			});
		};

		var copyTablePrompt = function() {
			if (!state.table)  return;
			var name = prompt(translate('Copy to new table name:'), state.table + '_copy');
			if (!name)  return;
			var withData = confirm(translate('OK = copy structure + data, Cancel = structure only'));
			request('mysql_copy_table', {
				server_id: state.serverId,
				database: state.database,
				table: state.table,
				new_name: name,
				with_data: withData ? '1' : '0'
			}, function(data) {
				if (!data.success) { setError(data.error || 'Error'); render(); return; }
				setMessage(translate('Table copied.'));
				loadTables();
			});
		};

		var getSelectedTableNames = function() {
			var names = [];
			for (var k in state.selectedTables) {
				if (state.selectedTables[k])  names.push(k);
			}
			return names;
		};

		var runTableMultAction = function() {
			var sel = content.querySelector('#fm_mysql_table_mult');
			var op = sel ? sel.value : '';
			if (!op) {
				setError(translate('Choose an action.'));
				render();
				return;
			}
			var tables = getSelectedTableNames();
			if (!tables.length) {
				setError(translate('No tables selected.'));
				render();
				return;
			}

			var payload = {
				server_id: state.serverId,
				database: state.database,
				op: op,
				tables: JSON.stringify(tables)
			};

			if (op === 'export') {
				var done = 0;
				tables.forEach(function(t) {
					var prev = state.table;
					state.table = t;
					request('mysql_export_table', {
						server_id: state.serverId,
						database: state.database,
						table: t,
						format: 'sql'
					}, function(data) {
						done++;
						if (data.success)  downloadText(data.filename || (t + '.sql'), data.content || '', 'application/sql;charset=utf-8');
						if (done >= tables.length) {
							state.table = prev;
							setMessage(translate('Export finished.'));
							render();
						}
					});
				});
				return;
			}

			if (op === 'add_prefix_tbl' || op === 'replace_prefix_tbl' || op === 'copy_tbl_change_prefix') {
				var prefix = prompt(translate('Prefix:'));
				if (prefix === null || prefix === '')  return;
				payload.prefix = prefix;
				if (op !== 'add_prefix_tbl') {
					var fromPrefix = prompt(translate('Current prefix to replace (optional):'), '');
					if (fromPrefix === null)  return;
					payload.from_prefix = fromPrefix;
				}
			}

			if (op === 'drop_tbl' || op === 'empty_tbl') {
				if (!confirm(translate('Apply') + ' "' + op + '" ' + translate('to') + ' ' + tables.length + ' ' + translate('tables') + '?'))  return;
			}

			request('mysql_table_ops', payload, function(data) {
				if (!data.success && !(data.results && data.results.length)) {
					setError(data.error || 'Error');
					render();
					return;
				}

				if (op === 'show_create') {
					var blocks = [];
					(data.results || []).forEach(function(r) {
						if (r.success && r.create_sql)  blocks.push('-- ' + r.table + '\n' + r.create_sql + ';');
					});
					state.createSqlPreview = blocks.join('\n\n');
					setMessage(translate('Show create ready.'));
					state.view = 'welcome';
					render();
					return;
				}

				var fails = (data.results || []).filter(function(r) { return !r.success; });
				if (fails.length)  setError(fails.map(function(f) { return f.table + ': ' + (f.error || 'fail'); }).join('\n'));
				else  setMessage(translate('Done') + ' (' + tables.length + ')');
				state.selectedTables = {};
				loadTables();
			});
		};

		var exportSelectedOrCurrent = function(format) {
			var tables = getSelectedTableNames();
			if (!tables.length && state.table)  tables = [state.table];
			if (!tables.length) {
				setError(translate('No tables selected.'));
				render();
				return;
			}
			var done = 0;
			tables.forEach(function(t) {
				request('mysql_export_table', {
					server_id: state.serverId,
					database: state.database,
					table: t,
					format: format || 'sql'
				}, function(data) {
					done++;
					if (data.success) {
						downloadText(data.filename || (t + '.' + format), data.content || '', format === 'csv' ? 'text/csv;charset=utf-8' : 'application/sql;charset=utf-8');
					}
					if (done >= tables.length) {
						setMessage(translate('Export finished.'));
						render();
					}
				});
			});
		};

		var runImport = function() {
			var ta = content.querySelector('#fm_mysql_import_sql');
			var sql = ta ? ta.value : '';
			if (!String(sql).trim()) {
				setError(translate('No SQL to import.'));
				render();
				return;
			}
			if (!confirm(translate('Run this SQL import?')))  return;
			request('mysql_import_sql', {
				server_id: state.serverId,
				database: state.database || '',
				sql: sql
			}, function(data) {
				if (!data.success) { setError(data.error || 'Error'); render(); return; }
				setMessage(translate('Import done') + ' — ' + (data.statements || 0) + ' ' + translate('statements') + ' / ' + (data.elapsed_ms || 0) + ' ms');
				if (state.database)  loadTables();
				else  loadDatabases();
			});
		};

		var loadEvents = function() {
			state.loading = true;
			state.createSqlPreview = '';
			render();
			request('mysql_list_events', { server_id: state.serverId, database: state.database || '' }, function(data) {
				state.loading = false;
				if (!data.success) { setError(data.error || 'Error'); state.events = []; render(); return; }
				setError('');
				state.events = data.events || [];
				state.view = 'events';
				render();
			});
		};

		var loadTriggers = function() {
			state.loading = true;
			state.createSqlPreview = '';
			render();
			request('mysql_list_triggers', { server_id: state.serverId, database: state.database || '' }, function(data) {
				state.loading = false;
				if (!data.success) { setError(data.error || 'Error'); state.triggers = []; render(); return; }
				setError('');
				state.triggers = data.triggers || [];
				state.view = 'triggers';
				render();
			});
		};

		var showCreateEvent = function(name) {
			request('mysql_show_create_event', { server_id: state.serverId, database: state.database || '', name: name }, function(data) {
				if (!data.success) { setError(data.error || 'Error'); render(); return; }
				state.createSqlPreview = data.create_sql || '';
				render();
			});
		};

		var showCreateTrigger = function(name) {
			request('mysql_show_create_trigger', { server_id: state.serverId, database: state.database || '', name: name }, function(data) {
				if (!data.success) { setError(data.error || 'Error'); render(); return; }
				state.createSqlPreview = data.create_sql || '';
				render();
			});
		};

		var selectServer = function(id) {
			state.serverId = id;
			state.database = '';
			state.tables = [];
			state.table = '';
			state.view = 'welcome';
			state.edit = null;
			setError('');
			loadDatabases();
		};

		var selectDatabase = function(db) {
			state.database = db;
			state.table = '';
			state.view = 'welcome';
			state.edit = null;
			state.selectedTables = {};
			state.createSqlPreview = '';
			loadTables();
		};

		var selectTable = function(name) {
			state.table = name;
			state.view = 'browse';
			state.edit = null;
			state.browse.offset = 0;
			state.browse.search = '';
			state.selected = {};
			state.structure = { columns: [], indexes: [] };
			state.createSqlPreview = '';
			loadBrowse();
		};

		var loadServers = function() {
			state.loading = true;
			render();
			request('mysql_list_servers', {}, function(data) {
				state.loading = false;
				if (!data.success) { setError(data.error || 'Error'); render(); return; }
				if (data.mysqli === false)  setError(translate('PHP mysqli extension is not available on this server.'));
				state.servers = data.servers || [];
				render();
			});
		};

		var loadDatabases = function() {
			if (!state.serverId) { render(); return; }
			state.loading = true;
			render();
			request('mysql_list_databases', { server_id: state.serverId }, function(data) {
				state.loading = false;
				if (!data.success) {
					setError(data.error || 'Error');
					state.databases = [];
					render();
					return;
				}
				setError('');
				state.databases = data.databases || [];
				var srv = currentServer();
				if (!state.database && srv && srv.database && state.databases.indexOf(srv.database) >= 0) {
					state.database = srv.database;
					loadTables();
					return;
				}
				render();
			});
		};

		var loadTables = function() {
			if (!state.serverId || !state.database) { render(); return; }
			state.loading = true;
			render();
			request('mysql_list_tables', { server_id: state.serverId, database: state.database }, function(data) {
				state.loading = false;
				if (!data.success) {
					setError(data.error || 'Error');
					state.tables = [];
					render();
					return;
				}
				setError('');
				state.tables = data.tables || [];
				render();
			});
		};

		var loadBrowse = function() {
			if (!state.serverId || !state.database || !state.table) { render(); return; }
			state.loading = true;
			render();
			request('mysql_browse_table', {
				server_id: state.serverId,
				database: state.database,
				table: state.table,
				offset: state.browse.offset,
				limit: state.browse.limit,
				search: state.browse.search || ''
			}, function(data) {
				state.loading = false;
				if (!data.success) { setError(data.error || 'Error'); render(); return; }
				setError('');
				state.browse.columns = data.columns || [];
				state.browse.rows = data.rows || [];
				state.browse.total = data.total || 0;
				state.browse.offset = data.offset || 0;
				state.browse.limit = data.limit || 50;
				state.browse.sql = data.sql || '';
				state.browse.search = data.search || state.browse.search || '';
				state.browse.primary_keys = data.primary_keys || [];
				state.selected = {};
				state.inlineEdit = null;
				state.view = 'browse';
				render();
			});
		};

		var loadStructure = function() {
			if (!state.serverId || !state.database || !state.table) { render(); return; }
			state.loading = true;
			render();
			request('mysql_table_structure', {
				server_id: state.serverId,
				database: state.database,
				table: state.table
			}, function(data) {
				state.loading = false;
				if (!data.success) { setError(data.error || 'Error'); render(); return; }
				setError('');
				state.structure.columns = data.columns || [];
				state.structure.indexes = data.indexes || [];
				state.view = 'structure';
				render();
			});
		};

		var runSql = function() {
			if (!state.serverId)  return;
			state.loading = true;
			render();
			request('mysql_query', {
				server_id: state.serverId,
				database: state.database || '',
				sql: state.sqlText
			}, function(data) {
				state.loading = false;
				state.sqlResult = data;
				if (!data.success)  setError(data.error || 'Error');
				else  setError('');
				state.view = 'sql';
				render();
				if (data.success) {
					if (state.database)  loadTables();
					else  loadDatabases();
				}
			});
		};

		var createDatabasePrompt = function() {
			if (!state.serverId)  return;
			var name = prompt(translate('New database name:'));
			if (!name)  return;
			request('mysql_create_database', { server_id: state.serverId, name: name }, function(data) {
				if (!data.success) { setError(data.error || 'Error'); render(); return; }
				setMessage(translate('Database created.'));
				loadDatabases();
			});
		};

		var dropDatabase = function(name) {
			request('mysql_drop_database', { server_id: state.serverId, name: name }, function(data) {
				if (!data.success) { setError(data.error || 'Error'); render(); return; }
				if (state.database === name) {
					state.database = '';
					state.tables = [];
					state.table = '';
				}
				setMessage(translate('Database dropped.'));
				loadDatabases();
			});
		};

		var dropTable = function(name) {
			request('mysql_drop_table', { server_id: state.serverId, database: state.database, table: name }, function(data) {
				if (!data.success) { setError(data.error || 'Error'); render(); return; }
				if (state.table === name)  state.table = '';
				setMessage(translate('Table dropped.'));
				loadTables();
			});
		};

		var deleteServer = function(id) {
			request('mysql_delete_server', { id: id }, function(data) {
				if (!data.success) { setError(data.error || 'Error'); render(); return; }
				state.servers = data.servers || [];
				if (state.serverId === id) {
					state.serverId = null;
					state.databases = [];
					state.database = '';
					state.tables = [];
					state.table = '';
				}
				setMessage(translate('Server deleted.'));
				render();
			});
		};

		$this.Position = function(left, top, fullscreen) {
			root.style.left = (left != null ? left : 0) + 'px';
			root.style.top = (top != null ? top : 0) + 'px';
			if (fullscreen)  root.classList.add('fm_file_editor_fullscreen');
			else  root.classList.remove('fm_file_editor_fullscreen');
		};

		$this.Show = function() {
			root.classList.remove('fm_file_editor_hidden');
			closeSidebarMobile();
			loadServers();
		};

		$this.Hide = function() {
			root.classList.add('fm_file_editor_hidden');
			closeSidebarMobile();
			document.querySelectorAll('.fm_mysql_more_menu_body').forEach(function(m) {
				m.classList.add('fm_file_editor_hidden');
				m.classList.remove('fm_mysql_more_menu_fixed');
			});
		};

		$this.IsVisible = function() {
			return !root.classList.contains('fm_file_editor_hidden');
		};

		$this.Toggle = function() {
			if ($this.IsVisible())  $this.Hide();
			else  $this.Show();
		};

		$this.ContainsNode = function(node) {
			return !!(node && root.contains(node));
		};

		$this.Destroy = function() {
			window.removeEventListener('resize', onResize);
			document.removeEventListener('mousedown', onDocMouseDown, true);
			document.querySelectorAll('.fm_mysql_more_menu_body').forEach(function(m) {
				if (m.parentNode)  m.parentNode.removeChild(m);
			});
			if (root.parentNode)  root.parentNode.removeChild(root);
		};

		var onResize = function() {
			if ($this.IsVisible() && typeof opts.onreposition === 'function')  opts.onreposition();
		};

		var closeMoreMenus = function() {
			document.querySelectorAll('.fm_mysql_more_menu_body').forEach(function(m) {
				m.classList.add('fm_file_editor_hidden');
				m.classList.remove('fm_mysql_more_menu_fixed');
			});
		};

		var onDocMouseDown = function(e) {
			var t = e.target;
			var moreMenuHit = t.closest && t.closest('.fm_mysql_more_menu_body');
			var moreBtnHit = t.closest && t.closest('.fm_mysql_more_btn');

			// Close floating More menu when clicking outside it / its button.
			if (!moreMenuHit && !moreBtnHit)  closeMoreMenus();

			if (!$this.IsVisible())  return;
			if (!e.isTrusted)  return;
			if (root.contains(t) || moreMenuHit)  return;
			if (t.closest && t.closest('.fm_file_editor_open_mysql_wrap'))  return;
			if (t.closest && (t.closest('.fm_modal_overlay') || t.closest('.fe_fileexplorer_popup_wrap')))  return;
			$this.Hide();
		};

		window.addEventListener('resize', onResize);
		document.addEventListener('mousedown', onDocMouseDown, true);

		backdrop.addEventListener('click', closeSidebarMobile);

		root.addEventListener('keydown', function(e) {
			if (e.keyCode === 27) {
				if (state.sidebarOpen)  closeSidebarMobile();
				else if (state.inlineEdit) { state.inlineEdit = null; render(); }
				else  $this.Hide();
			}
		});

		render();
	};
})();
