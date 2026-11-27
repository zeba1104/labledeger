import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/dashboard/Dashboard';
import SamplesList from './components/samples/SamplesList';
import SampleDetailsModal from './components/samples/SampleDetailsModal';
import SampleFormModal from './components/samples/SampleFormModal';
import StorageMap from './components/storage/StorageMap';
import StorageNodeModal from './components/storage/StorageNodeModal';
import QRScannerModal from './components/qr/QRScannerModal';
import PrintLabelSheetModal from './components/qr/PrintLabelSheetModal';
import TransferLogView from './components/transfers/TransferLogView';
import ExperimentNotesView from './components/experiments/ExperimentNotesView';
import AuditHistoryView from './components/audit/AuditHistoryView';
import TeamManagement from './components/team/TeamManagement';
import LabSettings from './components/settings/LabSettings';
import OnboardingScreen from './components/OnboardingScreen';
import LoginModal from './components/auth/LoginModal';
import ChemicalMixingLoader from './components/common/ChemicalMixingLoader';

function MainApp() {
  const { user, loading, showOnboarding, setShowOnboarding } = useAuth();
  
  // Navigation & UI state
  const [activeView, setActiveView] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('labledger_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('labledger_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Modals state
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isSampleFormOpen, setIsSampleFormOpen] = useState(false);
  const [sampleToEdit, setSampleToEdit] = useState(null);
  const [selectedSampleDetails, setSelectedSampleDetails] = useState(null);
  const [printSheetSamples, setPrintSheetSamples] = useState([]);
  const [isPrintSheetOpen, setIsPrintSheetOpen] = useState(false);
  const [isAddStorageNodeOpen, setIsAddStorageNodeOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [preselectedTransferSample, setPreselectedTransferSample] = useState(null);
  const [slotPrefill, setSlotPrefill] = useState(null);

  // Key refresh trigger
  const [refreshKey, setRefreshKey] = useState(0);

  // Handlers
  const handleOpenNewSample = () => {
    setSampleToEdit(null);
    setSlotPrefill(null);
    setIsSampleFormOpen(true);
  };

  const handleOpenEditSample = (sample) => {
    setSampleToEdit(sample);
    setSlotPrefill(null);
    setIsSampleFormOpen(true);
  };

  const handleRegisterInSlot = (slotInfo) => {
    setSampleToEdit(null);
    setSlotPrefill(slotInfo);
    setIsSampleFormOpen(true);
  };

  const handleOpenTransferModal = (sample) => {
    setPreselectedTransferSample(sample);
    setIsTransferModalOpen(true);
  };

  const handleOpenPrintSheet = (samples) => {
    setPrintSheetSamples(samples);
    setIsPrintSheetOpen(true);
  };

  const handleSampleFoundFromScanner = (sample) => {
    setSelectedSampleDetails(sample);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-rose-50/40 to-slate-100 flex flex-col items-center justify-center p-4">
        <ChemicalMixingLoader
          text="Initializing LabLedger Biobank System..."
          subtext="Connecting to MongoDB Atlas & mounting cold-chain cryogenic registry"
          size="lg"
        />
      </div>
    );
  }

  // Show Classy Onboarding screen if user is not logged in or explicitly requested onboarding tour
  if (!user || showOnboarding) {
    return (
      <>
        <OnboardingScreen
          onOpenLogin={() => setIsLoginOpen(true)}
        />

        <LoginModal
          isOpen={isLoginOpen}
          onClose={() => setIsLoginOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* Top Navigation */}
      <Navbar
        onOpenQRScanner={() => setIsQRScannerOpen(true)}
        onOpenNewSample={handleOpenNewSample}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        globalSearch={globalSearch}
        setGlobalSearch={setGlobalSearch}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Main Body */}
      <div className="flex-1 flex">
        {/* Sidebar (Fixed on the left) */}
        <Sidebar
          activeView={activeView}
          setActiveView={(view) => {
            if (view === 'scanner') {
              setIsQRScannerOpen(true);
            } else {
              setActiveView(view);
            }
          }}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
        />

        {/* Viewport Content - offset dynamically so the fixed sidebar never overlaps */}
        <main className={`flex-1 transition-all duration-[var(--dur-base)] ease-[var(--ease-standard)] ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'} min-w-0`}>
          {activeView === 'dashboard' && (
            <Dashboard
              key={refreshKey}
              setActiveView={setActiveView}
              onOpenNewSample={handleOpenNewSample}
              onOpenQRScanner={() => setIsQRScannerOpen(true)}
              onOpenSampleDetails={(sample) => setSelectedSampleDetails(sample)}
            />
          )}

          {activeView === 'samples' && (
            <SamplesList
              key={refreshKey}
              onOpenNewSample={handleOpenNewSample}
              onOpenSampleDetails={(sample) => setSelectedSampleDetails(sample)}
              onOpenEditSample={handleOpenEditSample}
              onOpenPrintSheet={handleOpenPrintSheet}
              onOpenTransferModal={handleOpenTransferModal}
              globalSearch={globalSearch}
            />
          )}

          {activeView === 'storage' && (
            <StorageMap
              key={refreshKey}
              onOpenSampleDetails={(sample) => setSelectedSampleDetails(sample)}
              onRegisterInSlot={handleRegisterInSlot}
              onOpenAddStorageNode={() => setIsAddStorageNodeOpen(true)}
            />
          )}

          {activeView === 'transfers' && (
            <TransferLogView
              key={refreshKey}
              onOpenSampleDetails={(sample) => setSelectedSampleDetails(sample)}
              isModalOpen={isTransferModalOpen}
              setIsModalOpen={setIsTransferModalOpen}
              preselectedSample={preselectedTransferSample}
            />
          )}

          {activeView === 'experiments' && (
            <ExperimentNotesView
              key={refreshKey}
              onOpenSampleDetails={(sample) => setSelectedSampleDetails(sample)}
            />
          )}

          {activeView === 'audit' && (
            <AuditHistoryView
              key={refreshKey}
            />
          )}

          {activeView === 'team' && (
            <TeamManagement
              key={refreshKey}
            />
          )}

          {activeView === 'settings' && (
            <LabSettings
              key={refreshKey}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <SampleDetailsModal
        sample={selectedSampleDetails}
        onClose={() => setSelectedSampleDetails(null)}
        onOpenTransfer={(sample) => {
          setSelectedSampleDetails(null);
          handleOpenTransferModal(sample);
        }}
        onOpenPrintSheet={handleOpenPrintSheet}
      />

      <SampleFormModal
        isOpen={isSampleFormOpen}
        onClose={() => {
          setIsSampleFormOpen(false);
          setSampleToEdit(null);
          setSlotPrefill(null);
        }}
        sampleToEdit={sampleToEdit}
        prefilledLocation={slotPrefill}
        onSampleSaved={() => setRefreshKey(k => k + 1)}
      />

      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onSampleFound={handleSampleFoundFromScanner}
      />

      <PrintLabelSheetModal
        isOpen={isPrintSheetOpen}
        onClose={() => setIsPrintSheetOpen(false)}
        samples={printSheetSamples}
      />

      <StorageNodeModal
        isOpen={isAddStorageNodeOpen}
        onClose={() => setIsAddStorageNodeOpen(false)}
        onNodeSaved={() => setRefreshKey(k => k + 1)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
