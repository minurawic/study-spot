<?php
// ============================================================
//  StudySpot – API: Get User Bookings
//  Retrieves all user bookings with place details
// ============================================================

ob_start();
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/db.php';

$userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 1;

try {
    $stmt = $pdo->prepare('
        SELECT b.id, b.user_id, b.place_id, b.booking_date, b.start_time, b.end_time,
               b.people, b.total_price, b.status, b.payment_ref, b.created_at,
               p.name AS place_name, p.city AS place_city, p.cover_image, p.price AS place_price,
               p.address AS place_address
        FROM `bookings` b
        INNER JOIN `places` p ON p.id = b.place_id
        WHERE b.user_id = ?
        ORDER BY b.booking_date DESC, b.id DESC
    ');
    $stmt->execute([$userId]);
    $rows = $stmt->fetchAll();

    $bookings = [];
    foreach ($rows as $row) {
        $cover = $row['cover_image'] ?? 'library-cafe.jpg';
        if (!str_starts_with($cover, 'images/') && !str_starts_with($cover, 'http')) {
            $cover = 'images/' . $cover;
        }

        // Format time
        $formatTime = function ($t) {
            if (!$t) return '';
            $parts = explode(':', $t);
            $h = (int)($parts[0] ?? 0);
            $m = (int)($parts[1] ?? 0);
            $p = $h >= 12 ? 'PM' : 'AM';
            if ($h === 0) $h = 12;
            elseif ($h > 12) $h -= 12;
            return sprintf('%d.%02d %s', $h, $m, $p);
        };

        $timeStr = '';
        if (!empty($row['start_time']) && !empty($row['end_time'])) {
            $timeStr = $formatTime($row['start_time']) . ' - ' . $formatTime($row['end_time']);
        } elseif (!empty($row['start_time'])) {
            $timeStr = $formatTime($row['start_time']);
        }

        $price = (float)($row['total_price'] ?? 0.00);
        $priceStr = ($price <= 0) ? 'Free' : ('Rs. ' . (floor($price) == $price ? number_format($price, 0) : number_format($price, 2)));

        $bookings[] = [
            'id'              => (int)$row['id'],
            'place_id'        => (int)$row['place_id'],
            'place_name'      => $row['place_name'],
            'place_city'      => $row['place_city'],
            'place_address'   => $row['place_address'] ?? '',
            'cover_image'     => $cover,
            'booking_date'    => $row['booking_date'],
            'start_time'      => $row['start_time'],
            'end_time'        => $row['end_time'],
            'formatted_time'  => $timeStr,
            'people'          => (int)($row['people'] ?? 1),
            'total_price'     => $price,
            'formatted_price' => $priceStr,
            'status'          => $row['status'] ?? 'upcoming',
            'payment_ref'     => $row['payment_ref'] ?? '',
            'created_at'      => $row['created_at'] ?? ''
        ];
    }

    ob_clean();
    echo json_encode([
        'success'  => true,
        'bookings' => $bookings
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
