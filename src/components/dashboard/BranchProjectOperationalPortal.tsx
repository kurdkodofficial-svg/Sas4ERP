import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Building2,
  FileText,
  Clock,
  CheckCircle2,
  Crown,
  Plus,
  Search,
  ChevronRight,
  User,
  ArrowRight,
  TrendingUp,
  Boxes,
  ScanLine,
  PenTool,
  Printer,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { useLanguage } from '../../context/LanguageContext';
import { PurchaseOrder } from '../../types/erp';
import { RequestApprovalJourneyModal } from '../workflow/RequestApprovalJourneyModal';

export const BranchProjectOperationalPortal: React.FC = () => {
  const {
    currentUser,
    companies,
    projects,
    purchaseOrders,
    gateLogs,
    warehouseItems,
    setActiveTab,
    openPrintManager
  } = useERP();

  const { language, isRtl } = useLanguage();

  const [selectedPoForTracking, setSelectedPoForTracking] = useState<PurchaseOrder | null>(null);
  const [filterQuery, setFilterQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED'>('ALL');

  // Identify assigned company & project for this subordinate
  const userCompany = companies.find(c => c.id === currentUser.companyId) || companies[0];
  const userProject = projects.find(p => p.id === currentUser.projectId) || projects[0];

  // Filter requests that belong to this user's branch / project or created by this user
  const branchPOs = purchaseOrders.filter(po => {
    // If user has specific project
    if (currentUser.projectId && po.projectId === currentUser.projectId) return true;
    // If user has specific company (GM)
    if (currentUser.companyId && po.companyId === currentUser.companyId) return true;
    // Or if requested by current user name
    if (po.requestedBy && currentUser.name && po.requestedBy.includes(currentUser.name.split(' ')[0])) return true;
    return false;
  });

  const displayPOs = branchPOs.filter(po => {
    if (statusFilter === 'PENDING' && po.status === 'APPROVED_BY_OWNER') return false;
    if (statusFilter === 'APPROVED' && po.status !== 'APPROVED_BY_OWNER') return false;
    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase();
      const matchNo = po.poNumber.toLowerCase().includes(q);
      const matchPurpose = po.purpose.toLowerCase().includes(q);
      const matchSupplier = po.supplierName.toLowerCase().includes(q);
      if (!matchNo && !matchPurpose && !matchSupplier) return false;
    }
    return true;
  });

  // Calculate local branch metrics
  const localGateLogs = gateLogs.filter(g => !currentUser.companyId || g.companyId === currentUser.companyId);
  const localItems = warehouseItems.filter(w => !currentUser.companyId || w.companyId === currentUser.companyId);

  // Helper to determine who currently holds the request
  const getRequestHolderInfo = (po: PurchaseOrder) => {
    const isApproved = po.status === 'APPROVED_BY_OWNER';
    if (isApproved) {
      return {
        holderEn: 'Approved by Holding Owner',
        holderKu: 'تەواو بوو (واژۆی خاوەنی هۆڵدینگ کراوە)',
        isFinal: true,
        remainingEn: 'All signatures complete',
        remainingKu: 'هیچ واژۆیەک نەماوە',
        stepColor: 'text-emerald-700 bg-emerald-50 border-emerald-200'
      };
    }

    const steps = po.workflowState?.steps;
    if (steps && steps.length > 0) {
      const pendingStep = steps.find(s => s.status === 'PENDING');
      const pendingRemaining = steps.filter(s => s.status === 'PENDING');

      if (pendingStep) {
        const remainingCount = pendingRemaining.length;
        return {
          holderEn: pendingStep.titleEn,
          holderKu: pendingStep.titleKu,
          isFinal: false,
          remainingEn: `${remainingCount} approver(s) remaining: ${pendingRemaining.map(s => s.role).join(' -> ')}`,
          remainingKu: `ماوە: ${pendingRemaining.map(s => s.titleKu).join(' ➔ ')}`,
          stepColor: pendingStep.role === 'HOLDING_OWNER'
            ? 'text-amber-800 bg-amber-50 border-amber-300'
            : 'text-blue-800 bg-blue-50 border-blue-200'
        };
      }
    }

    // Default fallback
    return {
      holderEn: 'Awaiting Holding Owner Signature',
      holderKu: 'گەیشتۆتە لای: خاوەنی هۆڵدینگ (سەرۆکایەتی)',
      isFinal: false,
      remainingEn: 'Holding Owner final sign-off',
      remainingKu: 'ماوە: واژۆی کۆتایی خاوەنی هۆڵدینگ',
      stepColor: 'text-amber-800 bg-amber-50 border-amber-300'
    };
  };

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="space-y-6">
      {/* Information Boundary Notice (پابەندبوون بە پاراستنی نهێنییەکانی سەرەوە) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white border border-slate-700/80 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0 shadow-inner">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-300 border border-blue-400/30">
                  {currentUser.role}
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  {language === 'ku' ? 'لق بەستراوەتەوە بە سێرڤەری هۆڵدینگ' : 'Linked to Holding Hub'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
                {language === 'ku'
                  ? `پۆرتاڵی مەیدانی لق و پڕۆژە: ${userCompany?.name || 'کۆمپانیا'} - ${userProject?.name || 'پڕۆژە'}`
                  : `Branch & Project Portal: ${userCompany?.name || 'Subsidiary'} - ${userProject?.name || 'Project'}`}
              </h1>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {language === 'ku'
                  ? `بەڕێز ${currentUser.name}، زانیارییە نهێنی و سەرمایەی گشتی سەرۆکایەتی هۆڵدینگ و کۆمپانیاکانی تر بەپێی یاسای سیستم لەم ئاستەدا پارێزراون. دەتوانیت سەرجەم ئۆپەراسیۆنەکانی پڕۆژەکەت بەڕێوەبەریت و ڕێڕەوی داواکارییەکانت بۆ سەرەوە تا کاتی واژۆکردن بە وردی ببینیت.`
                  : `Executive holding financials and sister subsidiaries are partitioned under zero-trust governance. You have full operational control over your site and 100% transparency into the status and remaining signatures of your submitted requests.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setActiveTab('procurement')}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-blue-900/40 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'ku' ? 'ناردنی داواکاری کڕین بۆ سەرەوە' : 'Submit New Requisition'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Feature: Request Approval Lifecycle Tracker (گەیشتۆتە لای کێ و کێ ماوە واژووی بکات) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                <Clock className="w-4 h-4" />
              </div>
              <h2 className="text-base font-extrabold text-slate-900">
                {language === 'ku'
                  ? 'داواکارییە نێردراوەکانی لق بۆ سەرەوە: گەیشتۆتە لای کێ و کێ ماوە واژووی بکات؟'
                  : 'Submitted Requests Pipeline: Current Holder & Remaining Approvers'}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {language === 'ku'
                ? 'لێرە دەبینیت داواکارییەکەت لە دەستی کێدایە و کێ ماوە واژووی ڕەزامەندی لە سەرۆکایەتی هۆڵدینگ بۆ بکات'
                : 'Live tracking of who currently holds your request and who is pending to sign'}
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={language === 'ku' ? 'گەڕان بەدوای داواکاری...' : 'Search request...'}
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 w-44"
              />
            </div>
            <div className="flex rounded-xl bg-slate-100 p-0.5 text-xs font-bold">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1 rounded-lg transition ${statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'}`}
              >
                {language === 'ku' ? 'هەموو' : 'All'} ({branchPOs.length})
              </button>
              <button
                onClick={() => setStatusFilter('PENDING')}
                className={`px-3 py-1 rounded-lg transition ${statusFilter === 'PENDING' ? 'bg-amber-500 text-white shadow-2xs' : 'text-slate-500'}`}
              >
                {language === 'ku' ? 'چاوەڕوانی واژۆ' : 'Pending'}
              </button>
              <button
                onClick={() => setStatusFilter('APPROVED')}
                className={`px-3 py-1 rounded-lg transition ${statusFilter === 'APPROVED' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-500'}`}
              >
                {language === 'ku' ? 'پەسەندکراو' : 'Approved'}
              </button>
            </div>
          </div>
        </div>

        {/* Request Cards Grid */}
        {displayPOs.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 space-y-2">
            <FileText className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-600">
              {language === 'ku' ? 'هیچ داواکارییەک لەم فلتەرەدا نەدۆزرایەوە' : 'No requisitions found in this filter'}
            </p>
            <p className="text-xs text-slate-400">
              {language === 'ku'
                ? 'دەتوانیت لە ڕێگەی دوگمەی «ناردنی داواکاری نوێ» داوای کڕین یان کەرەستە بۆ سەرەوە بنێریت'
                : 'Submit a new requisition to start the approval pipeline'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {displayPOs.map((po) => {
              const holderInfo = getRequestHolderInfo(po);
              const isApproved = po.status === 'APPROVED_BY_OWNER';

              return (
                <div
                  key={po.id}
                  className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-400 p-5 shadow-xs transition hover:shadow-md space-y-4"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-mono font-bold text-xs text-slate-700 shrink-0">
                        PO
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md">
                            {po.poNumber}
                          </span>
                          <span className="text-xs text-slate-500">
                            {new Date(po.createdDate).toLocaleDateString()}
                          </span>
                          <span className="text-xs font-bold text-blue-600">
                            {po.supplierName}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-slate-800 mt-1">
                          {po.purpose}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex items-center md:flex-col md:items-end justify-between">
                      <span className="text-base font-black font-mono text-emerald-600">
                        ${po.totalAmountUSD.toLocaleString()} USD
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {po.items.length} {language === 'ku' ? 'بابەت' : 'items'}
                      </span>
                    </div>
                  </div>

                  {/* Highlights Bar: Currently At & Remaining Signers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                    {/* Currently with */}
                    <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${holderInfo.stepColor}`}>
                      <Clock className="w-4 h-4 shrink-0" />
                      <div>
                        <span className="text-[10px] uppercase font-black tracking-wider block opacity-75">
                          {language === 'ku' ? '📍 ئێستا لە لای کێیە:' : '📍 Currently With:'}
                        </span>
                        <strong className="text-xs font-extrabold block">
                          {language === 'ku' ? holderInfo.holderKu : holderInfo.holderEn}
                        </strong>
                      </div>
                    </div>

                    {/* Who is pending */}
                    <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-2.5 text-slate-700">
                      <Crown className="w-4 h-4 text-amber-500 shrink-0" />
                      <div>
                        <span className="text-[10px] uppercase font-black tracking-wider block text-slate-500">
                          {language === 'ku' ? '⏳ کێ ماوە واژووی بکات:' : '⏳ Pending to Sign:'}
                        </span>
                        <strong className="text-xs font-extrabold text-slate-800 block truncate max-w-xs">
                          {language === 'ku' ? holderInfo.remainingKu : holderInfo.remainingEn}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{language === 'ku' ? 'داواکار:' : 'Requester:'} {po.requestedBy}</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedPoForTracking(po)}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <PenTool className="w-3.5 h-3.5 text-blue-600" />
                        <span>{language === 'ku' ? 'چاودێری وردی واژۆ و مۆرەکان' : 'Track Approval Journey'}</span>
                        <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Local Branch Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Budget */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>{language === 'ku' ? 'بودجەی پڕۆژەی دیاریکراو' : 'Assigned Project Budget'}</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-black font-mono text-slate-900">
            ${(userProject?.budgetUSD || 0).toLocaleString()} USD
          </div>
          <div className="text-xs text-slate-500 flex items-center justify-between pt-1">
            <span>خەرجکراو: ${(userProject?.spentUSD || 0).toLocaleString()}</span>
            <span className="font-bold text-emerald-600">
              {userProject?.budgetUSD ? Math.round((userProject.spentUSD / userProject.budgetUSD) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Metric 2: Local Gate Entries */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>{language === 'ku' ? 'کەرەستەی گەیشتووی دەروازە' : 'Gate Arrivals at Site'}</span>
            <ScanLine className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black font-mono text-slate-900">
            {localGateLogs.length} {language === 'ku' ? 'بار / ئۆتۆمبێل' : 'deliveries'}
          </div>
          <div className="text-xs text-slate-500">
            {localGateLogs.filter(g => g.decision === 'ADMITTED').length} {language === 'ku' ? 'داخڵکراون بۆ مەیدان' : 'admitted on site'}
          </div>
        </div>

        {/* Metric 3: Warehouse Items */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>{language === 'ku' ? 'کۆگا و عەمباری ناوچەیی' : 'Local Site Inventory'}</span>
            <Boxes className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-black font-mono text-slate-900">
            {localItems.length} {language === 'ku' ? 'جۆر کەرەستە' : 'item categories'}
          </div>
          <div className="text-xs text-slate-500">
            {language === 'ku' ? 'بەردەست لە شوێنی پڕۆژە' : 'Available on site'}
          </div>
        </div>
      </div>

      {/* Request Approval Journey Modal */}
      <RequestApprovalJourneyModal
        isOpen={Boolean(selectedPoForTracking)}
        onClose={() => setSelectedPoForTracking(null)}
        purchaseOrder={selectedPoForTracking}
        onOpenPrint={(po) => openPrintManager(po)}
      />
    </div>
  );
};
