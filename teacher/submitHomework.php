<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
define('SUBMISSIONS_DIR', 'submissions/');
if (!file_exists(SUBMISSIONS_DIR)) {
    mkdir(SUBMISSIONS_DIR, 0755, true);
}
$input = json_decode(file_get_contents('php://input'), true);
if (!$input || empty($input['homeworkId']) || empty($input['solution'])) {
    echo json_encode(['success' => false, 'error' => 'Invalid input']);
    exit;
}
$homeworkId = basename($input['homeworkId']); 
$solution = $input['solution'];
$filename = SUBMISSIONS_DIR . $homeworkId . '_solution.json';
try {
    $solutionData = [
        'homeworkId' => $homeworkId,
        'solution' => $solution,
        'submitted_at' => date('Y-m-d H:i:s')
    ];
    $jsonData = json_encode($solutionData, JSON_PRETTY_PRINT);
    if (file_put_contents($filename, $jsonData) === false) {
        throw new Exception('Failed to write solution file');
    }
    echo json_encode([
        'success' => true,
        'message' => 'Solution saved successfully'
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Failed to save solution: ' . $e->getMessage()
    ]);
}
?>