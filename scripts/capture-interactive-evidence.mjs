import { spawn } from 'child_process';
import os from 'os';
import path from 'path';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactsDir = 'C:\\Users\\pepes\\.gemini\\antigravity\\brain\\f90e1ff4-dda3-4ca5-87ba-138c1dec66c6';
const tmpDir = path.join(os.tmpdir(), 'cdp_' + Date.now());

async function main() {
  console.log('[CDP] Starting Chrome process on port 9222...');
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9222',
    '--user-data-dir=' + tmpDir,
    '--window-size=1440,1100',
  ]);

  // Wait for port 9222 to be ready
  let versionData = null;
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9222/json/version');
      if (res.ok) {
        versionData = await res.json();
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }

  if (!versionData) {
    throw new Error('Chrome failed to start or open debugging port 9222');
  }

  console.log('[CDP] Connected to Chrome:', versionData.Browser);

  // Create new page target
  const newTargetRes = await fetch('http://127.0.0.1:9222/json/new?http://localhost:3000/w/stephanie-y-rodrigo', {
    method: 'PUT',
  });
  const target = await newTargetRes.json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);

  let idCounter = 1;
  const pending = new Map();

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  };

  await new Promise((res) => {
    ws.onopen = res;
  });

  function send(method, params = {}) {
    const id = idCounter++;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async function captureScreenshot(filename) {
    const res = await send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    const outPath = path.join(artifactsDir, filename);
    fs.writeFileSync(outPath, buffer);
    console.log(`[CDP] Saved: ${filename} (${buffer.length} bytes)`);
  }

  async function evaluate(expression) {
    const res = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return res?.result?.value;
  }

  console.log('[CDP] Waiting for page load on /w/stephanie-y-rodrigo...');
  await new Promise((r) => setTimeout(r, 3000));

  // 1. Scroll to #memorias
  console.log('[CDP] Scrolling to memories section...');
  await evaluate(`
    const el = document.getElementById('memorias') || document.querySelector('section[id*="memoria"]');
    if (el) {
      el.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
  `);
  await new Promise((r) => setTimeout(r, 1000));
  await captureScreenshot('evidence_public_memories_guestbook.png');

  // 2. Click on "Galería" tab
  console.log('[CDP] Switching to Galería tab...');
  await evaluate(`
    const buttons = Array.from(document.querySelectorAll('button'));
    const galeriaBtn = buttons.find(b => b.textContent && b.textContent.includes('Galería'));
    if (galeriaBtn) galeriaBtn.click();
  `);
  await new Promise((r) => setTimeout(r, 1200));
  await captureScreenshot('evidence_public_memories_gallery.png');

  // 3. Click on the first photo card to open Lightbox
  console.log('[CDP] Opening photo lightbox...');
  await evaluate(`
    const photos = document.querySelectorAll('section#memorias .cursor-pointer, section[id*="memoria"] .cursor-pointer');
    if (photos.length > 0) {
      photos[0].click();
    }
  `);
  await new Promise((r) => setTimeout(r, 1000));
  await captureScreenshot('evidence_public_photo_lightbox.png');

  // 4. Navigate to Admin Media page
  console.log('[CDP] Navigating to /admin/media...');
  await send('Page.navigate', { url: 'http://localhost:3000/admin/media' });
  await new Promise((r) => setTimeout(r, 3000));

  // 5. Open photo detail drawer on the first photo
  console.log('[CDP] Opening Admin Photo Drawer...');
  await evaluate(`
    const infoButtons = document.querySelectorAll('button[title*="detalles"], button[title*="Inspeccionar"]');
    if (infoButtons.length > 0) {
      infoButtons[0].click();
    } else {
      const cards = document.querySelectorAll('.cursor-pointer');
      if (cards.length > 0) cards[0].click();
    }
  `);
  await new Promise((r) => setTimeout(r, 1000));
  await captureScreenshot('evidence_admin_photo_drawer.png');

  // 6. Close drawer and open Upload Modal
  console.log('[CDP] Opening Admin Upload Modal...');
  await evaluate(`
    const closeBtn = document.querySelector('button[aria-label="Cerrar panel"]');
    if (closeBtn) closeBtn.click();
  `);
  await new Promise((r) => setTimeout(r, 500));
  await evaluate(`
    const uploadBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Añadir fotografía'));
    if (uploadBtn) uploadBtn.click();
  `);
  await new Promise((r) => setTimeout(r, 1000));
  await captureScreenshot('evidence_admin_upload_modal.png');

  ws.close();
  chromeProc.kill();
  console.log('[CDP] Completed all interactive captures successfully!');
}

main().catch((err) => {
  console.error('[CDP] Error:', err);
  process.exit(1);
});
