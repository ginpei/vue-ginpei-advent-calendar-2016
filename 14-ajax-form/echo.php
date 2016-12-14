<?php
sleep(3);
$data = json_decode(file_get_contents('php://input'), true);

header('Content-Type: application/json');
echo json_encode($data);
