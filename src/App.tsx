/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  VehicleProfile,
  OBDTelemetry,
  DTCFaultCode,
  FluidLevel,
  EcoSavingReport,
  Workshop,
  ServiceAppointment,
  MaintenanceRecord,
  MaintenanceAlert
} from './types/vehicle';
import {
  INITIAL_VEHICLE,
  INITIAL_FLUIDS,
  INITIAL_ECO_REPORT,
  INITIAL_WORKSHOPS,
  INITIAL_MAINTENANCE_HISTORY,
  INITIAL_ALERTS,
  INITIAL_APPOINTMENTS
} from './services/appState';
import { elm327Service } from './services/elm327Bluetooth';
import { Navbar } from './components/layout/Navbar';
import { BottomTabBar } from './components/layout/BottomTabBar';
import { LoginPage } from './components/layout/LoginPage';
import { WebDashboard } from './components/telemetry/WebDashboard';
import { DashboardView } from './components/telemetry/DashboardView';
import { DtcScannerView } from './components/diagnostics/DtcScannerView';
import { FluidsAndEngineHealthView } from './components/fluids/FluidsAndEngineHealthView';
import { EcoFuelAdvisorView } from './components/eco/EcoFuelAdvisorView';
import { WorkshopsAndBookingView } from './components/workshops/WorkshopsAndBookingView';
import { MaintenanceHistoryView } from './components/maintenance/MaintenanceHistoryView';
import { ArgentineGarageModal } from './components/garage/ArgentineGarageModal';
import { ShareWithMechanicModal } from './components/telemetry/ShareWithMechanicModal';
import { LandingPage } from './components/landing/LandingPage';
import { ConnectionView } from './components/telemetry/ConnectionView';
import { RawTerminalView } from './components/telemetry/RawTerminalView';

