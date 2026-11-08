import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  ShadingType
} from 'docx';

export interface WhyChooseDocOptions {
  includeKurdish?: boolean;
  includeEnglish?: boolean;
  includeArabic?: boolean;
}

export const WHY_CHOOSE_POINTS = [
  {
    id: 1,
    titleKu: '١. مۆدێلی فرۆشتنی خزمەتگوزاری و بەکارهێنان نەک فرۆشتنی سیستەم (SaaS Utility Model)',
    descKu: 'ئێمە سیستەم نافرۆشین، بەڵکو تەنها مافی بەکارهێنان پێشکەش دەکەین. خاوەنی هۆڵدینگ دەتوانێت بەخۆڕایی بیدات بە هەر کۆمپانیایەکی ژێر دەستی، لەگەڵ ماوەی تاقیکردنەوەی ١٤ ڕۆژی بێبەرامبەر و قفڵی پارێزراوی ئامێر (Hardware Lock).',
    titleEn: '1. Service & Usage Model Instead of Selling the Software',
    descEn: 'We deliver software as a managed utility service rather than a one-time software license sale. The Holding Owner has full discretion to grant usage rights across any corporate subsidiary with a 14-day zero-risk trial and hardware-bound encryption.',
    titleAr: '١. نموذج تقديم خدمة الاستخدام وليس بيع النظام',
    descAr: 'نحن لا نبيع النظام كبرمجية مغلقة، بل نقدم رخصة خدمة استخدام متكاملة. يملك رئيس المجموعة كامل الصلاحية لمنح الاستخدام لأي شركة تابعة مجاناً، مع فترة تجربة مجانية لمدة ١٤ يوماً وقفل العتاد المشفر.'
  },
  {
    id: 2,
    titleKu: '٢. ڕاداری ژیری دەستکرد بۆ ڕێگری لە فێڵ و دزینی بودجە (AI Anomaly Sentinel)',
    descKu: 'سیستەمی ML بەردەوام بە شێوەی ئۆتۆماتیکی داتاکان دەپشکنێت: ئاشکراکردنی فێڵی پارچەکردنی داواکاری کڕین (Split POs)، تۆمارکردنی پسوولەی دارایی لە کاتژمێر ٢ی شەو، و ڕێگری لە کرێکاری وەهمی لە لیستی مووچەدا.',
    titleEn: '2. AI Anomaly Sentinel & Algorithmic Fraud Prevention',
    descEn: 'Real-time machine learning monitors financial and field ledger entries: detecting split purchase orders engineered to bypass approval caps, off-hours midnight postings, and phantom workforce payroll duplicates.',
    titleAr: '٢. رادار الذكاء الاصطناعي لمنع الاحتيال وهدر الميزانيات',
    descAr: 'نظام تعلّم آلي يراقب المعاملات الميدانية والمالية على مدار الساعة: كشف تجزئة أوامر الشراء لتفادي صلاحيات المالك، رصد القيود المحاسبية في أوقات غير اعتيادية، ومنع العمالة الوهمية.'
  },
  {
    id: 3,
    titleKu: '٣. واژۆی سەرۆکایەتی و مۆری فەرمی دیجیتاڵی (Presidential E-Signature & Seal)',
    descKu: 'خاوەنی هۆڵدینگ لە مۆبایل یان تابلێتەکەیەوە واژۆی دەستی و مۆری هۆڵدینگ پاشەکەوت دەکات، و بە یەک پەنجە مۆر و واژۆی دەخاتە سەر هەر کڕینێکی گەورە یان دۆکیومێنتێکی فەرمی بەبێ پێویستی بە کاغەز.',
    titleEn: '3. Presidential Digital E-Signature & Official Holding Seal',
    descEn: 'The Holding Owner captures handwritten stylus signatures and official corporate stamps directly in-app, authorizing multi-million purchase orders and executive dossiers with cryptographic verification.',
    titleAr: '٣. استوديو التوقيع والختم الرئاسي الرقمي',
    descAr: 'يتيح لمالك الهولدينغ رسم توقيعه اليدوي وحفظ الختم الرسمي للمجموعة، وتطبيق الاعتماد الرقمي على صفقات الشراء الكبرى والتقارير التنفيذية بضغطة زر واحدة دون ورق.'
  },
  {
    id: 4,
    titleKu: '٤. سکێنەری کامێرا لە دەروازە و بەستنەوەی ڕاستەوخۆ بە کۆگاکان (Live Gate Optical Scanner)',
    descKu: 'پاسەوانی پڕۆژە لە مەیداندا بە کامێرای مۆبایلەکەی بارکۆدی پسوولەی بارهەڵگر دەپشکنێت؛ بە پەسەندکردنی بارەکە، دەستبەجێ کەرەستەکان دەخرێنە سەر باڵانسی کۆگا و پێویست بە تۆماری دەستی ناکات.',
    titleEn: '4. Live Gate Optical Camera Scanner & Instant Warehouse Sync',
    descEn: 'Security checkpoint staff scan delivery waybills using any smartphone camera, cross-validating purchase order approvals in real time and automatically updating warehouse inventory.',
    titleAr: '٤. ماسح البوابات البصري والربط الفوري مع المستودعات',
    descAr: 'يقوم حراس بوابات المشاريع بمسح باركود شاحنات التوريد بكاميرا الهاتف؛ وعند التحقق، يتم إدخال المواد إلى رصيد المخزن فورياً دون أي تأخير ورقي.'
  },
  {
    id: 5,
    titleKu: '٥. کارکردنی تەواو لە دۆخی بێ ئینتەرنێت لە پڕۆژە دوورەدەستەکان (Offline-First PWA)',
    descKu: 'لە کێڵگە نەوتییەکان و پڕۆژە شاخاوییەکان کە هێڵی ئینتەرنێت دەپچڕێت، سیستەمەکە بە تەواوی کار دەکات؛ کرێکاران و ئەندازیاران داتاکان دەنووسن و لەگەڵ گەڕانەوەی هێڵ هەمووی خۆکار لەگەڵ هۆڵدینگ سینک دەبێتەوە.',
    titleEn: '5. True Offline-First PWA & Local Mesh Field Operation',
    descEn: 'Engineered with Service Worker and local database caching. Remote pipeline and desert construction sites continue full operations during network blackouts, syncing cleanly upon reconnection.',
    titleAr: '٥. التشغيل الكامل دون إنترنت في المشاريع الميدانية (Offline PWA)',
    descAr: 'يعمل النظام بكفاءة كاملة في المواقع النائية والمنقطعة عبر تقنية Service Worker، مع مزامنة سحابية تلقائية لكافة العمليات فور عودة الاتصال.'
  },
  {
    id: 6,
    titleKu: '٦. مصفوفەی وردی دەسەڵاتی کارمەندان بە ١٩ بەش (Granular 19-Module RBAC Matrix)',
    descKu: 'دابەشکردنی دەسەڵات بەسەر ٤ ئاستی سەرەکی (خاوەن هۆڵدینگ، GM، بەڕێوەبەری پڕۆژە، کارمەند) بە توانای زیادکردن و بڕینی هەر بەشێک لە لایەن خاوەن هۆڵدینگ بە چێک بۆکس.',
    titleEn: '6. Granular 19-Module Role-Based Access Control (RBAC)',
    descEn: 'Four calibrated enterprise personas (Holding Owner, General Manager, Project Manager, Employee) with a granular 19-module visibility matrix configurable exclusively by the holding owner.',
    titleAr: '٦. مصفوفة الصلاحيات الميدانية الدقيقة لـ ١٩ قسماً (RBAC Matrix)',
    descAr: 'توزيع الصلاحيات على ٤ مستويات قيادية مع تحكم دقيق في ظهور أو إخفاء أي من أقسام المنظومة الـ ١٩ بمرونة مطلقة لمالك المجموعة.'
  },
  {
    id: 7,
    titleKu: '٧. چاودێری و ئاگاداری پێشوەختەی ئیقامەی کرێکارانی بیانی (Foreign Labor 30-Day Alert)',
    descKu: 'سیستەم ٣٠ ڕۆژ پێش بەسەرچوونی ئیقامە و ڤیزای ئەندازیار و کرێکارانی بیانی ئاگاداری سوور دەدات، تا لە سزای دارایی قورسی حکومی و وەستاندنی کار ڕزگارتان بێت.',
    titleEn: '7. Automated 30-Day Expat Residency & Visa Expiration Safeguard',
    descEn: 'Automated advance notification engine flags foreign labor visas and residency (Iqama) papers 30 days before statutory expiration, preventing severe regulatory fines.',
    titleAr: '٧. إنذار مبكر لانتهاء إقامات العمالة الأجنبية قبل ٣٠ يوماً',
    descAr: 'نظام تنبيهات استباقي يراقب صلاحية إقامات وجوازات العمال والمهندسين الأجانب وينبه الإدارة قبل ٣٠ يوماً لتفادي الغرامات الحكومية وتعطل العمل.'
  },
  {
    id: 8,
    titleKu: '٨. ژێرخانی مەیدانی: کەمپ، مۆلیدەکان، تاقیگەی کۆنکرێت و ئامێری قورس',
    descKu: 'بەڕێوەبردنی تەواوی کەمپی مانەوەی کرێکاران، چاودێری سووتەمەنی مۆلیدەکان، ئەنجامی پشکنینی تاقیگەی شکاندنی کۆنکرێت (٧ و ٢٨ ڕۆژ)، و چاکسازی ئامێرە قورسەکان.',
    titleEn: '8. Complete Field Infrastructure: Camps, Generators, Heavy Fleet & QC Labs',
    descEn: 'Dedicated modules manage worker camp dorms, generator telemetry, compressive concrete cylinder slump/break lab tests, and heavy equipment preventive maintenance.',
    titleAr: '٨. إدارة البنية التحتية الميدانية: السكن، المولدات، والمختبرات',
    descAr: 'إدارة متكاملة لمجمعات سكن العمال، مراقبة وقود المولدات، نتائج فحص كسر الخرسانة المخبرية، وجداول صيانة الآليات الثقيلة.'
  },
  {
    id: 9,
    titleKu: '٩. فاکتوورەی نێوان کۆمپانیاکان (Intercompany Invoicing & Settlements)',
    descKu: 'چارەسەرکردنی گەورەترین کێشەی هۆڵدینگەکان کاتێک کۆمپانیایەکی هۆڵدینگ کەرەستە یان ئامێر دەدات بە کۆمپانیایەکی تر، بە فاکتوورەی ڕەسمی ناوخۆیی بەبێ ناکۆکی دارایی.',
    titleEn: '9. Bilateral Intercompany Invoicing & Internal Clearing',
    descEn: 'Eliminates cross-entity reconciliation headaches: automates internal invoicing and equipment transfer billing between sister subsidiaries within the holding umbrella.',
    titleAr: '٩. الفواتير التبادلية بين الشركات الشقيقة (Intercompany Billing)',
    descAr: 'معالجة أكبر معضلات المجموعات القابضة عند تبادل المواد والآليات بين الشركات التابعة، عبر قيود وفواتير تبادلية موحدة تمنع الخلافات المحاسبية.'
  },
  {
    id: 10,
    titleKu: '١٠. ستۆدیۆی گۆڕەری دوولایەنەی دۆکیومێنت: وۆرد ⇄ پی دی ئێف (Word ⇄ PDF Studio)',
    descKu: 'توانای گۆڕینی خێرای هەر فایلێکی وۆرد بۆ پی دی ئێف و بە پێچەوانەشەوە، لەگەڵ هەناردەکردنی دەستبەجێی ڕێبەر و دۆکیومێنتەکان بە فۆرماتی Word (.docx) و PDF بە ٣ زمان.',
    titleEn: '10. Integrated Two-Way Document Converter Studio (Word ⇄ PDF)',
    descEn: 'Embedded document engineering tools convert Word (.docx) to PDF and PDF to editable Word files directly in-browser with complete RTL Arabic/Kurdish typographic fidelity.',
    titleAr: '١٠. استوديو تحويل المستندات المزدوج (Word ⇄ PDF)',
    descAr: 'أداة متطورة للتحويل الفوري بين ملفات مايكروسوفت وورد وملفات أدوبي PDF مع الحفاظ على التنسيق واللغات الثلاث.'
  },
  {
    id: 11,
    titleKu: '١١. پشتگیری ڕەسەنی ٣ زمانی فەرمی (کوردی سۆرانی • English • العربية)',
    descKu: 'سیستەمەکە تەنها وەرگێڕانی سەرپێیی نییە، بەڵکو بە تایپۆگرافی تایبەت و دیزاینی ڕەسەنی کوردی و عەرەبی لەگەڵ ئینگلیزی بنیادنراوە بۆ بەڕێوەبردنی نێودەوڵەتی.',
    titleEn: '11. Native Trilingual Architecture (Kurdish Sorani • English • Arabic)',
    descEn: 'Purpose-built with native typographic layouts and RTL shaping tailored for executive holding operations across Kurdistan, Iraq, the Middle East, and global ventures.',
    titleAr: '١١. دعم أصيل للغات الثلاث (الكردية • الإنجليزية • العربية)',
    descAr: 'واجهات مصممة باحترافية لدعم اتجاه القراءة من اليمين إلى اليسار والخطوط الأصيلة لتلائم بيئة العمل في إقليم كردستان والعراق والشرق الأوسط.'
  },
  {
    id: 12,
    titleKu: '١٢. پاراستنی باڵا و تەواوی داتاکان لەژێر کۆنتڕۆڵی خۆت (Data Sovereignty)',
    descKu: 'هیچ داتایەکی دارایی یان نەهێنی کۆمپانیاکانتان نافرۆشرێت و ناچێتە دەرەوە؛ داتاکان لەناو کۆگای پارێزراوی خۆتان دەمێنێتەوە بە کۆدکردنی توندوتۆڵ.',
    titleEn: '12. Complete Data Sovereignty & Enterprise Cryptographic Security',
    descEn: 'Your corporate ledgers and strategic contracts never leave your custody. Zero data brokering, enterprise cryptographic standards, and strict local tenancy.',
    titleAr: '١٢. السيادة الكاملة على البيانات وأعلى معايير الأمان المشفر',
    descAr: 'جميع بيانات المجموعة المالية وعقود المشاريع تبقى تحت السيطرة الحصرية لمالك الهولدينغ، دون أي مشاركة خارجية مع تشفير سيادي متكامل.'
  }
];

