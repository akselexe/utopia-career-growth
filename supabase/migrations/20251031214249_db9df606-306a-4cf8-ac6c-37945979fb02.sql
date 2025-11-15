-- Drop storage policies first
DROP POLICY IF EXISTS "Users can upload own CVs" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own CVs in storage" ON storage.objects;

-- Drop all existing tables and types to start clean
DROP TABLE IF EXISTS interview_sessions CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS cvs CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS company_profiles CASCADE;
DROP TABLE IF EXISTS seeker_profiles CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TYPE IF EXISTS user_type CASCADE;
DROP TYPE IF EXISTS job_status CASCADE;
DROP TYPE IF EXISTS application_status CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS update_updated_at_column();


-- Create enums
CREATE TYPE user_type AS ENUM ('seeker', 'company');
CREATE TYPE job_status AS ENUM ('active', 'closed', 'draft');
CREATE TYPE application_status AS ENUM ('pending', 'reviewing', 'interview', 'accepted', 'rejected');

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type user_type NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE seeker_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  skills TEXT[],
  experience_years INTEGER,
  linkedin_url TEXT,
  bio TEXT,
  location TEXT,
  desired_salary_min INTEGER,
  desired_salary_max INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE company_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  company_name TEXT NOT NULL,
  industry TEXT,
  company_size TEXT,
  website TEXT,
  description TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cvs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  ai_analysis JSONB,
  ai_score INTEGER CHECK (ai_score >= 0 AND ai_score <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT NOT NULL,
  location TEXT NOT NULL,
  salary_min INTEGER,
  salary_max INTEGER,
  job_type TEXT,
  status job_status DEFAULT 'active',
  skills_required TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  seeker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cv_id UUID REFERENCES cvs(id) ON DELETE SET NULL,
  status application_status DEFAULT 'pending',
  cover_letter TEXT,
  match_score INTEGER CHECK (match_score >= 0 AND match_score <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, seeker_id)
);

CREATE TABLE interview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  job_title TEXT,
  transcript JSONB,
  ai_feedback JSONB,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE seeker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view all seeker profiles" ON seeker_profiles FOR SELECT USING (true);
CREATE POLICY "Seekers can update own profile" ON seeker_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Seekers can insert own profile" ON seeker_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view all company profiles" ON company_profiles FOR SELECT USING (true);
CREATE POLICY "Companies can update own profile" ON company_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Companies can insert own profile" ON company_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own CVs" ON cvs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Companies can view CVs of applicants" ON cvs FOR SELECT USING (EXISTS (SELECT 1 FROM applications a JOIN jobs j ON a.job_id = j.id WHERE a.cv_id = cvs.id AND j.company_id = auth.uid()));
CREATE POLICY "Users can insert own CVs" ON cvs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own CVs" ON cvs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own CVs" ON cvs FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view active jobs" ON jobs FOR SELECT USING (status = 'active' OR auth.uid() = company_id);
CREATE POLICY "Companies can insert own jobs" ON jobs FOR INSERT WITH CHECK (auth.uid() = company_id);
CREATE POLICY "Companies can update own jobs" ON jobs FOR UPDATE USING (auth.uid() = company_id);
CREATE POLICY "Companies can delete own jobs" ON jobs FOR DELETE USING (auth.uid() = company_id);

CREATE POLICY "Users can view own applications" ON applications FOR SELECT USING (auth.uid() = seeker_id OR auth.uid() IN (SELECT company_id FROM jobs WHERE id = job_id));
CREATE POLICY "Seekers can insert applications" ON applications FOR INSERT WITH CHECK (auth.uid() = seeker_id);
CREATE POLICY "Companies can update application status" ON applications FOR UPDATE USING (auth.uid() IN (SELECT company_id FROM jobs WHERE id = job_id));

CREATE POLICY "Users can view own interview sessions" ON interview_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own interview sessions" ON interview_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('cvs', 'cvs', false) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload own CVs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'cvs' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can view own CVs in storage" ON storage.objects FOR SELECT USING (bucket_id = 'cvs' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Functions and triggers
CREATE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, user_type, full_name, email)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'user_type')::user_type, 'seeker'), COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE INDEX idx_cvs_user_id ON cvs(user_id);
CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_seeker_id ON applications(seeker_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_interview_sessions_user_id ON interview_sessions(user_id);

CREATE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seeker_profiles_updated_at BEFORE UPDATE ON seeker_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_profiles_updated_at BEFORE UPDATE ON company_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cvs_updated_at BEFORE UPDATE ON cvs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();