DROP INDEX IF EXISTS idx_chat_rooms_branch_status;

ALTER TABLE chat_rooms DROP COLUMN IF EXISTS branch_id;