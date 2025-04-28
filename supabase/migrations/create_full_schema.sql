/*
  # Full Database Schema and Initial Data

  This migration script sets up the complete database schema for the iLyra platform,
  including tables for user profiles, conversations, messages, user preferences,
  plans, user subscriptions, AI models, and platform settings. It also configures
  Row Level Security (RLS) and inserts initial data for the admin user, default
  plans, default AI models, and default platform settings.

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, default gen_random_uuid())
      - `email` (text, unique, not null)
      - `name` (text, not null)
      - `role` (text, not null, default 'user')
      - `plan` (text, not null, default 'free')
      - `created_at` (timestamptz, default now())

    - `user_preferences`
      - `user_id` (uuid, primary key, foreign key to profiles)
      - `theme` (text, default 'light')
      - `font_size` (text, default 'medium')
      - `response_style` (text, default 'formal')
      - `enable_history` (boolean, default true)

    - `conversations`
      - `id` (uuid, primary key, default gen_random_uuid())
      - `user_id` (uuid, foreign key to profiles)
      - `title` (text, not null)
      - `model` (text, not null)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

    - `messages`
      - `id` (uuid, primary key, default gen_random_uuid())
      - `conversation_id` (uuid, foreign key to conversations)
      - `role` (text, not null)
      - `content` (text, not null)
      - `timestamp` (timestamptz, default now())

    - `plans`
      - `id` (text, primary key) -- Using text for simple IDs like 'free', 'plus'
      - `name` (text, unique, not null)
      - `description` (text)
      - `price` (numeric, default 0)
      - `features` (jsonb) -- Using jsonb for features array
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz, default now())

    - `user_subscriptions`
      - `id` (uuid, primary key, default gen_random_uuid())
      - `user_id` (uuid, foreign key to profiles)
      - `plan_id` (text, foreign key to plans) -- Referencing plans.id (text)
      - `start_date` (timestamptz, default now())
      - `end_date` (timestamptz, nullable)
      - `status` (text, not null, default 'active') -- e.g., 'active', 'cancelled', 'expired'
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

    - `ai_models`
      - `id` (text, primary key) -- Using text for simple IDs like 'gpt-3.5'
      - `name` (text, unique, not null)
      - `provider` (text)
      - `status` (text, default 'enabled')
      - `plans` (jsonb) -- Using jsonb for plans array
      - `created_at` (timestamptz, default now())

    - `platform_settings`
      - `id` (integer, primary key, default 1) -- Single row table
      - `openai_api_key` (text)
      - `anthropic_api_key` (text)
      - `google_api_key` (text)
      - `huggingface_api_key` (text)
      - `stripe_secret_key` (text)
      - `allow_registration` (boolean, default true)
      - `require_email_verification` (boolean, default false)
      - `enable_google_auth` (boolean, default true)
      - `enable_apple_auth` (boolean, default false)
      - `default_from_email` (text)
      - `default_from_name` (text)
      - `terms_url` (text)
      - `privacy_url` (text)
      - `default_ai_model` (text, default 'gpt-3.5')
      - `free_message_limit` (integer, default 5)
      - `rate_limit_per_minute` (integer, default 60)
      - `updated_at` (timestamptz, default now())
      - `primary_color` (text, default '#3366FF')
      - `secondary_color` (text, default '#7B61FF')
      - `logo_url` (text, nullable)

  2. Security
    - Enable RLS on all tables.
    - Add policies for authenticated users to manage their own data (profiles, preferences, conversations, messages, subscriptions).
    - Add policies for authenticated users to read public data (plans, AI models).
    - Add policies for admin users to manage all data in admin-specific tables (plans, AI models, platform settings, and potentially all users/subscriptions - though full admin RLS is complex and often handled by backend).

  3. Initial Data
    - Insert admin user `douglas@ilyra.com.br` into `profiles`.
    - Insert default user preferences for the admin user.
    - Insert default plans into `plans`.
    - Insert default AI models into `ai_models`.
    - Insert default platform settings into `platform_settings`.
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'user',
  plan text NOT NULL DEFAULT 'free',
  created_at timestamptz DEFAULT now()
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  theme text DEFAULT 'light',
  font_size text DEFAULT 'medium',
  response_style text DEFAULT 'formal',
  enable_history boolean DEFAULT true
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  model text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL,
  timestamp timestamptz DEFAULT now()
);

-- Create plans table
CREATE TABLE IF NOT EXISTS plans (
  id text PRIMARY KEY, -- Using text for simple IDs like 'free', 'plus'
  name text UNIQUE NOT NULL,
  description text,
  price numeric DEFAULT 0,
  features jsonb, -- Using jsonb for features array
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id text REFERENCES plans(id) ON DELETE CASCADE, -- Referencing plans.id (text)
  start_date timestamptz DEFAULT now(),
  end_date timestamptz, -- Nullable for ongoing subscriptions
  status text NOT NULL DEFAULT 'active', -- e.g., 'active', 'cancelled', 'expired'
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ai_models table
CREATE TABLE IF NOT EXISTS ai_models (
  id text PRIMARY KEY, -- Using text for simple IDs like 'gpt-3.5'
  name text UNIQUE NOT NULL,
  provider text,
  status text DEFAULT 'enabled',
  plans jsonb, -- Using jsonb for plans array
  created_at timestamptz DEFAULT now()
);

-- Create platform_settings table
CREATE TABLE IF NOT EXISTS platform_settings (
  id integer PRIMARY KEY DEFAULT 1, -- Single row table
  openai_api_key text,
  anthropic_api_key text,
  google_api_key text,
  huggingface_api_key text,
  stripe_secret_key text,
  allow_registration boolean DEFAULT true,
  require_email_verification boolean DEFAULT false,
  enable_google_auth boolean DEFAULT true,
  enable_apple_auth boolean DEFAULT false,
  default_from_email text,
  default_from_name text,
  terms_url text,
  privacy_url text,
  default_ai_model text DEFAULT 'gpt-3.5',
  free_message_limit integer DEFAULT 5,
  rate_limit_per_minute integer DEFAULT 60,
  updated_at timestamptz DEFAULT now(),
  primary_color text DEFAULT '#3366FF',
  secondary_color text DEFAULT '#7B61FF',
  logo_url text
);


-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;


-- Policies for profiles table
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Policies for user_preferences table
CREATE POLICY "Users can read own preferences"
  ON user_preferences
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for conversations table
CREATE POLICY "Users can read own conversations"
  ON conversations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
  ON conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON conversations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON conversations
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for messages table
CREATE POLICY "Users can read messages from own conversations"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages to own conversations"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- Policies for plans table
CREATE POLICY "Authenticated users can read plans"
  ON plans
  FOR SELECT
  TO authenticated
  USING (true); -- Plans are generally public or visible to authenticated users

-- Policies for user_subscriptions table
CREATE POLICY "Users can read own subscriptions"
  ON user_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON user_subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions (limited)"
  ON user_subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id); -- Add specific conditions here if needed (e.g., only status change)

-- Policies for ai_models table
CREATE POLICY "Authenticated users can read ai_models"
  ON ai_models
  FOR SELECT
  TO authenticated
  USING (true); -- AI models list might be public or visible to authenticated users

-- Policies for platform_settings table
-- Typically only admins should read/update platform settings
CREATE POLICY "Admins can read platform settings"
  ON platform_settings
  FOR SELECT
  TO authenticated
  USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'administrador' );

CREATE POLICY "Admins can update platform settings"
  ON platform_settings
  FOR UPDATE
  TO authenticated
  USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'administrador' );


-- Admin policies for managing other tables (optional, often handled by backend functions)
-- Example (less secure RLS, more secure via functions/backend):
CREATE POLICY "Admins can manage all profiles"
  ON profiles
  FOR ALL
  TO authenticated
  USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'administrador' )
  WITH CHECK ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'administrador' );

CREATE POLICY "Admins can manage all conversations"
  ON conversations
  FOR ALL
  TO authenticated
  USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'administrador' )
  WITH CHECK ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'administrador' );

CREATE POLICY "Admins can manage all messages"
  ON messages
  FOR ALL
  TO authenticated
  USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'administrador' )
  WITH CHECK ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'administrador' );

CREATE POLICY "Admins can manage all plans"
  ON plans
  FOR ALL
  TO authenticated
  USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'administrador' )
  WITH CHECK ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'administrador' );

CREATE POLICY "Admins can manage all subscriptions"
  ON user_subscriptions
  FOR ALL
  TO authenticated
  USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'administrador' )
  WITH CHECK ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'administrador' );

CREATE POLICY "Admins can manage all ai_models"
  ON ai_models
  FOR ALL
  TO authenticated
  USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'administrador' )
  WITH CHECK ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'administrador' );


-- Initial Data Inserts

-- Insert admin user (assuming user is created in auth.users separately)
-- Use a DO block to check if the email already exists before inserting
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'douglas@ilyra.com.br') THEN
    INSERT INTO public.profiles (id, email, name, role, plan)
    VALUES (
      '00000000-0000-0000-0000-000000000000', -- Use the fixed ID for the mock admin
      'douglas@ilyra.com.br',
      'Douglas Administrador', -- Renamed name for clarity
      'administrador', -- Renamed role
      'enterprise' -- Assign an appropriate initial plan
    );
  END IF;
END $$;

-- Insert default user preferences for the admin user if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_preferences WHERE user_id = '00000000-0000-0000-0000-000000000000') THEN
    INSERT INTO public.user_preferences (user_id, theme, font_size, response_style, enable_history)
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      'light',
      'medium',
      'formal',
      true
    );
  END IF;
END $$;


-- Insert default plans if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.plans LIMIT 1) THEN
    INSERT INTO public.plans (id, name, description, price, features, is_active) VALUES
    ('free', 'Free', 'Para uso pessoal', 0, '[ "Acesso GPT-3.5", "Histórico limitado" ]'::jsonb, true),
    ('plus', 'Plus', 'Para uso avançado', 49, '[ "Todos os modelos", "Geração de imagem", "Prioridade" ]'::jsonb, true),
    ('pro', 'Pro', 'Para equipes', 99, '[ "Tudo do Plus", "Workspace", "Suporte" ]'::jsonb, true),
    ('enterprise', 'Enterprise', 'Para empresas', NULL, '[ "Personalização", "Segurança", "SLA" ]'::jsonb, true),
    ('edu', 'Edu', 'Para instituições de ensino', NULL, '[ "Descontos", "Licenças" ]'::jsonb, true);
  END IF;
END $$;

-- Insert default AI models if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.ai_models LIMIT 1) THEN
    INSERT INTO public.ai_models (id, name, provider, status, plans) VALUES
    ('gpt-3.5', 'GPT-3.5 Turbo', 'OpenAI', 'enabled', '[ "free", "plus", "pro" ]'::jsonb),
    ('gpt-4', 'GPT-4', 'OpenAI', 'enabled', '[ "plus", "pro" ]'::jsonb),
    ('claude-3', 'Claude 3 Sonnet', 'Anthropic', 'enabled', '[ "plus", "pro" ]'::jsonb),
    ('gemini-pro', 'Gemini Pro', 'Google', 'disabled', '[ "pro" ]'::jsonb),
    ('llama-3', 'Llama 3 8B', 'HuggingFace/Meta', 'enabled', '[ "pro" ]'::jsonb);
  END IF;
END $$;

-- Insert default platform settings if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.platform_settings WHERE id = 1) THEN
    INSERT INTO public.platform_settings (
      id, openai_api_key, anthropic_api_key, google_api_key, huggingface_api_key, stripe_secret_key,
      allow_registration, require_email_verification, enable_google_auth, enable_apple_auth,
      default_from_email, default_from_name, terms_url, privacy_url, default_ai_model,
      free_message_limit, rate_limit_per_minute, updated_at, primary_color, secondary_color, logo_url
    ) VALUES (
      1, '', '', '', '', '',
      true, false, true, false,
      'noreply@ilyra.com.br', 'iLyra Plataforma',
      'https://ilyra.com.br/termos', 'https://ilyra.com.br/privacidade', 'gpt-3.5',
      5, 60, CURRENT_TIMESTAMP, '#3366FF', '#7B61FF', NULL
    );
  END IF;
END $$;
