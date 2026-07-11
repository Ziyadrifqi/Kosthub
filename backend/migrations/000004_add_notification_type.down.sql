DROP INDEX IF EXISTS idx_notifications_user_read;

ALTER TABLE notifications DROP COLUMN IF EXISTS type;