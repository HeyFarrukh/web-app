-- Add is_anonymous column to cv_optimisations
ALTER TABLE cv_optimisations 
ADD COLUMN is_anonymous BOOLEAN NOT NULL DEFAULT false;

-- Make user_id and user_email nullable
ALTER TABLE cv_optimisations 
ALTER COLUMN user_id TYPE text,
ALTER COLUMN user_id DROP NOT NULL,
ALTER COLUMN user_email DROP NOT NULL;

-- Add is_anonymous column to cv_optimisation_improvements
ALTER TABLE cv_optimisation_improvements
ADD COLUMN is_anonymous BOOLEAN NOT NULL DEFAULT false;

-- Make user_email nullable in improvements table
ALTER TABLE cv_optimisation_improvements
ALTER COLUMN user_email DROP NOT NULL;

-- Add is_anonymous to user_pdfs table
ALTER TABLE user_pdfs
ADD COLUMN is_anonymous BOOLEAN NOT NULL DEFAULT false;

-- Update RLS policies for cv_optimisations
DROP POLICY IF EXISTS "Users can view their own optimizations" ON cv_optimisations;
DROP POLICY IF EXISTS "Users can insert their own optimizations" ON cv_optimisations;

CREATE POLICY "Allow anonymous and authenticated users to insert optimizations"
ON cv_optimisations FOR INSERT
TO authenticated, anon
WITH CHECK (
  (auth.uid() IS NULL AND is_anonymous = true) OR
  (auth.uid()::text = user_id AND is_anonymous = false)
);

CREATE POLICY "Users can view their own optimizations"
ON cv_optimisations FOR SELECT
TO authenticated, anon
USING (
  (auth.uid() IS NULL AND is_anonymous = true) OR
  (auth.uid()::text = user_id)
);

-- Update RLS policies for cv_optimisation_improvements
DROP POLICY IF EXISTS "Users can view their own improvements" ON cv_optimisation_improvements;
DROP POLICY IF EXISTS "Users can insert their own improvements" ON cv_optimisation_improvements;

CREATE POLICY "Allow anonymous and authenticated users to insert improvements"
ON cv_optimisation_improvements FOR INSERT
TO authenticated, anon
WITH CHECK (
  (auth.uid() IS NULL AND is_anonymous = true) OR
  (auth.uid() IS NOT NULL AND user_email = auth.email() AND is_anonymous = false)
);

CREATE POLICY "Users can view their own improvements"
ON cv_optimisation_improvements FOR SELECT
TO authenticated, anon
USING (
  (auth.uid() IS NULL AND is_anonymous = true) OR
  (auth.uid() IS NOT NULL AND user_email = auth.email())
);

-- Update storage bucket policies for cv-pdfs
DROP POLICY IF EXISTS "Users can upload their own PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own PDFs" ON storage.objects;

-- Create storage folder structure
INSERT INTO storage.buckets (id, name) 
VALUES ('cv-pdfs', 'cv-pdfs')
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow anonymous and authenticated users to upload PDFs"
ON storage.objects FOR INSERT
TO authenticated, anon
WITH CHECK (
  bucket_id = 'cv-pdfs' AND (
    (auth.uid() IS NULL AND position('anonymous/' in name) = 1) OR
    (auth.uid() IS NOT NULL AND position((auth.uid()::text || '/') in name) = 1)
  )
);

CREATE POLICY "Allow anonymous and authenticated users to view PDFs"
ON storage.objects FOR SELECT
TO authenticated, anon
USING (
  bucket_id = 'cv-pdfs' AND (
    (auth.uid() IS NULL AND position('anonymous/' in name) = 1) OR
    (auth.uid() IS NOT NULL AND position((auth.uid()::text || '/') in name) = 1)
  )
);

CREATE POLICY "Allow anonymous and authenticated users to delete PDFs"
ON storage.objects FOR DELETE
TO authenticated, anon
USING (
  bucket_id = 'cv-pdfs' AND (
    (auth.uid() IS NULL AND position('anonymous/' in name) = 1) OR
    (auth.uid() IS NOT NULL AND position((auth.uid()::text || '/') in name) = 1)
  )
);
