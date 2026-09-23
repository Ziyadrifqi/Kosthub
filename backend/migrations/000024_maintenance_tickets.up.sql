ALTER TABLE maintenance_tickets
ADD COLUMN IF NOT EXISTS photo_url TEXT;

ALTER TABLE maintenance_tickets
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();