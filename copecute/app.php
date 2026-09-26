<?php
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

	 if (!defined("COPE_BOOTSTRAPPED"))  require_once __DIR__ . "/bootstrap.php";
	require_once COPE_DIR . "/security.php";

	CopeSecurity_Headers();

	if (!is_file(COPE_CONFIG))
	{
		header("Location: " . CopeUrl_Install(), true, 302);
		exit();
	}

	require_once COPE_PHP . "/str_basics.php";
	require_once COPE_PHP . "/page_basics.php";

	Str::ProcessAllInput();

	require_once COPE_CONFIG;

	$rootpath = COPE_DIR;
	$webroot = COPE_WEB_ROOT;

	$bb_randpage = $config["token_secret"];
	$bb_rootname = "File Manager";

	$bb_usertoken = "";
	$bb_username = "";
	$admin_version = array(1, 0, 0);

	CopeSession_Start();

	// Optional external auth: index_hook.php may set $_SESSION["fm_admin_logged_in"] = true
	// (or exit). Presence of the file alone is NOT authentication.
	if (file_exists(COPE_DIR . "/index_hook.php"))  require_once COPE_DIR . "/index_hook.php";

	if (empty($_SESSION["fm_admin_logged_in"]))
	{
		$rate = CopeLogin_CheckRateLimit();

		if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST["password"]))
		{
			$csrf_ok = (isset($_POST["login_csrf"], $_SESSION["fm_login_csrf"]) && hash_equals((string)$_SESSION["fm_login_csrf"], (string)$_POST["login_csrf"]));

			if (!$rate["allowed"])
			{
				BB_SetPageMessage("error", "Too many failed login attempts. Try again in " . max(1, (int)ceil($rate["retry_after"] / 60)) . " minute(s).");
			}
			else if (!$csrf_ok)
			{
				BB_SetPageMessage("error", "Invalid login token. Refresh the page and try again.");
			}
			else if ($config["password"] === false || !is_string($config["password"]) || $config["password"] === "")
			{
				BB_SetPageMessage("error", "No login password is configured. Set password in copecute/config.php or reinstall.");
			}
			else if (!password_verify((string)$_POST["password"], $config["password"]))
			{
				CopeLogin_RecordFailure();
				usleep(250000);
				BB_SetPageMessage("error", "Invalid password. Check your credentials and try again.");
			}
			else
			{
				CopeLogin_ClearFailures();
				session_regenerate_id(true);
				$_SESSION["fm_admin_logged_in"] = true;
				unset($_SESSION["fm_login_csrf"]);

				header("Location: " . BB_GetFullRequestURLBase());
				exit();
			}
		}

		if (empty($_SESSION["fm_login_csrf"]))  $_SESSION["fm_login_csrf"] = bin2hex(random_bytes(32));
		$login_csrf = $_SESSION["fm_login_csrf"];

		$bb_page_layout_no_menu = '<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<link rel="icon" href="' . htmlspecialchars(COPE_IMG_URL) . '/favicon.ico" type="image/x-icon">
<title>@TITLE@</title>
<link rel="stylesheet" href="@ROOTURL@/' . COPE_CSS_URL . '/admin.css?v=' . @filemtime(COPE_CSS . "/admin.css") . '" type="text/css" media="all" />
<link rel="stylesheet" href="@ROOTURL@/' . COPE_CSS_URL . '/login.css?v=' . @filemtime(COPE_CSS . "/login.css") . '" type="text/css" media="all" />
<script type="text/javascript" src="@ROOTURL@/' . COPE_JS_URL . '/jquery-3.5.0.min.js"></script>
</head>
<body class="fm_login_body">
<!--fm_session_login-->
<div id="contentwrap" class="nomenu" tabindex="-1">
<div class="fm_login_shell">
	<div class="fm_login_brand">
		<div class="fm_login_mark" aria-hidden="true"></div>
		<div class="fm_login_brand_name">Cope Manager</div>
		<div class="fm_login_brand_sub">Sign in to continue</div>
	</div>
	<div class="fm_login_card">@CONTENT@</div>
	<div class="fm_login_footer">Forgot password? Reset the <code>password</code> hash via a trusted shell · Session cookies are HttpOnly</div>
