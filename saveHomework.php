<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

define('HOMEWORK_DIR', 'homework/');
define('MAX_FILE_SIZE', 2 * 1024 * 1024); // 2MB max

// Create homework directory if needed
if (!file_exists(HOMEWORK_DIR)) {
    mkdir(HOMEWORK_DIR, 0755, true);
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode(['success' => false, 'error' => 'Invalid input']);
    exit;
}

// Validate required fields
$required = ['title', 'map', 'difficulty', 'dueDate', 'objectives'];
foreach ($required as $field) {
    if (empty($input[$field])) {
        echo json_encode(['success' => false, 'error' => "Field '$field' is required"]);
        exit;
    }
}

// Sanitize filename
$filename = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $input['title']);
$filename = substr($filename, 0, 50) . '.json';

if (empty($filename)) {
    echo json_encode(['success' => false, 'error' => 'Invalid title']);
    exit;
}

// Prepare homework data
$homeworkData = [
    'title' => $input['title'],
    'map' => $input['map'],
    'instructions' => $input['instructions'] ?? '',
    'difficulty' => $input['difficulty'],
    'dueDate' => $input['dueDate'],
    'objectives' => $input['objectives'],
    'createdAt' => date('Y-m-d H:i:s')
];

// Convert to JSON
$jsonData = json_encode($homeworkData, JSON_PRETTY_PRINT);

// Check file size
if (strlen($jsonData) > MAX_FILE_SIZE) {
    echo json_encode(['success' => false, 'error' => 'Homework data too large']);
    exit;
}

// Save to file
$filepath = HOMEWORK_DIR . $filename;

try {
    // Create backup if file exists
    if (file_exists($filepath)) {
        $backupPath = HOMEWORK_DIR . pathinfo($filename, PATHINFO_FILENAME) . 
                      '_backup_' . date('YmdHis') . '.json';
        copy($filepath, $backupPath);
    }
    
    // Write file
    if (file_put_contents($filepath, $jsonData) === false) {
        throw new Exception('Failed to write file');
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Homework saved successfully',
        'filename' => $filename
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Failed to save homework: ' . $e->getMessage()
    ]);
}
?>

