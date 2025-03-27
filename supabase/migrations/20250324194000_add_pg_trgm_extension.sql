-- Enable the pg_trgm extension which provides text similarity functions
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add comment explaining the extension
COMMENT ON EXTENSION pg_trgm IS 'PostgreSQL extension providing trigram-based text similarity measurement functions';
