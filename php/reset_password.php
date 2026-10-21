<?php
// ============================================================
//  StudySpot – Password Reset Handler
//  Validates token, updates password hash in users table,
//  and cleans up password_resets record.
// ============================================================

ob_start();

$isAjax = (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') ||
          (isset($_SERVER['CONTENT_TYPE']) && stripos($_SERVER['CONTENT_TYPE'], 'application/json') !== false) ||
          isset($_POST['ajax']);

$requestMethod = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($requestMethod !== 'POST') {
    if ($isAjax) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => false, 'error' => 'Method not allowed.']);
        exit;
    } else {
        header('Location: ../login.html');
        exit;
    }
}

// ── Collect input ───────────────────────────────────────────
$email            = trim($_POST['email']            ?? '');
$token            = trim($_POST['token']            ?? '');
$new_password     =      $_POST['new_password']     ?? '';
$confirm_password =      $_POST['confirm_password'] ?? '';

// ── Validation ──────────────────────────────────────────────
if (empty($email) || empty($token) || empty($new_password) || empty($confirm_password)) {
    if ($isAjax) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => false, 'error' => 'Please fill in all required fields.']);
        exit;
    } else {
        header('Location: ../reset-password.html?error=empty&email=' . urlencode($email) . '&token=' . urlencode($token));
        exit;
    }
}

if (strlen($new_password) < 6) {
    if ($isAjax) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => false, 'error' => 'Password must be at least 6 characters long.']);
        exit;
    } else {
        header('Location: ../reset-password.html?error=short_password&email=' . urlencode($email) . '&token=' . urlencode($token));
        exit;
    }
}

if ($new_password !== $confirm_password) {
    if ($isAjax) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => false, 'error' => 'Passwords do not match. Please try again.']);
        exit;
    } else {
        header('Location: ../reset-password.html?error=password_mismatch&email=' . urlencode($email) . '&token=' . urlencode($token));
        exit;
    }
}

// ── Database Verification ───────────────────────────────────
require_once __DIR__ . '/db.php';

try {
    $stmt = $pdo->prepare('SELECT id, email, token, expires_at FROM password_resets WHERE email = ? AND token = ? LIMIT 1');
    $stmt->execute([$email, $token]);
    $resetRecord = $stmt->fetch();

    if (!$resetRecord) {
        if ($isAjax) {
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['success' => false, 'error' => 'Invalid reset token. Please request a new password reset link.']);
            exit;
        } else {
            header('Location: ../forgot-password.html?error=invalid_token');
            exit;
        }
    }

    // Check expiration
    if (strtotime($resetRecord['expires_at']) < time()) {
        // Remove expired token
        $del = $pdo->prepare('DELETE FROM password_resets WHERE email = ?');
        $del->execute([$email]);

        if ($isAjax) {
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['success' => false, 'error' => 'This reset link has expired. Please request a new one.']);
            exit;
        } else {
            header('Location: ../forgot-password.html?error=expired');
            exit;
        }
    }

    // ── Update Password in users table ───────────────────────
    $hash = password_hash($new_password, PASSWORD_DEFAULT);
    $updateStmt = $pdo->prepare('UPDATE users SET password_hash = ? WHERE email = ?');
    $updateStmt->execute([$hash, $email]);

    // Delete used reset tokens for this email
    $del = $pdo->prepare('DELETE FROM password_resets WHERE email = ?');
    $del->execute([$email]);

    if ($isAjax) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'success' => true,
            'message' => 'Your password has been successfully reset! You can now log in with your new password.'
        ]);
        exit;
    } else {
        header('Location: ../login.html?success=reset_success');
        exit;
    }

} catch (Exception $e) {
    if ($isAjax) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
        exit;
    } else {
        header('Location: ../reset-password.html?error=server_error&email=' . urlencode($email) . '&token=' . urlencode($token));
        exit;
    }
}
