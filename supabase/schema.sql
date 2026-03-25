-- ============================================
-- FreshCut Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'butcher')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SLAUGHTER ROUNDS
-- ============================================
CREATE TABLE IF NOT EXISTS rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  butcher_id UUID REFERENCES users(id),
  butcher_name TEXT NOT NULL,
  animal_type TEXT NOT NULL DEFAULT 'cow' CHECK (animal_type IN ('cow', 'calf', 'lamb', 'chicken')),
  slaughter_date TIMESTAMPTZ NOT NULL,
  order_close_date TIMESTAMPTZ NOT NULL,
  total_weight_kg NUMERIC NOT NULL,
  buffer_percent NUMERIC DEFAULT 10,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'closed', 'slaughtered', 'completed')),
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  location TEXT,
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
  description TEXT,
  cooking_suggestions TEXT[] DEFAULT '{}',
  svg_path_id TEXT,
  total_kg NUMERIC NOT NULL,
  sold_kg NUMERIC DEFAULT 0,
  buffer_kg NUMERIC DEFAULT 0,
  price_per_kg NUMERIC NOT NULL,
  processing_options TEXT[] DEFAULT '{whole}',
  default_percent NUMERIC DEFAULT 5,
  emoji TEXT DEFAULT '🥩',
  PRIMARY KEY (id, round_id)
);

-- ============================================
-- ORDERS
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  round_id UUID REFERENCES rounds(id),
  user_id UUID REFERENCES users(id),
  user_name TEXT NOT NULL,
  user_phone TEXT NOT NULL,
  delivery_type TEXT DEFAULT 'pickup' CHECK (delivery_type IN ('pickup', 'delivery')),
  delivery_address TEXT,
  payment_type TEXT DEFAULT 'full' CHECK (payment_type IN ('deposit', 'full')),
  amount_paid NUMERIC DEFAULT 0,
  total_price NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'prepared', 'in_delivery', 'delivered')),
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
  notes TEXT,
  price_per_kg NUMERIC NOT NULL,
  subtotal NUMERIC NOT NULL,
  FOREIGN KEY (part_id, round_id) REFERENCES parts(id, round_id)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_parts_round ON parts(round_id);
CREATE INDEX IF NOT EXISTS idx_orders_round ON orders(round_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Public read for open rounds
CREATE POLICY "Public can view open rounds"
  ON rounds FOR SELECT
  USING (status = 'open' AND visibility = 'public');

-- Butchers can manage their own rounds
CREATE POLICY "Butchers manage own rounds"
  ON rounds FOR ALL
  USING (butcher_id = auth.uid());

-- Public read for parts of open rounds
CREATE POLICY "Public can view parts of open rounds"
  ON parts FOR SELECT
  USING (round_id IN (SELECT id FROM rounds WHERE status = 'open'));

-- Butchers can manage parts
CREATE POLICY "Butchers manage parts"
  ON parts FOR ALL
  USING (round_id IN (SELECT id FROM rounds WHERE butcher_id = auth.uid()));

-- Users can view their own orders
CREATE POLICY "Users view own orders"
  ON orders FOR SELECT
  USING (user_id = auth.uid());

-- Users can create orders
CREATE POLICY "Users create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

-- Butchers can view all orders for their rounds
CREATE POLICY "Butchers view round orders"
  ON orders FOR SELECT
  USING (round_id IN (SELECT id FROM rounds WHERE butcher_id = auth.uid()));

-- Butchers can update order status
CREATE POLICY "Butchers update order status"
  ON orders FOR UPDATE
  USING (round_id IN (SELECT id FROM rounds WHERE butcher_id = auth.uid()));

-- Order items follow order policies
CREATE POLICY "View order items"
  ON order_items FOR SELECT
  USING (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
    OR order_id IN (
      SELECT o.id FROM orders o
      JOIN rounds r ON o.round_id = r.id
      WHERE r.butcher_id = auth.uid()
    ));

CREATE POLICY "Create order items"
  ON order_items FOR INSERT
  WITH CHECK (true);

-- ============================================
-- FUNCTIONS: Update sold_kg when order is placed
-- ============================================
CREATE OR REPLACE FUNCTION update_part_sold_kg()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE parts
  SET sold_kg = sold_kg + NEW.kg
  WHERE id = NEW.part_id AND round_id = NEW.round_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_order_item_created
  AFTER INSERT ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION update_part_sold_kg();

-- ============================================
-- REALTIME: Enable realtime for live updates
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE parts;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE rounds;
