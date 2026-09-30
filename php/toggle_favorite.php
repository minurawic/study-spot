<?php
// ============================================================
//  StudySpot – API: Toggle Favorite
// ============================================================

require_once __DIR__ . '/db.php';
header('Content-Type: application/json');

$placeId = (int)($_POST['place_id'] ?? $_GET['place_id'] ?? 0);
$userId  = (int)($_POST['user_id']  ?? $_GET['user_id']  ?? 1); // default demo user

if ($placeId <= 0) {
    echo json_encode(['success' => false, 'error' => 'Invalid place ID']);
    exit;
}

try {
    // Check if already favorited
    $checkStmt = $pdo->prepare('SELECT id FROM favorites WHERE user_id = ? AND place_id = ?');
    $checkStmt->execute([$userId, $placeId]);
    $existing = $checkStmt->fetch();

    if ($existing) {
        // Remove favorite
        $delStmt = $pdo->prepare('DELETE FROM favorites WHERE id = ?');
        $delStmt->execute([$existing['id']]);
        echo json_encode(['success' => true, 'is_favorite' => false, 'message' => 'Removed from favorites']);
    } else {
        // Add favorite
        $insStmt = $pdo->prepare('INSERT INTO favorites (user_id, place_id) VALUES (?, ?)');
        $insStmt->execute([$userId, $placeId]);
        echo json_encode(['success' => true, 'is_favorite' => true, 'message' => 'Added to favorites']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
