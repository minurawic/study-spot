<?php
// ============================================================
//  StudySpot – Login Handler
// ============================================================

session_start();

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ../login.html');
    exit;
}

// ── Collect input ────────────────────────────────────────────
$email    = trim($_POST['email']    ?? '');
$password =      $_POST['password'] ?? '';

// ── Basic validation ─────────────────────────────────────────
if (empty($email) || empty($password) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    header('Location: ../login.html?error=validation');
    exit;
}

// ── Database connection ──────────────────────────────────────
require_once __DIR__ . '/db.php';

// ── Lookup user ───────────────────────────────────────────────
$stmt = $pdo->prepare('SELECT id, full_name, email, password_hash FROM users WHERE email = ?');
$stmt->execute([$email]);
$user = $stmt->fetch();

// ── Verify credentials ────────────────────────────────────────
if ($user && password_verify($password, $user['password_hash'])) {
    // Regenerate session ID to prevent fixation
    session_regenerate_id(true);

    $_SESSION['user_id']    = $user['id'];
    $_SESSION['user_name']  = $user['full_name'];
    $_SESSION['user_email'] = $user['email'];

    header('Location: ../index.html');
    exit;
}

header('Location: ../login.html?error=invalid');
exit;
