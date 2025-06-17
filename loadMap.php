<?php
// Database connection details
$host = 'localhost';
$dbname = 'questedit';
$user = 'webonyx';
$password = '';


try {
    $pdo = new PDO("pgsql:host=$host;dbname=$dbname", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}


// Check if a specific map ID is requested
if (isset($_GET['id'])) {
    $mapId = intval($_GET['id']);
    $stmt = $pdo->prepare("SELECT * FROM maps WHERE id = :id");
    $stmt->execute([':id' => $mapId]);
    $map = $stmt->fetch(PDO::FETCH_ASSOC);


    if ($map) {
        echo json_encode([
            'success' => true,
            'mapData' => json_decode($map['map_data']),
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Map not found.']);
    }
    exit;
}


// Otherwise, fetch the list of all saved maps
$stmt = $pdo->query("SELECT id, category, difficulty FROM maps ORDER BY created_at DESC");
$maps = $stmt->fetchAll(PDO::FETCH_ASSOC);


echo json_encode([
    'success' => true,
    'maps' => $maps,
]);

