<?php
$request = $_SERVER['REQUEST_URI'];
$path = parse_url($request, PHP_URL_PATH);

if ($path === '/editors') {
    require_once __DIR__ . '/../routes/editors.php';
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Not Found']);
}
