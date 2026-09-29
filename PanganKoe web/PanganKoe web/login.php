<?php
/**
 * PANGAN KOE WEB - User Login Backend API
 * 
 * Verifies credentials against MySQL / phpMyAdmin database.
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Load database connection
require_once __DIR__ . "/connection.php";

// Ensure $connection is available
if (!isset($connection) || !$connection) {
    $connection = $conn ?? $koneksi ?? $GLOBALS['connection'] ?? null;
}

if (!$connection) {
    echo json_encode([
        "success" => false,
        "message" => "Koneksi database MySQL tidak tersedia. " . ($connection_error ?? "Pastikan modul MySQL di XAMPP Control Panel sudah berstatus 'Start' (Hijau).")
    ]);
    exit();
}

// Extract payload
$raw_input = file_get_contents('php://input');
$json_data = json_decode($raw_input, true) ?: [];

$identity = trim($_POST['account_identity'] ?? $_POST['email'] ?? $json_data['account_identity'] ?? $json_data['email'] ?? '');
$raw_password = $_POST['password'] ?? $json_data['password'] ?? '';

if (empty($identity) || empty($raw_password)) {
    echo json_encode([
        "success" => false,
        "message" => "Harap masukkan Email / Nomor WA dan Kata Sandi Anda."
    ]);
    exit();
}

// Fetch user by Email/Identity
$stmt = mysqli_prepare($connection, "SELECT id, full_name, email, user_role, password FROM users WHERE email = ?");
if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "Gagal menyiapkan query verifikasi: " . mysqli_error($connection)
    ]);
    exit();
}

mysqli_stmt_bind_param($stmt, "s", $identity);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

if ($row = mysqli_fetch_assoc($result)) {
    $db_password = $row['password'];

    // Verify hashed password (supports BCRYPT and legacy plain text)
    $password_matched = password_verify($raw_password, $db_password) || ($raw_password === $db_password);

    if ($password_matched) {
        $user_role = $row['user_role'];
        $role_display = $user_role;
        if ($user_role === 'IRT') $role_display = 'Ibu Rumah Tangga';
        if ($user_role === 'AnakKos') $role_display = 'Anak Kos / Mandiri';
        if ($user_role === 'UMKM') $role_display = 'Mitra Warung / UMKM';

        $_SESSION['user_id'] = $row['id'];
        $_SESSION['user_name'] = $row['full_name'];
        $_SESSION['user_role'] = $role_display;

        echo json_encode([
            "success" => true,
            "message" => "Masuk berhasil! Selamat datang kembali.",
            "user_id" => $row['id'],
            "user_name" => $row['full_name'],
            "user_role" => $role_display,
            "email" => $row['email']
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Kata sandi yang Anda masukkan salah. Silakan coba lagi."
        ]);
    }
} else {
    echo json_encode([
        "success" => false,
        "message" => "Akun dengan Email/Nomor WA ini belum terdaftar."
    ]);
}

mysqli_stmt_close($stmt);
?>
