-- pastikan 1 user cuma bisa punya 1 chat room dengan status 'open' di satu waktu
CREATE UNIQUE INDEX idx_chat_rooms_user_open ON chat_rooms (user_id)
WHERE
    status = 'open';