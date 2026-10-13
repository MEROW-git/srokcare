ALTER TABLE users
  ADD COLUMN mfa_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN mfa_secret_ciphertext varchar(512),
  ADD COLUMN mfa_pending_ciphertext varchar(512),
  ADD COLUMN mfa_pending_expires_at timestamptz,
  ADD COLUMN mfa_pending_attempts integer NOT NULL DEFAULT 0,
  ADD COLUMN mfa_last_step bigint,
  ADD COLUMN mfa_recovery_hashes text,
  ADD COLUMN mfa_challenge_hash varchar(64),
  ADD COLUMN mfa_challenge_expires_at timestamptz,
  ADD COLUMN mfa_failures integer NOT NULL DEFAULT 0,
  ADD COLUMN mfa_locked_until timestamptz,
  ADD COLUMN auth_version integer NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX ux_users_mfa_challenge_hash ON users (mfa_challenge_hash)
  WHERE mfa_challenge_hash IS NOT NULL;
