<?php
// ============================================================
//  StudySpot – API: Admin Reviews Management
// ============================================================
ob_start();
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/db.php';

$action = $_REQUEST['action'] ?? 'list';

if ($action === 'list') {
    try {
        $stmt = $pdo->query("
            SELECT r.id, r.place_id, r.user_id, r.rating, r.noise_level, r.wifi_quality,
                   r.value_for_money, r.comment, r.created_at,
                   COALESCE(u.full_name, 'Student') AS user_name,
                   COALESCE(p.name, 'Study Space') AS place_name
            FROM `reviews` r
            LEFT JOIN `users` u ON u.id = r.user_id
            LEFT JOIN `places` p ON p.id = r.place_id
            ORDER BY r.id DESC
        ");
        $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);

        ob_clean();
        echo json_encode(['success' => true, 'reviews' => $reviews]);
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
        $stmt = $pdo->prepare("DELETE FROM `reviews` WHERE id = ?");
        $stmt->execute([$id]);

        ob_clean();
        echo json_encode(['success' => true, 'message' => 'Review deleted successfully.']);
        exit;
    } catch (Exception $e) {
        ob_clean();
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        exit;
    }
}

ob_clean();
echo json_encode(['success' => false, 'error' => 'Invalid action']);
