ALTER TABLE chat_rooms
ADD COLUMN branch_id INT REFERENCES branches (id);

CREATE INDEX idx_chat_rooms_branch_status ON chat_rooms (branch_id, status);