<?php
// ============================================================
//  StudySpot – API: Clear Recently Viewed History
// ============================================================

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
require_once __DIR__ . '/db.php';
header('Content-Type: application/json');

$userId = (int)($_SESSION['user_id'] ?? $_POST['user_id'] ?? $_GET['user_id'] ?? 1);

try {
    $stmt = $pdo->prepare("DELETE FROM recently_viewed WHERE user_id = ?");
    $stmt->execute([$userId]);

    echo json_encode([
        'success' => true,
        'message' => 'Recently viewed history cleared'
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error'   => $e->getMessage()
    ]);
}
