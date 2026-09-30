<?php
// ============================================================
//  StudySpot – API: Add Review
// ============================================================

require_once __DIR__ . '/db.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$placeId = (int)($_POST['place_id'] ?? 0);
$userId  = (int)($_POST['user_id'] ?? 2); // default to logged in or demo user
$rating  = max(1, min(5, (int)($_POST['rating'] ?? 5)));
$comment = trim($_POST['comment'] ?? '');

if ($placeId <= 0 || empty($comment)) {
    echo json_encode(['success' => false, 'error' => 'Please provide rating and review comment.']);
    exit;
}

try {
    $stmt = $pdo->prepare('INSERT INTO reviews (place_id, user_id, rating, comment, created_at) VALUES (?, ?, ?, ?, NOW())');
    $stmt->execute([$placeId, $userId, $rating, $comment]);

    echo json_encode([
        'success' => true,
        'message' => 'Review added successfully!',
        'review'  => [
            'id'        => (int)$pdo->lastInsertId(),
            'rating'    => $rating,
            'comment'   => $comment,
            'time_ago'  => 'Just now',
        ]
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
