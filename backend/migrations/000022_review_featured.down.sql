DROP INDEX IF EXISTS idx_reviews_featured;

ALTER TABLE reviews DROP COLUMN IF EXISTS is_featured;