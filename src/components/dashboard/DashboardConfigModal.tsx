import React from 'react';
import {
  Settings,
  X,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Sliders,
  Check,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Building2,
  Briefcase,
  AlertTriangle,
  Users,
  ScanLine
} from 'lucide-react';
import {
  DashboardSettings,
  ExecutiveFocusPreset,
  WidgetId,
  MacroKpiId,
  availableWidgetsList,
  defaultDashboardSettings
} from '../../types/dashboardConfig';
import { useLanguage } from '../../context/LanguageContext';

interface DashboardConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: DashboardSettings;
  onSaveSettings: (newSettings: DashboardSettings) => void;
}

export const DashboardConfigModal: React.FC<DashboardConfigModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const { t } = useLanguage();
  const [localSettings, setLocalSettings] = React.useState<DashboardSettings>(settings);

  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleToggleWidget = (id: WidgetId) => {
    setLocalSettings(prev => {
      const isVisible = prev.visibleWidgets.includes(id);
      const updated = isVisible
        ? prev.visibleWidgets.filter(w => w !== id)
        : [...prev.visibleWidgets, id];
      return { ...prev, visibleWidgets: updated };
    });
  };

  const handleMoveWidget = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...localSettings.widgetOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;

    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;

    setLocalSettings(prev => ({ ...prev, widgetOrder: newOrder }));
  };

  const handlePresetChange = (preset: ExecutiveFocusPreset) => {
    if (preset === 'ALL') {
      setLocalSettings(prev => ({
        ...prev,
        preset: 'ALL',
        visibleWidgets: defaultDashboardSettings.visibleWidgets,
        selectedMacroKpis: ['total_budget', 'total_spent', 'total_workforce', 'pending_pos']
      }));
    } else if (preset === 'FINANCE') {
      setLocalSettings(prev => ({
        ...prev,
        preset: 'FINANCE',
        visibleWidgets: ['macro_kpis', 'kpi_overview', 'pending_approvals', 'financial_summary', 'subsidiary_matrix', 'recent_activities'],
        selectedMacroKpis: ['total_budget', 'total_spent', 'revenue_runway', 'pending_pos']
      }));
    } else if (preset === 'PROJECTS') {
      setLocalSettings(prev => ({
        ...prev,
        preset: 'PROJECTS',
        visibleWidgets: ['macro_kpis', 'kpi_overview', 'projects_radar', 'subsidiary_matrix', 'directors_directory', 'recent_activities'],
        selectedMacroKpis: ['active_projects', 'total_workforce', 'total_spent', 'gate_deliveries']
      }));
    } else if (preset === 'RISK') {
      setLocalSettings(prev => ({
        ...prev,
        preset: 'RISK',
        visibleWidgets: ['macro_kpis', 'kpi_overview', 'risk_compliance', 'pending_approvals', 'recent_activities', 'directors_directory'],
        selectedMacroKpis: ['iqama_risk', 'pending_pos', 'gate_deliveries', 'total_workforce']
      }));
    }
  };

  const handleToggleKpi = (kpiId: MacroKpiId) => {
    setLocalSettings(prev => {
      const exists = prev.selectedMacroKpis.includes(kpiId);
      let updated: MacroKpiId[];
      if (exists) {
        if (prev.selectedMacroKpis.length <= 2) return prev; // Keep at least 2
        updated = prev.selectedMacroKpis.filter(k => k !== kpiId);
      } else {
        if (prev.selectedMacroKpis.length >= 4) {
          // Replace last one or max 4
          updated = [...prev.selectedMacroKpis.slice(1), kpiId];
        } else {
          updated = [...prev.selectedMacroKpis, kpiId];
        }
      }
      return { ...prev, selectedMacroKpis: updated };
    });
  };

  const handleResetDefaults = () => {
    setLocalSettings(defaultDashboardSettings);
  };

  const handleSave = () => {
    onSaveSettings(localSettings);
    onClose();
  };

  const allKpisList: { id: MacroKpiId; label: string; desc: string; icon: any }[] = [
    { id: 'total_budget', label: 'Total Holding Budget', desc: 'Annual budget across all 4 subsidiaries ($45M)', icon: DollarSign },
    { id: 'total_spent', label: 'Total Expenditure', desc: 'Cumulative capital & operational spend', icon: TrendingUp },
    { id: 'revenue_runway', label: 'Net Group Revenue', desc: 'Gross collected revenue vs expenses', icon: Briefcase },
    { id: 'total_workforce', label: 'Total Workforce Headcount', desc: 'Active staff, engineers & foreign specialists', icon: Users },
    { id: 'pending_pos', label: 'Pending Owner Approvals', desc: 'Purchase orders waiting for holding signature', icon: CheckCircle2 },
    { id: 'active_projects', label: 'Active Projects Health', desc: 'Group project delivery progress & count', icon: Building2 },
    { id: 'iqama_risk', label: 'Expiring Iqamas & Visas', desc: 'Foreign specialist residence renewals', icon: AlertTriangle },
    { id: 'gate_deliveries', label: 'Gate Inbound Scans', desc: 'Verified commercial truck entry receipts', icon: ScanLine },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                {t('customizeDashboard')}
              </h2>
              <p className="text-xs text-slate-500">
                Configure widget order, visibility, executive focus presets, and primary metrics.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Executive Focus Presets */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            {t('executiveFocus')} (Quick Presets)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => handlePresetChange('ALL')}
              className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                localSettings.preset === 'ALL'
                  ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-1 ring-blue-600'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <span className="text-xs font-bold block">{t('presetAll')}</span>
              <span className="text-[10px] text-slate-500 mt-1">All modules & feeds</span>
            </button>

            <button
              type="button"
              onClick={() => handlePresetChange('FINANCE')}
              className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                localSettings.preset === 'FINANCE'
                  ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-1 ring-blue-600'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <span className="text-xs font-bold block">{t('presetFinance')}</span>
              <span className="text-[10px] text-slate-500 mt-1">Budgets, POs & Runway</span>
            </button>

            <button
              type="button"
              onClick={() => handlePresetChange('PROJECTS')}
              className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                localSettings.preset === 'PROJECTS'
                  ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-1 ring-blue-600'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <span className="text-xs font-bold block">{t('presetProjects')}</span>
              <span className="text-[10px] text-slate-500 mt-1">Milestones & Delivery</span>
            </button>

            <button
              type="button"
              onClick={() => handlePresetChange('RISK')}
              className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                localSettings.preset === 'RISK'
                  ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-1 ring-blue-600'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <span className="text-xs font-bold block">{t('presetRisk')}</span>
              <span className="text-[10px] text-slate-500 mt-1">Iqama & HSE Safety</span>
            </button>
          </div>
        </div>

        {/* Macro KPI Selector (Pick up to 4) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Primary Macro KPI Cards (Choose up to 4)
            </label>
            <span className="text-[11px] font-semibold text-blue-600">
              {localSettings.selectedMacroKpis.length}/4 Selected
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {allKpisList.map(kpi => {
              const isSelected = localSettings.selectedMacroKpis.includes(kpi.id);
              const Icon = kpi.icon;
              return (
                <button
                  key={kpi.id}
                  type="button"
                  onClick={() => handleToggleKpi(kpi.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between text-left transition cursor-pointer ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/50 text-slate-900'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold block text-slate-900">{kpi.label}</span>
                      <span className="text-[10px] text-slate-500">{kpi.desc}</span>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                    isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                  }`}>
                    {isSelected && <Check className="w-3 h-3" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Widget Order & Visibility Customizer */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            Dashboard Widgets Arrangement & Visibility
          </label>
          <div className="space-y-2 border border-slate-200 rounded-2xl p-3 bg-slate-50/50">
            {localSettings.widgetOrder.map((widgetId, index) => {
              const widgetMeta = availableWidgetsList.find(w => w.id === widgetId);
              if (!widgetMeta) return null;
              const isVisible = localSettings.visibleWidgets.includes(widgetId);

              return (
                <div
                  key={widgetId}
                  className={`flex items-center justify-between p-3 rounded-xl border transition ${
                    isVisible
                      ? 'bg-white border-slate-200 shadow-2xs'
                      : 'bg-slate-100/70 border-slate-200/60 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleWidget(widgetId)}
                      className={`p-1.5 rounded-lg border transition cursor-pointer ${
                        isVisible
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-200 text-slate-500 border-slate-300'
                      }`}
                      title={isVisible ? 'Hide Widget' : 'Show Widget'}
                    >
                      {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{widgetMeta.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                          {widgetMeta.category}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 block">{widgetMeta.desc}</span>
                    </div>
                  </div>

                  {/* Move Up / Down */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveWidget(index, 'up')}
                      className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={index === localSettings.widgetOrder.length - 1}
                      onClick={() => handleMoveWidget(index, 'down')}
                      className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Standard Layout</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
            >
              {t('cancel')}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition transform active:scale-95 cursor-pointer"
            >
              {t('save')}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
