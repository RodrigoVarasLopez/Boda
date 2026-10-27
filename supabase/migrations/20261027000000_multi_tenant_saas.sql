-- ============================================================================
-- MIGRATION: 20261027000000_multi_tenant_saas.sql
-- Arquitectura SaaS Multi-Tenant (B2B Wedding Planners + B2C Usuarios Básicos)
-- ============================================================================

-- 1. Tabla de Organizaciones / Carteras de Wedding Planner (Tenants)
CREATE TABLE IF NOT EXISTS planner_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  owner_email TEXT,
  is_platform_default BOOLEAN NOT NULL DEFAULT false,
  plan_tier TEXT NOT NULL DEFAULT 'pro_planner' CHECK (plan_tier IN ('b2c_default', 'pro_planner', 'enterprise')),
  max_weddings INTEGER NOT NULL DEFAULT 25,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Semilla de la Cartera Oficial de Administración (donde van asociadas las bodas B2C de usuarios básicos)
INSERT INTO planner_organizations (id, name, slug, owner_email, is_platform_default, plan_tier, max_weddings)
VALUES (
  'a0000000-0000-0000-0000-000000000090',
  'Administración Oficial · Cartera Directa B2C',
  'administracion-oficial-b2c',
  'rodrigovaraslopez@gmail.com',
  true,
  'b2c_default',
  9999
)
ON CONFLICT (id) DO NOTHING;

-- 2. Tabla de Perfiles de Usuario con los 3 Roles del SaaS
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'basic_user' CHECK (role IN ('super_admin', 'wedding_planner', 'basic_user')),
  planner_org_id UUID REFERENCES planner_organizations(id) ON DELETE SET NULL,
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Tabla de Membresía y Permisos por Boda
CREATE TABLE IF NOT EXISTS wedding_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_role TEXT NOT NULL DEFAULT 'couple_owner' CHECK (member_role IN ('super_admin', 'planner', 'couple_owner', 'collaborator')),
  permissions JSONB NOT NULL DEFAULT '{"budget": true, "guests": true, "rsvp": true, "cms": true, "events": true}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(wedding_id, user_id)
);

-- 4. Columnas Multi-Tenant adicionales en weddings
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS planner_org_id UUID REFERENCES planner_organizations(id) ON DELETE SET NULL;
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS budget_target NUMERIC DEFAULT 35000;
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS guest_target_count INTEGER DEFAULT 180;
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS save_the_date_config JSONB;

-- Asociar la boda existente de Stephanie & Rodrigo a la Cartera Oficial
UPDATE weddings
SET planner_org_id = 'a0000000-0000-0000-0000-000000000090'
WHERE id = 'a0000000-0000-0000-0000-000000000001' AND planner_org_id IS NULL;
