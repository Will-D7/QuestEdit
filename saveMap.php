<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Configuration
define('MAPS_DIR', 'maps/');
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB max

// Create maps directory if it doesn't exist
if (!file_exists(MAPS_DIR)) {
    mkdir(MAPS_DIR, 0755, true);
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode(['success' => false, 'error' => 'Invalid input']);
    exit;
}

$filename = isset($input['filename']) ? $input['filename'] : '';
$data = isset($input['data']) ? $input['data'] : null;

// Validate filename
if (empty($filename)) {
    echo json_encode(['success' => false, 'error' => 'Filename is required']);
    exit;
}

// Sanitize filename
$filename = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $filename);
$filename = substr($filename, 0, 50); // Limit length

if (empty($filename)) {
    echo json_encode(['success' => false, 'error' => 'Invalid filename']);
    exit;
}

// Validate data
if (!$data || !is_array($data)) {
    echo json_encode(['success' => false, 'error' => 'Invalid map data']);
    exit;
}

// Validate required map fields
if (!isset($data['map']) || !is_array($data['map'])) {
    echo json_encode(['success' => false, 'error' => 'Map data must contain a map array']);
    exit;
}

// Add metadata
$saveData = [
    'version' => '1.0',
    'saved_at' => date('Y-m-d H:i:s'),
    'data' => $data
];

// Convert to JSON
$jsonData = json_encode($saveData, JSON_PRETTY_PRINT);

// Check file size
if (strlen($jsonData) > MAX_FILE_SIZE) {
    echo json_encode(['success' => false, 'error' => 'Map data too large']);
    exit;
}

// Save to file
$filepath = MAPS_DIR . $filename . '.txt';

try {
    // Create backup if file exists
    if (file_exists($filepath)) {
        $backupPath = MAPS_DIR . $filename . '_backup_' . date('YmdHis') . '.txt';
        copy($filepath, $backupPath);
        
        // Keep only last 3 backups
        $backups = glob(MAPS_DIR . $filename . '_backup_*.txt');
        if (count($backups) > 3) {
            usort($backups, function($a, $b) {
                return filemtime($a) - filemtime($b);
            });
            for ($i = 0; $i < count($backups) - 3; $i++) {
                unlink($backups[$i]);
            }
        }
    }
    
    // Write file
    if (file_put_contents($filepath, $jsonData) === false) {
        throw new Exception('Failed to write file');
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Map saved successfully',
        'filename' => $filename . '.txt'
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Failed to save map: ' . $e->getMessage()
    ]);
}
?>