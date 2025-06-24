<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

define('HOMEWORK_DIR', 'homework/');

// Create homework directory if needed
if (!file_exists(HOMEWORK_DIR)) {
    mkdir(HOMEWORK_DIR, 0755, true);
}

try {
    $homeworks = [];
    $files = glob(HOMEWORK_DIR . '*.json');
    
    foreach ($files as $file) {
        // Skip backup files
        if (strpos(basename($file), '_backup_') !== false) {
            continue;
        }
        
        $content = file_get_contents($file);
        $data = json_decode($content, true);
        
        if ($data) {
            $homeworks[] = [
                'filename' => basename($file),
                'title' => $data['title'] ?? 'Untitled',
                'map' => $data['map'] ?? '',
                'difficulty' => $data['difficulty'] ?? 'unknown',
                'dueDate' => $data['dueDate'] ?? '',
                'createdAt' => $data['createdAt'] ?? date('Y-m-d H:i', filemtime($file)),
                'objectives' => $data['objectives'] ?? '',
                'size' => formatFileSize(filesize($file))
            ];
        }
    }
    
    // Sort by due date (soonest first)
    usort($homeworks, function($a, $b) {
        return strtotime($a['dueDate']) - strtotime($b['dueDate']);
    });
    
    echo json_encode([
        'success' => true,
        'homeworks' => $homeworks
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Failed to list homework: ' . $e->getMessage()
    ]);
}

// Helper function to format file size
function formatFileSize($bytes) {
    if ($bytes < 1024) return $bytes . ' B';
    else if ($bytes < 1048576) return round($bytes / 1024, 1) . ' KB';
    else return round($bytes / 1048576, 2) . ' MB';
}
?>