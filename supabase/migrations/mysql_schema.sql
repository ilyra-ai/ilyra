-- Basic MySQL Schema based on SQLite structure

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id VARCHAR(36) PRIMARY KEY, -- Use VARCHAR for UUIDs in MySQL
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  plan VARCHAR(50) NOT NULL DEFAULT 'free',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id VARCHAR(36) PRIMARY KEY, -- Use VARCHAR for UUIDs in MySQL
  user_id VARCHAR(36), -- Use VARCHAR for UUIDs in MySQL
  title VARCHAR(255) NOT NULL,
  model VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Auto update timestamp
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id VARCHAR(36) PRIMARY KEY, -- Use VARCHAR for UUIDs in MySQL
  conversation_id VARCHAR(36), -- Use VARCHAR for UUIDs in MySQL
  role VARCHAR(50) NOT NULL,
  content TEXT NOT NULL, -- Use TEXT for potentially long content
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

-- Create plans table
CREATE TABLE IF NOT EXISTS plans (
  id VARCHAR(36) PRIMARY KEY, -- Use VARCHAR for UUIDs in MySQL
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) DEFAULT 0, -- Use DECIMAL for currency
  features JSON, -- MySQL 5.7+ supports JSON type
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id VARCHAR(36) PRIMARY KEY, -- Use VARCHAR for UUIDs in MySQL
  user_id VARCHAR(36),
  plan_id VARCHAR(36),
  start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_date TIMESTAMP NULL, -- Use NULL for nullable timestamp
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Auto update timestamp
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
);

-- Create ai_models table
CREATE TABLE IF NOT EXISTS ai_models (
  id VARCHAR(36) PRIMARY KEY, -- Use VARCHAR for UUIDs in MySQL
  name VARCHAR(255) UNIQUE NOT NULL,
  provider VARCHAR(255),
  status VARCHAR(50) DEFAULT 'enabled',
  plans JSON, -- MySQL 5.7+ supports JSON type
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create platform_settings table
CREATE TABLE IF NOT EXISTS platform_settings (
  id INT PRIMARY KEY DEFAULT 1, -- Use INT for single row ID
  openai_api_key VARCHAR(255),
  anthropic_api_key VARCHAR(255),
  google_api_key VARCHAR(255),
  huggingface_api_key VARCHAR(255),
  stripe_secret_key VARCHAR(255),
  allow_registration BOOLEAN DEFAULT TRUE,
  require_email_verification BOOLEAN DEFAULT FALSE,
  enable_google_auth BOOLEAN DEFAULT TRUE,
  enable_apple_auth BOOLEAN DEFAULT FALSE,
  default_from_email VARCHAR(255),
  default_from_name VARCHAR(255),
  terms_url VARCHAR(255),
  privacy_url VARCHAR(255),
  default_ai_model VARCHAR(50) DEFAULT 'gpt-3.5',
  free_message_limit INT DEFAULT 5,
  rate_limit_per_minute INT DEFAULT 60,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Auto update timestamp
  primary_color VARCHAR(7) DEFAULT '#3366FF', -- Store hex color
  secondary_color VARCHAR(7) DEFAULT '#7B61FF', -- Store hex color
  logo_url VARCHAR(255) -- Store URL
);

-- Optional: Insert mock admin user (adjust ID if needed in your MySQL setup)
-- INSERT INTO profiles (id, email, name, role, plan)
-- VALUES (
--   '00000000-0000-0000-0000-000000000000', -- Use a specific UUID or adjust if using auto-increment
--   'douglas@ilyra.com.br',
--   'Douglas Admin',
--   'admin',
--   'enterprise'
-- );
