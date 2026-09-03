-- XS2Event sports ticket bookings created via honeywelltravel.com
CREATE TABLE IF NOT EXISTS xs2event_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id TEXT,
  reservation_id TEXT,
  booking_code TEXT,
  booking_email TEXT NOT NULL,
  booking_reference TEXT,
  payment_reference TEXT,
  payment_method TEXT DEFAULT 'invoice',
  is_test_booking BOOLEAN NOT NULL DEFAULT true,
  event_id TEXT,
  event_name TEXT,
  ticket_id TEXT,
  ticket_name TEXT,
  quantity INTEGER,
  currency TEXT DEFAULT 'EUR',
  net_rate NUMERIC,
  sales_price NUMERIC,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  raw_booking JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS xs2event_bookings_booking_id_uidx
  ON xs2event_bookings (booking_id)
  WHERE booking_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS xs2event_bookings_created_at_idx
  ON xs2event_bookings (created_at DESC);

CREATE INDEX IF NOT EXISTS xs2event_bookings_email_idx
  ON xs2event_bookings (booking_email);

ALTER TABLE xs2event_bookings ENABLE ROW LEVEL SECURITY;

-- Service role / backend inserts only. No public anon policies.
