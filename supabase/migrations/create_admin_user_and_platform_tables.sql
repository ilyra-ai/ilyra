/*
  # Create Admin User and Platform Management Tables

  1. New Tables
    - `plans`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `description` (text)
      - `price` (numeric)
      - `features` (text[])
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)

    - `user_subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `plan_id` (uuid, foreign key to plans)
      - `start_date` (timestamp)
      - `end_date` (timestamp, nullable)
      - `status` (text, e.g., 'active', 'cancelled', 'expired')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Data Insertion
    - Insert admin user `douglas@ilyra.com.br` into `profiles` table.
      NOTE: This assumes a user with this email will be created in Supabase Auth separately. The UUID will be generated.

  3. Security
    - Enable RLS on new tables (`plans`, `user_subscriptions`).
    - Add policies for authenticated users to read `plans`.
    - Add policies for authenticated users to manage their own `user_subscriptions`.
    - Add policies for admin users to manage `plans` and `user_subscriptions`.
*/

-- Insert admin user (assuming user is created in auth.users separately)
-- Use a DO block to check if the email already exists before inserting
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'douglas@ilyra.com.br') THEN
    INSERT INTO public.profiles (id, email, name, role, plan)
    VALUES (
      gen_random_uuid(), -- Supabase Auth will generate the actual UUID, this is a placeholder for the profile table
      'douglas@ilyra.com.br',
      'Douglas Administrador', -- Renamed name for clarity
      'administrador', -- Renamed role
      'enterprise' -- Assign an appropriate initial plan
    );
  END IF;
END $$;


-- Create plans table
CREATE TABLE IF NOT EXISTS plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  price numeric NOT NULL DEFAULT 0,
  features text[],
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES public.plans(id) ON DELETE CASCADE,
  start_date timestamptz DEFAULT now(),
  end_date timestamptz, -- Nullable for ongoing subscriptions
  status text NOT NULL DEFAULT 'active', -- e.g., 'active', 'cancelled', 'expired'
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security for new tables
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

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

-- Note: Update/Delete policies for subscriptions are complex (e.g., cancellation)
-- and often managed by backend/webhooks. Basic policies for user self-management:
CREATE POLICY "Users can update own subscriptions (limited)"
  ON user_subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id); -- Add specific conditions here if needed (e.g., only status change)

-- Admin policies (assuming admin role check)
-- These would typically be handled via Postgres functions or backend logic
-- For simplicity in RLS, we can allow admins full access, but this is less secure
-- than using functions or backend checks.
-- Example (less secure):
/*
CREATE POLICY "Admins can manage all plans"
  ON plans
  FOR ALL
  TO authenticated -- Or a specific role if defined in Supabase
  USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'administrador' );

CREATE POLICY "Admins can manage all subscriptions"
  ON user_subscriptions
  FOR ALL
  TO authenticated -- Or a specific role if defined in Supabase
  USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'administrador' );
*/
-- A more secure approach involves checking the user's role within the USING/WITH CHECK clauses
-- using a function or direct subquery if performance allows.
-- Let's add policies that allow admins based on the 'role' column in the profiles table.

-- Policy for Admins to manage plans
CREATE POLICY "Admins can manage plans"
  ON plans
  FOR ALL
  TO authenticated
  USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'administrador' )
  WITH CHECK ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'administrador' );

-- Policy for Admins to manage subscriptions
CREATE POLICY "Admins can manage subscriptions"
  ON user_subscriptions
  FOR ALL
  TO authenticated
  USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'administrador' )
  WITH CHECK ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'administrador' );
