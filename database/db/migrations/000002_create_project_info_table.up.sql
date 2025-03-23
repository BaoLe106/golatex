CREATE TABLE project_info (
  project_id uuid UNIQUE NOT NULL PRIMARY KEY,
  project_name VARCHAR(255) NOT NULL,
  project_tier VARCHAR(10) NOT NULL,
  project_share_type SMALLINT NOT NULL DEFAULT 0, --1 -> share all, 0 -> share to specific users
  created_by uuid, --owner of the project; if guest then null
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_updated_by uuid,
  last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)