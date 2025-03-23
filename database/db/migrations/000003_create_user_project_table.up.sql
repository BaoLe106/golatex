CREATE TABLE user_project (
  project_id uuid NOT NULL REFERENCES project_info(project_id),
  user_id uuid NOT NULL REFERENCES user_info(user_id),
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)