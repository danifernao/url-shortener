<?php
  class Database {
    private $host;
    private $name;
    private $user;
    private $pass;

    public function __construct() {
      $this->host = getenv('DB_HOST');
      $this->name = getenv('DB_DATABASE');
      $this->user = getenv('DB_USERNAME');
      $this->pass = getenv('DB_PASSWORD');
    }

    public function getConnection() {
      $source = "mysql:host={$this->host};dbname={$this->name};";
      try {
        $connection = new PDO($source, $this->user, $this->pass);
        $connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $connection;
      } catch (PDOException $e) {
        die("ERROR: {$e->getMessage()}");
      }
    }
  }
?>