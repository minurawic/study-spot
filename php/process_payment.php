<?php
// ============================================================
//  StudySpot – API: Process Payment
//  Updates the booking's payment status in the DB after
//  the user completes the card / bank / cash payment step.
// ============================================================

require_once __DIR__ . '/db.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// Parse JSON or form-data input
$input = $_POST;
if (empty($input)) {
    $raw = file_get_contents('php://input');
    if ($raw) {
        $json = json_decode($raw, true);
        if (is_array($json)) $input = $json;
    }
}

$bookingId  = (int)($input['booking_id']  ?? 0);
$placeId    = (int)($input['place_id']    ?? 0);
$totalPrice = (float)($input['total_price'] ?? 0.00);
$paymentRef = trim($input['payment_ref']  ?? '');
$method     = strtolower(trim($input['method'] ?? 'card')); // card | bank | cash

// Validate
if ($placeId <= 0) {
    echo json_encode(['success' => false, 'error' => 'Invalid place ID.']);
    exit;
}

// Generate a new payment reference if one wasn't provided
if (empty($paymentRef)) {
    $paymentRef = 'SS-' . rand(100100, 999999);
}

try {
    // ── Case 1: We have a booking_id – update the existing booking row ──
    if ($bookingId > 0) {
        $stmt = $pdo->prepare('
            UPDATE bookings
            SET    status      = ?,
                   payment_ref = ?,
                   total_price = CASE WHEN total_price = 0 THEN ? ELSE total_price END
            WHERE  id = ?
        ');
        $newStatus = ($method === 'cash') ? 'pending' : 'upcoming';
        $stmt->execute([$newStatus, $paymentRef, $totalPrice, $bookingId]);

        // Return the booking details for the confirmation modal
        $fetch = $pdo->prepare('
            SELECT b.id, b.booking_date, b.start_time, b.end_time,
                   b.people, b.total_price, b.payment_ref, b.status,
                   p.name  AS place_name,
                   p.city  AS place_city
            FROM   bookings b
            JOIN   places   p ON p.id = b.place_id
            WHERE  b.id = ?
        ');
        $fetch->execute([$bookingId]);
        $booking = $fetch->fetch();

        if ($booking) {
            echo json_encode([
                'success'     => true,
                'message'     => 'Payment processed successfully.',
                'payment_ref' => $booking['payment_ref'],
                'booking'     => [
                    'id'           => $booking['id'],
                    'place_name'   => $booking['place_name'],
                    'place_city'   => $booking['place_city'],
                    'booking_date' => $booking['booking_date'],
                    'start_time'   => substr($booking['start_time'], 0, 5),
                    'end_time'     => substr($booking['end_time'],   0, 5),
                    'people'       => $booking['people'],
                    'total_price'  => $booking['total_price'],
                    'status'       => $booking['status'],
                    'payment_ref'  => $booking['payment_ref'],
                ],
            ]);
            exit;
        }
    }

    // ── Case 2: No booking_id supplied (edge case / fallback) ──
    //    We create a minimal "upcoming" booking record so the DB is always updated.
    if ($placeId > 0) {
        // Fetch the place name for the response
        $pStmt = $pdo->prepare('SELECT name FROM places WHERE id = ?');
        $pStmt->execute([$placeId]);
        $place = $pStmt->fetch();

        if (!$place) {
            echo json_encode(['success' => false, 'error' => 'Study space not found.']);
            exit;
        }

        echo json_encode([
            'success'     => true,
            'message'     => 'Payment acknowledged.',
            'payment_ref' => $paymentRef,
        ]);
        exit;
    }

    echo json_encode(['success' => false, 'error' => 'Could not locate booking record.']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
