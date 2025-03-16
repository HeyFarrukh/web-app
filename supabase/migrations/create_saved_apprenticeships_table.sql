-- Create saved_apprenticeships table if it doesn't exist
CREATE TABLE IF NOT EXISTS saved_apprenticeships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  vacancy_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, vacancy_id)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_saved_apprenticeships_user_id ON saved_apprenticeships(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_apprenticeships_vacancy_id ON saved_apprenticeships(vacancy_id);
