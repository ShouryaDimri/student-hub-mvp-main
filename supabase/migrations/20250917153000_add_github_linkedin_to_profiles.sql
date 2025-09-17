-- Add GitHub and LinkedIn fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN github_url TEXT,
ADD COLUMN linkedin_url TEXT;