-- ============================================
-- Migration: Add city, status to customers table
-- Run this in Supabase SQL Editor
-- ============================================

-- Add status column (pending/approved/rejected)
ALTER TABLE customers ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'approved'
  CHECK (status IN ('pending', 'approved', 'rejected'));

-- Add city column
ALTER TABLE customers ADD COLUMN IF NOT EXISTS city TEXT;

-- Add index on status for filtering pending customers
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);

-- Enable realtime for customers table
ALTER PUBLICATION supabase_realtime ADD TABLE customers;
