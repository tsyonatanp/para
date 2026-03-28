-- ============================================
-- FreshCut Database Schema
-- Run this in your Supabase SQL Editor (one time)
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CUSTOMERS (app-level auth, not Supabase Auth)
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'butcher', 'admin')),
  password_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SLAUGHTER ROUNDS
-- ============================================
CREATE TABLE IF NOT EXISTS rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  butcher_id TEXT NOT NULL,
  butcher_name TEXT NOT NULL,
  animal_type TEXT NOT NULL DEFAULT 'cow' CHECK (animal_type IN ('cow', 'calf', 'lamb', 'chicken')),
  slaughter_date TIMESTAMPTZ NOT NULL,
  order_close_date TIMESTAMPTZ NOT NULL,
  total_weight_kg NUMERIC NOT NULL DEFAULT 250,
  buffer_percent NUMERIC DEFAULT 5,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('draft', 'open', 'closed', 'slaughtered', 'completed')),
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  location TEXT NOT NULL DEFAULT 'רחובות, ישראל',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MEAT PARTS
-- ============================================
CREATE TABLE IF NOT EXISTS parts (
  id TEXT NOT NULL,
  round_id UUID REFERENCES rounds(id) ON DELETE CASCADE,
  name_he TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description TEXT DEFAULT '',
  cooking_suggestions TEXT[] DEFAULT '{}',
  svg_path_id TEXT DEFAULT '',
  total_kg NUMERIC NOT NULL,
  sold_kg NUMERIC DEFAULT 0,
  buffer_kg NUMERIC DEFAULT 0,
  price_per_kg NUMERIC NOT NULL,
  processing_options TEXT[] DEFAULT '{whole,sliced}',
  default_percent NUMERIC DEFAULT 5,
  emoji TEXT DEFAULT '🥩',
  PRIMARY KEY (id, round_id)
);

-- ============================================
-- ORDERS
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  round_id UUID REFERENCES rounds(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_phone TEXT NOT NULL,
  delivery_type TEXT DEFAULT 'pickup' CHECK (delivery_type IN ('pickup', 'delivery')),
  delivery_address TEXT,
  payment_type TEXT DEFAULT 'full' CHECK (payment_type IN ('deposit', 'full')),
  amount_paid NUMERIC DEFAULT 0,
  total_price NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'prepared', 'in_delivery', 'delivered', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ORDER ITEMS
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  part_id TEXT NOT NULL,
  round_id UUID NOT NULL,
  part_name_he TEXT NOT NULL,
  part_emoji TEXT DEFAULT '🥩',
  kg NUMERIC NOT NULL,
  processing TEXT DEFAULT 'whole' CHECK (processing IN ('whole', 'sliced', 'cubed', 'ground')),
  notes TEXT DEFAULT '',
  price_per_kg NUMERIC NOT NULL,
  subtotal NUMERIC NOT NULL,
  FOREIGN KEY (part_id, round_id) REFERENCES parts(id, round_id)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_parts_round ON parts(round_id);
CREATE INDEX IF NOT EXISTS idx_orders_round ON orders(round_id);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(user_phone);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- ============================================
-- ROW LEVEL SECURITY
-- App uses anon key with app-level auth (not Supabase Auth)
-- So we allow all operations via anon key
-- ============================================
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON rounds FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON parts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON order_items FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- TRIGGER: auto-update sold_kg from order_items
-- ============================================
CREATE OR REPLACE FUNCTION update_part_sold_kg()
RETURNS TRIGGER AS $$
DECLARE
  target_part_id TEXT;
  target_round_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_part_id := OLD.part_id;
    target_round_id := OLD.round_id;
  ELSE
    target_part_id := NEW.part_id;
    target_round_id := NEW.round_id;
  END IF;

  UPDATE parts
  SET sold_kg = COALESCE((
    SELECT SUM(oi.kg)
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE oi.part_id = target_part_id
      AND oi.round_id = target_round_id
      AND o.status != 'cancelled'
  ), 0)
  WHERE id = target_part_id AND round_id = target_round_id;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_sold_kg ON order_items;
CREATE TRIGGER trg_update_sold_kg
  AFTER INSERT OR UPDATE OR DELETE ON order_items
  FOR EACH ROW EXECUTE FUNCTION update_part_sold_kg();

-- ============================================
-- REALTIME: Enable for live updates
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE parts;
