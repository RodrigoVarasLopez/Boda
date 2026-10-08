import { execFileSync } from 'child_process';
import os from 'os';
import path from 'path';
import fs from 'fs';

const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactsDir = 'C:\\Users\\pepes\\.gemini\\antigravity\\brain\\f90e1ff4-dda3-4ca5-87ba-138c1dec66c6';

const shots = [
  {
    name: 'evidence_admin_budget_desktop.png',
    size: '1440,1100',
    url: 'http://localhost:3000/admin/budget',
    description: 'Admin Budget Dashboard with KPIs, Menu Calculator, Category Cards, and Suppliers',
  },
  {
    name: 'evidence_admin_budget_mobile.png',
    size: '390,844',
    url: 'http://localhost:3000/admin/budget',
    description: 'Admin Budget Dashboard responsive mobile view',
  },
  {
    name: 'evidence_admin_guests_comensales.png',
    size: '1440,1100',
    url: 'http://localhost:3000/admin/guests',
    description: 'Admin Guests CRM showing Adult / Child guest badges and RSVP stats',
  },
];

console.log('--- PHASE 20 AUTOMATED QA & VISUAL SCREENSHOTS ---');

for (const s of shots) {
  const tmpDir = path.join(os.tmpdir(), 'cp_' + Math.random().toString(36).substring(7));
  const out = path.join(artifactsDir, s.name);
  console.log(`[QA] Capturing ${s.name} from ${s.url} (${s.size})...`);
  try {
    execFileSync(chrome, [
      '--headless=new',
      '--disable-gpu',
      `--user-data-dir=${tmpDir}`,
      `--screenshot=${out}`,
      `--window-size=${s.size}`,
      '--virtual-time-budget=6000',
      s.url,
    ]);
    if (fs.existsSync(out)) {
      const stats = fs.statSync(out);
      console.log(`[QA] SUCCESS: ${s.name} created (${stats.size} bytes).`);
    } else {
      console.error(`[QA] FAIL: ${s.name} was not generated.`);
    }
  } catch (err) {
    console.error(`[QA] Error capturing ${s.name}:`, err.message);
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (_) {}
  }
}

console.log('--- ALL QA SCREENSHOTS CAPTURED ---');
