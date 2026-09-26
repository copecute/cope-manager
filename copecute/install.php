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

	require_once __DIR__ . "/bootstrap.php";
	require_once COPE_DIR . "/security.php";

	CopeSecurity_Headers();
	CopeSession_Start();

	$install_config = COPE_CONFIG;
	$show_install_done = false;

	// Already installed: never expose the installer. Redirect to the app (login).
	if (is_file($install_config))
	{
		$show_install_done = (isset($_REQUEST["action"]) && $_REQUEST["action"] === "done" && !empty($_SESSION["fm_admin_installed"]));
		if (!$show_install_done)
		{
			header("Location: ../index.php", true, 302);
			exit();
		}
		unset($_SESSION["fm_admin_installed"]);
	}

	require_once COPE_PHP . "/str_basics.php";
	require_once COPE_PHP . "/flex_forms.php";
	require_once COPE_PHP . "/random.php";

	Str::ProcessAllInput();

	if (!isset($_SESSION["fm_admin_install"]) || !is_array($_SESSION["fm_admin_install"]))  $_SESSION["fm_admin_install"] = array();
	if (!isset($_SESSION["fm_admin_install"]["secret"]) || !is_string($_SESSION["fm_admin_install"]["secret"]) || strlen($_SESSION["fm_admin_install"]["secret"]) < 32)
	{
		$rng = new CSPRNG();
		$_SESSION["fm_admin_install"]["secret"] = $rng->GetBytes(64);
	}

	$ff = new FlexForms();
	$ff->SetSecretKey($_SESSION["fm_admin_install"]["secret"]);
	$ff->SetState(array(
		"supporturl" => "js",
		"cssurl" => "css",
		"jsurl" => "js"
	));
	$ff->CheckSecurityToken("action");

	// Block installer if config appeared mid-request (race) except the one-shot done page.
	if (is_file($install_config) && !$show_install_done)
	{
		header("Location: ../index.php", true, 302);
		exit();
	}

	function OutputHeader($title, $step = 0)
	{
		global $ff;

		header("Content-type: text/html; charset=UTF-8");

		$steps = array(
			1 => "Environment",
			2 => "Configure",
			3 => "Done"
		);

?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="x-ua-compatible" content="ie=edge">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<link rel="icon" href="img/favicon.ico" type="image/x-icon">
<title><?=htmlspecialchars($title)?> · Cope Manager Setup</title>
<link rel="stylesheet" href="css/install.css?v=<?=@filemtime(COPE_CSS . "/install.css")?>" type="text/css" media="all" />
<link rel="stylesheet" href="css/flex_forms.css?v=<?=@filemtime(COPE_CSS . "/flex_forms.css")?>" type="text/css" media="all" />
<?php
		$ff->OutputJQuery();
?>
<script type="text/javascript">
setInterval(function() {
	$.post('<?=$ff->GetRequestURLBase()?>', {
		'action': 'heartbeat',
		'sec_t': '<?=$ff->CreateSecurityToken("heartbeat")?>'
	});
}, 5 * 60 * 1000);
</script>
</head>
<body>
<div class="fm_install_shell">
	<header class="fm_install_top">
		<div class="fm_install_brand">
			<div class="fm_install_mark" aria-hidden="true"></div>
			<div class="fm_install_brand_text">
				<span class="fm_install_brand_name">Cope Manager</span>
				<span class="fm_install_brand_sub">Installer</span>
			</div>
		</div>
		<nav class="fm_install_steps" aria-label="Installation progress">
<?php
		$i = 0;
		foreach ($steps as $num => $label)
		{
			if ($i++)  echo "\t\t\t<span class=\"fm_install_step_sep\" aria-hidden=\"true\"></span>\n";
			$cls = "fm_install_step";
			if ($step > 0 && $num < $step)  $cls .= " is_done";
			else if ($num === (int)$step)  $cls .= " is_active";
?>
			<span class="<?=$cls?>"><span class="fm_install_step_num"><?=$num?></span> <?=htmlspecialchars($label)?></span>
<?php
		}
?>
		</nav>
	</header>
	<div id="contentwrap"><div id="content">
	<h1><?=htmlspecialchars($title)?></h1>
<?php
	}

	function OutputFooter()
	{
?>
	</div></div>
	<footer id="footerwrap"><div id="footer">
		Cope Manager · &copy; <?=date("Y")?>
	</div></footer>
</div>
</body>
</html>
<?php
	}

	$errors = array();
	if (isset($_REQUEST["action"]) && $_REQUEST["action"] == "heartbeat")
	{
		echo "OK";
	}
	else if (isset($_REQUEST["action"]) && $_REQUEST["action"] == "done")
	{
		if (!$show_install_done)  { header("Location: ../index.php", true, 302); exit(); }

		OutputHeader("You're all set", 3);

		$ff->OutputMessage("success", "Installation completed successfully.");

?>
<p class="fm_install_lead">Cope Manager is ready. Lock down the install directory, then open the app and sign in.</p>
<p><a class="fm_install_cta" href="../index.php">Open Cope Manager</a></p>
<?php

		OutputFooter();
	}
	else if (isset($_REQUEST["action"]) && $_REQUEST["action"] == "step2")
	{
		$docroot = rtrim(str_replace("\\", "/", isset($_SERVER["DOCUMENT_ROOT"]) ? $_SERVER["DOCUMENT_ROOT"] : ""), "/");
		$hostbase = rtrim($ff->GetRequestHost($ff->IsSSLRequest() ? "https" : "http"), "/");

		// Default to document root / site URL (no /projects suffix). Migrate old installer defaults if still present.
		if (!isset($_SESSION["fm_admin_install"]["projects_path"]) || $_SESSION["fm_admin_install"]["projects_path"] === $docroot . "/projects")
			$_SESSION["fm_admin_install"]["projects_path"] = $docroot;
		if (!isset($_SESSION["fm_admin_install"]["projects_url"]) || $_SESSION["fm_admin_install"]["projects_url"] === $hostbase . "/projects" || $_SESSION["fm_admin_install"]["projects_url"] === $ff->GetRequestHost() . "/projects")
			$_SESSION["fm_admin_install"]["projects_url"] = $hostbase;
		if (!isset($_SESSION["fm_admin_install"]["dot_folders"]))  $_SESSION["fm_admin_install"]["dot_folders"] = "No";
		if (!isset($_SESSION["fm_admin_install"]["file_exts_mode"]))  $_SESSION["fm_admin_install"]["file_exts_mode"] = "allow";
		if (!isset($_SESSION["fm_admin_install"]["file_exts"]))  $_SESSION["fm_admin_install"]["file_exts"] = ".jpg, .jpeg, .png, .gif, .svg, .html, .css, .js, .json, .md, .txt, .xml";
		if (!isset($_SESSION["fm_admin_install"]["allow_empty_ext"]))  $_SESSION["fm_admin_install"]["allow_empty_ext"] = "Yes";
		if (!isset($_SESSION["fm_admin_install"]["new_file_ext"]))  $_SESSION["fm_admin_install"]["new_file_ext"] = ".html";
		if (!isset($_SESSION["fm_admin_install"]["upload_limit"]))  $_SESSION["fm_admin_install"]["upload_limit"] = "20MB";
		if (!isset($_SESSION["fm_admin_install"]["recycling"]))  $_SESSION["fm_admin_install"]["recycling"] = "Yes";
		if (!isset($_SESSION["fm_admin_install"]["tabbed"]))  $_SESSION["fm_admin_install"]["tabbed"] = "Yes";
		if (!isset($_SESSION["fm_admin_install"]["hide_manager"]))  $_SESSION["fm_admin_install"]["hide_manager"] = "Yes";
		if (!isset($_SESSION["fm_admin_install"]["password"]))  $_SESSION["fm_admin_install"]["password"] = "";

		$rng = new CSPRNG(true);
		$freqmap = json_decode(file_get_contents(COPE_DATA . "/en_us_lite.json"), true);

		$message = "";
		if (isset($_REQUEST["projects_path"]))
		{
			// Test settings.  Use a unique plain-text marker file so CDN/WAF HTML injection cannot fail the check.
			$rngtest = new CSPRNG(true);
			$marker = "fm-install-" . bin2hex($rngtest->GetBytes(16));
			$testdir = rtrim(str_replace("\\", "/", $_REQUEST["projects_path"]), "/");
			$testfile = $testdir . "/fm-install-test.txt";

			if (!is_dir($_REQUEST["projects_path"]))  $errors["projects_path"] = "The specified directory does not exist.  Please create the directory and make sure it is writeable by the web server (e.g. chown www-data, chmod 775).";
			else if (CopePath_IsForbiddenProjectsPath($_REQUEST["projects_path"]))  $errors["projects_path"] = "File storage path cannot be inside the Cope Manager application directory. Use a separate folder.";
			else if (!isset($_REQUEST["password"]) || strlen((string)$_REQUEST["password"]) < 8)  $errors["password"] = "Password is required and must be at least 8 characters.";
			else if (!@file_put_contents($testfile, $marker))  $errors["projects_path"] = "The specified directory exists but is not writeable.  Please make sure the directory is writeable by the web server (e.g. chown www-data, chmod 775).";
			else if ($_REQUEST["projects_url"] != "")
			{
				require_once COPE_PHP . "/web_browser.php";

				$web = new WebBrowser();

				$basehost = $ff->GetRequestHost($ff->IsSSLRequest() ? "https" : "http");
				$url = HTTP::ConvertRelativeToAbsoluteURL($basehost, rtrim($_REQUEST["projects_url"], "/") . "/fm-install-test.txt");
				$result = $web->Process($url);
				if (!$result["success"])  $errors["projects_url"] = "Unable to connect to '" . htmlspecialchars($url) . "'.  " . $result["error"] . " (" . $result["errorcode"] . ")";
				else if ($result["response"]["code"] != 200)  $errors["projects_url"] = "Expected file was not found at '" . htmlspecialchars($url) . "'.  Expected 200 OK response.  Received '" . htmlspecialchars($result["response"]["line"]) . "'.";
				else
				{
					$body = isset($result["body"]) ? $result["body"] : "";
					if (substr($body, 0, 3) === "\xEF\xBB\xBF")  $body = substr($body, 3);

					if (strpos($body, $marker) === false)
					{
						$errors["projects_url"] = "Expected file '" . htmlspecialchars($url) . "' did not contain expected data.  Confirm the Projects URL maps to the Projects path (same folder the installer just wrote).  If a CDN/WAF interferes, temporarily bypass it for this host or leave Projects URL blank.";
					}
					else  $message .= "Storage path and URL look okay.<br><b>Test URL was '" . htmlspecialchars($url) . "'.</b><br>";
				}

				@unlink($testfile);
			}
			else
			{
				@unlink($testfile);
			}

			if (count($errors))  $errors["msg"] = "Please correct the errors below and try again.";
			else if (isset($_REQUEST["next"]))
			{
				$pass = isset($_REQUEST["password"]) ? (string)$_REQUEST["password"] : "";
				if (strlen($pass) < 8)
				{
					$errors["password"] = "Password is required and must be at least 8 characters.";
					$errors["msg"] = "Please correct the errors below and try again.";
				}
				else
				{
				$config = array(
					"token_secret" => $rng->GenerateString(64),
					"projects_path" => $_REQUEST["projects_path"],
					"projects_url" => $_REQUEST["projects_url"],
					"dot_folders" => ($_REQUEST["dot_folders"] === "Yes"),
					"file_exts_mode" => (isset($_REQUEST["file_exts_mode"]) && in_array($_REQUEST["file_exts_mode"], array("all", "allow", "exclude"), true) ? $_REQUEST["file_exts_mode"] : "allow"),
					"file_exts" => $_REQUEST["file_exts"],
					"allow_empty_ext" => ($_REQUEST["allow_empty_ext"] === "Yes"),
					"new_file_ext" => $_REQUEST["new_file_ext"],
					"upload_limit" => $_REQUEST["upload_limit"],
					"recycling" => ($_REQUEST["recycling"] === "Yes"),
					"tabbed" => ($_REQUEST["tabbed"] === "Yes"),
					"hide_manager" => (!isset($_REQUEST["hide_manager"]) || $_REQUEST["hide_manager"] === "Yes"),
					"password" => password_hash($pass, PASSWORD_DEFAULT),
					"mysql_servers" => array()
				);

				// Create the thumbnail cache directory.
				if (!count($errors))
				{
					if (!is_dir(COPE_THUMB) && @mkdir(COPE_THUMB, 0775) === false)  $errors["msg"] = "Unable to create 'thumb' subdirectory.";
					else if (@file_put_contents(COPE_THUMB . "/index.html", "") === false)  $errors["msg"] = "Unable to create the file '" . htmlspecialchars(COPE_THUMB . "/index.html") . "'.";
				}

				// Write the configuration to disk (with bootstrap guard).
				if (!count($errors))
				{
					if (!CopeConfig_Write($config))  $errors["msg"] = "Unable to write configuration to '" . htmlspecialchars(COPE_CONFIG) . "'.";
				}

				if (!count($errors))
				{
					$_SESSION["fm_admin_installed"] = true;

					header("Location: " . $ff->GetFullRequestURLBase() . "?action=done&sec_t=" . $ff->CreateSecurityToken("done"));

					exit();
				}
				}
			}
		}

		OutputHeader("Configure settings", 2);

		if (count($errors))  $ff->OutputMessage("error", $errors["msg"]);
		else if ($message != "")  $ff->OutputMessage("info", $message);

		$contentopts = array(
			"fields" => array(
				array(
					"title" => "* File storage path",
					"type" => "text",
					"name" => "projects_path",
					"default" => $_SESSION["fm_admin_install"]["projects_path"],
					"desc" => "The exact physical path on the server where files (e.g. images) are to be stored.  The directory must exist and be writeable by the web server.  It is recommended to use a folder for file storage that is different from where this tool is stored to minimize potential security issues."
				),
				array(
					"title" => "File storage base URL",
					"type" => "text",
					"name" => "projects_url",
					"default" => $_SESSION["fm_admin_install"]["projects_url"],
					"desc" => "The exact base URL where the stored files can be accessed via a web browser at the file storage path above."
				),
				array(
					"title" => "Allow dot folders",
					"type" => "select",
					"name" => "dot_folders",
					"options" => array("Yes" => "Yes", "No" => "No"),
					"default" => $_SESSION["fm_admin_install"]["dot_folders"],
					"desc" => "Allows folders that begin with a dot to be created/named (e.g. .git, .svn, .DS_Store)."
				),
				array(
					"title" => "File extensions mode",
					"type" => "select",
					"name" => "file_exts_mode",
					"options" => array("all" => "All extensions", "allow" => "Allow only (whitelist)", "exclude" => "Exclude (blacklist)"),
					"default" => $_SESSION["fm_admin_install"]["file_exts_mode"],
					"desc" => "All = mọi đuôi file. Allow = chỉ cho phép danh sách. Exclude = cho phép tất cả trừ danh sách."
				),
				array(
					"title" => "File extensions list",
					"type" => "text",
					"name" => "file_exts",
					"default" => $_SESSION["fm_admin_install"]["file_exts"],
					"desc" => "A comma separated list of file extensions for Allow/Exclude modes. Leave blank with Allow mode to allow all (legacy)."
				),
				array(
					"title" => "Allow empty extensions",
					"type" => "select",
					"name" => "allow_empty_ext",
					"options" => array("Yes" => "Yes", "No" => "No"),
					"default" => $_SESSION["fm_admin_install"]["allow_empty_ext"],
					"desc" => "Allows files without a file extension to be created/named."
				),
				array(
					"title" => "New file extension",
					"type" => "text",
					"name" => "new_file_ext",
					"default" => $_SESSION["fm_admin_install"]["new_file_ext"],
					"desc" => "The file extension to use for new files.  Ideally in the list of allowed file extensions."
				),
				array(
					"title" => "Upload file size limit",
					"type" => "text",
					"name" => "upload_limit",
					"default" => $_SESSION["fm_admin_install"]["upload_limit"],
					"desc" => "The maximum file size to allow to be uploaded.  Use -1 for unlimited size."
				),
				array(
					"title" => "Use Recycling Bin",
					"type" => "select",
					"name" => "recycling",
					"options" => array("Yes" => "Yes", "No" => "No"),
					"default" => $_SESSION["fm_admin_install"]["recycling"],
					"desc" => "Files that are deleted or overwritten are first placed into a Recycling Bin folder.  Deleting items from the folder must be handled using an external script."
				),
				array(
					"title" => "Use Tabbed Editor/Viewer",
					"type" => "select",
					"name" => "tabbed",
					"options" => array("Yes" => "Yes", "No" => "No"),
					"default" => $_SESSION["fm_admin_install"]["tabbed"],
					"desc" => "Don't want/need the tabbed code editor/previewer?  Disabling the tabbed editor/viewer will make File Explorer fill the entire space.  Useful for iframe injection."
				),
				array(
					"title" => "Hide Cope Manager folder",
					"type" => "select",
					"name" => "hide_manager",
					"options" => array("Yes" => "Yes", "No" => "No"),
					"default" => $_SESSION["fm_admin_install"]["hide_manager"],
					"desc" => "When file storage includes this app, hide the whole install folder (whatever it is named — e.g. cope-manager, manager) in File Explorer so users do not open or edit it by mistake. Recommended: Yes."
				),
				array(
					"title" => "* Password",
					"type" => "password",
					"name" => "password",
					"default" => "",
					"htmldesc" => "Required. At least 8 characters. Used for the built-in login screen. To use your own auth later, create <code>copecute/index_hook.php</code> that sets <code>\$_SESSION[\"fm_admin_logged_in\"] = true</code> after verifying the user (or <code>exit</code>).<br>Suggested password:  " . htmlspecialchars($rng->GenerateWordLite($freqmap, $rng->GetInt(4, 7)) . "-" . $rng->GenerateWordLite($freqmap, $rng->GetInt(4, 7)) . "-" . $rng->GenerateWordLite($freqmap, $rng->GetInt(4, 7)))
				),
			),
			"submit" => array("test" => "Test Settings", "next" => "Install")
		);

		$ff->Generate($contentopts, $errors);

		OutputFooter();
	}
	else if (isset($_REQUEST["action"]) && $_REQUEST["action"] == "step1")
	{
		if (isset($_REQUEST["submit"]))
		{
			header("Location: " . $ff->GetFullRequestURLBase() . "?action=step2&sec_t=" . $ff->CreateSecurityToken("step2"));

			exit();
		}

		OutputHeader("Environment check", 1);

		if ((double)phpversion() < 5.6)  $errors["phpversion"] = "The server is running PHP " . phpversion() . ".  The installation may succeed but the API will not function.  Running outdated versions of PHP poses a serious website security risk.  Please contact your system administrator to upgrade your PHP installation.";

		if (file_put_contents("test.dat", "a") === false)  $errors["createfiles"] = "Unable to create 'test.dat'.  Running chmod 777 on the directory may fix the problem.  You can change permissions back after installation.";
		else if (!unlink("test.dat"))  $errors["createfiles"] = "Unable to delete 'test.dat'.  Running chmod 777 on the directory may fix the problem.  You can change permissions back after installation.";

		if (mkdir("test") === false)  $errors["createdirectories"] = "Unable to create 'test'.  Running chmod 777 on the directory may fix the problem.  You can change permissions back after installation.";
		else if (!rmdir("test"))  $errors["createdirectories"] = "Unable to remove 'test'.  Running chmod 777 on the directory may fix the problem.  You can change permissions back after installation.";

		if (!isset($_SERVER["REQUEST_URI"]))  $errors["requesturi"] = "The server does not appear to support this feature.  The installation may fail and the software might not work.";

		if (!$ff->IsSSLRequest())  $errors["ssl"] = "The admin interface should be installed over SSL if used on public infrastructure.  SSL/TLS certificates can be obtained for free.  Proceed only if this major security risk is acceptable.";

		try
		{
			$rng = new CSPRNG(true);
		}
		catch (Exception $e)
		{
			$error["csprng"] = "Please ask your system administrator to install a supported PHP version (e.g. PHP 7 or later) or extension (e.g. OpenSSL).";
		}

?>
<p class="fm_install_lead">Checks against the minimum requirements. Fix any failures, then reload or continue.</p>
<?php

		$contentopts = array(
			"fields" => array(
				array(
					"title" => "PHP 5.6.x or later",
					"type" => "static",
					"name" => "phpversion",
					"value" => (isset($errors["phpversion"]) ? "No.  Test failed." : "Yes.  Test passed.")
				),
				array(
					"title" => "Able to create files in ./",
					"type" => "static",
					"name" => "createfiles",
					"value" => (isset($errors["createfiles"]) ? "No.  Test failed." : "Yes.  Test passed.")
				),
				array(
					"title" => "Able to create directories in ./",
					"type" => "static",
					"name" => "createdirectories",
					"value" => (isset($errors["createdirectories"]) ? "No.  Test failed." : "Yes.  Test passed.")
				),
				array(
					"title" => "\$_SERVER[\"REQUEST_URI\"] supported",
					"type" => "static",
					"name" => "requesturi",
					"value" => (isset($errors["requesturi"]) ? "No.  Test failed." : "Yes.  Test passed.")
				),
				array(
					"title" => "Installation over SSL",
					"type" => "static",
					"name" => "ssl",
					"value" => (isset($errors["ssl"]) ? "No.  Test failed." : "Yes.  Test passed.")
				),
				array(
					"title" => "Crypto-safe CSPRNG available",
					"type" => "static",
					"name" => "csprng",
					"value" => (isset($errors["csprng"]) ? "No.  Test failed." : "Yes.  Test passed.")
				)
			),
			"submit" => "Next Step",
			"submitname" => "submit"
		);

		$functions = array(
			"json_encode" => "JSON encoding/decoding (critical!)"
		);

		foreach ($functions as $function => $info)
		{
			if (!function_exists($function))  $errors["function|" . $function] = "The software will be unable to use " . $info . ".  The installation might succeed but the product may not function at all.";

			$contentopts["fields"][] = array(
				"title" => "'" . $function . "' available",
				"type" => "static",
				"name" => "function|" . $function,
				"value" => (isset($errors["function|" . $function]) ? "No.  Test failed." : "Yes.  Test passed.")
			);
		}

		$DetectExt = function($name) {
			$detail = array();
			$ok = false;

			if (extension_loaded($name))
			{
				$ok = true;
				$ver = @phpversion($name);
				$detail[] = "extension_loaded" . ($ver ? " (" . $ver . ")" : "");
			}
			else
			{
				$ver = @phpversion($name);
				if ($ver !== false && $ver !== null && $ver !== "")
				{
					$ok = true;
					$detail[] = "phpversion " . $ver;
				}
			}

			if ($name === "imagick")
			{
				foreach (get_loaded_extensions() as $ext)
				{
					if (strcasecmp($ext, "imagick") === 0)
					{
						$ok = true;
						$detail[] = "listed as " . $ext;
						break;
					}
				}

				if (class_exists("Imagick", false) || class_exists("\\Imagick", false))
				{
					$ok = true;
					$detail[] = "Imagick class";
				}

				// Last resort: construct (may autoload on some hosts).
				if (!$ok)
				{
					try
					{
						if (class_exists("Imagick"))
						{
							$im = new Imagick();
							if (method_exists($im, "clear"))  $im->clear();
							if (method_exists($im, "destroy"))  $im->destroy();
							$ok = true;
							$detail[] = "Imagick instance OK";
						}
					}
					catch (Throwable $ex)
					{
						$detail[] = "Imagick error: " . $ex->getMessage();
					}
				}
			}
			else if ($name === "gd")
			{
				if (function_exists("imagecreatetruecolor") || function_exists("gd_info"))
				{
					$ok = true;
					$detail[] = "GD functions";
				}
			}

			return array("ok" => $ok, "detail" => implode(", ", array_unique($detail)));
		};

		$extensions = array(
			"imagick" => array(
				"label" => "ImageMagick (imagick) for thumbnails",
				"optional_if" => "gd"
			),
			"gd" => array(
				"label" => "GD for thumbnails",
				"optional_if" => "imagick"
			)
		);

		$detectcache = array();
		foreach ($extensions as $extension => $info)
		{
			$detectcache[$extension] = $DetectExt($extension);
		}

		foreach ($extensions as $extension => $info)
		{
			$available = !empty($detectcache[$extension]["ok"]);
			$alt = isset($info["optional_if"]) ? $info["optional_if"] : "";
			$altok = ($alt !== "" && !empty($detectcache[$alt]["ok"]));

			// Only hard-error when neither thumbnail backend works.
			if (!$available && !$altok)
			{
				$errors["extension|" . $extension] = "Missing " . $info["label"] . ". Install PHP imagick or gd for image thumbnails.";
			}

			if ($available)
			{
				$extra = $detectcache[$extension]["detail"];
				$valuetext = "Yes.  Test passed." . ($extra !== "" ? " [" . $extra . "]" : "");
			}
			else if ($altok)
			{
				$valuetext = "No in this PHP process — optional because '" . $alt . "' works.";
			}
			else
			{
				$valuetext = "No.  Not detected in this PHP process (check the same PHP version/SAPI used by the site).";
			}

			$contentopts["fields"][] = array(
				"title" => "'" . $extension . "' available",
				"type" => "static",
				"name" => "extension|" . $extension,
				"value" => $valuetext
			);
		}

		$ff->Generate($contentopts, $errors);

		OutputFooter();
	}
	else
	{
		OutputHeader("Welcome", 0);

		// Only copy known safe installer hints from the query string.
		$allowed_get = array("projects_path", "projects_url", "dot_folders", "file_exts_mode", "file_exts", "allow_empty_ext", "new_file_ext", "upload_limit", "recycling", "tabbed", "hide_manager");
		foreach ($allowed_get as $key)
		{
			if (isset($_GET[$key]) && is_string($_GET[$key]))  $_SESSION["fm_admin_install"][$key] = (string)$_GET[$key];
		}

?>
<p class="fm_install_lead">A few minutes to set up Cope Manager — file explorer, code editor, and MySQL tools in one place.</p>
<p>You will check the PHP environment, choose a projects folder, and set a login password (required).</p>
<p><a class="fm_install_cta" href="<?=$ff->GetRequestURLBase()?>?action=step1&sec_t=<?=$ff->CreateSecurityToken("step1")?>">Start installation</a></p>
<?php

		OutputFooter();
	}
?>