import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Building2,
  DollarSign,
  Briefcase,
  Layers,
  Sparkles,
  Trash2,
  Plus,
  RefreshCw,
  PieChart as PieIcon,
  Activity,
  Calculator,
  ShieldCheck,
  Palette
} from 'lucide-react';
import { HoldingSectorKpi, SectorExpenseSubcategory } from '../../types/kpi';
import { useERP } from '../../context/ERPContext';
import { useLanguage } from '../../context/LanguageContext';
import { getUIText } from '../../utils/langHelper';

interface SectorEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectorToEdit: HoldingSectorKpi | null;
  onSaveSector?: (savedSector: HoldingSectorKpi) => void;
}

const COLOR_PALETTE = [
  { label: 'Royal Blue', hex: '#2563eb' },
  { label: 'Emerald Green', hex: '#059669' },
  { label: 'Amber Gold', hex: '#d97706' },
  { label: 'Purple Violet', hex: '#7c3aed' },
  { label: 'Rose Crimson', hex: '#e11d48' },
  { label: 'Cyan Ocean', hex: '#0891b2' },
  { label: 'Indigo Night', hex: '#4f46e5' },
  { label: 'Slate Charcoal', hex: '#475569' }
];

export const SectorEditModal: React.FC<SectorEditModalProps> = ({
  isOpen,
  onClose,
  sectorToEdit,
  onSaveSector
}) => {
  const { companies, projects, updateHoldingSector, addHoldingSector } = useERP();
  const { language } = useLanguage();

  const isCreating = !sectorToEdit;

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [nameKu, setNameKu] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionKu, setDescriptionKu] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [color, setColor] = useState('#2563eb');

  const [annualBudgetUSD, setAnnualBudgetUSD] = useState<number>(10000000);
  const [spentUSD, setSpentUSD] = useState<number>(6500000);
  const [companiesCount, setCompaniesCount] = useState<number>(1);
  const [activeProjectsCount, setActiveProjectsCount] = useState<number>(2);

  const [primaryKpiMetric, setPrimaryKpiMetric] = useState('On-Schedule Milestones');
  const [primaryKpiValue, setPrimaryKpiValue] = useState('92.5%');
  const [healthScore, setHealthScore] = useState<number>(90);
  const [status, setStatus] = useState<'EXCELLENT' | 'ON_TRACK' | 'WARNING' | 'ALERT'>('ON_TRACK');

  // Subcategories
  const [subcategories, setSubcategories] = useState<SectorExpenseSubcategory[]>([]);

  // Selected Linked Companies
  const [linkedCompanyIds, setLinkedCompanyIds] = useState<string[]>([]);

  // Tab
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'FINANCIALS' | 'SUBCATEGORIES' | 'LINK_COMPANIES'>('GENERAL');

  // Load existing sector or reset
  useEffect(() => {
    if (sectorToEdit) {
      setCode(sectorToEdit.code || '');
      setName(sectorToEdit.name || '');
      setNameKu(sectorToEdit.nameKu || '');
      setNameAr(sectorToEdit.nameAr || '');
      setDescription(sectorToEdit.description || '');
      setDescriptionKu(sectorToEdit.descriptionKu || '');
      setDescriptionAr(sectorToEdit.descriptionAr || '');
      setColor(sectorToEdit.color || '#2563eb');

      setAnnualBudgetUSD(sectorToEdit.annualBudgetUSD || 0);
      setSpentUSD(sectorToEdit.spentUSD || 0);
      setCompaniesCount(sectorToEdit.companiesCount || 1);
      setActiveProjectsCount(sectorToEdit.activeProjectsCount || 1);

      setPrimaryKpiMetric(sectorToEdit.primaryKpiMetric || 'On-Schedule Milestones');
      setPrimaryKpiValue(sectorToEdit.primaryKpiValue || '90%');
      setHealthScore(sectorToEdit.healthScore || 90);
      setStatus(sectorToEdit.status || 'ON_TRACK');

      setSubcategories(sectorToEdit.subcategories ? JSON.parse(JSON.stringify(sectorToEdit.subcategories)) : []);
    } else {
      // New Sector defaults
      setCode(`SEC-${Math.floor(100 + Math.random() * 900)}`);
      setName('');
      setNameKu('');
      setNameAr('');
      setDescription('');
      setDescriptionKu('');
      setDescriptionAr('');
      setColor('#2563eb');

      setAnnualBudgetUSD(15000000);
      setSpentUSD(8500000);
      setCompaniesCount(1);
      setActiveProjectsCount(2);

      setPrimaryKpiMetric('Operational Execution');
      setPrimaryKpiValue('91.0%');
      setHealthScore(90);
      setStatus('ON_TRACK');

      setSubcategories([
        {
          id: `sub-${Date.now()}-1`,
          name: 'Core Operations & Supply',
          nameKu: 'کارە سەرەکییەکان و کەرەستە',
          nameAr: 'العمليات الأساسية والتوريد',
          budgetUSD: 8000000,
          spentUSD: 4500000,
          varianceUSD: 3500000,
          utilizationRate: 56.2,
          color: '#2563eb'
        },
        {
          id: `sub-${Date.now()}-2`,
          name: 'Technical Works & Staffing',
          nameKu: 'کاروباری تەکنیکی و کارمەندان',
          nameAr: 'الأعمال الفنية والكوادر',
          budgetUSD: 7000000,
          spentUSD: 4000000,
          varianceUSD: 3000000,
          utilizationRate: 57.1,
          color: '#3b82f6'
        }
      ]);
    }
  }, [sectorToEdit, isOpen]);

  if (!isOpen) return null;

  // Real-time calculations
  const varianceUSD = annualBudgetUSD - spentUSD;
  const utilizationRate = annualBudgetUSD > 0 ? Number(((spentUSD / annualBudgetUSD) * 100).toFixed(1)) : 0;

  // Auto calculate from Subcategories
  const handleSumFromSubcategories = () => {
    if (subcategories.length === 0) return;
    const totalSubBudget = subcategories.reduce((acc, sub) => acc + (Number(sub.budgetUSD) || 0), 0);
    const totalSubSpent = subcategories.reduce((acc, sub) => acc + (Number(sub.spentUSD) || 0), 0);
    setAnnualBudgetUSD(totalSubBudget);
    setSpentUSD(totalSubSpent);
  };

  // Auto calculate from Linked Companies
  const handleCalculateFromCompanies = () => {
    if (linkedCompanyIds.length === 0) return;
    const matched = companies.filter(c => linkedCompanyIds.includes(c.id));
    const totalCompBudget = matched.reduce((acc, c) => acc + (Number(c.annualBudgetUSD) || 0), 0);
    const totalCompSpent = matched.reduce((acc, c) => acc + (Number(c.spentUSD) || 0), 0);
    
    // Count active projects in matched companies
    const matchedProjects = projects.filter(p => linkedCompanyIds.includes(p.companyId));

    setAnnualBudgetUSD(totalCompBudget);
    setSpentUSD(totalCompSpent);
    setCompaniesCount(matched.length);
    setActiveProjectsCount(Math.max(1, matchedProjects.length));
  };

  // Subcategory operations
  const handleAddSubcategory = () => {
    const newSub: SectorExpenseSubcategory = {
      id: `sub-${Date.now()}`,
      name: 'New Subcategory',
      nameKu: 'پۆلی خەرجی نوێ',
      nameAr: 'فئة مصروفات جديدة',
      budgetUSD: Math.round(annualBudgetUSD * 0.2),
      spentUSD: Math.round(spentUSD * 0.2),
      varianceUSD: Math.round((annualBudgetUSD - spentUSD) * 0.2),
      utilizationRate: 50.0,
      color: color
    };
    setSubcategories(prev => [...prev, newSub]);
  };

  const handleUpdateSubcategory = (index: number, field: keyof SectorExpenseSubcategory, value: any) => {
    setSubcategories(prev => {
      const updated = [...prev];
      const target = { ...updated[index], [field]: value };
      if (field === 'budgetUSD' || field === 'spentUSD') {
        const b = Number(target.budgetUSD) || 0;
        const s = Number(target.spentUSD) || 0;
        target.varianceUSD = b - s;
        target.utilizationRate = b > 0 ? Number(((s / b) * 100).toFixed(1)) : 0;
      }
      updated[index] = target;
      return updated;
    });
  };

  const handleDeleteSubcategory = (index: number) => {
    setSubcategories(prev => prev.filter((_, i) => i !== index));
  };

  // Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalName = name.trim() || 'Custom Sector';
    const finalNameKu = nameKu.trim() || finalName;
    const finalNameAr = nameAr.trim() || finalName;

    // Generate balanced monthly trend points based on new budget & spent
    const monthlyBudgetPoint = Math.round(annualBudgetUSD / 12);
    const monthlySpentPoint = Math.round(spentUSD / 9); // Jan - Sep

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
    const generatedMonthlyTrend = months.map((m, idx) => {
      const factor = 0.85 + (idx * 0.035);
      const mSpent = Math.round(monthlySpentPoint * factor);
      return {
        month: m,
        budgetBaselineUSD: monthlyBudgetPoint,
        spentUSD: mSpent,
        varianceUSD: monthlyBudgetPoint - mSpent
      };
    });

    const sectorData: HoldingSectorKpi = {
      id: sectorToEdit ? sectorToEdit.id : `sec-${Date.now()}`,
      code: code.trim().toUpperCase() || 'SEC-NEW',
      name: finalName,
      nameKu: finalNameKu,
      nameAr: finalNameAr,
      description: description.trim() || `${finalName} operations and financial tracking`,
      descriptionKu: descriptionKu.trim() || description.trim() || `${finalNameKu} و چاودێری دارایی`,
      descriptionAr: descriptionAr.trim() || description.trim() || `${finalNameAr} والمتابعة المالية`,
      color,
      annualBudgetUSD: Number(annualBudgetUSD) || 0,
      spentUSD: Number(spentUSD) || 0,
      varianceUSD: Number(varianceUSD) || 0,
      utilizationRate: Number(utilizationRate) || 0,
      companiesCount: Number(companiesCount) || 1,
      activeProjectsCount: Number(activeProjectsCount) || 1,
      primaryKpiMetric: primaryKpiMetric.trim() || 'On-Schedule Milestones',
      primaryKpiValue: primaryKpiValue.trim() || '92.0%',
      healthScore: Number(healthScore) || 90,
      status: utilizationRate > 95 ? 'ALERT' : utilizationRate > 85 ? 'WARNING' : utilizationRate > 70 ? 'ON_TRACK' : 'EXCELLENT',
      subcategories: subcategories.length > 0 ? subcategories : (sectorToEdit?.subcategories || []),
      recentVouchers: sectorToEdit?.recentVouchers || [],
      monthlyTrend: generatedMonthlyTrend
    };

    if (sectorToEdit) {
      updateHoldingSector(sectorToEdit.id, sectorData);
    } else {
      addHoldingSector(sectorData);
    }

    if (onSaveSector) {
      onSaveSector(sectorData);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-slate-900 animate-in zoom-in-95 duration-200"
        role="dialog"
      >
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-extrabold shadow-md shrink-0 border border-white/20"
              style={{ backgroundColor: color }}
            >
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  {isCreating
                    ? getUIText(language, { en: 'Add New Holding Sector & Budget', ku: 'زیادکردنی کەرتی نوێ و دیاریکردنی بودجە', ar: 'إضافة قطاع جديد وضبط الميزانية' })
                    : getUIText(language, { en: 'Edit Sector & Financial Capacity', ku: 'دەستکاریکردنی کەرت، بودجە و خەرجییەکان', ar: 'تعديل بيانات القطاع والميزانية المالية' })}
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-200 font-bold border border-blue-400/30">
                  {code || 'SEC'}
                </span>
              </div>
              <p className="text-xs text-indigo-200/90 mt-0.5">
                {getUIText(language, {
                  en: 'Customize names in 3 languages, exact budgets, spent figures, and subcategories to match your real holding capacity',
                  ku: 'ناوەکانی کەرت بە کوردی و ئینگلیزی و عەرەبی، بودجەی ساڵانە و خەرجییەکان بەگوێرەی هۆڵدینگەکەت بگۆڕە',
                  ar: 'تعديل أسماء القطاع بثلاث لغات، الميزانية والمصروفات بدقة لتطابق حجم الهولدينغ الفعلي'
                })}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('GENERAL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'GENERAL'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>{getUIText(language, { en: '1. Names & Details', ku: '١. ناو و زانیارییەکان', ar: '١. الأسماء والبيانات' })}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('FINANCIALS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'FINANCIALS'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>{getUIText(language, { en: '2. Budgets & Spend ($)', ku: '٢. بودجە و خەرجی ($)', ar: '٢. الميزانية والمصروفات' })}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('SUBCATEGORIES')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'SUBCATEGORIES'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{getUIText(language, { en: '3. Expense Categories', ku: '٣. پۆلەکانی خەرجی', ar: '٣. بنود المصروفات' })} ({subcategories.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('LINK_COMPANIES')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'LINK_COMPANIES'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{getUIText(language, { en: '4. Link Companies', ku: '٤. بەستنەوە بە کۆمپانیاکان', ar: '٤. ربط الشركات' })}</span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* ========================================================================= */}
          {/* TAB 1: GENERAL & NAMES */}
          {/* ========================================================================= */}
          {activeTab === 'GENERAL' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {getUIText(language, { en: 'Sector Code (e.g. SEC-CONST):', ku: 'کۆدی کەرت (وەک SEC-FOOD):', ar: 'رمز القطاع:' })}
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
                    placeholder="SEC-FOOD"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {getUIText(language, { en: 'Theme Color:', ku: 'ڕەنگی چارت و پیشاندان:', ar: 'لون المخطط والتمييز:' })}
                  </label>
                  <div className="flex items-center gap-2 flex-wrap pt-0.5">
                    {COLOR_PALETTE.map((c) => (
                      <button
                        type="button"
                        key={c.hex}
                        onClick={() => setColor(c.hex)}
                        className={`w-7 h-7 rounded-xl border-2 transition-transform cursor-pointer ${
                          color === c.hex ? 'scale-115 border-slate-900 shadow-md ring-2 ring-blue-300' : 'border-white'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.label}
                      />
                    ))}
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-8 h-8 rounded-xl border border-slate-300 cursor-pointer p-0.5 bg-white"
                      title="Custom Color"
                    />
                  </div>
                </div>
              </div>

              {/* Multilingual Names */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {getUIText(language, { en: 'Kurdish Name (ناوی کوردی):', ku: 'ناوی کەرت بە کوردی:', ar: 'الاسم بالكردية:' })}
                  </label>
                  <input
                    type="text"
                    required
                    value={nameKu}
                    onChange={(e) => setNameKu(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-800"
                    placeholder="کەرتی بیناسازی و پەرەپێدان"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {getUIText(language, { en: 'English Name:', ku: 'ناوی کەرت بە ئینگلیزی:', ar: 'الاسم بالإنجليزية:' })}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-800"
                    placeholder="Construction & Development"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {getUIText(language, { en: 'Arabic Name (الاسم بالعربية):', ku: 'ناوی کەرت بە عەرەبی:', ar: 'الاسم بالعربية:' })}
                  </label>
                  <input
                    type="text"
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-800"
                    placeholder="قطاع الإنشاءات والتطوير"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {getUIText(language, { en: 'Description (Kurdish):', ku: 'ڕوونکردنەوە و بواری کار (کوردی):', ar: 'الوصف (كردي):' })}
                  </label>
                  <textarea
                    rows={2}
                    value={descriptionKu}
                    onChange={(e) => setDescriptionKu(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-800"
                    placeholder="پرۆژەکانی ژێرخان و پرد و ڕێگاوبان..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {getUIText(language, { en: 'Description (English):', ku: 'ڕوونکردنەوە و بواری کار (ئینگلیزی):', ar: 'الوصف (إنجليزي):' })}
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-800"
                    placeholder="Civil infrastructure, highways, reinforced concrete..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: FINANCIALS & BUDGETS */}
          {/* ========================================================================= */}
          {activeTab === 'FINANCIALS' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* Financial Inputs Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1.5 flex items-center justify-between">
                    <span>{getUIText(language, { en: 'Annual Sector Budget ($ USD):', ku: 'بودجەی ساڵانەی کەرت ($ USD):', ar: 'الميزانية السنوية للقطاع ($):' })}</span>
                    <span className="text-[11px] text-blue-600 font-mono font-bold">${(annualBudgetUSD / 1000000).toFixed(2)}M</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">$</span>
                    <input
                      type="number"
                      min="0"
                      step="10000"
                      required
                      value={annualBudgetUSD}
                      onChange={(e) => setAnnualBudgetUSD(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2.5 text-sm font-mono font-extrabold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1.5 flex items-center justify-between">
                    <span>{getUIText(language, { en: 'Actual Spent to Date ($ USD):', ku: 'خەرجی ڕاستەقینە تا ئێستا ($ USD):', ar: 'المصروف الفعلي حتى تاريخه ($):' })}</span>
                    <span className="text-[11px] text-emerald-600 font-mono font-bold">${(spentUSD / 1000000).toFixed(2)}M</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">$</span>
                    <input
                      type="number"
                      min="0"
                      step="10000"
                      required
                      value={spentUSD}
                      onChange={(e) => setSpentUSD(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2.5 text-sm font-mono font-extrabold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Calculated Real-time Preview Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
                    {getUIText(language, { en: 'Utilization Rate', ku: 'ڕێژەی خەرجکردن', ar: 'نسبة الاستهلاك' })}
                  </span>
                  <span className="text-lg font-black text-blue-900 block mt-0.5 font-mono">
                    {utilizationRate}%
                  </span>
                </div>

                <div className={`p-3.5 rounded-2xl border ${
                  varianceUSD >= 0 ? 'bg-emerald-50/60 border-emerald-200' : 'bg-rose-50/60 border-rose-200'
                }`}>
                  <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                    varianceUSD >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {getUIText(language, { en: 'Remaining Variance', ku: 'باڵانسی ماوە (جیاوازی)', ar: 'الفارق المتبقي' })}
                  </span>
                  <span className={`text-lg font-black block mt-0.5 font-mono ${
                    varianceUSD >= 0 ? 'text-emerald-900' : 'text-rose-900'
                  }`}>
                    ${(varianceUSD / 1000000).toFixed(2)}M
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    {getUIText(language, { en: 'Companies Count', ku: 'ژمارەی کۆمپانیاکان', ar: 'عدد الشركات' })}
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={companiesCount}
                    onChange={(e) => setCompaniesCount(Number(e.target.value))}
                    className="w-full text-lg font-black text-slate-900 bg-transparent border-b border-slate-300 focus:border-blue-500 font-mono mt-0.5 outline-none"
                  />
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    {getUIText(language, { en: 'Active Projects', ku: 'پڕۆژە چالاکەکان', ar: 'المشاريع النشطة' })}
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={activeProjectsCount}
                    onChange={(e) => setActiveProjectsCount(Number(e.target.value))}
                    className="w-full text-lg font-black text-slate-900 bg-transparent border-b border-slate-300 focus:border-blue-500 font-mono mt-0.5 outline-none"
                  />
                </div>
              </div>

              {/* KPI Metric & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {getUIText(language, { en: 'Primary KPI Metric Label:', ku: 'ناوی پێوەری سەرەکی (KPI):', ar: 'مؤشر الأداء الرئيسي:' })}
                  </label>
                  <input
                    type="text"
                    value={primaryKpiMetric}
                    onChange={(e) => setPrimaryKpiMetric(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-800"
                    placeholder="On-Schedule Milestones"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {getUIText(language, { en: 'Target / Actual Value:', ku: 'ڕێژەی ئەنجامدراو:', ar: 'القيمة المحققة:' })}
                  </label>
                  <input
                    type="text"
                    value={primaryKpiValue}
                    onChange={(e) => setPrimaryKpiValue(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-800"
                    placeholder="94.2%"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {getUIText(language, { en: 'Status:', ku: 'دۆخی کارپێکردن:', ar: 'الحالة:' })}
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs font-bold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-800"
                  >
                    <option value="EXCELLENT">EXCELLENT (نایاب)</option>
                    <option value="ON_TRACK">ON_TRACK (لە چوارچێوەی بودجە)</option>
                    <option value="WARNING">WARNING (پێویستی بە چاودێرییە)</option>
                    <option value="ALERT">ALERT (مەترسی تێپەڕاندنی بودجە)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: SUBCATEGORIES MANAGEMENT */}
          {/* ========================================================================= */}
          {activeTab === 'SUBCATEGORIES' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-extrabold text-slate-800 block">
                    {getUIText(language, { en: 'Sector Subcategories & Cost Centers:', ku: 'پۆلە لاوەکییەکان و ناوەندەکانی تێچوو:', ar: 'الفئات الفرعية ومراكز التكلفة للقطاع:' })}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {getUIText(language, { en: 'These feed the Cost Allocation Donut and Sector Breakdown tables.', ku: 'ئەم داتایانە لە چارتەکانی دابەشکردنی تێچوو و خشتەی کەرتەکان پیشان دەدرێن.', ar: 'تظهر هذه البيانات في مخططات توزيع التكلفة وجداول التفاصيل.' })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSumFromSubcategories}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition cursor-pointer"
                    title="Calculate Sector Budget & Spent from Subcategories"
                  >
                    <Calculator className="w-3.5 h-3.5 text-blue-600" />
                    <span>{getUIText(language, { en: 'Sum Subcategories to Sector', ku: 'کۆکردنەوەی بودجە لە پۆلەکانەوە', ar: 'جمع الميزانية من البنود' })}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAddSubcategory}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{getUIText(language, { en: 'Add Subcategory (+)', ku: 'زیادکردنی پۆلی نوێ (+)', ar: 'إضافة بند فرعي (+)' })}</span>
                  </button>
                </div>
              </div>

              {/* Subcategories Rows */}
              <div className="space-y-3">
                {subcategories.map((sub, idx) => (
                  <div
                    key={sub.id || idx}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 transition space-y-2.5"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase">
                          {getUIText(language, { en: 'Category Name (Kurdish / English):', ku: 'ناوی پۆل (کوردی / ئینگلیزی):', ar: 'اسم البند (كردي / إنجليزي):' })}
                        </label>
                        <div className="flex items-center gap-2 mt-0.5">
                          <input
                            type="text"
                            value={sub.nameKu || ''}
                            onChange={(e) => handleUpdateSubcategory(idx, 'nameKu', e.target.value)}
                            placeholder="ناوی پۆل بە کوردی"
                            className="w-1/2 px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-lg text-slate-800"
                          />
                          <input
                            type="text"
                            value={sub.name || ''}
                            onChange={(e) => handleUpdateSubcategory(idx, 'name', e.target.value)}
                            placeholder="English Name"
                            className="w-1/2 px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-lg text-slate-800"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase">
                          {getUIText(language, { en: 'Budget ($ USD):', ku: 'بودجە ($):', ar: 'الميزانية ($):' })}
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="10000"
                          value={sub.budgetUSD}
                          onChange={(e) => handleUpdateSubcategory(idx, 'budgetUSD', Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg text-slate-800 mt-0.5"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase">
                            {getUIText(language, { en: 'Spent ($ USD):', ku: 'خەرجکراو ($):', ar: 'المصروف ($):' })}
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="10000"
                            value={sub.spentUSD}
                            onChange={(e) => handleUpdateSubcategory(idx, 'spentUSD', Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg text-slate-800 mt-0.5"
                          />
                        </div>

                        {subcategories.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteSubcategory(idx)}
                            className="mt-4 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Delete Subcategory"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1 border-t border-slate-200">
                      <span>Variance: ${(sub.varianceUSD / 1000000).toFixed(2)}M</span>
                      <span className="font-bold text-blue-600">Utilization: {sub.utilizationRate}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: LINK WITH REGISTERED COMPANIES */}
          {/* ========================================================================= */}
          {activeTab === 'LINK_COMPANIES' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-extrabold text-blue-900 block">
                    {getUIText(language, { en: 'Link Holding Subsidiary Companies:', ku: 'بەستنەوە بە کۆمپانیاکانی ئەم کەرتە:', ar: 'ربط الشركات التابعة لهذا القطاع:' })}
                  </span>
                  <p className="text-[11px] text-blue-800/80 mt-0.5">
                    {getUIText(language, {
                      en: 'Select companies to automatically compute and synchronize the sector budget and expenses directly from your live ERP data.',
                      ku: 'کۆمپانیاکانی ئەم کەرتە دیاری بکە تاوەکو بودجە و خەرجی کەرتەکە لە داتای ڕاستەقینەی کۆمپانیاکانەوە پڕبکرێتەوە.',
                      ar: 'اختر الشركات ليتم حساب الميزانية والمصروفات تلقائياً من البيانات الحقيقية للشركات المسجلة.'
                    })}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCalculateFromCompanies}
                  disabled={linkedCompanyIds.length === 0}
                  className="px-4 py-2 rounded-xl text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer disabled:opacity-50 shrink-0 shadow-2xs flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{getUIText(language, { en: 'Auto-Sync Budgets from Companies', ku: 'پڕکردنەوەی خۆکار لە کۆمپانیاکانەوە', ar: 'تحديث تلقائي من الشركات' })}</span>
                </button>
              </div>

              {/* Companies Checkbox Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {companies.map((comp) => {
                  const isSelected = linkedCompanyIds.includes(comp.id);
                  return (
                    <div
                      key={comp.id}
                      onClick={() => {
                        if (isSelected) {
                          setLinkedCompanyIds(prev => prev.filter(id => id !== comp.id));
                        } else {
                          setLinkedCompanyIds(prev => [...prev, comp.id]);
                        }
                      }}
                      className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/50 shadow-2xs ring-1 ring-blue-300'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-xs shrink-0">
                          {comp.code?.slice(0, 3) || 'CMP'}
                        </div>
                        <div>
                          <span className="text-xs font-extrabold text-slate-900 block">
                            {language === 'ku' && comp.nameKu ? comp.nameKu : comp.name}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            Budget: ${(comp.annualBudgetUSD / 1000000).toFixed(1)}M • Spent: ${(comp.spentUSD / 1000000).toFixed(1)}M
                          </span>
                        </div>
                      </div>

                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // handled by parent div
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>
                {getUIText(language, {
                  en: 'All chart algorithms and matrices will instantly update with these figures',
                  ku: 'هەموو چارتەکان و پێشبینییە داراییەکان دەستبەجێ بەم ژمارانە نوێ دەبنەوە',
                  ar: 'سيتم تحديث كافة المخططات والتوقعات فوراً بهذه الأرقام'
                })}
              </span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
              >
                {getUIText(language, { en: 'Cancel', ku: 'پاشگەزبوونەوە', ar: 'إلغاء' })}
              </button>

              <button
                type="submit"
                className="px-6 py-2 rounded-xl font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>
                  {isCreating
                    ? getUIText(language, { en: 'Create Sector (+)', ku: 'تۆمارکردنی کەرت (+)', ar: 'إنشاء القطاع (+)' })
                    : getUIText(language, { en: 'Save Sector Changes', ku: 'پاشەکەوتکردنی گۆڕانکارییەکان', ar: 'حفظ التعديلات' })}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
