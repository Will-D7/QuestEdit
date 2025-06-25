<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
define('MAPS_DIR', 'maps/');
if (!file_exists(MAPS_DIR)) {
    mkdir(MAPS_DIR, 0755, true);
}
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    echo json_encode(['success' => false, 'error' => 'Invalid input']);
    exit;
}
$action = isset($input['action']) ? $input['action'] : 'load';
if ($action === 'list') {
    try {
        $maps = [];
        $files = glob(MAPS_DIR . '*.txt');
        $files = array_filter($files, function($file) {
            return strpos(basename($file), '_backup_') === false;
        });
        foreach ($files as $file) {
            $filename = basename($file, '.txt');
            $maps[] = [
                'filename' => $filename,
                'name' => str_replace('_', ' ', $filename),
                'size' => formatFileSize(filesize($file)),
                'modified' => date('Y-m-d H:i', filemtime($file))
            ];
        }
        usort($maps, function($a, $b) {
            return strcmp($b['modified'], $a['modified']);
        });
        echo json_encode([
            'success' => true,
            'maps' => $maps
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'error' => 'Failed to list maps: ' . $e->getMessage()
        ]);
    }
} else {
    $filename = isset($input['filename']) ? $input['filename'] : '';
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
    $filepath = MAPS_DIR . $filename . '.txt';
    if (!file_exists($filepath)) {
        echo json_encode(['success' => false, 'error' => 'Map not found']);
        exit;
    }
    try {
        $jsonData = file_get_contents($filepath);
        if ($jsonData === false) {
            throw new Exception('Failed to read file');
        }
        $saveData = json_decode($jsonData, true);
        if (!$saveData) {
            throw new Exception('Invalid map format');
        }
        if (!isset($saveData['data'])) {
            throw new Exception('Map data not found in file');
        }
        echo json_encode([
            'success' => true,
            'data' => $saveData['data'],
            'version' => isset($saveData['version']) ? $saveData['version'] : 'unknown',
            'saved_at' => isset($saveData['saved_at']) ? $saveData['saved_at'] : 'unknown'
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'error' => 'Failed to load map: ' . $e->getMessage()
        ]);
    }
}
function formatFileSize($bytes) {
    if ($bytes < 1024) return $bytes . ' B';
    else if ($bytes < 1048576) return round($bytes / 1024, 1) . ' KB';
    else return round($bytes / 1048576, 2) . ' MB';
}
?>