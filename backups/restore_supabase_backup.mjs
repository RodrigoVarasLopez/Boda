import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function restoreBackup() {
  const backupPath = path.join(process.cwd(), 'backups', 'supabase_backup_2026-10-27.json');
  if (!fs.existsSync(backupPath)) {
    console.error('No se encontró el archivo de backup:', backupPath);
    process.exit(1);
  }

  const raw = fs.readFileSync(backupPath, 'utf-8');
  const backup = JSON.parse(raw);

  // Orden respetando claves foráneas
  const orderedTables = [
    'profiles',
    'weddings',
    'events',
    'guest_groups',
    'guests',
    'group_events',
    'invitations',
    'rsvp_responses',
    'budget_categories',
    'budget_suppliers',
    'budget_payments',
    'budget_menu_config',
    'content_blocks',
    'media_photos',
    'guestbook_entries',
  ];

  console.log(`Restaurando backup creado el ${backup.created_at}...`);

  for (const table of orderedTables) {
    const rows = backup.tables?.[table];
    if (!Array.isArray(rows) || rows.length === 0) {
      console.log(`- ${table}: 0 filas que restaurar.`);
      continue;
    }

    const { error } = await supabase.from(table).upsert(rows, { onConflict: 'id' });
    if (error) {
      console.error(`Error restaurando tabla ${table}:`, error.message);
    } else {
      console.log(`✓ ${table}: ${rows.length} filas restauradas correctamente.`);
    }
  }

  console.log('¡Restauración completada con éxito!');
}

restoreBackup().catch((err) => {
  console.error('Error en restauración:', err);
  process.exit(1);
});
