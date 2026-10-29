import React from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { ERPProvider, useERP } from './context/ERPContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { HoldingOwnerDashboard } from './components/HoldingOwnerDashboard';
import { GateScannerModal } from './components/GateScannerModal';
import { CallManagerModal } from './components/CallManagerModal';
import { HoldingSetupModal } from './components/HoldingSetupModal';
import { LegacyDataImportModal } from './components/LegacyDataImportModal';
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

const MainContent: React.FC = () => {
  const { activeTab, isGateScannerOpen, isCallModalOpen, isHoldingSetupOpen } = useERP();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'holding-dashboard':
        return <HoldingOwnerDashboard />;
      case 'ml-anomaly-detection':
        return <AnomalyDetectionModule />;
      case 'owner-approvals':
        return <ApprovalWorkflowEngineModule />;
      case 'virtual-meetings':
        return <VirtualMeetingHub />;
      case 'direct-comms':
        return <DirectCommsModule />;
      case 'companies-projects':
        return <CompaniesProjectsModule />;
      case 'project-reports':
        return <ProjectReportsModule />;
      case 'gate-scanner':
        return <WarehouseModule />; // Also opens GateScannerModal directly
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
    <div className="min-h-screen bg-[#F4F7FA] text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navigation Bar */}
      <Header />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-[1700px] mx-auto w-full">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Modals */}
      <GateScannerModal />
      <CallManagerModal />
      <HoldingSetupModal />
      <LegacyDataImportModal />
    </div>
  );
};

export function App() {
  return (
    <LanguageProvider>
      <ERPProvider>
        <MainContent />
      </ERPProvider>
    </LanguageProvider>
  );
}

export default App;
