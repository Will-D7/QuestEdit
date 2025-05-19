<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT id, name, email FROM editors");
        json_response($stmt->fetchAll());
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare("INSERT INTO editors (name, email, password) VALUES (?, ?, ?)");
        $stmt->execute([
            $input['name'],
            $input['email'],
            password_hash($input['password'], PASSWORD_DEFAULT),
        ]);
        json_response(['message' => 'Editor created']);
        break;

    case 'PUT':
        parse_str(file_get_contents("php://input"), $input);
        $id = $_GET['id'] ?? null;
        if (!$id) json_response(['error' => 'Missing ID'], 400);
        $stmt = $pdo->prepare("UPDATE editors SET name = ?, email = ? WHERE id = ?");
        $stmt->execute([$input['name'], $input['email'], $id]);
        json_response(['message' => 'Editor updated']);
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? null;
        if (!$id) json_response(['error' => 'Missing ID'], 400);
        $stmt = $pdo->prepare("DELETE FROM editors WHERE id = ?");
        $stmt->execute([$id]);
        json_response(['message' => 'Editor deleted']);
        break;

    default:
        json_response(['error' => 'Method not allowed'], 405);
}
