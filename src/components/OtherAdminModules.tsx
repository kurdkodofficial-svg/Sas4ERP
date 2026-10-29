import React, { useState } from 'react';
import {
  Users,
  Truck,
  FolderArchive,
  Cpu,
  Crown,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Search,
  Filter,
  DollarSign,
  ShieldCheck,
  Server,
  Camera,
  FileCheck2,
  FileText
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { useLanguage } from '../context/LanguageContext';

// 1. Owner Approvals Dedicated View
export const OwnerApprovalsView: React.FC = () => {
  const { holding, purchaseOrders, companies, projects, approvePurchaseByOwner, rejectPurchaseByOwner } = useERP();
  const { t, language } = useLanguage();

  const pendingPOs = purchaseOrders.filter(p => p.status === 'PENDING_OWNER_APPROVAL');
  const pastPOs = purchaseOrders.filter(p => p.status !== 'PENDING_OWNER_APPROVAL');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white border border-amber-300 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 border border-amber-200 flex items-center justify-center font-bold">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {t('navOwnerApprovals')}
            </h1>
            <p className="text-xs text-slate-500">
              {t('holdingOwnerRuleBanner')}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-base font-extrabold text-amber-800 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-600" />
          <span>Awaiting Chairman Signature ({pendingPOs.length})</span>
        </h2>

        {pendingPOs.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-8 text-center text-slate-500 space-y-2 shadow-xs">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No Pending Approvals!</h3>
            <p className="text-xs">All subsidiary requisitions have been processed and authorized by the holding owner.</p>
          </div>
        ) : (
          pendingPOs.map((po) => {
            const comp = companies.find(c => c.id === po.companyId);
            return (
              <div
                key={po.id}
                className="bg-white border border-amber-300 rounded-3xl p-6 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <span className="font-mono text-base font-extrabold text-slate-900">{po.poNumber}</span>
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-semibold">
                      {comp?.name}
                    </span>
                  </div>
                  <span className="text-lg font-extrabold text-emerald-600 font-mono">
                    ${po.totalAmountUSD.toLocaleString()} {po.currency}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
                  <div>
                    <span className="text-slate-400 block font-medium">Vendor & Requester:</span>
                    <span className="font-bold text-slate-900">{po.supplierName}</span>
                    <p className="text-slate-500 mt-0.5">Requested by {po.requestedBy} ({po.requesterRole})</p>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Operational Reason:</span>
                    <p className="italic text-slate-700 mt-0.5">"{po.purpose}"</p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => rejectPurchaseByOwner(po.id, `Rejected by ${holding.chairmanName || 'Holding Chairman'}`)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition cursor-pointer"
                  >
                    Reject Order
                  </button>
                  <button
                    onClick={() => approvePurchaseByOwner(po.id, `Approved by ${holding.chairmanName || 'Holding Chairman'}`)}
                    className="px-6 py-2 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Authorize & Sign Purchase</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// 2. HR & Payroll View
export const HrPayrollView: React.FC = () => {
  const { employees, companies } = useERP();
  const { t } = useLanguage();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>{t('navHrPayroll')}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Holding personnel, corporate payroll, and executive rosters.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Employee</th>
              <th className="py-3 px-4">Role / Title</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Nationality</th>
              <th className="py-3 px-4 text-right">Monthly Salary</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-slate-50/70">
                <td className="py-3.5 px-4 font-bold text-slate-900">{emp.fullName}</td>
                <td className="py-3.5 px-4 text-slate-700">{emp.jobTitle}</td>
                <td className="py-3.5 px-4 text-slate-500">{emp.department}</td>
                <td className="py-3.5 px-4 text-slate-700">{emp.nationality}</td>
                <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600">${emp.salaryUSD.toLocaleString()} USD</td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                    {emp.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 3. Dispatch & Logistics
export const DispatchLogisticsView: React.FC = () => {
  const { dispatchShipments } = useERP();
  const { t } = useLanguage();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
        <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
          <Truck className="w-5 h-5 text-blue-600" />
          <span>{t('navDispatchLogistics')}</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">Outbound product dispatching, commercial waybills, and fleet trucks.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dispatchShipments.map((shipment) => (
          <div key={shipment.id} className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-mono font-bold text-blue-600">{shipment.shipmentNumber}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {shipment.status.replace(/_/g, ' ')}
              </span>
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">{shipment.materialDescription}</h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <div>
                <span className="text-slate-400 block text-[11px]">Destination:</span>
                <p className="font-bold text-slate-900">{shipment.destination}</p>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Driver & Truck:</span>
                <p className="font-bold text-slate-900">{shipment.driverName} ({shipment.vehiclePlate})</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 4. Document Archive
export const DocArchiveView: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
        <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
          <FolderArchive className="w-5 h-5 text-purple-600" />
          <span>{t('navDocArchive')} & Engineering Blueprints</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">ISO certifications, master contracts, land titles, and CAD drawings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {['Skyline Towers Architectural CAD v4', 'Ministry of Natural Resources Refinery License', 'ISO 9001:2025 Quality Certification', 'SAS Holding Corporate Articles of Association'].map((doc, idx) => (
          <div key={idx} className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-2 hover:border-blue-400 transition cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">{doc}</h3>
            <span className="text-[10px] text-slate-400 block font-medium">Digitally Signed & Encrypted PDF</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// 5. IT Systems & CCTV Security
export const ItSystemsView: React.FC = () => {
  const { itAssets } = useERP();
  const { t } = useLanguage();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
        <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-blue-600" />
          <span>{t('navItSystems')} & CCTV Surveillance</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">Central servers, high-availability firewalls, ERP databases, and optical gate cameras.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {itAssets.map((asset) => (
          <div key={asset.id} className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">{asset.assetType}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {asset.status}
              </span>
            </div>
            <h3 className="font-extrabold text-slate-900 text-sm">{asset.assetName}</h3>
            <span className="text-xs font-mono text-blue-600 block font-semibold">{asset.ipAddress}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
