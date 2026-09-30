<?php
// ============================================================
//  StudySpot – API: Create Booking
// ============================================================

require_once __DIR__ . '/db.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// Parse input (supports JSON or form-data)
$input = $_POST;
if (empty($input)) {
    $raw = file_get_contents('php://input');
    if ($raw) {
        $json = json_decode($raw, true);
        if (is_array($json)) $input = $json;
    }
}

$placeId     = (int)($input['place_id'] ?? 0);
$userId      = (int)($input['user_id'] ?? 1); // default logged in demo user
$bookingDate = trim($input['booking_date'] ?? date('Y-m-d'));
$startTime   = trim($input['time'] ?? $input['start_time'] ?? '10:00:00');
$people      = max(1, min(20, (int)($input['people'] ?? 1)));
$totalPrice  = (float)($input['total_price'] ?? 0.00);

if ($placeId <= 0) {
    echo json_encode(['success' => false, 'error' => 'Invalid place ID.']);
    exit;
}

// Format time if only HH:MM was sent
if (preg_match('/^\d{1,2}:\d{2}$/', $startTime)) {
    $startTime .= ':00';
} elseif (preg_match('/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i', $startTime, $m)) {
    $hour = (int)$m[1];
    if (strtoupper($m[3]) === 'PM' && $hour < 12) $hour += 12;
    if (strtoupper($m[3]) === 'AM' && $hour === 12) $hour = 0;
    $startTime = sprintf('%02d:%s:00', $hour, $m[2]);
}

// Calculate end time (default 2 hours later)
$endTimeTs = strtotime($startTime) + (2 * 3600);
$endTime   = date('H:i:s', $endTimeTs);

// Fetch place details for total price verification if not passed
try {
    $pStmt = $pdo->prepare('SELECT name, price, cost_label FROM places WHERE id = ?');
    $pStmt->execute([$placeId]);
    $place = $pStmt->fetch();

    if (!$place) {
        echo json_encode(['success' => false, 'error' => 'Study space not found.']);
        exit;
    }

    if ($totalPrice <= 0 && $place['price'] > 0) {
        $totalPrice = (float)$place['price'] * $people;
    }

    // Generate unique payment reference
    $paymentRef = 'SS-' . rand(100100, 999999);

    $insertStmt = $pdo->prepare('
        INSERT INTO bookings (user_id, place_id, booking_date, start_time, end_time, people, total_price, status, payment_ref, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ');
    $insertStmt->execute([
        $userId,
        $placeId,
        $bookingDate,
        $startTime,
        $endTime,
        $people,
        $totalPrice,
        'upcoming',
        $paymentRef
    ]);

    $bookingId = (int)$pdo->lastInsertId();

    echo json_encode([
        'success'      => true,
        'message'      => 'Booking confirmed successfully!',
        'booking'      => [
            'id'           => $bookingId,
            'place_id'     => $placeId,
            'place_name'   => $place['name'],
            'booking_date' => $bookingDate,
            'start_time'   => substr($startTime, 0, 5),
            'end_time'     => substr($endTime, 0, 5),
            'people'       => $people,
            'total_price'  => $totalPrice,
            'status'       => 'upcoming',
            'payment_ref'  => $paymentRef,
        ]
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
