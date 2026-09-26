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

class MySQLHelper
{
	public static function NormalizeServers($servers)
	{
		if (!is_array($servers))  return array();

		$out = array();
		foreach ($servers as $s)
		{
			if (!is_array($s))  continue;

			$id = isset($s["id"]) ? (string)$s["id"] : "";
			if ($id === "")  $id = self::NewId();

			$out[] = array(
				"id" => $id,
				"name" => isset($s["name"]) ? (string)$s["name"] : "MySQL",
				"host" => isset($s["host"]) ? (string)$s["host"] : "127.0.0.1",
				"port" => isset($s["port"]) ? (int)$s["port"] : 3306,
				"user" => isset($s["user"]) ? (string)$s["user"] : "",
				"password" => isset($s["password"]) ? (string)$s["password"] : "",
				"database" => isset($s["database"]) ? (string)$s["database"] : ""
			);
		}

		return $out;
	}

	public static function PublicServers($servers)
	{
		$out = array();
		foreach (self::NormalizeServers($servers) as $s)
		{
			$out[] = array(
				"id" => $s["id"],
				"name" => $s["name"],
				"host" => $s["host"],
				"port" => $s["port"],
				"user" => $s["user"],
				"database" => $s["database"],
				"has_password" => ($s["password"] !== "")
			);
		}

		return $out;
	}

	public static function FindServer($servers, $id)
	{
		foreach (self::NormalizeServers($servers) as $s)
		{
			if ($s["id"] === (string)$id)  return $s;
		}

		return false;
	}

	public static function NewId()
	{
		try
		{
			return bin2hex(random_bytes(8));
		}
		catch (Exception $e)
		{
			return uniqid("mysql_", true);
		}
	}

	public static function JsonExit($payload)
	{
		header("Content-Type: application/json; charset=UTF-8");
		echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
		exit();
	}

	public static function Connect($server, $database = null)
	{
		if (!extension_loaded("mysqli"))
		{
			return array("success" => false, "error" => "PHP mysqli extension is not available.");
		}

		$host = $server["host"];
		$port = (int)$server["port"];
		if ($port < 1 || $port > 65535)  $port = 3306;

		$mysqli = @new mysqli($host, $server["user"], $server["password"], null, $port);
		if ($mysqli->connect_errno)
		{
			return array("success" => false, "error" => "Connection failed: " . $mysqli->connect_error);
		}

		// Avoid fatal mysqli_sql_exception on failed queries (PHP 8.1+).
		if (function_exists("mysqli_report"))  @mysqli_report(MYSQLI_REPORT_OFF);

		$mysqli->set_charset("utf8mb4");

		// null = use server default DB; false = no DB; string = select that DB.
		if ($database === null)  $database = isset($server["database"]) ? $server["database"] : "";
		if ($database === false)  $database = "";

		if ($database !== "" && $database !== false)
		{
			if (!$mysqli->select_db($database))
			{
				$err = $mysqli->error;
				$mysqli->close();
				return array("success" => false, "error" => "Unable to select database: " . $err);
			}
		}

		return array("success" => true, "mysqli" => $mysqli);
	}

	public static function QuoteIdent($name)
	{
		return "`" . str_replace("`", "``", $name) . "`";
	}

