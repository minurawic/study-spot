<?php
// ============================================================
//  StudySpot – Login Handler (JSON API)
// ============================================================
ob_start(); // catch any stray PHP output / warnings

header('Content-Type: application/json');

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ob_clean();
    echo json_encode(['success' => false, 'error' => 'validation']);
    exit;
}

// ── Collect input ─────────────────────────────────────────────
$email    = trim($_POST['email']    ?? '');
$password =      $_POST['password'] ?? '';

// ── Basic validation ──────────────────────────────────────────
if (empty($email) || empty($password) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    ob_clean();
    echo json_encode(['success' => false, 'error' => 'validation']);
    exit;
}

// ── Database connection ───────────────────────────────────────
require_once __DIR__ . '/db.php';

// ── Lookup user ───────────────────────────────────────────────
try {
    $stmt = $pdo->prepare('SELECT id, full_name, email, password_hash FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    // ── Verify credentials ────────────────────────────────────
    if ($user && password_verify($password, $user['password_hash'])) {
        ob_clean();
        echo json_encode([
            'success' => true,
            'user'    => [
                'id'        => $user['id'],
                'full_name' => $user['full_name'],
                'email'     => $user['email'],
            ]
        ]);
        exit;
    }

    ob_clean();
    echo json_encode(['success' => false, 'error' => 'invalid']);

} catch (PDOException $e) {
    ob_clean();
    echo json_encode(['success' => false, 'error' => 'server_error', 'msg' => $e->getMessage()]);
}
