import { execFileSync } from 'child_process';
import os from 'os';
import path from 'path';
import fs from 'fs';

const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactsDir = 'C:\\Users\\pepes\\.gemini\\antigravity\\brain\\f90e1ff4-dda3-4ca5-87ba-138c1dec66c6';

const shots = [
  {
    name: 'evidence_admin_media_phase18.png',
    size: '1440,1100',
    url: 'http://localhost:3000/admin/media',
    description: 'Admin Media Dashboard with filters, photo grid, and bulk toolbar',
  },
  {
    name: 'evidence_admin_guestbook_phase18.png',
    size: '1440,1100',
    url: 'http://localhost:3000/admin/guestbook',
    description: 'Admin Guestbook Moderation with search, status tabs, and approval buttons',
  },
  {
    name: 'evidence_public_memories_desktop.png',
    size: '1440,1100',
    url: 'http://localhost:3000/w/stephanie-y-rodrigo#memorias',
    description: 'Public Wedding Guestbook and Memories section (Desktop 1440px)',
  },
  {
    name: 'evidence_public_memories_mobile.png',
    size: '390,844',
    url: 'http://localhost:3000/w/stephanie-y-rodrigo#memorias',
    description: 'Public Wedding Guestbook and Memories section (Mobile 390px)',
  },
  {
    name: 'evidence_invitation_memories.png',
    size: '1440,1100',
    url: 'http://localhost:3000/i/token-garcia-772#memorias',
    description: 'Personalized Guest Invitation with personalized memories form and gallery',
  },
];

console.log('--- PHASE 18 AUTOMATED QA & VISUAL SCREENSHOTS ---');

for (const s of shots) {
  const tmpDir = path.join(os.tmpdir(), 'cp_' + Math.random().toString(36).substring(7));
  const out = path.join(artifactsDir, s.name);
  console.log(`[QA] Capturing ${s.name} from ${s.url} (${s.size})...`);
  try {
    execFileSync(chrome, [
      '--headless=new',
      '--disable-gpu',
      '--user-data-dir=' + tmpDir,
      '--screenshot=' + out,
      '--window-size=' + s.size,
      '--virtual-time-budget=5000',
      s.url,
    ]);
    const size = fs.statSync(out).size;
    console.log(`[QA] SUCCESS: ${s.name} created (${size} bytes).`);
  } catch (err) {
    console.error(`[QA] ERROR capturing ${s.name}:`, err.message);
  }
}

console.log('--- ALL QA SCREENSHOTS CAPTURED ---');
