ALTER TABLE users
  ADD COLUMN mfa_reminder_logins integer NOT NULL DEFAULT 0,
  ADD COLUMN mfa_reminder_target integer NOT NULL DEFAULT 0;
