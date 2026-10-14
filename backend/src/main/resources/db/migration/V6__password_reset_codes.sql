CREATE TABLE password_reset_codes (
  email varchar(320) PRIMARY KEY,
  code_hash varchar(100) NOT NULL,
  expires_at timestamptz NOT NULL,
  sent_at timestamptz NOT NULL,
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  sends_in_window integer NOT NULL DEFAULT 0 CHECK (sends_in_window >= 0),
  window_started_at timestamptz NOT NULL
);
