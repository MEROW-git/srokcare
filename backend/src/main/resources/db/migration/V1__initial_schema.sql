CREATE TABLE users (
  id uuid PRIMARY KEY,
  nickname varchar(50) NOT NULL,
  email varchar(320) NOT NULL,
  password_hash varchar(100) NOT NULL,
  role varchar(20) NOT NULL CHECK (role IN ('CITIZEN','ADMIN')),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);
CREATE UNIQUE INDEX ux_users_email_lower ON users (lower(email));
CREATE TABLE reports (
  id uuid PRIMARY KEY,
  title varchar(120) NOT NULL,
  description varchar(2000) NOT NULL,
  category varchar(30) NOT NULL CHECK (category IN ('ROAD_DAMAGE','STREETLIGHT','GARBAGE','FLOODING','DRAINAGE','TRAFFIC_SAFETY','PUBLIC_FACILITY','OTHER')),
  status varchar(30) NOT NULL CHECK (status IN ('REPORTED','UNDER_REVIEW','IN_PROGRESS','RESOLVED','REJECTED')),
  admin_note varchar(2000),
  latitude double precision NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude double precision NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  province varchar(100) NOT NULL,
  district varchar(100),
  address varchar(255),
  author_id uuid NOT NULL REFERENCES users(id),
  support_count integer NOT NULL DEFAULT 0 CHECK (support_count >= 0),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);
CREATE INDEX ix_reports_created ON reports (created_at DESC);
CREATE INDEX ix_reports_support ON reports (support_count DESC, created_at DESC);
CREATE INDEX ix_reports_filters ON reports (category, status, province);
CREATE INDEX ix_reports_author ON reports (author_id);
CREATE TABLE report_images (
  id uuid PRIMARY KEY,
  report_id uuid NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  storage_key varchar(100) NOT NULL UNIQUE,
  content_type varchar(20) NOT NULL,
  created_at timestamptz NOT NULL
);
CREATE INDEX ix_report_images_report ON report_images (report_id);
CREATE TABLE report_supports (
  id uuid PRIMARY KEY,
  report_id uuid NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL,
  CONSTRAINT ux_report_support UNIQUE (report_id, user_id)
);
CREATE INDEX ix_report_supports_user ON report_supports (user_id);
CREATE TABLE comments (
  id uuid PRIMARY KEY,
  report_id uuid NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES users(id),
  content varchar(2000) NOT NULL,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL
);
CREATE INDEX ix_comments_report_created ON comments (report_id, created_at);
