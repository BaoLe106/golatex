CREATE TABLE file_info (
  file_id uuid UNIQUE NOT NULL PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES project_info(project_id),
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(10) NOT NULL,
  file_dir VARCHAR(255) NOT NULL,
  content TEXT,
  created_by uuid, --owner of the file, if playground user, then null
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_updated_by uuid, --if playground user, then null
  last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);