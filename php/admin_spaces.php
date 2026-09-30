<?php
// ============================================================
//  StudySpot – API: Admin Study Space Management (CRUD)
// ============================================================
ob_start();
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/db.php';

// Ensure status column exists in places table
try {
    $colCheck = $pdo->query("SHOW COLUMNS FROM `places` LIKE 'status'")->fetch();
    if (!$colCheck) {
        $pdo->exec("ALTER TABLE `places` ADD COLUMN `status` ENUM('active','review','inactive') NOT NULL DEFAULT 'active'");
        // Update known initial places to match design
        $pdo->exec("UPDATE `places` SET `status` = 'active' WHERE id IN (9, 11)");
        $pdo->exec("UPDATE `places` SET `status` = 'review' WHERE id = 14");
    }
} catch (Exception $e) {
    // Continue even if alter fails
}

$action = $_REQUEST['action'] ?? 'list';

// Helper to format space type for UI
function formatType($type) {
    switch (strtolower($type)) {
        case 'library':    return 'Library';
        case 'coworking':  return 'Co-working';
        case 'cafe':       return 'Café';
        case 'university': return 'University';
        default:           return ucfirst($type);
    }
}

// ─────────────────────────────────────────────────────────────
// 1. LIST SPACES
// ─────────────────────────────────────────────────────────────
if ($action === 'list') {
    try {
        $stmt = $pdo->query("
            SELECT id, name, type, city, address, price, cost_label, rating,
                   COALESCE(status, 'active') AS status, cover_image, created_at
            FROM `places`
            ORDER BY 
              CASE 
                WHEN id = 9 THEN 1
                WHEN id = 11 THEN 2
                WHEN id = 14 THEN 3
                ELSE 4
              END,
              id ASC
        ");
        $spaces = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Format for display
        foreach ($spaces as &$s) {
            $s['type_display']   = formatType($s['type']);
            $s['status_display'] = ucfirst($s['status'] ?: 'active');
        }

        ob_clean();
        echo json_encode(['success' => true, 'spaces' => $spaces]);
        exit;
    } catch (Exception $e) {
        ob_clean();
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        exit;
    }
}

// ─────────────────────────────────────────────────────────────
// 2. ADD STUDY SPACE
// ─────────────────────────────────────────────────────────────
if ($action === 'create' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $name        = trim($_POST['name'] ?? '');
    $type        = trim($_POST['type'] ?? 'library');
    $city        = trim($_POST['city'] ?? 'Colombo');
    $address     = trim($_POST['address'] ?? '');
    $status      = trim($_POST['status'] ?? 'active');
    $price       = floatval($_POST['price'] ?? 0);
    $cost_label  = trim($_POST['cost_label'] ?? ($price > 0 ? "LKR $price" : 'Free'));
    $description = trim($_POST['description'] ?? '');
    $wifi        = trim($_POST['wifi'] ?? 'free');
    $noise_level = trim($_POST['noise_level'] ?? 'quiet');
    $cover_image = trim($_POST['cover_image'] ?? 'national-library.jpg');

    if (empty($name) || empty($address)) {
        ob_clean();
        echo json_encode(['success' => false, 'error' => 'Please provide space name and address.']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("
            INSERT INTO `places` (name, type, city, address, price, cost_label, status, description, wifi, noise_level, cover_image)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$name, $type, $city, $address, $price, $cost_label, $status, $description, $wifi, $noise_level, $cover_image]);

        $newId = $pdo->lastInsertId();

        ob_clean();
        echo json_encode(['success' => true, 'message' => 'Study space added successfully!', 'id' => $newId]);
        exit;
    } catch (Exception $e) {
        ob_clean();
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        exit;
    }
}

// ─────────────────────────────────────────────────────────────
// 3. UPDATE STUDY SPACE
// ─────────────────────────────────────────────────────────────
if ($action === 'update' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $id          = intval($_POST['id'] ?? 0);
    $name        = trim($_POST['name'] ?? '');
    $type        = trim($_POST['type'] ?? '');
    $city        = trim($_POST['city'] ?? '');
    $address     = trim($_POST['address'] ?? '');
    $status      = trim($_POST['status'] ?? 'active');
    $price       = isset($_POST['price']) ? floatval($_POST['price']) : null;
    $cost_label  = trim($_POST['cost_label'] ?? '');
    $description = trim($_POST['description'] ?? '');

    if ($id <= 0 || empty($name)) {
        ob_clean();
        echo json_encode(['success' => false, 'error' => 'Invalid space ID or name.']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("
            UPDATE `places`
            SET name = ?, type = ?, city = ?, address = ?, status = ?,
                price = COALESCE(?, price),
                cost_label = CASE WHEN ? != '' THEN ? ELSE cost_label END,
                description = CASE WHEN ? != '' THEN ? ELSE description END
            WHERE id = ?
        ");
        $stmt->execute([$name, $type, $city, $address, $status, $price, $cost_label, $cost_label, $description, $description, $id]);

        ob_clean();
        echo json_encode(['success' => true, 'message' => 'Study space updated successfully!']);
        exit;
    } catch (Exception $e) {
        ob_clean();
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        exit;
    }
}

// ─────────────────────────────────────────────────────────────
// 4. TOGGLE STATUS
// ─────────────────────────────────────────────────────────────
if ($action === 'toggle_status' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $id     = intval($_POST['id'] ?? 0);
    $status = trim($_POST['status'] ?? 'active');

    if (!in_array($status, ['active', 'review', 'inactive'])) {
        $status = 'active';
    }

    try {
        $stmt = $pdo->prepare("UPDATE `places` SET status = ? WHERE id = ?");
        $stmt->execute([$status, $id]);

        ob_clean();
        echo json_encode(['success' => true, 'status' => $status, 'status_display' => ucfirst($status)]);
        exit;
    } catch (Exception $e) {
        ob_clean();
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        exit;
    }
}

// ─────────────────────────────────────────────────────────────
// 5. DELETE STUDY SPACE
// ─────────────────────────────────────────────────────────────
if ($action === 'delete' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = intval($_POST['id'] ?? 0);
    if ($id <= 0) {
        ob_clean();
        echo json_encode(['success' => false, 'error' => 'Invalid ID']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM `places` WHERE id = ?");
        $stmt->execute([$id]);

        ob_clean();
        echo json_encode(['success' => true, 'message' => 'Study space removed.']);
        exit;
    } catch (Exception $e) {
        ob_clean();
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        exit;
    }
}

ob_clean();
echo json_encode(['success' => false, 'error' => 'Invalid action.']);
