<?php
// ============================================================
//  StudySpot – Database Connection (PDO)
// ============================================================

define('DB_HOST',    'localhost');
define('DB_USER',    'root');
define('DB_PASS',    '');
define('DB_CHARSET', 'utf8mb4');

$databasesToTry = ['studyspot', 'studyspot_db'];
$pdo = null;

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

foreach ($databasesToTry as $dbName) {
    try {
        $dsn = sprintf('mysql:host=%s;dbname=%s;charset=%s', DB_HOST, $dbName, DB_CHARSET);
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        define('ACTIVE_DB_NAME', $dbName);
        break;
    } catch (PDOException $e) {
        // try next database
    }
}

if (!$pdo) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'error' => 'Database connection failed. Please ensure MySQL is running in XAMPP.']);
    exit;
}
