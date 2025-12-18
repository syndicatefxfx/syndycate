-- Create site_settings table for storing global site configuration
CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  telegram_url TEXT NOT NULL DEFAULT 'https://t.me/syndicatefxx',
  instagram_url TEXT NOT NULL DEFAULT 'https://www.instagram.com/syndicatefx.co/',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default values
INSERT INTO site_settings (id, telegram_url, instagram_url)
VALUES (1, 'https://t.me/syndicatefxx', 'https://www.instagram.com/syndicatefx.co/')
ON CONFLICT (id) DO NOTHING;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust based on your RLS policies)
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read
CREATE POLICY "Allow authenticated read" ON site_settings
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow authenticated users to update
CREATE POLICY "Allow authenticated update" ON site_settings
  FOR UPDATE
  TO authenticated
  USING (true);

-- Policy: Allow authenticated users to insert
CREATE POLICY "Allow authenticated insert" ON site_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
