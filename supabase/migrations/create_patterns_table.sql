-- Create patterns table
CREATE TABLE IF NOT EXISTS patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  filters JSONB NOT NULL,
  priority INTEGER NOT NULL,
  frequency INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  time_range_start TIMESTAMPTZ,
  time_range_end TIMESTAMPTZ,
  incident_ids UUID[]
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_patterns_priority ON patterns(priority DESC);
CREATE INDEX IF NOT EXISTS idx_patterns_frequency ON patterns(frequency DESC);
CREATE INDEX IF NOT EXISTS idx_patterns_time_range ON patterns(time_range_start, time_range_end);
CREATE INDEX IF NOT EXISTS idx_patterns_filters ON patterns USING GIN(filters);
CREATE INDEX IF NOT EXISTS idx_patterns_created_at ON patterns(created_at DESC);

-- Create incident_patterns junction table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS incident_patterns (
  incident_id UUID NOT NULL,
  pattern_id UUID REFERENCES patterns(id) ON DELETE CASCADE,
  similarity_score FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (incident_id, pattern_id)
);

CREATE INDEX IF NOT EXISTS idx_incident_patterns_incident ON incident_patterns(incident_id);
CREATE INDEX IF NOT EXISTS idx_incident_patterns_pattern ON incident_patterns(pattern_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_patterns_updated_at
  BEFORE UPDATE ON patterns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