	public static function HandleActions(&$config, $writeConfig)
	{
		if (!isset($_REQUEST["action"]) || strpos($_REQUEST["action"], "mysql_") !== 0)  return;

		if (!isset($config["mysql_servers"]) || !is_array($config["mysql_servers"]))  $config["mysql_servers"] = array();

		$action = (string)$_REQUEST["action"];

		if ($action === "mysql_list_servers")
		{
			self::JsonExit(array(
				"success" => true,
				"servers" => self::PublicServers($config["mysql_servers"]),
				"mysqli" => extension_loaded("mysqli")
			));
		}

		if ($action === "mysql_save_server")
		{
			$id = isset($_REQUEST["id"]) ? trim((string)$_REQUEST["id"]) : "";
			$name = isset($_REQUEST["name"]) ? trim((string)$_REQUEST["name"]) : "";
			$host = isset($_REQUEST["host"]) ? trim((string)$_REQUEST["host"]) : "";
			$port = isset($_REQUEST["port"]) ? (int)$_REQUEST["port"] : 3306;
			$user = isset($_REQUEST["user"]) ? (string)$_REQUEST["user"] : "";
			$password = isset($_REQUEST["password"]) ? (string)$_REQUEST["password"] : "";
			$keep_password = isset($_REQUEST["keep_password"]) && ($_REQUEST["keep_password"] === "1" || $_REQUEST["keep_password"] === "true");
			$database = isset($_REQUEST["database"]) ? trim((string)$_REQUEST["database"]) : "";

			if ($name === "")  $name = $host !== "" ? $host : "MySQL";
			if ($host === "")  self::JsonExit(array("success" => false, "error" => "Host is required."));
			if ($port < 1 || $port > 65535)  $port = 3306;

			$servers = self::NormalizeServers($config["mysql_servers"]);
			$found = false;

			foreach ($servers as &$s)
			{
				if ($id !== "" && $s["id"] === $id)
				{
					$s["name"] = $name;
					$s["host"] = $host;
					$s["port"] = $port;
					$s["user"] = $user;
					$s["database"] = $database;
					if (!$keep_password)  $s["password"] = $password;
					$found = true;
					$id = $s["id"];
					break;
				}
			}
			unset($s);

			if (!$found)
			{
				$id = self::NewId();
				$servers[] = array(
					"id" => $id,
					"name" => $name,
					"host" => $host,
					"port" => $port,
					"user" => $user,
					"password" => $password,
					"database" => $database
				);
			}

			$config["mysql_servers"] = $servers;
			if (!$writeConfig($config))  self::JsonExit(array("success" => false, "error" => "Unable to write config.php."));

			self::JsonExit(array(
				"success" => true,
				"servers" => self::PublicServers($config["mysql_servers"]),
				"id" => $id
			));
		}

		if ($action === "mysql_delete_server")
		{
			$id = isset($_REQUEST["id"]) ? (string)$_REQUEST["id"] : "";
			$servers = array();
			foreach (self::NormalizeServers($config["mysql_servers"]) as $s)
			{
				if ($s["id"] !== $id)  $servers[] = $s;
			}

			$config["mysql_servers"] = $servers;
			if (!$writeConfig($config))  self::JsonExit(array("success" => false, "error" => "Unable to write config.php."));

			self::JsonExit(array("success" => true, "servers" => self::PublicServers($config["mysql_servers"])));
		}

		if ($action === "mysql_test_connection" || $action === "mysql_connect")
		{
			if (isset($_REQUEST["server_id"]) && (string)$_REQUEST["server_id"] !== "")
			{
				$server = self::ResolveServerFromRequest($config);
				if (!$server["success"])  self::JsonExit($server);
				$srv = $server["server"];
			}
			else
			{
				$srv = array(
					"host" => isset($_REQUEST["host"]) ? trim((string)$_REQUEST["host"]) : "",
					"port" => isset($_REQUEST["port"]) ? (int)$_REQUEST["port"] : 3306,
					"user" => isset($_REQUEST["user"]) ? (string)$_REQUEST["user"] : "",
					"password" => isset($_REQUEST["password"]) ? (string)$_REQUEST["password"] : "",
					"database" => isset($_REQUEST["database"]) ? trim((string)$_REQUEST["database"]) : ""
				);
				if ($srv["host"] === "")  self::JsonExit(array("success" => false, "error" => "Host is required."));
			}

			$conn = self::Connect($srv);
			if (!$conn["success"])  self::JsonExit($conn);

			$info = array(
				"server_info" => $conn["mysqli"]->server_info,
				"host_info" => $conn["mysqli"]->host_info,
				"protocol_version" => $conn["mysqli"]->protocol_version,
				"character_set" => $conn["mysqli"]->character_set_name()
			);
			$conn["mysqli"]->close();

			self::JsonExit(array("success" => true, "info" => $info));
		}

		if ($action === "mysql_list_databases")
		{
			$server = self::ResolveServerFromRequest($config);
			if (!$server["success"])  self::JsonExit($server);

			$conn = self::Connect($server["server"], false);
			if (!$conn["success"])  self::JsonExit($conn);

			$mysqli = $conn["mysqli"];
			$result = $mysqli->query("SHOW DATABASES");
			if (!$result)
			{
				$err = $mysqli->error;
				$mysqli->close();
				self::JsonExit(array("success" => false, "error" => $err));
			}

			$dbs = array();
			while ($row = $result->fetch_row())  $dbs[] = $row[0];
			$result->free();
			$mysqli->close();

			self::JsonExit(array("success" => true, "databases" => $dbs));
		}

		if ($action === "mysql_create_database")
		{
			$server = self::ResolveServerFromRequest($config);
			if (!$server["success"])  self::JsonExit($server);

			$name = isset($_REQUEST["name"]) ? trim((string)$_REQUEST["name"]) : "";
			if ($name === "" || !preg_match('/^[A-Za-z0-9_\$]+$/', $name))
			{
				self::JsonExit(array("success" => false, "error" => "Invalid database name."));
			}

			$conn = self::Connect($server["server"], false);
			if (!$conn["success"])  self::JsonExit($conn);

			$mysqli = $conn["mysqli"];
			$sql = "CREATE DATABASE " . self::QuoteIdent($name) . " CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci";
			$ok = $mysqli->query($sql);
			$err = $mysqli->error;
			$mysqli->close();

			if (!$ok)  self::JsonExit(array("success" => false, "error" => $err));
			self::JsonExit(array("success" => true));
		}

		if ($action === "mysql_drop_database")
		{
			$server = self::ResolveServerFromRequest($config);
			if (!$server["success"])  self::JsonExit($server);

			$name = isset($_REQUEST["name"]) ? trim((string)$_REQUEST["name"]) : "";
			if ($name === "" || !preg_match('/^[A-Za-z0-9_\$]+$/', $name))
			{
				self::JsonExit(array("success" => false, "error" => "Invalid database name."));
			}

			$conn = self::Connect($server["server"], false);
			if (!$conn["success"])  self::JsonExit($conn);

			$mysqli = $conn["mysqli"];
			$ok = $mysqli->query("DROP DATABASE " . self::QuoteIdent($name));
			$err = $mysqli->error;
			$mysqli->close();

			if (!$ok)  self::JsonExit(array("success" => false, "error" => $err));
			self::JsonExit(array("success" => true));
		}

		if ($action === "mysql_list_tables")
		{
			$server = self::ResolveServerFromRequest($config);
			if (!$server["success"])  self::JsonExit($server);

			$database = isset($_REQUEST["database"]) ? trim((string)$_REQUEST["database"]) : "";
			if ($database === "")  self::JsonExit(array("success" => false, "error" => "Database is required."));

			$conn = self::Connect($server["server"], $database);
			if (!$conn["success"])  self::JsonExit($conn);

			$mysqli = $conn["mysqli"];
			$result = $mysqli->query("SHOW FULL TABLES");
			if (!$result)
			{
				$err = $mysqli->error;
				$mysqli->close();
				self::JsonExit(array("success" => false, "error" => $err));
			}

			$tables = array();
			while ($row = $result->fetch_row())
			{
				$tables[] = array(
					"name" => $row[0],
					"type" => isset($row[1]) ? $row[1] : "BASE TABLE"
				);
			}
			$result->free();
			$mysqli->close();

			self::JsonExit(array("success" => true, "tables" => $tables));
		}

		if ($action === "mysql_table_structure")
		{
			$server = self::ResolveServerFromRequest($config);
			if (!$server["success"])  self::JsonExit($server);

			$database = isset($_REQUEST["database"]) ? trim((string)$_REQUEST["database"]) : "";
			$table = isset($_REQUEST["table"]) ? trim((string)$_REQUEST["table"]) : "";
			if ($database === "" || $table === "")  self::JsonExit(array("success" => false, "error" => "Database and table are required."));

			$conn = self::Connect($server["server"], $database);
			if (!$conn["success"])  self::JsonExit($conn);

			$mysqli = $conn["mysqli"];
			$result = $mysqli->query("SHOW FULL COLUMNS FROM " . self::QuoteIdent($table));
			if (!$result)
			{
				$err = $mysqli->error;
				$mysqli->close();
				self::JsonExit(array("success" => false, "error" => $err));
			}

			$columns = array();
			while ($row = $result->fetch_assoc())  $columns[] = $row;
			$result->free();

			$indexes = array();
			$idx = $mysqli->query("SHOW INDEX FROM " . self::QuoteIdent($table));
			if ($idx)
			{
				while ($row = $idx->fetch_assoc())  $indexes[] = $row;
				$idx->free();
			}

			$mysqli->close();
			self::JsonExit(array("success" => true, "columns" => $columns, "indexes" => $indexes));
		}

		if ($action === "mysql_browse_table")
		{
			$server = self::ResolveServerFromRequest($config);
			if (!$server["success"])  self::JsonExit($server);

			$database = isset($_REQUEST["database"]) ? trim((string)$_REQUEST["database"]) : "";
			$table = isset($_REQUEST["table"]) ? trim((string)$_REQUEST["table"]) : "";
			$offset = isset($_REQUEST["offset"]) ? max(0, (int)$_REQUEST["offset"]) : 0;
			$limit = isset($_REQUEST["limit"]) ? (int)$_REQUEST["limit"] : 50;
			if ($limit < 1)  $limit = 50;
			if ($limit > 500)  $limit = 500;
			$search = isset($_REQUEST["search"]) ? trim((string)$_REQUEST["search"]) : "";

			if ($database === "" || $table === "")  self::JsonExit(array("success" => false, "error" => "Database and table are required."));

			$conn = self::Connect($server["server"], $database);
			if (!$conn["success"])  self::JsonExit($conn);

			$mysqli = $conn["mysqli"];
			$qtable = self::QuoteIdent($table);

			$whereSql = "";
			if ($search !== "")
			{
				$colsResult = $mysqli->query("SHOW COLUMNS FROM " . $qtable);
				$likeParts = array();
				if ($colsResult)
				{
					$esc = $mysqli->real_escape_string($search);
					while ($col = $colsResult->fetch_assoc())
					{
						$likeParts[] = self::QuoteIdent($col["Field"]) . " LIKE '%" . $esc . "%'";
					}
					$colsResult->free();
				}
				if (count($likeParts))  $whereSql = " WHERE (" . implode(" OR ", $likeParts) . ")";
			}

			$total = 0;
			$cnt = $mysqli->query("SELECT COUNT(*) AS c FROM " . $qtable . $whereSql);
			if ($cnt)
			{
				$row = $cnt->fetch_assoc();
				$total = isset($row["c"]) ? (int)$row["c"] : 0;
				$cnt->free();
			}

			$sql = "SELECT * FROM " . $qtable . $whereSql . " LIMIT " . (int)$limit . " OFFSET " . (int)$offset;
			$result = $mysqli->query($sql);
			if (!$result)
			{
				$err = $mysqli->error;
				$mysqli->close();
				self::JsonExit(array("success" => false, "error" => $err));
			}

			$columns = array();
			$fields = $result->fetch_fields();
			foreach ($fields as $f)  $columns[] = $f->name;

			$rows = array();
			while ($row = $result->fetch_assoc())
			{
				$out = array();
				foreach ($row as $k => $v)
				{
					if ($v === null)  $out[$k] = null;
					else if (is_string($v) && strlen($v) > 2000)  $out[$k] = substr($v, 0, 2000) . "…";
					else  $out[$k] = $v;
				}
				$rows[] = $out;
			}
			$result->free();

			$pks = self::GetPrimaryKeys($mysqli, $table);

			$mysqli->close();

			self::JsonExit(array(
				"success" => true,
				"columns" => $columns,
				"rows" => $rows,
				"total" => $total,
				"offset" => $offset,
				"limit" => $limit,
				"sql" => $sql,
				"search" => $search,
				"primary_keys" => $pks
			));
		}

		if ($action === "mysql_insert_row")
		{
			$server = self::ResolveServerFromRequest($config);
			if (!$server["success"])  self::JsonExit($server);

			$database = isset($_REQUEST["database"]) ? trim((string)$_REQUEST["database"]) : "";
			$table = isset($_REQUEST["table"]) ? trim((string)$_REQUEST["table"]) : "";
			$values = self::DecodeJsonField("values");
			$nulls = self::DecodeJsonField("nulls");
			if (!is_array($nulls))  $nulls = array();

			if ($database === "" || $table === "")  self::JsonExit(array("success" => false, "error" => "Database and table are required."));
			if (!is_array($values) || !count($values))  self::JsonExit(array("success" => false, "error" => "No values provided."));

			$conn = self::Connect($server["server"], $database);
			if (!$conn["success"])  self::JsonExit($conn);

			$mysqli = $conn["mysqli"];
			$cols = array();
			$placeholders = array();
			$bindTypes = "";
			$bindValues = array();

			foreach ($values as $col => $val)
			{
				$cols[] = self::QuoteIdent($col);
				if (isset($nulls[$col]) && ($nulls[$col] === true || $nulls[$col] === 1 || $nulls[$col] === "1"))
				{
					$placeholders[] = "NULL";
				}
				else
				{
					$placeholders[] = "?";
					$bindTypes .= "s";
					$bindValues[] = (string)$val;
				}
			}

			$sql = "INSERT INTO " . self::QuoteIdent($table) . " (" . implode(", ", $cols) . ") VALUES (" . implode(", ", $placeholders) . ")";
			$stmt = $mysqli->prepare($sql);
			if (!$stmt)
			{
				$err = $mysqli->error;
				$mysqli->close();
				self::JsonExit(array("success" => false, "error" => $err, "sql" => $sql));
			}

			if ($bindTypes !== "")
			{
				$refs = array($bindTypes);
				foreach ($bindValues as $k => $v)  $refs[] = &$bindValues[$k];
				call_user_func_array(array($stmt, "bind_param"), $refs);
			}

			$ok = $stmt->execute();
			$err = $stmt->error;
			$insertId = $mysqli->insert_id;
			$affected = $stmt->affected_rows;
			$stmt->close();
			$mysqli->close();

			if (!$ok)  self::JsonExit(array("success" => false, "error" => $err));
			self::JsonExit(array("success" => true, "insert_id" => $insertId, "affected_rows" => $affected));
		}

		if ($action === "mysql_update_row")
		{
			$server = self::ResolveServerFromRequest($config);
			if (!$server["success"])  self::JsonExit($server);

			$database = isset($_REQUEST["database"]) ? trim((string)$_REQUEST["database"]) : "";
			$table = isset($_REQUEST["table"]) ? trim((string)$_REQUEST["table"]) : "";
			$values = self::DecodeJsonField("values");
			$nulls = self::DecodeJsonField("nulls");
			$where = self::DecodeJsonField("where");
			if (!is_array($nulls))  $nulls = array();

			if ($database === "" || $table === "")  self::JsonExit(array("success" => false, "error" => "Database and table are required."));
			if (!is_array($values) || !count($values))  self::JsonExit(array("success" => false, "error" => "No values provided."));
			if (!is_array($where) || !count($where))  self::JsonExit(array("success" => false, "error" => "WHERE keys are required."));

			$conn = self::Connect($server["server"], $database);
			if (!$conn["success"])  self::JsonExit($conn);

			$mysqli = $conn["mysqli"];
			$setParts = array();
			$whereParts = array();
			$bindTypes = "";
			$bindValues = array();

			foreach ($values as $col => $val)
			{
				if (isset($nulls[$col]) && ($nulls[$col] === true || $nulls[$col] === 1 || $nulls[$col] === "1"))
				{
					$setParts[] = self::QuoteIdent($col) . " = NULL";
				}
				else
				{
					$setParts[] = self::QuoteIdent($col) . " = ?";
					$bindTypes .= "s";
					$bindValues[] = (string)$val;
				}
			}

			foreach ($where as $col => $val)
			{
				if ($val === null)
				{
					$whereParts[] = self::QuoteIdent($col) . " IS NULL";
				}
				else
				{
					$whereParts[] = self::QuoteIdent($col) . " = ?";
					$bindTypes .= "s";
					$bindValues[] = (string)$val;
				}
			}

			$sql = "UPDATE " . self::QuoteIdent($table) . " SET " . implode(", ", $setParts) . " WHERE " . implode(" AND ", $whereParts) . " LIMIT 1";
			$stmt = $mysqli->prepare($sql);
			if (!$stmt)
			{
				$err = $mysqli->error;
				$mysqli->close();
				self::JsonExit(array("success" => false, "error" => $err));
			}

			if ($bindTypes !== "")
			{
				$refs = array($bindTypes);
				foreach ($bindValues as $k => $v)  $refs[] = &$bindValues[$k];
				call_user_func_array(array($stmt, "bind_param"), $refs);
			}

			$ok = $stmt->execute();
			$err = $stmt->error;
			$affected = $stmt->affected_rows;
			$stmt->close();
			$mysqli->close();

			if (!$ok)  self::JsonExit(array("success" => false, "error" => $err));
			self::JsonExit(array("success" => true, "affected_rows" => $affected));
		}

		if ($action === "mysql_delete_row")
		{
			$server = self::ResolveServerFromRequest($config);
			if (!$server["success"])  self::JsonExit($server);

			$database = isset($_REQUEST["database"]) ? trim((string)$_REQUEST["database"]) : "";
			$table = isset($_REQUEST["table"]) ? trim((string)$_REQUEST["table"]) : "";
			$where = self::DecodeJsonField("where");

			if ($database === "" || $table === "")  self::JsonExit(array("success" => false, "error" => "Database and table are required."));
			if (!is_array($where) || !count($where))  self::JsonExit(array("success" => false, "error" => "WHERE keys are required."));

			$conn = self::Connect($server["server"], $database);
			if (!$conn["success"])  self::JsonExit($conn);

			$mysqli = $conn["mysqli"];
			$whereParts = array();
			$bindTypes = "";
			$bindValues = array();

			foreach ($where as $col => $val)
			{
				if ($val === null)
				{
					$whereParts[] = self::QuoteIdent($col) . " IS NULL";
				}
				else
				{
					$whereParts[] = self::QuoteIdent($col) . " = ?";
					$bindTypes .= "s";
					$bindValues[] = (string)$val;
				}
			}

			$sql = "DELETE FROM " . self::QuoteIdent($table) . " WHERE " . implode(" AND ", $whereParts) . " LIMIT 1";
			$stmt = $mysqli->prepare($sql);
			if (!$stmt)
			{
				$err = $mysqli->error;
				$mysqli->close();
				self::JsonExit(array("success" => false, "error" => $err));
			}

			if ($bindTypes !== "")
			{
				$refs = array($bindTypes);
				foreach ($bindValues as $k => $v)  $refs[] = &$bindValues[$k];
				call_user_func_array(array($stmt, "bind_param"), $refs);
			}

			$ok = $stmt->execute();
			$err = $stmt->error;
			$affected = $stmt->affected_rows;
			$stmt->close();
			$mysqli->close();

			if (!$ok)  self::JsonExit(array("success" => false, "error" => $err));
			self::JsonExit(array("success" => true, "affected_rows" => $affected));
		}

		if ($action === "mysql_drop_table")
		{
			$server = self::ResolveServerFromRequest($config);
			if (!$server["success"])  self::JsonExit($server);

			$database = isset($_REQUEST["database"]) ? trim((string)$_REQUEST["database"]) : "";
			$table = isset($_REQUEST["table"]) ? trim((string)$_REQUEST["table"]) : "";
			if ($database === "" || $table === "")  self::JsonExit(array("success" => false, "error" => "Database and table are required."));

			$conn = self::Connect($server["server"], $database);
			if (!$conn["success"])  self::JsonExit($conn);

			$mysqli = $conn["mysqli"];
			$ok = $mysqli->query("DROP TABLE " . self::QuoteIdent($table));
			$err = $mysqli->error;
			$mysqli->close();

			if (!$ok)  self::JsonExit(array("success" => false, "error" => $err));
			self::JsonExit(array("success" => true));
		}

		if ($action === "mysql_rename_table")
		{
			$server = self::ResolveServerFromRequest($config);
			if (!$server["success"])  self::JsonExit($server);

			$database = isset($_REQUEST["database"]) ? trim((string)$_REQUEST["database"]) : "";
			$table = isset($_REQUEST["table"]) ? trim((string)$_REQUEST["table"]) : "";
			$new_name = isset($_REQUEST["new_name"]) ? trim((string)$_REQUEST["new_name"]) : "";
			if ($database === "" || $table === "" || $new_name === "")  self::JsonExit(array("success" => false, "error" => "Database, table, and new_name are required."));
			if (!preg_match('/^[A-Za-z0-9_\$]+$/', $new_name))  self::JsonExit(array("success" => false, "error" => "Invalid new table name."));

			$conn = self::Connect($server["server"], $database);
			if (!$conn["success"])  self::JsonExit($conn);

			$mysqli = $conn["mysqli"];
			$ok = $mysqli->query("RENAME TABLE " . self::QuoteIdent($table) . " TO " . self::QuoteIdent($new_name));
			$err = $mysqli->error;
			$mysqli->close();

			if (!$ok)  self::JsonExit(array("success" => false, "error" => $err));
			self::JsonExit(array("success" => true, "new_name" => $new_name));
		}

		if ($action === "mysql_truncate_table")
		{
			$server = self::ResolveServerFromRequest($config);
			if (!$server["success"])  self::JsonExit($server);

			$database = isset($_REQUEST["database"]) ? trim((string)$_REQUEST["database"]) : "";
			$table = isset($_REQUEST["table"]) ? trim((string)$_REQUEST["table"]) : "";
			if ($database === "" || $table === "")  self::JsonExit(array("success" => false, "error" => "Database and table are required."));

			$conn = self::Connect($server["server"], $database);
			if (!$conn["success"])  self::JsonExit($conn);

			$mysqli = $conn["mysqli"];
			$ok = $mysqli->query("TRUNCATE TABLE " . self::QuoteIdent($table));
			$err = $mysqli->error;
			$mysqli->close();

			if (!$ok)  self::JsonExit(array("success" => false, "error" => $err));
			self::JsonExit(array("success" => true));
		}

		if ($action === "mysql_copy_table")
		{
			$server = self::ResolveServerFromRequest($config);
			if (!$server["success"])  self::JsonExit($server);

			$database = isset($_REQUEST["database"]) ? trim((string)$_REQUEST["database"]) : "";
			$table = isset($_REQUEST["table"]) ? trim((string)$_REQUEST["table"]) : "";
			$new_name = isset($_REQUEST["new_name"]) ? trim((string)$_REQUEST["new_name"]) : "";
			$with_data = !(isset($_REQUEST["with_data"]) && ($_REQUEST["with_data"] === "0" || $_REQUEST["with_data"] === "false"));
			if ($database === "" || $table === "" || $new_name === "")  self::JsonExit(array("success" => false, "error" => "Database, table, and new_name are required."));
			if (!preg_match('/^[A-Za-z0-9_\$]+$/', $new_name))  self::JsonExit(array("success" => false, "error" => "Invalid new table name."));

			$conn = self::Connect($server["server"], $database);
			if (!$conn["success"])  self::JsonExit($conn);

			$mysqli = $conn["mysqli"];
			$ok = $mysqli->query("CREATE TABLE " . self::QuoteIdent($new_name) . " LIKE " . self::QuoteIdent($table));
			if (!$ok)
			{
				$err = $mysqli->error;
				$mysqli->close();
				self::JsonExit(array("success" => false, "error" => $err));
			}

			if ($with_data)
			{
				$ok = $mysqli->query("INSERT INTO " . self::QuoteIdent($new_name) . " SELECT * FROM " . self::QuoteIdent($table));
				if (!$ok)
				{
					$err = $mysqli->error;
					$mysqli->close();
					self::JsonExit(array("success" => false, "error" => $err));
				}
			}

			$mysqli->close();
			self::JsonExit(array("success" => true, "new_name" => $new_name));
		}

		if ($action === "mysql_export_table")
		{
			$server = self::ResolveServerFromRequest($config);
			if (!$server["success"])  self::JsonExit($server);

			$database = isset($_REQUEST["database"]) ? trim((string)$_REQUEST["database"]) : "";
			$table = isset($_REQUEST["table"]) ? trim((string)$_REQUEST["table"]) : "";
			$format = isset($_REQUEST["format"]) ? strtolower(trim((string)$_REQUEST["format"])) : "sql";
			$max_rows = isset($_REQUEST["max_rows"]) ? (int)$_REQUEST["max_rows"] : 5000;
			if ($max_rows < 1)  $max_rows = 5000;
			if ($max_rows > 20000)  $max_rows = 20000;
			if ($database === "" || $table === "")  self::JsonExit(array("success" => false, "error" => "Database and table are required."));

			$conn = self::Connect($server["server"], $database);
			if (!$conn["success"])  self::JsonExit($conn);

			$mysqli = $conn["mysqli"];
			$qtable = self::QuoteIdent($table);

			if ($format === "csv")
			{
				$result = $mysqli->query("SELECT * FROM " . $qtable . " LIMIT " . (int)$max_rows);
				if (!$result)
				{
					$err = $mysqli->error;
					$mysqli->close();
					self::JsonExit(array("success" => false, "error" => $err));
				}

				$fields = $result->fetch_fields();
				$lines = array();
				$header = array();
				foreach ($fields as $f)  $header[] = self::CsvEscape($f->name);
				$lines[] = implode(",", $header);

				while ($row = $result->fetch_assoc())
				{
					$cells = array();
					foreach ($row as $v)  $cells[] = self::CsvEscape($v);
					$lines[] = implode(",", $cells);
				}
				$result->free();
				$mysqli->close();

				self::JsonExit(array(
					"success" => true,
					"format" => "csv",
					"filename" => $table . ".csv",
					"content" => implode("\n", $lines)
				));
			}

			// Default: SQL dump
			$create = "";
			$cr = $mysqli->query("SHOW CREATE TABLE " . $qtable);
			if ($cr)
			{
				$row = $cr->fetch_array();
				if (isset($row[1]))  $create = $row[1];
				$cr->free();
			}

			$result = $mysqli->query("SELECT * FROM " . $qtable . " LIMIT " . (int)$max_rows);
			if (!$result)
			{
				$err = $mysqli->error;
				$mysqli->close();
				self::JsonExit(array("success" => false, "error" => $err));
			}

			$fields = $result->fetch_fields();
			$colNames = array();
			foreach ($fields as $f)  $colNames[] = self::QuoteIdent($f->name);

			$out = array();
			$out[] = "-- Cope Manager export";
			$out[] = "-- Table: " . $table;
			$out[] = "";
			if ($create !== "")
			{
				$out[] = "DROP TABLE IF EXISTS " . $qtable . ";";
				$out[] = $create . ";";
				$out[] = "";
			}

			while ($row = $result->fetch_assoc())
			{
				$vals = array();
				foreach ($row as $v)
				{
					if ($v === null)  $vals[] = "NULL";
					else  $vals[] = "'" . $mysqli->real_escape_string($v) . "'";
				}
				$out[] = "INSERT INTO " . $qtable . " (" . implode(", ", $colNames) . ") VALUES (" . implode(", ", $vals) . ");";
			}
			$result->free();
			$mysqli->close();

			self::JsonExit(array(
				"success" => true,
				"format" => "sql",
				"filename" => $table . ".sql",
				"content" => implode("\n", $out)
			));
		}

		if ($action === "mysql_bulk_delete_rows")
		{
			$server = self::ResolveServerFromRequest($config);
			if (!$server["success"])  self::JsonExit($server);

			$database = isset($_REQUEST["database"]) ? trim((string)$_REQUEST["database"]) : "";
			$table = isset($_REQUEST["table"]) ? trim((string)$_REQUEST["table"]) : "";
			$rows = self::DecodeJsonField("rows");
			if ($database === "" || $table === "")  self::JsonExit(array("success" => false, "error" => "Database and table are required."));
			if (!is_array($rows) || !count($rows))  self::JsonExit(array("success" => false, "error" => "No rows provided."));

			$conn = self::Connect($server["server"], $database);
			if (!$conn["success"])  self::JsonExit($conn);

			$mysqli = $conn["mysqli"];
			$deleted = 0;
			foreach ($rows as $where)
			{
				if (!is_array($where) || !count($where))  continue;

				$whereParts = array();
				$bindTypes = "";
				$bindValues = array();
				foreach ($where as $col => $val)
				{
					if ($val === null)
					{
						$whereParts[] = self::QuoteIdent($col) . " IS NULL";
					}
					else
					{
						$whereParts[] = self::QuoteIdent($col) . " = ?";
						$bindTypes .= "s";
						$bindValues[] = (string)$val;
					}
				}

				$sql = "DELETE FROM " . self::QuoteIdent($table) . " WHERE " . implode(" AND ", $whereParts) . " LIMIT 1";
				$stmt = $mysqli->prepare($sql);
				if (!$stmt)  continue;

				if ($bindTypes !== "")
				{
					$refs = array($bindTypes);
					foreach ($bindValues as $k => $v)  $refs[] = &$bindValues[$k];
					call_user_func_array(array($stmt, "bind_param"), $refs);
				}

				if ($stmt->execute())  $deleted += $stmt->affected_rows;
				$stmt->close();
			}

			$mysqli->close();
			self::JsonExit(array("success" => true, "affected_rows" => $deleted));
		}

		if ($action === "mysql_show_create")
		{
			$server = self::ResolveServerFromRequest($config);
			if (!$server["success"])  self::JsonExit($server);

			$database = isset($_REQUEST["database"]) ? trim((string)$_REQUEST["database"]) : "";
			$table = isset($_REQUEST["table"]) ? trim((string)$_REQUEST["table"]) : "";
			if ($database === "" || $table === "")  self::JsonExit(array("success" => false, "error" => "Database and table are required."));

			$conn = self::Connect($server["server"], $database);
			if (!$conn["success"])  self::JsonExit($conn);

			$mysqli = $conn["mysqli"];
			$result = $mysqli->query("SHOW CREATE TABLE " . self::QuoteIdent($table));
			if (!$result)
			{
				$err = $mysqli->error;
				$mysqli->close();
				self::JsonExit(array("success" => false, "error" => $err));
			}
			$row = $result->fetch_array();
			$result->free();
			$mysqli->close();

			self::JsonExit(array("success" => true, "create_sql" => isset($row[1]) ? $row[1] : ""));
		}

		if ($action === "mysql_table_ops")
		{
			$server = self::ResolveServerFromRequest($config);
			if (!$server["success"])  self::JsonExit($server);

			$database = isset($_REQUEST["database"]) ? trim((string)$_REQUEST["database"]) : "";
			$op = isset($_REQUEST["op"]) ? trim((string)$_REQUEST["op"]) : "";
			$tables = self::DecodeJsonField("tables");
			$prefix = isset($_REQUEST["prefix"]) ? trim((string)$_REQUEST["prefix"]) : "";
			$from_prefix = isset($_REQUEST["from_prefix"]) ? (string)$_REQUEST["from_prefix"] : "";

			if ($database === "")  self::JsonExit(array("success" => false, "error" => "Database is required."));
			if (!is_array($tables) || !count($tables))  self::JsonExit(array("success" => false, "error" => "No tables selected."));

			$conn = self::Connect($server["server"], $database);
			if (!$conn["success"])  self::JsonExit($conn);

			$mysqli = $conn["mysqli"];
			$results = array();
			$okAll = true;

			foreach ($tables as $table)
			{
				$table = trim((string)$table);
				if ($table === "" || !preg_match('/^[A-Za-z0-9_\$]+$/', $table))
				{
					$results[] = array("table" => $table, "success" => false, "error" => "Invalid table name.");
					$okAll = false;
					continue;
				}

				$q = self::QuoteIdent($table);
				$sql = "";
				$extra = array();

				switch ($op)
				{
					case "empty_tbl":
						$sql = "TRUNCATE TABLE " . $q;
						break;
					case "drop_tbl":
						$sql = "DROP TABLE " . $q;
						break;
					case "analyze_tbl":
						$sql = "ANALYZE TABLE " . $q;
						break;
					case "check_tbl":
						$sql = "CHECK TABLE " . $q;
						break;
					case "checksum_tbl":
						$sql = "CHECKSUM TABLE " . $q;
						break;
					case "optimize_tbl":
						$sql = "OPTIMIZE TABLE " . $q;
						break;
					case "repair_tbl":
						$sql = "REPAIR TABLE " . $q;
						break;
					case "show_create":
						$cr = $mysqli->query("SHOW CREATE TABLE " . $q);
						if ($cr)
						{
							$row = $cr->fetch_array();
							$extra["create_sql"] = isset($row[1]) ? $row[1] : "";
							$cr->free();
							$results[] = array("table" => $table, "success" => true, "create_sql" => $extra["create_sql"]);
						}
						else
						{
							$results[] = array("table" => $table, "success" => false, "error" => $mysqli->error);
							$okAll = false;
						}
						continue 2;
					case "copy_tbl":
						$new = $table . "_copy";
						if (isset($_REQUEST["suffix"]) && trim((string)$_REQUEST["suffix"]) !== "")  $new = $table . trim((string)$_REQUEST["suffix"]);
						if (!preg_match('/^[A-Za-z0-9_\$]+$/', $new))
						{
							$results[] = array("table" => $table, "success" => false, "error" => "Invalid target name.");
							$okAll = false;
							continue 2;
						}
						$sql1 = "CREATE TABLE " . self::QuoteIdent($new) . " LIKE " . $q;
						$sql2 = "INSERT INTO " . self::QuoteIdent($new) . " SELECT * FROM " . $q;
						if (!$mysqli->query($sql1))
						{
							$results[] = array("table" => $table, "success" => false, "error" => $mysqli->error);
							$okAll = false;
							continue 2;
						}
						if (!$mysqli->query($sql2))
						{
							$results[] = array("table" => $table, "success" => false, "error" => $mysqli->error, "new_name" => $new);
							$okAll = false;
							continue 2;
						}
						$results[] = array("table" => $table, "success" => true, "new_name" => $new);
						continue 2;
					case "add_prefix_tbl":
						if ($prefix === "" || !preg_match('/^[A-Za-z0-9_\$]+$/', $prefix))
						{
							$results[] = array("table" => $table, "success" => false, "error" => "Invalid prefix.");
							$okAll = false;
							continue 2;
						}
						$new = $prefix . $table;
						$sql = "RENAME TABLE " . $q . " TO " . self::QuoteIdent($new);
						$extra["new_name"] = $new;
						break;
					case "replace_prefix_tbl":
						if ($prefix === "" || !preg_match('/^[A-Za-z0-9_\$]*$/', $prefix))
						{
							$results[] = array("table" => $table, "success" => false, "error" => "Invalid prefix.");
							$okAll = false;
							continue 2;
						}
						if ($from_prefix !== "" && strpos($table, $from_prefix) === 0)  $new = $prefix . substr($table, strlen($from_prefix));
						else  $new = $prefix . $table;
						if (!preg_match('/^[A-Za-z0-9_\$]+$/', $new))
						{
							$results[] = array("table" => $table, "success" => false, "error" => "Invalid target name.");
							$okAll = false;
							continue 2;
						}
						$sql = "RENAME TABLE " . $q . " TO " . self::QuoteIdent($new);
						$extra["new_name"] = $new;
						break;
					case "copy_tbl_change_prefix":
						if ($prefix === "" || !preg_match('/^[A-Za-z0-9_\$]+$/', $prefix))
						{
							$results[] = array("table" => $table, "success" => false, "error" => "Invalid prefix.");
							$okAll = false;
							continue 2;
						}
						if ($from_prefix !== "" && strpos($table, $from_prefix) === 0)  $new = $prefix . substr($table, strlen($from_prefix));
						else  $new = $prefix . $table;
						if (!preg_match('/^[A-Za-z0-9_\$]+$/', $new))
						{
							$results[] = array("table" => $table, "success" => false, "error" => "Invalid target name.");
							$okAll = false;
							continue 2;
						}
						if (!$mysqli->query("CREATE TABLE " . self::QuoteIdent($new) . " LIKE " . $q))
						{
							$results[] = array("table" => $table, "success" => false, "error" => $mysqli->error);
							$okAll = false;
							continue 2;
						}
						if (!$mysqli->query("INSERT INTO " . self::QuoteIdent($new) . " SELECT * FROM " . $q))
						{
							$results[] = array("table" => $table, "success" => false, "error" => $mysqli->error);
							$okAll = false;
							continue 2;
						}
						$results[] = array("table" => $table, "success" => true, "new_name" => $new);
						continue 2;
					case "export":
						// Handled client-side per table via mysql_export_table; mark ok.
						$results[] = array("table" => $table, "success" => true, "export" => true);
						continue 2;
					default:
						$results[] = array("table" => $table, "success" => false, "error" => "Unknown operation.");
						$okAll = false;
						continue 2;
				}

				if ($sql !== "")
				{
					$qresult = $mysqli->query($sql);
					$entry = array("table" => $table, "success" => ($qresult !== false));
					if ($qresult === false)
					{
						$entry["error"] = $mysqli->error;
						$okAll = false;
					}
					else
					{
						if (isset($extra["new_name"]))  $entry["new_name"] = $extra["new_name"];
						if ($qresult instanceof mysqli_result)
						{
							if (in_array($op, array("analyze_tbl", "check_tbl", "checksum_tbl", "optimize_tbl", "repair_tbl"), true))
							{
								$msgRows = array();
								while ($r = $qresult->fetch_assoc())  $msgRows[] = $r;
								$entry["messages"] = $msgRows;
							}
							$qresult->free();
						}
					}
					$results[] = $entry;
				}
			}

			$mysqli->close();
			self::JsonExit(array("success" => $okAll, "results" => $results, "op" => $op));
		}

		if ($action === "mysql_import_sql")
		{
			$server = self::ResolveServerFromRequest($config);
			if (!$server["success"])  self::JsonExit($server);

			$database = isset($_REQUEST["database"]) ? trim((string)$_REQUEST["database"]) : "";
			$sql = isset($_REQUEST["sql"]) ? (string)$_REQUEST["sql"] : "";
			if ($sql === "" && isset($_FILES["file"]) && is_uploaded_file($_FILES["file"]["tmp_name"]))
			{
				$sql = file_get_contents($_FILES["file"]["tmp_name"]);
			}
			if (trim($sql) === "")  self::JsonExit(array("success" => false, "error" => "No SQL to import."));
			if (strlen($sql) > 8 * 1024 * 1024)  self::JsonExit(array("success" => false, "error" => "SQL import too large (max 8MB)."));

			$conn = self::Connect($server["server"], $database !== "" ? $database : false);
			if (!$conn["success"])  self::JsonExit($conn);

			$mysqli = $conn["mysqli"];
			$started = microtime(true);
			$ok = @$mysqli->multi_query($sql);
			if (!$ok)
			{
				$err = $mysqli->error;
				$mysqli->close();
				self::JsonExit(array("success" => false, "error" => $err));
			}

			$statements = 0;
			do
			{
				$statements++;
				if ($res = $mysqli->store_result())  $res->free();
			} while ($mysqli->more_results() && $mysqli->next_result());

			if ($mysqli->errno)
			{
				$err = $mysqli->error;
				$mysqli->close();
				self::JsonExit(array("success" => false, "error" => $err, "statements" => $statements));
			}

			$elapsed = round((microtime(true) - $started) * 1000, 2);
			$mysqli->close();
			self::JsonExit(array("success" => true, "statements" => $statements, "elapsed_ms" => $elapsed));
		}

		if ($action === "mysql_list_events")
		{
			$server = self::ResolveServerFromRequest($config);
			if (!$server["success"])  self::JsonExit($server);

			$database = isset($_REQUEST["database"]) ? trim((string)$_REQUEST["database"]) : "";
			$conn = self::Connect($server["server"], $database !== "" ? $database : false);
			if (!$conn["success"])  self::JsonExit($conn);

			$mysqli = $conn["mysqli"];
			if ($database !== "")
			{
				$sql = "SHOW EVENTS FROM " . self::QuoteIdent($database);
			}
			else
			{
				// No default DB selected — list via information_schema.
				$sql = "SELECT EVENT_SCHEMA AS Db, EVENT_NAME AS Name, DEFINER, TIMEZONE, EVENT_TYPE AS Type, EXECUTE_AT, INTERVAL_VALUE, INTERVAL_FIELD, STARTS, ENDS, STATUS, ORIGINATOR, CHARACTER_SET_CLIENT, COLLATION_CONNECTION, DATABASE_COLLATION FROM information_schema.EVENTS ORDER BY EVENT_SCHEMA, EVENT_NAME";
			}

			$result = false;
			$err = "";
			try
			{
				$result = $mysqli->query($sql);
				if (!$result)  $err = $mysqli->error;
			}
			catch (Throwable $ex)
			{
				$err = $ex->getMessage();
				$result = false;
			}

			if (!$result)
			{
				$mysqli->close();
				self::JsonExit(array("success" => false, "error" => $err !== "" ? $err : "EVENTS privilege may be missing. Select a database first."));
			}

			$events = array();
			while ($row = $result->fetch_assoc())  $events[] = $row;
			$result->free();
			$mysqli->close();
			self::JsonExit(array("success" => true, "events" => $events));
		}

		if ($action === "mysql_drop_event")
		{
			$server = self::ResolveServerFromRequest($config);
			if (!$server["success"])  self::JsonExit($server);

			$database = isset($_REQUEST["database"]) ? trim((string)$_REQUEST["database"]) : "";
			$name = isset($_REQUEST["name"]) ? trim((string)$_REQUEST["name"]) : "";
			if ($name === "" || !preg_match('/^[A-Za-z0-9_\$]+$/', $name))  self::JsonExit(array("success" => false, "error" => "Invalid event name."));

			$conn = self::Connect($server["server"], $database !== "" ? $database : false);
			if (!$conn["success"])  self::JsonExit($conn);

			$mysqli = $conn["mysqli"];
			$ok = false;
			$err = "";
			try
			{
				$ok = $mysqli->query("DROP EVENT " . ($database !== "" ? self::QuoteIdent($database) . "." : "") . self::QuoteIdent($name));
				if (!$ok)  $err = $mysqli->error;
			}
			catch (Throwable $ex)
			{
				$err = $ex->getMessage();
				$ok = false;
			}
			$mysqli->close();
			if (!$ok)  self::JsonExit(array("success" => false, "error" => $err !== "" ? $err : "DROP EVENT failed."));
			self::JsonExit(array("success" => true));
		}

		if ($action === "mysql_show_create_event")
		{
			$server = self::ResolveServerFromRequest($config);
			if (!$server["success"])  self::JsonExit($server);

			$name = isset($_REQUEST["name"]) ? trim((string)$_REQUEST["name"]) : "";
			$database = isset($_REQUEST["database"]) ? trim((string)$_REQUEST["database"]) : "";
			if ($name === "" || !preg_match('/^[A-Za-z0-9_\$]+$/', $name))  self::JsonExit(array("success" => false, "error" => "Invalid event name."));

			$conn = self::Connect($server["server"], $database !== "" ? $database : false);
			if (!$conn["success"])  self::JsonExit($conn);

			$mysqli = $conn["mysqli"];
			$result = false;
			$err = "";
			try
			{
				$result = $mysqli->query("SHOW CREATE EVENT " . ($database !== "" ? self::QuoteIdent($database) . "." : "") . self::QuoteIdent($name));
				if (!$result)  $err = $mysqli->error;
			}
			catch (Throwable $ex)
			{
				$err = $ex->getMessage();
				$result = false;
			}
			if (!$result)
			{
				$mysqli->close();
				self::JsonExit(array("success" => false, "error" => $err !== "" ? $err : "SHOW CREATE EVENT failed."));
			}
			$row = $result->fetch_assoc();
			$result->free();
			$mysqli->close();
			$create = "";
			if (is_array($row))
			{
				foreach ($row as $k => $v)
				{
					if (stripos($k, "Create") !== false) { $create = $v; break; }
				}
			}
			self::JsonExit(array("success" => true, "create_sql" => $create));
		}

		if ($action === "mysql_list_triggers")
		{
			$server = self::ResolveServerFromRequest($config);
			if (!$server["success"])  self::JsonExit($server);

			$database = isset($_REQUEST["database"]) ? trim((string)$_REQUEST["database"]) : "";
			$conn = self::Connect($server["server"], $database !== "" ? $database : false);
			if (!$conn["success"])  self::JsonExit($conn);

			$mysqli = $conn["mysqli"];
			if ($database !== "")
			{
				$sql = "SHOW TRIGGERS FROM " . self::QuoteIdent($database);
			}
			else
			{
				$sql = "SELECT TRIGGER_SCHEMA AS Db, TRIGGER_NAME AS Trigger, EVENT_MANIPULATION AS Event, EVENT_OBJECT_TABLE AS `Table`, ACTION_TIMING AS Timing, ACTION_STATEMENT AS Statement, DEFINER FROM information_schema.TRIGGERS ORDER BY TRIGGER_SCHEMA, TRIGGER_NAME";
			}

			$result = false;
			$err = "";
			try
			{
				$result = $mysqli->query($sql);
				if (!$result)  $err = $mysqli->error;
			}
			catch (Throwable $ex)
			{
				$err = $ex->getMessage();
				$result = false;
			}

			if (!$result)
			{
				$mysqli->close();
				self::JsonExit(array("success" => false, "error" => $err !== "" ? $err : "Unable to list triggers. Select a database first."));
			}

			$triggers = array();
			while ($row = $result->fetch_assoc())  $triggers[] = $row;
			$result->free();
			$mysqli->close();
			self::JsonExit(array("success" => true, "triggers" => $triggers));
		}

		if ($action === "mysql_drop_trigger")
		{
			$server = self::ResolveServerFromRequest($config);
			if (!$server["success"])  self::JsonExit($server);

			$database = isset($_REQUEST["database"]) ? trim((string)$_REQUEST["database"]) : "";
			$name = isset($_REQUEST["name"]) ? trim((string)$_REQUEST["name"]) : "";
			if ($name === "" || !preg_match('/^[A-Za-z0-9_\$]+$/', $name))  self::JsonExit(array("success" => false, "error" => "Invalid trigger name."));

			$conn = self::Connect($server["server"], $database !== "" ? $database : false);
			if (!$conn["success"])  self::JsonExit($conn);

			$mysqli = $conn["mysqli"];
			$ok = false;
			$err = "";
			try
			{
				$ok = $mysqli->query("DROP TRIGGER " . ($database !== "" ? self::QuoteIdent($database) . "." : "") . self::QuoteIdent($name));
				if (!$ok)  $err = $mysqli->error;
			}
			catch (Throwable $ex)
			{
				$err = $ex->getMessage();
				$ok = false;
			}
			$mysqli->close();
			if (!$ok)  self::JsonExit(array("success" => false, "error" => $err !== "" ? $err : "DROP TRIGGER failed."));
			self::JsonExit(array("success" => true));
		}

		if ($action === "mysql_show_create_trigger")
		{
			$server = self::ResolveServerFromRequest($config);
			if (!$server["success"])  self::JsonExit($server);

			$name = isset($_REQUEST["name"]) ? trim((string)$_REQUEST["name"]) : "";
			$database = isset($_REQUEST["database"]) ? trim((string)$_REQUEST["database"]) : "";
			if ($name === "" || !preg_match('/^[A-Za-z0-9_\$]+$/', $name))  self::JsonExit(array("success" => false, "error" => "Invalid trigger name."));

			$conn = self::Connect($server["server"], $database !== "" ? $database : false);
			if (!$conn["success"])  self::JsonExit($conn);

			$mysqli = $conn["mysqli"];
			$result = $mysqli->query("SHOW CREATE TRIGGER " . self::QuoteIdent($name));
			if (!$result)
			{
				$err = $mysqli->error;
				$mysqli->close();
				self::JsonExit(array("success" => false, "error" => $err));
			}
			$row = $result->fetch_assoc();
			$result->free();
			$mysqli->close();
			$create = "";
			if (is_array($row))
			{
				foreach ($row as $k => $v)
				{
					if (stripos($k, "SQL Original Statement") !== false || stripos($k, "Create") !== false) { $create = $v; break; }
				}
			}
			self::JsonExit(array("success" => true, "create_sql" => $create));
		}

		if ($action === "mysql_query")
		{
			$server = self::ResolveServerFromRequest($config);
			if (!$server["success"])  self::JsonExit($server);

			$database = isset($_REQUEST["database"]) ? trim((string)$_REQUEST["database"]) : "";
			$sql = isset($_REQUEST["sql"]) ? trim((string)$_REQUEST["sql"]) : "";
			$max_rows = isset($_REQUEST["max_rows"]) ? (int)$_REQUEST["max_rows"] : 200;
			if ($max_rows < 1)  $max_rows = 200;
			if ($max_rows > 1000)  $max_rows = 1000;

			if ($sql === "")  self::JsonExit(array("success" => false, "error" => "SQL is empty."));

			$conn = self::Connect($server["server"], $database);
			if (!$conn["success"])  self::JsonExit($conn);

			$mysqli = $conn["mysqli"];
			$started = microtime(true);
			$result = @$mysqli->multi_query($sql);

			if (!$result)
			{
				$err = $mysqli->error;
				$mysqli->close();
				self::JsonExit(array("success" => false, "error" => $err));
			}

			$sets = array();
			do
			{
				$res = $mysqli->store_result();
				$set = array(
					"affected_rows" => $mysqli->affected_rows,
					"insert_id" => $mysqli->insert_id,
					"warning_count" => $mysqli->warning_count
				);

				if ($res instanceof mysqli_result)
				{
					$columns = array();
					foreach ($res->fetch_fields() as $f)  $columns[] = $f->name;

					$rows = array();
					$n = 0;
					while ($n < $max_rows && ($row = $res->fetch_assoc()))
					{
						$out = array();
						foreach ($row as $k => $v)
						{
							if ($v === null)  $out[$k] = null;
							else if (is_string($v) && strlen($v) > 2000)  $out[$k] = substr($v, 0, 2000) . "…";
							else  $out[$k] = $v;
						}
						$rows[] = $out;
						$n++;
					}

					$set["columns"] = $columns;
					$set["rows"] = $rows;
					$set["row_count"] = $res->num_rows;
					$set["truncated"] = ($res->num_rows > $max_rows);
					$res->free();
				}

				$sets[] = $set;
			} while ($mysqli->more_results() && $mysqli->next_result());

			if ($mysqli->errno)
			{
				$err = $mysqli->error;
				$mysqli->close();
				self::JsonExit(array("success" => false, "error" => $err, "sets" => $sets));
			}

			$elapsed = round((microtime(true) - $started) * 1000, 2);
			$mysqli->close();

			self::JsonExit(array(
				"success" => true,
				"sets" => $sets,
				"elapsed_ms" => $elapsed
			));
		}

		self::JsonExit(array("success" => false, "error" => "Unknown MySQL action."));
	}

