<?php
// ============================================================
//  StudySpot – API: Get FAQs from DB
// ============================================================
ob_start();
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/db.php';

// Default FAQs fallback data (matches PNG 1)
$defaultFaqs = [
    [
        'id' => 1,
        'question' => 'How do I make a booking?',
        'answer' => 'To make a booking, navigate to the Explore or Map page, choose your preferred study space, click on "Book Spot", select your date and time slot, specify the number of guests, and confirm your reservation. You will receive an instant confirmation.',
        'category' => 'Booking',
        'display_order' => 1,
        'is_active' => 1
    ],
    [
        'id' => 2,
        'question' => 'Can I cancel my booking?',
        'answer' => 'Yes, you can cancel your upcoming booking through your bookings dashboard. Cancellations made at least 2 hours prior to the scheduled start time are completely free of charge and eligible for a full refund.',
        'category' => 'Booking',
        'display_order' => 2,
        'is_active' => 1
    ],
    [
        'id' => 3,
        'question' => 'What payment methods are available?',
        'answer' => 'We accept all major credit and debit cards (Visa, MasterCard), local online bank transfers, and on-site cash payments at selected study spaces. For free public libraries and university halls, no payment is required.',
        'category' => 'Payments',
        'display_order' => 3,
        'is_active' => 1
    ],
    [
        'id' => 4,
        'question' => 'Is there a refund policy?',
        'answer' => 'Yes, we have a flexible refund policy. If you cancel your booking at least 2 hours before the session begins, you will receive a 100% refund. Cancellations made within 2 hours or no-shows may incur a partial fee depending on the venue policy.',
        'category' => 'Payments',
        'display_order' => 4,
        'is_active' => 1
    ],
    [
        'id' => 5,
        'question' => 'How do I add a place to my favorites?',
        'answer' => 'Simply click the heart icon on any study space card or space detail page. You can access all your saved favorites anytime by clicking the heart icon in the navigation bar when logged in.',
        'category' => 'Account',
        'display_order' => 5,
        'is_active' => 1
    ],
    [
        'id' => 6,
        'question' => 'How can I contact support?',
        'answer' => 'You can reach our dedicated support team anytime via email at support@studyspot.lk or by clicking the contact section below. We are here to assist you with any questions or issues.',
        'category' => 'Support',
        'display_order' => 6,
        'is_active' => 1
    ]
];

try {
    // Check if faqs table exists; if not, create and seed it automatically
    $tableCheck = $pdo->query("SHOW TABLES LIKE 'faqs'")->fetch();
    if (!$tableCheck) {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS `faqs` (
              `id` int(11) NOT NULL AUTO_INCREMENT,
              `question` varchar(255) NOT NULL,
              `answer` text NOT NULL,
              `category` varchar(50) DEFAULT 'General',
              `display_order` int(11) DEFAULT 0,
              `is_active` tinyint(1) DEFAULT 1,
              `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
              PRIMARY KEY (`id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ");

        $stmt = $pdo->prepare("INSERT INTO `faqs` (`id`, `question`, `answer`, `category`, `display_order`, `is_active`) VALUES (?, ?, ?, ?, ?, ?)");
        foreach ($defaultFaqs as $f) {
            $stmt->execute([$f['id'], $f['question'], $f['answer'], $f['category'], $f['display_order'], $f['is_active']]);
        }
    }

    $stmt = $pdo->query("SELECT id, question, answer, category, display_order FROM `faqs` WHERE is_active = 1 ORDER BY display_order ASC, id ASC");
    $faqs = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($faqs)) {
        $faqs = $defaultFaqs;
    }

    ob_clean();
    echo json_encode(['success' => true, 'faqs' => $faqs]);

} catch (Exception $e) {
    ob_clean();
    // Return default FAQs on any database error so frontend always renders
    echo json_encode(['success' => true, 'faqs' => $defaultFaqs, 'fallback' => true, 'error' => $e->getMessage()]);
}
