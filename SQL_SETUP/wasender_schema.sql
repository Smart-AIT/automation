-- =====================================================
-- WaSender Integration - Database Schema
-- Run this in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- Table: clients
-- Stores WhatsApp session info per user
-- =====================================================
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id INTEGER,                -- WaSender session ID
  session_name TEXT,                 -- Session display name
  api_key TEXT,                      -- Session-specific WaSender API Key
  status TEXT DEFAULT 'disconnected',-- Connection status
  phone_number TEXT,                 -- Connected phone number
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)                    -- One client per user
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clients table
CREATE POLICY "Users can view their own client"
  ON public.clients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own client"
  ON public.clients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own client"
  ON public.clients FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own client"
  ON public.clients FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- Table: delivery_logs
-- Tracks all message delivery attempts
-- =====================================================
CREATE TABLE IF NOT EXISTS public.delivery_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_entry_id UUID REFERENCES public.recipient_entries(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for delivery_logs
CREATE INDEX IF NOT EXISTS idx_delivery_logs_user_id ON public.delivery_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_delivery_logs_recipient ON public.delivery_logs(recipient_entry_id);
CREATE INDEX IF NOT EXISTS idx_delivery_logs_status ON public.delivery_logs(status);
CREATE INDEX IF NOT EXISTS idx_delivery_logs_sent_at ON public.delivery_logs(sent_at DESC);

-- Enable RLS for delivery_logs
ALTER TABLE public.delivery_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy for delivery_logs (users can only view their own logs)
CREATE POLICY "Users can view their own delivery logs"
  ON public.delivery_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert logs (for cron job)
CREATE POLICY "Service role can insert delivery logs"
  ON public.delivery_logs FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- Function to update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_clients_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on clients
DROP TRIGGER IF EXISTS update_clients_updated_at ON public.clients;
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION update_clients_updated_at();

-- =====================================================
-- Grant permissions for service role (for cron jobs)
-- =====================================================
-- These allow the cron job to read/write without RLS restrictions
-- Make sure your SUPABASE_SERVICE_ROLE_KEY is set in environment

COMMENT ON TABLE public.clients IS 'Stores WaSender WhatsApp session configuration per user';
COMMENT ON TABLE public.delivery_logs IS 'Tracks all birthday message delivery attempts';
