ALTER TABLE notifications ADD COLUMN type VARCHAR(30) DEFAULT 'info';

CREATE INDEX idx_notifications_user_read ON notifications (user_id, is_read);