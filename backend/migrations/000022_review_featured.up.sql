ALTER TABLE reviews ADD COLUMN is_featured BOOLEAN DEFAULT false;

CREATE INDEX idx_reviews_featured ON reviews (is_featured);