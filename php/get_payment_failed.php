<?php
// ============================================================
//  StudySpot – API: Get Payment Failed Details
//  Fetches booking details and reason for payment failure
//  from the MySQL database for payment-failed.html
// ============================================================

ob_start();
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/db.php';

// Format time from 24h (e.g. "10:00:00") to 12h dot-notation (e.g. "10.00 AM")
function formatDisplayTime(?string $timeStr): string
{
    if (!$timeStr) return '';
    $parts = explode(':', $timeStr);
    $h = (int)($parts[0] ?? 0);
    $m = (int)($parts[1] ?? 0);
    $period = $h >= 12 ? 'PM' : 'AM';
    if ($h === 0) {
        $h = 12;
    } elseif ($h > 12) {
        $h -= 12;
    }
    return sprintf('%d.%02d %s', $h, $m, $period);
}

// Format price with "Rs. 500" format
function formatDisplayPrice(float $price): string
{
    if ($price <= 0) return 'Free';
    if (floor($price) == $price) {
        return 'Rs. ' . number_format($price, 0);
    }
    return 'Rs. ' . number_format($price, 2);
}

// 1. Determine which booking / place to fetch
$bookingId  = isset($_GET['booking_id']) ? (int)$_GET['booking_id'] : (isset($_GET['id']) ? (int)$_GET['id'] : 0);
$paymentRef = trim($_GET['ref'] ?? $_GET['payment_ref'] ?? '');
$placeId    = (int)($_GET['place_id'] ?? 0);
$reason     = trim($_GET['reason'] ?? 'Card declined by bank.');
$desc       = trim($_GET['desc'] ?? 'Please check your card details or try another payment method. You have not been charged.');

