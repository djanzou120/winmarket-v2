-- Create the winmarket user and database
DO $$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE rolname = 'winmarket') THEN

      CREATE ROLE winmarket LOGIN PASSWORD 'password';
      ALTER ROLE winmarket CREATEDB;
   END IF;
END
$$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE winmarket_v2 TO winmarket;
ALTER DATABASE winmarket_v2 OWNER TO winmarket;