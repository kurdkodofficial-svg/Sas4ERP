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
  ShadingType,
  BorderStyle
} from 'docx';

export interface UserManualOptions {
  includeKurdish?: boolean;
  includeEnglish?: boolean;
  includeArabic?: boolean;
  includeDifferentiators?: boolean;
}

export async function generateEnterpriseUserManualDocx(options: UserManualOptions = {}): Promise<Blob> {
  const includeKu = options.includeKurdish !== false;
  const includeEn = options.includeEnglish !== false;
  const includeAr = options.includeArabic !== false;

  const children: (Paragraph | Table)[] = [];

  // Helper for Section Titles
  const createSectionHeader = (title: string, subtitle?: string) => {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 120 },
        children: [
          new TextRun({
            text: title,
            bold: true,
            size: 28,
            color: '1E3A8A'
          })
        ]
      })
    );
    if (subtitle) {
      children.push(
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: subtitle,
              italics: true,
              size: 20,
              color: '64748B'
            })
          ]
        })
      );
    }
  };

  // Helper for Sub-headers
  const createSubHeader = (title: string) => {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 260, after: 90 },
        children: [
          new TextRun({
            text: title,
            bold: true,
            size: 23,
            color: '2563EB'
          })
        ]
      })
    );
  };

  // Helper for normal paragraphs
  const createParagraph = (text: string, boldPrefix?: string) => {
    children.push(
      new Paragraph({
        spacing: { after: 110, line: 270 },
        children: [
          ...(boldPrefix ? [new TextRun({ text: boldPrefix, bold: true, color: '0F172A' })] : []),
          new TextRun({ text })
        ]
      })
    );
  };

  // Helper for bullet items
  const createBullet = (label: string, description: string) => {
    children.push(
      new Paragraph({
        bullet: { level: 0 },
        spacing: { after: 80, line: 260 },
        children: [
          new TextRun({ text: `${label}: `, bold: true, color: '1E293B' }),
          new TextRun({ text: description })
        ]
      })
    );
  };

  // Helper for numbered steps
  const createStep = (stepNumber: number, title: string, description: string) => {
    children.push(
      new Paragraph({
        spacing: { after: 90, line: 260 },
        children: [
          new TextRun({ text: `هەنگاوی ${stepNumber} / Step ${stepNumber} - ${title}: `, bold: true, color: '1E40AF' }),
          new TextRun({ text: description })
        ]
      })
    );
  };

  // ==========================================
  // 1. Title Page & Header Dossier
  // ==========================================
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120, before: 200 },
      children: [
        new TextRun({
          text: 'SAS HOLDING ENTERPRISE ERP SYSTEM',
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
          text: 'سیستەمی گشتگیری بەڕێوەبردنی هۆڵدینگ، کۆمپانیاکان و پڕۆژە نیشتمانییەکان',
          bold: true,
          size: 24,
          color: '2563EB'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: 'ڕێبەری فەرمی و دەستووری کارپێکردن بە ٣ زمانی (کوردی • English • العربية)',
          bold: true,
          size: 26,
          color: '0F172A'
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 320 },
      children: [
        new TextRun({
          text: 'Complete Operational Manual across All 21 Enterprise Modules with Two-Way Word ⇄ PDF Conversion',
          italics: true,
          size: 20,
          color: '64748B'
        })
      ]
    }),

    // Enterprise Metadata Table
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
                    new TextRun({ text: 'سیستەم / System: ', bold: true }),
                    new TextRun({ text: 'SAS4ERP Executive Enterprise Edition v5.0' })
                  ]
                })
              ]
            }),
            new TableCell({
              shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: 'بەروار / Date: ', bold: true }),
                    new TextRun({ text: 'November 2026' })
                  ]
                })
              ]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              shading: { fill: 'F8FAFC', type: ShadingType.CLEAR },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: 'شێوازی دەسەڵات / RBAC: ', bold: true }),
                    new TextRun({ text: 'Holding Owner, GM, Project Manager, Employee Roles' })
                  ]
                })
              ]
            }),
            new TableCell({
              shading: { fill: 'F8FAFC', type: ShadingType.CLEAR },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: 'ژینگەی کارکردن / Modes: ', bold: true }),
                    new TextRun({ text: 'Cloud Synchronized & PWA Offline Local Mesh' })
                  ]
                })
              ]
            })
          ]
        }),
        new TableRow({
          children: [
            new TableCell({
              shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: 'مۆڵەتی بەکارهێنان / License: ', bold: true }),
                    new TextRun({ text: '14-Day Free Trial & Hardware-Locked Production Key' })
                  ]
                })
              ]
            }),
            new TableCell({
              shading: { fill: 'F1F5F9', type: ShadingType.CLEAR },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: 'فۆرماتەکان / Formats: ', bold: true }),
                    new TextRun({ text: 'Word (.docx) ⇄ PDF Two-Way Converter Integrated' })
                  ]
                })
              ]
            })
          ]
        })
      ]
    }),
    new Paragraph({ spacing: { after: 300 } })
  );

  // =========================================================================
  // بەشی یەکەم: زمانی کوردی سۆرانی (Kurdish Comprehensive Section - 21 Modules)
  // =========================================================================
  if (includeKu) {
    createSectionHeader(
      'بەشی یەکەم: ڕێبەری گشتگیری بەکارهێنانی سیستەم بە زمانی کوردی',
      'Kurdish Comprehensive Operations Guide — ڕوونکردنەوەی تەواوی ٢١ بەش و خاڵە جیاکارییەکانی سیستەمی SAS4ERP'
    );

    // DEDICATED DIFFERENTIATORS SECTION (KURDISH)
    createSubHeader('★ بەشی تایبەت: خاڵە جیاکارییەکانی سیستەمی SAS4ERP لەگەڵ سیستەمەکانی تر');
    createParagraph(
      'سیستەمی SAS4ERP بە چەندین تایبەتمەندی بێهاوتا لە سەرجەم سیستەمە کلاسیکی و نەریتیەکانی تر جیا دەکرێتەوە:'
    );
    createBullet('١. بەکارهێنانی ٣ زمانی هاوکات لەناو یەک سیستەمدا', 'هەر بەکارهێنەرێک دەتوانێت بە زمانی هەڵبژێردراوی خۆی دۆکیومێنتەکان و بەشەکان ببینێت: خاوەن هۆڵدینگ بە کوردی، ئەندازیارانی بیانی بە ئینگلیزی، و لقی کۆمپانیا عەرەبییەکان بە زمانی عەرەبی لەسەر هەمان داتابەیسی یەکگرتوو بەبێ کێشەی وەرگێڕان.');
    createBullet('٢. دروستبوونی خۆکارانەی بەشەکانی کۆمپانیا و پڕۆژە (Automated Provisioning)', 'لەگەڵ تۆمارکردنی هەر کۆمپانیا یان پڕۆژەیەک، سیستەمەکە خۆکارانە ٩ بەشی سەرەکی (ئەندازیاری، دارایی، کڕین، HSE، سەرچاوە مرۆییەکان و ئیقامە، QC، یاسایی، کۆگا، و ئۆپەراسیۆن) لەگەڵ کەمپی نیشتەجێبوونی بیانیەکان و پڕۆفایلی بەڕێوەبەری گشتی لەسەر خاڵی سفڕ بە پەیوەندی هۆڵدینگەوە دروست دەکات.');
    createBullet('٣. ستۆدیۆی گۆڕەری دوولایەنەی فۆرماتەکان (Word ⇄ PDF Converter)', 'توانای گۆڕینی خێرای هەر فایلیكی وۆرد (.docx) بۆ پی دی ئێف و بە پێچەوانەشەوە، لەگەڵ هەناردەکردنی بەڵگەنامەکان بە هەردوو فۆرماتەکە بە ٣ زمانی فەرمی.');
    createBullet('٤. هاوردەکردنی بەڵگەنامە و داتاکان بە Drag & Drop بێ دووبارە نووسینەوە', 'ڕزگاربوون لە سەدان کاتژمێر نووسینەوەی دەستی؛ کارمەندان دەتوانن فایلەکانی Excel، PDF، Word، و وێنەکان ڕاستەوخۆ فڕێبدەنە ناو بەشەکان.');
    createBullet('٥. ڕاداری ژیری دەستکرد و کارکردنی ئۆفلاین (AI Sentinel & Offline PWA)', 'دۆزینەوەی ئۆتۆماتیکی فێڵی دارایی و پارچەکردنی کڕین، لەگەڵ کارکردنی ١٠٠٪ بەردەوام لە کێڵگە نەوتی و پڕۆژە دوورەدەستەکان بەبێ ئینتەرنێت.');
    createBullet('٦. دەستکاریکردنی تێبینییە چەسپاوەکان، پەسەندکردنەکان و گۆڕینی ژمارەکانی بودجە بە شێوازی ڕاستەوخۆ', 'بەکارهێنەرانی سیستەم و خاوەن هۆڵدینگ دەتوانن بە شێوازی ڕاستەوخۆ (In-Place) تێبینییە چەسپاوەکانی سەرۆکایەتی (Executive Sticky Notes) دەستکاری بکەن و بنووسن، داواکارییە هەڵپەسێردراوەکان (Pending Approvals) واژۆ یان ڕەت بکەنەوە، و ژمارەکانی بودجەی کۆمپانیا و پڕۆژەکان و هەموو ژمارەیەکی ناو سیستەم بەپێی دەسەڵاتی کارگێڕی بگۆڕن.');

    // 1
    createSubHeader('١. سیستەمی لایسنس، ماوەی تاقیکردنەوەی ١٤ ڕۆژ و قفڵی ئامێر (Hardware Lock)');
    createParagraph(
      'سیستەمی کارگێڕی دامەزراوەیی SAS4ERP سەکۆیەکی پێشکەوتووی بەڕێوەبردنی هۆڵدینگە کە بۆ چاودێریکردن و ئاراستەکردنی کۆمپانیا باڵکێشەکان و پڕۆژە نیشتمانییەکان دروستکراوە. سیستەمەکە پێویستی بە هیچ سێرڤەرێکی دەرەکی نییە بۆ دەستپێک و بە شێوازی خزمەتگوزاری بەکارهێنان پێشکەش دەکرێت.'
    );
    createBullet('ماوەی تاقیکردنەوەی ١٤ ڕۆژ (14-Day Free Trial)', 'هەر هۆڵدینگێک کاتێک سیستەمەکە دادەمەزرێنێت، بەخۆڕایی بۆ ماوەی ١٤ ڕۆژ دەتوانێت بە تەواوی تایبەتمەندییەکانەوە تاقیبکاتەوە بەبێ پێویستی بە کلیل.');
    createBullet('کۆدی چالاککردن و بەستنەوەی ئامێر (Hardware Lock)', 'خاوەنی سیستەم کۆدی چالاککردنی تایبەت (Activation License) دەدات بە هۆڵدینگ، و بە شێوەی پارێزراو بەستراوەتەوە بە ناسنامەی تەلاری ئامێرەکە (Hardware ID) بۆ ڕێگریکردن لە کۆپیکردن.');

    // 2
    createSubHeader('٢. بەڕێوەبردنی ڕۆڵی بەکارهێنەران و دەسەڵاتەکان (User Roles & RBAC Matrix)');
    createParagraph(
      'لە بەشی سەرەوە لەسەر مێنیوی بەکارهێنەر و لە داشبۆردی سەرۆکایەتیدا، دوگمەی "ڕۆڵ و دەسەڵاتەکان" تایبەتە بە خاوەنی هۆلدینگ بۆ دابەشکردنی دەسەڵات بەپێی پسپۆڕی کارمەندان:'
    );
    createBullet('خاوەنی هۆلدینگ (Holding Owner)', 'دەسەڵاتی بێسنوور بەسەر هەموو بەشەکان، واژۆی تایبەت بۆ سەرفکردنی پارە، پەسەندکردنی بودجەی کۆمپانیاکان، دەستکاریکردنی ڕۆڵەکان و مۆڵەتی لایسنس.');
    createBullet('بەڕێوەبەری گشتی کۆمپانیا (Company General Manager - GM)', 'بەڕێوەبردنی کۆمپانیاکەی خۆی و پڕۆژەکانی ژێر دەستی، پەسەندکردنی داواکارییە ناوەندییەکان، بینینی ڕاپۆرتە گشتییەکان و کۆبوونەوەی بۆرد.');
    createBullet('بەڕێوەبەری پڕۆژە (Project Manager - PM)', 'دەسەڵاتی مەیدانیی تایبەت بە پڕۆژەی دیاریکراو: هێڵکاری گانت، داواکاری کڕینی مەیدانی، کۆگا، سکێنەری دەروازە، کارەبا، سەلامەتی HSE، و کەمپی مانەوە.');
    createBullet('کارمەند (Employee - Self Service)', 'تەنها دەسەڵاتی تۆمارکردنی داواکاری پێداویستی خۆی، بینینی ژووری کەمپ، و پەیامی فەرمی هەیە؛ بەشە دارایی و سەرۆکایەتییەکان بە تەواوی دەشاردرێنەوە.');
    createBullet('خشتەی دەسەڵاتی ورد (19 Modules Matrix)', 'خاوەنی هۆلدینگ دەتوانێت بە چێک بۆکس دەسەڵاتی هەر بەشێک بۆ هەر کەسێک زیاد بکات یان بیبڕێت، لەگەڵ دوگمەی گەڕاندنەوە بۆ ستانداردی ڕۆڵەکان.');

    // 3
    createSubHeader('٣. هۆیەتی هۆڵدینگ و ستۆدیۆی واژۆ و مۆری ئەلیکترۆنی (Holding Identity & E-Signature)');
    createParagraph(
      'خاوەنی هۆڵدینگ دەتوانێت لە پەنجەرەی تایبەت بە هۆیەتی هۆڵدینگ ناسنامەی فەرمی دابنێت: لۆگۆی هۆڵدینگ، ناوی سەرۆکی هۆڵدینگ، پایتەختی کۆمپانیاکان و تۆماری کۆمپانیا. هەروەها لە ستۆدیۆی واژۆی دیجیتاڵیدا، واژۆی دەستی بە پەنجە یان قەڵەم دەکێشێت و پاشەکەوت دەکرێت بۆ واژۆکردنی فەرمیی پسوولەکان.'
    );

    // 4
    createSubHeader('٤. بەڕێوەبردنی کۆمپانیاکان و لقەکان (Companies & Subsidiaries)');
    createParagraph(
      'لە بەشی کۆمپانیاکان، لیستی سەرجەم کۆمپانیاکانی سەر بە هۆڵدینگ (کۆمپانیای بیناسازی، نەوت و گاز، بازرگانی، پیشەسازی و هتد) بە وردەکاری سەرمایە، بەڕێوەبەری گشتی بەرپرسیار، ژمارەی کارمەندان و ڕێژەی قازانج پیشان دەدرێت.'
    );

    // 5
    createSubHeader('٥. پڕۆژە نیشتمانی و ستراتیژییەکان و هێڵکاری گانت (National Projects & Gantt Chart)');
    createParagraph(
      'بەڕێوەبردنی پڕۆژە مەیدانییەکان لە قۆناغی دیزاینەوە تا تەواوبوون: هێڵکاری گانت پیشاندەری ماوەی هەر قۆناغێکە، بەراوردی کاتی پێشبینیکراو و کاتی ڕاستەقینە، ڕێژەی پێشکەوتن، بەستنەوەی ئەندازیار و کرێکاران، و دەرهێنانی ڕاپۆرتی ئەندازیاری بە PDF.'
    );

    // 6
    createSubHeader('٦. سووڕی کڕین و زنجیرەی ڕەزامەندی سێقۆڵی (Procurement Requisition & 3-Tier Multi-Signature)');
    createParagraph(
      'پڕۆسەی کڕین لە SAS4ERP بە سێ قۆناغ ئەنجام دەدرێت بۆ ڕێگریکردن لە فیڕۆدانی سەرمایە:'
    );
    createStep(1, 'تۆمارکردنی داواکاری لە مەیدان', 'ئەندازیار یان کارمەند ناوی کەرەستەکان، ژمارە، یەکە، نرخی خەمڵێنراو و هۆکاری کڕینەکە تۆمار دەکات.');
    createStep(2, 'پشکنین و پەسەندکردنی بەڕێوەبەری پڕۆژە و GM', 'بەڕێوەبەر پشکنینی بودجەی بەردەستی پڕۆژەکە دەکات، ئەگەر بودجە بەس بوو، پەسەندی کارگێڕی پێدەدات.');
    createStep(3, 'واژۆ و مۆری خاوەنی هۆڵدینگ', 'بۆ داواکارییە گەورەکان یان ئەو داواکارییانەی زیاترن لە سەنەدی بودجە، تەنها بە واژۆی دیجیتاڵی خاوەنی هۆلدینگ پارەی خەرجکردن ئازاد دەکرێت.');

    // 7
    createSubHeader('٧. کۆگای مەیدانی، باڵانسی کەرەستە و هێڵی کەمترین ئاست (Warehouse & Reorder Thresholds)');
    createParagraph(
      'چاودێری کۆگاکان بۆ چیمەنتۆ، ئاسن، کەلوپەلی کارەبایی، بۆری و سووتەمەنی: سیستەم دەستبەجێ ئاگاداری دەدات ئەگەر کەرەستەیەک لە هێڵی مەترسی کەمبوونەوە نیزیک ببێتەوە، و بە دەرکردنی پسوولەی دەرچوون (Issue Voucher) داتاکان لە داتابەیس نوێ دەبنەوە.'
    );

    // 8
    createSubHeader('٨. سکێنەری کامێرا لە دەروازە و پشکنینی بارکۆد (Gate Scanner & Waybill Barcode)');
    createParagraph(
      'پاسەوانی دەروازەی پڕۆژە کامێرای مۆبایلەکەی دەکاتەوە لە ڕێگەی دوگمەی «سکێنەری دەروازە». بە گرتنی کامێرا لەسەر بارکۆدی پسوولەی بارهەڵگرەکە، سیستەم پشکنین دەکات: ئەگەر بارەکە لەلایەن هۆڵدینگەوە پەسەند کرابێت، دەستبەجێ ڕێگەی پێدەدات و باڵانسی کۆگا زیاد دەکات.'
    );

    // 9
    createSubHeader('٩. دەروازەی قەپان، بارکردن و لۆجستی بارهەڵگرەکان (Weighbridge & Logistics)');
    createParagraph(
      'تۆمارکردنی کێشی بارهەڵگر لە کاتی چوونە ژوورەوە (Gross Weight) و لە کاتی دەرچوون (Tare Weight)، ژماردنی کێشی پوختەی چەو یان چیمەنتۆ (Net Weight)، لەگەڵ ناوی شۆفێر، ژمارەی تابلۆی بارهەڵگر و ڕێگەی گواستنەوە.'
    );

    // 10
    createSubHeader('١٠. چاودێری ژیری دەستکرد بۆ ڕێگری لە فێڵ و گزیکاری (AI Anomaly Sentinel)');
    createParagraph(
      'سیستەمێکی پێشکەوتووی ML بەردەوام داتاکان دەپشکنێت و هۆشداری سوور لێدەدات لەم حاڵەتانەدا:'
    );
    createBullet('فێڵی پارچەکردنی کڕین (Split Orders)', 'ئەگەر کارمەندێک کڕینێکی ٢٠ ملیۆن دیناری بکات بە ٤ پسوولەی ٥ ملیۆنی بۆ ئەوەی ڕەزامەندی خاوەنی هۆڵدینگی نەوێت، دەستبەجێ ڕادەگیرێت.');
    createBullet('تۆماری دارایی کاتی نائاسایی (Off-Hours Postings)', 'ئاگاداری دەستبەجێ لە کاتی تۆمارکردنی پسوولەی دارایی لە کاتژمێر ٢ی شەو یان ڕۆژانی پشووی فەرمی.');
    createBullet('کرێکاری وەهمی و دووبارە (Ghost Worker)', 'بەراوردکردنی ژمارەی ناسنامە و پەنجەمۆر بۆ ڕێگری لە دەرچوونی مووچەی کەسانی نەبوو لە مەیداندا.');

    // 11
    createSubHeader('١١. کەمپی نیشتەجێبوون و هۆڵی نووستنی کرێکاران (Living Camps & Room Allotment)');
    createParagraph(
      'چاودێریکردنی ژمارەی ژوورەکانی کەمپ لە پڕۆژە دوورەدەستەکان، ژمارەی تەختەی بەردەست و گیراو، ناوی نیشتەجێبووان، بارودۆخی فێنککەرەوە و گەرمکەرەوە، و پشکنینی خاوێنی و خواردنی کرێکاران.'
    );

    // 12
    createSubHeader('١٢. وێستگەکانی کارەبا، مۆلیدەکان و سووتەمەنی (Power Generators & Telemetry)');
    createParagraph(
      'تۆماری کاتژمێرەکانی کارکردنی مۆلیدەی پڕۆژە (Running Hours)، ئاستی سووتەمەنی لە تانکەر، گۆڕینی ڕۆن و فلتەر، و کاتی پچڕانی کارەبای نیشتمانی لەگەڵ هۆشداری پێشوەختە بۆ چاکسازی.'
    );

    // 13
    createSubHeader('١٣. سەلامەتی پیشەیی، ژینگە و تەندروستی (HSE & Security)');
    createParagraph(
      'تۆمارکردنی کاتژمێرەکانی کارکردنی سەلامەت بەبێ ڕووداوی لەدەستدانی کات (Lost Time Injury - LTI)، تۆماری ڕووداوە سووک و مەترسیدارەکان، پشکنینی کڵاو و پێڵاوی سەلامەتی و بوونی ئاگرکوژێنەوە لە شوێنی کار.'
    );

    // 14
    createSubHeader('١٤. ئامێرە قورسەکان و بەقاڵکردن (Heavy Machinery & Telemetry Fleet)');
    createParagraph(
      'بەدواداچوونی شوێنی شۆفڵ، حەفارە، کرێن و قەلابەکان، کاتژمێرەکانی کارکردنی ڕۆژانە، کاتی داهاتووی چاکسازی (Maintenance Schedule)، و ناوی شۆفێری سەرپەرشتیار.'
    );

    // 15
    createSubHeader('١٥. کۆنتڕۆڵی کوالێتی و تاقیگەی کۆنکرێت و ئاسن (QC & Material Testing Lab)');
    createParagraph(
      'تۆمارکردنی تاقیکردنەوەی تەقینی قاڵبی کۆنکرێت (Compressive Strength 7 & 28 Days)، تاقیکردنەوەی هێزی ڕاکێشانی ئاسن (Tensile Rebar Test)، ئەنجامی پەسەندکردن یان ڕەتکردنەوە لەلایەن تاقیگەی باوەڕپێکراو.'
    );

    // 16
    createSubHeader('١٦. ژمێریاری و سەندی دارایی یەکگرتووی هۆڵدینگ (Consolidated Financial Ledger)');
    createParagraph(
      'تەرازووی پێداچوونەوە (Trial Balance)، کۆی داهات و خەرجی کۆمپانیاکان، حیساباتی بانکی، قەرزی بەڵێندەران و دابینکاران، و پێشبینی باڵانسی کاشی هۆڵدینگ بۆ مانگەکانی داهاتوو.'
    );

    // 17
    createSubHeader('١٧. فاکتوورەی نێوان کۆمپانیاکان (Intercompany Invoicing & Bilateral Settlements)');
    createParagraph(
      'کاتێک کۆمپانیایەکی هۆڵدینگ کەرەستە یان ئامێر دەدات بە کۆمپانیایەکی تری ناو هەمان هۆڵدینگ، فاکتوورەی ناوخۆیی (Intercompany Invoice) دەردەچێت و بەبێ دروستبوونی ناکۆکی لە باڵانسی هەردوو کۆمپانیا تۆمار دەکرێت.'
    );

    // 18
    createSubHeader('١٨. گرێبەستەکان، وەبەرهێنەران و بەڵێندەرانی لاوەکی (Subcontractor & Investor Contracts)');
    createParagraph(
      'بەڕێوەبردنی گرێبەستە میلیۆن دۆلارییەکان، خشتەی دانەوەی قستەکان، زەمانەتی بانکی (Letter of Guarantee - LG)، و مافی دارایی وەبەرهێنەرانی هاوبەش.'
    );

    // 19
    createSubHeader('١٩. کارمەندان، مووچە و ماوەی ئیقامەی بیانیان (HR, Payroll & Foreign Labor Iqama)');
    createParagraph(
      'تۆماری کارمەندان، ئامادەبوونی ڕۆژانە، مووچەی مانگانە، و گرنگتر لە هەمووی: ئاگادارکردنەوەی پێشوەختەی ٣٠ ڕۆژ پێش بەسەرچوونی ئیقامە و ڤیزای ئەندازیار و کرێکارانی بیانی بۆ ڕێگری لە سزای دەوڵەت.'
    );

    // 20
    createSubHeader('٢٠. کارکردن لە دۆخی بێ ئینتەرنێت و تۆڕی خۆجێیی (Offline-First PWA & Mesh Sync)');
    createParagraph(
      'سیستەمی SAS4ERP پێویستی بە بەردەوامی ئینتەرنێت نییە. ئەگەر لە پڕۆژەیەکدا هێڵ پچڕا، سیستەم بە تەواوی لەسەر ئامێرەکە کار دەکات، و بە هاتنەوەی هێڵ داتاکان ئۆتۆماتیک لەگەڵ ناوەندی هۆڵدینگ سینک دەبنەوە.'
    );

    // 21
    createSubHeader('٢١. ستۆدیۆی دۆکیومێنت و گۆڕەری وۆرد ⇄ پی دی ئێف (Document Studio & Word ⇄ PDF Converter)');
    createParagraph(
      'تایبەتمەندییە نوێیەکەی سیستەم بۆ گۆڕینی دوولایەنەی بەڵگەنامەکان لەنێوان فایلی وۆرد (.docx) و فایلی پی دی ئێف (PDF):'
    );
    createBullet('گۆڕینی Word (.docx) بۆ PDF', 'هەر بەڵگەنامەیەکی وۆرد دابنێیت یان ڕێبەری سیستەم هەڵبژێریت، سیستەم دەستبەجێ دەیگۆڕێت بۆ PDF بە تەواوی ڕێکخستنی نووسینی کوردی و عەرەبی.');
    createBullet('گۆڕینی PDF بۆ Word (.docx)', 'هەر فایلیكی PDF دابنێیت، سیستەم دەق، خشتە و پەڕەکان دەردەهێنێت و دەیکاتە فایلی دەستکاریکراوی مایکرۆسۆفت وۆرد (.docx).');
  }

  // =========================================================================
  // SECTION 2: ENGLISH (English Comprehensive Guide - 21 Modules)
  // =========================================================================
  if (includeEn) {
    createSectionHeader(
      'Section 2: English Standard Operating Procedures & User Manual',
      'Comprehensive Operations Guide for Holding Owners, General Managers, Project Managers & Site Staff'
    );

    // DEDICATED DIFFERENTIATORS SECTION (ENGLISH)
    createSubHeader('★ Special Section: Strategic Differentiators of SAS4ERP vs Legacy Systems');
    createParagraph(
      'SAS4ERP distinguishes itself from legacy ERPs (SAP, Oracle, Odoo) through purpose-built industrial holding innovations:'
    );
    createBullet('1. Simultaneous Native Trilingual Operation', 'Every user interacts in their preferred language simultaneously (Kurdish Sorani, English, Arabic) without separate instances or manual translation.');
    createBullet('2. Instant Automated Entity Provisioning', 'Creating any subsidiary company or field project automatically provisions 9 operational departments, accommodation camp compounds, and executive GM profiles with 0-second setup.');
    createBullet('3. Integrated Two-Way Word ⇄ PDF Studio', 'Direct in-browser bi-directional conversion between Microsoft Word (.docx) and Adobe PDF files with native typography and RTL formatting.');
    createBullet('4. Universal Drag & Drop Document & Data Ingestion', 'Staff drag and drop Excel spreadsheets, PDFs, and Word contracts directly into departments, eliminating manual retyping.');
    createBullet('5. AI Anomaly Sentinel & True Offline-First PWA', 'Algorithmic fraud and split-PO prevention combined with seamless 100% offline field operation on remote project sites.');
    createBullet('6. Dynamic In-Place Editing for Sticky Notes, Approvals & Live Budgets', 'Holding owners and managers can write and edit executive sticky notes in real time, act immediately on pending purchase orders, and modify subsidiary/project budgets and system figures with complete auditability.');

    createSubHeader('1. Executive Architecture, Licensing & 14-Day Free Trial');
    createParagraph(
      'The SAS4ERP suite is an executive enterprise governance platform designed for multi-tier industrial holdings. It centralizes subsidiary oversight, national strategic projects, capital expenditure controls, and field operations.'
    );
    createBullet('14-Day Unrestricted Free Trial', 'New corporate installations execute unrestricted for 14 days, providing full access to all 21 modules before license enforcement.');
    createBullet('Cryptographic Activation License & Hardware Lock', 'Production licenses are paired cryptographically with the host machine hardware identity to prevent unauthorized copying.');

    createSubHeader('2. Role-Based Access Control (RBAC) & Scope Assignment');
    createParagraph(
      'Configured exclusively by the Holding Owner via the "User Roles & Permissions" portal:'
    );
    createBullet('Holding Owner', 'Absolute executive governance, presidential digital approvals, high-value capital release, corporate identity setup, and full user role administration.');
    createBullet('Company General Manager (GM)', 'Subsidiary operations, bilateral intercompany invoicing, project oversight, and corporate meeting management.');
    createBullet('Project Manager (PM)', 'Site progress reports, Gantt charts, site material requests, warehouse batch custody, gate scanner verification, and safety.');
    createBullet('Employee (Self-Service)', 'Dedicated access to personal procurement requests, accommodation camps, and direct communications; financial modules remain hidden.');
    createBullet('19-Module Granular Matrix', 'The owner can toggle specific accessible modules per user with instant one-click reset to role defaults.');

    createSubHeader('3. Holding Identity & Electronic Signature Studio');
    createParagraph(
      'Configure holding chairman credentials, high-resolution logos, capital baseline, and commercial registry. The E-Signature Studio captures high-fidelity digital stylus signatures and corporate seals.'
    );

    createSubHeader('4. Companies & Subsidiaries Portfolio');
    createParagraph(
      'Provides a comprehensive breakdown of all holding entities: construction, energy, industrial manufacturing, logistics, and trading with individual budgets and GM assignments.'
    );

    createSubHeader('5. Strategic Projects & Gantt Milestones');
    createParagraph(
      'Tracks national and field engineering projects with dynamic Gantt charts, planned vs actual variance tracking, critical path monitoring, and exportable engineering dossiers.'
    );

    createSubHeader('6. Procurement Requisition & 3-Tier Multi-Signature Chain');
    createStep(1, 'Site Requisition Submission', 'Site engineer logs required materials, units, estimated budget, and supplier quotations.');
    createStep(2, 'Operational Evaluation & Clearance', 'Project Manager and Company GM approve within allocated budget ceilings.');
    createStep(3, 'Presidential Executive Release', 'High-value POs or budget overrides require cryptographic digital signature from the Holding Owner.');

    createSubHeader('7. Field Warehouse & Reorder Thresholds');
    createParagraph(
      'Monitors cement, rebar, pipes, spare parts, and fuel reserves with automated notifications when stock drops below safety reorder levels.'
    );

    createSubHeader('8. Gate Barcode/QR Camera Scanner');
    createParagraph(
      'Security checkpoint personnel use any mobile device camera to scan delivery waybill barcodes, instantly validating purchase orders and releasing cargo into inventory.'
    );

    createSubHeader('9. Weighbridge Station & Dispatch Logistics');
    createParagraph(
      'Captures gross and tare truck weight, calculates net payload, records transport manifests, and logs vehicle license plate numbers.'
    );

    createSubHeader('10. AI Anomaly Sentinel & Fraud Prevention');
    createBullet('Split Purchase Order Alerts', 'Detects artificial invoice splitting engineered to circumvent executive authorization caps.');
    createBullet('Off-Hours Financial Transactions', 'Flags ledger vouchers posted outside standard operating shifts or on statutory holidays.');
    createBullet('Ghost Worker Biometric Duplication', 'Cross-references employee records to block phantom workforce disbursements.');

    createSubHeader('11. Living Camps, Accommodations & Dormitories');
    createParagraph(
      'Tracks camp capacity, bed allotments, room occupancy rates, HVAC operational status, and catering hygiene compliance.'
    );

    createSubHeader('12. Power Plants & Generator Telemetry');
    createParagraph(
      'Tracks generator run-hours, fuel tank levels, oil change schedules, and national grid outage transition metrics.'
    );

    createSubHeader('13. Occupational Health, Safety & Environment (HSE)');
    createParagraph(
      'Maintains Lost-Time Injury (LTI) counters, hazard incident documentation, mandatory PPE enforcement, and fire safety drill schedules.'
    );

    createSubHeader('14. Heavy Machinery & Fleet Maintenance');
    createParagraph(
      'Monitors excavators, wheel loaders, mobile cranes, and transit mixers, logging operating hours and preventive service intervals.'
    );

    createSubHeader('15. Quality Control (QC) & Concrete / Rebar Labs');
    createParagraph(
      'Records concrete cylinder slump tests, 7-day and 28-day compressive break strengths, and tensile steel rebar lab certifications.'
    );

    createSubHeader('16. Consolidated Holding Financial Ledger');
    createParagraph(
      'Real-time unified trial balance, subsidiary P&L balances, multi-currency bank accounts, and projected cash flow forecasting.'
    );

    createSubHeader('17. Intercompany Invoicing & Bilateral Settlement');
    createParagraph(
      'Automates internal invoicing when equipment or materials transfer between sister subsidiaries, preventing bookkeeping discrepancies.'
    );

    createSubHeader('18. Subcontractor Agreements & Investor Portfolios');
    createParagraph(
      'Manages high-value contractor agreements, progress billing schedules, bank Letters of Guarantee (LG), and joint-venture dividend distribution.'
    );

    createSubHeader('19. Human Resources, Payroll & Foreign Labor Residency (Iqama)');
    createParagraph(
      'Maintains employee profiles, shift attendance, and automated 30-day notifications prior to expat residency (Iqama) or visa expiry.'
    );

    createSubHeader('20. Offline-First PWA Mode & Local Mesh Sync');
    createParagraph(
      'Equipped with Service Worker caching. Remote field locations continue normal operations during telecommunication dropouts and synchronize automatically once reconnected.'
    );

    createSubHeader('21. Document Studio: Two-Way Word (.docx) ⇄ PDF Converter');
    createParagraph(
      'Integrated tool providing bi-directional document transformation between Microsoft Word (.docx) and Adobe PDF files with native Kurdish/Arabic RTL typesetting.'
    );
    createBullet('Word (.docx) to PDF Conversion', 'Upload any Word document or choose the built-in manual to instantly generate a printable, formatted PDF.');
    createBullet('PDF to Word (.docx) Conversion', 'Upload any PDF document to extract text, chapters, and tables into an editable Microsoft Word (.docx) file.');
  }

  // =========================================================================
  // الجزء الثالث: اللغة العربية (Arabic Comprehensive Guide - 21 Modules)
  // =========================================================================
  if (includeAr) {
    createSectionHeader(
      'الجزء الثالث: دليل الاستخدام والتشغيل باللغة العربية (Arabic Operations Manual)',
      'الدليل الميداني الشامل لإدارة المجموعة، الشركات التابعة، الميزانيات، وصلاحيات الأدوار'
    );

    // DEDICATED DIFFERENTIATORS SECTION (ARABIC)
    createSubHeader('★ قسم خاص: الخصائص الاستراتيجية الحصرية لمنظومة SAS4ERP مقارنة بالأنظمة الأخرى');
    createParagraph(
      'تتميز منظومة SAS4ERP عن الأنظمة التقليدية (مثل SAP و Oracle و Odoo) بمجموعة من الحلول الميدانية الاستثنائية المصممة خصيصاً للهولدينغ والمجموعات الاستثمارية:'
    );
    createBullet('١. تشغيل ثلاث لغات متزامنة في نظام واحد (Native Trilingual)', 'يتيح لكل مستخدم في المنظومة اختيار لغته المفضلة بحرية تامة: مالك الهولدينغ بالكردية، المهندسون الأجانب بالإنجليزية، والشركاء بالعربية على نفس السجلات الموحدة في نفس اللحظة دون الحاجة لبرامج إضافية.');
    createBullet('٢. التوليد التلقائي لـ ٩ أقسام وسكن العمال لأي شركة أو مشروع جديد', 'بمجرد تسجيل اسم أي شركة أو مشروع، تنشئ المنظومة آلياً وبشكل فوري ٩ أقسام تخصصية كاملة، وسكن عمال مجهز، وملف المدير العام دون أي إعدادات يدوية معقدة.');
    createBullet('٣. استوديو تحويل المستندات المزدوج (Word ⇄ PDF)', 'تحويل مباشر وثنائي الاتجاه بين ملفات Word (.docx) وملفات PDF مع الحفاظ التام على الخطوط والاتجاه من اليمين إلى اليسار.');
    createBullet('٤. استيراد المستندات والبيانات بالسحب والإفلات (Drag & Drop)', 'توفير مئات الساعات عبر إمكانية سحب وإفلات ملفات Excel و PDF و Word ومخططات العمل داخل أي قسم دون إعادة كتابة يدوية.');
    createBullet('٥. رادار الذكاء الاصطناعي لكشف الاحتيال والتشغيل دون إنترنت (AI Sentinel & Offline PWA)', 'كشف تجزئة المشتريات والقيود الليلية، مع ضمان استمرار العمل الميداني بنسبة ١٠٠٪ في المواقع المنقطعة.');
    createBullet('٦. التعديل المباشر للملاحظات اللاصقة، المعاملات المعلقة، وتحديث أرقام الميزانيات', 'مرونة تشغيلية تامة تمنح المستخدمين ورئيس المجموعة صلاحية تحرير الملاحظات اللاصقة القيادية، البت في المعاملات المعلقة، وتعديل أرقام الميزانيات وأي رقم بالمنظومة بشكل فوري ومباشر.');

    createSubHeader('١. الهيكلية العامة للمنظومة، نظام الترخيص، وفترة التجربة المجانية');
    createParagraph(
      'منظومة SAS4ERP هي منصة سحابية وهجينة متطورة لإدارة المجموعات الاستثمارية والهولدينغ الصناعي. تجمع بين الرقابة المركزية للمقر الرئيسي والتشغيل الميداني للمشاريع.'
    );
    createBullet('فترة التجربة المجانية لمدة ١٤ يوماً', 'يمكن لأي مجموعة تشغيل النظام بكافة ميزاته لمدة ١٤ يوماً مجاناً دون الحاجة المباشرة إلى مفتاح التفعيل.');
    createBullet('مفتاح التفعيل وقفل العتاد (Hardware Lock)', 'يتم تفعيل النظام بواسطة مفتاح رقمي مشفر يرتبط بهوية الجهاز لضمان أمان البيانات ومنع التكرار.');

    createSubHeader('٢. إدارة أدوار المستخدمين وصلاحيات الوصول (User Roles & RBAC)');
    createParagraph(
      'يتحكم مالك الهولدينغ بصورة حصرية في تحديد مهام وصلاحيات جميع المستخدمين عبر نافذة "إدارة الأدوار":'
    );
    createBullet('مالك المجموعة (Holding Owner)', 'صلاحيات مطلقة للاعتماد المالي، توقيع الصفقات الكبرى، وتعيين الصلاحيات لجميع الأفراد.');
    createBullet('المدير العام للشركة التابعة (Company GM)', 'إدارة عمليات الشركة التابعة، إقرار الفواتير التبادلية، متابعة المشاريع التابعة، والتواصل التنفيذي.');
    createBullet('مدير المشروع الميداني (Project Manager - PM)', 'متابعة تقارير الإنجاز، مخطط جانت، طلبات الشراء الميدانية، المخازن، وماسح البوابات والسلامة.');
    createBullet('الموظف الميداني (Employee)', 'صلاحيات الخدمة الذاتية لتقديم طلبات الشراء الخاصة ومتابعة السكن والمراسلات، مع إخفاء الأقسام المالية الحساسة.');
    createBullet('مصفوفة الـ ١٩ قسماً', 'إمكانية تحديد أو إلغاء ظهور أي قسم للمستخدم بزر استعادة الصلاحيات الافتراضية لكل دور.');

    createSubHeader('٣. هوية الهولدينغ واستوديو التوقيع والختم الإلكتروني');
    createParagraph(
      'تحديد اسم رئيس الهولدينغ، الشعار الرسمي، الميزانية الكلية، والتسجيل التجاري، مع حفظ التواقيع الرقمية والأختام لاعتماد المعاملات فورياً.'
    );

    createSubHeader('٤. محفظة الشركات التابعة وإدارتها');
    createParagraph(
      'عرض مالي وهيكلي لكافة شركات الهولدينغ (إنشاءات، نفط وغاز، تجارة، صناعة) مع تتبع ميزانياتها ومدراء عمومها.'
    );

    createSubHeader('٥. المشاريع الاستراتيجية ومخطط جانت');
    createParagraph(
      'متابعة الجداول الزمنية لتنفيذ المشاريع، وتحديد الانحرافات بين المخطط والواقع، واستخراج تقارير الإنجاز الهندسية بصيغة PDF.'
    );

    createSubHeader('٦. دورة المشتريات وسلسلة الموافقات الثلاثية');
    createStep(1, 'تقديم طلب الشراء من الميدان', 'إدخال المواد، الكميات، عروض الأسعار، والمشروع المستفيد.');
    createStep(2, 'مطابقة الميزانية واعتماد المدير العام', 'موافقة مدير المشروع والمدير العام في حدود السقوف المالية المعتمدة.');
    createStep(3, 'الاعتماد الرئاسي لمالك المجموعة', 'الموافقة والتوقيع الرقمي لمالك الهولدينغ للصفقات الكبرى وتجاوزات الميزانية.');

    createSubHeader('٧. إدارة المستودعات والرصيد الأدنى الآمن');
    createParagraph(
      'تتبع أرصدة الإسمنت والحديد وقطع الغيار، مع تنبيهات تلقائية عند اقتراب المواد من حد إعادة الطلب الأدنى.'
    );

    createSubHeader('٨. ماسح البوابات والباركود البصري');
    createParagraph(
      'قراءة باركود شاحنات التوريد بكاميرا الهاتف للتحقق الفوري من أوامر الشراء وإدخال المواد إلى المخزن آلياً.'
    );

    createSubHeader('٩. ميزان القبان واللوجستيات والنقل');
    createParagraph(
      'تسجيل الوزن القائم والفارغ للشاحنات، وحساب الوزن الصافي، وتوثيق بيانات السائق والوجهة بدقة.'
    );

    createSubHeader('١٠. رادار الذكاء الاصطناعي لكشف المخاطر والاحتيال (AI Sentinel)');
    createBullet('كشف تجزئة طلبات الشراء', 'رصد تقسيم المشتريات لتفادي الوصول إلى سقف صلاحيات المالك.');
    createBullet('القيود المالية خارج أوقات الدوام', 'تنبيه فوري عند إجراء قيود محاسبية ليلاً أو في العطل الرسمية.');
    createBullet('العمالة الوهمية وتكرار البصمات', 'فحص السجلات الحيوية لمنع صرف رواتب عمالة وهمية.');

    createSubHeader('١١. مجمعات سكن العمال والإعاشة');
    createParagraph(
      'توزيع الغرف، سعة الأسرة، متابعة التكييف والنظافة، والتفتيش الدوري على جودة الوجبات الغذائية.'
    );

    createSubHeader('١٢. محطات التوليد والمولدات الكهربائية');
    createParagraph(
      'مراقبة استهلاك الوقود وساعات التشغيل وجداول تبديل الزيوت وانقطاع الكهرباء الوطنية.'
    );

    createSubHeader('١٣. السلامة المهنية والبيئة (HSE)');
    createParagraph(
      'سجل الحوادث، مؤشر ساعات العمل الآمنة (LTI)، فحص معدات الوقاية الشخصية، ومطافئ الحريق.'
    );

    createSubHeader('١٤. أسطول الآليات الثقيلة والصيانة');
    createParagraph(
      'متابعة الحفارات والرافعات، ساعات العمل الفعلية، وجداول الصيانة الوقائية وأسماء المشغلين.'
    );

    createSubHeader('١٥. ضبط الجودة وتجارب مختبر الخرسانة والحديد');
    createParagraph(
      'نتائج فحص كسر الخرسانة (٧ و٢٨ يوماً)، وفحص شد حديد التسليح، وشهادات المطابقة الفنية.'
    );

    createSubHeader('١٦. القيود المحاسبية وميزان المراجعة الموحد');
    createParagraph(
      'ميزان المراجعة العام، الحسابات البنكية، أرباح وخسائر الشركات التابعة، وتوقعات السيولة النقدية.'
    );

    createSubHeader('١٧. الفواتير التبادلية بين الشركات الشقيقة');
    createParagraph(
      'تنظيم المعاملات المالية المتبادلة عند انتقال المعدات أو المواد بين شركات المجموعة بسلاسة.'
    );

    createSubHeader('١٨. عقود المقاولين من الباطن وخطابات الضمان');
    createParagraph(
      'إدارة العقود الاستثمارية، خطابات الضمان البنكية، ودفعات المستخلصات الإنشائية.'
    );

    createSubHeader('١٩. الموارد البشرية وإقامات العمالة الأجنبية');
    createParagraph(
      'ملفات الموظفين، الرواتب الشهرية، وتنبيهات تلقائية قبل ٣٠ يوماً من انتهاء إقامات وجوازات العمالة الأجنبية.'
    );

    createSubHeader('٢٠. التشغيل دون إنترنت والمزامنة المحلية (Offline PWA)');
    createParagraph(
      'استمرار العمل بصورة كاملة في المواقع الميدانية المنقطعة بفضل تقنية Service Worker والمزامنة الفورية عند عودة الاتصال.'
    );

    createSubHeader('٢١. استوديو تحويل المستندات بين Word و PDF');
    createParagraph(
      'أداة متطورة للتحويل المزدوج بين ملفات مايكروسوفت وورد (.docx) وملفات أدوبي (PDF) مع دعم كامل للاتجاه من اليمين إلى اليسار.'
    );
    createBullet('تحويل Word إلى PDF', 'رفع أي ملف وورد أو تحويل الدليل الحالي مباشرة إلى صيغة PDF عالية الدقة.');
    createBullet('تحويل PDF إلى Word', 'استخراج النصوص والجداول من ملفات PDF وتحويلها إلى ملفات Word قابلة للتعديل.');
  }

  // Build the complete docx document
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'Calibri',
            size: 22,
            color: '1E293B'
          },
          paragraph: {
            spacing: {
              line: 280,
              after: 120
            }
          }
        }
      }
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440
            }
          }
        },
        children
      }
    ]
  });

  return await Packer.toBlob(doc);
}
