<?php
// Database connection details
$host = 'localhost';
$dbname = 'questedit';
$user = 'webonyx';
$password = '';



// Connect to PostgreSQL
try {
    $pdo = new PDO("pgsql:host=$host;dbname=$dbname", $user, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}


// Get the raw POST data
$input = file_get_contents('php://input');
$data = json_decode($input, true);


// Validate the input
if (!isset($data['map']) || !is_array($data['map'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid map data.']);
    exit;
}


// Prepare the SQL query
$sql = "INSERT INTO maps (category, difficulty, description, map_data) VALUES (:category, :difficulty, :description, :map_data)";


// Execute the query
try {
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':category' => $data['category'] ?? '',
        ':difficulty' => $data['difficulty'] ?? 'medio',
        ':description' => $data['description'] ?? '',
        ':map_data' => json_encode($data['map']),
    ]);
    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Failed to save map: ' . $e->getMessage()]);
}
?>

