<?php
// ============================================================
//  StudySpot – Forgot Password Request Handler
//  Validates user email, generates secure reset token,
//  and stores reset request in MySQL Database (password_resets).
// ============================================================

ob_start();

$isAjax = (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') ||
          (isset($_SERVER['CONTENT_TYPE']) && stripos($_SERVER['CONTENT_TYPE'], 'application/json') !== false) ||
          isset($_POST['ajax']);

$requestMethod = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($requestMethod !== 'POST') {
    if ($isAjax) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => false, 'error' => 'Method not allowed. Please use POST.']);
        exit;
    } else {
        header('Location: ../forgot-password.html');
        exit;
    }
}

// ── Collect and sanitize input ──────────────────────────────
$inputData = [];
$rawInput = file_get_contents('php://input');
if (!empty($rawInput)) {
    $decoded = json_decode($rawInput, true);
    if (is_array($decoded)) {
        $inputData = $decoded;
    }
}

$email = trim($inputData['email'] ?? $_POST['email'] ?? '');

// ── Validation ──────────────────────────────────────────────
if (empty($email)) {
    if ($isAjax) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => false, 'error' => 'Please enter your email address.']);
        exit;
    } else {
        header('Location: ../forgot-password.html?error=empty');
        exit;
    }
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    if ($isAjax) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => false, 'error' => 'Please provide a valid email address.']);
        exit;
    } else {
        header('Location: ../forgot-password.html?error=invalid_email');
        exit;
    }
}

// ── Database Connection ──────────────────────────────────────
require_once __DIR__ . '/db.php';

try {
    // Auto-create password_resets table if it does not exist yet
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `password_resets` (
            `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
            `email` VARCHAR(150) NOT NULL,
            `token` VARCHAR(255) NOT NULL,
            `expires_at` DATETIME NOT NULL,
            `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX (`email`),
            INDEX (`token`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    // ── Check if user exists in database ─────────────────────
    $stmt = $pdo->prepare('SELECT id, full_name, email FROM users WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user) {
        if ($isAjax) {
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode([
                'success' => false,
                'error'   => 'No account found with this email address. Please check and try again.'
            ]);
            exit;
        } else {
            header('Location: ../forgot-password.html?error=not_found');
            exit;
        }
    }

    // ── Generate cryptographically secure reset token ─────────
    $token = bin2hex(random_bytes(32));
    $expires_at = date('Y-m-d H:i:s', time() + 3600); // 1 hour validity

    // Remove any previous active reset tokens for this email
    $deleteOld = $pdo->prepare('DELETE FROM password_resets WHERE email = ?');
    $deleteOld->execute([$email]);

    // Store new token in database
    $insert = $pdo->prepare('INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)');
    $insert->execute([$email, $token, $expires_at]);

    // Prepare reset URL
    $resetLink = 'reset-password.html?token=' . urlencode($token) . '&email=' . urlencode($email);

    // Optional: send email via mail() if local SMTP server is available
    $subject = "StudySpot - Password Reset Link";
    $mailBody = "Hi " . htmlspecialchars($user['full_name']) . ",\n\n"
              . "We received a request to reset your password for your StudySpot account.\n"
              . "You can reset your password using the following link:\n"
              . $resetLink . "\n\n"
              . "This link will expire in 1 hour.\n"
              . "If you did not request this, please ignore this email.\n\n"
              . "Best regards,\nThe StudySpot Team";
    $headers = "From: no-reply@studyspot.lk\r\nReply-To: support@studyspot.lk";
    @mail($email, $subject, $mailBody, $headers);

    if ($isAjax) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'success'    => true,
            'message'    => 'A reset link has been sent to ' . htmlspecialchars($email) . '. Please check your inbox.',
            'reset_link' => $resetLink,
            'email'      => $email,
            'expires_at' => $expires_at
        ]);
        exit;
    } else {
        header('Location: ../forgot-password.html?success=1&email=' . urlencode($email));
        exit;
    }

} catch (Exception $e) {
    if ($isAjax) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'success' => false,
            'error'   => 'Database error: ' . $e->getMessage()
        ]);
        exit;
    } else {
        header('Location: ../forgot-password.html?error=server_error');
        exit;
    }
}
