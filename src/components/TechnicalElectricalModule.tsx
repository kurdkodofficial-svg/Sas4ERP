import React, { useState } from 'react';
import {
  Zap,
  Plus,
  Activity,
  Fuel,
  Clock,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { useLanguage } from '../context/LanguageContext';
import { TechnicalMaintenance } from '../types/erp';

export const TechnicalElectricalModule: React.FC = () => {
  const { technicalEquipments, addTechnicalEquipment, updateTechnicalEquipment, companies, projects } = useERP();
  const { t, language } = useLanguage();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [equipmentName, setEquipmentName] = useState('');
  const [equipmentType, setEquipmentType] = useState<'POWER_GENERATOR' | 'ELECTRICAL_TRANSFORMER' | 'HEAVY_MACHINERY' | 'HVAC_CENTRAL'>('POWER_GENERATOR');
  const [fuelLevel, setFuelLevel] = useState(85);
  const [runningHours, setRunningHours] = useState(1200);

  const handleAddEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    addTechnicalEquipment({
      equipmentName,
      equipmentType,
      companyId: companies[0]?.id || 'comp-1',
      projectId: 'proj-101',
      serialNumber: `EQ-SAS-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'OPERATIONAL',
      runningHours: Number(runningHours),
      fuelLevelPercent: Number(fuelLevel),
      lastServiceDate: new Date().toISOString().split('T')[0],
      nextServiceDate: '2026-10-15',
      technicianInCharge: 'Eng. Ako Salih (Chief Electrical)',
      notes: 'All phase loads balanced. Oil pressure within nominal range.',
    });
    setIsAddOpen(false);
    setEquipmentName('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Zap className="w-4 h-4 text-amber-600" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {t('navTechnicalElectrical')} & Generators
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Diesel power generators, high-voltage transformers, heavy plant machinery, fuel levels, and maintenance schedules.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition transform active:scale-95 cursor-pointer"
          id="add-technical-equipment-btn"
        >
          <Plus className="w-4 h-4" />
          <span>Register Machinery / Generator</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {technicalEquipments.map((eq) => {
          const isOperational = eq.status === 'OPERATIONAL';
          const isDue = eq.status === 'MAINTENANCE_DUE';

          return (
            <div
              key={eq.id}
              className="bg-white border border-slate-200/80 hover:border-blue-300 rounded-3xl p-5 shadow-xs space-y-4 transition"
            >
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                    {eq.equipmentType.replace(/_/g, ' ')}
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-base mt-1.5">{eq.equipmentName}</h3>
                  <span className="text-xs font-mono text-slate-500">{eq.serialNumber}</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isOperational ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {eq.status.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Fuel Level if Generator */}
              {eq.fuelLevelPercent !== undefined && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Fuel className="w-3.5 h-3.5 text-amber-600" /> Fuel Reserve
                    </span>
                    <span className="font-bold text-slate-900 font-mono">{eq.fuelLevelPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                    <div
                      className={`h-full rounded-full ${eq.fuelLevelPercent < 30 ? 'bg-rose-500' : 'bg-amber-500'}`}
                      style={{ width: `${eq.fuelLevelPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Hours & Service */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                <div>
                  <span className="text-slate-400 font-medium block">Running Hours:</span>
                  <span className="font-bold text-slate-900 font-mono">{eq.runningHours.toLocaleString()} Hrs</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Next Service:</span>
                  <span className="font-bold text-amber-600 font-mono">{eq.nextServiceDate}</span>
                </div>
              </div>

              <div className="text-xs text-slate-500">
                <strong className="text-slate-700 font-medium">Technician:</strong> {eq.technicianInCharge}
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                <button
                  onClick={() => updateTechnicalEquipment(eq.id, {
                    runningHours: eq.runningHours + 10,
                    fuelLevelPercent: Math.min(100, (eq.fuelLevelPercent || 80) + 15),
                  })}
                  className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Log Telemetry / Refuel</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Register Technical Equipment</h3>
            <form onSubmit={handleAddEquipment} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Equipment / Machinery Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Caterpillar 1500kVA Soundproof Generator"
                  value={equipmentName}
                  onChange={(e) => setEquipmentName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Equipment Category</label>
                <select
                  value={equipmentType}
                  onChange={(e: any) => setEquipmentType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none"
                >
                  <option value="POWER_GENERATOR">Power Generator</option>
                  <option value="ELECTRICAL_TRANSFORMER">Electrical Transformer</option>
                  <option value="HEAVY_MACHINERY">Heavy Machinery / Crane</option>
                  <option value="HVAC_CENTRAL">Central HVAC Unit</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fuel Level (%)</label>
                  <input
                    type="number"
                    value={fuelLevel}
                    onChange={(e) => setFuelLevel(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Running Hours</label>
                  <input
                    type="number"
                    value={runningHours}
                    onChange={(e) => setRunningHours(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer"
                >
                  Save Equipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
