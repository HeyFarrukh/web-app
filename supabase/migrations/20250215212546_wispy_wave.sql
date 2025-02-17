/*
  # Create CV Optimisations Tables

  1. New Tables
    - `cv_optimisations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `cv_text` (text)
      - `job_description` (text)
      - `overall_score` (integer)
      - `metadata` (jsonb)
      - `user_email` (text)
      - `created_at` (timestamptz)

    - `cv_optimisation_improvements`
      - `id` (uuid, primary key)
      - `optimisation_id` (uuid, references cv_optimisations)
      - `section` (text)
      - `score` (integer)
      - `impact` (text)
      - `context` (text)
      - `suggestions` (jsonb)
      - `optimised_content` (text)
      - `user_email` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to read their own data
*/

-- Create cv_optimisations table
CREATE TABLE IF NOT EXISTS cv_optimisations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  cv_text text NOT NULL,
  job_description text NOT NULL,
  overall_score integer NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  user_email text,
  created_at timestamptz DEFAULT now()
);

-- Create cv_optimisation_improvements table
CREATE TABLE IF NOT EXISTS cv_optimisation_improvements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  optimisation_id uuid REFERENCES cv_optimisations ON DELETE CASCADE NOT NULL,
  section text NOT NULL,
  score integer NOT NULL,
  impact text NOT NULL,
  context text,
  suggestions jsonb NOT NULL,
  optimised_content text,
  user_email text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE cv_optimisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_optimisation_improvements ENABLE ROW LEVEL SECURITY;

-- Create policies for cv_optimisations
CREATE POLICY "Users can insert their own optimisations"
  ON cv_optimisations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own optimisations"
  ON cv_optimisations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for cv_optimisation_improvements
CREATE POLICY "Users can insert their own improvements"
  ON cv_optimisation_improvements
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM cv_optimisations
    WHERE id = optimisation_id
    AND user_id = auth.uid()
  ));

CREATE POLICY "Users can view their own improvements"
  ON cv_optimisation_improvements
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM cv_optimisations
    WHERE id = optimisation_id
    AND user_id = auth.uid()
  ));

-- Create function for user stats
CREATE OR REPLACE FUNCTION get_user_optimisation_stats(user_id uuid)
RETURNS TABLE (
  total_optimisations bigint,
  average_score numeric,
  highest_score integer,
  lowest_score integer,
  last_optimisation_date timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::bigint as total_optimisations,
    ROUND(AVG(overall_score)::numeric, 2) as average_score,
    MAX(overall_score) as highest_score,
    MIN(overall_score) as lowest_score,
    MAX(created_at) as last_optimisation_date
  FROM cv_optimisations
  WHERE cv_optimisations.user_id = $1;
END;
$$;