<?php
// ============================================================
//  StudySpot – API: Admin Bookings Management
// ============================================================
ob_start();
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/db.php';

$action = $_REQUEST['action'] ?? 'list';

if ($action === 'list') {
    try {
        $stmt = $pdo->query("
            SELECT b.id, b.user_id, b.place_id, b.booking_date, b.start_time, b.end_time,
                   b.people, b.total_price, b.status, b.payment_ref, b.created_at,
                   COALESCE(u.full_name, 'Guest User') AS user_name,
                   COALESCE(u.email, 'guest@studyspot.lk') AS user_email,
                   COALESCE(p.name, 'Study Space') AS place_name
            FROM `bookings` b
            LEFT JOIN `users` u ON u.id = b.user_id
            LEFT JOIN `places` p ON p.id = b.place_id
            ORDER BY b.id DESC
        ");
        $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);

        ob_clean();
        echo json_encode(['success' => true, 'bookings' => $bookings]);
        exit;
    } catch (Exception $e) {
        ob_clean();
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        exit;
    }
}

if ($action === 'update_status' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $id     = intval($_POST['id'] ?? 0);
    $status = trim($_POST['status'] ?? 'pending');

    if ($id <= 0 || !in_array($status, ['pending', 'upcoming', 'completed', 'cancelled'])) {
        ob_clean();
        echo json_encode(['success' => false, 'error' => 'Invalid ID or status']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("UPDATE `bookings` SET status = ? WHERE id = ?");
        $stmt->execute([$status, $id]);

        ob_clean();
        echo json_encode(['success' => true, 'message' => 'Booking status updated!']);
        exit;
    } catch (Exception $e) {
        ob_clean();
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        exit;
    }
}

if ($action === 'delete' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = intval($_POST['id'] ?? 0);
    try {
        $stmt = $pdo->prepare("DELETE FROM `bookings` WHERE id = ?");
        $stmt->execute([$id]);

        ob_clean();
        echo json_encode(['success' => true, 'message' => 'Booking removed.']);
        exit;
    } catch (Exception $e) {
        ob_clean();
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        exit;
    }
}

ob_clean();
echo json_encode(['success' => false, 'error' => 'Invalid action']);
