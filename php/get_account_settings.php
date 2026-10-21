<?php
// ============================================================
//  StudySpot – API: Get Account Settings
//  Returns User Profile & Account Data
// ============================================================

ob_start();
header('Content-Type: application/json; charset=utf-8');

if (session_status() === PHP_SESSION_NONE) {
    session_start();
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

// Default fallback matching PNG mockup
$fallbackUser = [
    'id' => 5,
    'full_name' => 'Nimali Perera',
    'email' => 'nimali.perera@gmail.com',
    'initials' => 'NP',
    'avatar' => null
];

// Check if user ID is in session or query param
$userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : (isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : null);

// Connect to Database
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
        $user = null;

        // 1. By ID if provided / logged in
        if ($userId) {
            $stmt = $pdo->prepare("SELECT id, full_name, email, avatar FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            $user = $stmt->fetch();
        }

        // 2. By email session
        if (!$user && isset($_SESSION['user_email'])) {
            $stmt = $pdo->prepare("SELECT id, full_name, email, avatar FROM users WHERE email = ? LIMIT 1");
            $stmt->execute([$_SESSION['user_email']]);
            $user = $stmt->fetch();
        }

        // 3. By Nimali Perera
        if (!$user) {
            $stmt = $pdo->prepare("SELECT id, full_name, email, avatar FROM users WHERE email = ? LIMIT 1");
            $stmt->execute(['nimali.perera@gmail.com']);
            $user = $stmt->fetch();
        }

        // 4. By first user or seed
        if (!$user) {
            $stmt = $pdo->query("SELECT id, full_name, email, avatar FROM users ORDER BY id ASC LIMIT 1");
            $firstUser = $stmt->fetch();
            if ($firstUser) {
                $user = $firstUser;
            } else {
                // Insert Nimali Perera default record
                $hash = password_hash('password123', PASSWORD_DEFAULT);
                $ins = $pdo->prepare("INSERT INTO users (full_name, email, password_hash, created_at) VALUES (?, ?, ?, NOW())");
                $ins->execute(['Nimali Perera', 'nimali.perera@gmail.com', $hash]);
                $user = [
                    'id' => (int)$pdo->lastInsertId(),
                    'full_name' => 'Nimali Perera',
                    'email' => 'nimali.perera@gmail.com',
                    'avatar' => null
                ];
            }
        }

        $user['initials'] = calculateInitials($user['full_name']);

        ob_clean();
        echo json_encode([
            'success' => true,
            'user' => $user
        ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        exit;

    } catch (Exception $e) {
        ob_clean();
        echo json_encode([
            'success' => true,
            'is_fallback' => true,
            'user' => $fallbackUser,
            'error' => $e->getMessage()
        ]);
        exit;
    }
} else {
    // Database is currently offline / not running in XAMPP
    ob_clean();
    echo json_encode([
        'success' => true,
        'is_fallback' => true,
        'user' => $fallbackUser
    ]);
    exit;
}
