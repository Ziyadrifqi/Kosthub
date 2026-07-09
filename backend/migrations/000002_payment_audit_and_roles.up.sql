CREATE TABLE payment_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    payment_id UUID REFERENCES payments (id),
    action VARCHAR(20) NOT NULL, -- verified, rejected
    performed_by UUID REFERENCES users (id),
    note TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_payment_audit_logs_payment ON payment_audit_logs (payment_id);

-- seed role tambahan
INSERT INTO
    roles (name)
VALUES ('staff'),
    ('finance'),
    ('owner'),
    ('super_admin')
ON CONFLICT (name) DO NOTHING;