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

// Handle JSON payload if sent as application/json
$input = $_POST;
if (empty($input)) {
    $raw = file_get_contents('php://input');
    if ($raw) {
        $json = json_decode($raw, true);
        if (is_array($json)) $input = $json;
    }
}

$placeId       = (int)($input['place_id'] ?? 0);
$userId        = (int)($input['user_id'] ?? 1); // default to logged in demo user
$rating        = max(1, min(5, (int)($input['rating'] ?? 5)));
$noiseLevel    = trim($input['noise_level'] ?? 'Very Quiet');
$wifiQuality   = trim($input['wifi_quality'] ?? 'Excellence');
$valueForMoney = trim($input['value_for_money'] ?? 'Excellence');
$comment       = trim($input['comment'] ?? '');

if ($placeId <= 0 || empty($comment)) {
    echo json_encode(['success' => false, 'error' => 'Please provide a valid review comment.']);
    exit;
}

try {
    $stmt = $pdo->prepare('INSERT INTO reviews (place_id, user_id, rating, noise_level, wifi_quality, value_for_money, comment, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())');
    $stmt->execute([$placeId, $userId, $rating, $noiseLevel, $wifiQuality, $valueForMoney, $comment]);

    echo json_encode([
        'success' => true,
        'message' => 'Review added successfully!',
        'review'  => [
            'id'              => (int)$pdo->lastInsertId(),
            'rating'          => $rating,
            'noise_level'     => $noiseLevel,
            'wifi_quality'    => $wifiQuality,
            'value_for_money' => $valueForMoney,
            'comment'         => $comment,
            'time_ago'        => 'Just now',
        ]
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
