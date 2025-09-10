/*
  # Create reports table for LLM visibility reports

  1. New Tables
    - `reports`
      - `id` (uuid, primary key)
      - `client_name` (text, not null)
      - `html_content` (text, not null) 
      - `share_token` (text, unique, for public sharing)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `user_id` (uuid, references auth.users, nullable for anonymous reports)

  2. Security
    - Enable RLS on `reports` table
    - Add policy for users to read their own reports
    - Add policy for public access via share_token
    - Add policy for users to create reports
*/

CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  html_content text NOT NULL,
  share_token text UNIQUE DEFAULT encode(gen_random_bytes(32), 'base64url'),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own reports
CREATE POLICY "Users can read own reports"
  ON reports
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for anonymous users to read their own reports (using session or local storage)
CREATE POLICY "Anonymous users can read reports"
  ON reports
  FOR SELECT
  TO anon
  USING (user_id IS NULL);

-- Policy for public access via share_token
CREATE POLICY "Public can read shared reports"
  ON reports
  FOR SELECT
  TO anon, authenticated
  USING (share_token IS NOT NULL);

-- Policy for users to create reports
CREATE POLICY "Users can create reports"
  ON reports
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Policy for users to update their own reports
CREATE POLICY "Users can update own reports"
  ON reports
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for anonymous users to update their reports
CREATE POLICY "Anonymous users can update reports"
  ON reports
  FOR UPDATE
  TO anon
  USING (user_id IS NULL);

-- Policy for users to delete their own reports
CREATE POLICY "Users can delete own reports"
  ON reports
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for anonymous users to delete their reports
CREATE POLICY "Anonymous users can delete reports"
  ON reports
  FOR DELETE
  TO anon
  USING (user_id IS NULL);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_reports_share_token ON reports(share_token);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);