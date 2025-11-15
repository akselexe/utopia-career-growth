-- Add new fields to seeker_profiles table

ALTER TABLE public.seeker_profiles
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS job_preferences text,
ADD COLUMN IF NOT EXISTS education text,
ADD COLUMN IF NOT EXISTS certifications text;