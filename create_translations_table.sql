-- ============================================================================
-- CREATE INCIDENT_TRANSLATIONS TABLE IN SUPABASE
-- ============================================================================
-- Go to: https://supabase.com/dashboard/project/tjstvnmbinnahrgpyanb/sql/new
-- Copy and paste this SQL and click "Run"
-- ============================================================================

CREATE TABLE IF NOT EXISTS incident_translations (
  incident_id UUID PRIMARY KEY REFERENCES incidents(id) ON DELETE CASCADE,
  translated_summary TEXT NOT NULL,
  translated_keywords TEXT[] NOT NULL DEFAULT '{}',
  source_language TEXT NOT NULL DEFAULT 'es',
  target_language TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_incident_translations_incident_id 
  ON incident_translations(incident_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_incident_translations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_incident_translations_updated_at
  BEFORE UPDATE ON incident_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_incident_translations_updated_at();

-- Verify the table was created
SELECT 'Table created successfully!' as status;
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'incident_translations' 
ORDER BY ordinal_position;
