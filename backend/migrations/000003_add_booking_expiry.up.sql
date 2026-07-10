ALTER TABLE bookings ADD COLUMN expires_at TIMESTAMP;

CREATE INDEX idx_bookings_status_expires ON bookings (status, expires_at);