<?php 

include_once "players-db-access.php";

// makes sure errors are displayed in verbose mode
ini_set('display_errors', 1);
error_reporting(~0);

$supported_actions = array("get_players", "get_player");

if (isset($_GET["action"]) && in_array($_GET["action"], $supported_actions)) {
	switch ($_GET["action"]) {
		case 'get_players':
			get_players_list();
			break;

		case 'get_player':
			if (isset($_GET["id"])) {
				get_player_by_id($_GET["id"]);
			} else {
				error("missing_argument");
			}
			break;
		
		default:
			error("unknown_action");
			break;
	}
}

// Error handling part

function error($type) {
	echo json_encode(array("status" => "error_$type"));
}


// Returns a JSON that has all first names and last names of NBA players that we have.
// player ID, First and Last Names.
function get_players_list() {

	$result;

	$nba_db = new Database();
	$nba_db->db_connect();

	$query = "SELECT `PlayerName` as `fullName`, `id` FROM `nba_players`";

	$nba_db->run_query($query);

	$result;
	$status;
	
	if ($nba_db->sql_error_code() == 0) {

		$db_result = $nba_db->all_results_in_array();

		// splits names so we have bot first and last names in the return
		foreach ($db_result as $key => $value) {
			$names = explode(" ", $db_result[$key]['fullName']);
			$firstName = $names[0];
			$lastName = $names[1];
			//unset($db_result[$key]['PlayerName']);
			$db_result[$key]['firstName'] = $firstName;
			$db_result[$key]['lastName'] = $lastName;
		}

		$result = array("status" => "OK", "content" => $db_result);
	} else {
		$status = array(
			"status" => "error",
			"error_code" => $nba_db->sql_error_code()
			);
		$result = $status;
	}

	

	echo json_encode($result);

}

// Returns a player's all info wrapped in JSON format.
// player ID and everything
function get_player_by_id($id) {
	$result;

	$nba_db = new Database();
	$nba_db->db_connect();

	$query = "SELECT `PlayerName` as `fullName`,
	 `id`, 
	 `GP`,
	 `FGP`,
	 `TPP`,
	 `FTP`,
	 `PPG`  
	 FROM `nba_players` WHERE id = ?";

	$nba_db->run_secure_query($query, array($id));
	$result = $nba_db->all_results_in_array();

	// splits names so we have bot first and last names in the return
	// foreach ($result as $key => $value) {
	// 	$names = explode(" ", $result[$key]['PlayerName']);
	// 	$firstName = $names[0];
	// 	$lastName = $names[1];
	// 	unset($result[$key]['PlayerName']);
	// 	$result[$key]['firstName'] = $firstName;
	// 	$result[$key]['lastName'] = $lastName;
	// }

	echo json_encode($result);
}

?>