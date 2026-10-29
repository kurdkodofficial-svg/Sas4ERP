import React, { useState } from 'react';
import {
  Upload,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  Download,
  Layers,
  AlertCircle,
  X,
  Building2,
  DollarSign,
  Users,
  Boxes,
  FileCode,
  Sparkles,
  ArrowRight,
  Database
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { useLanguage } from '../context/LanguageContext';

export type ImportCategory = 'COMPANIES_PROJECTS' | 'FINANCE_LEDGER' | 'EMPLOYEES_HR' | 'WAREHOUSE_STOCK' | 'PURCHASE_ORDERS';

export const LegacyDataImportModal: React.FC = () => {
  const {
    isImportModalOpen,
    setIsImportModalOpen,
    importBatchCompanies,
    importBatchProjects,
    importBatchFinanceLedgers,
    importBatchEmployees,
    importBatchWarehouseItems,
    addNotification,
    companies
  } = useERP();

  const { t, language } = useLanguage();

  const [activeCategory, setActiveCategory] = useState<ImportCategory>('COMPANIES_PROJECTS');
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [rawText, setRawText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [importSuccess, setImportSuccess] = useState<boolean>(false);
  const [successCount, setSuccessCount] = useState<number>(0);

  if (!isImportModalOpen) return null;

  const categories = [
    {
      id: 'COMPANIES_PROJECTS' as ImportCategory,
      title: 'کۆمپانیا و پڕۆژەکان',
      subtitle: 'Companies & Projects Tree',
      icon: Building2,
      color: 'blue',
      sampleCSV: `Company_Name,Company_Code,Industry,General_Manager,GM_Phone,Budget_USD,Project_Name,Project_Manager,Project_Budget_USD\n"کۆمپانیای بازرگانی گشتی","CMP-TRD","Trading & Logistics","ئارام کاوە","+9647501112233",5000000,"پڕۆژەی دروستکردنی عەمبار","ئەندازیار ڕێبوار",1200000\n"کۆمپانیای ئەندازیاری بیناسازی","CMP-ENG","Construction & Civil","هۆشیار قادر","+9647504445566",8000000,"پڕۆژەی کۆمەڵگەی نیشتەجێبوون","ئەندازیار محەمەد",3500000`
    },
    {
      id: 'FINANCE_LEDGER' as ImportCategory,
      title: 'دەفتەری حیسابات و دارایی',
      subtitle: 'General Ledger & Chart of Accounts',
      icon: DollarSign,
      color: 'emerald',
      sampleCSV: `Account_Code,Account_Name,Debit_USD,Credit_USD,Description,Voucher_Type,Date\n"10101","حیسابی سەرەکی بەنک",250000,0,"باڵانسی سەرەتایی بەنک","OPENING_BALANCE","2026-01-01"\n"20101","دابینکەرانی کەرەستە",0,85000,"قەرزی پێشووی دابینکەران","GENERAL_VOUCHER","2026-01-05"\n"50101","تێچووی پرۆژەی ئاوەدانی",45000,0,"کڕینی شیش و کۆنکرێت","PAYMENT_VOUCHER","2026-01-10"`
    },
    {
      id: 'EMPLOYEES_HR' as ImportCategory,
      title: 'کارمەندان و ئیقامەی بیانی',
      subtitle: 'HR Staff & Expatriates List',
      icon: Users,
      color: 'purple',
      sampleCSV: `Full_Name,Department,Role,Salary_USD,Phone,Nationality,Passport_No,Iqama_Expiry\n"ئەندازیار کامەران عەلی","Civil Engineering","Senior Project Engineer",2500,"+9647501234567","Local","",""\n"ڕەزا محەمەدی","Safety & HSE","HSE Officer",1800,"+9647509876543","Expatriate","N8472910","2026-11-30"\n"سەردار فەتاح","Finance & Accounts","Accountant",1400,"+9647503332211","Local","",""`
    },
    {
      id: 'WAREHOUSE_STOCK' as ImportCategory,
      title: 'کەرەستەی عەمبار و کۆگا',
      subtitle: 'Warehouse Items & Inventory',
      icon: Boxes,
      color: 'amber',
      sampleCSV: `Item_Code,Item_Name,Category,Quantity,Unit,Unit_Cost_USD,Min_Alert_Level,Bin_Location\n"STL-16MM","شیشی ١٦ ملم تورکی","STEEL_REBAR",450,"TON",720,50,"Rack-A1"\n"CMT-42.5","چیمەنتۆی پۆرتلاندی ماس","CEMENT_BAGS",2800,"BAG",7.5,300,"Warehouse-B"\n"GEN-500KVA","موەلیدەی ٥٠٠ کەی ڤی کاتەرپیلەر","HEAVY_MACHINERY",2,"UNIT",35000,1,"Yard-East"`
    }
  ];

  const currentCategoryObj = categories.find(c => c.id === activeCategory) || categories[0];

  // Parse CSV text into array of objects
  const parseCSV = (text: string) => {
    try {
      const lines = text.trim().split(/\r?\n/);
      if (lines.length < 2) return [];

      const headers = lines[0].split(',').map(h => h.replace(/^["']|["']$/g, '').trim());
      const rows = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Handle quoted CSV fields safely
        const values: string[] = [];
        let inQuotes = false;
        let currentValue = '';

        for (let char of line) {
          if (char === '"' || char === "'") {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            values.push(currentValue.trim());
            currentValue = '';
          } else {
            currentValue += char;
          }
        }
        values.push(currentValue.trim());

        const rowObj: any = {};
        headers.forEach((header, idx) => {
          rowObj[header] = values[idx] || '';
        });
        rows.push(rowObj);
      }
      return rows;
    } catch (err) {
      console.error('Error parsing CSV', err);
      return [];
    }
  };

  const handleFileUpload = (file: File) => {
    setFileName(file.name);
    setImportSuccess(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setRawText(text);
      if (file.name.endsWith('.json')) {
        try {
          const json = JSON.parse(text);
          setParsedRows(Array.isArray(json) ? json : [json]);
        } catch {
          alert('هەڵە لە فۆرماتی فایلی JSON');
        }
      } else {
        const rows = parseCSV(text);
        setParsedRows(rows);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleTextPaste = (text: string) => {
    setRawText(text);
    setImportSuccess(false);
    setFileName('Pasted_Data.csv');
    const rows = parseCSV(text);
    setParsedRows(rows);
  };

  const loadSampleTemplate = () => {
    handleTextPaste(currentCategoryObj.sampleCSV);
  };

  const downloadSampleTemplate = () => {
    const blob = new Blob([currentCategoryObj.sampleCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SAS4ERP_Template_${activeCategory}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const executeBatchImport = () => {
    if (parsedRows.length === 0) return;
    setIsProcessing(true);

    setTimeout(() => {
      let count = 0;

      if (activeCategory === 'COMPANIES_PROJECTS') {
        const newComps: any[] = [];
        const newProjs: any[] = [];

        parsedRows.forEach((r, idx) => {
          const compName = r.Company_Name || r['ناوی کۆمپانیا'] || `کۆمپانیای هاوردەکراو ${idx + 1}`;
          const compCode = r.Company_Code || `CMP-${Math.floor(10 + Math.random() * 90)}`;
          const gm = r.General_Manager || r['بەڕێوەبەر'] || 'بەڕێوەبەری گشتی';
          const budget = Number(r.Budget_USD) || 0;

          const compId = `comp-${Date.now()}-${idx}`;
          newComps.push({
            id: compId,
            name: compName,
            nameKu: compName,
            code: compCode,
            industry: r.Industry || 'General Business',
            generalManager: gm,
            gmPhone: r.GM_Phone || '+964 750 000 0000',
            gmEmail: 'management@holding.com',
            location: 'Main Branch',
            annualBudgetUSD: budget,
            spentUSD: 0,
            activeProjectsCount: r.Project_Name ? 1 : 0,
            employeeCount: 0,
            establishedDate: '2026-01-01',
            color: '#0284c7',
            iconName: 'Building2',
            holdingLinkStatus: 'CONNECTED_LIVE'
          });

          if (r.Project_Name) {
            newProjs.push({
              companyId: compId,
              name: r.Project_Name,
              nameKu: r.Project_Name,
              code: `PRJ-${Math.floor(100 + Math.random() * 900)}`,
              manager: r.Project_Manager || gm,
              managerPhone: '+964 750 000 0000',
              budgetUSD: Number(r.Project_Budget_USD) || 0,
              spentUSD: 0,
              startDate: '2026-01-01',
              targetCompletionDate: '2027-12-31',
              progressPercentage: 0,
              location: 'Project Site',
              engineersCount: 0,
              workersCount: 0,
              status: 'ACTIVE',
              holdingLinkStatus: 'CONNECTED_LIVE'
            });
          }
        });

        importBatchCompanies(newComps);
        if (newProjs.length > 0) importBatchProjects(newProjs);
        count = newComps.length;
      } else if (activeCategory === 'FINANCE_LEDGER') {
        const entries = parsedRows.map((r, idx) => ({
          companyId: companies[0]?.id || 'comp-1',
          accountCode: r.Account_Code || `ACC-${1000 + idx}`,
          accountName: r.Account_Name || 'General Account',
          accountNameKu: r.Account_Name || 'حیسابی گشتی',
          category: (r.Debit_USD && Number(r.Debit_USD) > 0 ? 'EXPENSE' : 'REVENUE') as any,
          debitUSD: Number(r.Debit_USD) || 0,
          creditUSD: Number(r.Credit_USD) || 0,
          description: r.Description || 'Historical imported ledger record',
          descriptionKu: r.Description || 'تۆماری دارایی هاوردەکراو',
          date: r.Date || new Date().toISOString().split('T')[0],
          currency: 'USD' as any,
          rateToUSD: 1,
          recordedBy: 'Universal File Import Engine'
        }));
        importBatchFinanceLedgers(entries);
        count = entries.length;
      } else if (activeCategory === 'EMPLOYEES_HR') {
        const emps = parsedRows.map((r, idx) => ({
          companyId: companies[0]?.id || 'comp-1',
          fullName: r.Full_Name || `کارمەند ${idx + 1}`,
          department: r.Department || 'Administration',
          role: r.Role || 'Staff Member',
          salaryUSD: Number(r.Salary_USD) || 0,
          phone: r.Phone || '+964 750 000 0000',
          email: 'employee@holding.com',
          joinDate: '2026-01-01',
          status: 'ACTIVE' as const,
          nationality: r.Nationality || 'Local'
        }));
        importBatchEmployees(emps);
        count = emps.length;
      } else if (activeCategory === 'WAREHOUSE_STOCK') {
        const items = parsedRows.map((r, idx) => ({
          companyId: companies[0]?.id || 'comp-1',
          itemCode: r.Item_Code || `SKU-${100 + idx}`,
          name: r.Item_Name || `Material Item ${idx + 1}`,
          nameKu: r.Item_Name || `کەرەستەی عەمبار ${idx + 1}`,
          category: r.Category || 'GENERAL_SUPPLY',
          currentStock: Number(r.Quantity) || 0,
          unit: r.Unit || 'PCS',
          minStockLevel: Number(r.Min_Alert_Level) || 10,
          unitPriceUSD: Number(r.Unit_Cost_USD) || 0,
          locationBin: r.Bin_Location || 'Warehouse-A',
          lastRestocked: '2026-01-01'
        }));
        importBatchWarehouseItems(items);
        count = items.length;
      }

      setIsProcessing(false);
      setImportSuccess(true);
      setSuccessCount(count);

      addNotification({
        title: 'Universal Batch Import Succeeded',
        titleKu: `هاوردەکردنی بەکۆمەڵی داتای کۆن (${count} داتا) بە سەرکەوتوویی تەواو بوو`,
        titleAr: `تم استيراد ${count} سجلاً تاريخياً بنجاح إلى النظام`,
        message: `Successfully imported ${count} legacy entries into ${currentCategoryObj.title}.`,
        messageKu: `${count} تۆماری داتای ڕابردوو و ئەرشیف بۆ بەشی ${currentCategoryObj.title} خرایە ناو سیستەم بەبێ پێویستی بە نووسینەوەی دەستی.`,
        messageAr: `تم نقل كافة البيانات القديمة مباشرة إلى النظام بدون إدخال يدوي.`,
        type: 'FINANCE_ENTRY'
      });
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative">
        
        {/* Close Button */}
        <button
          onClick={() => setIsImportModalOpen(false)}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shadow-xs">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900">
                هێنانی فایل و داتای کۆن بۆ ناو SAS4ERP
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold border border-indigo-200">
                Bulk Excel / CSV / JSON Import
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              هەموو داتاکانی چەندەها ساڵەی کۆمپانیاکانت، پرۆژە، ژمێریاری، کارمەندان و عەمبار بە یەک کلیک لە فایلەوە بهێنە ناو سیستەم.
            </p>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setParsedRows([]);
                  setRawText('');
                  setFileName('');
                  setImportSuccess(false);
                }}
                className={`p-3 rounded-2xl border text-right transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                    : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-indigo-600'}`} />
                  {isSelected && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                </div>
                <div>
                  <div className="text-xs font-extrabold truncate">{cat.title}</div>
                  <div className={`text-[10px] truncate ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>{cat.subtitle}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Drag & Drop Upload Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-3xl p-6 text-center transition-all ${
            dragOver
              ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]'
              : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50'
          }`}
        >
          <input
            type="file"
            id="erp-bulk-file-input"
            accept=".csv,.xlsx,.xls,.json,.txt"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
            className="hidden"
          />

          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-indigo-100/80 text-indigo-600 flex items-center justify-center">
            <Upload className="w-6 h-6" />
          </div>

          <label
            htmlFor="erp-bulk-file-input"
            className="inline-block px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition cursor-pointer mb-2"
          >
            هەڵبژاردنی فایلی Excel / CSV لە کۆمپیوتەر
          </label>

          <p className="text-xs text-slate-500 font-medium">
            یان فایلەکەت ڕابکێشە بۆ ئێرە (Drag and Drop Excel / CSV / JSON)
          </p>

          <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-slate-200/60">
            <button
              onClick={downloadSampleTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-[11px] font-semibold transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              داگرتنی تێمپلەیتی نموونەیی ({activeCategory}.csv)
            </button>
            <button
              onClick={loadSampleTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-[11px] font-semibold transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              بارکردنی داتای نموونەیی بۆ تاقیکردنەوە
            </button>
          </div>
        </div>

        {/* Text Paste Option */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
              یان ڕاستەوخۆ دەق یان خشتەی Excel لێرە لکێنە (Paste Text / CSV):
            </label>
            {parsedRows.length > 0 && (
              <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {parsedRows.length} ڕیز دۆزرایەوە
              </span>
            )}
          </div>
          <textarea
            rows={3}
            value={rawText}
            onChange={(e) => handleTextPaste(e.target.value)}
            placeholder="کۆپی لە Excel بکە و لێرە Paste بکە یان کۆدی CSV بنووسە..."
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl p-3 text-xs font-mono focus:bg-white focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Parsed Preview Table */}
        {parsedRows.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>پێشبینینی داتاکان پێش تۆمارکردن لە سیستەم (Preview):</span>
              <span className="text-slate-500 font-mono text-[11px]">Source: {fileName || 'Direct Text'}</span>
            </div>
            <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-2xl shadow-2xs">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 text-slate-700 sticky top-0 font-bold border-b border-slate-200">
                  <tr>
                    {Object.keys(parsedRows[0] || {}).map((header, i) => (
                      <th key={i} className="p-2.5 truncate">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedRows.slice(0, 10).map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50/80">
                      {Object.values(row).map((val: any, vIdx) => (
                        <td key={vIdx} className="p-2.5 truncate max-w-[180px] font-medium text-slate-800">
                          {String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {parsedRows.length > 10 && (
              <p className="text-[11px] text-slate-400 text-center">
                + {parsedRows.length - 10} ڕیزی تر لە فایلەکەدا هەیە و هەموویان هاوردە دەکرێن...
              </p>
            )}
          </div>
        )}

        {/* Success Message */}
        {importSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-emerald-900 animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <div className="font-extrabold">هاوردەکردنی {successCount} داتا بە سەرکەوتوویی تەواو بوو!</div>
                <div className="text-[11px] text-emerald-700">ئێستا سەرجەم داتاکان لە ناو سیستەمی SAS4ERP بەستراونەتەوە.</div>
              </div>
            </div>
            <button
              onClick={() => setIsImportModalOpen(false)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer"
            >
              تەواو بوو
            </button>
          </div>
        )}

        {/* Actions Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setIsImportModalOpen(false)}
            className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            داخستن
          </button>
          <button
            type="button"
            disabled={parsedRows.length === 0 || isProcessing}
            onClick={executeBatchImport}
            className={`px-6 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-md transition cursor-pointer ${
              parsedRows.length > 0 && !isProcessing
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isProcessing ? (
              <span>لە کاتی پڕۆسێسکردن و تۆمارکردندایە...</span>
            ) : (
              <>
                <Database className="w-4 h-4" />
                <span>هاوردەکردنی تەواوی {parsedRows.length || 0} داتاکە بۆ ناو سیستەم</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
