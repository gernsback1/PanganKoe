<?php
/**
 * PANGAN KOE WEB - Robust Database Connection for XAMPP / phpMyAdmin / MySQL
 * 
 * Sets up $connection, $conn, and $koneksi globally.
 * Auto-detects port 3306 / 3307, auto-creates database 'pangankoe_db' and tables.
 */

// Enable error reporting during development
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);

// 1. Connection Configurations
$db_name = "pangankoe_db";
$db_user = "root";
$db_pass = "";

// Common host & port combinations for XAMPP on Windows
$connection_attempts = [
    ['host' => 'localhost', 'port' => 3306],
    ['host' => '127.0.0.1', 'port' => 3306],
    ['host' => 'localhost', 'port' => 3307],
    ['host' => '127.0.0.1', 'port' => 3307]
];

$connection = false;
$connection_error = "";

// 2. Try connecting to MySQL host
foreach ($connection_attempts as $attempt) {
    $conn_try = @mysqli_connect($attempt['host'], $db_user, $db_pass, "", $attempt['port']);
    if ($conn_try) {
        $connection = $conn_try;
        break;
    }
}

if (!$connection) {
    // Fallback standard connect
    $connection = @mysqli_connect("localhost", "root", "");
}

// If still failed, record error
if (!$connection) {
    $connection_error = "Tidak dapat terhubung ke server MySQL di XAMPP (Port 3306/3307). Pastikan modul MySQL pada XAMPP Control Panel sudah berstatus 'Start' (Hijau).";
} else {
    // Set charset
    mysqli_set_charset($connection, "utf8mb4");

    // 3. Auto-create database 'pangankoe_db' if it doesn't exist
    @mysqli_query($connection, "CREATE DATABASE IF NOT EXISTS `$db_name` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    @mysqli_select_db($connection, $db_name);

    // 4. Auto-create table 'users'
    $sql_users = "CREATE TABLE IF NOT EXISTS `users` (
      `id` INT(11) NOT NULL AUTO_INCREMENT,
      `full_name` VARCHAR(100) NOT NULL,
      `email` VARCHAR(100) NOT NULL,
      `user_role` ENUM('IRT', 'AnakKos', 'UMKM', 'Lainnya') NOT NULL DEFAULT 'IRT',
      `password` VARCHAR(255) NOT NULL,
      `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`),
      UNIQUE KEY `email` (`email`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
    @mysqli_query($connection, $sql_users);

    // 5. Auto-create table 'user_profiles'
    $sql_profiles = "CREATE TABLE IF NOT EXISTS `user_profiles` (
      `id` INT(11) NOT NULL AUTO_INCREMENT,
      `user_id` INT(11) NOT NULL,
      `full_name` VARCHAR(100) NOT NULL,
      `avatar_type` ENUM('initial', 'preset', 'upload') NOT NULL DEFAULT 'preset',
      `avatar_data` TEXT DEFAULT NULL,
      `bio` VARCHAR(255) DEFAULT NULL,
      `address` TEXT DEFAULT NULL,
      `delivery_radius_m` INT(11) NOT NULL DEFAULT 500,
      PRIMARY KEY (`id`),
      UNIQUE KEY `user_id` (`user_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
    @mysqli_query($connection, $sql_profiles);
}

// 6. Provide alias variables for universal compatibility across all scripts
$conn = $connection;
$koneksi = $connection;
$GLOBALS['connection'] = $connection;
$GLOBALS['conn'] = $connection;
$GLOBALS['koneksi'] = $connection;
?>