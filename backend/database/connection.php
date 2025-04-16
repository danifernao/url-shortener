<?php
  class Database {
    private $host;
    private $name;
    private $user;
    private $pass;

    public function __construct() {
      $this->host = getenv('MYSQL_HOST');
      $this->name = getenv('MYSQL_DATABASE');
      $this->user = getenv('MYSQL_USER');
      $this->pass = getenv('MYSQL_PASSWORD');
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