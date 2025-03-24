/*
  # Add delete user function

  1. Changes
    - Create a function to safely delete users
    - Function handles both auth.users and public.users deletion
    - Only accessible by admin users

  2. Security
    - Function is SECURITY DEFINER to run with elevated privileges
    - Only allows deletion by admin users
*/

-- Create function to delete users
CREATE OR REPLACE FUNCTION delete_user(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER -- Required to access auth.users
AS $$
DECLARE
  calling_user_email text;
BEGIN
  -- Get the email of the calling user
  SELECT email INTO calling_user_email
  FROM auth.users
  WHERE id = auth.uid();

  -- Check if calling user is an admin
  IF NOT (calling_user_email LIKE '%@prepclex.com' OR calling_user_email = 'mcmanaman111@gmail.com') THEN
    RAISE EXCEPTION 'Only administrators can delete users';
  END IF;

  -- Delete from auth.users (will cascade to public.users)
  DELETE FROM auth.users WHERE id = user_id;

  RETURN true;
END;
$$;