-- Create autologin_tokens table
CREATE TABLE IF NOT EXISTS autologin_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  used_at TIMESTAMPTZ
);

-- Create index on token
CREATE INDEX IF NOT EXISTS autologin_tokens_token_idx ON autologin_tokens(token);

-- Create index on user_id
CREATE INDEX IF NOT EXISTS autologin_tokens_user_id_idx ON autologin_tokens(user_id);

-- Create function to create the table if it doesn't exist
CREATE OR REPLACE FUNCTION create_autologin_tokens_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the table exists
  IF NOT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'autologin_tokens'
  ) THEN
    -- Create the table
    CREATE TABLE public.autologin_tokens (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      token TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      used_at TIMESTAMPTZ
    );
    
    -- Create index on token
    CREATE INDEX autologin_tokens_token_idx ON public.autologin_tokens(token);
    
    -- Create index on user_id
    CREATE INDEX autologin_tokens_user_id_idx ON public.autologin_tokens(user_id);
  END IF;
END;
$$; 