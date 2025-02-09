/*
  # CV Optimization Tracking System

  1. New Tables
    - `cv_optimizations`
      - Tracks each optimization attempt
      - Stores CV and job description content
      - Records scores and timestamps
    
    - `cv_optimization_improvements`
      - Stores detailed improvement suggestions
      - Links to main optimization record
      
  2. Security
    - Enable RLS on all tables
    - Add policies for user access
    
  3. Indexes
    - Add indexes for efficient querying
*/

-- Create cv_optimizations table
CREATE TABLE IF NOT EXISTS cv_optimizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  cv_text TEXT NOT NULL,
  job_description TEXT NOT NULL,
  overall_score INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Add any additional fields you want to track
  token_count INTEGER,
  processing_time_ms INTEGER,
  api_version TEXT
);

-- Create cv_optimization_improvements table
CREATE TABLE IF NOT EXISTS cv_optimization_improvements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  optimization_id UUID NOT NULL REFERENCES cv_optimizations(id),
  section TEXT NOT NULL,
  score INTEGER NOT NULL,
  impact TEXT NOT NULL,
  context TEXT,
  suggestions JSONB NOT NULL,
  optimized_content TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE cv_optimizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_optimization_improvements ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert their own optimizations"
  ON cv_optimizations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own optimizations"
  ON cv_optimizations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own improvements"
  ON cv_optimization_improvements
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cv_optimizations
      WHERE cv_optimizations.id = cv_optimization_improvements.optimization_id
      AND cv_optimizations.user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX cv_optimizations_user_id_idx ON cv_optimizations(user_id);
CREATE INDEX cv_optimizations_created_at_idx ON cv_optimizations(created_at);
CREATE INDEX cv_optimization_improvements_optimization_id_idx 
  ON cv_optimization_improvements(optimization_id);

-- Create function to get user optimization stats
CREATE OR REPLACE FUNCTION get_user_optimization_stats(user_id UUID)
RETURNS TABLE (
  total_optimizations BIGINT,
  average_score NUMERIC,
  last_optimization_date TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_optimizations,
    AVG(overall_score)::NUMERIC as average_score,
    MAX(created_at) as last_optimization_date
  FROM cv_optimizations
  WHERE cv_optimizations.user_id = get_user_optimization_stats.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;