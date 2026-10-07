import { spawn } from 'child_process';
import os from 'os';
import path from 'path';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactsDir = 'C:\\Users\\pepes\\.gemini\\antigravity\\brain\\f90e1ff4-dda3-4ca5-87ba-138c1dec66c6';
const tmpDir = path.join(os.tmpdir(), 'cdp_modals_' + Date.now());

async function main() {
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9223',
    '--user-data-dir=' + tmpDir,
    '--window-size=1440,1100',
  ]);

  let versionData = null;
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9223/json/version');
      if (res.ok) {
        versionData = await res.json();
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }

  const newTargetRes = await fetch('http://127.0.0.1:9223/json/new?http://localhost:3000/w/stephanie-y-rodrigo', {
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

  await new Promise((r) => setTimeout(r, 2500));

  // 1. Scroll and switch to Gallery tab
  await evaluate(`
    const el = document.getElementById('memorias');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Galería'));
    if (btn) btn.click();
  `);
  await new Promise((r) => setTimeout(r, 1200));

  // 2. Open Upload Modal from the gallery CTA
  console.log('[CDP] Clicking Subir fotos de la boda...');
  await evaluate(`
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Subir fotos'));
    if (btn) btn.click();
  `);
  await new Promise((r) => setTimeout(r, 1000));
  await captureScreenshot('evidence_guest_upload_modal.png');

  // 3. Close upload modal
  await evaluate(`
    const close = document.querySelector('button[aria-label="Cerrar modal"]');
    if (close) close.click();
  `);
  await new Promise((r) => setTimeout(r, 800));

  // 4. Click first photo image container to open lightbox
  console.log('[CDP] Clicking first photo for lightbox...');
  await evaluate(`
    const photoCards = document.querySelectorAll('.group.cursor-pointer');
    if (photoCards.length > 0) {
      photoCards[0].click();
    }
  `);
  await new Promise((r) => setTimeout(r, 1200));
  await captureScreenshot('evidence_public_photo_lightbox_open.png');

  ws.close();
  chromeProc.kill();
  console.log('[CDP] Done modals capture.');
}

main().catch((err) => {
  console.error('[CDP] Error:', err);
  process.exit(1);
});
