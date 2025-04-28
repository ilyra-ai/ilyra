/*
  # Create Profiles Table for Authentication (MySQL)

  This migration script creates the `profiles` table in a MySQL database,
  designed to store user information necessary for authentication.

  1. New Tables
    - `profiles`
      - `id` (VARCHAR(36), primary key) - To store UUIDs or similar identifiers
      - `email` (VARCHAR(255), unique, not null) - User's email address
      - `password_hash` (VARCHAR(255), not null) - Hashed password (store securely!)
      - `name` (VARCHAR(255), not null) - User's name
      - `role` (VARCHAR(50), not null, default 'user') - User's role ('user', 'administrador')
      - `plan` (VARCHAR(50), not null, default 'free') - User's current plan
      - `created_at` (TIMESTAMP, default CURRENT_TIMESTAMP) - Timestamp of creation
      - `updated_at` (TIMESTAMP, default CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) - Timestamp of last update

  2. Indexes
    - Add a unique index on the `email` column for faster lookups during login.

  3. Security Notes (MySQL Permissions)
    - In a production MySQL environment, you would manage user permissions
      (e.g., using `GRANT` statements) to control which database users can
      access, insert, update, and delete data in this table.
    - **CRITICAL:** Passwords MUST be stored as secure hashes (e.g., using bcrypt).
      NEVER store plain text passwords. The backend login logic must hash
      the provided password and compare it to the stored hash.
*/

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id VARCHAR(36) PRIMARY KEY, -- Using VARCHAR for UUIDs or similar
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL, -- Store hashed passwords!
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  plan VARCHAR(50) NOT NULL DEFAULT 'free',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add an index on the email column for performance
CREATE INDEX idx_profiles_email ON profiles (email);

-- Note: Data insertion (like an initial admin user) would typically be
-- handled separately or in a different migration/seed script after the table is created.
-- Example (Conceptual - requires password hashing):
/*
INSERT INTO profiles (id, email, password_hash, name, role, plan)
VALUES (
  '00000000-0000-0000-0000-000000000000', -- Use a specific ID or adjust for auto-increment
  'douglas@ilyra.com.br',
  'hashed_password_here', -- Replace with a securely hashed password!
  'Douglas Administrador',
  'administrador',
  'enterprise'
);
*/
