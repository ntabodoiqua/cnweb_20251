-- Migration script for user account deletion feature
-- Date: 28.12.2025

-- Add columns for soft delete and grace period tracking
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS deletion_requested_at TIMESTAMP;

-- Create index for efficient querying of deleted users
CREATE INDEX IF NOT EXISTS idx_users_is_deleted ON users(is_deleted);
CREATE INDEX IF NOT EXISTS idx_users_deletion_requested_at ON users(deletion_requested_at) WHERE deletion_requested_at IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN users.is_deleted IS 'Soft delete flag - true means user account is marked for deletion';
COMMENT ON COLUMN users.deleted_at IS 'Timestamp when the account was soft deleted';
COMMENT ON COLUMN users.deletion_requested_at IS 'Timestamp when deletion was requested - used for grace period calculation (30 days)';
