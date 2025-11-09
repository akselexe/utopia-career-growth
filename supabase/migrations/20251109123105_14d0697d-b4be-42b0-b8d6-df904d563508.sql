-- Create privacy preferences table
CREATE TABLE public.privacy_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  behavioral_analysis_consent BOOLEAN DEFAULT false,
  footprint_scanning_consent BOOLEAN DEFAULT false,
  data_retention_days INTEGER DEFAULT 90,
  ai_job_matching_consent BOOLEAN DEFAULT true,
  marketing_consent BOOLEAN DEFAULT false,
  consent_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.privacy_preferences ENABLE ROW LEVEL SECURITY;

-- Policies for privacy preferences
CREATE POLICY "Users can view own privacy preferences"
  ON public.privacy_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own privacy preferences"
  ON public.privacy_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own privacy preferences"
  ON public.privacy_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create audit log table for data access
CREATE TABLE public.data_access_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for audit logs
ALTER TABLE public.data_access_logs ENABLE ROW LEVEL SECURITY;

-- Users can only view their own audit logs
CREATE POLICY "Users can view own audit logs"
  ON public.data_access_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create trigger to update updated_at
CREATE TRIGGER update_privacy_preferences_updated_at
  BEFORE UPDATE ON public.privacy_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add consent timestamp to interview sessions
ALTER TABLE public.interview_sessions
ADD COLUMN behavioral_consent_given BOOLEAN DEFAULT false,
ADD COLUMN consent_timestamp TIMESTAMP WITH TIME ZONE;