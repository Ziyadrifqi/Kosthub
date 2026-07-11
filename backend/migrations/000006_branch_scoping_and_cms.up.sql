ALTER TABLE users ADD COLUMN branch_id INT REFERENCES branches (id);

CREATE TABLE site_contents (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    updated_by UUID REFERENCES users (id),
    updated_at TIMESTAMP DEFAULT now()
);

-- seed konten default supaya frontend tidak error saat pertama fetch
INSERT INTO
    site_contents (key, value)
VALUES (
        'hero_title',
        'Cari Kost Nyaman, Booking dalam Hitungan Menit'
    ),
    (
        'hero_subtitle',
        'Ribuan kamar kost terverifikasi, transparan soal harga, dan proses booking yang aman.'
    ),
    ('promo_banner', ''),
    ('announcement', '');