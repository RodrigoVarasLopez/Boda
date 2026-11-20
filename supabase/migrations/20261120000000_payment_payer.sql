-- ==============================================================================
-- Migration: 20261120000000_payment_payer.sql
-- Description: Add paid_by column to budget_payments, promote fallback markers
--              from notes, and backfill Stephanie & Rodrigo wedding payers.
-- ==============================================================================

-- 1. Add paid_by column and index
ALTER TABLE IF EXISTS budget_payments
  ADD COLUMN IF NOT EXISTS paid_by TEXT;

CREATE INDEX IF NOT EXISTS idx_budget_payments_paid_by
  ON budget_payments (wedding_id, paid_by);

-- 2. Promote any fallback <!--PAID_BY:...--> markers in notes into paid_by
UPDATE budget_payments
SET
  paid_by = COALESCE(
    NULLIF(BTRIM(paid_by), ''),
    NULLIF(BTRIM((regexp_match(notes, '<!--PAID_BY:(.*?)-->'))[1]), '')
  ),
  notes = NULLIF(
    BTRIM(regexp_replace(notes, '\s*<!--PAID_BY:.*?-->', '', 'g')),
    ''
  ),
  updated_at = NOW()
WHERE notes LIKE '%<!--PAID_BY:%';

-- 3. Backfill payers for Stephanie & Rodrigo wedding (stephanie-y-rodrigo)
DO $$
DECLARE
  v_wedding_id UUID;
BEGIN
  SELECT id INTO v_wedding_id
  FROM weddings
  WHERE id = 'a0000000-0000-0000-0000-000000000001'
     OR slug = 'stephanie-y-rodrigo'
  ORDER BY (id = 'a0000000-0000-0000-0000-000000000001') DESC
  LIMIT 1;

  IF v_wedding_id IS NOT NULL THEN
    -- Stephanie Mendoza: Fotógrafo y Fotomatón
    UPDATE budget_payments AS bp
    SET
      paid_by = 'Stephanie Mendoza',
      updated_at = NOW()
    FROM budget_suppliers AS bs
    LEFT JOIN budget_categories AS bc ON bc.id = bs.category_id
    WHERE bp.supplier_id = bs.id
      AND bp.wedding_id = v_wedding_id
      AND bp.status IN ('paid', 'partial')
      AND NULLIF(BTRIM(bp.paid_by), '') IS NULL
      AND (
        LOWER(COALESCE(bc.name, '')) IN ('fotógrafo', 'fotografo', 'fotomatón', 'fotomaton')
        OR LOWER(COALESCE(bs.name, '')) LIKE '%fotomatón%'
        OR LOWER(COALESCE(bs.name, '')) LIKE '%fotomaton%'
      );

    -- Rodrigo: Resto de pagos realizados
    UPDATE budget_payments
    SET
      paid_by = 'Rodrigo',
      updated_at = NOW()
    WHERE wedding_id = v_wedding_id
      AND status IN ('paid', 'partial')
      AND NULLIF(BTRIM(paid_by), '') IS NULL;
  END IF;
END $$;
