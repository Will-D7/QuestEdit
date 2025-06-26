<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
define('MAPS_DIR', 'maps/');
define('MAX_FILE_SIZE', 5 * 1024 * 1024); 
if (!file_exists(MAPS_DIR)) {
    mkdir(MAPS_DIR, 0755, true);
}
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    echo json_encode(['success' => false, 'error' => 'Invalid input']);
    exit;
}
$filename = isset($input['filename']) ? $input['filename'] : '';
$data = isset($input['data']) ? $input['data'] : null;
if (empty($filename)) {
    echo json_encode(['success' => false, 'error' => 'Filename is required']);
    exit;
}
$filename = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $filename);
$filename = substr($filename, 0, 50); 
if (empty($filename)) {
    echo json_encode(['success' => false, 'error' => 'Invalid filename']);
    exit;
}
if (!$data || !is_array($data)) {
    echo json_encode(['success' => false, 'error' => 'Invalid map data']);
    exit;
}
if (!isset($data['map']) || !is_array($data['map'])) {
    echo json_encode(['success' => false, 'error' => 'Map data must contain a map array']);
    exit;
}
$saveData = [
    'version' => '1.0',
    'saved_at' => date('Y-m-d H:i:s'),
    'data' => $data
];
$jsonData = json_encode($saveData, JSON_PRETTY_PRINT);
if (strlen($jsonData) > MAX_FILE_SIZE) {
    echo json_encode(['success' => false, 'error' => 'Map data too large']);
    exit;
}
$filepath = MAPS_DIR . $filename . '.txt';
try {
    if (file_exists($filepath)) {
        $backupPath = MAPS_DIR . $filename . '_backup_' . date('YmdHis') . '.txt';
        copy($filepath, $backupPath);
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