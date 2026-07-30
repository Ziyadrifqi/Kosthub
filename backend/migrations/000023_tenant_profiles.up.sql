CREATE TABLE tenant_profiles (
    user_id UUID PRIMARY KEY REFERENCES users (id),
    id_number VARCHAR(50),
    address TEXT,
    emergency_contact_name VARCHAR(150),
    emergency_contact_phone VARCHAR(30),
    occupation VARCHAR(150),
    staff_note TEXT,
    updated_by UUID REFERENCES users (id),
    updated_at TIMESTAMP DEFAULT now()
);