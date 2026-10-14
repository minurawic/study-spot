<?php
// ============================================================
//  StudySpot – API: Get Booking Details
//  Returns complete booking information and venue details
// ============================================================

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');

$bookingId = (int)($_GET['id'] ?? $_GET['booking_id'] ?? 0);

if ($bookingId <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid booking ID']);
    exit;
}

function format_time_display($timeStr) {
    if (!$timeStr) return '';
    $timestamp = strtotime("1970-01-01 " . $timeStr);
    if (!$timestamp) return $timeStr;
    return date('h.i A', $timestamp);
}

try {
    $stmt = $pdo->prepare("
        SELECT 
            b.id AS booking_id,
            b.user_id,
            b.place_id,
            b.booking_date,
            b.start_time,
            b.end_time,
            b.people,
            b.total_price,
            b.status,
            b.payment_ref,
            b.created_at,
            p.name AS place_name,
            p.type AS place_type,
            p.city AS place_city,
            p.address AS place_address,
            p.cover_image,
            p.rating,
            p.facilities,
            p.wifi,
            p.wifi_note,
            p.noise_level,
            p.noise_note,
            p.cost_label,
            p.price AS hourly_price,
            p.open_time,
            p.close_time,
            p.open_days,
            p.description AS place_description,
            u.full_name AS user_name,
            u.email AS user_email
        FROM `bookings` b
        JOIN `places` p ON b.place_id = p.id
        LEFT JOIN `users` u ON u.id = b.user_id
        WHERE b.id = ?
        LIMIT 1
    ");
    $stmt->execute([$bookingId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Booking not found']);
        exit;
    }

    $cover = $row['cover_image'] ?? 'placeholder.svg';
    if (!str_starts_with($cover, 'http') && !str_starts_with($cover, 'images/')) {
        $cover = 'images/' . $cover;
    }

    $startTimeFmt = format_time_display($row['start_time']);
    $endTimeFmt   = format_time_display($row['end_time']);
    $timeSlotFmt  = trim($startTimeFmt . ' - ' . $endTimeFmt);

    $peopleCount = (int)($row['people'] ?? 1);
    $peopleText  = $peopleCount . ' Peoples';

    $booking = [
        'id'             => (int)$row['booking_id'],
        'booking_id'     => (int)$row['booking_id'],
        'user_id'        => (int)$row['user_id'],
        'user_name'      => $row['user_name'] ?? 'Sahan Perera',
        'user_email'     => $row['user_email'] ?? 'sahan@example.com',
        'place_id'       => (int)$row['place_id'],
        'place_name'     => $row['place_name'],
        'place_type'     => ucfirst($row['place_type']),
        'place_city'     => $row['place_city'],
        'place_address'  => $row['place_address'],
        'cover_image'    => $cover,
        'rating'         => (float)$row['rating'],
        'booking_date'   => $row['booking_date'],
        'start_time'     => substr($row['start_time'], 0, 5),
        'end_time'       => substr($row['end_time'], 0, 5),
        'start_time_fmt' => $startTimeFmt,
        'end_time_fmt'   => $endTimeFmt,
        'time_slot'      => $timeSlotFmt,
        'people'         => $peopleCount,
        'people_label'   => $peopleText,
        'total_price'    => (float)$row['total_price'],
        'status'         => strtolower($row['status']),
        'status_label'   => ucfirst($row['status']),
        'payment_ref'    => $row['payment_ref'] ?? ('SS-' . (100000 + (int)$row['booking_id'])),
        'created_at'     => $row['created_at'],
        'facilities'     => !empty($row['facilities']) ? explode(',', $row['facilities']) : [],
        'wifi'           => ucfirst($row['wifi'] ?? 'Free'),
        'wifi_note'      => $row['wifi_note'] ?? '',
        'noise_level'    => ucfirst(str_replace('_', ' ', $row['noise_level'] ?? 'Quiet')),
        'noise_note'     => $row['noise_note'] ?? '',
        'cost_label'     => $row['cost_label'] ?? 'Free',
        'open_time'      => substr($row['open_time'] ?? '08:00:00', 0, 5),
        'close_time'     => substr($row['close_time'] ?? '20:00:00', 0, 5),
        'open_days'      => $row['open_days'] ?? 'Monday - Sunday',
        'description'    => $row['place_description'] ?? ''
    ];

    echo json_encode([
        'success' => true,
        'booking' => $booking
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error'   => 'Could not retrieve booking details: ' . $e->getMessage()
    ]);
}
