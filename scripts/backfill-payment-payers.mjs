import { createClient } from '@supabase/supabase-js';

const WEDDING_ID = 'a0000000-0000-0000-0000-000000000001';
const PAYMENT_PAYER_MARKER = '<!--PAID_BY:';
const PAYMENT_PAYER_END = '-->';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function parsePaymentNotesAndPayer(rawNotes, columnPaidBy) {
  const raw = rawNotes || '';
  let parsedPayer = null;
  const markerIdx = raw.indexOf(PAYMENT_PAYER_MARKER);

  if (markerIdx !== -1) {
    const startVal = markerIdx + PAYMENT_PAYER_MARKER.length;
    const endIdx = raw.indexOf(PAYMENT_PAYER_END, startVal);
    const extracted = (endIdx !== -1 ? raw.slice(startVal, endIdx) : raw.slice(startVal)).trim();
    if (extracted) {
      parsedPayer = extracted;
    }
  }

  const cleanNotes =
    raw.replace(/\s*<!--PAID_BY:[\s\S]*?-->/g, '').split(PAYMENT_PAYER_MARKER)[0].trim() || null;
  const cleanColumnPaidBy = columnPaidBy ? String(columnPaidBy).trim() : '';
  return {
    cleanNotes,
    paidBy: cleanColumnPaidBy || parsedPayer || null,
  };
}

function serializePaymentNotesWithPayer(notes, paidBy) {
  const { cleanNotes } = parsePaymentNotesAndPayer(notes, null);
  const cleanPayer = (paidBy || '').replace(/-->/g, '').trim();
  if (!cleanPayer) return cleanNotes || null;
  const encoded = `${PAYMENT_PAYER_MARKER}${cleanPayer}${PAYMENT_PAYER_END}`;
  return cleanNotes ? `${cleanNotes}\n${encoded}` : encoded;
}

async function run() {
  const { data: categories, error: catErr } = await supabase
    .from('budget_categories')
    .select('id, name')
    .eq('wedding_id', WEDDING_ID);
  if (catErr) throw catErr;

  const { data: suppliers, error: supErr } = await supabase
    .from('budget_suppliers')
    .select('id, name, category_id')
    .eq('wedding_id', WEDDING_ID);
  if (supErr) throw supErr;

  const { data: payments, error: payErr } = await supabase
    .from('budget_payments')
    .select('*')
    .eq('wedding_id', WEDDING_ID)
    .order('created_at', { ascending: true });
  if (payErr) throw payErr;

  const catMap = new Map((categories || []).map((c) => [c.id, c]));
  const supMap = new Map((suppliers || []).map((s) => [s.id, s]));

  const hasNativePaidBy =
    Array.isArray(payments) &&
    payments.length > 0 &&
    Object.prototype.hasOwnProperty.call(payments[0], 'paid_by');

  console.log(`Modo de almacenamiento detectado en Supabase: ${hasNativePaidBy ? 'columna nativa paid_by' : 'fallback seguro en notes (<!--PAID_BY:...-->)'}`);

  let updatedCount = 0;

  for (const pay of payments || []) {
    const isSettled = pay.status === 'paid' || pay.status === 'partial';
    const { cleanNotes, paidBy: existingPaidBy } = parsePaymentNotesAndPayer(
      pay.notes,
      hasNativePaidBy ? pay.paid_by : null
    );

    if (!isSettled) {
      continue;
    }

    const sup = supMap.get(pay.supplier_id);
    const cat = sup ? catMap.get(sup.category_id) : null;
    const catName = cat?.name || '';
    const supName = sup?.name || '';

    const isStephanieCategory =
      /fot[oó]grafo|fotomat[oó]n/i.test(catName) ||
      /fotomat[oó]n|fotomaton/i.test(supName);

    const targetPayer = existingPaidBy || (isStephanieCategory ? 'Stephanie Mendoza' : 'Rodrigo');

    if (hasNativePaidBy) {
      const needsPromotion =
        String(pay.paid_by || '').trim() !== targetPayer ||
        (pay.notes && pay.notes.includes(PAYMENT_PAYER_MARKER));
      if (needsPromotion) {
        const { error: updErr } = await supabase
          .from('budget_payments')
          .update({
            paid_by: targetPayer,
            notes: cleanNotes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', pay.id);
        if (updErr) throw updErr;
        updatedCount++;
      }
    } else {
      const nextNotes = serializePaymentNotesWithPayer(cleanNotes, targetPayer);
      if (pay.notes !== nextNotes) {
        const { error: updErr } = await supabase
          .from('budget_payments')
          .update({
            notes: nextNotes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', pay.id);
        if (updErr) throw updErr;
        updatedCount++;
      }
    }
  }

  console.log(`Pagos actualizados en esta ejecución: ${updatedCount}`);

  // Re-fetch and verify final state
  const { data: refreshed, error: refErr } = await supabase
    .from('budget_payments')
    .select('*')
    .eq('wedding_id', WEDDING_ID)
    .order('created_at', { ascending: true });
  if (refErr) throw refErr;

  const totalsByPayer = new Map();
  let totalSettled = 0;
  let pendingWithPayer = 0;

  console.log('\nDetalle de pagos en Supabase (Stephanie & Rodrigo):');
  for (const pay of refreshed || []) {
    const sup = supMap.get(pay.supplier_id);
    const cat = sup ? catMap.get(sup.category_id) : null;
    const { cleanNotes, paidBy } = parsePaymentNotesAndPayer(
      pay.notes,
      hasNativePaidBy ? pay.paid_by : null
    );
    const isSettled = pay.status === 'paid' || pay.status === 'partial';

    console.log(
      ` - [${pay.status.padEnd(7)}] ${String(pay.amount).padStart(7)} € | ${
        cat?.name || 'Sin categoría'
      } -> ${sup?.name || pay.supplier_id} | Pagador: ${paidBy || 'null'} | Nota: ${
        cleanNotes || ''
      }`
    );

    if (isSettled) {
      totalSettled += Number(pay.amount);
      const key = paidBy || 'Sin asignar';
      totalsByPayer.set(key, (totalsByPayer.get(key) || 0) + Number(pay.amount));
    } else if (paidBy) {
      pendingWithPayer++;
    }
  }

  console.log('\nTotales por pagador (pagos realizados):');
  for (const [payer, total] of totalsByPayer.entries()) {
    console.log(` - ${payer}: ${total} €`);
  }
  console.log(`Total abonado: ${totalSettled} €`);
  console.log(`Pagos pendientes con pagador asignado: ${pendingWithPayer}`);
}

run().catch((err) => {
  console.error('Error ejecutando backfill:', err);
  process.exit(1);
});
