<?php
// ============================================================
//  StudySpot – Contact Us Form Handler (Image 2)
//  Saves user contact messages to MySQL Database
// ============================================================

ob_start();

$isAjax = (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') ||
          (isset($_SERVER['CONTENT_TYPE']) && stripos($_SERVER['CONTENT_TYPE'], 'application/json') !== false) ||
          isset($_POST['ajax']);

$requestMethod = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($requestMethod === 'POST') {
    // Collect and sanitize inputs
    $inputData = [];
    $rawInput = file_get_contents('php://input');
    if (!empty($rawInput)) {
        $decoded = json_decode($rawInput, true);
        if (is_array($decoded)) {
            $inputData = $decoded;
        }
    }

    $name    = trim($inputData['name']    ?? $_POST['name']    ?? '');
    $email   = trim($inputData['email']   ?? $_POST['email']   ?? '');
    $subject = trim($inputData['subject'] ?? $_POST['subject'] ?? '');
    $message = trim($inputData['message'] ?? $_POST['message'] ?? '');

    // Validation
    if (empty($name) || empty($email) || empty($subject) || empty($message)) {
        if ($isAjax) {
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['success' => false, 'error' => 'Please fill in all fields.']);
            exit;
        } else {
            header('Location: ../contact.html?error=empty_fields');
            exit;
        }
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        if ($isAjax) {
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['success' => false, 'error' => 'Please provide a valid email address.']);
            exit;
        } else {
            header('Location: ../contact.html?error=invalid_email');
            exit;
        }
    }

    try {
        require_once __DIR__ . '/db.php';

        // Auto create table if not exists
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS contact_messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(150) NOT NULL,
                subject VARCHAR(200) NOT NULL,
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        $stmt = $pdo->prepare("
            INSERT INTO contact_messages (name, email, subject, message)
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute([$name, $email, $subject, $message]);

        if ($isAjax) {
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode([
                'success' => true,
                'message' => 'Your message has been sent successfully! Our team will get back to you shortly.'
            ]);
            exit;
        } else {
            header('Location: ../contact.html?success=1');
            exit;
        }

    } catch (Exception $e) {
        if ($isAjax) {
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
            exit;
        } else {
            header('Location: ../contact.html?error=db_error');
            exit;
        }
    }
}

// If accessed via GET: return basic API info or status
header('Content-Type: application/json; charset=utf-8');
echo json_encode([
    'service' => 'StudySpot Contact API',
    'status' => 'active',
    'contact_info' => [
        'email' => 'support@studyspot.example',
        'phone' => '+94 11 234 5678',
        'location' => 'Colombo, Sri Lanka',
        'support_hours' => 'Monday – Friday, 9:00 AM – 5:00 PM'
    ]
]);
