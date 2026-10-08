import { spawn } from 'child_process';
import os from 'os';
import path from 'path';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const artifactsDir = 'C:\\Users\\pepes\\.gemini\\antigravity\\brain\\f90e1ff4-dda3-4ca5-87ba-138c1dec66c6';
const tmpDir = path.join(os.tmpdir(), 'chrome_cdp_' + Math.random().toString(36).substring(7));

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  console.log('[CDP] Launching Chrome...');
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--remote-debugging-port=9222',
    `--user-data-dir=${tmpDir}`,
    'about:blank',
  ]);

  await sleep(1500);

  try {
    const verRes = await fetch('http://127.0.0.1:9222/json/version');
    const verData = await verRes.json();
    const wsUrl = verData.webSocketDebuggerUrl;
    console.log('[CDP] Browser WS URL:', wsUrl);

    // Create target
    const newRes = await fetch('http://127.0.0.1:9222/json/new?about:blank', { method: 'PUT' });
    const targetData = await newRes.json();
    const targetWs = targetData.webSocketDebuggerUrl;

    const ws = new WebSocket(targetWs);
    await new Promise((res, rej) => {
      ws.onopen = res;
      ws.onerror = rej;
    });

    let msgId = 1;
    function send(method, params = {}) {
      return new Promise((resolve) => {
        const id = msgId++;
        const handler = (event) => {
          const data = JSON.parse(event.data);
          if (data.id === id) {
            ws.removeEventListener('message', handler);
            resolve(data.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    // Enable domains
    await send('Network.enable');
    await send('Page.enable');

    // Set demo cookie
    await send('Network.setCookie', {
      name: 'boda_admin_demo',
      value: 'true',
      domain: 'localhost',
      path: '/',
    });
    console.log('[CDP] Demo cookie set successfully');

    const tasks = [
      {
        name: 'evidence_admin_budget_desktop.png',
        url: 'http://localhost:3000/admin/budget',
        width: 1440,
        height: 1100,
      },
      {
        name: 'evidence_admin_budget_mobile.png',
        url: 'http://localhost:3000/admin/budget',
        width: 390,
        height: 844,
      },
      {
        name: 'evidence_admin_guests_comensales.png',
        url: 'http://localhost:3000/admin/guests',
        width: 1440,
        height: 1100,
      },
    ];

    for (const t of tasks) {
      console.log(`[CDP] Navigating to ${t.url} (${t.width}x${t.height})...`);
      await send('Emulation.setDeviceMetricsOverride', {
        width: t.width,
        height: t.height,
        deviceScaleFactor: 1,
        mobile: t.width < 500,
      });

      await send('Page.navigate', { url: t.url });
      await sleep(2500); // Wait for React hydration and animation

      const snap = await send('Page.captureScreenshot', { format: 'png' });
      if (snap && snap.data) {
        const buf = Buffer.from(snap.data, 'base64');
        const out = path.join(artifactsDir, t.name);
        fs.writeFileSync(out, buf);
        console.log(`[CDP] Saved ${t.name} (${buf.length} bytes)`);
      }
    }

    ws.close();
  } catch (err) {
    console.error('[CDP] Error:', err);
  } finally {
    chromeProc.kill();
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch (_) {}
  }
}

run();
