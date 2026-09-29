-- ===========================================================================
-- PANGAN KOE WEB - FULL DATABASE SCHEMA (phpMyAdmin / MySQL)
-- ===========================================================================
-- Database: `pangankoe_db`
-- Fully aligned with all Web Form Inputs (Sign Up, Family, Nutrition, Budget, Preferences, Profile)
-- ===========================================================================

CREATE DATABASE IF NOT EXISTS `pangankoe_db` 
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `pangankoe_db`;

-- 1. TABEL AUTENTIKASI (Sign In & Sign Up Form)
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `full_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `user_role` ENUM('IRT', 'AnakKos', 'UMKM', 'Lainnya') NOT NULL DEFAULT 'IRT',
  `password` VARCHAR(255) NOT NULL,
  `is_verified` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. TABEL PROFIL DAPUR (Step 5 Form: Profil, Foto, Bio, Alamat)
CREATE TABLE IF NOT EXISTS `user_profiles` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `full_name` VARCHAR(100) NOT NULL,
  `avatar_type` ENUM('initial', 'preset', 'upload') NOT NULL DEFAULT 'preset',
  `avatar_data` LONGTEXT DEFAULT NULL,
  `bio` VARCHAR(255) DEFAULT 'Pengelola dapur keluarga bahagia, fokus gizi seimbang balita & belanja hemat.',
  `address` TEXT NOT NULL,
  `delivery_radius_m` INT(11) NOT NULL DEFAULT 500,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_profile_user_id` (`user_id`),
  CONSTRAINT `fk_profile_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. TABEL ANGGOTA KELUARGA (Step 1 Form: Mode Sendiri / Multi-Anggota)
CREATE TABLE IF NOT EXISTS `family_members` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `member_name` VARCHAR(100) NOT NULL,
  `role_type` ENUM('Ibu', 'Ayah', 'Balita', 'Anak', 'Lansia', 'Sendiri') NOT NULL DEFAULT 'Anggota',
  `nutrition_note` VARCHAR(150) DEFAULT NULL,
  `is_stunting_priority` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_family_user_id` (`user_id`),
  CONSTRAINT `fk_family_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. TABEL PREFERENSI MAKANAN & ALERGI (Step 2 Form: Cita Rasa & Alergen)
CREATE TABLE IF NOT EXISTS `user_preferences` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `cuisine_preferences` JSON NOT NULL,
  `allergies` JSON NOT NULL,
  `is_halal_only` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_pref_user_id` (`user_id`),
  CONSTRAINT `fk_pref_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. TABEL PLAFON BUDGET BELANJA (Step 3 Form: Input Ketik Rp 300rb - Rp 2jt)
CREATE TABLE IF NOT EXISTS `user_budgets` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `weekly_budget` DECIMAL(12,2) NOT NULL DEFAULT 500000.00,
  `daily_budget` DECIMAL(12,2) NOT NULL DEFAULT 71428.57,
  `estimated_cost_per_meal` DECIMAL(10,2) NOT NULL DEFAULT 7900.00,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_budget_user_id` (`user_id`),
  CONSTRAINT `fk_budget_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. TABEL TARGET & BIOMETRIK GIZI (Step 4 Form: Fisik & Kalkulator AKG)
CREATE TABLE IF NOT EXISTS `user_nutrition_targets` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NOT NULL,
  `height_cm` DECIMAL(5,1) NOT NULL DEFAULT 160.0,
  `weight_kg` DECIMAL(5,1) NOT NULL DEFAULT 55.0,
  `age` INT(3) NOT NULL DEFAULT 28,
  `gender` ENUM('female', 'male') NOT NULL DEFAULT 'female',
  `activity_level` ENUM('sedentary', 'moderate', 'active') NOT NULL DEFAULT 'moderate',
  `target_calories` INT(11) NOT NULL DEFAULT 2150,
  `target_protein_g` INT(11) NOT NULL DEFAULT 68,
  `target_iron_mg` INT(11) NOT NULL DEFAULT 18,
  `target_fiber_g` INT(11) NOT NULL DEFAULT 28,
  `target_omega3` VARCHAR(50) NOT NULL DEFAULT 'Tinggi',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_nutrition_user_id` (`user_id`),
  CONSTRAINT `fk_nutrition_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. TABEL MITRA UMKM KULINER (Direktori Warung & Order WA)
CREATE TABLE IF NOT EXISTS `merchants` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `merchant_name` VARCHAR(100) NOT NULL,
  `merchant_type` ENUM('WarungMakan', 'TokoSayur', 'Katering', 'PasarBasah') NOT NULL,
  `whatsapp_number` VARCHAR(20) NOT NULL,
  `address` TEXT NOT NULL,
  `distance_meter` INT(11) NOT NULL DEFAULT 250,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================================================
-- DATA DUMMY AWAL (Untuk Pengujian Langsung)
-- ===========================================================================
INSERT INTO `users` (`id`, `full_name`, `email`, `user_role`, `password`) VALUES
(1, 'Ibu Ratna S.', 'ratna@gmail.com', 'IRT', '$2y$10$abcdefghijklmnopqrstuvwxyz1234567890'),
(2, 'Budi UMKM Warung', 'budiwarung@gmail.com', 'UMKM', '$2y$10$abcdefghijklmnopqrstuvwxyz1234567890')
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`);

INSERT INTO `user_profiles` (`user_id`, `full_name`, `avatar_type`, `avatar_data`, `bio`, `address`, `delivery_radius_m`) VALUES
(1, 'Ibu Ratna S.', 'preset', '👩', 'Pengelola dapur keluarga bahagia, fokus gizi seimbang balita & belanja hemat ke warung lokal.', 'Kecamatan Kebon Jeruk, Jakarta Barat (Radius < 500m)', 500)
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`);

INSERT INTO `merchants` (`merchant_name`, `merchant_type`, `whatsapp_number`, `address`, `distance_meter`) VALUES
('Toko Sayur & Sembako Pak Slamet', 'TokoSayur', '6281234567890', 'Jl. Kebon Jeruk Barat RT 02/RW 03', 150),
('Warung Makan & Olahan Bu Titin', 'WarungMakan', '6281234567891', 'Jl. Surya Utama No. 12', 250),
('Katering Sehat Ibu Ningsih', 'Katering', '6281234567892', 'Komplek Griya Indah Blok C4', 400);
