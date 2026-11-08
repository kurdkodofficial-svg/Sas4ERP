import React, { useState } from 'react';
import {
  Users,
  Shield,
  ShieldCheck,
  CheckCircle2,
  X,
  Plus,
  Edit2,
  Trash2,
  Building2,
  FolderKanban,
  Check,
  RotateCcw,
  UserCheck,
  Key,
  Layers,
  Sparkles,
  Lock,
  Unlock,
  AlertCircle,
  HelpCircle,
  Eye,
  ArrowRight
} from 'lucide-react';
import { useERP } from '../context/ERPContext';
import { useLanguage } from '../context/LanguageContext';
import { UserProfile, UserRole } from '../types/erp';
import { ALL_SYSTEM_MODULES, DEFAULT_ROLE_PERMISSIONS, hasModuleAccess } from '../utils/rbacPermissions';
import { getUIText } from '../utils/langHelper';

export const UserRolesManagementModal: React.FC = () => {
  const {
    isUserRolesModalOpen,
    setIsUserRolesModalOpen,
    userProfiles,
    updateUserProfile,
    addUserProfile,
    deleteUserProfile,
    currentUser,
    setCurrentUser,
    companies,
    projects
  } = useERP();

  const { language, isRtl } = useLanguage();

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Form edit state
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('EMPLOYEE');
  const [formTitle, setFormTitle] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAvatar, setFormAvatar] = useState('👤');
  const [formCompanyId, setFormCompanyId] = useState<string>('');
  const [formProjectId, setFormProjectId] = useState<string>('');
  const [formModules, setFormModules] = useState<string[]>([]);

  if (!isUserRolesModalOpen) return null;

  const triggerToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3000);
  };

  const startEditUser = (user: UserProfile) => {
    setIsCreatingNew(false);
    setEditingUserId(user.id);
    setFormName(user.name);
    setFormRole(user.role);
    setFormTitle(user.title || '');
    setFormEmail(user.email || '');
    setFormPhone(user.phone || '');
    setFormAvatar(user.avatar || '👤');
    setFormCompanyId(user.companyId || '');
    setFormProjectId(user.projectId || '');

    // If user has custom accessibleModules, load them; otherwise load role defaults
    const currentAllowed = user.accessibleModules && Array.isArray(user.accessibleModules)
      ? user.accessibleModules
      : (DEFAULT_ROLE_PERMISSIONS[user.role] || []);
    setFormModules(currentAllowed);
  };

  const startCreateUser = () => {
    setIsCreatingNew(true);
    setEditingUserId(null);
    setFormName('');
    setFormRole('EMPLOYEE');
    setFormTitle('کارمەندی مەیدانی / Employee');
    setFormEmail('');
    setFormPhone('');
    setFormAvatar('👷');
    setFormCompanyId(companies[0]?.id || '');
    setFormProjectId('');
    setFormModules(DEFAULT_ROLE_PERMISSIONS.EMPLOYEE || []);
  };

  const cancelEdit = () => {
    setEditingUserId(null);
    setIsCreatingNew(false);
  };

  const handleRoleChange = (newRole: UserRole) => {
    setFormRole(newRole);
    // When changing role in editor, reset modules to the new role defaults
    setFormModules(DEFAULT_ROLE_PERMISSIONS[newRole] || []);
  };

  const toggleModule = (moduleId: string) => {
    setFormModules(prev => {
      if (prev.includes(moduleId)) {
        return prev.filter(id => id !== moduleId);
      } else {
        return [...prev, moduleId];
      }
    });
  };

  const resetToRoleDefaults = () => {
    setFormModules(DEFAULT_ROLE_PERMISSIONS[formRole] || []);
    triggerToast(
      language === 'ku'
        ? 'بەشەکان گەڕێنرانەوە بۆ دەسەڵاتی بنەڕەتی ئەم ڕۆڵە'
        : 'Permissions reset to standard role defaults'
    );
  };

  const selectAllModules = () => {
    setFormModules(ALL_SYSTEM_MODULES.map(m => m.id));
  };

  const clearAllModules = () => {
    setFormModules([]);
  };

  const saveUserChanges = () => {
    if (!formName.trim()) {
      alert(language === 'ku' ? 'تکایە ناوی بەکارهێنەر بنووسە' : 'Please enter user name');
      return;
    }

    if (isCreatingNew) {
      addUserProfile({
        name: formName.trim(),
        role: formRole,
        title: formTitle.trim() || formName.trim(),
        email: formEmail.trim() || 'user@holding.com',
        phone: formPhone.trim() || '+964 750 000 0000',
        avatar: formAvatar || '👤',
        nativeLanguage: 'ku',
        companyId: formCompanyId || undefined,
        projectId: formProjectId || undefined,
        accessibleModules: formModules
      });
      triggerToast(language === 'ku' ? 'بەکارهێنەری نوێ بە سەرکەوتوویی زیادکرا' : 'New user created successfully');
    } else if (editingUserId) {
      updateUserProfile(editingUserId, {
        name: formName.trim(),
        role: formRole,
        title: formTitle.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        avatar: formAvatar,
        companyId: formCompanyId || undefined,
        projectId: formProjectId || undefined,
        accessibleModules: formModules
      });
      triggerToast(language === 'ku' ? 'دەسەڵات و زانیاری بەکارهێنەر نوێکرایەوە' : 'User profile & permissions updated');
    }

    cancelEdit();
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(language === 'ku' ? `دڵنیایت لە سڕینەوەی بەکارهێنەر "${name}"؟` : `Are you sure you want to remove user "${name}"?`)) {
      deleteUserProfile(id);
      triggerToast(language === 'ku' ? 'بەکارهێنەر سڕایەوە' : 'User deleted');
      if (editingUserId === id) {
        cancelEdit();
      }
    }
  };

  const switchImpersonation = (targetUser: UserProfile) => {
    setCurrentUser(targetUser);
    setIsUserRolesModalOpen(false);
  };

  const filteredUsers = userProfiles.filter(u => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = u.name.toLowerCase().includes(q);
      const matchRole = u.role.toLowerCase().includes(q);
      const matchTitle = (u.title || '').toLowerCase().includes(q);
      const matchEmail = (u.email || '').toLowerCase().includes(q);
      return matchName || matchRole || matchTitle || matchEmail;
    }
    return true;
  });

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case 'HOLDING_OWNER':
        return language === 'ku' ? 'خاوەنی هۆلدینگ (Holding Owner)' : language === 'ar' ? 'مالك المجموعة (Holding Owner)' : 'Holding Owner & Chairman';
      case 'SUPER_ADMIN':
        return language === 'ku' ? 'سوپەر ئەدمین (Super Admin)' : language === 'ar' ? 'المسؤول العام' : 'Super Administrator';
      case 'COMPANY_GM':
        return language === 'ku' ? 'بەڕێوەبەری گشتی (General Manager)' : language === 'ar' ? 'المدير العام للشركة' : 'Company General Manager (GM)';
      case 'PROJECT_MANAGER':
        return language === 'ku' ? 'بەڕێوەبەری پرۆژە (Project Manager)' : language === 'ar' ? 'مدير المشروع' : 'Project Manager (PM)';
      case 'EMPLOYEE':
        return language === 'ku' ? 'کارمەند (Employee)' : language === 'ar' ? 'موظف ميداني' : 'Employee (Self-Service)';
      case 'FINANCE_HEAD':
        return language === 'ku' ? 'بەڕێوەبەری دارایی (CFO)' : language === 'ar' ? 'مدير المالية' : 'Chief Financial Officer';
      case 'WAREHOUSE_OFFICER':
        return language === 'ku' ? 'بەرپرسی کۆگا (Warehouse)' : language === 'ar' ? 'أمين المستودع' : 'Warehouse Controller';
      case 'SECURITY_GATE':
        return language === 'ku' ? 'ئەفسەری دەروازە (Gate Officer)' : language === 'ar' ? 'أمن البوابات' : 'Security Gate Officer';
      case 'HR_MANAGER':
        return language === 'ku' ? 'بەڕێوەبەری سەرچاوە مرۆییەکان' : language === 'ar' ? 'مدير الموارد البشرية' : 'HR Manager';
      case 'HSE_OFFICER':
        return language === 'ku' ? 'ئەفسەری سەلامەتی (HSE)' : language === 'ar' ? 'مسؤول السلامة والصحة' : 'HSE Safety Officer';
      case 'TECHNICAL_HEAD':
        return language === 'ku' ? 'بەرپرسی تەکنیکی و کارەبا' : language === 'ar' ? 'المسؤول الفني والكهرباء' : 'Technical & Power Head';
      default:
        return role;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'HOLDING_OWNER':
        return 'bg-amber-100 text-amber-900 border-amber-300 font-extrabold';
      case 'SUPER_ADMIN':
        return 'bg-purple-100 text-purple-900 border-purple-300 font-bold';
      case 'COMPANY_GM':
        return 'bg-blue-100 text-blue-900 border-blue-300 font-bold';
      case 'PROJECT_MANAGER':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold';
      case 'EMPLOYEE':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'FINANCE_HEAD':
        return 'bg-teal-100 text-teal-900 border-teal-300';
      default:
        return 'bg-indigo-100 text-indigo-900 border-indigo-300';
    }
  };

  // Group modules by category for clean visual organization
  const modulesByCategory = {
    EXECUTIVE: ALL_SYSTEM_MODULES.filter(m => m.category === 'EXECUTIVE'),
    CORE_OPERATIONS: ALL_SYSTEM_MODULES.filter(m => m.category === 'CORE_OPERATIONS'),
    FIELD_INFRA: ALL_SYSTEM_MODULES.filter(m => m.category === 'FIELD_INFRA'),
    ADMIN_PEOPLE: ALL_SYSTEM_MODULES.filter(m => m.category === 'ADMIN_PEOPLE'),
  };

  const categoryTitles = {
    EXECUTIVE: {
      en: 'Executive & Strategic Governance',
      ku: 'سەرۆکایەتی و بەڕێوەبردنی ستراتیژی هۆلدینگ',
      ar: 'الحوكمة المركزية والرئاسية للمجموعة'
    },
    CORE_OPERATIONS: {
      en: 'Core Operations, Procurement & Logistics',
      ku: 'ئۆپەراسیۆنە سەرەکییەکان، کڕین و کۆگا',
      ar: 'العمليات الأساسية والمشتريات والمستودعات'
    },
    FIELD_INFRA: {
      en: 'Field Infrastructure, Safety & Power',
      ku: 'ژێرخانی مەیدانی، سەلامەتی (HSE) و کارەبا',
      ar: 'البنية التحتية الميدانية والسلامة والكهرباء'
    },
    ADMIN_PEOPLE: {
      en: 'Personnel, HR Payroll, Legal & IT',
      ku: 'ستاف، مووچە، نوسراوی فەرمی و ئایتی',
      ar: 'الموارد البشرية والرواتب والكتب الرسمية و IT'
    }
  };

  const avatarOptions = ['👑', '🏢', '📐', '👷', '💼', '📦', '🛡️', '⚡', '👨‍💼', '👩‍💼', '🛠️', '🚚'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-6xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-slate-800">
        
        {/* Header Bar */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-950/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-md font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  {getUIText(language, {
                    en: 'User Roles & Access Permissions Management (RBAC)',
                    ku: 'بەڕێوەبردنی ڕۆڵی بەکارهێنەران و دەسەڵاتەکان (User Roles & Permissions)',
                    ar: 'إدارة أدوار المستخدمين وصلاحيات الوصول للنظام'
                  })}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold">
                  {language === 'ku' ? 'تایبەت بە خاوەنی هۆلدینگ' : 'Owner Exclusive'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {getUIText(language, {
                  en: 'Define user roles (General Manager, Project Manager, Employee) and configure module access across holding, subsidiaries, and projects.',
                  ku: 'دیاریکردنی ڕۆڵەکان وەک "بەڕێوەبەری گشتی"، "بەڕێوەبەری پرۆژە"، و "کارمەند" بۆ ئەوەی هەرکەس تەنها بەشە پەیوەندیدارەکانی کارەکەی ببینێت.',
                  ar: 'تحديد أدوار المستخدمين وضبط صلاحيات رؤية الأقسام حسب الاختصاص في المجموعة والشركات والمشاريع.'
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsUserRolesModalOpen(false)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Floating Toast Notification */}
        {saveToast && (
          <div className="absolute top-18 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xl flex items-center gap-2 animate-in slide-in-from-top-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{saveToast}</span>
          </div>
        )}

        {/* Content Body: Split view if editing, or full table */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">

          {/* Top Controls: Filter Pills & Search & Add Button */}
          {(!editingUserId && !isCreatingNew) && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {[
                  { id: 'ALL', labelKu: 'هەموو بەکارهێنەران', labelEn: 'All Users' },
                  { id: 'HOLDING_OWNER', labelKu: 'خاوەنی هۆلدینگ', labelEn: 'Owners' },
                  { id: 'COMPANY_GM', labelKu: 'بەڕێوەبەری گشتی (GM)', labelEn: 'Company GM' },
                  { id: 'PROJECT_MANAGER', labelKu: 'بەڕێوەبەری پڕۆژە (PM)', labelEn: 'Project PM' },
                  { id: 'EMPLOYEE', labelKu: 'کارمەند (Employee)', labelEn: 'Employees' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setRoleFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                      roleFilter === tab.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white hover:bg-slate-200/60 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {language === 'ku' ? tab.labelKu : tab.labelEn}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={language === 'ku' ? 'گەڕان بەپێی ناو یان ڕۆڵ...' : 'Search by name or role...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 w-full sm:w-56"
                />

                <button
                  onClick={startCreateUser}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-xs transition cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>{language === 'ku' ? 'زیادکردنی کەس' : 'Add User'}</span>
                </button>
              </div>
            </div>
          )}

          {/* ACTIVE EDITING / CREATING FORM DRAWER */}
          {(editingUserId || isCreatingNew) ? (
            <div className="bg-slate-50 border-2 border-indigo-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                    {formAvatar}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      {isCreatingNew
                        ? (language === 'ku' ? 'زیادکردنی بەکارهێنەری نوێ بۆ سیستەم' : 'Add New System User')
                        : (language === 'ku' ? `دەستکاریکردنی ڕۆڵ و دەسەڵاتەکانی: ${formName}` : `Configure Role & Permissions: ${formName}`)}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {language === 'ku'
                        ? 'دیاریکردنی ڕۆڵ و سنووردارکردنی دەستگەیشتن بە بەشەکانی هۆلدینگ و کۆمپانیا و پرۆژەکان'
                        : 'Assign designated role and toggle granular module visibility.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={cancelEdit}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
                  >
                    {language === 'ku' ? 'پەشیمانبوونەوە' : 'Cancel'}
                  </button>
                  <button
                    onClick={saveUserChanges}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold shadow-md transition cursor-pointer"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>{language === 'ku' ? 'پاشەکەوتکردنی دەسەڵاتەکان' : 'Save Permissions'}</span>
                  </button>
                </div>
              </div>

              {/* Grid 1: Basic Identity & Role Definition */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'ku' ? 'ناوی تەواو' : 'Full Name'} *
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. احمد کەریم"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* System Role Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'ku' ? 'ڕۆڵی فەرمی لە سیستەم (User Role)' : 'Designated System Role'} *
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-indigo-900 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="COMPANY_GM">🏢 بەڕێوەبەری گشتی (General Manager - GM)</option>
                    <option value="PROJECT_MANAGER">📐 بەڕێوەبەری پرۆژە (Project Manager - PM)</option>
                    <option value="EMPLOYEE">👷 کارمەند (Employee - Self Service)</option>
                    <option value="HOLDING_OWNER">👑 خاوەنی هۆلدینگ (Holding Owner)</option>
                    <option value="SUPER_ADMIN">⚡ سوپەر ئەدمین (Super Admin)</option>
                    <option value="FINANCE_HEAD">💼 بەڕێوەبەری دارایی (Chief Financial Officer)</option>
                    <option value="WAREHOUSE_OFFICER">📦 بەرپرسی کۆگا (Warehouse Controller)</option>
                    <option value="SECURITY_GATE">🛡️ ئەفسەری دەروازە (Gate Officer)</option>
                    <option value="HR_MANAGER">👥 بەڕێوەبەری سەرچاوە مرۆییەکان (HR Manager)</option>
                    <option value="HSE_OFFICER">🦺 ئەفسەری سەلامەتی مەیدانی (HSE Officer)</option>
                    <option value="TECHNICAL_HEAD">⚙️ بەرپرسی تەکنیکی و کارەبا (Technical Head)</option>
                  </select>
                </div>

                {/* Job Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'ku' ? 'ناونیشانی وەزیفی (Job Title)' : 'Official Position'}
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. بەڕێوەبەری گشتی کۆمپانیای چیمەنتۆ"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Avatar Icon */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'ku' ? 'ئایکۆنی کەسایەتی' : 'Avatar Icon'}
                  </label>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {avatarOptions.map(emoji => (
                      <button
                        type="button"
                        key={emoji}
                        onClick={() => setFormAvatar(emoji)}
                        className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition cursor-pointer ${
                          formAvatar === emoji
                            ? 'bg-indigo-600 text-white scale-110 shadow-xs'
                            : 'bg-white border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Grid 2: Company & Project Scope Association */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 border-t border-slate-200/80">
                {/* Company Link */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'ku' ? 'کۆمپانیای پەیوەندیدار (Subsidiary)' : 'Assigned Company'}
                  </label>
                  <select
                    value={formCompanyId}
                    onChange={(e) => setFormCompanyId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">{language === 'ku' ? 'سەرجەم کۆمپانیاکان (هۆلدینگ بە گشتی)' : 'All Companies (Holding Wide)'}</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>
                        {language === 'ku' && c.nameKu ? c.nameKu : c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Project Link */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'ku' ? 'پڕۆژەی پەیوەندیدار (Project)' : 'Assigned Project'}
                  </label>
                  <select
                    value={formProjectId}
                    onChange={(e) => setFormProjectId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">{language === 'ku' ? 'سەرجەم پڕۆژەکان' : 'All Projects'}</option>
                    {projects
                      .filter(p => !formCompanyId || p.companyId === formCompanyId)
                      .map(p => (
                        <option key={p.id} value={p.id}>
                          {language === 'ku' && p.nameKu ? p.nameKu : p.name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'ku' ? 'ئیمەیڵ' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="user@holding.com"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'ku' ? 'ژمارەی مۆبایل' : 'Phone Number'}
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+964 750 000 0000"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Granular Module Permissions Section */}
              <div className="pt-4 border-t border-slate-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <Key className="w-4 h-4 text-indigo-600" />
                      <span>
                        {language === 'ku'
                          ? 'دەسەڵاتی دەستگەیشتن بە بەشەکانی سیستەم (Accessible Modules Matrix)'
                          : 'Granular Module Access Matrix'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[11px] font-bold">
                        {formModules.length} / {ALL_SYSTEM_MODULES.length} {language === 'ku' ? 'بەش چالاکە' : 'Enabled'}
                      </span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {language === 'ku'
                        ? 'هەر بەشێک دیاری بکرێت لە مێنیوی سەرەکی و داشبۆردی ئەم بەکارهێنەرەدا دەردەکەوێت، بەشە دیارینەکراوەکان بە تەواوی دەشاردرێنەوە.'
                        : 'Checked modules will appear in this user navigation menu and dashboard; unchecked modules will be completely locked and hidden.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={resetToRoleDefaults}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
                      title="Reset modules to standard defaults for this role"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{language === 'ku' ? 'گەڕاندنەوە بۆ ستانداردی ڕۆڵ' : 'Reset to Role Defaults'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={selectAllModules}
                      className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition cursor-pointer"
                    >
                      {language === 'ku' ? 'هەمووی' : 'Select All'}
                    </button>

                    <button
                      type="button"
                      onClick={clearAllModules}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition cursor-pointer"
                    >
                      {language === 'ku' ? 'سڕینەوەی هەمووی' : 'Deselect All'}
                    </button>
                  </div>
                </div>

                {/* 4 Categorized Columns / Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(Object.keys(modulesByCategory) as (keyof typeof modulesByCategory)[]).map(catKey => {
                    const catModules = modulesByCategory[catKey];
                    const catTitle = categoryTitles[catKey];

                    return (
                      <div key={catKey} className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <span className="text-xs font-extrabold text-slate-800">
                            {language === 'ku' ? catTitle.ku : catTitle.en}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {catModules.filter(m => formModules.includes(m.id)).length}/{catModules.length}
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          {catModules.map(module => {
                            const isChecked = formModules.includes(module.id);

                            return (
                              <label
                                key={module.id}
                                className={`flex items-start gap-2.5 p-2 rounded-xl border transition cursor-pointer ${
                                  isChecked
                                    ? 'bg-indigo-50/70 border-indigo-200 text-indigo-950 font-semibold'
                                    : 'bg-slate-50/50 hover:bg-slate-100/60 border-slate-200/60 text-slate-600'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleModule(module.id)}
                                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                                />
                                <div className="flex-1 text-xs">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold">
                                      {language === 'ku' ? module.nameKu : module.nameEn}
                                    </span>
                                    {isChecked && (
                                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-200/60 text-indigo-800 font-bold">
                                        ڕێگەپێدراو
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                                    {language === 'ku' ? module.descriptionKu : module.descriptionEn}
                                  </p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>

              {/* Bottom Sticky Action Bar in Edit Form */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  {language === 'ku' ? 'پەشیمانبوونەوە' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={saveUserChanges}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-md transition cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>{language === 'ku' ? 'پاشەکەوتکردنی دەسەڵاتەکان' : 'Save Permissions'}</span>
                </button>
              </div>

            </div>
          ) : (

            /* USERS DIRECTORY TABLE VIEW */
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-100/90 text-slate-700 uppercase font-black text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">{language === 'ku' ? 'بەکارهێنەر' : 'User Persona'}</th>
                      <th className="py-3 px-4">{language === 'ku' ? 'ڕۆڵی دەسەڵات (Role)' : 'System Role'}</th>
                      <th className="py-3 px-4">{language === 'ku' ? 'کۆمپانیا و پڕۆژە' : 'Scope (Company/Project)'}</th>
                      <th className="py-3 px-4">{language === 'ku' ? 'بەشە ڕێگەپێدراوەکان' : 'Allowed Modules'}</th>
                      <th className="py-3 px-4 text-center">{language === 'ku' ? 'کردارەکان' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredUsers.map((user) => {
                      const isOwnerRole = user.role === 'HOLDING_OWNER';
                      const isCurrentActive = currentUser.id === user.id;
                      
                      // Calculate accessible modules count
                      const allowedCount = user.accessibleModules && Array.isArray(user.accessibleModules)
                        ? user.accessibleModules.length
                        : (DEFAULT_ROLE_PERMISSIONS[user.role]?.length || 0);

                      const userCompany = companies.find(c => c.id === user.companyId);
                      const userProject = projects.find(p => p.id === user.projectId);

                      return (
                        <tr
                          key={user.id}
                          className={`hover:bg-slate-50/80 transition ${
                            isCurrentActive ? 'bg-indigo-50/40' : ''
                          }`}
                        >
                          {/* User Persona & Title */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-lg shadow-2xs">
                                {user.avatar || '👤'}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                                  <span>{user.name}</span>
                                  {isCurrentActive && (
                                    <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-extrabold border border-emerald-300">
                                      {language === 'ku' ? 'ئێستا چالاکە' : 'Active Now'}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500 leading-tight">
                                  {user.title || user.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Role Badge */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] border ${getRoleColor(user.role)}`}>
                              <Shield className="w-3 h-3" />
                              <span>{getRoleDisplayName(user.role)}</span>
                            </span>
                          </td>

                          {/* Scope / Assignment */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5 text-[11px]">
                              <div className="flex items-center gap-1 text-slate-700 font-semibold">
                                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                <span>
                                  {userCompany ? (language === 'ku' && userCompany.nameKu ? userCompany.nameKu : userCompany.name) : (language === 'ku' ? 'سەرجەم هۆلدینگ' : 'Holding Wide')}
                                </span>
                              </div>
                              {userProject && (
                                <div className="flex items-center gap-1 text-slate-500">
                                  <FolderKanban className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{language === 'ku' && userProject.nameKu ? userProject.nameKu : userProject.name}</span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Accessible Modules Metric */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200">
                                {isOwnerRole ? `${ALL_SYSTEM_MODULES.length}/${ALL_SYSTEM_MODULES.length} (تەواو)` : `${allowedCount}/${ALL_SYSTEM_MODULES.length}`}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {isOwnerRole ? 'دەسەڵاتی بێسنوور' : 'بەشی چالاک'}
                              </span>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 whitespace-nowrap text-center">
                            <div className="inline-flex items-center gap-1.5">
                              {/* Edit Permissions Button */}
                              <button
                                onClick={() => startEditUser(user)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 text-xs font-bold transition cursor-pointer"
                                title="Edit role & configure granular modules"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>{language === 'ku' ? 'دەستکاری دەسەڵات' : 'Edit Access'}</span>
                              </button>

                              {/* Switch Impersonation Persona Button */}
                              <button
                                onClick={() => switchImpersonation(user)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                                  isCurrentActive
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                                }`}
                                title="Log in as this user to test visible modules"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>{isCurrentActive ? (language === 'ku' ? 'هەڵبژێردراوە' : 'Active') : (language === 'ku' ? 'چوونەژوورەوە' : 'Switch')}</span>
                              </button>

                              {/* Delete button (owner cannot be deleted) */}
                              {!isOwnerRole && (
                                <button
                                  onClick={() => handleDelete(user.id, user.name)}
                                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition cursor-pointer"
                                  title="Remove user"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Explanatory Info Card */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-start gap-3 text-xs text-indigo-950">
                <HelpCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold block mb-1">
                    {language === 'ku' ? 'ڕێنمایی دەسەڵاتەکانی سیستەم (Role-Based Access Control):' : 'System RBAC Guidance:'}
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-indigo-900/80">
                    <li>
                      <strong>خاوەنی هۆلدینگ (Holding Owner):</strong> بەردەوام دەسەڵاتی تەواوی بەسەر هەموو بەش و پەسەندکردنە داراییەکان و ڕێکخستنی سیستەمدا هەیە.
                    </li>
                    <li>
                      <strong>بەڕێوەبەری گشتی (General Manager):</strong> بەڕێوەبردنی کۆمپانیا و پڕۆژەکانی، و پەسەندکردنی کارە ئیدارییەکان و ڕاپۆرتەکان.
                    </li>
                    <li>
                      <strong>بەڕێوەبەری پرۆژە (Project Manager):</strong> دەسەڵاتی تایبەت بە مەیدان، پێشکەوتنی گانت، داواکاری کڕین، سکێنەر، کرێکاران و کۆگا.
                    </li>
                    <li>
                      <strong>کارمەند (Employee):</strong> تەنها دەسەڵاتی بینینی بەشە تایبەتییەکانی وەک داواکاری کڕینی خۆی و پەیوەندییەکان و کەمپی مانەوەی هەیە.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              {language === 'ku'
                ? 'دەسەڵاتەکان لەسەر ئاستی هۆلدینگ، کۆمپانیا و پڕۆژە پارێزراون'
                : 'Role permissions enforced across Holding, Subsidiaries, and Site Projects'}
            </span>
          </div>

          <button
            onClick={() => setIsUserRolesModalOpen(false)}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer"
          >
            {language === 'ku' ? 'داخستن' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
