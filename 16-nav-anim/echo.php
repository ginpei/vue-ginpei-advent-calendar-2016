<?php
sleep(3);
$data = json_decode(file_get_contents('php://input'), true);

if ($data['bad']) {
  http_response_code(400);
  header('Content-Type: application/json');
  echo json_encode($data);
}
else {
  header('Content-Type: application/json');
  echo json_encode($data);
}
