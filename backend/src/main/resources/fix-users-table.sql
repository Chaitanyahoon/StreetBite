-- Fix users table for MySQL-only authentication
-- Run this in MySQL Workbench

USE streetbite;

-- Step 1: Add password_hash column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Step 2: Make email unique if not already
ALTER TABLE users 
ADD UNIQUE INDEX IF NOT EXISTS idx_email_unique (email);

-- Step 3: Drop firebase_uid column
ALTER TABLE users 
DROP COLUMN IF EXISTS firebase_uid;

-- Step 4: Drop legacy 2FA columns that are no longer used
ALTER TABLE users
DROP COLUMN IF EXISTS two_factor_enabled,
DROP COLUMN IF EXISTS two_factor_code_hash,
DROP COLUMN IF EXISTS two_factor_code_expiry,
DROP COLUMN IF EXISTS two_factor_challenge_token;

-- Step 5: Make password_hash NOT NULL (after adding it)
ALTER TABLE users 
MODIFY COLUMN password_hash VARCHAR(255) NOT NULL;

-- Verify the changes
DESCRIBE users;
