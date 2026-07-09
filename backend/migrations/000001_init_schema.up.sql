-- Extension wajib untuk gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ROLES & USERS
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    role_id INT REFERENCES roles (id),
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    avatar_url TEXT,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE UNIQUE INDEX uq_users_email ON users (email);

-- BRANCHES & BUILDINGS
CREATE TABLE branches (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE buildings (
    id SERIAL PRIMARY KEY,
    branch_id INT REFERENCES branches (id),
    name VARCHAR(150) NOT NULL,
    total_floor INT DEFAULT 1,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT now()
);

-- ROOM TYPES & ROOMS
CREATE TABLE room_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    base_price NUMERIC(12, 2) NOT NULL
);

CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    branch_id INT REFERENCES branches (id),
    building_id INT REFERENCES buildings (id),
    room_type_id INT REFERENCES room_types (id),
    room_number VARCHAR(20) NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'available', -- available, booked, maintenance
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_rooms_branch_status_price ON rooms (branch_id, status, price);

CREATE TABLE room_images (
    id SERIAL PRIMARY KEY,
    room_id INT REFERENCES rooms (id),
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT now()
);

-- FACILITIES
CREATE TABLE facilities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(100)
);

CREATE TABLE room_facilities (
    room_id INT REFERENCES rooms (id),
    facility_id INT REFERENCES facilities (id),
    PRIMARY KEY (room_id, facility_id)
);

-- BOOKINGS
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID REFERENCES users (id),
    room_id INT REFERENCES rooms (id),
    check_in DATE NOT NULL,
    duration_months INT NOT NULL,
    total_price NUMERIC(12, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, cancelled, completed
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_bookings_user_status ON bookings (user_id, status);

-- PAYMENTS
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    booking_id UUID REFERENCES bookings (id),
    method VARCHAR(30) NOT NULL, -- manual_transfer, midtrans
    proof_url TEXT, -- bukti transfer (MVP)
    midtrans_order_id VARCHAR(100),
    amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'waiting_verification', -- waiting_verification, verified, rejected, paid
    verified_by UUID REFERENCES users (id),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_payments_status ON payments (status);

-- REVIEWS & FAVORITES
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users (id),
    room_id INT REFERENCES rooms (id),
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE favorites (
    user_id UUID REFERENCES users (id),
    room_id INT REFERENCES rooms (id),
    created_at TIMESTAMP DEFAULT now(),
    PRIMARY KEY (user_id, room_id)
);

-- CHAT
CREATE TABLE chat_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID REFERENCES users (id),
    admin_id UUID REFERENCES users (id),
    status VARCHAR(20) DEFAULT 'open',
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    chat_room_id UUID REFERENCES chat_rooms (id),
    sender_id UUID REFERENCES users (id),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_chat_messages_room_created ON chat_messages (chat_room_id, created_at);

-- MAINTENANCE & NOTIFICATIONS
CREATE TABLE maintenance_tickets (
    id SERIAL PRIMARY KEY,
    room_id INT REFERENCES rooms (id),
    reported_by UUID REFERENCES users (id),
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'open',
    created_at TIMESTAMP DEFAULT now(),
    resolved_at TIMESTAMP
);

CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users (id),
    title VARCHAR(150),
    body TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT now()
);

-- AI CHAT HISTORY
CREATE TABLE ai_chat_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id UUID REFERENCES users (id), -- nullable, karena bisa dipakai sebelum login
    session_id VARCHAR(100),
    role VARCHAR(20) NOT NULL, -- user / assistant
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);