export default function App() {
  const [activeView, setActiveView] = useState<'landing' | 'login' | 'erp' | 'elm327-app'>('landing');
  const [vehicle, setVehicle] = useState<VehicleProfile>(INITIAL_VEHICLE);
  const [telemetry, setTelemetry] = useState<OBDTelemetry>(elm327Service.getTelemetry());
  const [activeDtcs, setActiveDtcs] = useState<DTCFaultCode[]>(elm327Service.getActiveDtcs());
  const [fluids, setFluids] = useState<FluidLevel[]>(INITIAL_FLUIDS);
  const [ecoReport, setEcoReport] = useState<EcoSavingReport>(INITIAL_ECO_REPORT);
  const [workshops, setWorkshops] = useState<Workshop[]>(INITIAL_WORKSHOPS);
  const [appointments, setAppointments] = useState<ServiceAppointment[]>(INITIAL_APPOINTMENTS);
  const [records, setRecords] = useState<MaintenanceRecord[]>(INITIAL_MAINTENANCE_HISTORY);
  const [alerts, setAlerts] = useState<MaintenanceAlert[]>(INITIAL_ALERTS);

  const [activeTab, setActiveTab] = useState<string>('conexion');
  const [isGarageModalOpen, setIsGarageModalOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [prefilledDtcForBooking, setPrefilledDtcForBooking] = useState<DTCFaultCode | null>(null);
  const [prefilledServiceForBooking, setPrefilledServiceForBooking] = useState<string>('');

  // Subscribe to real-time telemetry from ELM327
  useEffect(() => {
    const unsub = elm327Service.subscribe((newTelemetry) => {
      setTelemetry(newTelemetry);
      setActiveDtcs(elm327Service.getActiveDtcs());
    });
    return () => unsub();
  }, []);

  const handleConnectBluetooth = async () => {
    if (telemetry.connectionState === 'connected') {
      elm327Service.disconnect();
    } else {
      await elm327Service.connectRealBluetooth();
    }
  };

  const handleBookAppointmentForDtc = (dtc: DTCFaultCode) => {
    setPrefilledDtcForBooking(dtc);
    setPrefilledServiceForBooking(`Diagnóstico y Reparación de Código ${dtc.code}`);
    setActiveTab('talleres');
  };

  const handleBookService = (serviceName: string) => {
    setPrefilledServiceForBooking(serviceName);
    setPrefilledDtcForBooking(null);
    setActiveTab('talleres');
  };

  const handleUpdateFluid = (fluidId: string, newLevel: number) => {
    setFluids(prev =>
      prev.map(f =>
        f.id === fluidId
          ? {
              ...f,
              currentLevelPercent: newLevel,
              status: newLevel < 35 ? 'critical' : newLevel < 65 ? 'warning' : 'optimal',
              lastCheckedDate: new Date().toISOString().split('T')[0]
            }
          : f
      )
    );
  };

  const handleAddMaintenanceRecord = (newRecord: Omit<MaintenanceRecord, 'id'>) => {
    const id = `mr-${Date.now().toString().slice(-5)}`;
    const fullRecord: MaintenanceRecord = { id, ...newRecord };
    setRecords(prev => [fullRecord, ...prev]);

    // Update vehicle odometer if new record is higher
    if (newRecord.mileage > vehicle.currentMileage) {
      setVehicle(prev => ({ ...prev, currentMileage: newRecord.mileage }));
    }

    // Refresh alerts with new due mileage
    setAlerts(prev =>
      prev.map(alert => {
        if (alert.type === 'aceite' && newRecord.serviceType.toLowerCase().includes('aceite')) {
          return {
            ...alert,
            status: 'ok',
            currentKm: newRecord.mileage,
            dueKm: newRecord.mileage + 10000,
            kmRemaining: 10000,
            dueDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
            description: 'Próximo cambio programado en 10.000 km.'
          };
        }
        return alert;
      })
    );
  };

  const handleBookAppointment = (aptData: Omit<ServiceAppointment, 'id' | 'createdAt'>) => {
    const id = `trn-${Math.floor(10000 + Math.random() * 90000)}`;
    const appointment: ServiceAppointment = {
      id,
      ...aptData,
      createdAt: new Date().toISOString()
    };
    setAppointments(prev => [appointment, ...prev]);
  };

  const handleCancelAppointment = (id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
  };

  const handleDtcsCleared = () => {
    setActiveDtcs([]);
  };

  if (activeView === 'landing') {
    return (
      <LandingPage
        onOpenMobileApp={() => setActiveView('elm327-app')}
        onOpenWorkshopErp={() => setActiveView('erp')}
      />
    );
  }

  if (activeView === 'login') return <LoginPage onLogin={() => setActiveView('erp')} />;
  if (activeView === 'erp') {
    return (
      <WebDashboard
        onNavigateToApp={() => setActiveView('elm327-app')}
        onNavigateToLanding={() => setActiveView('landing')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Sleek Header focused on vehicle and OBD connection */}
      <Navbar
        telemetry={telemetry}
        vehicle={vehicle}
        onConnectBluetooth={handleConnectBluetooth}
        activeDtcsCount={activeDtcs.length}
        onGoToLiveView={() => setActiveTab('telemetria')}
        onOpenGarageModal={() => setIsGarageModalOpen(true)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onGoToErp={() => setActiveView('erp')}
        onGoToLanding={() => setActiveView('landing')}
        onGoToConnection={() => setActiveTab('conexion')}
      />

      {/* Main View Area with generous bottom spacing for the fixed bottom tab bar */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-3.5 sm:py-6 pb-24 sm:pb-28">
        {activeTab === 'conexion' && (
          <ConnectionView
            telemetry={telemetry}
            vehicle={vehicle}
            onConnectBluetooth={handleConnectBluetooth}
            onGoToMainDashboard={() => setActiveTab('telemetria')}
            onOpenGarageModal={() => setIsGarageModalOpen(true)}
          />
        )}

        {activeTab === 'terminal' && (
          <RawTerminalView />
        )}

        {activeTab === 'telemetria' && (
          <DashboardView
            telemetry={telemetry}
            vehicle={vehicle}
            onNavigateToDTC={() => setActiveTab('diagnostico')}
            onNavigateToEco={() => setActiveTab('eco')}
            onOpenGarage={() => setIsGarageModalOpen(true)}
            onNavigateToTerminal={() => setActiveTab('terminal')}
          />
        )}

        {activeTab === 'diagnostico' && (
          <DtcScannerView
            activeDtcs={activeDtcs}
            telemetry={telemetry}
            vehicle={vehicle}
            onBookAppointmentForDtc={handleBookAppointmentForDtc}
            onDtcsCleared={handleDtcsCleared}
          />
        )}

        {activeTab === 'fluidos' && (
          <FluidsAndEngineHealthView
            fluids={fluids}
            telemetry={telemetry}
            vehicle={vehicle}
            onUpdateFluid={handleUpdateFluid}
            onBookService={handleBookService}
          />
        )}

        {activeTab === 'eco' && (
          <EcoFuelAdvisorView
            report={ecoReport}
            vehicle={vehicle}
          />
        )}

        {activeTab === 'talleres' && (
          <WorkshopsAndBookingView
            workshops={workshops}
            appointments={appointments}
            vehicle={vehicle}
            initialServiceFilter={prefilledServiceForBooking}
            initialDtc={prefilledDtcForBooking}
            onBookAppointment={handleBookAppointment}
            onCancelAppointment={handleCancelAppointment}
          />
        )}

        {activeTab === 'historial' && (
          <MaintenanceHistoryView
            records={records}
            alerts={alerts}
            vehicle={vehicle}
            onAddRecord={handleAddMaintenanceRecord}
            onBookServiceForAlert={(serviceName) => {
              handleBookService(serviceName);
            }}
          />
        )}
      </main>

      {/* Clean quiet footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950/80 py-4 mb-16 sm:mb-14 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>AutoScan Pro · Diagnóstico Automotriz & Tablero Digital</span>
          <span className="font-mono text-[11px] text-slate-600">
            ELM327 OBD-II SAE J1979 · Conducción Eficiente & Mantenimiento
          </span>
        </div>
      </footer>

      {/* Modern Fixed Bottom Tab Bar for all current and future views */}
      <BottomTabBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeDtcsCount={activeDtcs.length}
        urgentAlertsCount={alerts.filter(a => a.status === 'vencido').length}
      />

      {/* Argentine Vehicle Garage Modal */}
      <ArgentineGarageModal
        isOpen={isGarageModalOpen}
        onClose={() => setIsGarageModalOpen(false)}
        currentVehicle={vehicle}
        onSelectVehicle={(newVehicle, updatedFluids, updatedAlerts) => {
          setVehicle(newVehicle);
          if (updatedFluids) setFluids(updatedFluids);
          if (updatedAlerts) setAlerts(updatedAlerts);
        }}
      />

      {/* Share Telemetry with Workshop Modal */}
      <ShareWithMechanicModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        vehicle={vehicle}
        onGoToWorkshopErp={() => setActiveView('erp')}
      />
    </div>
  );
}
