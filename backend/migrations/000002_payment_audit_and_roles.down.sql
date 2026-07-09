DROP TABLE IF EXISTS payment_audit_logs;

DELETE FROM roles
WHERE
    name IN (
        'staff',
        'finance',
        'owner',
        'super_admin'
    );