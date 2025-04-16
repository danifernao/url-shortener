<? 
  require_once('./database/connection.php');

  if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $alias = isset($_GET['alias']) ? $_GET['alias'] : NULL;
    if ($alias && preg_match('/^[a-zA-Z0-9]{1,8}$/', $alias)) {
      $db = new Database();
      $conn = $db->getConnection();
      $stmt = $conn->prepare('SELECT original_url FROM short_urls WHERE alias = :alias LIMIT 1');
      $stmt->bindParam(':alias', $alias);
      $stmt->execute();
      $row = $stmt->fetch(PDO::FETCH_OBJ);
      if ($row) {
        header("Location: {$row->original_url}");
      } else {
        header('HTTP/1.1 404 Not Found');
      }
    } else {
      header('HTTP/1.1 404 Not Found');
    }
  } else {
    header('HTTP/1.1 404 Not Found');
  }
?>