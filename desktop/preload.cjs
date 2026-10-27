const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('autosenseDesktop', {
  chooseSerialPort: (portId) => ipcRenderer.send('autosense:choose-serial-port', portId),
  onSerialPorts: (listener) => {
    const handler = (_event, ports) => listener(ports);
    ipcRenderer.on('autosense:serial-ports', handler);
    return () => ipcRenderer.removeListener('autosense:serial-ports', handler);
  }
});
