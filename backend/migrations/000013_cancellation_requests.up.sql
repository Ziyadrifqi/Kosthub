CREATE TABLE cancellation_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    booking_id UUID REFERENCES bookings (id),
    user_id UUID REFERENCES users (id),
    type VARCHAR(20) NOT NULL, -- full_cancel, early_termination
    reason TEXT NOT NULL,
    refund_amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    processed_by UUID REFERENCES users (id),
    admin_note TEXT,
    created_at TIMESTAMP DEFAULT now(),
    processed_at TIMESTAMP
);

CREATE INDEX idx_cancellation_requests_status ON cancellation_requests (status);

INSERT INTO
    site_contents (key, value)
VALUES (
        'terms_title',
        'Syarat & Ketentuan'
    ),
    (
        'terms_content',
        'PEMBATALAN & REFUND

1. Pembatalan sebelum pindah (booking sudah dibayar & dikonfirmasi):
Refund 85% dari total pembayaran. 15% menjadi biaya administrasi.

2. Pindah di tengah masa sewa:
Refund dihitung dari sisa hari yang belum dijalani, dikurangi 30% biaya administrasi.

3. Ganti jadwal pindah atau ganti kamar:
Tidak dikenakan biaya. Hubungi admin melalui live chat untuk mengatur ulang.

4. Proses refund dilakukan manual melalui transfer bank oleh tim kami setelah pengajuan disetujui, maksimal 3 hari kerja.

KOORDINASI JADWAL PINDAH
Setelah pembayaran dikonfirmasi, silakan hubungi admin cabang melalui live chat untuk mengatur jadwal check-in.'
    )
ON CONFLICT (key) DO NOTHING;