</div>
</div>
<script>document.querySelector("input[name=password]")&&document.querySelector("input[name=password]").focus();</script>
</body>
</html>';

		$contentopts = array(
			"desc" => "Enter the password set during installation.",
			"fields" => array(
				array(
					"type" => "hidden",
					"name" => "login_csrf",
					"value" => $login_csrf,
					"default" => $login_csrf
				),
				array(
					"title" => "Password",
					"type" => "password",
					"name" => "password",
					"default" => ""
				),
			),
			"submit" => "Sign in"
		);

		BB_GeneratePage("Login", array(), $contentopts);

		exit();
	}

	// Bind CSRF tokens to this session.
	$bb_usertoken = session_id();

	BB_ProcessPageToken("action");

	// Ensure newer config keys exist with safe defaults.
	if (!isset($config["file_exts_mode"]))  $config["file_exts_mode"] = "allow";
	if (!isset($config["mysql_servers"]) || !is_array($config["mysql_servers"]))  $config["mysql_servers"] = array();
	if (!isset($config["hide_manager"]))  $config["hide_manager"] = true;

	$FM_WriteConfig = function($newconfig) {
		return CopeConfig_Write($newconfig);
	};

	// Heartbeat.
	if (isset($_REQUEST["action"]) && $_REQUEST["action"] == "heartbeat")
	{
		$_SESSION["lastts"] = time();

		echo "OK";

		exit();
	}

	// Logout.
	if (isset($_REQUEST["action"]) && $_REQUEST["action"] == "logout")
	{
		CopeSession_Destroy();

		header("Content-Type: application/json");
		echo json_encode(array("success" => true));

		exit();
	}

	// Change password.
	if (isset($_REQUEST["action"]) && $_REQUEST["action"] == "change_password")
	{
		header("Content-Type: application/json");

		$current = (isset($_REQUEST["current_password"]) ? (string)$_REQUEST["current_password"] : "");
		$newpass = (isset($_REQUEST["new_password"]) ? (string)$_REQUEST["new_password"] : "");
		$confirm = (isset($_REQUEST["confirm_password"]) ? (string)$_REQUEST["confirm_password"] : "");

		if ($config["password"] !== false && !password_verify($current, $config["password"]))
		{
			echo json_encode(array("success" => false, "error" => BB_Translate("Current password is incorrect.")));
			exit();
		}

		if (strlen($newpass) < 8)
		{
			echo json_encode(array("success" => false, "error" => BB_Translate("New password must be at least 8 characters.")));
			exit();
		}

		if ($newpass !== $confirm)
		{
			echo json_encode(array("success" => false, "error" => BB_Translate("New password confirmation does not match.")));
			exit();
		}

		$config["password"] = password_hash($newpass, PASSWORD_DEFAULT);
		if (!$FM_WriteConfig($config))
		{
			echo json_encode(array("success" => false, "error" => BB_Translate("Unable to write config.php.")));
			exit();
		}

		echo json_encode(array("success" => true));
		exit();
	}

	// Save settings (does not change password).
	if (isset($_REQUEST["action"]) && $_REQUEST["action"] == "save_settings")
	{
		header("Content-Type: application/json");

		$mode = (isset($_REQUEST["file_exts_mode"]) ? (string)$_REQUEST["file_exts_mode"] : "allow");
		if ($mode !== "all" && $mode !== "allow" && $mode !== "exclude")  $mode = "allow";

		$projects_path = (isset($_REQUEST["projects_path"]) ? trim((string)$_REQUEST["projects_path"]) : $config["projects_path"]);
		$projects_url = (isset($_REQUEST["projects_url"]) ? trim((string)$_REQUEST["projects_url"]) : $config["projects_url"]);
		$file_exts = (isset($_REQUEST["file_exts"]) ? trim((string)$_REQUEST["file_exts"]) : $config["file_exts"]);
		$new_file_ext = (isset($_REQUEST["new_file_ext"]) ? trim((string)$_REQUEST["new_file_ext"]) : $config["new_file_ext"]);
		$upload_limit = (isset($_REQUEST["upload_limit"]) ? trim((string)$_REQUEST["upload_limit"]) : $config["upload_limit"]);

		if ($projects_path === "" || !is_dir($projects_path))
		{
			echo json_encode(array("success" => false, "error" => BB_Translate("Projects path does not exist.")));
			exit();
		}

		if (CopePath_IsForbiddenProjectsPath($projects_path))
		{
			echo json_encode(array("success" => false, "error" => BB_Translate("Projects path cannot be inside the Cope Manager application directory.")));
			exit();
		}

		$config["projects_path"] = str_replace("\\", "/", $projects_path);
		$config["projects_url"] = $projects_url;
		$config["dot_folders"] = (isset($_REQUEST["dot_folders"]) && ($_REQUEST["dot_folders"] === "1" || $_REQUEST["dot_folders"] === "true" || $_REQUEST["dot_folders"] === "Yes"));
		$config["file_exts_mode"] = $mode;
		$config["file_exts"] = $file_exts;
		$config["allow_empty_ext"] = (isset($_REQUEST["allow_empty_ext"]) && ($_REQUEST["allow_empty_ext"] === "1" || $_REQUEST["allow_empty_ext"] === "true" || $_REQUEST["allow_empty_ext"] === "Yes"));
		$config["new_file_ext"] = ($new_file_ext !== "" ? $new_file_ext : ".html");
		$config["upload_limit"] = ($upload_limit !== "" ? $upload_limit : "-1");
		$config["recycling"] = (isset($_REQUEST["recycling"]) && ($_REQUEST["recycling"] === "1" || $_REQUEST["recycling"] === "true" || $_REQUEST["recycling"] === "Yes"));
		$config["tabbed"] = (isset($_REQUEST["tabbed"]) && ($_REQUEST["tabbed"] === "1" || $_REQUEST["tabbed"] === "true" || $_REQUEST["tabbed"] === "Yes"));
		$config["hide_manager"] = (isset($_REQUEST["hide_manager"]) && ($_REQUEST["hide_manager"] === "1" || $_REQUEST["hide_manager"] === "true" || $_REQUEST["hide_manager"] === "Yes"));

		if (!$FM_WriteConfig($config))
		{
			echo json_encode(array("success" => false, "error" => BB_Translate("Unable to write config.php.")));
			exit();
		}

		echo json_encode(array(
			"success" => true,
			"settings" => array(
				"projects_path" => $config["projects_path"],
				"projects_url" => $config["projects_url"],
				"dot_folders" => $config["dot_folders"],
				"file_exts_mode" => $config["file_exts_mode"],
				"file_exts" => $config["file_exts"],
				"allow_empty_ext" => $config["allow_empty_ext"],
				"new_file_ext" => $config["new_file_ext"],
				"upload_limit" => $config["upload_limit"],
				"recycling" => $config["recycling"],
				"tabbed" => $config["tabbed"],
				"hide_manager" => $config["hide_manager"]
			)
		));
		exit();
	}

	// MySQL Manager actions.
	require_once COPE_PHP . "/mysql_helper.php";
	MySQLHelper::HandleActions($config, $FM_WriteConfig);

	// Handle most File Explorer options via the helper class.
	require_once COPE_PHP . "/file_explorer_fs_helper.php";
	require_once COPE_PHP . "/file_upload_helper.php";

	$reqbase = BB_GetFullRequestURLBase();
	if (preg_match('/\.php(?:\?|$)/i', $reqbase) || substr($reqbase, -1) !== "/")
	{
		$pos = strrpos($reqbase, "/");
		$thumbsbase = ($pos !== false ? substr($reqbase, 0, $pos) : $reqbase);
	}
	else  $thumbsbase = rtrim($reqbase, "/");

	$options = array(
		"protect_depth" => 0,
		"recycle_to" => ($config["recycling"] ? BB_Translate("Recycle Bin") : false),
		"temp_dir" => str_replace("\\", "/", sys_get_temp_dir()),
		"dot_folders" => $config["dot_folders"],  // .git, .svn, .DS_Store
		"file_exts_mode" => $config["file_exts_mode"],
		"allowed_exts" => $config["file_exts"],
		"allow_empty_ext" => $config["allow_empty_ext"],
		"thumbs_dir" => COPE_THUMB,
		"thumbs_url" => $thumbsbase . "/" . COPE_THUMB_URL,
		"thumb_create_url" => BB_GetFullRequestURLBase() . "?action=file_explorer_thumbnail&sec_t=" . BB_CreateSecurityToken("file_explorer_thumbnail"),
		"refresh" => true,
		"rename" => true,
		"file_info" => $config["tabbed"],
		"load_file" => $config["tabbed"],
		"save_file" => $config["tabbed"],
		"new_folder" => true,
		"new_file" => $config["new_file_ext"],
		"upload" => true,
		"upload_limit" => ($config["upload_limit"] < 0 ? -1 : Str::ConvertUserStrToBytes($config["upload_limit"])),  // -1 for unlimited or an integer
		"download" => ($bb_username !== "" ? $bb_username . "-" : "") . date("Y-m-d_H-i-s") . ".zip",
		"download_module" => "",  // Server handler for single-file downloads:  "" (none), "sendfile" (Apache), "accel-redirect" (Nginx)
		"download_module_prefix" => "",  // A string to prefix to the filename.  (For URI /protected access mapping for a Nginx X-Accel-Redirect to the system root)
		"copy" => true,
		"move" => true,
		"recycle" => $config["recycling"],
		"delete" => true,
		"extract" => true,
		"compress" => true,
		"chmod" => true,
		"hide_manager" => !empty($config["hide_manager"]),
		"manager_path" => COPE_DIR,
		"manager_package_path" => COPE_WEB_ROOT
	);

	if ($config["projects_url"] != "")  $options["base_url"] = $config["projects_url"];

	// Allow modification of the options to be passed to the action helper.
	if (is_callable("ModifyFileExplorerOptions"))  call_user_func_array("ModifyFileExplorerOptions", array(&$options));

	FileExplorerFSHelper::HandleActions("action", "file_explorer_", $config["projects_path"], $options);


	// Main editing interface.
	header("Content-Type: text/html; charset=UTF-8");

	$acemodes = array();
	$acethemes = array();

	if ($config["tabbed"])
	{
		$dir = @opendir(COPE_JS . "/ace");
		if ($dir)
		{
			while (($file = readdir($dir)) !== false)
			{
				if (substr($file, -3) !== ".js")  continue;

				if (substr($file, 0, 5) === "mode-")  $acemodes[$file] = array("key" => "ace/mode/" . substr($file, 5, -3), "display" => substr($file, 5, -3));
				if (substr($file, 0, 6) === "theme-")  $acethemes[$file] = array("key" => "ace/theme/" . substr($file, 6, -3), "display" => substr($file, 6, -3));
			}

			closedir($dir);
		}

		ksort($acemodes, SORT_NATURAL | SORT_FLAG_CASE);
		ksort($acethemes, SORT_NATURAL | SORT_FLAG_CASE);

		$acemodes = array_values($acemodes);
		$acethemes = array_values($acethemes);
	}
