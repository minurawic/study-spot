<?php
// ============================================================
//  StudySpot – Seed Database for Dashboard, Profile & Contact
// ============================================================

require_once __DIR__ . '/db.php';

try {
    // 1. Ensure contact_messages table exists
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

    // 2. Ensure Places 9 through 14 exist
    $pdo->exec("
        INSERT INTO places (id, name, type, city, address, latitude, longitude, distance_km, wifi, wifi_note, noise_level, noise_note, cost_type, cost_label, price, open_time, close_time, open_days, description, cover_image, facilities)
        VALUES 
        (9, 'Colombo Public Library', 'library', 'Colombo', 'Colombo 07', 6.9061000, 79.8612000, 0.8, 'free', 'Free Wi-Fi', 'quiet', 'Quiet study rooms', 'free', 'Free', 0.00, '08:00:00', '19:00:00', 'Monday - Sunday', 'Colombo Public Library provides open reading areas, extensive reference sections, and free high-speed Wi-Fi in a calm learning environment.', 'national-library.jpg', 'Power Outlets,Parking,Air Conditioning,Drinking Water,Restrooms'),
        (10, 'Campus Learning Centre', 'university', 'Malabe', 'Malabe', 6.9147000, 79.9733000, 1.2, 'free', 'Campus Wi-Fi', 'quiet', 'Silent learning environment', 'free', 'Free', 0.00, '08:00:00', '21:00:00', 'Monday - Sunday', 'A dedicated learning centre in Malabe offering spacious study pods, research desks, and reliable Wi-Fi for university students.', 'uoc-library.jpg', 'Power Outlets,Parking,Air Conditioning,Drinking Water,Restrooms'),
        (11, 'Focus Coworking', 'coworking', 'Colombo', 'Colombo 05', 6.8845000, 79.8654000, 1.5, 'free', 'High Speed Fiber Wi-Fi', 'quiet', 'Quiet focus zone', '500+', 'LKR 500/hr', 500.00, '07:30:00', '22:00:00', 'Monday - Saturday', 'Modern co-working facility with ergonomic chairs, silent booths, fast Wi-Fi, and coffee on demand.', 'hub-lanka.jpg', 'Power Outlets,Parking,Air Conditioning,Drinking Water,Restrooms'),
        (12, 'Cafe Study Hub', 'cafe', 'Colombo', 'Colombo 03', 6.9050000, 79.8510000, 2.0, 'free', 'Fast Customer Wi-Fi', 'moderate', 'Soft background cafe ambiance', '201-500', 'LKR 300/hr', 300.00, '08:00:00', '22:30:00', 'Monday - Sunday', 'Comfortable study cafe with plenty of power sockets, artisanal tea and coffee, and moderate ambient sound.', 'cafe-kumbuk.jpg', 'Power Outlets,Parking,Air Conditioning,Drinking Water,Restrooms'),
        (13, 'Quiet Corner Library', 'library', 'Kandy', 'Kandy', 7.2906000, 80.6337000, 2.5, 'free', 'Free Public Wi-Fi', 'quiet', 'Quiet reading rooms', 'free', 'Free', 0.00, '08:30:00', '18:30:00', 'Monday - Saturday', 'A peaceful community library in Kandy ideal for undisturbed exam preparation and deep study.', 'book-haven.jpg', 'Power Outlets,Parking,Air Conditioning,Drinking Water,Restrooms'),
        (14, 'Read & Relax Cafe', 'cafe', 'Nugegoda', 'Nugegoda', 6.8649000, 79.8997000, 3.1, 'free', 'Complimentary Wi-Fi', 'moderate', 'Moderate conversation level', '201-500', 'LKR 250/hr', 250.00, '09:00:00', '21:00:00', 'Monday - Sunday', 'Charming student-friendly cafe in Nugegoda with affordable snacks, power outlets, and Wi-Fi access.', 'library-cafe.jpg', 'Power Outlets,Parking,Air Conditioning,Drinking Water,Restrooms')
        ON DUPLICATE KEY UPDATE name=VALUES(name);
    ");

    // 3. Set existing bookings of user 1 to completed
    $pdo->exec("UPDATE bookings SET status='completed' WHERE user_id=1");

    // Remove any previous temporary upcoming bookings
    $pdo->exec("DELETE FROM bookings WHERE user_id=1 AND place_id IN (9, 11)");

    // Insert Colombo Public Library (place 9) and Focus Coworking (place 11)
    $tomorrow = date('Y-m-d', strtotime('+1 day'));
    $stmt = $pdo->prepare("
        INSERT INTO bookings (user_id, place_id, booking_date, start_time, end_time, people, total_price, status, payment_ref)
        VALUES 
        (1, 9, ?, '09:00:00', '11:00:00', 1, 0.00, 'upcoming', 'SS-100299'),
        (1, 11, '2026-10-12', '14:00:00', '16:00:00', 1, 1000.00, 'pending', 'SS-100300')
    ");
    $stmt->execute([$tomorrow]);

    // 4. Ensure user 1 has exactly 4 favorites (places 1, 2, 3, 4)
    $pdo->exec("DELETE FROM favorites WHERE user_id=1");
    $pdo->exec("
        INSERT INTO favorites (user_id, place_id) VALUES 
        (1, 1), (1, 2), (1, 3), (1, 4)
    ");

    // 5. Ensure user 1 has exactly 6 reviews written, with review 1 being on National Library
    $pdo->exec("UPDATE reviews SET user_id=1, comment='Very quiet and comfortable. Perfect place for long study sessions!', rating=5, created_at=DATE_SUB(NOW(), INTERVAL 5 DAY) WHERE id=1");
    $pdo->exec("UPDATE reviews SET user_id=1 WHERE id IN (2, 4, 5, 8, 11)");

    // 6. Ensure user 1 has recently viewed spaces matching Figma UI (places 5, 1, 3, 8)
    $pdo->exec("DELETE FROM recently_viewed WHERE user_id=1");
    $today215 = date('Y-m-d 14:15:00');
    $today1140 = date('Y-m-d 11:40:00');
    $yesterday = date('Y-m-d 16:30:00', strtotime('-1 day'));
    $sun11Oct = date('2026-10-11 10:20:00');
    $stmt = $pdo->prepare("
        INSERT INTO recently_viewed (user_id, place_id, viewed_at) VALUES 
        (1, 5, ?),
        (1, 1, ?),
        (1, 3, ?),
        (1, 8, ?)
    ");
    $stmt->execute([$today215, $today1140, $yesterday, $sun11Oct]);

    echo "SUCCESS: Database seeded properly for Dashboard, Profile, Contact, and Recently Viewed.\n";

    // Verify stats
    $upCount = $pdo->query("SELECT COUNT(*) FROM bookings WHERE user_id=1 AND status IN ('upcoming', 'pending')")->fetchColumn();
    $favCount = $pdo->query("SELECT COUNT(*) FROM favorites WHERE user_id=1")->fetchColumn();
    $revCount = $pdo->query("SELECT COUNT(*) FROM reviews WHERE user_id=1")->fetchColumn();

    echo "Upcoming Bookings: $upCount (Expected 2)\n";
    echo "Favourite Spaces: $favCount (Expected 4)\n";
    echo "Reviews Written: $revCount (Expected 6)\n";

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
