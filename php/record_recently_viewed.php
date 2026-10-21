<?php
// ============================================================
//  StudySpot – API: Record Recently Viewed Space
// ============================================================

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
require_once __DIR__ . '/db.php';
header('Content-Type: application/json');

$userId = (int)($_SESSION['user_id'] ?? $_POST['user_id'] ?? $_GET['user_id'] ?? 1);
$placeId = (int)($_POST['place_id'] ?? $_GET['place_id'] ?? 0);

if ($placeId <= 0) {
    echo json_encode(['success' => false, 'error' => 'Invalid place ID']);
    exit;
}

try {
    // Check if place exists
    $check = $pdo->prepare("SELECT id FROM places WHERE id = ?");
    $check->execute([$placeId]);
    if (!$check->fetch()) {
        echo json_encode(['success' => false, 'error' => 'Place not found']);
        exit;
    }

    $stmt = $pdo->prepare("
        INSERT INTO recently_viewed (user_id, place_id, viewed_at)
        VALUES (?, ?, NOW())
        ON DUPLICATE KEY UPDATE viewed_at = NOW()
    ");
    $stmt->execute([$userId, $placeId]);

    echo json_encode([
        'success' => true,
        'message' => 'Space recorded as recently viewed',
        'place_id' => $placeId
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
