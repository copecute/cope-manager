<?php
// Cope Manager path bootstrap.
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

	if (defined("COPE_BOOTSTRAPPED"))  return;
	define("COPE_BOOTSTRAPPED", true);

	define("COPE_DIR", str_replace("\\", "/", __DIR__));
	define("COPE_WEB_ROOT", str_replace("\\", "/", dirname(__DIR__)));
	define("COPE_PHP", COPE_DIR . "/php");
	define("COPE_JS", COPE_DIR . "/js");
	define("COPE_CSS", COPE_DIR . "/css");
	define("COPE_IMG", COPE_DIR . "/img");
	define("COPE_THUMB", COPE_DIR . "/thumb");
	define("COPE_DATA", COPE_DIR . "/data");
	define("COPE_CONFIG", COPE_DIR . "/config.php");

	// URL path segment from the web root (folder name).
	define("COPE_URL", "copecute");
	define("COPE_JS_URL", COPE_URL . "/js");
	define("COPE_CSS_URL", COPE_URL . "/css");
	define("COPE_IMG_URL", COPE_URL . "/img");
	define("COPE_THUMB_URL", COPE_URL . "/thumb");

	// Used by page_basics / BB_GeneratePage asset tokens (CSS-heavy admin chrome).
	if (!defined("BB_SUPPORT_PATH"))  define("BB_SUPPORT_PATH", COPE_CSS_URL);
