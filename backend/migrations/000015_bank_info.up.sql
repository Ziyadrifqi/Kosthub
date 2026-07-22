CREATE TABLE bank_accounts (
    id SERIAL PRIMARY KEY,
    bank_name VARCHAR(100) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    account_holder VARCHAR(150) NOT NULL,
    note TEXT,
    is_active BOOLEAN DEFAULT true,
    updated_by UUID REFERENCES users (id),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- migrasikan data lama (kalau ada) dari site_contents jadi 1 baris pertama
INSERT INTO
    bank_accounts (
        bank_name,
        account_number,
        account_holder,
        note
    )
SELECT COALESCE(
        (
            SELECT value
            FROM site_contents
            WHERE
                key = 'bank_name'
        ), 'Bank BCA'
    ), COALESCE(
        (
            SELECT value
            FROM site_contents
            WHERE
                key = 'bank_account_number'
        ), '1234567890'
    ), COALESCE(
        (
            SELECT value
            FROM site_contents
            WHERE
                key = 'bank_account_holder'
        ), 'PT KostHub Indonesia'
    ), (
        SELECT value
        FROM site_contents
        WHERE
            key = 'bank_note'
    )
WHERE
    NOT EXISTS (
        SELECT 1
        FROM bank_accounts
    );

DELETE FROM site_contents
WHERE
    key IN (
        'bank_name',
        'bank_account_number',
        'bank_account_holder',
        'bank_note'
    );