/**
 * Generates Microsoft Word document (.docx) for "Why Choose SAS4ERP"
 */
export async function generateWhyChooseSAS4ERPDocx(options: WhyChooseDocOptions = {}): Promise<Blob> {
  const includeKu = options.includeKurdish !== false;
  const includeEn = options.includeEnglish !== false;
  const includeAr = options.includeArabic !== false;

  const children: (Paragraph | Table)[] = [];

  // Title Dossier
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120, before: 200 },
      children: [
        new TextRun({
          text: 'بۆچی ئەم سیستەمە بەکاربێنم؟ (خاڵە جیاکەرەوەکانی SAS4ERP)',
          bold: true,
          size: 34,
          color: '1E3A8A'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 150 },
      children: [
        new TextRun({
          text: 'Why Choose SAS4ERP? — Strategic Differentiators & Competitive Matrix',
          bold: true,
          size: 24,
          color: '2563EB'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 260 },
      children: [
        new TextRun({
          text: 'لماذا استخدام منظومة SAS4ERP؟ — المزايا التنافسية والخصائص الاستراتيجية الحصرية',
          bold: true,
          size: 22,
          color: '0F172A'
        })
      ]
    }),

    // Enterprise metadata
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: 'بەڵگەنامە / Document: ', bold: true }),
                    new TextRun({ text: 'Executive Value Proposition & Differentiators Dossier' })
                  ]
                })
              ]
            }),
            new TableCell({
              shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: 'وەشان / Edition: ', bold: true }),
                    new TextRun({ text: 'SAS4ERP Industrial v5.0 (November 2026)' })
                  ]
                })
              ]
            })
          ]
        })
      ]
    }),
    new Paragraph({ spacing: { after: 240 } })
  );

  // KURDISH SECTION
  if (includeKu) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 300, after: 140 },
        children: [
          new TextRun({
            text: 'بەشی کوردی: بۆچی سیستەمی SAS4ERP هەڵبژێرم؟ (١٢ خاڵی جیاکەرەوە)',
            bold: true,
            size: 26,
            color: '1E3A8A'
          })
        ]
      }),
      new Paragraph({
        spacing: { after: 180 },
        children: [
          new TextRun({
            text: 'سیستەمی SAS4ERP تەنها بەرنامەیەکی ژمێریاری ئاسایی نییە، بەڵکو سەکۆیەکی گشتگیری فەرماندەیی باڵای هۆڵدینگە کە بە تایبەت بۆ بەڕێوەبردنی دەسەڵاتدارانە و پاراستنی سەرمایە لە هەڵە و فێڵ داڕێژراوە. لێرەدا گرنگترین خاڵە جیاکەرەوەکانی سیستەمەکە دەخەینە ڕوو:',
            italics: true,
            color: '475569'
          })
        ]
      })
    );

    WHY_CHOOSE_POINTS.forEach((pt) => {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 60 },
          children: [
            new TextRun({
              text: pt.titleKu,
              bold: true,
              size: 22,
              color: '2563EB'
            })
          ]
        }),
        new Paragraph({
          spacing: { after: 120, line: 260 },
          children: [new TextRun({ text: pt.descKu, size: 21, color: '1E293B' })]
        })
      );
    });
  }

  // ENGLISH SECTION
  if (includeEn) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 340, after: 140 },
        children: [
          new TextRun({
            text: 'English Section: Why Choose SAS4ERP? (12 Core Differentiators)',
            bold: true,
            size: 26,
            color: '1E3A8A'
          })
        ]
      }),
      new Paragraph({
        spacing: { after: 180 },
        children: [
          new TextRun({
            text: 'SAS4ERP is engineered specifically for multi-subsidiary industrial conglomerates and strategic national project portfolios. Below are the key differentiators that set it apart from legacy ERP systems:',
            italics: true,
            color: '475569'
          })
        ]
      })
    );

    WHY_CHOOSE_POINTS.forEach((pt) => {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 60 },
          children: [
            new TextRun({
              text: pt.titleEn,
              bold: true,
              size: 22,
              color: '2563EB'
            })
          ]
        }),
        new Paragraph({
          spacing: { after: 120, line: 260 },
          children: [new TextRun({ text: pt.descEn, size: 21, color: '1E293B' })]
        })
      );
    });
  }

  // ARABIC SECTION
  if (includeAr) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 340, after: 140 },
        children: [
          new TextRun({
            text: 'القسم العربي: لماذا اختار منظومة SAS4ERP؟ (١٢ ميزة تنافسية حصرية)',
            bold: true,
            size: 26,
            color: '1E3A8A'
          })
        ]
      }),
      new Paragraph({
        spacing: { after: 180 },
        children: [
          new TextRun({
            text: 'تعد منظومة SAS4ERP منصة استراتيجية لقيادة وإدارة المجموعات الاستثمارية والهولدينغ الصناعي الكبرى، وتتميز بحزمة من الخصائص الميدانية والرقابية الحصرية:',
            italics: true,
            color: '475569'
          })
        ]
      })
    );

    WHY_CHOOSE_POINTS.forEach((pt) => {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 60 },
          children: [
            new TextRun({
              text: pt.titleAr,
              bold: true,
              size: 22,
              color: '2563EB'
            })
          ]
        }),
        new Paragraph({
          spacing: { after: 120, line: 260 },
          children: [new TextRun({ text: pt.descAr, size: 21, color: '1E293B' })]
        })
      );
    });
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Calibri', size: 21, color: '1E293B' },
          paragraph: { spacing: { line: 280, after: 120 } }
        }
      }
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
          }
        },
        children
      }
    ]
  });

  return await Packer.toBlob(doc);
}

