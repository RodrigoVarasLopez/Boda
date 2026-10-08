-- ==============================================================================
-- Migration: 20261008000000_budget.sql
-- Description: Wedding Budget, Suppliers, Payments & Menu Configuration Module
-- Wedding: Stephanie & Rodrigo (Bodega Concejo)
-- ==============================================================================

-- 1. Ensure guest_type column exists on guests table
ALTER TABLE IF EXISTS guests
  ADD COLUMN IF NOT EXISTS guest_type TEXT NOT NULL DEFAULT 'adult' CHECK (guest_type IN ('adult', 'child'));

-- Synchronize existing child flags
UPDATE guests SET guest_type = 'child' WHERE is_child = true AND guest_type = 'adult';

-- 2. Budget Categories
CREATE TABLE IF NOT EXISTS budget_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  budget_type TEXT NOT NULL DEFAULT 'fixed' CHECK (budget_type IN ('fixed', 'per_guest', 'mixed')),
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Budget Suppliers
CREATE TABLE IF NOT EXISTS budget_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES budget_categories(id) ON DELETE CASCADE,
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  instagram TEXT,
  estimated_price NUMERIC(12,2),
  quoted_price NUMERIC(12,2),
  final_price NUMERIC(12,2),
  currency TEXT NOT NULL DEFAULT 'EUR',
  rating INTEGER CHECK (rating >= 1 AND rating <= 10),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'quoted', 'finalist', 'selected', 'discarded')),
  comments TEXT,
  notes TEXT,
  is_selected BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Partial unique index: guarantees at most one selected supplier per category
CREATE UNIQUE INDEX IF NOT EXISTS unique_selected_supplier_per_category
  ON budget_suppliers (category_id)
  WHERE is_selected = true;

-- 4. Budget Payments
CREATE TABLE IF NOT EXISTS budget_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES budget_suppliers(id) ON DELETE CASCADE,
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  due_date DATE,
  paid_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Budget Menu Configuration
CREATE TABLE IF NOT EXISTS budget_menu_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL UNIQUE REFERENCES weddings(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES budget_suppliers(id) ON DELETE SET NULL,
  adult_price NUMERIC(12,2) NOT NULL DEFAULT 145.00 CHECK (adult_price >= 0),
  child_price NUMERIC(12,2) NOT NULL DEFAULT 75.00 CHECK (child_price >= 0),
  adult_count_override INTEGER CHECK (adult_count_override >= 0),
  child_count_override INTEGER CHECK (child_count_override >= 0),
  use_manual_counts BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_menu_config ENABLE ROW LEVEL SECURITY;

-- 7. Policies: Admins manage budget tables of their owned weddings (Service Role & Authenticated Owners)
DROP POLICY IF EXISTS "Admins manage budget_categories" ON budget_categories;
CREATE POLICY "Admins manage budget_categories" ON budget_categories
  FOR ALL USING (
    auth.role() = 'service_role' OR
    EXISTS (SELECT 1 FROM weddings WHERE weddings.id = budget_categories.wedding_id AND weddings.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins manage budget_suppliers" ON budget_suppliers;
CREATE POLICY "Admins manage budget_suppliers" ON budget_suppliers
  FOR ALL USING (
    auth.role() = 'service_role' OR
    EXISTS (SELECT 1 FROM weddings WHERE weddings.id = budget_suppliers.wedding_id AND weddings.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins manage budget_payments" ON budget_payments;
CREATE POLICY "Admins manage budget_payments" ON budget_payments
  FOR ALL USING (
    auth.role() = 'service_role' OR
    EXISTS (SELECT 1 FROM weddings WHERE weddings.id = budget_payments.wedding_id AND weddings.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins manage budget_menu_config" ON budget_menu_config;
CREATE POLICY "Admins manage budget_menu_config" ON budget_menu_config
  FOR ALL USING (
    auth.role() = 'service_role' OR
    EXISTS (SELECT 1 FROM weddings WHERE weddings.id = budget_menu_config.wedding_id AND weddings.owner_id = auth.uid())
  );

-- 8. Seed initial categories for Stephanie & Rodrigo wedding (if wedding exists)
DO $$
DECLARE
  v_wedding_id UUID;
BEGIN
  SELECT id INTO v_wedding_id FROM weddings WHERE slug = 'stephanie-y-rodrigo' LIMIT 1;
  IF v_wedding_id IS NOT NULL THEN
    -- Insert default 12 categories if not already present
    INSERT INTO budget_categories (wedding_id, name, budget_type, icon, sort_order)
    VALUES
      (v_wedding_id, 'Flores Iglesia', 'fixed', 'Flower2', 1),
      (v_wedding_id, 'Decoración Concejo', 'fixed', 'Sparkles', 2),
      (v_wedding_id, 'DJ', 'fixed', 'Music', 3),
      (v_wedding_id, 'Estación DJ', 'fixed', 'Headphones', 4),
      (v_wedding_id, 'Vestido Novia', 'fixed', 'Crown', 5),
      (v_wedding_id, 'Vestido Novio', 'fixed', 'Shirt', 6),
      (v_wedding_id, 'Pirotecnia', 'fixed', 'Flame', 7),
      (v_wedding_id, 'Fotógrafo', 'fixed', 'Camera', 8),
      (v_wedding_id, 'Grupo de música 1', 'fixed', 'Guitar', 9),
      (v_wedding_id, 'Grupo de música 2', 'fixed', 'Mic2', 10),
      (v_wedding_id, 'Preboda', 'mixed', 'Wine', 11),
      (v_wedding_id, 'Menú', 'per_guest', 'UtensilsCrossed', 12)
    ON CONFLICT DO NOTHING;

    -- Insert default menu configuration
    INSERT INTO budget_menu_config (wedding_id, adult_price, child_price, use_manual_counts)
    VALUES (v_wedding_id, 145.00, 75.00, false)
    ON CONFLICT (wedding_id) DO NOTHING;
  END IF;
END $$;
