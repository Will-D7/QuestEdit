<?php
$host   = 'localhost';
$db     = 'QuestEdit';
$user   = 'postgres';
$pass   = 'S3cur3P@ss';
$dsn  = "pgsql:host=$host;dbname=$db";

try {
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}