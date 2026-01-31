-- Supabase Database Schema for Telegram Bot
-- Run this SQL in your Supabase SQL editor to create the necessary tables

-- Create user_states table
CREATE TABLE IF NOT EXISTS user_states (
  user_id BIGINT NOT NULL,
  chat_id BIGINT NOT NULL,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  state TEXT NOT NULL DEFAULT 'idle',
  conversation_history JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, chat_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_states_user_id ON user_states(user_id);
CREATE INDEX IF NOT EXISTS idx_user_states_chat_id ON user_states(chat_id);
CREATE INDEX IF NOT EXISTS idx_user_states_state ON user_states(state);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_states_updated_at
BEFORE UPDATE ON user_states
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add comment to table
COMMENT ON TABLE user_states IS 'Stores user states and conversation history for the Telegram bot';
