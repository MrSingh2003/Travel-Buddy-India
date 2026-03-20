ALTER TABLE users
  ADD COLUMN location VARCHAR(255) NULL,
  ADD COLUMN city VARCHAR(100) NULL,
  ADD COLUMN state_name VARCHAR(100) NULL,
  ADD COLUMN postal_code VARCHAR(20) NULL,
  ADD COLUMN emergency_contact_name VARCHAR(255) NULL,
  ADD COLUMN emergency_contact_phone VARCHAR(30) NULL;
