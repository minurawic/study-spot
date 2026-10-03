<?php
// ============================================================
//  StudySpot – Registration Handler
// ============================================================

session_start();

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ../register.html');
    exit;
}

// ── Collect input ────────────────────────────────────────────
$full_name        = trim($_POST['full_name']        ?? '');
$email            = trim($_POST['email']            ?? '');
$password         =      $_POST['password']         ?? '';
$confirm_password =      $_POST['confirm_password'] ?? '';

// ── Validate: fields not empty ───────────────────────────────
if (empty($full_name) || empty($email) || empty($password) || empty($confirm_password)) {
    header('Location: ../register.html?error=validation');
    exit;
}

// ── Validate: email format ───────────────────────────────────
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    header('Location: ../register.html?error=validation');
    exit;
}

// ── Validate: password length ────────────────────────────────
if (strlen($password) < 6) {
    header('Location: ../register.html?error=validation');
    exit;
}

// ── Validate: passwords match ─────────────────────────────────
if ($password !== $confirm_password) {
    header('Location: ../register.html?error=password_mismatch');
    exit;
}

// ── Database connection ──────────────────────────────────────
require_once __DIR__ . '/db.php';

try {
    // ── Check email uniqueness ───────────────────────────────
    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->execute([$email]);

    if ($stmt->fetch()) {
        header('Location: ../register.html?error=email_exists');
        exit;
    }

    // ── Hash password & insert ───────────────────────────────
    $hash = password_hash($password, PASSWORD_DEFAULT);

    $insert = $pdo->prepare(
        'INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)'
    );
    $insert->execute([$full_name, $email, $hash]);

    $new_id = (int) $pdo->lastInsertId();

    // ── Set session ──────────────────────────────────────────
    session_regenerate_id(true);

    $_SESSION['user_id']    = $new_id;
    $_SESSION['user_name']  = $full_name;
    $_SESSION['user_email'] = $email;

    header('Location: ../index.html');
    exit;

} catch (PDOException $e) {
    header('Location: ../register.html?error=server_error');
    exit;
}
