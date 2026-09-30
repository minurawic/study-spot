<?php
// ============================================================
//  StudySpot – Database Connection (PDO)
// ============================================================

define('DB_HOST',    'localhost');
define('DB_USER',    'root');
define('DB_PASS',    '');
define('DB_CHARSET', 'utf8mb4');

$hostsToTry = ['127.0.0.1', 'localhost'];
$portsToTry = [3606, 3306];
$databasesToTry = ['studyspot', 'studyspot_db'];
$pdo = null;

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

foreach ($hostsToTry as $host) {
    foreach ($portsToTry as $port) {
        foreach ($databasesToTry as $dbName) {
            try {
                $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=%s', $host, $port, $dbName, DB_CHARSET);
                $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
                if (!defined('ACTIVE_DB_NAME')) define('ACTIVE_DB_NAME', $dbName);
                break 3;
            } catch (PDOException $e) {
                // try next
            }
        }
    }
}

if (!$pdo) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'error' => 'Database connection failed. Please ensure MySQL is running in XAMPP.']);
    exit;
}
