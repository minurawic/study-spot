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
    echo json_encode([
        'logged_in' => true,
        'user' => [
            'id'    => (int)$_SESSION['user_id'],
            'name'  => $_SESSION['user_name']  ?? '',
            'email' => $_SESSION['user_email'] ?? '',
        ]
    ]);
} else {
    echo json_encode(['logged_in' => false]);
}
