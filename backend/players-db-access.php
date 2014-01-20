<?php 

class Database {

	// makes sure errors are displayed in verbose mode

	// DB connection Configuration
	var $Host = "info344.cqgjsfqq3odg.us-west-2.rds.amazonaws.com";
	var $Username = "info344user";
	var $Password = "gyoku3404814";
	var $DB_Name = "al_info344";
	var $Port = 3306;


	// An object representing the current connection
	var $dbh;

	// An object representing the statement of last query
	var $statement;


	public function db_connect() {
		$this->dbh = new PDO("mysql:host=$this->Host;dbname=$this->DB_Name", $this->Username, $this->Password);
	}

	public function run_query( $Query_String ) {
		$this->statement = $this->dbh->query($Query_String);
	}

	public function run_secure_query( $Query_String, $bindings) {
		$this->statement = $this->dbh->prepare($Query_String);
		$this->statement->execute($bindings);
	}

	public function all_results_in_array() {
		return $this->statement->fetchAll(PDO::FETCH_ASSOC) ;
	}

	public function list_from_field( $field_name ) {
		$result = array();
		while ($row = $this->statement->fetch(PDO::FETCH_ASSOC)) {
			echo $row[$field_name];
		}
	}

	public function sql_error_code() {
		return $this->dbh->errorCode();
	}
}




?>
