const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');

let mainWindow = null;
const pendingSerialSelections = new Map();

function isLocalAppOrigin(origin) {
  return origin === 'file://' || origin.startsWith('file:///');
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1050,
    minHeight: 700,
    backgroundColor: '#020617',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });

  const session = mainWindow.webContents.session;
  // The packaged app only loads its own local files. Serial access is granted
  // exclusively after the user selects a port in the application UI.
  session.setPermissionCheckHandler((_contents, permission, requestingOrigin) => {
    return permission === 'serial' && isLocalAppOrigin(requestingOrigin);
  });
  session.setPermissionRequestHandler((_contents, permission, callback, details) => {
    callback(permission === 'serial' && isLocalAppOrigin(details.requestingUrl || ''));
  });

  session.on('select-serial-port', (event, portList, webContents, callback) => {
    event.preventDefault();
    const key = webContents.id;
    const previous = pendingSerialSelections.get(key);
    if (previous) previous.callback('');

    const ports = portList.map((port) => ({
      portId: port.portId,
      portName: port.portName || 'Puerto serie',
      displayName: port.displayName || ''
    }));
    const timeout = setTimeout(() => {
      const pending = pendingSerialSelections.get(key);
      if (pending?.callback === callback) {
        pendingSerialSelections.delete(key);
        callback('');
      }
    }, 60_000);
    pendingSerialSelections.set(key, { callback, ports, timeout });
    webContents.send('autosense:serial-ports', ports);
  });

  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('file://')) event.preventDefault();
  });
  mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
}

ipcMain.on('autosense:choose-serial-port', (event, portId) => {
  const pending = pendingSerialSelections.get(event.sender.id);
  if (!pending) return;
  const isKnownPort = pending.ports.some((port) => port.portId === portId);
  clearTimeout(pending.timeout);
  pendingSerialSelections.delete(event.sender.id);
  pending.callback(isKnownPort ? portId : '');
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  for (const pending of pendingSerialSelections.values()) {
    clearTimeout(pending.timeout);
    pending.callback('');
  }
  pendingSerialSelections.clear();
  if (process.platform !== 'darwin') app.quit();
});
