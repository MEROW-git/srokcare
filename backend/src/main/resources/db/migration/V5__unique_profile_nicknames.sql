-- Public profile links use nicknames, so each nickname must identify one user.
-- Preserve the oldest account's name and give any existing duplicates a stable suffix.
DO $$
DECLARE
  duplicate_user record;
  candidate varchar(50);
  attempt integer;
BEGIN
  FOR duplicate_user IN
    SELECT id, nickname
    FROM (
      SELECT id, nickname,
             row_number() OVER (PARTITION BY lower(nickname) ORDER BY created_at, id) AS position
      FROM users
    ) ranked
    WHERE position > 1
  LOOP
    candidate := left(duplicate_user.nickname, 13) || '-' || duplicate_user.id::text;
    attempt := 0;
    WHILE EXISTS (SELECT 1 FROM users WHERE lower(nickname) = lower(candidate) AND id <> duplicate_user.id) LOOP
      attempt := attempt + 1;
      candidate := 'u' || attempt || '-' || duplicate_user.id::text;
    END LOOP;
    UPDATE users SET nickname = candidate WHERE id = duplicate_user.id;
  END LOOP;
END $$;

DROP INDEX IF EXISTS ix_users_nickname;
CREATE UNIQUE INDEX ux_users_nickname_lower ON users (lower(nickname));
