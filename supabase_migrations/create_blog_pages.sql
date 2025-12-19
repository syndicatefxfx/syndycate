-- Create blog_pages table for storing blog page hero section content
CREATE TABLE IF NOT EXISTS blog_pages (
  locale TEXT NOT NULL PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'published',
  kicker TEXT NOT NULL DEFAULT 'Blog',
  title TEXT NOT NULL DEFAULT 'Insights, playbooks, and program updates',
  subtitle TEXT NOT NULL DEFAULT 'Structured notes on mindset, prop challenges, and execution — same tone and discipline as the main site.',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default values for English
INSERT INTO blog_pages (locale, status, kicker, title, subtitle)
VALUES (
  'en',
  'published',
  'Blog',
  'Insights, playbooks, and program updates',
  'Structured notes on mindset, prop challenges, and execution — same tone and discipline as the main site.'
)
ON CONFLICT (locale) DO NOTHING;

-- Insert default values for Hebrew
INSERT INTO blog_pages (locale, status, kicker, title, subtitle)
VALUES (
  'he',
  'published',
  'Blog',
  'Insights, playbooks, and program updates',
  'Structured notes on mindset, prop challenges, and execution — same tone and discipline as the main site.'
)
ON CONFLICT (locale) DO NOTHING;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_blog_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_blog_pages_updated_at
  BEFORE UPDATE ON blog_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_pages_updated_at();

-- Grant permissions (adjust based on your RLS policies)
ALTER TABLE blog_pages ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read
CREATE POLICY "Allow authenticated read blog_pages" ON blog_pages
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow public read for published pages
CREATE POLICY "Allow public read blog_pages" ON blog_pages
  FOR SELECT
  TO anon
  USING (status = 'published');

-- Policy: Allow authenticated users to update
CREATE POLICY "Allow authenticated update blog_pages" ON blog_pages
  FOR UPDATE
  TO authenticated
  USING (true);

-- Policy: Allow authenticated users to insert
CREATE POLICY "Allow authenticated insert blog_pages" ON blog_pages
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
