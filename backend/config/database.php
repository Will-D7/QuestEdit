<?php
$host   = 'localhost';
$db     = 'QuestEdit';
$user   = 'postgres';
$pass   = 'S3cur3P@ss';

try {
    $pdo = new PDO("pgsql:host=$host;dbname=$db", $user,$pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $ex){
    die("DB Connection failed: " . $e->getMessage());
}