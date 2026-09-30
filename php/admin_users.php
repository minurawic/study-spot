<?php
// ============================================================
//  StudySpot – API: Admin Users Management
// ============================================================
ob_start();
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/db.php';

$action = $_REQUEST['action'] ?? 'list';

if ($action === 'list') {
    try {
        $stmt = $pdo->query("
            SELECT u.id, u.full_name, u.email, u.created_at,
                   COUNT(b.id) AS total_bookings
            FROM `users` u
            LEFT JOIN `bookings` b ON b.user_id = u.id
            GROUP BY u.id
            ORDER BY u.id DESC
        ");
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

        ob_clean();
        echo json_encode(['success' => true, 'users' => $users]);
        exit;
    } catch (Exception $e) {
        ob_clean();
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        exit;
    }
}

if ($action === 'delete' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = intval($_POST['id'] ?? 0);
    if ($id <= 0) {
        ob_clean();
        echo json_encode(['success' => false, 'error' => 'Invalid ID']);
        exit;
    }
    try {
        $stmt = $pdo->prepare("DELETE FROM `users` WHERE id = ?");
        $stmt->execute([$id]);

        ob_clean();
        echo json_encode(['success' => true, 'message' => 'User deleted successfully.']);
        exit;
    } catch (Exception $e) {
        ob_clean();
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        exit;
    }
}

ob_clean();
echo json_encode(['success' => false, 'error' => 'Invalid action']);
