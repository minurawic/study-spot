<?php
// ============================================================
//  StudySpot – API: Get User Bookings
//  Returns upcoming, completed, and cancelled bookings for a user
// ============================================================

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/db.php';
header('Content-Type: application/json; charset=utf-8');

// Use authenticated user or fallback to demo user (Sahan Perera, id = 1)
$userId = (int)($_SESSION['user_id'] ?? $_POST['user_id'] ?? $_GET['user_id'] ?? 1);

function format_time_display($timeStr) {
    if (!$timeStr) return '';
    $timestamp = strtotime("1970-01-01 " . $timeStr);
    if (!$timestamp) return $timeStr;
    // Format as "10.00 AM" to match PNG
    return date('h.i A', $timestamp);
}

try {
    $sql = "
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
            p.wifi,
            p.noise_level,
            p.cost_label
        FROM `bookings` b
        JOIN `places` p ON b.place_id = p.id
        WHERE b.user_id = ?
        ORDER BY 
            CASE 
                WHEN b.status = 'upcoming' THEN 1
                WHEN b.status = 'completed' THEN 2
                WHEN b.status = 'cancelled' THEN 3
                ELSE 4
            END,
            b.booking_date DESC,
            b.start_time ASC
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$userId]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $upcoming  = [];
    $completed = [];
    $cancelled = [];

    foreach ($rows as $row) {
        $cover = $row['cover_image'] ?? 'placeholder.svg';
        if (!str_starts_with($cover, 'http') && !str_starts_with($cover, 'images/')) {
            $cover = 'images/' . $cover;
        }

        $startTimeFmt = format_time_display($row['start_time']);
        $endTimeFmt   = format_time_display($row['end_time']);
        $timeSlotFmt  = trim($startTimeFmt . ' - ' . $endTimeFmt);

        $peopleCount = (int)($row['people'] ?? 1);
        $peopleText  = $peopleCount . ' Peoples'; // Matches PNG design: "1 Peoples", "2 Peoples"

        $bookingItem = [
            'id'             => (int)$row['booking_id'],
            'booking_id'     => (int)$row['booking_id'],
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
            'wifi'           => ucfirst($row['wifi'] ?? 'Free'),
            'noise_level'    => ucfirst($row['noise_level'] ?? 'Quiet'),
            'cost_label'     => $row['cost_label'] ?? 'Free'
        ];

        $status = strtolower($row['status']);
        if ($status === 'upcoming' || $status === 'pending') {
            $upcoming[] = $bookingItem;
        } elseif ($status === 'completed') {
            $completed[] = $bookingItem;
        } elseif ($status === 'cancelled') {
            $cancelled[] = $bookingItem;
        }
    }

    echo json_encode([
        'success' => true,
        'counts'  => [
            'upcoming'  => count($upcoming),
            'completed' => count($completed),
            'cancelled' => count($cancelled),
            'total'     => count($rows)
        ],
        'bookings' => [
            'upcoming'  => $upcoming,
            'completed' => $completed,
            'cancelled' => $cancelled
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error'   => 'Could not retrieve bookings: ' . $e->getMessage()
    ]);
}
