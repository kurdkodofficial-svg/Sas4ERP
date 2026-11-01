import React, { useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Crown,
  CheckCircle2,
  XCircle,
  Clock,
  ScanLine,
  Filter,
  Search,
  Sparkles,
  ShieldCheck,
  Building2,
  FileText,
  AlertTriangle,
  Trash2,
  PenTool,
  ChevronRight
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { useLanguage } from '../context/LanguageContext';
import { PurchaseOrder, PurchaseItem } from '../types/erp';
import { RequestApprovalJourneyModal } from './workflow/RequestApprovalJourneyModal';

export const ProcurementModule: React.FC = () => {
  const {
    purchaseOrders,
    companies,
    projects,
    addPurchaseOrder,
    deletePurchaseOrder,
    approvePurchaseByOwner,
    rejectPurchaseByOwner,
    currentUser,
    selectedCompanyId,
  } = useERP();

  const { t, language } = useLanguage();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [supplierName, setSupplierName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [targetCompanyId, setTargetCompanyId] = useState(companies[0]?.id || 'comp-1');
  const [targetProjectId, setTargetProjectId] = useState(projects[0]?.id || 'proj-101');
  const [items, setItems] = useState<{ name: string; quantity: number; unit: string; unitPriceUSD: number }[]>([
    { name: 'Reinforced Steel Bars 16mm', quantity: 20, unit: 'Tons', unitPriceUSD: 720 },
  ]);

  const [aiAuditResult, setAiAuditResult] = useState<string | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [trackingPo, setTrackingPo] = useState<PurchaseOrder | null>(null);

  const isHoldingApprover = currentUser.role === 'HOLDING_OWNER' || currentUser.role === 'SUPER_ADMIN';

  const filteredPOs = purchaseOrders.filter((po) => {
    // If subordinate has designated project or company
    if (currentUser.role === 'PROJECT_MANAGER' && currentUser.projectId && po.projectId !== currentUser.projectId) {
      return false;
    }
    if (currentUser.role === 'COMPANY_GM' && currentUser.companyId && po.companyId !== currentUser.companyId) {
      return false;
    }
    if (selectedCompanyId !== 'ALL' && po.companyId !== selectedCompanyId) return false;
    if (filterStatus !== 'ALL' && po.status !== filterStatus) return false;
    return true;
  });

  const handleAddItemRow = () => {
    setItems(prev => [...prev, { name: '', quantity: 1, unit: 'Units', unitPriceUSD: 100 }]);
  };

  const handleUpdateItem = (index: number, field: string, value: any) => {
    setItems(prev => prev.map((item, idx) => idx === index ? { ...item, [field]: value } : item));
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(prev => prev.filter((_, idx) => idx !== index));
    }
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPriceUSD), 0);
  };

  const handleSubmitPO = (e: React.FormEvent) => {
    e.preventDefault();
    const purchaseItems: PurchaseItem[] = items.map((it, idx) => ({
      id: `it-${idx}`,
      name: it.name,
      quantity: Number(it.quantity),
      unit: it.unit,
      unitPriceUSD: Number(it.unitPriceUSD),
      totalUSD: Number(it.quantity) * Number(it.unitPriceUSD),
      category: 'General Supplies',
    }));

    const total = calculateTotal();

    addPurchaseOrder({
      companyId: targetCompanyId,
      projectId: targetProjectId,
      requestedBy: currentUser.name,
      requesterRole: currentUser.title,
      supplierName,
      items: purchaseItems,
      subtotalUSD: total,
      taxUSD: 0,
      totalAmountUSD: total,
      currency: 'USD',
      purpose,
      originalLanguage: currentUser.nativeLanguage,
    });

    setIsCreateModalOpen(false);
    setSupplierName('');
    setPurpose('');
  };

  const handleAiAudit = (po: PurchaseOrder) => {
    setIsAuditing(true);
    setTimeout(() => {
      setAiAuditResult(
        `AI Compliance Audit for ${po.poNumber}:\n• Total: $${po.totalAmountUSD.toLocaleString()} USD.\n• Budget Verification: Passed within subsidiary annual allocation.\n• Holding Owner Authorization: STRICT REQUIREMENT before gate release.\n• Supplier Reputation: Verified in KRG Trade Registry.`
      );
      setIsAuditing(false);
    }, 900);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <ShoppingCart className="w-4 h-4 text-blue-600" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {t('navProcurement')} & Supply Chain
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Centralized purchase requisitions with strict Holding Owner digital pre-approval gate.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition transform active:scale-95 cursor-pointer"
            id="create-po-btn"
          >
            <Plus className="w-4 h-4" />
            <span>{t('createPurchaseOrder')}</span>
          </button>
        </div>
      </div>

      {/* Holding Rule Mandatory Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 text-amber-900 text-xs font-medium">
        <Crown className="w-5 h-5 text-amber-600 shrink-0" />
        <span>{t('holdingOwnerRuleBanner')}</span>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['ALL', 'PENDING_OWNER_APPROVAL', 'APPROVED_BY_OWNER', 'ARRIVED_AT_GATE'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              filterStatus === st
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
            }`}
          >
            {st === 'ALL' ? 'All Requisitions' : st.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* PO Cards Grid */}
      <div className="space-y-4">
        {filteredPOs.map((po) => {
          const comp = companies.find(c => c.id === po.companyId);
          const proj = projects.find(p => p.id === po.projectId);
          const isPending = po.status === 'PENDING_OWNER_APPROVAL';
          const isApproved = po.status === 'APPROVED_BY_OWNER';
          const isArrived = po.status === 'ARRIVED_AT_GATE' || po.status === 'INSPECTED_AND_STORED';

          return (
            <div
              key={po.id}
              className={`bg-white border rounded-3xl p-6 shadow-xs space-y-4 transition ${
                isPending ? 'border-amber-300 ring-1 ring-amber-200 bg-amber-50/20' : isApproved ? 'border-blue-200' : 'border-slate-200/80'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-base text-slate-900 font-mono">{po.poNumber}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
                    {comp?.name || 'Subsidiary'}
                  </span>
                  {proj && (
                    <span className="text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium border border-indigo-200">
                      {proj.name}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-emerald-600 font-mono">
                    ${po.totalAmountUSD.toLocaleString()} {po.currency}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                    isPending ? 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse-subtle' :
                    isApproved ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                    isArrived ? 'bg-blue-50 text-blue-800 border-blue-200' :
                    'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {po.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Items & Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
                <div>
                  <span className="text-slate-400 font-semibold block">Supplier:</span>
                  <span className="font-bold text-slate-900 text-sm">{po.supplierName}</span>
                  <span className="text-slate-500 block mt-1">Requested by: {po.requestedBy} ({po.requesterRole})</span>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold block">Purpose / Justification:</span>
                  <p className="text-slate-700 italic mt-0.5 leading-relaxed">"{po.purpose}"</p>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold block">Items Summary:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600 mt-1">
                    {po.items.map((it, idx) => (
                      <li key={idx} className="truncate">
                        {it.quantity} {it.unit} • {it.name} (${it.totalUSD.toLocaleString()})
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Holding Owner Decision Stamp or Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  {po.holdingApproval ? (
                    <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl font-medium">
                      <Crown className="w-4 h-4 text-amber-600" />
                      <span>Approved by <strong>{po.holdingApproval.approvedBy}</strong> ({po.holdingApproval.approvedAt})</span>
                      <span className="font-mono text-[10px] text-slate-500">[{po.holdingApproval.signatureHash}]</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl font-medium">
                      <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                      <span>
                        {language === 'ku'
                          ? `گەیشتۆتە لای: ${po.workflowState?.steps?.find(s => s.status === 'PENDING')?.titleKu || 'خاوەنی هۆڵدینگ (سەرۆکایەتی)'}`
                          : `Currently with: ${po.workflowState?.steps?.find(s => s.status === 'PENDING')?.titleEn || 'Holding Owner Signature'}`}
                      </span>
                    </div>
                  )}

                  <button
                    onClick={() => setTrackingPo(po)}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto shadow-2xs"
                  >
                    <PenTool className="w-3.5 h-3.5 text-blue-600" />
                    <span>{language === 'ku' ? 'چاودێری واژۆ و مۆرەکان' : 'Track Approval Journey'}</span>
                    <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </button>
                </div>

                {/* Owner Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAiAudit(po)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>AI Audit</span>
                  </button>

                  {isPending && isHoldingApprover && (
                    <>
                      <button
                        onClick={() => approvePurchaseByOwner(po.id, 'Holding Owner Approved')}
                        className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{t('approvePurchase')}</span>
                      </button>
                      <button
                        onClick={() => rejectPurchaseByOwner(po.id, 'Holding Owner Rejected')}
                        className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>{t('rejectPurchase')}</span>
                      </button>
                    </>
                  )}

                  {isPending && !isHoldingApprover && (
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
                      {language === 'ku' ? '🔒 چاوەڕوانی واژۆی سەرەوەیە' : '🔒 Awaiting Upper Sign-off'}
                    </span>
                  )}

                  {isHoldingApprover && (
                    <button
                      type="button"
                      onClick={() => deletePurchaseOrder(po.id)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="سڕینەوەی ئەم داواکارییە (Delete PO)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* AI Audit Dialog */}
              {aiAuditResult && (
                <div className="bg-slate-50 rounded-2xl p-4 text-xs font-mono text-slate-800 border border-blue-200 whitespace-pre-line leading-relaxed">
                  {aiAuditResult}
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Create PO Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900">Create Purchase Requisition</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleSubmitPO} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Subsidiary</label>
                  <select
                    value={targetCompanyId}
                    onChange={(e) => setTargetCompanyId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none"
                  >
                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Project</label>
                  <select
                    value={targetProjectId}
                    onChange={(e) => setTargetProjectId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none"
                  >
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Supplier / Vendor Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Al-Bayan Industrial Supplies Ltd"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Purpose / Justification</label>
                <textarea
                  rows={2}
                  required
                  placeholder="State the operational reason for this procurement..."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none"
                />
              </div>

              {/* Items Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Items & Materials</span>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                  >
                    + Add Item
                  </button>
                </div>

                {items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2">
                    <input
                      type="text"
                      placeholder="Item name"
                      value={item.name}
                      onChange={(e) => handleUpdateItem(idx, 'name', e.target.value)}
                      className="col-span-5 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-2.5 py-1.5 text-xs focus:bg-white focus:outline-none"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleUpdateItem(idx, 'quantity', Number(e.target.value))}
                      className="col-span-2 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-2 py-1.5 text-xs focus:bg-white focus:outline-none"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Unit"
                      value={item.unit}
                      onChange={(e) => handleUpdateItem(idx, 'unit', e.target.value)}
                      className="col-span-2 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-2 py-1.5 text-xs focus:bg-white focus:outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Price $"
                      value={item.unitPriceUSD}
                      onChange={(e) => handleUpdateItem(idx, 'unitPriceUSD', Number(e.target.value))}
                      className="col-span-2 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-2 py-1.5 text-xs font-mono focus:bg-white focus:outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="col-span-1 text-rose-500 hover:text-rose-700 text-xs font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="text-sm font-extrabold text-emerald-600 font-mono">
                  Total: ${calculateTotal().toLocaleString()} USD
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer"
                  >
                    Submit for Holding Owner Approval
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Approval Journey Modal */}
      <RequestApprovalJourneyModal
        isOpen={Boolean(trackingPo)}
        onClose={() => setTrackingPo(null)}
        purchaseOrder={trackingPo}
      />
    </div>
  );
};
