-- Birthday Automation - Recipient Entries Table
-- Created: 15 March 2026
-- Description: Stores all birthday recipient entries with delivery tracking

-- Drop table if exists (for fresh setup)
DROP TABLE IF EXISTS public.recipient_entries CASCADE;

-- Create recipient_entries table
CREATE TABLE public.recipient_entries (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Key to Supabase Auth Users
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Recipient Information
  full_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL UNIQUE, -- Globally unique phone number
  date_of_birth DATE NOT NULL, -- Format: YYYY-MM-DD
  
  -- Message & Status
  custom_message TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- Only 'sent' or 'pending'
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('sent', 'pending')),
  CONSTRAINT custom_message_word_limit CHECK (
    (LENGTH(TRIM(custom_message)) - LENGTH(REPLACE(TRIM(custom_message), ' ', '')) + 1) <= 300
  ),
  CONSTRAINT valid_phone_number CHECK (phone_number ~ '^\+?[0-9\s\-()]+$')
);

-- Create Indexes for better query performance
CREATE INDEX idx_recipient_entries_user_id ON public.recipient_entries(user_id);
CREATE INDEX idx_recipient_entries_phone_number ON public.recipient_entries(phone_number);
CREATE INDEX idx_recipient_entries_status ON public.recipient_entries(status);
CREATE INDEX idx_recipient_entries_created_at ON public.recipient_entries(created_at DESC);
CREATE INDEX idx_recipient_entries_user_status ON public.recipient_entries(user_id, status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.recipient_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own entries
CREATE POLICY "Users can view their own entries"
  ON public.recipient_entries
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can only insert their own entries
CREATE POLICY "Users can insert their own entries"
  ON public.recipient_entries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only update their own entries
CREATE POLICY "Users can update their own entries"
  ON public.recipient_entries
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only delete their own entries
CREATE POLICY "Users can delete their own entries"
  ON public.recipient_entries
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the update function
CREATE TRIGGER update_recipient_entries_updated_at
  BEFORE UPDATE ON public.recipient_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed data comment (optional - uncomment to use sample data)
/*
INSERT INTO public.recipient_entries (user_id, full_name, phone_number, date_of_birth, custom_message, status)
VALUES
  ('YOUR_USER_ID', 'John Doe', '+1234567890', '1990-05-15', 'Happy Birthday! Wishing you all the best on your special day!', 'pending'),
  ('YOUR_USER_ID', 'Jane Smith', '+1987654321', '1992-08-22', 'Happy Birthday! May all your wishes come true!', 'sent');
*/