?>
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
<link rel="icon" href="<?=htmlspecialchars(COPE_IMG_URL)?>/favicon.ico" type="image/x-icon">
<title><?=htmlspecialchars(BB_Translate("File Manager"))?></title>
<link rel="stylesheet" type="text/css" href="<?=htmlspecialchars(COPE_CSS_URL)?>/main.css?v=<?=@filemtime(COPE_CSS . "/main.css")?>">
<link rel="stylesheet" type="text/css" href="<?=htmlspecialchars(COPE_CSS_URL)?>/file-explorer/file-explorer.css?v=<?=@filemtime(COPE_CSS . "/file-explorer/file-explorer.css")?>">
<link rel="stylesheet" type="text/css" href="<?=htmlspecialchars(COPE_CSS_URL)?>/file-manager.css?v=<?=@filemtime(COPE_CSS . "/file-manager.css")?>">
<link rel="stylesheet" type="text/css" href="<?=htmlspecialchars(COPE_CSS_URL)?>/mysql-manager.css?v=<?=@filemtime(COPE_CSS . "/mysql-manager.css")?>">
</head>
<body>
<div id="filemanager"></div>

<script type="text/javascript" src="<?=htmlspecialchars(COPE_JS_URL)?>/file-explorer/file-explorer.js?v=<?=@filemtime(COPE_JS . "/file-explorer/file-explorer.js")?>"></script>
<script type="text/javascript" src="<?=htmlspecialchars(COPE_JS_URL)?>/flexforms/flex_forms.js?v=<?=@filemtime(COPE_JS . "/flexforms/flex_forms.js")?>"></script>
<?php
	if ($config["tabbed"])
	{
?>
<script type="text/javascript" src="<?=htmlspecialchars(COPE_JS_URL)?>/ace/ace.js?v=<?=@filemtime(COPE_JS . "/ace/ace.js")?>"></script>
<script type="text/javascript" src="<?=htmlspecialchars(COPE_JS_URL)?>/flexforms/flex_forms_dialog.js?v=<?=@filemtime(COPE_JS . "/flexforms/flex_forms_dialog.js")?>"></script>
<link rel="stylesheet" type="text/css" href="<?=htmlspecialchars(COPE_CSS_URL)?>/flexforms/flex_forms_dialog.css?v=<?=@filemtime(COPE_CSS . "/flexforms/flex_forms_dialog.css")?>">
<?php
	}
