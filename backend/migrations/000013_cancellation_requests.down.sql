DROP TABLE IF EXISTS cancellation_requests;

DELETE FROM site_contents
WHERE
    key IN (
        'terms_title',
        'terms_content'
    );