<?php
// ============================================================
//  StudySpot – API: Get Space Details & Reviews
//  Returns complete details, gallery, facilities, and reviews
// ============================================================

require_once __DIR__ . '/db.php';
header('Content-Type: application/json');

$id = (int)($_GET['id'] ?? 1);
if ($id <= 0) $id = 1;

try {
    // 1. Fetch place info
    $stmt = $pdo->prepare('SELECT * FROM places WHERE id = ?');
    $stmt->execute([$id]);
    $place = $stmt->fetch();

    if (!$place) {
        $stmt = $pdo->query('SELECT * FROM places ORDER BY id ASC LIMIT 1');
        $place = $stmt->fetch();
        if ($place) $id = (int)$place['id'];
    }

    if (!$place) {
        echo json_encode(['success' => false, 'error' => 'Place not found']);
        exit;
    }

    // 2. Fetch gallery images from place_images
    $imgStmt = $pdo->prepare('SELECT image FROM place_images WHERE place_id = ? ORDER BY id ASC');
    $imgStmt->execute([$id]);
    $galleryRows = $imgStmt->fetchAll(PDO::FETCH_COLUMN);

    $gallery = [];
    foreach ($galleryRows as $gImg) {
        if (!str_starts_with($gImg, 'http') && !str_starts_with($gImg, 'images/')) {
            $gallery[] = 'images/' . $gImg;
        } else {
            $gallery[] = $gImg;
        }
    }

    $cover = $place['cover_image'] ?? 'national-library.jpg';
    if (!str_starts_with($cover, 'http') && !str_starts_with($cover, 'images/')) {
        $cover = 'images/' . $cover;
    }

    // If place 1 (National Library), arrange exact 5 thumbnails from design
    if ($id == 1) {
        $gallery = [
            'images/national-library.jpg',
            'images/national-library-2.jpg',
            'images/national-library-3.jpg',
            'images/national-library-4.jpg',
            'images/national-library-5.jpg',
        ];
    } else {
        // Always start with the cover image, then the extra gallery images (no duplicates, max 5)
        $gallery = array_slice(array_values(array_unique(array_merge([$cover], $gallery))), 0, 5);
    }

    // 3. Fetch reviews joined with users
    $revStmt = $pdo->prepare(
        'SELECT r.id, r.rating, r.comment, r.created_at, u.full_name AS user_name, u.avatar
         FROM reviews r
         LEFT JOIN users u ON u.id = r.user_id
         WHERE r.place_id = ?
         ORDER BY r.created_at DESC'
    );
    $revStmt->execute([$id]);
    $reviewRows = $revStmt->fetchAll();

    function timeAgo($datetime) {
        $timestamp = strtotime($datetime);
        $diff = time() - $timestamp;
        if ($diff < 60) return 'Just now';
        $minutes = round($diff / 60);
        if ($minutes < 60) return $minutes . 'm ago';
        $hours = round($diff / 3600);
        if ($hours < 24) return $hours . 'h ago';
        $days = round($diff / 86400);
        if ($days < 7) return $days . ($days == 1 ? ' day ago' : ' days ago');
        $weeks = round($diff / 604800);
        if ($weeks < 4) return $weeks . ($weeks == 1 ? ' week ago' : ' weeks ago');
        return date('M d, Y', $timestamp);
    }

    $reviews = [];
    foreach ($reviewRows as $rev) {
        $timeAgoStr = timeAgo($rev['created_at']);
        $reviews[] = [
            'id'        => (int)$rev['id'],
            'user_name' => !empty($rev['user_name']) ? $rev['user_name'] : 'Anonymous',
            'avatar'    => $rev['avatar'] ?? null,
            'rating'    => (int)$rev['rating'],
            'comment'   => $rev['comment'],
            'created_at'=> $rev['created_at'],
            'time_ago'  => $timeAgoStr,
        ];
    }

    // 4. Parse Facilities list from the `facilities` column (comma separated)
    $facilitiesList = array_values(array_filter(
        array_map('trim', explode(',', (string)($place['facilities'] ?? ''))),
        'strlen'
    ));
    if (empty($facilitiesList)) {
        $facilitiesList = ['Power Outlets', 'Parking', 'Air Conditioning', 'Drinking Water', 'Restrooms'];
    }

    // 5. Format opening hours
    $openTime  = $place['open_time'] ?? '08:00:00';
    $closeTime = $place['close_time'] ?? '20:00:00';
    $openFormatted  = date('g.i A', strtotime($openTime));
    $closeFormatted = date('g.i A', strtotime($closeTime));
    $hoursLabel     = "$openFormatted - $closeFormatted";

    // Format type label
    $typeLabel = match (strtolower($place['type'])) {
        'library'    => 'Library',
        'cafe'       => 'Cafe',
        'coworking'  => 'Co-working Space',
        'university' => 'University Area',
        default      => ucfirst($place['type']),
    };

    // Format wifi label and note
    $wifiLabel = match ($place['wifi']) {
        'paid'  => 'Paid Wi-Fi',
        'none'  => 'No Wi-Fi',
        default => 'Free Wi-Fi',
    };
    $wifiNote  = !empty($place['wifi_note']) ? $place['wifi_note'] : 'High Speed';

    // Format noise label and note
    $noiseLabel = match (strtolower($place['noise_level'])) {
        'very_quiet' => 'Very Quiet',
        'quiet'      => 'Quiet',
        'moderate'   => 'Moderate',
        'lively'     => 'Lively',
        default      => ucfirst($place['noise_level']),
    };
    $noiseNote = !empty($place['noise_note']) ? $place['noise_note'] : 'Perfect for deep focus';

    // Cost info
    $costLabel = !empty($place['cost_label']) ? $place['cost_label'] : ($place['price'] > 0 ? 'LKR ' . number_format($place['price'], 0) : 'Free');
    $costNote  = ($place['price'] <= 0 || strtolower($place['cost_type']) === 'free') ? 'No entrance fee' : 'Per session / day';

    // Total reviews count
    $totalReviewsCount = count($reviews);

    $responseData = [
        'success' => true,
        'place'   => [
            'id'            => (int)$place['id'],
            'name'          => $place['name'],
            'type'          => $place['type'],
            'type_label'    => $typeLabel,
            'city'          => $place['city'],
            'address'       => $place['address'],
            'distance_km'   => (float)($place['distance_km'] ?? 0),
            'distance_text' => number_format((float)($place['distance_km'] ?? 0), 1) . ' km from you',
            'cover_image'   => $cover,
            'gallery'       => $gallery,
            'open_time'     => $openTime,
            'close_time'    => $closeTime,
            'hours_label'   => $hoursLabel,
            'open_days'     => !empty($place['open_days']) ? $place['open_days'] : 'Monday - Sunday',
            'wifi'          => $place['wifi'],
            'wifi_label'    => $wifiLabel,
            'wifi_note'     => $wifiNote,
            'noise_level'   => $place['noise_level'],
            'noise_label'   => $noiseLabel,
            'noise_note'    => $noiseNote,
            'cost_type'     => $place['cost_type'],
            'cost_label'    => $costLabel,
            'cost_note'     => $costNote,
            'price'         => (float)$place['price'],
            'facilities'    => $facilitiesList,
            'description'   => $place['description'] ?? '',
            'rating'        => (float)($place['rating'] ?? 0),
            'total_reviews' => $totalReviewsCount,
        ],
        'reviews' => $reviews,
    ];

    echo json_encode($responseData, JSON_UNESCAPED_SLASHES);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
