// A small, fixed bridge between the app and Windows. The page can't reach Node or Electron directly.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('hiliteDesktop', {
  platform: process.platform,
  version: ipcRenderer.sendSync('get-version'),
  openExternal: (url) => ipcRenderer.send('open-external', url),
  onAuthCallback: (cb) => ipcRenderer.on('auth-callback', (_e, url) => cb(url)),
  notify: (title, body) => ipcRenderer.send('notify', title, body),
  setTimer: (text) => ipcRenderer.send('set-timer', text),
  onUpdate: (cb) => ipcRenderer.on('update', (_e, state) => cb(state)),
  installUpdate: () => ipcRenderer.send('install-update'),
  getStartWithWindows: () => ipcRenderer.invoke('get-start-with-windows'),
  setStartWithWindows: (on) => ipcRenderer.send('set-start-with-windows', on),
});
