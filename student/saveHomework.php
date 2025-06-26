<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
define('HOMEWORK_DIR', 'homework/');
define('MAX_FILE_SIZE', 2 * 1024 * 1024); 
if (!file_exists(HOMEWORK_DIR)) {
    mkdir(HOMEWORK_DIR, 0755, true);
}
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    echo json_encode(['success' => false, 'error' => 'Invalid input']);
    exit;
}
$required = ['title', 'map', 'difficulty', 'dueDate', 'objectives'];
foreach ($required as $field) {
    if (empty($input[$field])) {
        echo json_encode(['success' => false, 'error' => "Field '$field' is required"]);
        exit;
    }
}
$filename = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $input['title']);
$filename = substr($filename, 0, 50) . '.json';
if (empty($filename)) {
    echo json_encode(['success' => false, 'error' => 'Invalid title']);
    exit;
}
$homeworkData = [
    'title' => $input['title'],
    'map' => $input['map'],
    'instructions' => $input['instructions'] ?? '',
    'difficulty' => $input['difficulty'],
    'dueDate' => $input['dueDate'],
    'objectives' => $input['objectives'],
    'createdAt' => date('Y-m-d H:i:s')
];
$jsonData = json_encode($homeworkData, JSON_PRETTY_PRINT);
if (strlen($jsonData) > MAX_FILE_SIZE) {
    echo json_encode(['success' => false, 'error' => 'Homework data too large']);
    exit;
}
$filepath = HOMEWORK_DIR . $filename;
try {
    if (file_exists($filepath)) {
        $backupPath = HOMEWORK_DIR . pathinfo($filename, PATHINFO_FILENAME) . 
                      '_backup_' . date('YmdHis') . '.json';
        copy($filepath, $backupPath);
    }
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