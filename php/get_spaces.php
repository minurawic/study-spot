<?php
// ============================================================
//  StudySpot – API: Get Study Spaces from DB
//  Returns JSON list of popular/filtered spaces
// ============================================================

require_once __DIR__ . '/db.php';
header('Content-Type: application/json');

$type   = $_GET['type']   ?? '';
$search = $_GET['search'] ?? '';
$limit  = (int)($_GET['limit'] ?? 8);

$where  = [];
$params = [];

if ($type && in_array($type, ['library', 'cafe', 'coworking', 'university'])) {
    $where[]  = 'type = ?';
    $params[] = $type;
}

if ($search) {
    $where[]  = '(name LIKE ? OR address LIKE ? OR district LIKE ?)';
    $like     = '%' . $search . '%';
    $params[] = $like;
    $params[] = $like;
    $params[] = $like;
}

$sql = 'SELECT id, name, type, address, district, latitude, longitude,
               wifi, noise_level, opening_time, closing_time,
               cost_per_hour, description, image_url, rating, total_reviews
        FROM spaces';

if ($where) {
    $sql .= ' WHERE ' . implode(' AND ', $where);
}

$sql .= ' ORDER BY rating DESC LIMIT ' . $limit;

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$spaces = $stmt->fetchAll();

// Add open/closed status
$now = new DateTime('now', new DateTimeZone('Asia/Colombo'));
$currentTime = $now->format('H:i:s');

foreach ($spaces as &$space) {
    $space['is_open'] = ($currentTime >= $space['opening_time'] && $currentTime <= $space['closing_time']);
    $space['opening_time'] = substr($space['opening_time'], 0, 5); // HH:MM
    $space['closing_time']  = substr($space['closing_time'], 0, 5);
}
unset($space);

echo json_encode(['success' => true, 'spaces' => $spaces]);
