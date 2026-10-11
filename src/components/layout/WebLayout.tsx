import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface WebLayoutProps {
  children: React.ReactNode;
  activeSection: string;
  onSelectSection: (section: string) => void;
  onNavigateToApp: () => void;
  onNavigateToLanding?: () => void;
  onOpenNewOtModal: () => void;
  onOpenNewSaleModal: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  openOtCount?: number;
  lowStockCount?: number;
}

export const WebLayout: React.FC<WebLayoutProps> = ({
  children,
  activeSection,
  onSelectSection,
  onNavigateToApp,
  onNavigateToLanding,
  onOpenNewOtModal,
  onOpenNewSaleModal,
  searchQuery,
  onSearchChange,
  openOtCount,
  lowStockCount,
}) => {
  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar
        activeSection={activeSection}
        onSelectSection={onSelectSection}
        openOtCount={openOtCount}
        lowStockCount={lowStockCount}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-900/60">
        <Header
          activeSection={activeSection}
          onNavigateToApp={onNavigateToApp}
          onNavigateToLanding={onNavigateToLanding}
          onOpenNewOtModal={onOpenNewOtModal}
          onOpenNewSaleModal={onOpenNewSaleModal}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20">
          <div className="max-w-[1520px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
