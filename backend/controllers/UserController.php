<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../utils/Response.php';

class UserController {
    public static function index($pdo) {
        $stmt = $pdo->query("SELECT id, name, email FROM users");
        Response::json($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    public static function store($pdo) {
        $data = json_decode(file_get_contents("php://input"), true);
        $stmt = $pdo->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
        $stmt->execute([$data['name'], $data['email'], password_hash($data['password'], PASSWORD_DEFAULT)]);
        Response::json(['message' => 'User created']);
    }

    public static function show($pdo, $id) {
        $stmt = $pdo->prepare("SELECT id, name, email FROM users WHERE id = ?");
        $stmt->execute([$id]);
        Response::json($stmt->fetch(PDO::FETCH_ASSOC));
    }

    public static function update($pdo, $id) {
        $data = json_decode(file_get_contents("php://input"), true);
        $stmt = $pdo->prepare("UPDATE users SET name = ?, email = ? WHERE id = ?");
        $stmt->execute([$data['name'], $data['email'], $id]);
        Response::json(['message' => 'User updated']);
    }

    public static function destroy($pdo, $id) {
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$id]);
        Response::json(['message' => 'User deleted']);
    }
}
