ALTER TABLE rooms ADD COLUMN discount_type VARCHAR(20);
-- 'percentage' atau 'fixed', NULL = tidak ada diskon
ALTER TABLE rooms ADD COLUMN discount_value NUMERIC(12, 2);

ALTER TABLE rooms ADD COLUMN discount_start_date DATE;

ALTER TABLE rooms ADD COLUMN discount_end_date DATE;