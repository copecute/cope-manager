<?php
// Shared security helpers for Cope Manager (sessions, headers, login lockout, config write).
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

	/**
	 * Send hardening headers (safe to call multiple times).
	 */
	function CopeSecurity_Headers()
	{
		if (headers_sent())  return;

		header("X-Frame-Options: DENY");
		header("X-Content-Type-Options: nosniff");
		header("Referrer-Policy: same-origin");
		header("X-XSS-Protection: 0");
		header("Permissions-Policy: geolocation=(), microphone=(), camera=()");
		// Restrictive CSP for admin UI (inline scripts still used by legacy pages).
		if (!defined("COPE_SKIP_CSP") || !COPE_SKIP_CSP)
		{
			header("Content-Security-Policy: frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
		}
	}

	/**
	 * Whether the current request is HTTPS (incl. common proxy headers when trusted).
	 */
	function CopeSecurity_IsHttps()
	{
		if (!empty($_SERVER["HTTPS"]) && $_SERVER["HTTPS"] !== "off")  return true;
		if (isset($_SERVER["SERVER_PORT"]) && (string)$_SERVER["SERVER_PORT"] === "443")  return true;
		if (!empty($_SERVER["HTTP_X_FORWARDED_PROTO"]) && strtolower($_SERVER["HTTP_X_FORWARDED_PROTO"]) === "https")  return true;
		return false;
	}

	/**
	 * Start session with secure cookie params. Idempotent.
	 */
	function CopeSession_Start()
	{
		if (session_status() === PHP_SESSION_ACTIVE)  return;

		$secure = CopeSecurity_IsHttps();
		$path = "/";

		if (PHP_VERSION_ID >= 70300)
		{
			session_set_cookie_params(array(
				"lifetime" => 0,
				"path" => $path,
				"secure" => $secure,
				"httponly" => true,
				"samesite" => "Strict"
			));
		}
		else
		{
			session_set_cookie_params(0, $path . "; samesite=Strict", "", $secure, true);
		}

		@session_start();
	}

	/**
	 * Fully end the admin session (logout).
	 */
	function CopeSession_Destroy()
	{
		CopeSession_Start();

		$_SESSION = array();

		if (ini_get("session.use_cookies"))
		{
			$p = session_get_cookie_params();
			setcookie(session_name(), "", time() - 42000, $p["path"], isset($p["domain"]) ? $p["domain"] : "", !empty($p["secure"]), !empty($p["httponly"]));
		}

		@session_destroy();
	}

	/**
	 * Client IP for rate limiting (REMOTE_ADDR only — do not trust X-Forwarded-For here).
	 */
	function CopeSecurity_ClientIp()
	{
		return isset($_SERVER["REMOTE_ADDR"]) ? (string)$_SERVER["REMOTE_ADDR"] : "0.0.0.0";
	}

	/**
	 * Login lockout file path under data/.
	 */
	function CopeLogin_LockFile()
	{
		$dir = COPE_DATA . "/locks";
		if (!is_dir($dir))  @mkdir($dir, 0775, true);
		if (!is_file($dir . "/.htaccess"))
		{
			@file_put_contents($dir . "/.htaccess", "<IfModule mod_authz_core.c>\n\tRequire all denied\n</IfModule>\n<IfModule !mod_authz_core.c>\n\tDeny from all\n</IfModule>\n");
		}
		if (!is_file($dir . "/index.html"))  @file_put_contents($dir . "/index.html", "");

		return $dir . "/login_" . hash("sha256", CopeSecurity_ClientIp()) . ".json";
	}

	/**
	 * @return array{allowed:bool,retry_after:int,remaining:int}
	 */
	function CopeLogin_CheckRateLimit($maxAttempts = 5, $windowSec = 900, $lockSec = 900)
	{
		$file = CopeLogin_LockFile();
		$now = time();
		$data = array("fails" => array(), "locked_until" => 0);

		if (is_file($file))
		{
			$raw = @file_get_contents($file);
			$parsed = @json_decode($raw, true);
			if (is_array($parsed))  $data = array_merge($data, $parsed);
		}

		if (!empty($data["locked_until"]) && (int)$data["locked_until"] > $now)
		{
			return array("allowed" => false, "retry_after" => (int)$data["locked_until"] - $now, "remaining" => 0);
		}

		$fails = array();
		if (isset($data["fails"]) && is_array($data["fails"]))
		{
			foreach ($data["fails"] as $ts)
			{
				$ts = (int)$ts;
				if ($ts > $now - $windowSec)  $fails[] = $ts;
			}
		}

		$remaining = max(0, $maxAttempts - count($fails));
		return array("allowed" => true, "retry_after" => 0, "remaining" => $remaining);
	}

	function CopeLogin_RecordFailure($maxAttempts = 5, $windowSec = 900, $lockSec = 900)
	{
		$file = CopeLogin_LockFile();
		$now = time();
		$data = array("fails" => array(), "locked_until" => 0);

		if (is_file($file))
		{
			$raw = @file_get_contents($file);
			$parsed = @json_decode($raw, true);
			if (is_array($parsed))  $data = array_merge($data, $parsed);
		}

		$fails = array();
		if (isset($data["fails"]) && is_array($data["fails"]))
		{
			foreach ($data["fails"] as $ts)
			{
				$ts = (int)$ts;
				if ($ts > $now - $windowSec)  $fails[] = $ts;
			}
		}
		$fails[] = $now;

		$locked_until = 0;
		if (count($fails) >= $maxAttempts)  $locked_until = $now + $lockSec;

		@file_put_contents($file, json_encode(array("fails" => $fails, "locked_until" => $locked_until)), LOCK_EX);
	}

	function CopeLogin_ClearFailures()
	{
		$file = CopeLogin_LockFile();
		if (is_file($file))  @unlink($file);
	}

	/**
	 * Write config.php with a bootstrap guard so direct HTTP hits return 403 even without Apache rules.
	 */
	function CopeConfig_Write($config)
	{
		$data = "<" . "?php\n";
		$data .= "// Auto-generated by Cope Manager. Do not edit while the app is running.\n";
		$data .= "if (!defined(\"COPE_BOOTSTRAPPED\")) { http_response_code(403); exit(\"Forbidden\"); }\n";
		$data .= "\$config = " . var_export($config, true) . ";\n";

		$filename = COPE_CONFIG;
		if (@file_put_contents($filename, $data, LOCK_EX) === false)  return false;

		if (function_exists("opcache_invalidate"))  @opcache_invalidate($filename, true);

		return true;
	}

	/**
	 * Absolute URL path to the installer (e.g. /cope-manager/copecute/install.php).
	 */
	function CopeUrl_Install()
	{
		$script = isset($_SERVER["SCRIPT_NAME"]) ? str_replace("\\", "/", (string)$_SERVER["SCRIPT_NAME"]) : "/index.php";
		$base = str_replace("\\", "/", dirname($script));

		// When the entry script lives under copecute/ (e.g. install itself), go up one level.
		if (strtolower(basename($base)) === strtolower(COPE_URL))  $base = str_replace("\\", "/", dirname($base));

		if ($base === "/" || $base === "\\" || $base === ".")  $base = "";
		else  $base = rtrim($base, "/");

		return $base . "/" . COPE_URL . "/install.php";
	}

	/**
	 * Reject using the Cope Manager directory itself as projects_path.
	 */
	function CopePath_IsForbiddenProjectsPath($path)
	{
		$path = rtrim(str_replace("\\", "/", (string)$path), "/");
		$manager = rtrim(str_replace("\\", "/", COPE_DIR), "/");
		$rp = @realpath($path);
		$rm = @realpath($manager);
		if ($rp)  $path = rtrim(str_replace("\\", "/", $rp), "/");
		if ($rm)  $manager = rtrim(str_replace("\\", "/", $rm), "/");

		// Never use the app directory itself (or a subdirectory of it) as file storage root.
		if ($path === $manager)  return true;
		if ($manager !== "" && strpos($path . "/", $manager . "/") === 0)  return true;

		return false;
	}
