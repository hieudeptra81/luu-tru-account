/*
  # Create Accounts Table

  ## Summary
  Creates a secure accounts storage system for users to save their external service credentials.

  ## New Tables
  - `accounts`
    - `id` (uuid, primary key) - Unique identifier
    - `user_id` (uuid, FK to auth.users) - Owner of the account
    - `title` (text) - Label to identify the account (e.g., "GitHub", "Gmail")
    - `username` (text) - Username or email for the account
    - `password` (text) - Password for the account
    - `is_logged_in` (boolean) - Whether the user is currently logged in to this account
    - `created_at` (timestamptz) - Timestamp of creation

  ## Security
  - RLS enabled on `accounts` table
  - Authenticated users can only read, insert, update, and delete their own accounts
  - No cross-user data access is possible

  ## Notes
  1. All policies are scoped to `auth.uid() = user_id` ensuring strict ownership
  2. RLS is enabled from the start, so no data is accessible without matching policies
*/

CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  username text NOT NULL DEFAULT '',
  password text NOT NULL DEFAULT '',
  is_logged_in boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own accounts"
  ON accounts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own accounts"
  ON accounts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts"
  ON accounts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own accounts"
  ON accounts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS accounts_user_id_idx ON accounts(user_id);
