-- ==============================================================================
-- BODA DE STEPHANIE & RODRIGO — SINCRONIZACIÓN Y REPARACIÓN DEL MÓDULO DE PRESUPUESTO
-- Proyecto Supabase: Boda | minutria pro (oskbafwqreeqxfwnwbzv)
-- Ejecutar en: https://supabase.com/dashboard/project/oskbafwqreeqxfwnwbzv/sql/new
-- ==============================================================================

-- 1. Extensiones requeridas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Asegurar que la tabla principal de bodas existe
CREATE TABLE IF NOT EXISTS weddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  couple_name_1 TEXT NOT NULL,
  couple_name_2 TEXT NOT NULL,
  wedding_date TIMESTAMPTZ NOT NULL,
  venue_name TEXT NOT NULL,
  venue_address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  theme TEXT NOT NULL DEFAULT 'mediterranean',
  rsvp_deadline TIMESTAMPTZ,
  iban_details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Asegurar registro oficial de la boda de Stephanie & Rodrigo
INSERT INTO weddings (
  id, slug, couple_name_1, couple_name_2, wedding_date, venue_name, venue_address, status, theme, rsvp_deadline
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'stephanie-y-rodrigo',
  'Stephanie',
  'Rodrigo',
  '2027-08-28 18:00:00+02',
  'Bodega Concejo',
  'Ctra. Valoria Km 3,6, 47200 Valoria La Buena (Valladolid)',
  'published',
  'mediterranean',
  '2027-07-20 23:59:59+02'
) ON CONFLICT (slug) DO UPDATE SET
  venue_name = EXCLUDED.venue_name,
  venue_address = EXCLUDED.venue_address,
  wedding_date = EXCLUDED.wedding_date;

-- 3. Tablas del módulo de presupuesto
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

CREATE UNIQUE INDEX IF NOT EXISTS unique_selected_supplier_per_category
  ON budget_suppliers (category_id)
  WHERE is_selected = true;

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

-- 4. RLS y Políticas de Acceso
ALTER TABLE weddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_menu_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published weddings" ON weddings;
CREATE POLICY "Public can view published weddings" ON weddings FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Admins manage budget_categories" ON budget_categories;
CREATE POLICY "Admins manage budget_categories" ON budget_categories
  FOR ALL USING (auth.role() = 'service_role' OR EXISTS (SELECT 1 FROM weddings WHERE weddings.id = budget_categories.wedding_id));

DROP POLICY IF EXISTS "Admins manage budget_suppliers" ON budget_suppliers;
CREATE POLICY "Admins manage budget_suppliers" ON budget_suppliers
  FOR ALL USING (auth.role() = 'service_role' OR EXISTS (SELECT 1 FROM weddings WHERE weddings.id = budget_suppliers.wedding_id));

DROP POLICY IF EXISTS "Admins manage budget_payments" ON budget_payments;
CREATE POLICY "Admins manage budget_payments" ON budget_payments
  FOR ALL USING (auth.role() = 'service_role' OR EXISTS (SELECT 1 FROM weddings WHERE weddings.id = budget_payments.wedding_id));

DROP POLICY IF EXISTS "Admins manage budget_menu_config" ON budget_menu_config;
CREATE POLICY "Admins manage budget_menu_config" ON budget_menu_config
  FOR ALL USING (auth.role() = 'service_role' OR EXISTS (SELECT 1 FROM weddings WHERE weddings.id = budget_menu_config.wedding_id));

-- 5. Sembrar o actualizar las 12 categorías oficiales con sus UUIDs exactos
INSERT INTO budget_categories (id, wedding_id, name, budget_type, icon, sort_order)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Flores Iglesia', 'fixed', 'Flower2', 1),
  ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Decoración Concejo', 'fixed', 'Sparkles', 2),
  ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'DJ', 'fixed', 'Music', 3),
  ('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Estación DJ', 'fixed', 'Headphones', 4),
  ('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Vestido Novia', 'fixed', 'Crown', 5),
  ('c0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'Vestido Novio', 'fixed', 'Shirt', 6),
  ('c0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'Pirotecnia', 'fixed', 'Flame', 7),
  ('c0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'Fotógrafo', 'fixed', 'Camera', 8),
  ('c0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'Grupo de música 1', 'fixed', 'Guitar', 9),
  ('c0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'Grupo de música 2', 'fixed', 'Mic2', 10),
  ('c0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000001', 'Preboda', 'mixed', 'Wine', 11),
  ('c0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000001', 'Menú', 'per_guest', 'UtensilsCrossed', 12)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  budget_type = EXCLUDED.budget_type,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order;

-- 6. Configuración del Menú inicial
INSERT INTO budget_menu_config (wedding_id, adult_price, child_price, use_manual_counts)
VALUES ('a0000000-0000-0000-0000-000000000001', 145.00, 75.00, false)
ON CONFLICT (wedding_id) DO NOTHING;

-- 7. Comprobación de estado
SELECT 
  (SELECT COUNT(*) FROM weddings) AS bodas_registradas,
  (SELECT COUNT(*) FROM budget_categories) AS categorias_activas,
  (SELECT COUNT(*) FROM budget_suppliers) AS proveedores_registrados,
  (SELECT COUNT(*) FROM budget_payments) AS pagos_registrados;
