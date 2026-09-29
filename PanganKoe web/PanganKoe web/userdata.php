<?php
/**
 * PANGAN KOE WEB - User Data API
 * 
 * Returns user profile data or handles profile updates.
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . "/connection.php";

if (!isset($connection) || !$connection) {
    $connection = $conn ?? $koneksi ?? $GLOBALS['connection'] ?? null;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $user_id = $_GET['user_id'] ?? $_SESSION['user_id'] ?? null;

    if (!$connection) {
        echo json_encode(["success" => false, "message" => "Database offline"]);
        exit();
    }

    if ($user_id) {
        $stmt = mysqli_prepare($connection, "SELECT u.id, u.full_name, u.email, u.user_role, p.avatar_type, p.avatar_data, p.bio, p.address FROM users u LEFT JOIN user_profiles p ON u.id = p.user_id WHERE u.id = ?");
        mysqli_stmt_bind_param($stmt, "i", $user_id);
        mysqli_stmt_execute($stmt);
        $res = mysqli_stmt_get_result($stmt);
        $data = mysqli_fetch_assoc($res);
        mysqli_stmt_close($stmt);

        if ($data) {
            echo json_encode(["success" => true, "data" => $data]);
            exit();
        }
    }

    // Default response if no user logged in
    echo json_encode(["success" => false, "message" => "Pengguna belum login."]);
    exit();
} elseif ($method === 'POST') {
    // Forward to registration if posting new data
    require_once __DIR__ . "/register.php";
}
?>