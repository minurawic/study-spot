<?php
// ============================================================
//  StudySpot – Session User API
//  Returns the currently logged-in user from the PHP session.
//  Called by navbar.js on every page load to keep localStorage
//  in sync with the server session.
// ============================================================

session_start();
header('Content-Type: application/json');
header('Cache-Control: no-store');

if (!empty($_SESSION['user_id'])) {
    // Use cached avatar from session, or fetch fresh from DB
    $avatar = $_SESSION['user_avatar'] ?? null;

    if (!$avatar) {
        $hostsToTry = ['127.0.0.1', 'localhost'];
        $portsToTry = [3606, 3306];
        $dbNames    = ['studyspot', 'studyspot_db'];
        foreach ($hostsToTry as $h) {
            foreach ($portsToTry as $p) {
                foreach ($dbNames as $db) {
                    try {
                        $pdo = new PDO(
                            "mysql:host=$h;port=$p;dbname=$db;charset=utf8mb4",
                            'root', '',
                            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
                        );
                        $stmt = $pdo->prepare("SELECT avatar FROM users WHERE id = ? LIMIT 1");
                        $stmt->execute([(int)$_SESSION['user_id']]);
                        $row = $stmt->fetch(PDO::FETCH_ASSOC);
                        if ($row) {
                            $avatar = $row['avatar'] ?: null;
                            if ($avatar) {
                                $_SESSION['user_avatar'] = $avatar; // cache it
                            }
                        }
                        break 3;
                    } catch (Exception $e) { /* try next combination */ }
                }
            }
        }
    }

    echo json_encode([
        'logged_in' => true,
        'user' => [
            'id'     => (int)$_SESSION['user_id'],
            'name'   => $_SESSION['user_name']  ?? '',
            'email'  => $_SESSION['user_email'] ?? '',
            'avatar' => $avatar,
        ]
    ]);
} else {
    echo json_encode(['logged_in' => false]);
}
