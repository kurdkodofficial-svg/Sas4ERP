import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  ScanLine,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Tag,
  ArrowDownToLine,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Clock,
  Check,
  ArrowRight
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { useLanguage } from '../context/LanguageContext';
import { WarehouseItem } from '../types/erp';

export const WarehouseModule: React.FC = () => {
  const {
    warehouseItems,
    addWarehouseItem,
    companies,
    selectedCompanyId,
    setIsGateScannerOpen,
    purchaseOrders,
    isPoFullyApproved,
    canPoEnterProject,
    receiveApprovedPoToWarehouse,
  } = useERP();

  const { t, language } = useLanguage();

  const [warehouseTab, setWarehouseTab] = useState<'STOCK' | 'INWARD_REQUISITIONS'>('STOCK');

  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Electrical & Power Equipment');
  const [quantityOnHand, setQuantityOnHand] = useState(10);
  const [minThreshold, setMinThreshold] = useState(5);
  const [unit, setUnit] = useState('Units');
  const [unitCostUSD, setUnitCostUSD] = useState(150);
  const [binLocation, setBinLocation] = useState('Zone B, Rack 02');

  const filteredItems = warehouseItems.filter(item => {
    if (selectedCompanyId !== 'ALL' && item.companyId !== selectedCompanyId) return false;
    if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase()) && !item.sku.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const totalValuation = filteredItems.reduce((sum, it) => sum + (it.quantityOnHand * it.unitCostUSD), 0);
  const lowStockCount = filteredItems.filter(it => it.quantityOnHand <= it.minimumThreshold).length;

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    addWarehouseItem({
      sku: sku || `SKU-SAS-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      category,
      companyId: companies[0]?.id || 'comp-1',
      projectId: 'proj-101',
      quantityOnHand: Number(quantityOnHand),
      minimumThreshold: Number(minThreshold),
      unit,
      unitCostUSD: Number(unitCostUSD),
      binLocation,
      lastRestockedDate: new Date().toISOString().split('T')[0],
    });
    setIsAddItemOpen(false);
    setName('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Boxes className="w-4 h-4 text-blue-600" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {t('navWarehouse')} & Central Inventory
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time stock quantities, automatic inward increments triggered via Gate Barcode Scanner, and storage zones.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsGateScannerOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition transform active:scale-95 cursor-pointer"
          >
            <ScanLine className="w-4 h-4 animate-pulse" />
            <span>Scan Inward Gate Receipt</span>
          </button>
          <button
            onClick={() => setIsAddItemOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Stock Item</span>
          </button>
        </div>
      </div>

      {/* Warehouse Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-200/80 rounded-2xl shadow-xs w-fit">
        <button
          onClick={() => setWarehouseTab('STOCK')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            warehouseTab === 'STOCK'
              ? 'bg-blue-600 text-white shadow-xs font-extrabold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>{language === 'ku' ? 'کۆگای سەرەکی و کەرەستەکان' : 'Inventory Stock Items'}</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
            warehouseTab === 'STOCK' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
          }`}>
            {filteredItems.length}
          </span>
        </button>

        <button
          onClick={() => setWarehouseTab('INWARD_REQUISITIONS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            warehouseTab === 'INWARD_REQUISITIONS'
              ? 'bg-blue-600 text-white shadow-xs font-extrabold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{language === 'ku' ? 'دەروازەی وەرگرتنی کەرەستە (Clearance Gate)' : 'Inward Requisitions & Clearance'}</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${
            warehouseTab === 'INWARD_REQUISITIONS' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
          }`}>
            {purchaseOrders.filter(p => canPoEnterProject(p).allowed && p.status !== 'INSPECTED_AND_STORED').length} {language === 'ku' ? 'ئامادەیە' : 'Ready'}
          </span>
        </button>
      </div>

      {warehouseTab === 'INWARD_REQUISITIONS' ? (
        <div className="space-y-6">
          {/* Header Info */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  {language === 'ku' ? 'دەروازەی چاودێری و وەرگرتنی بار لە کۆگا' : 'Inward Warehouse Receiving & Approval Clearance'}
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                {language === 'ku'
                  ? 'کۆگای سەرەکی تەنها ئەو کەرەستانە وەردەگرێت و تۆماریان دەکات کە هەموو قۆناغەکانی پەسەندکردنیان (بەڕێوەبەری پڕۆژە، بەڕێوەبەری گشتی و خاوەن هۆڵدینگ) بڕیوە.'
                  : 'Warehouse Security Protocol: Cargo can only be accepted and stocked if the full PM, GM, and Holding Owner authorization pipeline is verified.'}
              </p>
            </div>

            <button
              onClick={() => setIsGateScannerOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition cursor-pointer self-start sm:self-auto"
            >
              <ScanLine className="w-4 h-4 animate-pulse" />
              <span>{language === 'ku' ? 'سکانی بارکۆدی دەروازە (Gate Scanner)' : 'Scan Gate Receipt'}</span>
            </button>
          </div>

          {/* Table */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">PO Reference / Cargo</th>
                    <th className="py-3 px-4">Subsidiary / Supplier</th>
                    <th className="py-3 px-4 text-right">Value ($)</th>
                    <th className="py-3 px-4">Executive Pipeline Status</th>
                    <th className="py-3 px-4">Warehouse Clearance</th>
                    <th className="py-3 px-4 text-right">Receiving Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {purchaseOrders
                    .filter(po => {
                      if (selectedCompanyId !== 'ALL' && po.companyId !== selectedCompanyId) return false;
                      return true;
                    })
                    .map(po => {
                      const comp = companies.find(c => c.id === po.companyId);
                      const entryPerm = canPoEnterProject(po);
                      const isApproved = entryPerm.allowed;
                      const isStored = po.status === 'INSPECTED_AND_STORED';
                      const pendingStep = po.workflowState?.steps?.find(s => s.status === 'PENDING');

                      return (
                        <tr key={po.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-blue-600 block">{po.poNumber}</span>
                            <span className="text-slate-800 font-semibold">{po.items.map(i => `${i.quantity} ${i.unit} ${i.name}`).join(', ')}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-900 block">{comp?.nameKu || comp?.name || 'Subsidiary'}</span>
                            <span className="text-slate-500 text-[11px]">{po.supplierName}</span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-extrabold text-slate-900">
                            ${po.totalAmountUSD.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {po.workflowState?.steps.map(st => {
                                const done = st.status === 'APPROVED';
                                const cur = st.status === 'PENDING' && st.stepNumber === po.workflowState?.currentStepNumber;
                                return (
                                  <span
                                    key={st.stepNumber}
                                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 border ${
                                      done
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                        : cur
                                        ? 'bg-blue-50 text-blue-800 border-blue-300 animate-pulse'
                                        : 'bg-slate-100 text-slate-500 border-slate-200'
                                    }`}
                                  >
                                    {done ? <Check className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3 text-blue-600" />}
                                    <span>{st.role.replace('_', ' ')}</span>
                                  </span>
                                );
                              })}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            {isStored ? (
                              <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 font-bold text-[10px] flex items-center gap-1 w-fit">
                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                                <span>{language === 'ku' ? 'تۆمارکرا لە کۆگا' : 'Stored in Inventory'}</span>
                              </span>
                            ) : isApproved ? (
                              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[10px] flex items-center gap-1 w-fit">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{entryPerm.isCeoPreApproved ? (language === 'ku' ? '👑 ڕێگەپێدراو (CEO + واژۆ)' : '👑 Cleared (CEO + Mgr)') : (language === 'ku' ? 'ڕێگەپێدراو بۆ داخڵبوون' : 'Clear for Inward')}</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 font-bold text-[10px] flex items-center gap-1 w-fit">
                                <Lock className="w-3.5 h-3.5 text-rose-600" />
                                <span>{language === 'ku' ? `ڕاگیراوە (${entryPerm.missingSignersKu || pendingStep?.titleKu || 'چاوەڕوانی واژۆ'}یە)` : `Inward Blocked (${entryPerm.missingSignersKu || pendingStep?.role || 'Pending'})`}</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {isStored ? (
                              <span className="text-[10px] font-mono text-slate-500">
                                📍 {po.warehouseReceipt?.binLocation || 'Zone A'}
                              </span>
                            ) : isApproved ? (
                              <div className="flex items-center gap-2 justify-end">
                                <button
                                  onClick={() => setIsGateScannerOpen(true)}
                                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold text-xs transition cursor-pointer flex items-center gap-1 shadow-2xs"
                                  title="سکانی بارکۆد"
                                >
                                  <ScanLine className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>{language === 'ku' ? 'سکانی بارکۆد' : 'Scan'}</span>
                                </button>
                                <button
                                  onClick={() => receiveApprovedPoToWarehouse(po.id)}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5"
                                >
                                  <ArrowDownToLine className="w-3.5 h-3.5" />
                                  <span>{language === 'ku' ? 'وەرگرتن و زیادکردنی کۆگا' : 'Receive & Shelve'}</span>
                                </button>
                              </div>
                            ) : (
                              <button
                                disabled
                                className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-400 font-bold text-[11px] border border-slate-200 flex items-center gap-1 ml-auto cursor-not-allowed opacity-75"
                                title="وەرگرتنی کەرەستە ڕاگیراوە هەتا خاوەن هۆڵدینگ و بەڕێوەبەر پەسەندی نەکەن"
                              >
                                <Lock className="w-3 h-3 text-slate-400" />
                                <span>{language === 'ku' ? 'داخڵبوون قفڵە' : 'Inward Blocked'}</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Stock Valuation</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">
            ${totalValuation.toLocaleString()} USD
          </div>
          <span className="text-xs text-blue-600 mt-1 block font-medium">Across {filteredItems.length} Product Lines</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Low Stock Reorder Alerts</span>
          <div className={`text-2xl font-extrabold mt-1 ${lowStockCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {lowStockCount} Items
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Below safety stock threshold</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Automated Gate Synchronization</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6" /> Live Active
          </div>
          <span className="text-xs text-slate-500 mt-1 block">Instant bin storage on barcode scan</span>
        </div>
      </div>

      {/* Search & Stock Table */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-md bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus-within:bg-white focus-within:border-blue-500">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search stock by SKU, product name, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-slate-900 text-xs focus:outline-none"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Showing {filteredItems.length} inventory records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Item SKU / Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Bin Location</th>
                <th className="py-3 px-4 text-right">Quantity on Hand</th>
                <th className="py-3 px-4 text-right">Unit Cost</th>
                <th className="py-3 px-4 text-right">Total Value</th>
                <th className="py-3 px-4">Last Restocked</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredItems.map((item) => {
                const isLow = item.quantityOnHand <= item.minimumThreshold;
                const totalItemVal = item.quantityOnHand * item.unitCostUSD;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-slate-900 text-xs">{item.name}</div>
                      <span className="font-mono text-[10px] text-blue-600">{item.sku || item.itemCode}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono">
                      {item.binLocation}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold">
                      <span className={isLow ? 'text-rose-600' : 'text-slate-900'}>
                        {item.quantityOnHand} {item.unit}
                      </span>
                      {isLow && <span className="block text-[9px] text-rose-600 font-bold">REORDER DUE</span>}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-600 font-mono">
                      ${item.unitCostUSD.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right text-emerald-600 font-mono font-bold">
                      ${totalItemVal.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {item.lastRestockedDate}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      </>
    )}

      {/* Add Item Modal */}
      {isAddItemOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Add Warehouse Stock Item</h3>
            <form onSubmit={handleAddItem} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Item / Material Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Copper Armored Cable 4x185mm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    required
                    value={quantityOnHand}
                    onChange={(e) => setQuantityOnHand(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-mono focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Unit Cost ($)</label>
                  <input
                    type="number"
                    required
                    value={unitCostUSD}
                    onChange={(e) => setUnitCostUSD(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-mono focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bin Location</label>
                  <input
                    type="text"
                    value={binLocation}
                    onChange={(e) => setBinLocation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddItemOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
