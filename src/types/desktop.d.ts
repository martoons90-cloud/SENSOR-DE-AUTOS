interface AutoSenseDesktopSerialPort {
  portId: string;
  portName: string;
  displayName: string;
}

interface Window {
  autosenseDesktop?: {
    chooseSerialPort: (portId: string) => void;
    onSerialPorts: (listener: (ports: AutoSenseDesktopSerialPort[]) => void) => () => void;
  };
}
