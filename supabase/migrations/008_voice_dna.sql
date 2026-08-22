-- Migration: 008_voice_dna.sql
-- Description: Creates the voice_dna table and related triggers for the Voice DNA Engine

CREATE TABLE IF NOT EXISTS voice_dna (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tone TEXT[] DEFAULT '{}',
  formatting_preferences JSONB DEFAULT '{
    "uses_bullet_points": false,
    "paragraph_length": "mixed",
    "emoji_frequency": "none",
    "capitalization_style": "standard",
    "hook_style": "direct"
  }'::jsonb,
  vocabulary JSONB DEFAULT '{
    "commonly_used_words": [],
    "banned_words": []
  }'::jsonb,
  sentence_structure TEXT DEFAULT 'mixed',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE voice_dna ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can view their own Voice DNA" 
  ON voice_dna FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own Voice DNA" 
  ON voice_dna FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own Voice DNA" 
  ON voice_dna FOR UPDATE 
  USING (auth.uid() = id);

-- Create a table for raw ingested posts used to generate the DNA
CREATE TABLE IF NOT EXISTS ingested_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for ingested posts
ALTER TABLE ingested_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their ingested posts" 
  ON ingested_posts FOR ALL 
  USING (auth.uid() = user_id);
