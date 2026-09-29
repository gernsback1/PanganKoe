<?php
/**
 * PANGAN KOE WEB - User Registration Backend API
 * 
 * Handles user sign-up and stores data safely into MySQL / phpMyAdmin.
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

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

// Extract payload (Supports standard POST form-data & raw JSON body)
$raw_input = file_get_contents('php://input');
$json_data = json_decode($raw_input, true) ?: [];

$full_name = trim($_POST['full_name'] ?? $_POST['nama'] ?? $json_data['full_name'] ?? $json_data['nama'] ?? '');
$email = trim($_POST['email'] ?? $_POST['account_identity'] ?? $json_data['email'] ?? $json_data['account_identity'] ?? '');
$user_role = trim($_POST['user_role'] ?? $_POST['kategori'] ?? $json_data['user_role'] ?? $json_data['kategori'] ?? 'IRT');
$raw_password = $_POST['password'] ?? $json_data['password'] ?? '';

// 1. Validation: Required fields
if (empty($full_name) || empty($email) || empty($raw_password)) {
    echo json_encode([
        "success" => false,
        "message" => "Harap lengkapi semua bidang yang wajib diisi (Nama, Email/WA, dan Kata Sandi)."
    ]);
    exit();
}

// 2. Validation: Minimum password length
if (strlen($raw_password) < 8) {
    echo json_encode([
        "success" => false,
        "message" => "Kata sandi minimal harus terdiri dari 8 karakter."
    ]);
    exit();
}

// 3. Validation: Check if email/identity is already registered
$check_stmt = mysqli_prepare($connection, "SELECT id FROM users WHERE email = ?");
if ($check_stmt) {
    mysqli_stmt_bind_param($check_stmt, "s", $email);
    mysqli_stmt_execute($check_stmt);
    mysqli_stmt_store_result($check_stmt);

    if (mysqli_stmt_num_rows($check_stmt) > 0) {
        echo json_encode([
            "success" => false,
            "message" => "Email atau nomor WhatsApp ini sudah terdaftar. Silakan gunakan opsi Masuk."
        ]);
        mysqli_stmt_close($check_stmt);
        exit();
    }
    mysqli_stmt_close($check_stmt);
}

// 4. Encrypt password with BCRYPT
$hashed_password = password_hash($raw_password, PASSWORD_DEFAULT);

// Map display role
$role_display = $user_role;
if ($user_role === 'IRT') $role_display = 'Ibu Rumah Tangga';
if ($user_role === 'AnakKos') $role_display = 'Anak Kos / Mandiri';
if ($user_role === 'UMKM') $role_display = 'Mitra Warung / UMKM';

// 5. Insert new user using prepared statement
$insert_stmt = mysqli_prepare($connection, "INSERT INTO users (full_name, email, user_role, password) VALUES (?, ?, ?, ?)");
if (!$insert_stmt) {
    echo json_encode([
        "success" => false,
        "message" => "Gagal menyiapkan query database: " . mysqli_error($connection)
    ]);
    exit();
}

mysqli_stmt_bind_param($insert_stmt, "ssss", $full_name, $email, $user_role, $hashed_password);

if (mysqli_stmt_execute($insert_stmt)) {
    $new_user_id = mysqli_insert_id($connection);
    
    // Auto-create initial profile entry
    $init_profile = mysqli_prepare($connection, "INSERT INTO user_profiles (user_id, full_name, address) VALUES (?, ?, 'Kecamatan Kebon Jeruk (Radius < 500m)') ON DUPLICATE KEY UPDATE full_name = ?");
    if ($init_profile) {
        mysqli_stmt_bind_param($init_profile, "iss", $new_user_id, $full_name, $full_name);
        @mysqli_stmt_execute($init_profile);
        mysqli_stmt_close($init_profile);
    }

    echo json_encode([
        "success" => true,
        "message" => "Pendaftaran akun PanganKoe berhasil! Data tersimpan di phpMyAdmin.",
        "user_id" => $new_user_id,
        "user_name" => $full_name,
        "user_role" => $role_display,
        "email" => $email
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Gagal menyimpan data ke database: " . mysqli_error($connection)
    ]);
}

mysqli_stmt_close($insert_stmt);
?>