/**
 * Opens a print-to-PDF view for "Why Choose SAS4ERP"
 */
export function openWhyChooseSAS4ERPPdfView(options: WhyChooseDocOptions = {}) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to download or print the dossier.');
    return;
  }

  const includeKu = options.includeKurdish !== false;
  const includeEn = options.includeEnglish !== false;
  const includeAr = options.includeArabic !== false;

  const kuContent = includeKu ? `
    <div class="lang-section rtl" dir="rtl">
      <div class="badge">بەشی کوردی سۆرانی</div>
      <h2>بۆچی ئەم سیستەمە بەکاربێنم؟ (١٢ خاڵی جیاکەرەوەی سەرەکی)</h2>
      <p class="intro-p">
        سیستەمی کارگێڕی SAS4ERP سەکۆیەکی فەرماندەیی باڵای هۆڵدینگە کە بۆ چاودێریکردن و ئاراستەکردنی کۆمپانیا باڵکێشەکان و پڕۆژە نیشتمانییەکان دروستکراوە بە تایبەتمەندی ڕێگری لە فێڵ و کارکردنی ئۆفلاین.
      </p>
      <div class="cards-grid">
        ${WHY_CHOOSE_POINTS.map(pt => `
          <div class="point-card">
            <h3>${pt.titleKu}</h3>
            <p>${pt.descKu}</p>
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';

  const enContent = includeEn ? `
    <div class="lang-section ltr" dir="ltr">
      <div class="badge">English Section</div>
      <h2>Why Choose SAS4ERP? (12 Core Differentiators)</h2>
      <p class="intro-p">
        Built specifically for multi-company holding conglomerates and strategic national infrastructure projects with offline resilience and AI-powered fraud safeguards.
      </p>
      <div class="cards-grid">
        ${WHY_CHOOSE_POINTS.map(pt => `
          <div class="point-card">
            <h3>${pt.titleEn}</h3>
            <p>${pt.descEn}</p>
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';

  const arContent = includeAr ? `
    <div class="lang-section rtl" dir="rtl">
      <div class="badge">القسم العربي</div>
      <h2>لماذا اختار منظومة SAS4ERP؟ (١٢ ميزة تنافسية حصرية)</h2>
      <p class="intro-p">
        منظومة قيادية متطورة لإدارة المجموعات الاستثمارية والهولدينغ الصناعي الكبرى والمشاريع الاستراتيجية مع دعم كامل للتشغيل دون إنترنت ورادار الذكاء الاصطناعي لكشف المخاطر.
      </p>
      <div class="cards-grid">
        ${WHY_CHOOSE_POINTS.map(pt => `
          <div class="point-card">
            <h3>${pt.titleAr}</h3>
            <p>${pt.descAr}</p>
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="ku" dir="auto">
    <head>
      <meta charset="UTF-8">
      <title>بۆچی ئەم سیستەمە بەکاربێنم - SAS4ERP Competitive Differentiators</title>
      <style>
        @page { size: A4; margin: 18mm 15mm; }
        body {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
          color: #0f172a;
          background: #ffffff;
          line-height: 1.6;
          margin: 0;
          padding: 20px;
        }
        .container { max-width: 900px; margin: 0 auto; }
        .no-print-bar {
          background: #1e3a8a;
          color: white;
          padding: 14px 20px;
          border-radius: 12px;
          margin-bottom: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .print-btn {
          background: #fbbf24;
          color: #0f172a;
          border: none;
          padding: 8px 18px;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
        }
        .header-cover {
          text-align: center;
          padding: 24px;
          border-bottom: 3px double #cbd5e1;
          margin-bottom: 24px;
        }
        .header-cover h1 {
          font-size: 26px;
          color: #1e3a8a;
          margin: 0 0 8px 0;
        }
        .header-cover p {
          font-size: 14px;
          color: #475569;
          margin: 0;
        }
        .lang-section {
          padding: 20px 0;
          border-bottom: 2px dashed #e2e8f0;
        }
        .rtl { direction: rtl; text-align: right; }
        .ltr { direction: ltr; text-align: left; }
        .badge {
          display: inline-block;
          background: #e0e7ff;
          color: #3730a3;
          font-size: 11px;
          font-weight: bold;
          padding: 4px 10px;
          border-radius: 6px;
          margin-bottom: 8px;
        }
        h2 { font-size: 18px; color: #1e3a8a; margin: 4px 0 10px; }
        .intro-p { font-size: 12.5px; color: #475569; margin-bottom: 16px; }
        .cards-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        .point-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 14px 16px;
        }
        .point-card h3 {
          font-size: 13.5px;
          color: #2563eb;
          margin: 0 0 6px 0;
        }
        .point-card p {
          font-size: 12px;
          color: #334155;
          margin: 0;
          line-height: 1.55;
        }
        @media print {
          .no-print-bar { display: none !important; }
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="no-print-bar">
          <span>📄 <strong>بۆچی ئەم سیستەمە بەکاربێنم؟</strong> — خاڵە جیاکەرەوەکانی SAS4ERP</span>
          <button class="print-btn" onclick="window.print()">🖨️ پرینت یان پاشەکەوتکردن بە PDF</button>
        </div>

        <div class="header-cover">
          <h1>بۆچی ئەم سیستەمە بەکاربێنم؟ (خاڵە جیاکەرەوەکانی SAS4ERP)</h1>
          <p>Why Choose SAS4ERP Enterprise? • لماذا اختيار منظومة SAS4ERP؟</p>
        </div>

        ${kuContent}
        ${enContent}
        ${arContent}
      </div>
      <script>
        window.addEventListener('load', () => {
          setTimeout(() => window.print(), 600);
        });
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}
