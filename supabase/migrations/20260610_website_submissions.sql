-- Public website form submissions log (Resend + API route)
CREATE TABLE IF NOT EXISTS website_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT,
  phone TEXT,
  form_type TEXT NOT NULL DEFAULT 'contact',
  message TEXT,
  page_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS website_submissions_created_at_idx
  ON website_submissions (created_at DESC);

CREATE INDEX IF NOT EXISTS website_submissions_form_type_idx
  ON website_submissions (form_type);

ALTER TABLE website_submissions ENABLE ROW LEVEL SECURITY;
