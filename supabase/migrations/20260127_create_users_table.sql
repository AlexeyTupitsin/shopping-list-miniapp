-- Create users table to store Telegram user information
CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY,  -- Telegram user_id
  first_name TEXT NOT NULL,
  last_name TEXT,
  username TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Everyone can read user info (for showing names in lists)
CREATE POLICY "Users are viewable by everyone"
  ON users FOR SELECT
  USING (true);

-- Users can only update their own info
CREATE POLICY "Users can update their own info"
  ON users FOR UPDATE
  USING (id = (current_setting('request.jwt.claims', true)::json->>'user_id')::bigint);

-- Users can insert their own info
CREATE POLICY "Users can insert their own info"
  ON users FOR INSERT
  WITH CHECK (id = (current_setting('request.jwt.claims', true)::json->>'user_id')::bigint);
