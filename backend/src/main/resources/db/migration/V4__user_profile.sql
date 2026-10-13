ALTER TABLE users
  ADD COLUMN bio varchar(500),
  ADD COLUMN avatar_key varchar(100),
  ADD COLUMN avatar_content_type varchar(20),
  ADD COLUMN cover_key varchar(100),
  ADD COLUMN cover_content_type varchar(20);

CREATE INDEX ix_users_nickname ON users (lower(nickname));
