-- This script runs during PostgreSQL initialization
-- Ensure the user and database exist
SELECT 'init start';

-- The user and database should already be created by the environment variables
-- This script is just to ensure everything is properly set up

-- Grant all privileges to the winmarket user on the database
GRANT ALL PRIVILEGES ON DATABASE winmarket_v2 TO winmarket;

SELECT 'init complete';