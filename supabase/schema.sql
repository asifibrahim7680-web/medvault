-- ==============================================================================
-- MediVault - Supabase Database Schema & Storage Setup
-- ==============================================================================

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT 'Patient',
  health_id TEXT UNIQUE DEFAULT 'MV-' || floor(random() * 9000 + 1000)::text,
  dob DATE DEFAULT '1989-04-12',
  blood_type TEXT DEFAULT 'O+',
  allergies TEXT[] DEFAULT ARRAY['Penicillin', 'Sulfa Drugs'],
  emergency_contact JSONB DEFAULT '{"name": "Mark Jenkins", "relationship": "Spouse", "phone": "555-019-2834"}'::jsonb,
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 2. Medical Reports Table
CREATE TABLE IF NOT EXISTS public.medical_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL, -- 'Blood Tests & Labs', 'Imaging & Scans', 'Prescriptions & Rx', 'Specialist Diagnoses', 'Discharge Summaries'
  test_date DATE NOT NULL DEFAULT CURRENT_DATE,
  upload_date TIMESTAMPTZ DEFAULT NOW(),
  clinic_provider TEXT NOT NULL,
  doctor_name TEXT,
  file_name TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL DEFAULT 0,
  file_type TEXT NOT NULL, -- 'application/pdf', 'image/jpeg', 'image/png', 'application/dicom'
  storage_path TEXT,
  file_data_url TEXT, -- for local base64/preview fallbacks
  notes TEXT,
  biomarkers JSONB DEFAULT '[]'::jsonb,
  status_badge TEXT,
  is_verified BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.medical_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reports"
  ON public.medical_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reports"
  ON public.medical_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports"
  ON public.medical_reports FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reports"
  ON public.medical_reports FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Medications & Regimens Table
CREATE TABLE IF NOT EXISTS public.medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  form TEXT NOT NULL DEFAULT 'Oral Tablet',
  rx_number TEXT,
  frequency TEXT NOT NULL, -- 'Once Daily (8:00 AM)', 'Twice Daily (8:00 AM, 1:00 PM)', 'Once Daily (Bedtime)', 'As Needed (PRN)'
  schedule_times TEXT[] NOT NULL DEFAULT ARRAY['08:00'],
  meal_instruction TEXT, -- 'With meals', 'After dinner', 'On empty stomach'
  doctor_name TEXT,
  clinic TEXT,
  pharmacy TEXT,
  remaining_pills INT NOT NULL DEFAULT 30,
  total_pills INT NOT NULL DEFAULT 60,
  refill_threshold_days INT NOT NULL DEFAULT 7,
  auto_refill_enabled BOOLEAN DEFAULT false,
  is_prn BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'discontinued'
  guidance TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own medications"
  ON public.medications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own medications"
  ON public.medications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medications"
  ON public.medications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medications"
  ON public.medications FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Dose Tracking & Adherence Logs Table
CREATE TABLE IF NOT EXISTS public.dose_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  medication_id UUID REFERENCES public.medications(id) ON DELETE SET NULL,
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  scheduled_date DATE NOT NULL DEFAULT CURRENT_DATE,
  scheduled_time TEXT NOT NULL,
  recorded_time TIMESTAMPTZ,
  status TEXT NOT NULL, -- 'taken', 'skipped', 'pending', 'taken_late'
  clinical_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.dose_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own dose logs"
  ON public.dose_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own dose logs"
  ON public.dose_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dose logs"
  ON public.dose_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dose logs"
  ON public.dose_logs FOR DELETE
  USING (auth.uid() = user_id);

-- 5. Appointments Table
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  clinic_hospital TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TEXT NOT NULL,
  end_time TEXT,
  location_room TEXT,
  type TEXT NOT NULL DEFAULT 'Consultation', -- 'Consultation', 'Lab Test', 'Procedure', 'Follow-up'
  status TEXT NOT NULL DEFAULT 'upcoming', -- 'upcoming', 'completed', 'cancelled'
  notes TEXT,
  doctor_avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own appointments"
  ON public.appointments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own appointments"
  ON public.appointments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own appointments"
  ON public.appointments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own appointments"
  ON public.appointments FOR DELETE
  USING (auth.uid() = user_id);

-- 6. User Notification Preferences Table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_alerts BOOLEAN DEFAULT true,
  sms_reminders BOOLEAN DEFAULT false,
  push_notifications BOOLEAN DEFAULT true,
  refill_lead_days INT DEFAULT 7,
  quiet_hours_enabled BOOLEAN DEFAULT true,
  quiet_hours_start TEXT DEFAULT '22:00',
  quiet_hours_end TEXT DEFAULT '07:00',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their notification preferences"
  ON public.notification_preferences FOR ALL
  USING (auth.uid() = user_id);

-- 7. Supabase Storage Bucket Configuration
-- Create private bucket 'medical-vault-docs'
INSERT INTO storage.buckets (id, name, public)
VALUES ('medical-vault-docs', 'medical-vault-docs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies: Users can only upload, download, and delete files inside their own user folder: {user_id}/*
CREATE POLICY "Users can upload their own medical files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'medical-vault-docs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view and download their own medical files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'medical-vault-docs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own medical files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'medical-vault-docs' AND (storage.foldername(name))[1] = auth.uid()::text);
