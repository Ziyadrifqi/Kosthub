DELETE FROM site_contents
WHERE
    key IN (
        'about_title',
        'about_content',
        'help_title',
        'help_content',
        'contact_title',
        'contact_content',
        'contact_email',
        'contact_phone',
        'contact_address'
    );