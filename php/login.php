<?php
// ============================================================
//  StudySpot – Login Handler
// ============================================================

session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ../login.html');
    exit;
}

// Detect AJAX vs regular form POST
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
$isAjax = strpos($contentType, 'application/json') !== false
       || (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && $_SERVER['HTTP_X_REQUESTED_WITH'] === 'XMLHttpRequest');

// Parse input
if ($isAjax) {
    $raw   = file_get_contents('php://input');
    $input = $raw ? (json_decode($raw, true) ?? []) : [];
    $email    = trim($input['email']    ?? '');
    $password =      $input['password'] ?? '';
} else {
    $email    = trim($_POST['email']    ?? '');
    $password =      $_POST['password'] ?? '';
}

// Basic validation
if (empty($email) || empty($password) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    if ($isAjax) {
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'error' => 'validation']);
        exit;
    }
    header('Location: ../login.html?error=validation');
    exit;
}

require_once __DIR__ . '/db.php';

$stmt = $pdo->prepare('SELECT id, full_name, email, password_hash FROM users WHERE email = ?');
$stmt->execute([$email]);
$user = $stmt->fetch();

if ($user && password_verify($password, $user['password_hash'])) {
    session_regenerate_id(true);
    $_SESSION['user_id']    = $user['id'];
    $_SESSION['user_name']  = $user['full_name'];
    $_SESSION['user_email'] = $user['email'];

    if ($isAjax) {
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'user'    => [
                'id'    => $user['id'],
                'name'  => $user['full_name'],
                'email' => $user['email'],
            ],
        ]);
        exit;
    }

    // Traditional form POST – redirect to home page.
    // navbar.js will call session_user.php on page load and sync localStorage.
    header('Location: ../index.html');
    exit;
}

if ($isAjax) {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'error' => 'invalid', 'message' => 'Invalid email or password.']);
    exit;
}

header('Location: ../login.html?error=invalid');
exit;
