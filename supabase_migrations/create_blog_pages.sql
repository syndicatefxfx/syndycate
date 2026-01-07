-- Create table for blog pages (if not exists)
CREATE TABLE IF NOT EXISTS blog_pages (
  id BIGSERIAL PRIMARY KEY,
  locale TEXT NOT NULL,
  status TEXT DEFAULT 'published',
  kicker TEXT,
  title TEXT,
  subtitle TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(locale)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_blog_pages_locale_status 
ON blog_pages(locale, status);

-- Enable Row Level Security
ALTER TABLE blog_pages ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access for published pages
CREATE POLICY "Allow public read access for published pages"
ON blog_pages
FOR SELECT
USING (status = 'published');

-- Policy: Allow authenticated users to manage pages (for admin)
CREATE POLICY "Allow authenticated users to manage pages"
ON blog_pages
FOR ALL
USING (auth.role() = 'authenticated');

-- Create table for about pages
CREATE TABLE IF NOT EXISTS about_pages (
  id BIGSERIAL PRIMARY KEY,
  locale TEXT NOT NULL,
  status TEXT DEFAULT 'published',
  kicker TEXT,
  title TEXT,
  subtitle TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(locale)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_about_pages_locale_status 
ON about_pages(locale, status);

-- Enable Row Level Security
ALTER TABLE about_pages ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access for published pages
CREATE POLICY "Allow public read access for published about pages"
ON about_pages
FOR SELECT
USING (status = 'published');

-- Policy: Allow authenticated users to manage about pages (for admin)
CREATE POLICY "Allow authenticated users to manage about pages"
ON about_pages
FOR ALL
USING (auth.role() = 'authenticated');

