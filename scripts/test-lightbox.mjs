import { spawn } from 'child_process';
import os from 'os';
import path from 'path';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactsDir = 'C:\\Users\\pepes\\.gemini\\antigravity\\brain\\f90e1ff4-dda3-4ca5-87ba-138c1dec66c6';
const tmpDir = path.join(os.tmpdir(), 'cdp_lightbox_' + Date.now());

async function main() {
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9225',
    '--user-data-dir=' + tmpDir,
    '--window-size=1440,1100',
  ]);

  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9225/json/version');
      if (res.ok) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }

  const newTargetRes = await fetch('http://127.0.0.1:9225/json/new?http://localhost:3000/w/stephanie-y-rodrigo', { method: 'PUT' });
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

  await new Promise((res) => { ws.onopen = res; });

  function send(method, params = {}) {
    const id = idCounter++;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async function evaluate(expression) {
    const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    return res?.result?.value;
  }

  async function captureScreenshot(filename) {
    const res = await send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    const outPath = path.join(artifactsDir, filename);
    fs.writeFileSync(outPath, buffer);
    console.log(`[CDP] Saved: ${filename} (${buffer.length} bytes)`);
  }

  await new Promise((r) => setTimeout(r, 3000));

  // 1. Switch to Galería tab
  const switchRes = await evaluate(`(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Galería'));
    if (btn) {
      btn.click();
      return 'clicked galeria';
    }
    return 'galeria not found';
  })()`);
  console.log('Switch tab:', switchRes);

  await new Promise((r) => setTimeout(r, 1200));

  // 2. Click specifically on the first photo in the gallery grid
  const photoClick = await evaluate(`(() => {
    const section = document.getElementById('memorias');
    if (!section) return 'section not found';
    const grid = section.querySelector('.grid.grid-cols-2');
    if (!grid) return 'grid not found';
    const firstPhoto = grid.children[0];
    if (!firstPhoto) return 'photo not found';
    firstPhoto.click();
    return 'clicked first photo in gallery grid';
  })()`);
  console.log('Photo click result:', photoClick);

  await new Promise((r) => setTimeout(r, 1500));

  // Check if lightbox dialog is in DOM
  const lightboxState = await evaluate(`(() => {
    const dialog = document.querySelector('div[aria-label="Visor de fotografía"]');
    return dialog ? dialog.outerHTML.slice(0, 150) : 'none';
  })()`);
  console.log('Lightbox state:', lightboxState);

  await captureScreenshot('evidence_public_photo_lightbox_open.png');

  ws.close();
  chromeProc.kill();
  console.log('[CDP] Lightbox test completed.');
}

main().catch(console.error);
