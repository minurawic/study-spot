<?php
// ============================================================
//  StudySpot – Registration Handler (JSON API)
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
$full_name        = trim($_POST['full_name']        ?? '');
$email            = trim($_POST['email']            ?? '');
$password         =      $_POST['password']         ?? '';
$confirm_password =      $_POST['confirm_password'] ?? '';

// ── Validate: fields not empty ────────────────────────────────
if (empty($full_name) || empty($email) || empty($password) || empty($confirm_password)) {
    ob_clean();
    echo json_encode(['success' => false, 'error' => 'validation']);
    exit;
}

// ── Validate: email format ────────────────────────────────────
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    ob_clean();
    echo json_encode(['success' => false, 'error' => 'validation']);
    exit;
}

// ── Validate: password length ─────────────────────────────────
if (strlen($password) < 6) {
    ob_clean();
    echo json_encode(['success' => false, 'error' => 'password_short']);
    exit;
}

// ── Validate: passwords match ─────────────────────────────────
if ($password !== $confirm_password) {
    ob_clean();
    echo json_encode(['success' => false, 'error' => 'password_mismatch']);
    exit;
}

// ── Database connection ───────────────────────────────────────
require_once __DIR__ . '/db.php';

try {
    // Check email uniqueness
    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->execute([$email]);

    if ($stmt->fetch()) {
        ob_clean();
        echo json_encode(['success' => false, 'error' => 'email_exists']);
        exit;
    }

    // Hash password & insert
    $hash   = password_hash($password, PASSWORD_DEFAULT);
    $insert = $pdo->prepare(
        'INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)'
    );
    $insert->execute([$full_name, $email, $hash]);
    $new_id = (int) $pdo->lastInsertId();

    ob_clean();
    echo json_encode([
        'success' => true,
        'user'    => [
            'id'        => $new_id,
            'full_name' => $full_name,
            'email'     => $email,
        ]
    ]);

} catch (PDOException $e) {
    ob_clean();
    echo json_encode(['success' => false, 'error' => 'server_error', 'msg' => $e->getMessage()]);
}
