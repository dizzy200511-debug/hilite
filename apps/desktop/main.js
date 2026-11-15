// Hilite for Windows.
// The full app is bundled in ./app and served from a private app:// origin, so it opens instantly
// and works offline. Only your data syncs to the server. Updates come from GitHub Releases.
const { app, BrowserWindow, Menu, Notification, Tray, ipcMain, nativeImage, net, protocol, session, shell } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');
const { autoUpdater } = require('electron-updater');

const APP_DIR = path.join(__dirname, 'app');
const ICON = path.join(__dirname, 'build', 'icon.png');
const ORIGIN = 'app://hilite';
const startHidden = process.argv.includes('--hidden');

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true } },
]);

// One copy of Hilite at a time. A second launch (for example the Google sign-in link) is passed to the first.
if (!app.requestSingleInstanceLock()) { app.quit(); return; }
app.setAppUserModelId('study.hilite.app');
if (process.defaultApp) app.setAsDefaultProtocolClient('hilite', process.execPath, [path.resolve(process.argv[1])]);
else app.setAsDefaultProtocolClient('hilite');

let win = null;
let tray = null;
let quitting = false;
let pendingAuthUrl = null;
let updateState = { status: 'idle' };

const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "img-src 'self' data: https:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "frame-ancestors 'none'",
  "base-uri 'none'",
  "form-action 'none'",
].join('; ');

function deepLinkFrom(argv) { return argv.find((a) => a.startsWith('hilite://')); }

function sendAuth(url) {
  if (!url || !url.startsWith('hilite://auth')) return;
  if (win && !win.webContents.isLoading()) win.webContents.send('auth-callback', url);
  else pendingAuthUrl = url;
}

function show() {
  if (!win) createWindow();
  if (win.isMinimized()) win.restore();
  win.show();
  win.focus();
}

function createWindow() {
  win = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 380,
    minHeight: 560,
    show: false,
    title: 'Hilite',
    icon: ICON,
    backgroundColor: '#f4f5f7',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      spellcheck: true,
    },
  });
  Menu.setApplicationMenu(null);
  win.loadURL(ORIGIN + '/index.html');
  win.once('ready-to-show', () => { if (!startHidden) win.show(); });
  win.webContents.on('did-finish-load', () => {
    if (pendingAuthUrl) { win.webContents.send('auth-callback', pendingAuthUrl); pendingAuthUrl = null; }
    win.webContents.send('update', updateState);
  });

  // Keep the window on Hilite. Links to anywhere else open in the normal browser.
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https:\/\//.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith(ORIGIN)) { e.preventDefault(); if (/^https:\/\//.test(url)) shell.openExternal(url); }
  });

  // Closing hides to the tray, so the focus timer and reminders keep going.
  win.on('close', (e) => {
    if (quitting) return;
    e.preventDefault();
    win.hide();
    if (!app.__toldAboutTray && Notification.isSupported()) {
      app.__toldAboutTray = true;
      new Notification({ title: 'Hilite is still running', body: 'Your timer and reminders keep going. Quit from the tray icon.', icon: ICON }).show();
    }
  });
}

function createTray() {
  tray = new Tray(nativeImage.createFromPath(ICON).resize({ width: 16, height: 16 }));
  tray.setToolTip('Hilite');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Open Hilite', click: show },
    { type: 'separator' },
    { label: 'Check for updates', click: () => autoUpdater.checkForUpdates().catch(() => {}) },
    { label: 'Quit Hilite', click: () => { quitting = true; app.quit(); } },
  ]));
  tray.on('click', show);
}

function setUpdate(next) {
  updateState = next;
  if (win) win.webContents.send('update', updateState);
}

function setupUpdates() {
  if (!app.isPackaged) return;
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.on('checking-for-update', () => setUpdate({ status: 'checking' }));
  autoUpdater.on('update-not-available', () => setUpdate({ status: 'none' }));
  autoUpdater.on('update-available', (i) => setUpdate({ status: 'downloading', version: i.version }));
  autoUpdater.on('download-progress', (p) => setUpdate({ status: 'downloading', percent: Math.round(p.percent) }));
  autoUpdater.on('update-downloaded', (i) => {
    setUpdate({ status: 'ready', version: i.version });
    if (Notification.isSupported()) {
      const n = new Notification({ title: 'Hilite update ready', body: 'Version ' + i.version + ' installs next time Hilite restarts. Click to restart now.', icon: ICON });
      n.on('click', () => { quitting = true; autoUpdater.quitAndInstall(); });
      n.show();
    }
  });
  autoUpdater.on('error', () => setUpdate({ status: 'error' }));
  autoUpdater.checkForUpdates().catch(() => {});
  setInterval(() => autoUpdater.checkForUpdates().catch(() => {}), 4 * 60 * 60 * 1000);
}

app.on('second-instance', (_e, argv) => { show(); sendAuth(deepLinkFrom(argv)); });

app.whenReady().then(() => {
  // Serve the bundled app. Paths can't escape the app folder.
  protocol.handle('app', async (req) => {
    const { pathname } = new URL(req.url);
    let file = path.normalize(path.join(APP_DIR, decodeURIComponent(pathname)));
    if (!file.startsWith(APP_DIR)) return new Response('Not found', { status: 404 });
    if (file === APP_DIR || file.endsWith(path.sep)) file = path.join(APP_DIR, 'index.html');
    const res = await net.fetch(pathToFileURL(file).toString()).catch(() => null);
    if (!res || !res.ok) return net.fetch(pathToFileURL(path.join(APP_DIR, 'index.html')).toString());
    const headers = new Headers(res.headers);
    headers.set('Content-Security-Policy', CSP);
    headers.set('X-Content-Type-Options', 'nosniff');
    return new Response(res.body, { status: 200, headers });
  });
  session.defaultSession.setPermissionRequestHandler((_wc, permission, cb) => cb(permission === 'notifications'));

  createWindow();
  createTray();
  setupUpdates();
  sendAuth(deepLinkFrom(process.argv));
});

app.on('before-quit', () => { quitting = true; });
app.on('window-all-closed', (e) => e.preventDefault());

// ---------------------------------------------------------------- bridge to the app
ipcMain.on('open-external', (_e, url) => { if (typeof url === 'string' && /^https:\/\//.test(url)) shell.openExternal(url); });
ipcMain.on('notify', (_e, title, body) => {
  if (!Notification.isSupported()) return;
  const n = new Notification({ title: String(title).slice(0, 80), body: String(body).slice(0, 200), icon: ICON });
  n.on('click', show);
  n.show();
});
ipcMain.on('set-timer', (_e, text) => {
  const t = typeof text === 'string' ? text.slice(0, 40) : null;
  if (tray) tray.setToolTip(t ? 'Hilite: ' + t : 'Hilite');
  if (win) win.setTitle(t ? t + ' · Hilite' : 'Hilite');
});
ipcMain.on('get-version', (e) => { e.returnValue = app.getVersion(); });
ipcMain.on('install-update', () => { if (updateState.status === 'ready') { quitting = true; autoUpdater.quitAndInstall(); } });
ipcMain.handle('get-start-with-windows', () => app.getLoginItemSettings().openAtLogin);
ipcMain.on('set-start-with-windows', (_e, on) => app.setLoginItemSettings({ openAtLogin: !!on, args: ['--hidden'] }));
