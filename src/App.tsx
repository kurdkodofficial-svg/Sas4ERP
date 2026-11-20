import React from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { ERPProvider, useERP } from './context/ERPContext';
import { EntryLicenseVerificationGate } from './components/EntryLicenseVerificationGate';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { HoldingOwnerDashboard } from './components/HoldingOwnerDashboard';
import { GateScannerModal } from './components/GateScannerModal';
import { CallManagerModal } from './components/CallManagerModal';
import { HoldingSetupModal } from './components/HoldingSetupModal';
import { LegacyDataImportModal } from './components/LegacyDataImportModal';
import { SkylineBackground } from './components/common/SkylineBackground';
import { SkylineBackgroundModal } from './components/common/SkylineBackgroundModal';
import { OfflineStatusIndicator } from './components/common/OfflineStatusIndicator';
import { VirtualMeetingHub } from './components/VirtualMeetingHub';
import { DirectCommsModule } from './components/DirectCommsModule';
import { ProcurementModule } from './components/ProcurementModule';
import { FinanceModule } from './components/FinanceModule';
import { ForeignWorkersModule } from './components/ForeignWorkersModule';
import { AccommodationModule } from './components/AccommodationModule';
import { HseFireSecurityModule } from './components/HseFireSecurityModule';
import { TechnicalElectricalModule } from './components/TechnicalElectricalModule';
import { CorrespondenceModule } from './components/CorrespondenceModule';
import { WarehouseModule } from './components/WarehouseModule';
import { CompaniesProjectsModule } from './components/CompaniesProjectsModule';
import { ProjectReportsModule } from './components/ProjectReportsModule';
import { AnomalyDetectionModule } from './components/AnomalyDetectionModule';
import { ApprovalWorkflowEngineModule } from './components/ApprovalWorkflowEngineModule';
import {
  OwnerApprovalsView,
  HrPayrollView,
  DispatchLogisticsView,
  DocArchiveView,
  ItSystemsView
} from './components/OtherAdminModules';
import { UserRolesManagementModal } from './components/UserRolesManagementModal';
import { VendorLicenseHubModule } from './components/VendorLicenseHubModule';
import { LicenseActivationModal } from './components/LicenseActivationModal';
import { hasModuleAccess, ALL_SYSTEM_MODULES } from './utils/rbacPermissions';
import { useLanguage } from './context/LanguageContext';

const MainContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    isLicenseModalOpen,
    setIsLicenseModalOpen,
    systemLicense,
    setSystemLicense,
    licenseModalInitialTab
  } = useERP();
  const { language } = useLanguage();

  const isAuthorized = hasModuleAccess(currentUser, activeTab);

  const renderActiveView = () => {
    if (!isAuthorized) {
      return (
        <div className="max-w-lg mx-auto my-16 p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-4">
          <h2 className="text-lg font-bold text-slate-900">
            {language === 'ku'
              ? 'ئەم بەشە بۆ ڕۆڵەکەت سنووردارکراوە'
              : 'Access Restricted for Your Role'}
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            {language === 'ku'
              ? `هەژمارەکەت (${currentUser.name}) دەسەڵاتی بینینی ئەم بەشەی نییە. بەڕێوەبەری IT یان خاوەنی هۆڵدینگ دەتوانێت لە بەشی دەسەڵاتەکان مۆڵەتت پێ بدات.`
              : `Your account (${currentUser.name}) does not have access to this module. Contact your Holding Owner or IT Administrator.`}
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                if (hasModuleAccess(currentUser, 'holding-dashboard')) {
                  setActiveTab('holding-dashboard');
                } else if (hasModuleAccess(currentUser, 'procurement')) {
                  setActiveTab('procurement');
                } else {
                  const firstAllowed = ALL_SYSTEM_MODULES.find(m => hasModuleAccess(currentUser, m.id));
                  if (firstAllowed) setActiveTab(firstAllowed.id);
                }
              }}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition cursor-pointer"
            >
              {language === 'ku' ? 'گەڕانەوە بۆ بەشە ڕێگەپێدراوەکانت' : 'Go to Authorized Module'}
            </button>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'holding-dashboard':
        return <HoldingOwnerDashboard />;
      case 'vendor-license-hub':
        return <VendorLicenseHubModule />;
      case 'ml-anomaly-detection':
        return <AnomalyDetectionModule />;
      case 'owner-approvals':
        return <ApprovalWorkflowEngineModule />;
      case 'virtual-meetings':
        return <VirtualMeetingHub />;
      case 'kelegram':
      case 'direct-comms':
        return <DirectCommsModule />;
      case 'companies-projects':
        return <CompaniesProjectsModule />;
      case 'project-reports':
        return <ProjectReportsModule />;
      case 'gate-scanner':
        return <WarehouseModule />;
      case 'procurement':
        return <ProcurementModule />;
      case 'finance':
        return <FinanceModule />;
      case 'warehouse':
        return <WarehouseModule />;
      case 'dispatch-logistics':
        return <DispatchLogisticsView />;
      case 'technical-electrical':
        return <TechnicalElectricalModule />;
      case 'camps-accommodation':
        return <AccommodationModule />;
      case 'hse-fire-security':
        return <HseFireSecurityModule />;
      case 'foreign-workers':
        return <ForeignWorkersModule />;
      case 'hr-payroll':
        return <HrPayrollView />;
      case 'correspondence':
        return <CorrespondenceModule />;
      case 'doc-archive':
        return <DocArchiveView />;
      case 'it-systems':
        return <ItSystemsView />;
      default:
        return <HoldingOwnerDashboard />;
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-slate-900 selection:text-white">
      <SkylineBackground />
      <Header />

      <div className="flex-1 flex overflow-hidden relative z-10">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Modals */}
      <GateScannerModal />
      <CallManagerModal />
      <HoldingSetupModal />
      <LegacyDataImportModal />
      <SkylineBackgroundModal />
      <UserRolesManagementModal />

      {/* Global System License & Hardware Lock Activation Modal */}
      <LicenseActivationModal
        isOpen={isLicenseModalOpen}
        onClose={() => setIsLicenseModalOpen(false)}
        license={systemLicense}
        onLicenseUpdated={(updated) => setSystemLicense(updated)}
        defaultMode={licenseModalInitialTab}
      />

      {/* PWA Offline Mode Toast & Indicator */}
      <OfflineStatusIndicator />
    </div>
  );
};

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; errorMessage: string }
> {
  declare state: { hasError: boolean; errorMessage: string };
  declare props: { children: React.ReactNode };

  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMessage: error?.message || 'Unexpected application error' };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="text-3xl">🛡️</div>
            <h2 className="text-lg font-black">SAS4ERP Recovery Mode</h2>
            <p className="text-xs text-slate-400 font-mono break-words">{this.state.errorMessage}</p>
            <button
              onClick={() => {
                try {
                  localStorage.removeItem('sas4erp_owner_dashboard_config');
                } catch {}
                window.location.reload();
              }}
              className="px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs cursor-pointer"
            >
              دووبارە بارکردنەوە / Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function App() {
  return (
    <AppErrorBoundary>
      <LanguageProvider>
        <ERPProvider>
          <EntryLicenseVerificationGate>
            <MainContent />
          </EntryLicenseVerificationGate>
        </ERPProvider>
      </LanguageProvider>
    </AppErrorBoundary>
  );
}

export default App;
