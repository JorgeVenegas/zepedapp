-- Create incident_translations table for caching Spanish to English translations
CREATE TABLE IF NOT EXISTS incident_translations (
  incident_id UUID PRIMARY KEY REFERENCES incidents(id) ON DELETE CASCADE,
  translated_summary TEXT NOT NULL,
  translated_keywords TEXT[] NOT NULL,
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

-- Add comment for documentation
COMMENT ON TABLE incident_translations IS 'Caches Spanish to English translations for incidents to avoid repeated translation processing';
COMMENT ON COLUMN incident_translations.translated_summary IS 'English translation of the incident summary';
COMMENT ON COLUMN incident_translations.translated_keywords IS 'English translations of incident keywords';
