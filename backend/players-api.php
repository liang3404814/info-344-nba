<?php 

include_once "players-db-access.php";

// makes sure errors are displayed in verbose mode
ini_set('display_errors', 1);
error_reporting(~0);

get_players_list();



// function for returning list of first names and last names
// of all players

$nba_db = new Database;


function get_players_list() {
	$nba_db->run_query("SELECT `PlayerName` FROM `nba_players`");
	$nba_db->list_from_field("PlayerName");
}




 ?>