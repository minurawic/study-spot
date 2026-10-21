<?php
// ============================================================
//  StudySpot – API: Cancel Booking
//  Updates booking status to 'cancelled' in the database
// ============================================================

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$input = $_POST;
if (empty($input)) {
    $raw = file_get_contents('php://input');
    if ($raw) {
        $json = json_decode($raw, true);
        if (is_array($json)) $input = $json;
    }
}

$bookingId = (int)($input['booking_id'] ?? $input['id'] ?? 0);
$userId    = (int)($_SESSION['user_id'] ?? $input['user_id'] ?? 1);

if ($bookingId <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid booking ID']);
    exit;
}

try {
    // Check if booking exists
    $check = $pdo->prepare("SELECT id, status, user_id FROM `bookings` WHERE id = ?");
    $check->execute([$bookingId]);
    $booking = $check->fetch(PDO::FETCH_ASSOC);

    if (!$booking) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Booking not found']);
        exit;
    }

    if ($booking['status'] === 'cancelled') {
        echo json_encode(['success' => true, 'message' => 'Booking is already cancelled.']);
        exit;
    }

    $stmt = $pdo->prepare("UPDATE `bookings` SET status = 'cancelled' WHERE id = ?");
    $stmt->execute([$bookingId]);

    echo json_encode([
        'success' => true,
        'message' => 'Booking cancelled successfully.'
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error'   => 'Could not cancel booking: ' . $e->getMessage()
    ]);
}
