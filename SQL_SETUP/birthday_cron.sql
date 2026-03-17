-- 1. Add `last_sent_year` column to track yearly messages
ALTER TABLE recipient_entries
ADD COLUMN IF NOT EXISTS last_sent_year INT DEFAULT NULL;

-- 2. Create the optimized index for fast birthday lookups
-- We use EXTRACT on date_of_birth to match day and month efficiently
CREATE INDEX IF NOT EXISTS get_todays_birthdays_idx 
ON recipient_entries (
    EXTRACT(MONTH FROM date_of_birth), 
    EXTRACT(DAY FROM date_of_birth)
);

-- 3. Create the optimized SQL function
-- Returns recipients whose birthday is today AND who haven't received a message yet this year
CREATE OR REPLACE FUNCTION get_todays_birthdays()
RETURNS SETOF recipient_entries
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM recipient_entries
    WHERE EXTRACT(MONTH FROM date_of_birth) = EXTRACT(MONTH FROM CURRENT_DATE)
      AND EXTRACT(DAY FROM date_of_birth) = EXTRACT(DAY FROM CURRENT_DATE)
      AND (last_sent_year IS NULL OR last_sent_year < EXTRACT(YEAR FROM CURRENT_DATE));
END;
$$;
