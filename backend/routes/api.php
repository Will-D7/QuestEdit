<?php
require_once __DIR__ . '/../controllers/UserController.php';

$uri = explode('/', trim($_SERVER['REQUEST_URI'], '/'));
$method = $_SERVER['REQUEST_METHOD'];
$id = $uri[2] ?? null;

switch ("$method {$uri[1]}") {
    case 'GET users':
        $id ? UserController::show($pdo, $id) : UserController::index($pdo);
        break;
    case 'POST users':
        UserController::store($pdo);
        break;
    case 'PUT users':
        UserController::update($pdo, $id);
        break;
    case 'DELETE users':
        UserController::destroy($pdo, $id);
        break;
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Not Found']);
}
