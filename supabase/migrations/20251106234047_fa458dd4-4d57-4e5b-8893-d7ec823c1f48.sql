-- Add social links to seeker_profiles
ALTER TABLE public.seeker_profiles 
ADD COLUMN IF NOT EXISTS github_url text,
ADD COLUMN IF NOT EXISTS twitter_url text,
ADD COLUMN IF NOT EXISTS portfolio_url text;