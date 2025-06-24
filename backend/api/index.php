<?php
  require_once('../database/connection.php');

  // Genera una cadena de texto aleatoria compuesta por caracteres alfanuméricos.
  function get_random_string($length = 8) {
    $sample = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $string = '';
    $max = mb_strlen($sample, '8bit') - 1;
    for ($i = 0; $i < $length; $i++) {
      $string .= $sample[random_int(0, $max)];
    }
    return $string;
  }

  /*
    Inserta un registro en la tabla "short_urls":
    - alias: cadena de texto única que identifica la URL original.
    - url: URL original.
  */
  function insert_row($conn, $alias, $url) {
    $stmt = $conn->prepare('INSERT INTO short_urls(alias, original_url) VALUES(:alias, :url)');
    $stmt->bindParam(':alias', $alias);
    $stmt->bindParam(':url', $url);
    return $stmt->execute();
  }

  /* Da formato al mensaje que será devuelto por la API.:
     - $message puede ser una cadena de texto o un arreglo asociativo con pares [nombreCampo => mensaje], en donde
       "nombreCampo" hace referencia al nombre del elemento HTML asociado con el mensaje.
     - $key_value es un arreglo asociativo con pares [clave => valor], utilizado para agregar datos extra en la respuesta.
  */
  function set_message($message, $key_value = array()) {
    $output = array('message' => $message, ...$key_value);
    return json_encode($output, JSON_UNESCAPED_UNICODE);
  }

  if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Gestiona el reCAPTCHA.
    $recaptcha_secret_key = getenv('RECAPTCHA_SECRETE_KEY');
    if ($recaptcha_secret_key) {
      $recaptcha_response = isset($_POST['g-recaptcha-response']) ? $_POST['g-recaptcha-response'] : NULL;
      if ($recaptcha_response) {
        $googleResponse = file_get_contents("https://www.google.com/recaptcha/api/siteverify?secret={$recaptcha_secret_key}&response={$recaptcha_response}");
        if ($googleResponse) {
          $recaptcha = json_decode($googleResponse);
          if ($recaptcha->success !== true) {
            header('HTTP/1.1 400 Bad Request');
            echo set_message(array('recaptcha' => 'El reCAPTCHA es incorrecto.'));
            exit;
          }
        } else {
          header('HTTP/1.1 500 Internal Server Error');
          echo set_message(array('recaptcha' => 'No se pudo validar el reCAPTCHA.'));
          exit;
        }
      } else {
        header('HTTP/1.1 400 Bad Request');
        echo set_message(array('recaptcha' => 'No se ha resuelto el reCAPTCHA.'));
        exit;
      }
    }

    // Gestiona los demás datos proporcionados por el usuario.

    $db = new Database();
    $conn = $db->getConnection();
    
    $url = isset($_POST['url']) ? $_POST['url'] : NULL;
    $alias = isset($_POST['alias']) ? $_POST['alias'] : NULL;
    
    if ($url && !filter_var($url, FILTER_VALIDATE_URL) === false) {
      if ($alias) { // Verifica si se proporcionó un alias personalizado.
        if (preg_match('/^[a-zA-Z0-9]{1,8}$/', $alias)) { // Verifica que sea una cadena de entre uno y ocho caracteres alfanuméricos.
          $not_allowed = array("api", "database"); // Arreglo con los alias que no se deben utilizar.
          if (!in_array($alias, $not_allowed)) {
            try {
              insert_row($conn, $alias, $url);
              header('HTTP/1.1 201 Created');
              echo set_message('La URL ha sido acortada con el alias proporcionado.', array('alias' => $alias));
            } catch(PDOException $e) {
              if ($e->getCode() === '23000') { // "23000" es el código que devuelve el servidor MySQL cuando encuentra una clave duplicada.
                header('HTTP/1.1 409 Conflict');
                echo set_message(array('alias' => 'El alias proporcionado ya está en uso.'));
              } else {
                header('HTTP/1.1 500 Internal Server Error');
                echo set_message($e->getMessage());
              }
            }
          } else {
            header('HTTP/1.1 405 Method Not Allowed');
            echo set_message(array('alias' => 'El alias proporcionado no está permitido.'));
          }
        } else {
          header('HTTP/1.1 400 Bad Request');
          echo set_message(array('alias' => 'El alias debe contener entre uno y ocho caracteres alfanuméricos.'));
        }
      } else {
        while(true) {
          $alias = get_random_string();
          try {
            insert_row($conn, $alias, $url);
            header('HTTP/1.1 201 Created');
            echo set_message('La URL ha sido acortada.', array('alias' => $alias));
            break;
          } catch(PDOException $e) {
            // Si el alias ya existe, repite el proceso. De lo contrario, rompe el ciclo y muestra el error encontrado.
            if ($e->getCode() !== '23000') { // "23000" es el código que devuelve el servidor MySQL cuando encuentra una clave duplicada.
              header('HTTP/1.1 500 Internal Server Error');
              echo set_message($e->getMessage());
              break;
            }
          }
        }
      }
    } else {
      header('HTTP/1.1 400 Bad Request');
      echo set_message(array('url' => 'No se ha proporcionado una URL válida.'));
    }
  } else {
    header('HTTP/1.1 404 Not Found');
  }
  ?>