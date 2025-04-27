CREATE TABLE user_info (
  user_id uuid UNIQUE NOT NULL PRIMARY KEY,
  user_tier VARCHAR(10) NOT NULL,
  subscription_end_time TIMESTAMP,
  email VARCHAR(255), --email != null -> on_cognito
  password VARCHAR(255), --email != null -> on_cognito
  is_confirmed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)