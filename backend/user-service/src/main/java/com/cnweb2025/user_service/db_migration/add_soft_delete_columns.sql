-- Migration script to add soft delete support to users table
-- Date: 2025-01-19
-- Description: Add deleted and deleted_at columns to support soft delete functionality

-- Add deleted column (default FALSE)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT FALSE NOT NULL;

-- Add deleted_at column to track when user was soft deleted
ALTER TABLE users
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Create index for better query performance on soft deleted users
CREATE INDEX IF NOT EXISTS idx_users_deleted ON users(deleted);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at) WHERE deleted = TRUE;

-- Add comment to columns
COMMENT ON COLUMN users.deleted IS 'Indicates if user has been soft deleted';
COMMENT ON COLUMN users.deleted_at IS 'Timestamp when user was soft deleted';

