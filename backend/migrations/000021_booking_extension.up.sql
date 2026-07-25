CREATE TABLE extension_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    booking_id UUID REFERENCES bookings (id),
    additional_months INT NOT NULL,
    total_price NUMERIC(12, 2) NOT NULL,
    proof_url TEXT,
    status VARCHAR(20) DEFAULT 'pending_payment', -- pending_payment, waiting_verification, verified, rejected
    verified_by UUID REFERENCES users (id),
    admin_note TEXT,
    created_at TIMESTAMP DEFAULT now(),
    verified_at TIMESTAMP
);

CREATE INDEX idx_extension_requests_status ON extension_requests (status);

ALTER TABLE bookings ADD COLUMN reminder_sent_at TIMESTAMPTZ;