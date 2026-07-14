INSERT INTO
    site_contents (key, value)
VALUES (
        'about_title',
        'Tentang KostHub'
    ),
    (
        'about_content',
        'KostHub adalah satu manajemen kost yang mengelola beberapa cabang dengan standar kebersihan, keamanan, dan harga yang konsisten di setiap lokasi. Kami percaya cari kost seharusnya sederhana dan transparan.'
    ),
    ('help_title', 'Pusat Bantuan'),
    (
        'help_content',
        'Punya pertanyaan seputar booking, pembayaran, atau aturan kost? Tim kami siap membantu lewat live chat di aplikasi, atau hubungi kami langsung lewat halaman Kontak.'
    ),
    (
        'contact_title',
        'Hubungi Kami'
    ),
    (
        'contact_content',
        'Kami siap membantu pertanyaan seputar booking, pembayaran, atau kunjungan ke lokasi kost.'
    ),
    (
        'contact_email',
        'halo@kosthub.id'
    ),
    (
        'contact_phone',
        '+62 812-3456-7890'
    ),
    (
        'contact_address',
        'Kantor Pusat: Jakarta Selatan, Indonesia'
    )
ON CONFLICT (key) DO NOTHING;