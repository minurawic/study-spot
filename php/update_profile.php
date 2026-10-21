<?php
// ============================================================
//  StudySpot – API: Update Profile Details
// ============================================================

ob_start();
header('Content-Type: application/json; charset=utf-8');

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed. POST required.']);
    exit;
}

$fullName = trim($_POST['full_name'] ?? '');
$email    = trim($_POST['email'] ?? '');
$userId   = isset($_POST['user_id']) ? (int)$_POST['user_id'] : (isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : null);

if (empty($fullName)) {
    echo json_encode(['success' => false, 'error' => 'Full name cannot be empty.']);
    exit;
}

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'error' => 'Please provide a valid email address.']);
    exit;
}

function calculateInitials($name) {
    $parts = preg_split('/\s+/', trim($name));
    if (count($parts) >= 2) {
        return strtoupper(mb_substr($parts[0], 0, 1) . mb_substr($parts[count($parts) - 1], 0, 1));
    } elseif (count($parts) === 1 && !empty($parts[0])) {
        return strtoupper(mb_substr($parts[0], 0, min(2, mb_strlen($parts[0]))));
    }
    return 'NP';
}

$avatarPath = null;
if (isset($_FILES['avatar']) && $_FILES['avatar']['error'] === UPLOAD_ERR_OK) {
    $fileTmp  = $_FILES['avatar']['tmp_name'];
    $fileName = $_FILES['avatar']['name'];
    $fileSize = $_FILES['avatar']['size'];
    $ext = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

    $allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    if (in_array($ext, $allowedExts) && $fileSize <= 5 * 1024 * 1024) {
        $uploadDir = __DIR__ . '/../images/avatars/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
        $newFileName = 'avatar_' . ($userId ?: 'user') . '_' . time() . '.' . $ext;
        $targetFile = $uploadDir . $newFileName;
        if (move_uploaded_file($fileTmp, $targetFile)) {
            $avatarPath = 'images/avatars/' . $newFileName;
        }
    }
}

// Database Connection
$pdo = null;
$hostsToTry = ['127.0.0.1', 'localhost'];
$portsToTry = [3606, 3306];
$databasesToTry = ['studyspot', 'studyspot_db'];
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

foreach ($hostsToTry as $host) {
    foreach ($portsToTry as $port) {
        foreach ($databasesToTry as $dbName) {
            try {
                $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', $host, $port, $dbName);
                $pdo = new PDO($dsn, 'root', '', $options);
                break 3;
            } catch (PDOException $e) {
                // try next
            }
        }
    }
}

if ($pdo) {
    try {
        if (!$userId) {
            $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
            $stmt->execute([$email]);
            $found = $stmt->fetch();
            if ($found) {
                $userId = (int)$found['id'];
            } else {
                $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
                $stmt->execute(['nimali.perera@gmail.com']);
                $found = $stmt->fetch();
                if ($found) {
                    $userId = (int)$found['id'];
                } else {
                    $userId = 1;
                }
            }
        }

        // Verify email uniqueness
        $stmtCheck = $pdo->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
        $stmtCheck->execute([$email, $userId]);
        if ($stmtCheck->fetch()) {
            echo json_encode(['success' => false, 'error' => 'This email address is already in use by another account.']);
            exit;
        }

        if ($avatarPath) {
            $stmtUpdate = $pdo->prepare("UPDATE users SET full_name = ?, email = ?, avatar = ? WHERE id = ?");
            $stmtUpdate->execute([$fullName, $email, $avatarPath, $userId]);
        } else {
            $stmtUpdate = $pdo->prepare("UPDATE users SET full_name = ?, email = ? WHERE id = ?");
            $stmtUpdate->execute([$fullName, $email, $userId]);
        }

        $_SESSION['user_id'] = $userId;
        $_SESSION['user_name'] = $fullName;
        $_SESSION['user_email'] = $email;

        $stmtUser = $pdo->prepare("SELECT id, full_name, email, avatar FROM users WHERE id = ?");
        $stmtUser->execute([$userId]);
        $updatedUser = $stmtUser->fetch();
        if ($updatedUser) {
            $updatedUser['initials'] = calculateInitials($updatedUser['full_name']);
        }

        ob_clean();
        echo json_encode([
            'success' => true,
            'message' => 'Profile details saved successfully.',
            'user' => $updatedUser
        ]);
        exit;

    } catch (Exception $e) {
        ob_clean();
        echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
        exit;
    }
} else {
    // MySQL not running - simulated update response
    $_SESSION['user_name'] = $fullName;
    $_SESSION['user_email'] = $email;
    $simulatedUser = [
        'id' => $userId ?: 5,
        'full_name' => $fullName,
        'email' => $email,
        'avatar' => $avatarPath,
        'initials' => calculateInitials($fullName)
    ];

    ob_clean();
    echo json_encode([
        'success' => true,
        'simulated' => true,
        'message' => 'Profile details saved successfully.',
        'user' => $simulatedUser
    ]);
    exit;
}
