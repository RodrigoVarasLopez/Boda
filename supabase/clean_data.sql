-- ==============================================================================
-- BODA DE STEPHANIE & RODRIGO — SCRIPT DE LIMPIEZA A CERO
-- Proyecto Supabase: Boda | minutria pro (oskbafwqreeqxfwnwbzv)
-- Ejecutar en: https://supabase.com/dashboard/project/oskbafwqreeqxfwnwbzv/sql/new
-- ==============================================================================
-- Este script elimina todos los datos de prueba de:
-- 1. Invitados, familias y grupos
-- 2. Respuestas y confirmaciones RSVP
-- 3. Tokens e invitaciones generadas
-- 4. Firmas y mensajes del libro de firmas (Guestbook)
-- 5. Fotos subidas por invitados o de prueba (Media)
-- 6. Proveedores y pagos de prueba
--
-- CONSERVA:
-- - La boda de Stephanie & Rodrigo
-- - Los eventos oficiales (Preboda, Ceremonia, Banquete, Fiesta)
-- - Las 12 categorías de presupuesto
-- - Los bloques de contenido de la web (CMS)
-- - Los usuarios de autenticación
-- ==============================================================================

-- 1. Desactivar temporalmente restricciones si fuera necesario y vaciar tablas de datos
TRUNCATE TABLE rsvp_responses CASCADE;
TRUNCATE TABLE invitations CASCADE;
TRUNCATE TABLE guests CASCADE;
TRUNCATE TABLE group_events CASCADE;
TRUNCATE TABLE guest_groups CASCADE;
TRUNCATE TABLE guestbook_entries CASCADE;
TRUNCATE TABLE media_photos CASCADE;
TRUNCATE TABLE budget_payments CASCADE;
TRUNCATE TABLE budget_suppliers CASCADE;

-- 2. Restablecer configuración de menú a valores por defecto con 0 comensales
UPDATE budget_menu_config
SET 
  adult_price = 145.0,
  child_price = 75.0,
  adult_count_override = NULL,
  child_count_override = NULL,
  use_manual_counts = false,
  updated_at = NOW()
WHERE wedding_id = 'a0000000-0000-0000-0000-000000000001' 
   OR wedding_id = 'w-stephanie-rodrigo-2027';

-- 3. Confirmación
SELECT 
  (SELECT COUNT(*) FROM guest_groups) AS total_grupos,
  (SELECT COUNT(*) FROM guests) AS total_invitados,
  (SELECT COUNT(*) FROM invitations) AS total_invitaciones,
  (SELECT COUNT(*) FROM rsvp_responses) AS total_rsvps,
  (SELECT COUNT(*) FROM guestbook_entries) AS total_firmas,
  (SELECT COUNT(*) FROM media_photos) AS total_fotos,
  (SELECT COUNT(*) FROM budget_suppliers) AS total_proveedores;