	private static function ResolveServerFromRequest($config)
	{
		$id = isset($_REQUEST["server_id"]) ? (string)$_REQUEST["server_id"] : "";
		if ($id === "")  return array("success" => false, "error" => "server_id is required.");

		$server = self::FindServer($config["mysql_servers"], $id);
		if ($server === false)  return array("success" => false, "error" => "Server not found.");

		return array("success" => true, "server" => $server);
	}

	private static function DecodeJsonField($name)
	{
		if (!isset($_REQUEST[$name]))  return null;
		$raw = $_REQUEST[$name];
		if (is_array($raw))  return $raw;
		$decoded = json_decode((string)$raw, true);
		return is_array($decoded) ? $decoded : null;
	}

	private static function GetPrimaryKeys($mysqli, $table)
	{
		$pks = array();
		$idx = $mysqli->query("SHOW INDEX FROM " . self::QuoteIdent($table) . " WHERE Key_name = 'PRIMARY'");
		if ($idx)
		{
			while ($row = $idx->fetch_assoc())
			{
				if (isset($row["Column_name"]))  $pks[] = $row["Column_name"];
			}
			$idx->free();
		}

		return $pks;
	}

	private static function CsvEscape($value)
	{
		if ($value === null)  return "";
		$s = (string)$value;
		if (strpos($s, '"') !== false || strpos($s, ",") !== false || strpos($s, "\n") !== false || strpos($s, "\r") !== false)
		{
			return '"' . str_replace('"', '""', $s) . '"';
		}
		return $s;
	}
}
?>
