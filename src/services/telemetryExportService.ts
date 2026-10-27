import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import type { SensorTestCircuitReport, StandardPidDiscoveryReport, TelemetryDiagnosticExport } from './elm327Bluetooth';

const fileStamp = () => new Date().toISOString().replace(/[:.]/g, '-');

const downloadInBrowser = (filename: string, contents: string) => {
  const blob = new Blob([contents], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

/** Creates one self-contained diagnostic file, including raw ELM responses. */
export const exportTelemetrySession = async (report: TelemetryDiagnosticExport) => {
  const filename = `autosense-diagnostico-${fileStamp()}.json`;
  const contents = JSON.stringify(report, null, 2);

  if (!Capacitor.isNativePlatform()) {
    downloadInBrowser(filename, contents);
    return { filename, shared: false };
  }

  const result = await Filesystem.writeFile({
    path: filename,
    data: contents,
    directory: Directory.Cache,
    encoding: Encoding.UTF8,
    recursive: true
  });

  const canShare = await Share.canShare();
  if (canShare.value) {
    await Share.share({
      title: 'Historial de diagnóstico AutoSense',
      text: `Sesión de diagnóstico: ${report.samples.length} muestras y ${report.communications.length} tramas ELM327.`,
      files: [result.uri],
      dialogTitle: 'Enviar historial de diagnóstico'
    });
  }

  return { filename, shared: canShare.value };
};

/** Exports the controlled two-round sensor test with the real ELM327 replies. */
export const exportSensorTestCircuit = async (report: SensorTestCircuitReport) => {
  const filename = `autosense-prueba-sensores-${fileStamp()}.json`;
  const contents = JSON.stringify(report, null, 2);

  if (!Capacitor.isNativePlatform()) {
    downloadInBrowser(filename, contents);
    return { filename, shared: false };
  }

  const result = await Filesystem.writeFile({
    path: filename,
    data: contents,
    directory: Directory.Cache,
    encoding: Encoding.UTF8,
    recursive: true
  });

  const canShare = await Share.canShare();
  if (canShare.value) {
    await Share.share({
      title: 'Prueba de sensores AutoSense',
      text: `Prueba completada: ${report.readings.length} lecturas reales en ${report.rounds} vueltas.`,
      files: [result.uri],
      dialogTitle: 'Guardar o enviar prueba de sensores'
    });
  }

  return { filename, shared: canShare.value };
};

/** Exports the complete standard-PID inventory, including unsupported replies. */
export const exportStandardPidDiscovery = async (report: StandardPidDiscoveryReport) => {
  const filename = `autosense-inventario-pids-${fileStamp()}.json`;
  const contents = JSON.stringify(report, null, 2);

  if (!Capacitor.isNativePlatform()) {
    downloadInBrowser(filename, contents);
    return { filename, shared: false };
  }

  const result = await Filesystem.writeFile({
    path: filename,
    data: contents,
    directory: Directory.Cache,
    encoding: Encoding.UTF8,
    recursive: true
  });

  const canShare = await Share.canShare();
  if (canShare.value) {
    const withData = report.readings.filter((reading) => reading.result === 'datos').length;
    await Share.share({
      title: 'Inventario de sensores AutoSense',
      text: `Inventario ECU: ${withData}/${report.readings.length} PIDs devolvieron datos reales.`,
      files: [result.uri],
      dialogTitle: 'Guardar o enviar inventario de sensores'
    });
  }

  return { filename, shared: canShare.value };
};