?>
<script type="text/javascript" src="<?=htmlspecialchars(COPE_JS_URL)?>/mysql-manager.js?v=<?=@filemtime(COPE_JS . "/mysql-manager.js")?>"></script>
<script type="text/javascript" src="<?=htmlspecialchars(COPE_JS_URL)?>/file-manager.js?v=<?=@filemtime(COPE_JS . "/file-manager.js")?>"></script>

<script type="text/javascript">
(function() {
	var elem = document.getElementById('filemanager');

	var xhrparammap = {
		'file_explorer_refresh': { sec_t: '<?=BB_CreateSecurityToken("file_explorer_refresh")?>' },
		'file_explorer_rename': { sec_t: '<?=BB_CreateSecurityToken("file_explorer_rename")?>' },
		'file_explorer_file_info': { sec_t: '<?=BB_CreateSecurityToken("file_explorer_file_info")?>' },
		'file_explorer_load_file': { sec_t: '<?=BB_CreateSecurityToken("file_explorer_load_file")?>' },
		'file_explorer_save_file': { sec_t: '<?=BB_CreateSecurityToken("file_explorer_save_file")?>' },
		'file_explorer_new_folder': { sec_t: '<?=BB_CreateSecurityToken("file_explorer_new_folder")?>' },
		'file_explorer_new_file': { sec_t: '<?=BB_CreateSecurityToken("file_explorer_new_file")?>' },
		'file_explorer_upload_init': { sec_t: '<?=BB_CreateSecurityToken("file_explorer_upload_init")?>' },
		'file_explorer_upload': { sec_t: '<?=BB_CreateSecurityToken("file_explorer_upload")?>' },
		'file_explorer_download': { sec_t: '<?=BB_CreateSecurityToken("file_explorer_download")?>' },
		'file_explorer_copy_init': { sec_t: '<?=BB_CreateSecurityToken("file_explorer_copy_init")?>' },
		'file_explorer_copy': { sec_t: '<?=BB_CreateSecurityToken("file_explorer_copy")?>' },
		'file_explorer_move': { sec_t: '<?=BB_CreateSecurityToken("file_explorer_move")?>' },
		'file_explorer_recycle': { sec_t: '<?=BB_CreateSecurityToken("file_explorer_recycle")?>' },
		'file_explorer_delete': { sec_t: '<?=BB_CreateSecurityToken("file_explorer_delete")?>' },
		'file_explorer_extract': { sec_t: '<?=BB_CreateSecurityToken("file_explorer_extract")?>' },
		'file_explorer_compress': { sec_t: '<?=BB_CreateSecurityToken("file_explorer_compress")?>' },
		'file_explorer_chmod': { sec_t: '<?=BB_CreateSecurityToken("file_explorer_chmod")?>' },
		'save_settings': { sec_t: '<?=BB_CreateSecurityToken("save_settings")?>' },
		'change_password': { sec_t: '<?=BB_CreateSecurityToken("change_password")?>' },
		'logout': { sec_t: '<?=BB_CreateSecurityToken("logout")?>' },
		'mysql_list_servers': { sec_t: '<?=BB_CreateSecurityToken("mysql_list_servers")?>' },
		'mysql_save_server': { sec_t: '<?=BB_CreateSecurityToken("mysql_save_server")?>' },
		'mysql_delete_server': { sec_t: '<?=BB_CreateSecurityToken("mysql_delete_server")?>' },
		'mysql_test_connection': { sec_t: '<?=BB_CreateSecurityToken("mysql_test_connection")?>' },
		'mysql_connect': { sec_t: '<?=BB_CreateSecurityToken("mysql_connect")?>' },
		'mysql_list_databases': { sec_t: '<?=BB_CreateSecurityToken("mysql_list_databases")?>' },
		'mysql_create_database': { sec_t: '<?=BB_CreateSecurityToken("mysql_create_database")?>' },
		'mysql_drop_database': { sec_t: '<?=BB_CreateSecurityToken("mysql_drop_database")?>' },
		'mysql_list_tables': { sec_t: '<?=BB_CreateSecurityToken("mysql_list_tables")?>' },
		'mysql_table_structure': { sec_t: '<?=BB_CreateSecurityToken("mysql_table_structure")?>' },
		'mysql_browse_table': { sec_t: '<?=BB_CreateSecurityToken("mysql_browse_table")?>' },
		'mysql_insert_row': { sec_t: '<?=BB_CreateSecurityToken("mysql_insert_row")?>' },
		'mysql_update_row': { sec_t: '<?=BB_CreateSecurityToken("mysql_update_row")?>' },
		'mysql_delete_row': { sec_t: '<?=BB_CreateSecurityToken("mysql_delete_row")?>' },
		'mysql_drop_table': { sec_t: '<?=BB_CreateSecurityToken("mysql_drop_table")?>' },
		'mysql_rename_table': { sec_t: '<?=BB_CreateSecurityToken("mysql_rename_table")?>' },
		'mysql_truncate_table': { sec_t: '<?=BB_CreateSecurityToken("mysql_truncate_table")?>' },
		'mysql_copy_table': { sec_t: '<?=BB_CreateSecurityToken("mysql_copy_table")?>' },
		'mysql_export_table': { sec_t: '<?=BB_CreateSecurityToken("mysql_export_table")?>' },
		'mysql_bulk_delete_rows': { sec_t: '<?=BB_CreateSecurityToken("mysql_bulk_delete_rows")?>' },
		'mysql_show_create': { sec_t: '<?=BB_CreateSecurityToken("mysql_show_create")?>' },
		'mysql_table_ops': { sec_t: '<?=BB_CreateSecurityToken("mysql_table_ops")?>' },
		'mysql_import_sql': { sec_t: '<?=BB_CreateSecurityToken("mysql_import_sql")?>' },
		'mysql_list_events': { sec_t: '<?=BB_CreateSecurityToken("mysql_list_events")?>' },
		'mysql_drop_event': { sec_t: '<?=BB_CreateSecurityToken("mysql_drop_event")?>' },
		'mysql_show_create_event': { sec_t: '<?=BB_CreateSecurityToken("mysql_show_create_event")?>' },
		'mysql_list_triggers': { sec_t: '<?=BB_CreateSecurityToken("mysql_list_triggers")?>' },
		'mysql_drop_trigger': { sec_t: '<?=BB_CreateSecurityToken("mysql_drop_trigger")?>' },
		'mysql_show_create_trigger': { sec_t: '<?=BB_CreateSecurityToken("mysql_show_create_trigger")?>' },
		'mysql_query': { sec_t: '<?=BB_CreateSecurityToken("mysql_query")?>' },
	};

	var options = {
		fe_uploadchunksize: <?=FileUploadHelper::GetMaxUploadFileSize()?>,

		ace_modes: <?=json_encode($acemodes, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT)?>,
		ace_themes: <?=json_encode($acethemes, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT)?>,

		recycling: <?=($config["recycling"] ? "true" : "false")?>,
		tabbed: <?=($config["tabbed"] ? "true" : "false")?>,
		has_password: <?=($config["password"] !== false ? "true" : "false")?>,
		cope_url: <?=json_encode(COPE_URL)?>,

		settings: <?=json_encode(array(
			"projects_path" => $config["projects_path"],
			"projects_url" => $config["projects_url"],
			"dot_folders" => !empty($config["dot_folders"]),
			"file_exts_mode" => $config["file_exts_mode"],
			"file_exts" => $config["file_exts"],
			"allow_empty_ext" => !empty($config["allow_empty_ext"]),
			"new_file_ext" => $config["new_file_ext"],
			"upload_limit" => $config["upload_limit"],
			"recycling" => !empty($config["recycling"]),
			"tabbed" => !empty($config["tabbed"]),
			"hide_manager" => !empty($config["hide_manager"])
		), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)?>,

		onxhrparams: function(action, params) {
			if (xhrparammap[action])  Object.assign(params, xhrparammap[action]);
		}
	};

<?php
	// Allow modification of the 'xhrparammap' and 'options' objects.
	if (is_callable("ModifyFileManagerOptions"))  call_user_func("ModifyFileManagerOptions");
?>

	var fm = new window.FileManager(elem, options);

/*
	// Verify that there aren't any leaked globals.
	setTimeout(function() {
		// Create an iframe and put it in the <body>.
		var iframe = document.createElement('iframe');
		document.body.appendChild(iframe);

		// We'll use this to get a "pristine" window object.
		var pristineWindow = iframe.contentWindow.window;

		// Go through every property on `window` and filter it out if
		// the iframe's `window` also has it.
		console.log(Object.keys(window).filter(function(key) {
			return !pristineWindow.hasOwnProperty(key)
		}));

		// Remove the iframe.
		document.body.removeChild(iframe)
	}, 15000);
*/

<?php
	// Keep PHP sessions alive.
	if (session_status() === PHP_SESSION_ACTIVE)
	{
?>
	var runHeartbeat = function() {
		var xhr = new fm.PrepareXHR({
			url: '<?=BB_GetRequestURLBase()?>',
			params: {
				action: 'heartbeat',
				sec_t: '<?=BB_CreateSecurityToken("heartbeat")?>'
			},
			onsuccess: function(e) {
				var raw = e.target && e.target.responseText;
				if (raw !== 'OK' && typeof fm.CheckSessionResponse === 'function')  fm.CheckSessionResponse(raw);
			}
		});

		xhr.Send();
	};

	setInterval(runHeartbeat, 2 * 60 * 1000);
	document.addEventListener('visibilitychange', function() {
		if (document.visibilityState === 'visible')  runHeartbeat();
	});
<?php
	}
?>
})();
</script>

</body>
</html>
