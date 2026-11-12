/**
 * Utility for exporting and printing the Complete Trilingual SAS4ERP User Manual as PDF
 * Uses browser-native typography rendering engine for 100% accurate Kurdish (Sorani),
 * Arabic RTL shaping, and English formatting with page-break controls across all 21 modules.
 */

export interface ManualPrintOptions {
  includeKurdish: boolean;
  includeEnglish: boolean;
  includeArabic: boolean;
}

export function openUserManualPrintView(options: ManualPrintOptions) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to view and download the PDF user manual.');
    return;
  }

  const kuSection = options.includeKurdish ? `
    <div class="lang-section rtl" dir="rtl">
      <div class="section-badge">بەشی یەکەم • زمان: کوردی سۆرانی (٢١ بەش)</div>
      <h1 class="main-title">ڕێبەری گشتگیری بەکارهێنانی سیستەمی کارگێڕی SAS4ERP</h1>
      <p class="lead-text">
        دۆکیومێنتی فەرمی و دەستووری کارپێکردنی سەرجەم بەشەکان و پڕۆسە کارگێڕی و مەیدانییەکان بۆ خاوەنی هۆڵدینگ، بەڕێوەبەرانی گشتی، بەڕێوەبەرانی پڕۆژە و کارمەندان.
      </p>

      <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 12px; padding: 14px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 8px 0; color: #1e3a8a; font-size: 14px;">★ خاڵە جیاکارییە سەرەکییەکانی SAS4ERP لەگەڵ سیستەمەکانی تر:</h3>
        <ul style="margin: 0; padding-right: 18px; font-size: 12px; color: #1e293b;">
          <li><strong>١. بەکارهێنانی ٣ زمانی هاوکات لە یەک سیستەمدا:</strong> هەر بەکارهێنەرێک (خاوەن هۆڵدینگ بە کوردی، ئەندازیار بە ئینگلیزی، بەڵێندەر بە عەرەبی) لە یەک ساتدا بە زمانی دڵخوازی خۆی داتاکان دەبینێت.</li>
          <li><strong>٢. دروستبوونی خۆکارانەی ٩ بەش و کەمپی نیشتەجێبوون:</strong> دەستبەجێ بە تۆمارکردنی هەر کۆمپانیا یان پڕۆژەیەک، هەموو بەشەکانی بۆ دادەمەزرێت بەبێ پێویستی بە دروستکردنی دەستی.</li>
          <li><strong>٣. گۆڕەری دوولایەنەی فۆرماتەکان (Word ⇄ PDF):</strong> گۆڕینی خێرای پەڕگەی وۆرد بۆ پی دی ئێف و بە پێچەوانەشەوە لەناو خودی سیستەمدا.</li>
          <li><strong>٤. هاوردەکردنی داتا و بەڵگەنامە بە Drag & Drop:</strong> هەر بەشێک سەکۆی فڕێدانی فایلەکانی هەیە بۆ ڕێگری لە کات بەفیڕۆدان بە دووبارە نووسینەوە.</li>
          <li><strong>٥. ڕاداری ژیری دەستکرد (AI Sentinel) و کارکردنی ئۆفلاین (Offline PWA):</strong> چاودێری فێڵ و کارکردنی بەردەوام بەبێ ئینتەرنێت.</li>
          <li><strong>٦. دەستکاریکردنی تێبینی چەسپاو، پەسەندکردن و بودجە بە شێوازی ڕاستەوخۆ:</strong> توانای دەستکاریکردنی ڕاستەوخۆی Sticky Notes، واژۆکردنی داواکارییە هەڵپەسێردراوەکان، و گۆڕینی ژمارەکانی بودجە و داتاکان لە کاتی پێویستدا.</li>
        </ul>
      </div>

      <h2>١. لایسنس، ماوەی تاقیکردنەوەی ١٤ ڕۆژ و قفڵی ئامێر (Hardware Lock)</h2>
      <p>سیستەمی SAS4ERP بە شێوەی خزمەتگوزاری پێشکەش دەکرێت. کاتێک کۆمپانیایەک یان هۆڵدینگێک وەریدەگرێت، ئەم پرۆسانە پێویستە جێبەجێ بکرێن:</p>
      <ul>
        <li><strong>ماوەی تاقیکردنەوەی ١٤ ڕۆژ (14-Day Free Trial):</strong> کاتێک سیستەم لەسەر ئامێر دادەنرێت، بۆ ماوەی دوو هەفتە بە تەواوی تایبەتمەندییەکانەوە بەخۆڕایی کار دەکات بێ داواکردنی کلیل.</li>
        <li><strong>کلیل و بەستنەوەی ئامێر (Hardware Lock):</strong> خاوەنی سیستەم کلیلی چالاککردن دەدات، و سیستمەکە کلیلیەکە دەبەستێتەوە بە ئامێرەکەوە تا کەسی تر نەتوانێت بیبات.</li>
      </ul>

      <h2>٢. دیاریکردنی ڕۆڵی بەکارهێنەران و دەسەڵاتەکان (User Roles & RBAC Matrix)</h2>
      <ul>
        <li><strong>خاوەنی هۆڵدینگ (Holding Owner):</strong> دەسەڵاتی تەواوی سیستەم، واژۆی تایبەت بۆ پارە، پەسەندکردنی بودجە، گۆڕینی ڕۆڵەکان و مۆڵەتی لایسنس.</li>
        <li><strong>بەڕێوەبەری گشتی (General Manager - GM):</strong> بەڕێوەبردنی لق و کۆمپانیاکەی خۆی، پەسەندکردنی داواکارییە ناوەندییەکان و بینینی ڕاپۆرتە گشتییەکان.</li>
        <li><strong>بەڕێوەبەری پرۆژە (Project Manager - PM):</strong> دەسەڵاتی مەیدانی تایبەت بە پڕۆژەی دیاریکراو: هێڵکاری گانت، کڕینی مەیدانی، کۆگا، سکێنەری دەروازە، کارەبا، سەلامەتی HSE، و کەمپی مانەوە.</li>
        <li><strong>کارمەند (Employee):</strong> دەسەڵاتی تەنها بۆ پێداویستی خۆی، بینینی شوێنی مانەوە، و پەیوەندی فەرمی؛ بەشە دارایی و سەرۆکایەتییەکان شاراوەن.</li>
        <li><strong>خشتەی ١٩ بەشی سیستەم:</strong> خاوەن هۆڵدینگ دەتوانێت دەسەڵاتی هەر بەشێک بە چێک بۆکس بدات یان بیبڕێت.</li>
      </ul>

      <h2>٣. هۆیەتی هۆڵدینگ و ستۆدیۆی واژۆ و مۆری ئەلیکترۆنی (E-Signature Studio)</h2>
      <p>ڕێکخستنی ناوی فەرمی هۆڵدینگ، ناوی سەرۆک، لۆگۆ، و کێشانی واژۆی دەستی بۆ واژۆکردنی فەرمیی پسوولەکان بە مۆری فەرمی.</p>

      <h2>٤. بەڕێوەبردنی کۆمپانیاکان و لقەکان (Companies & Subsidiaries)</h2>
      <p>بەڕێوەبردنی لقەکانی بیناسازی، نەوت، بازرگانی و پیشەسازی بە سەرمایەی کارپێکراو و دیاریکردنی بەڕێوەبەری گشتی.</p>

      <h2>٥. پڕۆژە نیشتمانییەکان، بەڵگەنامە و هێڵکاری گانت (Strategic Projects & Gantt)</h2>
      <p>بەدواداچوونی ڕۆژانە و مانگانەی قۆناغەکانی پڕۆژە بە هێڵکاری گانت، و واژۆکردنی ئەندازیاران و دەرهێنانی ڕاپۆرتی ئەندازیاری بە PDF.</p>

      <h2>٦. سووڕی داواکاری کڕین و زنجیرەی ڕەزامەندی سێقۆڵی (Procurement Workflow)</h2>
      <p>ئەندازیار لە مەیدان داواکاری پڕدەکاتەوە -> بەڕێوەبەری پڕۆژە و GM بودجە دەپشکنن -> بۆ داواکاری گەورە، واژۆی سەرۆکایەتی هۆلدینگ پێویستە.</p>

      <h2>٧. کۆگای مەیدانی، باڵانسی کەرەستە و هێڵی کەمترین ئاست (Warehouse Stock)</h2>
      <p>چاودێری کۆگاکان بۆ چیمەنتۆ، ئاسن، کەرەستە و سووتەمەنی، لەگەڵ هۆشداری پێشوەختە لە کاتی نزیکبوونەوە لە هێڵی مەترسی کەمبوونەوە.</p>

      <h2>٨. سکێنەری کامێرا لە دەروازە و پشکنینی بارکۆد (Gate Scanner)</h2>
      <p>ناسینەوەی بارکۆد و کۆدی QR لەسەر بارهەڵگرەکان لە دەروازەی پڕۆژە بە کامێرای مۆبایل و پەسەندکردنی دەستبەجێ بە کۆگا.</p>

      <h2>٩. دەروازەی قەپان، بارکردن و لۆجستی بارهەڵگرەکان (Weighbridge & Logistics)</h2>
      <p>تۆمارکردنی کێشی بارهەڵگر لە کاتی چوونە ژوورەوە و دەرچوون، و ژماردنی کێشی پوختەی کەرەستە لەگەڵ زانیاری شۆفێر.</p>

      <h2>١٠. چاودێری ژیری دەستکرد بۆ ڕێگری لە فێڵ (AI Anomaly Sentinel)</h2>
      <ul>
        <li><strong>فێڵی پارچەکردنی کڕین (Split PO):</strong> ئاشکراکردنی ئەو کەسانەی داواکارییە گەورەکان دەکەن بە چەند پسوولەیەکی بچووک تا نەکەوێتە ژێر واژۆی خاوەنی هۆلدینگ.</li>
        <li><strong>تۆماری دارایی کاتی نائاسایی:</strong> زەنگی ئاگاداری لێدەدات کاتێک لە کاتژمێر ٢ی شەو یان پشووەکان سەندی دارایی تۆمار دەکرێت.</li>
        <li><strong>کرێکاری وەهمی:</strong> بەراوردکردنی پەنجەمۆر بۆ ڕێگری لە خەرجکردنی مووچەی کرێکاری ساختە.</li>
      </ul>

      <h2>١١. کەمپی نیشتەجێبوون و هۆڵی نووستنی کرێکاران (Living Camps & Rooms)</h2>
      <p>چاودێری ژمارەی ژوور و تەختەی خەوتن، پاکوخاوێنی، خواردنی کرێکاران و بارودۆخی ژینگەیی لە پڕۆژە دوورەدەستەکان.</p>

      <h2>١٢. وێستگەکانی کارەبا، مۆلیدەکان و سووتەمەنی (Power Generators & Fuel)</h2>
      <p>تۆماری کاتژمێرەکانی کارکردنی مۆلیدە، ئاستی سوتەمەنی، گۆڕینی ڕۆن و فلتەر، و کاتی پچڕانی کارەبای نیشتمانی.</p>

      <h2>١٣. سەلامەتی پیشەیی، ژینگە و تەندروستی (HSE Incident & Safety)</h2>
      <p>تۆمارکردنی کاتژمێری بێ ڕووداوی لەدەستدانی کار (LTI)، پشکنینی ئاگرکوژێنەوە و کەرەستەی سەلامەتی تاکەکەسی.</p>

      <h2>١٤. بەڕێوەبردنی ئامێرە قورسەکان و بەقاڵکردن (Heavy Machinery Fleet)</h2>
      <p>بەدواداچوونی شوێنی شۆفڵ و حەفارە، کاتژمێرەکانی کارکردنی ڕۆژانە و خشتەی چاکسازی دەوری.</p>

      <h2>١٥. کۆنتڕۆڵی کوالێتی و تاقیگەی کۆنکرێت و ئاسن (QC Lab Testing)</h2>
      <p>تۆمارکردنی تاقیکردنەوەی تەقینی کۆنکرێت (٧ و ٢٨ ڕۆژ)، تاقیکردنەوەی ڕاکێشانی ئاسن و دەرچوونی بڕوانامەی پەسەندکردن.</p>

      <h2>١٦. ژمێریاری و سەندی دارایی یەکگرتووی هۆڵدینگ (Financial Ledger & Cash)</h2>
      <p>تەرازووی پێداچوونەوە، باڵانسی بانکی کۆمپانیاکان، قەرزی بەڵێندەران و پێشبینی کاشی هۆڵدینگ بۆ مانگەکانی داهاتوو.</p>

      <h2>١٧. فاکتوورەی نێوان کۆمپانیاکان (Intercompany Invoicing)</h2>
      <p>دەرکردنی فاکتوورەی ناوخۆیی کاتێک کۆمپانیایەکی هۆڵدینگ کەرەستە دەدات بە کۆمپانیایەکی تری ناو هەمان هۆڵدینگ.</p>

      <h2>١٨. گرێبەستەکان، وەبەرهێنەران و بەڵێندەرانی لاوەکی (Subcontractor & Investor)</h2>
      <p>بەڕێوەبردنی گرێبەستە داراییەکان، زەمانەتی بانکی (LG) و خشتەی پشکی وەبەرهێنەران.</p>

      <h2>١٩. کارمەندان، مووچە و ماوەی ئیقامەی بیانیان (HR & Foreign Labor Iqama)</h2>
      <p>ئاگادارکردنەوەی ٣٠ ڕۆژ پێش بەسەرچوونی ئیقامە و ڤیزای کرێکاران و ئەندازیارانی بیانی بۆ ڕێگری لە سزای دەوڵەت.</p>

      <h2>٢٠. کارکردن لە دۆخی بێ ئینتەرنێت و تۆڕی خۆجێیی (Offline PWA & Local Mesh)</h2>
      <p>سیستەم بە تەواوی لە دۆخی بێ ئینتەرنێت کار دەکات بەهۆی Service Worker و بە گەڕانەوەی هێڵ داتاکان سینک دەبنەوە.</p>

      <h2>٢١. ستۆدیۆی دۆکیومێنت و گۆڕەری وۆرد ⇄ پی دی ئێف (Word ⇄ PDF Converter)</h2>
      <p>توانای گۆڕینی خێرای فایلی وۆرد (.docx) بۆ فایلی پی دی ئێف (PDF) و بە پێچەوانەشەوە، بە پشتگیری دەقی کوردی و عەرەبی.</p>
    </div>
  ` : '';

  const enSection = options.includeEnglish ? `
    <div class="lang-section ltr" dir="ltr">
      <div class="section-badge">Section 2 • Language: English (All 21 Modules)</div>
      <h1 class="main-title">SAS4ERP Enterprise Operations Manual & Guide</h1>
      <p class="lead-text">
        Official comprehensive technical and field documentation for Holding Owners, Managing Directors, Project Managers, and Operational Staff across all 21 modules.
      </p>

      <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 12px; padding: 14px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 8px 0; color: #1e3a8a; font-size: 14px;">★ Core Strategic Differentiators of SAS4ERP vs Legacy Systems:</h3>
        <ul style="margin: 0; padding-left: 18px; font-size: 12px; color: #1e293b;">
          <li><strong>1. Simultaneous Native Trilingual Operation:</strong> Every persona interacts in their native language simultaneously (Kurdish, English, Arabic) against unified live ledgers.</li>
          <li><strong>2. 0-Second Automated Department & Camp Provisioning:</strong> Instant automated creation of 9 specialized departments, housing camps, and GM profiles per entity.</li>
          <li><strong>3. Integrated Two-Way Word ⇄ PDF Studio:</strong> In-browser bi-directional conversion between Microsoft Word (.docx) and Adobe PDF files.</li>
          <li><strong>4. Universal Drag & Drop Data Ingestion:</strong> Zero retyping—drag and drop Excel spreadsheets, PDFs, and Word contracts straight into department files.</li>
          <li><strong>5. AI Anomaly Sentinel & True Offline-First PWA:</strong> Active ML fraud detection with 100% field operation in remote blackouts.</li>
          <li><strong>6. In-Place Dynamic Editing for Sticky Notes, Approvals & Live Budgets:</strong> Instant direct modification of executive sticky notes, pending approvals, and project/holding budget figures with immediate audit trails.</li>
        </ul>
      </div>

      <h2>1. Architecture, Licensing & 14-Day Free Trial</h2>
      <ul>
        <li><strong>14-Day Free Trial:</strong> Any new deployment operates in full-feature trial mode for 14 days without requiring immediate license entry.</li>
        <li><strong>Activation License & Hardware Lock:</strong> Production keys pair cryptographically with the host machine hardware identity to protect intellectual property.</li>
      </ul>

      <h2>2. Role-Based Access Control (RBAC) & Scope Assignment</h2>
      <ul>
        <li><strong>Holding Owner:</strong> Absolute governance across all entities, presidential digital approvals, budget overrides, and user role configuration.</li>
        <li><strong>Company General Manager (GM):</strong> Oversight of subsidiary operations, intercompany billing, project reporting, and executive comms.</li>
        <li><strong>Project Manager (PM):</strong> Field site operations: Gantt milestones, site purchase requisitions, warehouse batches, gate camera scanners, camps, and HSE.</li>
        <li><strong>Employee (Self-Service):</strong> Targeted access to personal requisition submissions, camp bed status, and direct comms; executive ledgers remain hidden.</li>
        <li><strong>19-Module Granular Matrix:</strong> The owner can toggle specific accessible modules per user with instant one-click reset to role defaults.</li>
      </ul>

      <h2>3. Holding Identity & Electronic Signature Studio</h2>
      <p>Configure holding chairman credentials, corporate logo, group capitalization, and capture stylus digital signatures for sign-offs.</p>

      <h2>4. Companies & Subsidiaries Portfolio</h2>
      <p>Centralized monitoring of industrial, petroleum, construction, and trading subsidiaries with performance KPIs.</p>

      <h2>5. Strategic Projects & Gantt Milestones</h2>
      <p>Real-time progress monitoring, variance tracking between planned vs actual completion, and engineer dossier generation.</p>

      <h2>6. Procurement Requisition & 3-Tier Multi-Signature Chain</h2>
      <p>Engineer requisition -> GM operational clearance -> Presidential Holding Owner digital sign-off for high-value orders.</p>

      <h2>7. Field Warehouse & Reorder Thresholds</h2>
      <p>Inventory management for cement, rebar, tools, and fuels with automated safety reorder warnings.</p>

      <h2>8. Gate Barcode/QR Camera Scanner</h2>
      <p>Live mobile camera scanning at site checkpoints, cross-verifying supplier waybills against released purchase orders.</p>

      <h2>9. Weighbridge Station & Dispatch Logistics</h2>
      <p>Gross and tare weight captures, net cargo calculation, driver manifests, and vehicle tracking.</p>

      <h2>10. AI Anomaly Sentinel & Fraud Prevention</h2>
      <p>Machine learning detection for split orders circumventing approval limits, off-hours ledger vouchers, and ghost worker payrolls.</p>

      <h2>11. Living Camps & Dormitories</h2>
      <p>Room allotments, bed occupancy metrics, catering audits, and hygiene inspections across remote site compounds.</p>

      <h2>12. Power Plants & Generator Telemetry</h2>
      <p>Generator run-hours, diesel telemetry, service intervals, and national grid outage failover logs.</p>

      <h2>13. HSE Safety & Environmental Compliance</h2>
      <p>Lost-Time Injury (LTI) counters, hazard incident logging, mandatory PPE checks, and fire safety drill schedules.</p>

      <h2>14. Heavy Machinery & Fleet Maintenance</h2>
      <p>Fleet tracking for excavators, mobile cranes, and mixers with maintenance scheduling and operator logs.</p>

      <h2>15. Quality Control (QC) & Concrete / Steel Labs</h2>
      <p>Compressive strength tests (7 & 28 days), tensile steel tests, and certified third-party lab reports.</p>

      <h2>16. Consolidated Financial Ledger & Banking</h2>
      <p>Consolidated multi-entity trial balance, cash-flow projections, and verified vendor ledger accounts.</p>

      <h2>17. Intercompany Invoicing & Bilateral Settlement</h2>
      <p>Automated internal billing when machinery or materials transfer between sister subsidiaries.</p>

      <h2>18. Subcontractor Agreements & Investor Portfolios</h2>
      <p>Capital contracts, bank Letters of Guarantee (LG), progress billing schedules, and investor returns.</p>

      <h2>19. Human Resources & Foreign Labor Residency (Iqama)</h2>
      <p>Personnel registry, payroll, and 30-day pre-expiry alerts for expat work permits and visas.</p>

      <h2>20. Offline-First PWA Mode & Local Mesh Sync</h2>
      <p>Built with Service Worker caching; remote field sites continue uninterrupted during internet blackouts and sync seamlessly upon reconnect.</p>

      <h2>21. Document Studio: Two-Way Word (.docx) ⇄ PDF Converter</h2>
      <p>Bi-directional document conversion between Microsoft Word (.docx) and Adobe PDF files with native Kurdish/Arabic RTL typesetting.</p>
    </div>
  ` : '';

  const arSection = options.includeArabic ? `
    <div class="lang-section rtl" dir="rtl">
      <div class="section-badge">الجزء الثالث • اللغة: العربية (٢١ قسماً)</div>
      <h1 class="main-title">دليل التشغيل والاستخدام الشامل لمنظومة SAS4ERP</h1>
      <p class="lead-text">
        الوثيقة الرسمية المتكاملة لإدارة المجموعة، الشركات التابعة، المشاريع الميدانية، واعتماد الصلاحيات لمالك المجموعة، المدراء العامين، ومدراء المشاريع والموظفين.
      </p>

      <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 12px; padding: 14px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 8px 0; color: #1e3a8a; font-size: 14px;">★ الخصائص الاستراتيجية الحصرية لمنظومة SAS4ERP مقارنة بالأنظمة التقليدية:</h3>
        <ul style="margin: 0; padding-right: 18px; font-size: 12px; color: #1e293b;">
          <li><strong>١. تشغيل ثلاث لغات متزامنة في نظام واحد:</strong> إمكانية تفاعل كل مستخدم بلغته المفضلة في نفس اللحظة (الكردية، الإنجليزية، العربية) على نفس قاعدة البيانات.</li>
          <li><strong>٢. التوليد التلقائي الفوري لـ ٩ أقسام وسكن العمال:</strong> إنشاء آلي مباشر للأقسام وسكن العمال وملف المدير العام لأي شركة أو مشروع جديد.</li>
          <li><strong>٣. استوديو تحويل المستندات المزدوج (Word ⇄ PDF):</strong> تحويل مباشر وسريع ثنائي الاتجاه بين ملفات Word وملفات PDF.</li>
          <li><strong>٤. استيراد المستندات بالسحب والإفلات (Drag & Drop):</strong> توفير مئات الساعات عبر سحب وإفلات ملفات Excel و PDF و Word فورياً دون إعادة كتابة.</li>
          <li><strong>٥. رادار الذكاء الاصطناعي (AI Sentinel) والتشغيل دون إنترنت:</strong> كشف الاحتيال وتجزئة المشتريات مع تشغيل ميداني متواصل ١٠٠٪ في المواقع المنقطعة.</li>
          <li><strong>٦. التعديل المباشر للملاحظات اللاصقة والموافقات وتحديث أرقام الميزانيات:</strong> إمكانية تحرير الملاحظات القيادية، البت في المعاملات المعلقة، وتعديل أرقام الميزانيات وأي رقم بالمنظومة فورياً.</li>
        </ul>
      </div>

      <h2>١. الهيكلية العامة، الترخيص، وفترة التجربة المجانية</h2>
      <ul>
        <li><strong>فترة تجربة مجانية لمدة ١٤ يوماً:</strong> يعمل النظام بكافة ميزاته لمدة أسبوعين مجاناً قبل المطالبة بمفتاح التفعيل.</li>
        <li><strong>مفتاح التفعيل وقفل العتاد (Hardware Lock):</strong> يتم قفل الترخيص برمز مشفر يرتبط بهوية الجهاز لحماية المنظومة.</li>
      </ul>

      <h2>٢. إدارة أدوار المستخدمين وصلاحيات الوصول (User Roles & RBAC)</h2>
      <ul>
        <li><strong>مالك المجموعة (Holding Owner):</strong> صلاحيات مطلقة للاعتماد المالي، توقيع الصفقات الكبرى، وتعيين الصلاحيات لجميع الأفراد.</li>
        <li><strong>المدير العام للشركة التابعة (Company GM):</strong> إدارة عمليات الشركة التابعة، الفواتير التبادلية، متابعة المشاريع، والمراسلات التنفيذية.</li>
        <li><strong>مدير المشروع الميداني (Project Manager):</strong> تقارير الإنجاز، مخطط جانت، طلبات الشراء الميدانية، المخازن، وماسح البوابات والسلامة.</li>
        <li><strong>الموظف الميداني (Employee):</strong> صلاحيات الخدمة الذاتية لطلبات الشراء الخاصة ومتابعة السكن، مع حجب الأقسام المالية الحساسة.</li>
        <li><strong>مصفوفة الـ ١٩ قسماً:</strong> إمكانية تخصيص الأقسام الظاهرة لكل مستخدم بمرونة مع زر استعادة الصلاحيات الافتراضية.</li>
      </ul>

      <h2>٣. هوية الهولدينغ واستوديو التوقيع والختم الإلكتروني</h2>
      <p>تحديد اسم رئيس الهولدينغ، الشعار الرسمي، الميزانية الكلية، وحفظ التواقيع الرقمية والأختام لاعتماد المعاملات فورياً.</p>

      <h2>٤. محفظة الشركات التابعة وإدارتها</h2>
      <p>عرض مالي وهيكلي لكافة شركات الهولدينغ (إنشاءات، نفط وغاز، تجارة، صناعة) مع تتبع ميزانياتها.</p>

      <h2>٥. المشاريع الاستراتيجية ومخطط جانت</h2>
      <p>متابعة الجداول الزمنية لتنفيذ المشاريع، وتحديد نسب الإنجاز، واستخراج تقارير الإنجاز الهندسية بصيغة PDF.</p>

      <h2>٦. دورة المشتريات وسلسلة الموافقات الثلاثية</h2>
      <p>تقديم الطلب الميداني -> تدقيق الميزانية من المدير العام -> الاعتماد والتوقيع الرقمي لمالك الهولدينغ.</p>

      <h2>٧. إدارة المستودعات والرصيد الأدنى الآمن</h2>
      <p>تتبع أرصدة الإسمنت والحديد وقطع الغيار، مع تنبيهات تلقائية عند اقتراب المواد من حد إعادة الطلب الأدنى.</p>

      <h2>٨. ماسح البوابات والباركود البصري</h2>
      <p>قراءة باركود شاحنات التوريد بكاميرا الهاتف للتحقق الفوري من أوامر الشراء وإدخال المواد إلى المخزن آلياً.</p>

      <h2>٩. ميزان القبان واللوجستيات والنقل</h2>
      <p>تسجيل الوزن القائم والفارغ للشاحنات، وحساب الوزن الصافي، وتوثيق بيانات السائق والوجهة بدقة.</p>

      <h2>١٠. رادار الذكاء الاصطناعي لكشف المخاطر والاحتيال (AI Sentinel)</h2>
      <p>كشف تجزئة طلبات الشراء، القيود المحاسبية خارج أوقات العمل، ومنع صرف رواتب العمالة الوهمية.</p>

      <h2>١١. مجمعات سكن العمال والإعاشة</h2>
      <p>توزيع الغرف، سعة الأسرة، متابعة التكييف والنظافة، والتفتيش الدوري على جودة الوجبات الغذائية.</p>

      <h2>١٢. محطات التوليد والمولدات الكهربائية</h2>
      <p>مراقبة استهلاك الوقود وساعات التشغيل وجداول تبديل الزيوت وانقطاع الكهرباء الوطنية.</p>

      <h2>١٣. السلامة المهنية والبيئة (HSE)</h2>
      <p>سجل الحوادث، مؤشر ساعات العمل الآمنة (LTI)، فحص معدات الوقاية الشخصية، ومطافئ الحريق.</p>

      <h2>١٤. أسطول الآليات الثقيلة والصيانة</h2>
      <p>متابعة الحفارات والرافعات، ساعات العمل الفعلية، وجداول الصيانة الوقائية وأسماء المشغلين.</p>

      <h2>١٥. ضبط الجودة وتجارب مختبر الخرسانة والحديد</h2>
      <p>نتائج فحص كسر الخرسانة (٧ و٢٨ يوماً)، وفحص شد حديد التسليح، وشهادات المطابقة الفنية.</p>

      <h2>١٦. القيود المحاسبية وميزان المراجعة الموحد</h2>
      <p>ميزان المراجعة العام، الحسابات البنكية، أرباح وخسائر الشركات التابعة، وتوقعات السيولة النقدية.</p>

      <h2>١٧. الفواتير التبادلية بين الشركات الشقيقة</h2>
      <p>تنظيم المعاملات المالية المتبادلة عند انتقال المعدات أو المواد بين شركات المجموعة بسلاسة.</p>

      <h2>١٨. عقود المقاولين من الباطن وخطابات الضمان</h2>
      <p>إدارة العقود الاستثمارية، خطابات الضمان البنكية، ودفعات المستخلصات الإنشائية.</p>

      <h2>١٩. الموارد البشرية وإقامات العمالة الأجنبية</h2>
      <p>ملفات الموظفين، الرواتب الشهرية، وتنبيهات تلقائية قبل ٣٠ يوماً من انتهاء إقامات وجوازات العمالة الأجنبية.</p>

      <h2>٢٠. التشغيل دون إنترنت والمزامنة المحلية (Offline PWA)</h2>
      <p>استمرار العمل بصورة كاملة في المواقع الميدانية المنقطعة بفضل تقنية Service Worker والمزامنة الفورية عند عودة الاتصال.</p>

      <h2>٢١. استوديو تحويل المستندات بين Word و PDF</h2>
      <p>أداة متطورة للتحويل المزدوج بين ملفات مايكروسوفت وورد (.docx) وملفات أدوبي (PDF) مع دعم كامل للاتجاه من اليمين إلى اليسار.</p>
    </div>
  ` : '';

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>SAS4ERP Comprehensive Enterprise User Manual (21 Modules)</title>
      <style>
        @page {
          size: A4;
          margin: 18mm 15mm 20mm 15mm;
        }
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .page-break {
            page-break-before: always;
          }
          .no-print {
            display: none !important;
          }
        }
        * {
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          color: #0f172a;
          background: #ffffff;
          line-height: 1.6;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 900px;
          margin: 0 auto;
        }
        .action-banner {
          background: #1e3a8a;
          color: white;
          padding: 16px 24px;
          border-radius: 16px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 4px 12px rgba(30, 58, 138, 0.2);
        }
        .print-btn {
          background: #fbbf24;
          color: #0f172a;
          border: none;
          padding: 10px 22px;
          font-size: 14px;
          font-weight: bold;
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .print-btn:hover {
          background: #f59e0b;
        }
        .header-cover {
          text-align: center;
          padding: 30px 20px;
          border-bottom: 3px double #cbd5e1;
          margin-bottom: 30px;
        }
        .cover-tag {
          display: inline-block;
          background: #dbeafe;
          color: #1e40af;
          font-weight: 800;
          font-size: 12px;
          padding: 4px 14px;
          border-radius: 9999px;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .cover-title {
          font-size: 28px;
          font-weight: 900;
          color: #1e3a8a;
          margin: 0 0 10px 0;
        }
        .cover-subtitle {
          font-size: 16px;
          color: #475569;
          margin: 0 0 16px 0;
        }
        .metadata-box {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 14px;
          font-size: 12px;
          margin-top: 20px;
          text-align: left;
        }
        .lang-section {
          padding: 24px 0;
          border-bottom: 2px dashed #e2e8f0;
        }
        .rtl {
          direction: rtl;
          text-align: right;
          font-family: "Segoe UI", Tahoma, Arial, sans-serif;
        }
        .ltr {
          direction: ltr;
          text-align: left;
        }
        .section-badge {
          display: inline-block;
          background: #e0e7ff;
          color: #3730a3;
          font-size: 12px;
          font-weight: bold;
          padding: 4px 12px;
          border-radius: 8px;
          margin-bottom: 12px;
        }
        .main-title {
          font-size: 22px;
          font-weight: 800;
          color: #1e3a8a;
          margin: 0 0 10px 0;
        }
        .lead-text {
          font-size: 13px;
          color: #475569;
          margin-bottom: 20px;
          background: #f1f5f9;
          padding: 12px;
          border-radius: 8px;
        }
        h2 {
          font-size: 16px;
          font-weight: 700;
          color: #2563eb;
          margin-top: 22px;
          margin-bottom: 8px;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 4px;
        }
        p {
          font-size: 12.5px;
          margin: 0 0 10px 0;
          color: #334155;
        }
        ul {
          margin: 0 0 16px 0;
          padding-left: 20px;
          padding-right: 20px;
        }
        li {
          font-size: 12px;
          margin-bottom: 6px;
          color: #1e293b;
        }
        li strong {
          color: #0f172a;
        }
        .footer {
          text-align: center;
          font-size: 11px;
          color: #94a3b8;
          padding: 20px 0;
          margin-top: 30px;
          border-top: 1px solid #e2e8f0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Floating Interactive Print Bar -->
        <div class="action-banner no-print">
          <div>
            <h3 style="margin: 0; font-size: 16px;">SAS4ERP Printable PDF User Manual (21 Modules)</h3>
            <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;">
              Click the button on the right to open the print dialog and choose "Save as PDF" for an executive high-resolution manual.
            </p>
          </div>
          <button class="print-btn" onclick="window.print()">
            🖨️ Save as PDF / Print
          </button>
        </div>

        <!-- Cover Header -->
        <div class="header-cover">
          <span class="cover-tag">SAS4ERP Enterprise Documentation</span>
          <h1 class="cover-title">SAS HOLDING ENTERPRISE ERP SYSTEM</h1>
          <p class="cover-subtitle">
            Comprehensive Operational Manual & Governance Guide (Kurdish • English • Arabic)
          </p>

          <div class="metadata-box">
            <div><strong>System Edition:</strong> SAS4ERP Enterprise v5.0 (21 Modules)</div>
            <div><strong>Date:</strong> November 2026</div>
            <div><strong>Target Audience:</strong> Holding Chairman, GMs, PMs & Engineers</div>
            <div><strong>Format:</strong> High-Resolution Multi-Page PDF Document</div>
          </div>
        </div>

        <!-- Sections Content -->
        ${kuSection}
        ${enSection}
        ${arSection}

        <div class="footer">
          SAS Holding Enterprise Group • Automated Dossier Export • All Rights Reserved 2026
        </div>
      </div>

      <script>
        // Automatically trigger print dialog after document finishes loading
        window.addEventListener('load', () => {
          setTimeout(() => {
            window.print();
          }, 600);
        });
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