try {
    $row = null;

    if ($bookingId > 0) {
        $stmt = $pdo->prepare('
            SELECT b.id, b.user_id, b.place_id, b.booking_date, b.start_time, b.end_time,
                   b.people, b.total_price, b.status, b.payment_ref, b.created_at,
                   p.name AS place_name, p.city AS place_city, p.cover_image, p.price AS unit_price
            FROM `bookings` b
            INNER JOIN `places` p ON p.id = b.place_id
            WHERE b.id = ?
            LIMIT 1
        ');
        $stmt->execute([$bookingId]);
        $row = $stmt->fetch();
    } elseif (!empty($paymentRef)) {
        $stmt = $pdo->prepare('
            SELECT b.id, b.user_id, b.place_id, b.booking_date, b.start_time, b.end_time,
                   b.people, b.total_price, b.status, b.payment_ref, b.created_at,
                   p.name AS place_name, p.city AS place_city, p.cover_image, p.price AS unit_price
            FROM `bookings` b
            INNER JOIN `places` p ON p.id = b.place_id
            WHERE b.payment_ref = ?
            LIMIT 1
        ');
        $stmt->execute([$paymentRef]);
        $row = $stmt->fetch();
    } elseif ($placeId > 0) {
        $stmt = $pdo->prepare('
            SELECT b.id, b.user_id, b.place_id, b.booking_date, b.start_time, b.end_time,
                   b.people, b.total_price, b.status, b.payment_ref, b.created_at,
                   p.name AS place_name, p.city AS place_city, p.cover_image, p.price AS unit_price
            FROM `bookings` b
            INNER JOIN `places` p ON p.id = b.place_id
            WHERE b.place_id = ?
            ORDER BY b.id DESC
            LIMIT 1
        ');
        $stmt->execute([$placeId]);
        $row = $stmt->fetch();

        // If no booking found for this place, fetch place directly
        if (!$row) {
            $pStmt = $pdo->prepare('SELECT id, name, city, cover_image, price FROM `places` WHERE id = ? LIMIT 1');
            $pStmt->execute([$placeId]);
            $place = $pStmt->fetch();
            if ($place) {
                $row = [
                    'id'           => 0,
                    'user_id'      => 1,
                    'place_id'     => $place['id'],
                    'booking_date' => date('Y-m-d'),
                    'start_time'   => '10:00:00',
                    'end_time'     => '12:00:00',
                    'people'       => 1,
                    'total_price'  => (float)$place['price'],
                    'status'       => 'pending',
                    'payment_ref'  => '',
                    'place_name'   => $place['name'],
                    'place_city'   => $place['city'],
                    'cover_image'  => $place['cover_image'],
                    'unit_price'   => $place['price']
                ];
            }
        }
    }

    // Default fallback: load booking #1 (The Library Cafe) from DB
    if (!$row) {
        $stmt = $pdo->query('
            SELECT b.id, b.user_id, b.place_id, b.booking_date, b.start_time, b.end_time,
                   b.people, b.total_price, b.status, b.payment_ref, b.created_at,
                   p.name AS place_name, p.city AS place_city, p.cover_image, p.price AS unit_price
            FROM `bookings` b
            INNER JOIN `places` p ON p.id = b.place_id
            WHERE b.id = 1 OR b.place_id = 5
            ORDER BY (b.id = 1) DESC, b.id DESC
            LIMIT 1
        ');
        $row = $stmt->fetch();
    }

    // Ultimate fallback if database is empty: fetch place 5 (The Library Cafe)
    if (!$row) {
        $pStmt = $pdo->query('SELECT id, name, city, cover_image, price FROM `places` WHERE id = 5 LIMIT 1');
        $place = $pStmt->fetch();
        if ($place) {
            $row = [
                'id'           => 1,
                'user_id'      => 1,
                'place_id'     => $place['id'],
                'booking_date' => '2026-09-12',
                'start_time'   => '10:00:00',
                'end_time'     => '12:00:00',
                'people'       => 1,
                'total_price'  => 500.00,
                'status'       => 'pending',
                'payment_ref'  => 'SS-100231',
                'place_name'   => $place['name'],
                'place_city'   => $place['city'],
                'cover_image'  => $place['cover_image'],
                'unit_price'   => $place['price']
            ];
        }
    }

    if (!$row) {
        ob_clean();
        echo json_encode([
            'success' => false,
            'error'   => 'Booking details not found.'
        ]);
        exit;
    }

    // Prepare image path
    $cover = $row['cover_image'] ?? 'library-cafe.jpg';
    if (!str_starts_with($cover, 'images/') && !str_starts_with($cover, 'http')) {
        $cover = 'images/' . $cover;
    }

    // Build formatted time string, e.g. "10.00 AM - 12.00 PM"
    $timeDisplay = '';
    if (!empty($row['start_time']) && !empty($row['end_time'])) {
        $timeDisplay = formatDisplayTime($row['start_time']) . ' - ' . formatDisplayTime($row['end_time']);
    } elseif (!empty($row['start_time'])) {
        $timeDisplay = formatDisplayTime($row['start_time']);
    }

    $failedData = [
        'id'              => (int)$row['id'],
        'user_id'         => (int)($row['user_id'] ?? 1),
        'place_id'        => (int)$row['place_id'],
        'place_name'      => $row['place_name'],
        'place_city'      => $row['place_city'],
        'cover_image'     => $cover,
        'booking_date'    => $row['booking_date'],
        'start_time'      => $row['start_time'],
        'end_time'        => $row['end_time'],
        'formatted_time'  => $timeDisplay ?: '10.00 AM - 12.00 PM',
        'people'          => (int)($row['people'] ?? 1),
        'total_price'     => (float)($row['total_price'] ?? 0.00),
        'formatted_price' => formatDisplayPrice((float)($row['total_price'] ?? 0.00)),
        'payment_ref'     => $row['payment_ref'] ?? '',
        'status'          => $row['status'] ?? 'pending',
        'reason'          => $reason,
        'description'     => $desc
    ];

    ob_clean();
    echo json_encode([
        'success' => true,
        'data'    => $failedData
    ]);
    exit;

} catch (Exception $e) {
    ob_clean();
    echo json_encode([
        'success' => false,
        'error'   => $e->getMessage()
    ]);
    exit;
}
