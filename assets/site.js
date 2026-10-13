/*
 * أبعاد — الموقع التعريفي على abaadapp.om
 *
 * صفحةٌ ثابتة: index.html يحمل النسخة العربية جاهزةً، وهذا الملفّ يشغّل ما يتحرّك
 * فيها — تبديل اللغة، قائمة الجوال، بطاقات القدرات، تبويبات الترابط، الأتمتة،
 * الأسعار الشهرية/السنوية، ونموذج التواصل. النصوص والتوقيتات منقولةٌ من التصميم
 * كما هي.
 *
 * والقوائم تُرسم من البيانات أدناه عند التحميل وعند تبديل اللغة؛ ما في index.html
 * منها هو رسمُها العربيّ نفسُه لمن لا يشغّل JavaScript.
 */
(function () {
  'use strict';

  /*
   * روابط النظام — في مكانٍ واحد.
   *
   * الموقع على abaadapp.om والنظام على app.abaadapp.om: رابطٌ نسبيّ مثل /login
   * يبقى على الموقع ولا يصل إلى النظام.
   */
  var APP = 'https://app.abaadapp.om';
  var LINKS = { login: APP + '/login', register: APP + '/register' };
  var MAIL = 'abaadappom@gmail.com';
  var IMG = '/assets/img/';

  var T = {
    ar: {
      langSwitch: 'English', langAria: 'التبديل إلى الإنجليزية', login: 'تسجيل الدخول', startNow: 'ابدأ الآن',
      navHome: 'الرئيسية', navPlatform: 'المنصة', navSolutions: 'الحلول', navContact: 'تواصل معنا', navPricing: 'الأسعار',
      priceTitle: 'باقات واضحة تناسب نشاطك.', priceSub: 'اختر الباقة التي تناسب حجم نشاطك، وابدأ بما تحتاجه اليوم.',
      billMonthly: 'شهري', billYearly: 'سنوي',
      heroTitle: 'كل أعمالك. في مكان واحد.',
      heroSub: 'أبعاد منصة متكاملة تجمع المبيعات، الإدارة، التجارة الإلكترونية، العملاء، المدفوعات، المالية والأتمتة — لتشغّل أعمالك من مكان واحد وتنمو بوضوح أكبر.',
      heroCta: 'ابدأ مع أبعاد', heroCta2: 'استكشف المنصة',
      slotHero: 'لوحة تحكم أبعاد ونقطة البيع والمتجر الإلكتروني وواتساب',
      aboutBadge: 'منصة أبعاد', aboutTitle: 'كل أعمالك في نظام واحد.',
      aboutSub: 'أدر المبيعات والطلبات والمخزون والعملاء والمالية من منصة واحدة، بدل التنقل بين أنظمة متعددة.',
      platBadge: 'كل ما تحتاجه', platTitle: 'منصة واحدة. لكل عملياتك.',
      platSub: 'كل ما تحتاجه لإدارة أعمالك، من البيع والمخزون إلى العملاء والمالية، في منصة واحدة مترابطة.',
      dashBadge: 'التحليلات ولوحة التحكم', dashTitle: 'شاهد أعمالك كاملة من مكان واحد.',
      dashSub: 'كل ما تحتاج معرفته عن أعمالك، أمامك بوضوح. مبيعاتك، أرباحك، طلباتك ومخزونك في لوحة واحدة تساعدك تقرر أسرع.',
      slotDash: 'لوحة تحكم أبعاد',
      connTitle: 'القوة ليست في الأدوات فقط. بل في ترابطها.',
      connSub: 'كل عملية داخل أبعاد تتصل ببقية المنصة، لتقلل العمل اليدوي وتحافظ على بيانات أعمالك محدثة في مكان واحد.',
      waTitle: 'اجعل أعمالك تتواصل تلقائيًا.',
      waSub: 'اربط واتساب بعملياتك في أبعاد، وشغّل الرسائل والإجراءات تلقائيًا بناءً على ما يحدث في أعمالك.',
      waKey: 'واتساب ليس منفصلًا عن أعمالك. إنه متصل بالعميل والطلب والعمليات داخل نظامك.',
      when: 'عند', waChip1: 'طلب جديد', waChip2: 'تم تحديث الحالة',
      storeBadge: 'التجارة الإلكترونية', storeTitle: 'متجرك الإلكتروني متصل بأعمالك من البداية.',
      storeSub: 'أنشئ متجرك مع أبعاد، وأدر المنتجات والطلبات والعملاء والمدفوعات من نفس النظام — بدون فصل متجرك عن عملياتك.',
      storeKey: 'متجر واحد. بيانات موحّدة. إدارة أسهل.',
      addonBadge: 'خدمة إضافية', addonTitle: 'خصّص متجرك بما يناسب علامتك',
      addonSub: 'نصمم ونخصص واجهة متجرك لتناسب هوية علامتك ومتطلباتك، كخدمة إضافية مدفوعة.', addonCta: 'اطلب تخصيص متجرك',
      finBadge: 'المالية', finTitle: 'اعرف أين تذهب\nأموالك.',
      finSub: 'شاهد أين تدخل أموالك وأين تذهب، وتابع المبيعات والمشتريات والمدفوعات والمصروفات والمستحقات والتقارير من مكان واحد.',
      slotFin: 'الملخّص المالي في أبعاد',
      typesTitle: 'أبعاد يتكيف مع طريقة عملك.',
      ctaTitle: 'كل ما تحتاجه لإدارة أعمالك، أصبح أقرب.',
      ctaSub: 'ابدأ مع أبعاد واجمع عملياتك ومبيعاتك وعملاءك وماليتك في منصة واحدة.',
      fName: 'الاسم', fCompany: 'اسم النشاط', fPhone: 'رقم الهاتف', fEmail: 'البريد الإلكتروني', fType: 'نوع النشاط', fMessage: 'الرسالة',
      chooseType: 'اختر نوع النشاط...', other: 'أخرى',
      submit: 'أرسل',
      // لا خادم وراء النموذج: يفتح رسالةً جاهزة في بريد الزائر، فلا يقول «تم الإرسال» قبل أن يُرسَل شيء
      sentTitle: 'أكمل إرسال طلبك من بريدك',
      sentBody: 'فتحنا رسالتك جاهزةً في تطبيق البريد — اضغط «إرسال» هناك ليصلنا طلبك.',
      mailAgain: 'افتح الرسالة مرة أخرى', mailOr: 'أو راسلنا مباشرة على',
      mailSubject: 'طلب تواصل من موقع أبعاد',
      sendAnother: 'إرسال طلب آخر',
      errName: 'الرجاء إدخال الاسم.', errCompany: 'الرجاء إدخال اسم النشاط.', errPhone: 'الرجاء إدخال رقم هاتف صحيح.',
      errEmail: 'الرجاء إدخال بريد إلكتروني صحيح.', errType: 'الرجاء اختيار نوع النشاط.', errMessage: 'الرجاء كتابة رسالة قصيرة.',
      privacy: 'سياسة الخصوصية', terms: 'الشروط',
      ciEmail: 'البريد', ciPhone: 'الهاتف', ciEmailV: MAIL, ciPhoneV: '+968 71141624',
      screenshot: 'لقطة شاشة: '
    },
    en: {
      langSwitch: 'العربية', langAria: 'Switch to Arabic', login: 'Log in', startNow: 'Get started',
      navHome: 'Home', navPlatform: 'Platform', navSolutions: 'Solutions', navContact: 'Contact us', navPricing: 'Pricing',
      priceTitle: 'Clear plans that fit your business.', priceSub: 'Pick the right plan, then add the devices or services you need.',
      billMonthly: 'Monthly', billYearly: 'Yearly',
      heroTitle: 'Your whole business. In one place.',
      heroSub: 'Abaad is an integrated platform that brings together sales, management, e-commerce, customers, payments, finance and automation — so you run your business from one place and grow with more clarity.',
      heroCta: 'Start with Abaad', heroCta2: 'Explore the platform',
      slotHero: 'The Abaad dashboard, point of sale, online store and WhatsApp',
      aboutBadge: 'The Abaad platform', aboutTitle: 'One system instead of many.',
      aboutSub: 'From running your day-to-day to selling, talking to customers and tracking your numbers, Abaad brings your business operations into one connected system.',
      platBadge: 'Everything you need', platTitle: 'One platform. For every operation.',
      platSub: 'Integrated tools covering your business cycle, from management and sales to communication and finance.',
      dashBadge: 'Analytics & dashboard', dashTitle: 'See your whole business from one place.',
      dashSub: 'Everything you need to know about your business, clearly in front of you. Your sales, profits, orders and inventory in one dashboard that helps you decide faster.',
      slotDash: 'The Abaad dashboard',
      connTitle: 'The power is not just in the tools. It is in how they connect.',
      connSub: 'Every operation in Abaad connects to the rest of the platform, reducing manual work and keeping your business data up to date in one place.',
      waTitle: 'Let your business communicate automatically.',
      waSub: 'Connect WhatsApp to your operations in Abaad, and run messages and actions automatically based on what happens in your business.',
      waKey: 'WhatsApp is not separate from your business. It is connected to the customer, the order and the operations inside your system.',
      when: 'When', waChip1: 'New order', waChip2: 'Status updated',
      storeBadge: 'E-commerce', storeTitle: 'Your online store, connected to your business from day one.',
      storeSub: 'Build your website and store with Abaad, and manage products, orders, customers and payments from the same system that runs your internal operations.',
      storeKey: 'No separate store. No separate data.',
      addonBadge: 'Add-on service', addonTitle: 'Customize your store to fit your brand',
      addonSub: 'We offer a design and customization service for your online storefront, tailored to your brand identity and needs, for an additional fee.', addonCta: 'Request store customization',
      finBadge: 'Finance', finTitle: 'Know where your money goes.',
      finSub: 'Connect daily operations to the financial picture of your business, and track sales, purchases, payments, expenses, receivables and reports from one place.',
      slotFin: 'The financial summary in Abaad',
      typesTitle: 'Abaad adapts to the way you work.',
      ctaTitle: 'Everything you need to run your business, now closer.',
      ctaSub: 'Start with Abaad and bring your operations, sales, customers and finances into one platform.',
      fName: 'Name', fCompany: 'Business name', fPhone: 'Phone number', fEmail: 'Email', fType: 'Business type', fMessage: 'Message',
      chooseType: 'Select a business type...', other: 'Other',
      submit: 'Send',
      sentTitle: 'Finish sending from your email',
      sentBody: 'We opened your message in your email app — press Send there so it reaches us.',
      mailAgain: 'Open the message again', mailOr: 'Or email us directly at',
      mailSubject: 'Contact request from the Abaad website',
      sendAnother: 'Send another request',
      errName: 'Please enter your name.', errCompany: 'Please enter your business name.', errPhone: 'Please enter a valid phone number.',
      errEmail: 'Please enter a valid email address.', errType: 'Please select a business type.', errMessage: 'Please write a short message.',
      privacy: 'Privacy policy', terms: 'Terms',
      ciEmail: 'Email', ciPhone: 'Phone', ciEmailV: MAIL, ciPhoneV: '+968 71141624',
      screenshot: 'Screenshot: '
    }
  };

  var DATA = {
    ar: {
      trust: ['سحابي', 'آمن', 'متعدد الأجهزة', 'متعدد اللغات', 'تحديثات مستمرة'],
      pillars: [
        { title: 'أدر', sub: 'لوحة تحكم واحدة لإدارة نشاطك وفروعك وعملياتك.' },
        { title: 'بِع', sub: 'نقاط البيع والمتجر الإلكتروني والطلبات والمدفوعات في تجربة واحدة.' },
        { title: 'تواصل', sub: 'العملاء وواتساب والإشعارات والتواصل من نفس النظام.' },
        { title: 'حلّل', sub: 'تقارير وتحليلات وبيانات تساعدك على اتخاذ قرارات أفضل وتنمية أعمالك.' }
      ],
      caps: [
        { title: 'المبيعات ونقاط البيع', sub: 'أدر المبيعات والطلبات والفواتير والمدفوعات من تجربة بيع سريعة ومتكاملة.', detail: 'بع بسهولة، وأدر الطلبات والفواتير والمدفوعات من تجربة واحدة سريعة ومتكاملة.', items: ['POS', 'الطلبات', 'الفواتير', 'المدفوعات'] },
        { title: 'التجارة والمخزون', sub: 'أدر المنتجات والمخزون والمشتريات والموردين، واربطها مباشرة بعمليات البيع.', detail: 'أدر المنتجات والمخزون والمشتريات والموردين من مكان واحد، واربطها مباشرة بعمليات البيع.', items: ['المنتجات', 'المخزون', 'المشتريات', 'الموردون'] },
        { title: 'التجارة الإلكترونية', sub: 'أنشئ وأدر موقعك ومتجرك الإلكتروني واربط الطلبات والمنتجات والعملاء ببقية أعمالك.', items: ['الموقع', 'المتجر', 'المنتجات', 'الطلبات'] },
        { title: 'العملاء والتواصل', sub: 'اجمع بيانات عملائك وتاريخ تعاملاتهم وتواصل معهم من نفس منظومة العمل.', items: ['العملاء', 'WhatsApp', 'الإشعارات', 'سجل التعاملات'] },
        { title: 'المالية والتقارير', sub: 'تابع الحركة المالية والمدفوعات والمصروفات والمستحقات والتقارير من مكان واحد.', badge: 'التقارير', detailTitle: 'افهم التكاليف والخسائر بوضوح.', detail: 'تابع تكلفة المبيعات والتشغيل والخسائر والمصروفات الأخرى، وقارن أداءك بالفترة السابقة لمعرفة أين تتغيّر تكاليفك ولماذا.', items: ['تكلفة المبيعات', 'تكاليف التشغيل', 'الخسائر', 'المصروفات الأخرى'] }
      ],
      kpis: ['المبيعات', 'الطلبات', 'المخزون', 'العملاء', 'المالية', 'الأداء'],
      flows: [
        { name: 'المبيعات', steps: ['بيع', 'المخزون', 'العميل', 'المدفوعات', 'المالية', 'التقارير'] },
        { name: 'التجارة الإلكترونية', steps: ['طلب إلكتروني', 'العميل', 'الدفع', 'المخزون', 'التنفيذ', 'WhatsApp'] },
        { name: 'الحجوزات', steps: ['حجز', 'العميل', 'الدفع', 'Automation', 'WhatsApp'] }
      ],
      rules: [
        ['إنشاء طلب جديد', 'تشغيل إجراء آلي'],
        ['تحديث حالة الطلب', 'إشعار العميل'],
        ['اكتمال الطلب', 'إرسال تحديث للعميل']
      ],
      storeFlow: ['المتجر', 'المنتجات', 'المخزون', 'الطلبات', 'العملاء'],
      finItems: ['المبيعات', 'المشتريات', 'المصروفات', 'المدفوعات', 'المستحقات', 'التقارير المالية'],
      types: [
        { title: 'التجزئة', sub: 'نقاط البيع، المنتجات، المخزون، العملاء والمشتريات.' },
        { title: 'التجارة الإلكترونية', sub: 'الموقع، المنتجات، الطلبات، المدفوعات والعملاء.' },
        { title: 'الخدمات والحجوزات', sub: 'الخدمات، المواعيد، الحجوزات والتواصل مع العملاء.' },
        { title: 'الاشتراكات', sub: 'إدارة العملاء والخدمات والعمليات والمدفوعات المتكررة.' }
      ]
    },
    en: {
      trust: ['Cloud-based', 'Secure', 'Multi-device', 'Multilingual', 'Continuous updates'],
      pillars: [
        { title: 'Manage', sub: 'One dashboard to run your business, operations and team.' },
        { title: 'Sell', sub: 'Point of sale, orders, online store and payments.' },
        { title: 'Connect', sub: 'Customers, WhatsApp, notifications and customer engagement.' },
        { title: 'Grow', sub: 'Finance, reports, automation and the data that helps you grow.' }
      ],
      caps: [
        { title: 'Sales & point of sale', sub: 'Manage sales, orders, invoices and payments from a fast, complete selling experience.', detail: 'Sell with ease, and manage orders, invoices and payments from one fast, complete experience.', items: ['POS', 'Orders', 'Invoices', 'Payments'] },
        { title: 'Commerce & inventory', sub: 'Manage products, inventory, purchasing and suppliers, linked directly to your sales.', detail: 'Manage products, inventory, purchasing and suppliers from one place, and link it all directly to your sales.', items: ['Products', 'Inventory', 'Purchasing', 'Suppliers'] },
        { title: 'E-commerce', sub: 'Build and run your website and online store, with orders, products and customers linked to the rest of your business.', items: ['Website', 'Store', 'Products', 'Orders'] },
        { title: 'Customers & communication', sub: 'Collect customer data and history, and reach customers from the same system you work in.', items: ['Customers', 'WhatsApp', 'Notifications', 'History'] },
        { title: 'Finance & reports', sub: 'Track cash flow, payments, expenses, receivables and reports from one place.', items: ['Finance', 'Expenses', 'Receivables', 'Reports'] }
      ],
      kpis: ['Sales', 'Orders', 'Inventory', 'Customers', 'Finance', 'Performance'],
      flows: [
        { name: 'Sales', steps: ['Sale', 'Inventory', 'Customer', 'Payments', 'Finance', 'Reports'] },
        { name: 'E-commerce', steps: ['Online order', 'Customer', 'Payment', 'Inventory', 'Fulfilment', 'WhatsApp'] },
        { name: 'Bookings', steps: ['Booking', 'Customer', 'Payment', 'Automation', 'WhatsApp'] }
      ],
      rules: [
        ['New order created', 'Run an automated action'],
        ['Order status updated', 'Notify the customer'],
        ['Order completed', 'Send an update to the customer']
      ],
      storeFlow: ['Store', 'Products', 'Inventory', 'Orders', 'Customers'],
      finItems: ['Sales', 'Purchases', 'Expenses', 'Payments', 'Receivables', 'Financial reports'],
      types: [
        { title: 'Retail', sub: 'Point of sale, products, inventory, customers and purchasing.' },
        { title: 'E-commerce', sub: 'Website, products, orders, payments and customers.' },
        { title: 'Services & bookings', sub: 'Services, appointments, bookings and customer communication.' },
        { title: 'Subscriptions', sub: 'Manage customers, services, operations and recurring payments.' }
      ]
    }
  };

  // الأسعار بالعربية في اللغتين — كما في التصميم
  var PRICING = {
    cur: 'ر.ع', perMonth: 'شهريًا', perYear: 'سنويًا', popular: 'الأكثر طلبًا', save: 'وفّر قيمة شهرين', instead: 'بدل',
    limitsH: 'حدود الاستخدام', waH: 'واتساب', excH: 'غير مشمول في هذه الباقة',
    addH: 'تخصيصات اختيارية', addTag: 'إضافة اختيارية', addCta: 'تواصل معنا للتفعيل',
    waNote: 'في الباقات التي تشمل واتساب: 100 رسالة مجانية شهريًا عبر رقم أبعاد.',
    waPack: '500 رسالة إضافية — 7.500 ر.ع',
    plans: [
      { name: 'الأساسية', tag: 'إدارة متجرك اليومية', desc: 'كل ما تحتاجه لتشغيل وإدارة متجرك يوميًا.', m: '9.900', y: '99', was: '118.800',
        limits: ['فرع واحد', 'حتى 3 موظفين نشطين', 'حتى 100 منتج'], incH: 'التشغيل',
        inc: ['نقطة البيع والمبيعات والطلبات', 'إدارة المنتجات', 'إدارة المخزون', 'العملاء', 'الموردون والمشتريات', 'فواتير العملاء', 'المالية والمصروفات', 'الرواتب والموظفون', 'لوحة التجهيز', 'لوحة التحكم والملخصات', 'التقارير الأساسية'],
        exc: ['واتساب', 'الموقع الإلكتروني', 'أدوات التسويق', 'برنامج الولاء', 'التقارير المتقدمة', 'الصلاحيات المخصصة'] },
      { name: 'الاحترافية', tag: 'إدارة + نمو', desc: 'شغّل متجرك وطوّر مبيعاتك بحضور رقمي وأدوات نمو متكاملة.', m: '29.900', y: '299', was: '358.800', featured: true,
        limits: ['حتى 3 فروع', 'حتى 15 موظفًا نشطًا', 'حتى 5,000 منتج'], incH: 'المميزات',
        inc: ['كل مميزات الأساسية', 'الموقع الإلكتروني', 'نشر المتجر والبيع عبر الموقع', 'تصميم وصفحات الموقع', 'ربط نطاق المتجر', 'إعدادات SEO والظهور', 'تقييمات العملاء', 'الكوبونات والعروض', 'برنامج الولاء والنقاط', 'التقارير المتقدمة', 'تحليل الهالك', 'تصدير التقارير', 'الصلاحيات المخصصة للموظفين'],
        wa: ['إشعارات واتساب عبر رقم أبعاد', '100 رسالة واتساب مجانية شهريًا', 'إمكانية شراء رصيد رسائل إضافي'],
        add: [{ t: 'استخدم رقم واتساب متجرك', d: 'اربط رقم واتساب أعمالك الخاص بدل رقم أبعاد — متاح كإضافة اختيارية.' }, { t: 'خصص موقعك الإلكتروني', d: 'تخصيص احترافي للموقع بما يناسب هوية نشاطك — خدمة إضافية.' }] },
      { name: 'المؤسسات', tag: 'تشغيل عدة فروع', desc: 'للشركات والمتاجر التي تدير فرقًا أكبر وعدة فروع من نظام واحد.', m: '69.900', y: '699', was: '838.800',
        limits: ['حتى 25 فرعًا', 'حتى 100 موظف نشط', 'حتى 100,000 منتج'], incH: 'المميزات',
        inc: ['كل مميزات الاحترافية', 'تشغيل عدة فروع من نظام واحد', 'إدارة فرق أكبر', 'الموقع الإلكتروني', 'أدوات التسويق', 'برنامج الولاء', 'التقارير المتقدمة', 'تحليل الهالك', 'تصدير التقارير', 'الصلاحيات المخصصة'],
        wa: ['واتساب أبعاد', '100 رسالة واتساب مجانية شهريًا', 'إمكانية شراء رصيد إضافي'],
        add: [{ t: 'رقم واتساب الشركة الخاص', d: '' }, { t: 'تخصيص الموقع ليتناسب مع الهوية والفروع', d: '' }] }
    ]
  };

  var CAP_IMGS = [null, IMG + 'invoices.webp', IMG + 'store.webp', IMG + 'customer.webp'];
  var TYPE_IMGS = [IMG + 'solution-retail.webp', IMG + 'solution-ecommerce.webp', IMG + 'solution-services.webp', IMG + 'solution-subscriptions.webp'];
  var CAP_COUNT = 5, CAP_INTERVAL = 3500;
  var FLOW_COUNT = 3, FLOW_INTERVAL = 4000, FLOW_STEP_MS = 550;
  var TICK_MS = 1100;

  var S = { lang: 'ar', menuOpen: false, cap: 0, capVis: true, billing: 'm', flow: 0, flowVis: true, flowTick: 0, ind: null, tick: 0, sent: false };

  function pad(n) { return String(n).padStart(2, '0'); }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  function tr() { return T[S.lang]; }
  function data() { return DATA[S.lang]; }
  function arrow() { return S.lang === 'ar' ? '←' : '→'; }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* ═══════════ الأنماط المتغيّرة بالحالة — يرسمها الرسمُ ويرقّعها التحديث ═══════════ */

  function capCardLook(on) {
    return {
      bg: on ? 'var(--ink)' : 'var(--card)', fg: on ? '#fff' : 'var(--ink)', border: on ? 'var(--ink)' : 'var(--line)',
      iconBg: on ? 'rgba(255,255,255,.12)' : 'var(--bg2)', iconFg: on ? '#fff' : 'var(--ink)', mark: on ? '−' : '+'
    };
  }
  function kpiDot(on) { return on ? 'var(--peach-ink)' : '#c9c9cb'; }
  function ruleLook(on) {
    return { bg: on ? '#f1f8f3' : 'var(--card)', border: on ? 'var(--wa)' : 'var(--line)', arrowBg: on ? 'var(--wa)' : '#c9c9cb' };
  }
  function stepLook(on) {
    return { bg: on ? '#fff' : 'transparent', fg: on ? 'var(--ink)' : '#d0d0d0', border: on ? '#fff' : '#3a3a3a' };
  }
  function flowTabLook(on) {
    return { bg: on && !S.ind ? '#fff' : 'transparent', fg: on ? 'var(--ink)' : '#cfcfcf' };
  }
  function billingLook(on) {
    return { bg: on ? 'var(--card)' : 'transparent', fg: on ? 'var(--ink)' : 'var(--muted)', sh: on ? '0 1px 3px rgba(15,15,15,.08)' : 'none' };
  }
  function kpiHot() { return S.tick % data().kpis.length; }
  function ruleOn() { return Math.floor(S.tick / 3) % data().rules.length; }
  function flowHot() { return Math.min(S.flowTick, data().flows[S.flow].steps.length - 1); }

  /* ═══════════ الرسم ═══════════ */

  function navItems(t) {
    return [[t.navHome, '#home'], [t.navPlatform, '#platform'], [t.navSolutions, '#solutions'], [t.navPricing, '#pricing'], [t.navContact, '#contact']];
  }

  var R = {
    nav: function (t) {
      return navItems(t).map(function (s) {
        return '<a href="' + s[1] + '" class="hv-pill" style="padding:10px 16px;border-radius:999px;font-size:15.5px;font-weight:600;color:var(--ink2);pointer-events:auto">' + esc(s[0]) + '</a>';
      }).join('');
    },
    navMobile: function (t) {
      return navItems(t).map(function (s) {
        return '<a href="' + s[1] + '" data-close-menu style="padding:15px 12px;border-bottom:1px solid var(--bg2);font-size:17px;font-weight:700">' + esc(s[0]) + '</a>';
      }).join('');
    },
    trust: function (t, d) {
      return d.trust.map(function (b) {
        return '<span style="display:inline-flex;align-items:center;gap:8px;background:var(--bg2);border-radius:999px;padding:10px 16px;font-size:14.5px;font-weight:600;color:var(--ink2)"><span style="width:6px;height:6px;border-radius:2px;background:var(--peach-ink)"></span>' + esc(b) + '</span>';
      }).join('');
    },
    pillars: function (t, d) {
      return d.pillars.map(function (p, i) {
        return '<div style="background:var(--card);padding:34px 28px 38px;display:flex;flex-direction:column;gap:14px">' +
          '<span style="font-size:13px;font-weight:600;color:var(--muted)">' + pad(i + 1) + '</span>' +
          '<span style="font-size:clamp(34px,3.6vw,46px);font-weight:700;letter-spacing:-.02em">' + esc(p.title) + '</span>' +
          '<span style="font-size:15.5px;line-height:1.8;color:var(--muted)">' + esc(p.sub) + '</span></div>';
      }).join('');
    },
    caps: function (t, d) {
      return d.caps.map(function (c, i) {
        var on = S.cap === i, k = capCardLook(on);
        return '<button type="button" data-cap="' + i + '" aria-expanded="' + on + '" class="hv-border-ink" style="text-align:start;cursor:pointer;background:' + k.bg + ';color:' + k.fg + ';border:1px solid ' + k.border + ';border-radius:18px;padding:26px;display:flex;flex-direction:column;gap:12px;transition:background .25s,color .25s,border-color .25s">' +
          '<span style="display:flex;align-items:center;justify-content:space-between;width:100%">' +
          '<span data-cap-icon style="width:42px;height:42px;border-radius:12px;background:' + k.iconBg + ';display:grid;place-items:center;font-size:13px;font-weight:700;color:' + k.iconFg + '">' + pad(i + 1) + '</span>' +
          '<span data-cap-mark style="font-size:20px;font-weight:600;opacity:.55">' + k.mark + '</span></span>' +
          '<span style="font-size:20px;font-weight:700">' + esc(c.title) + '</span>' +
          '<span style="font-size:15px;line-height:1.75;opacity:.78">' + esc(c.sub) + '</span></button>';
      }).join('');
    },
    capPanel: function (t, d) {
      var i = S.cap, c = d.caps[i];
      var grid4 = i === 4;
      var tags = c.items.map(function (it) {
        return '<span style="background:var(--bg2);border-radius:8px;padding:9px 14px;font-size:14.5px;font-weight:600;color:var(--ink2);text-align:center;white-space:nowrap">' + esc(it) + '</span>';
      }).join('');
      var html = '<div>' +
        '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"><span style="font-size:14px;font-weight:600;color:var(--muted)">' + pad(i + 1) + ' / 05</span>' +
        (c.badge ? '<span style="display:inline-block;background:var(--peach);color:var(--peach-ink);border-radius:6px;padding:5px 11px;font-size:13px;font-weight:700">' + esc(c.badge) + '</span>' : '') + '</div>' +
        '<h3 style="margin:12px 0 0;font-size:clamp(26px,3vw,36px);font-weight:700;letter-spacing:-.015em">' + esc(c.detailTitle || c.title) + '</h3>' +
        '<p style="margin:14px 0 0;font-size:17px;line-height:1.9;color:var(--ink2);max-width:440px">' + esc(c.detail || c.sub) + '</p>' +
        '<div style="display:' + (grid4 ? 'grid' : 'flex') + ';grid-template-columns:repeat(2,minmax(0,1fr));max-width:' + (grid4 ? '340px' : 'none') + ';flex-wrap:wrap;gap:8px;margin-top:' + (grid4 ? '12px' : '22px') + '">' + tags + '</div>' +
        '</div>';
      if (i === 0) {
        html += '<div style="position:relative;aspect-ratio:805/700;margin:0 auto;width:100%">' +
          '<div style="position:absolute;inset:0;overflow:hidden"><img src="' + IMG + 'pos.webp" alt="نقطة البيع في أبعاد" style="position:absolute;left:-12.42%;top:0;width:127.45%;max-width:none;height:auto;display:block"></div>' +
          '<img src="' + IMG + 'pos-checkout.webp" alt="إتمام الدفع" style="position:absolute;left:71.39%;top:1.03%;width:27.93%;height:auto;display:block;border-radius:6.8% / 8.1%;box-shadow:0 2px 4px rgba(15,15,15,.05),0 14px 32px rgba(15,15,15,.12)">' +
          '<img src="' + IMG + 'pos-product.webp" alt="بطاقة منتج" style="position:absolute;left:2.36%;top:52.5%;width:23.73%;height:auto;display:block;border-radius:8.6% / 5.8%;box-shadow:0 2px 4px rgba(15,15,15,.05),0 14px 32px rgba(15,15,15,.12)">' +
          '</div>';
      } else if (i === 4) {
        html += '<div style="border-radius:18px;overflow:hidden;background:#f7f8f9;border:1px solid rgba(15,15,15,.06);box-shadow:0 1px 3px rgba(15,15,15,.04),0 16px 40px rgba(15,15,15,.07)">' +
          '<img src="' + IMG + 'costs.webp" alt="التكاليف والخسائر في أبعاد" width="1735" height="877" style="display:block;width:100%;height:auto;object-fit:contain"></div>';
      } else {
        var scale = i === 2 ? 1.08 : i === 3 ? 1.13 : 1;
        var shiftX = i === 1 || i === 2 ? '8px' : '0px';
        var shiftY = i === 2 ? '-10px' : i === 3 ? '-6px' : '0px';
        var padding = i === 1 ? '16px' : '0';
        html += '<div style="position:relative;aspect-ratio:16/10;padding:' + padding + ';transition:padding .25s">' +
          '<div style="position:relative;width:100%;height:100%;transform:translate(' + shiftX + ', ' + shiftY + ') scale(' + scale + ');transform-origin:center center;transition:transform .25s">' +
          '<img src="' + CAP_IMGS[i] + '" alt="' + esc(t.screenshot + c.title) + '" style="display:block;width:100%;height:100%;object-fit:contain;background:transparent"></div>' +
          (i === 3 ? WA_BUBBLE : '') + '</div>';
      }
      return html;
    },
    kpis: function (t, d) {
      var hot = kpiHot();
      return d.kpis.map(function (label, i) {
        return '<span style="display:inline-flex;align-items:center;gap:9px;background:var(--card);border:1px solid var(--line);border-radius:999px;padding:12px 18px;font-size:15px;font-weight:700;box-shadow:0 6px 18px rgba(15,15,15,.06)"><span data-kpi-dot style="width:8px;height:8px;border-radius:50%;background:' + kpiDot(i === hot) + ';transition:background .35s"></span>' + esc(label) + '</span>';
      }).join('');
    },
    flowTabs: function (t, d) {
      return d.flows.map(function (f, i) {
        var on = S.flow === i, k = flowTabLook(on);
        return '<button type="button" role="tab" aria-selected="' + on + '" data-flow="' + i + '" style="position:relative;z-index:1;border:0;border-radius:999px;padding:11px 22px;font-size:15px;font-weight:700;cursor:pointer;background:' + k.bg + ';color:' + k.fg + ';transition:background .25s,color .45s">' + esc(f.name) + '</button>';
      }).join('');
    },
    flowSteps: function (t, d) {
      var steps = d.flows[S.flow].steps, hot = flowHot(), a = arrow();
      return steps.map(function (label, i) {
        var k = stepLook(i <= hot);
        return '<span style="display:flex;align-items:center;gap:10px"><span data-step style="border-radius:999px;padding:13px 22px;font-size:16px;font-weight:700;background:' + k.bg + ';color:' + k.fg + ';border:1px solid ' + k.border + ';transition:background .35s,color .35s,border-color .35s">' + esc(label) + '</span>' +
          (i < steps.length - 1 ? '<span aria-hidden="true" style="font-size:18px;color:#8a8a8a">' + a + '</span>' : '') + '</span>';
      }).join('');
    },
    rules: function (t, d) {
      var on = ruleOn(), a = arrow();
      return d.rules.map(function (r, i) {
        var k = ruleLook(i === on);
        return '<div data-rule style="text-align:start;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:14px;border:1px solid ' + k.border + ';background:' + k.bg + ';border-radius:14px;padding:18px;transition:background .25s,border-color .25s">' +
          '<span style="font-size:16px;font-weight:700;color:var(--ink)">' + esc(t.when) + ' ' + esc(r[0]) + '</span>' +
          '<span aria-hidden="true" data-rule-arrow style="width:30px;height:30px;border-radius:9px;display:grid;place-items:center;background:' + k.arrowBg + ';color:#fff;font-size:14px;transition:background .25s">' + a + '</span>' +
          '<span style="font-size:16px;font-weight:700;color:var(--ink)">' + esc(r[1]) + '</span></div>';
      }).join('');
    },
    storeFlow: function (t, d) {
      return d.storeFlow.map(function (label, i) {
        return '<span style="display:flex;align-items:center;gap:8px"><span style="background:var(--card);border:1px solid var(--line);border-radius:10px;padding:10px 15px;font-size:15px;font-weight:700">' + esc(label) + '</span>' +
          (i < d.storeFlow.length - 1 ? '<span aria-hidden="true" style="color:var(--muted);font-size:15px">↔</span>' : '') + '</span>';
      }).join('');
    },
    finItems: function (t, d) {
      return d.finItems.map(function (fi) {
        return '<span style="display:flex;align-items:center;gap:10px;background:var(--card);border-radius:10px;padding:12px 14px;font-size:15px;font-weight:600"><span style="width:6px;height:6px;border-radius:2px;background:var(--peach-ink)"></span>' + esc(fi) + '</span>';
      }).join('');
    },
    plans: function (t) {
      var pr = PRICING, yearly = S.billing === 'y', a = arrow();
      var check = function (stroke, f) {
        return '<li style="display:flex;align-items:flex-start;gap:10px;font-size:14.5px;line-height:1.6"><svg viewBox="0 0 16 16" width="16" height="16" style="flex:none;margin-top:3px" aria-hidden="true"><path d="M3.5 8.4l2.9 2.9 6.1-6.6" fill="none" stroke="' + stroke + '" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path></svg><span>' + esc(f) + '</span></li>';
      };
      return pr.plans.map(function (p, i) {
        var on = !!p.featured;
        var html = '<div data-plan="' + i + '" style="position:relative;background:var(--card);border:' + (on ? '1.5px solid var(--ink)' : '1px solid var(--line)') + ';border-radius:22px;padding:30px 26px 26px;display:flex;flex-direction:column;box-shadow:' + (on ? '0 2px 6px rgba(15,15,15,.04),0 18px 44px rgba(15,15,15,.08)' : 'none') + '">' +
          (on ? '<span style="position:absolute;top:26px;inset-inline-end:24px;background:var(--peach);color:var(--peach-ink);border-radius:999px;padding:5px 12px;font-size:12.5px;font-weight:700">' + esc(pr.popular) + '</span>' : '') +
          '<h3 style="margin:0;font-size:22px;font-weight:700">' + esc(p.name) + '</h3>' +
          '<p style="margin:6px 0 0;font-size:14.5px;font-weight:700;color:var(--peach-ink)">' + esc(p.tag) + '</p>' +
          '<p style="margin:10px 0 0;font-size:15px;line-height:1.8;color:var(--ink2);text-wrap:pretty;min-height:54px">' + esc(p.desc) + '</p>' +
          '<div style="display:flex;align-items:baseline;gap:8px;margin-top:20px;white-space:nowrap">' +
          '<span data-price style="font-size:clamp(38px,4vw,46px);font-weight:700;letter-spacing:-.02em;line-height:1" dir="ltr">' + (yearly ? p.y : p.m) + '</span>' +
          '<span data-period style="font-size:15px;font-weight:600;color:var(--ink2)">' + esc(pr.cur) + ' / ' + esc(yearly ? pr.perYear : pr.perMonth) + '</span></div>' +
          '<div data-was style="min-height:22px;margin-top:8px;font-size:13.5px;color:var(--muted)">' + (yearly ? wasLine(p) : '') + '</div>' +
          '<div style="margin-top:18px;background:var(--bg2);border-radius:14px;padding:14px 16px">' +
          '<div style="font-size:12.5px;font-weight:700;color:var(--muted)">' + esc(pr.limitsH) + '</div>' +
          '<ul style="list-style:none;margin:8px 0 0;padding:0;display:flex;flex-direction:column;gap:6px">' +
          p.limits.map(function (lm) { return '<li style="font-size:15px;font-weight:600">' + esc(lm) + '</li>'; }).join('') + '</ul></div>' +
          '<div style="margin-top:20px;font-size:13.5px;font-weight:700;color:var(--ink)">' + esc(p.incH) + '</div>' +
          '<ul style="list-style:none;margin:10px 0 0;padding:0;display:flex;flex-direction:column;gap:9px">' +
          p.inc.map(function (f) { return check('var(--ink)', f); }).join('') + '</ul>';
        if (p.wa && p.wa.length) {
          html += '<div style="margin-top:18px;font-size:13.5px;font-weight:700;color:var(--ink)">' + esc(pr.waH) + '</div>' +
            '<ul style="list-style:none;margin:10px 0 0;padding:0;display:flex;flex-direction:column;gap:9px">' +
            p.wa.map(function (f) { return check('var(--wa)', f); }).join('') + '</ul>';
        }
        if (p.add && p.add.length) {
          html += '<div style="margin-top:18px;border:1px dashed #c9c9cb;border-radius:14px;padding:14px 16px">' +
            '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><span style="font-size:13px;font-weight:700;color:var(--ink)">' + esc(pr.addH) + '</span><span style="background:var(--bg2);border-radius:999px;padding:2px 9px;font-size:11.5px;font-weight:700;color:var(--muted)">' + esc(pr.addTag) + '</span></div>' +
            '<ul style="list-style:none;margin:10px 0 0;padding:0;display:flex;flex-direction:column;gap:10px">' +
            p.add.map(function (ad) {
              return '<li style="display:flex;align-items:flex-start;gap:10px"><span aria-hidden="true" style="flex:none;font-size:14px;line-height:1.5;font-weight:700;color:var(--muted)">+</span><div><div style="font-size:14.5px;font-weight:600;line-height:1.5">' + esc(ad.t) + '</div>' +
                (ad.d ? '<div style="margin-top:2px;font-size:13.5px;line-height:1.7;color:var(--muted)">' + esc(ad.d) + '</div>' : '') + '</div></li>';
            }).join('') + '</ul>' +
            '<a href="#contact" style="display:inline-flex;align-items:center;gap:6px;margin-top:12px;font-size:13.5px;font-weight:700;color:var(--ink)">' + esc(pr.addCta) + '<span aria-hidden="true">' + a + '</span></a></div>';
        }
        if (p.exc && p.exc.length) {
          html += '<div style="margin-top:18px;padding-top:16px;border-top:1px dashed var(--line)">' +
            '<div style="font-size:13px;font-weight:700;color:var(--muted)">' + esc(pr.excH) + '</div>' +
            '<ul style="list-style:none;margin:8px 0 0;padding:0;display:flex;flex-direction:column;gap:6px">' +
            p.exc.map(function (f) { return '<li style="display:flex;align-items:center;gap:10px;font-size:14px;color:var(--muted)"><span style="width:9px;height:1.5px;background:#c9c9cb;flex:none"></span>' + esc(f) + '</li>'; }).join('') + '</ul></div>';
        }
        html += '<div style="flex:1"></div>' +
          '<a href="' + LINKS.register + '" style="margin-top:26px;text-align:center;border-radius:999px;padding:15px 24px;font-size:15.5px;font-weight:700;background:' + (on ? 'var(--ink)' : 'transparent') + ';color:' + (on ? '#fff' : 'var(--ink)') + ';border:1px solid var(--ink)">' + esc(t.startNow) + '</a></div>';
        return html;
      }).join('');
    },
    types: function (t, d) {
      return d.types.map(function (ty, i) {
        return '<div style="background:var(--card);border:1px solid var(--line);border-radius:20px;overflow:hidden">' +
          '<div style="position:relative;aspect-ratio:4/3;background:var(--bg2)"><img src="' + TYPE_IMGS[i] + '" alt="' + esc(ty.title) + '" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block"></div>' +
          '<div style="padding:22px 22px 26px"><h3 style="margin:0;font-size:20px;font-weight:700">' + esc(ty.title) + '</h3>' +
          '<p style="margin:8px 0 0;font-size:15px;line-height:1.75;color:var(--muted)">' + esc(ty.sub) + '</p></div></div>';
      }).join('');
    },
    typeOptions: function (t, d) {
      return '<option value="">' + esc(t.chooseType) + '</option>' +
        d.types.map(function (x) { return x.title; }).concat([t.other]).map(function (o) {
          return '<option value="' + esc(o) + '">' + esc(o) + '</option>';
        }).join('');
    },
    contactInfo: function (t) {
      return contacts(t).map(function (ci) {
        return '<div style="display:flex;gap:10px"><span style="font-weight:700;min-width:90px">' + esc(ci.k) + '</span><span dir="ltr" style="color:var(--muted);unicode-bidi:isolate"><a href="' + ci.href + '" style="color:inherit">' + esc(ci.v) + '</a></span></div>';
      }).join('');
    },
    footNav: function (t) {
      return [[t.navPlatform, '#platform'], [t.navSolutions, '#solutions'], [t.navContact, '#contact'], [t.login, LINKS.login]].map(function (s) {
        return '<a href="' + s[1] + '" class="hv-white" style="color:#d9d9d9;font-size:15px;font-weight:600">' + esc(s[0]) + '</a>';
      }).join('');
    },
    footContact: function (t) {
      return contacts(t).map(function (ci) {
        return '<span dir="ltr" style="unicode-bidi:isolate;text-align:start"><a href="' + ci.href + '" style="color:inherit">' + esc(ci.v) + '</a></span>';
      }).join('');
    }
  };

  function contacts(t) {
    return [
      { k: t.ciEmail, v: t.ciEmailV, href: 'mailto:' + t.ciEmailV },
      { k: t.ciPhone, v: t.ciPhoneV, href: 'tel:' + t.ciPhoneV.replace(/\s+/g, '') }
    ];
  }
  function wasLine(p) {
    return '<span>' + esc(PRICING.instead) + ' </span><s dir="ltr" style="unicode-bidi:isolate">' + p.was + '</s><span> ' + esc(PRICING.cur) + '</span>';
  }

  var WA_BUBBLE = '<div dir="rtl" style="position:absolute;z-index:2;left:calc(3% + 10px);bottom:calc(7% + 12px);transform:scale(1.09);transform-origin:left bottom;width:165px;min-height:76px;box-sizing:border-box;background:#fff;border:1px solid rgba(15,15,15,.08);border-radius:14px;box-shadow:0 2px 4px rgba(15,15,15,.04),0 12px 28px rgba(15,15,15,.10);padding:11px 12px;display:flex;gap:9px;align-items:flex-start;text-align:start">' +
    '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" style="flex:none;display:block"><circle cx="12" cy="12" r="12" fill="#25D366"></circle><path fill="#fff" d="M16.6 13.9c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1-.2.2-.6.8-.7.9-.1.2-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.4.1-.5l.4-.4c.1-.1.2-.3.2-.4.1-.1 0-.3 0-.4l-.7-1.7c-.2-.5-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.4c.1.2 1.6 2.5 3.9 3.5 1.4.6 1.9.6 2.6.5.4-.1 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1 0-.1-.2-.1-.4-.2zM12 4.5c-4.1 0-7.5 3.4-7.5 7.5 0 1.4.4 2.7 1.1 3.9L4.5 19.5l3.7-1c1.1.6 2.4 1 3.8 1 4.1 0 7.5-3.4 7.5-7.5S16.1 4.5 12 4.5zm0 13.7c-1.3 0-2.5-.4-3.5-1l-.3-.2-2.2.6.6-2.1-.2-.3c-.7-1-1.1-2.3-1.1-3.6 0-3.4 2.8-6.2 6.2-6.2s6.2 2.8 6.2 6.2-2.6 6.6-5.7 6.6z"></path></svg>' +
    '<div style="min-width:0;display:flex;flex-direction:column;gap:2px">' +
    '<span style="font-size:10.5px;font-weight:600;color:#1f9d55;line-height:1.3" dir="ltr">WhatsApp</span>' +
    '<span style="font-size:12.5px;font-weight:700;color:var(--ink);line-height:1.35">أحمد</span>' +
    '<span style="font-size:11px;color:var(--ink2);line-height:1.4">تم تأكيد طلبك بنجاح ✓</span>' +
    '</div></div>';

  /*
   * يرسم كلَّ ما يتبدّل باللغة في `root`: النصوص (data-i18n) والقوائم (data-list).
   * ويُستعمل نفسُه لرسم النسخة العربية في index.html.
   */
  function renderAll(root) {
    var t = tr(), d = data();
    $$('[data-i18n]', root).forEach(function (el) { el.textContent = t[el.getAttribute('data-i18n')]; });
    $$('[data-i18n-alt]', root).forEach(function (el) { el.setAttribute('alt', t[el.getAttribute('data-i18n-alt')]); });
    $$('[data-i18n-aria]', root).forEach(function (el) { el.setAttribute('aria-label', t[el.getAttribute('data-i18n-aria')]); });
    $$('[data-list]', root).forEach(function (el) {
      var draw = R[el.getAttribute('data-list')];
      if (draw) el.innerHTML = draw(t, d);
    });
    var panel = $('[data-cap-panel]', root);
    if (panel) panel.setAttribute('data-g', capGrid());
    $$('[data-arrow]', root).forEach(function (el) { el.textContent = arrow(); });
    $$('[data-mail]', root).forEach(function (el) { el.textContent = MAIL; el.setAttribute('href', 'mailto:' + MAIL); });
  }
  function capGrid() { return S.cap === 0 ? 'detail-wide' : S.cap === 4 ? 'detail-xwide' : 'detail'; }

  /* ═══════════ الحالة: ترقيعٌ في المكان كي تعمل انتقالات CSS كما في التصميم ═══════════ */

  function applyCaps() {
    $$('[data-cap]').forEach(function (b) {
      var on = Number(b.getAttribute('data-cap')) === S.cap, k = capCardLook(on);
      b.style.background = k.bg; b.style.color = k.fg; b.style.borderColor = k.border;
      b.setAttribute('aria-expanded', String(on));
      var icon = $('[data-cap-icon]', b); icon.style.background = k.iconBg; icon.style.color = k.iconFg;
      $('[data-cap-mark]', b).textContent = k.mark;
    });
  }
  function applyCapVis() {
    var panel = $('[data-cap-panel]');
    panel.style.opacity = S.capVis ? '1' : '0';
    panel.style.transform = 'translateY(' + (S.capVis ? '0px' : '8px') + ')';
  }
  function applyKpis() {
    var hot = kpiHot();
    $$('[data-kpi-dot]').forEach(function (dot, i) { dot.style.background = kpiDot(i === hot); });
  }
  function applyRules() {
    var on = ruleOn();
    $$('[data-rule]').forEach(function (r, i) {
      var k = ruleLook(i === on);
      r.style.background = k.bg; r.style.borderColor = k.border;
      $('[data-rule-arrow]', r).style.background = k.arrowBg;
    });
  }
  function applySteps() {
    var hot = flowHot();
    $$('[data-step]').forEach(function (s, i) {
      var k = stepLook(i <= hot);
      s.style.background = k.bg; s.style.color = k.fg; s.style.borderColor = k.border;
    });
  }
  function applyFlowTabs() {
    $$('[data-flow]').forEach(function (b) {
      var on = Number(b.getAttribute('data-flow')) === S.flow, k = flowTabLook(on);
      b.style.background = k.bg; b.style.color = k.fg;
      b.setAttribute('aria-selected', String(on));
    });
    var ind = $('[data-flow-ind]'), v = S.ind || { left: '0px', top: '0px', width: '0px', height: '0px', opacity: 0 };
    ind.style.left = v.left; ind.style.top = v.top; ind.style.width = v.width; ind.style.height = v.height; ind.style.opacity = String(v.opacity);
  }
  function applyFlowVis() {
    var box = $('[data-list="flowSteps"]');
    box.style.opacity = S.flowVis ? '1' : '0';
    box.style.transform = 'translateY(' + (S.flowVis ? '0px' : '8px') + ')';
  }
  function applyBilling() {
    var yearly = S.billing === 'y', pr = PRICING;
    $$('[data-billing]').forEach(function (b) {
      var on = (b.getAttribute('data-billing') === 'y') === yearly, k = billingLook(on);
      b.style.background = k.bg; b.style.color = k.fg; b.style.boxShadow = k.sh;
      b.setAttribute('aria-selected', String(on));
    });
    $('[data-save]').style.opacity = yearly ? '1' : '0';
    $$('[data-plan]').forEach(function (card) {
      var p = pr.plans[Number(card.getAttribute('data-plan'))];
      $('[data-price]', card).textContent = yearly ? p.y : p.m;
      $('[data-period]', card).textContent = pr.cur + ' / ' + (yearly ? pr.perYear : pr.perMonth);
      $('[data-was]', card).innerHTML = yearly ? wasLine(p) : '';
    });
  }

  /* ═══════════ القدرات: دورةٌ كلّ 3.5 ثانية، تتوقّف تحت المؤشّر ═══════════ */

  var capTimer, capFadeT, capPaused = false;
  function startCapCycle() {
    clearInterval(capTimer);
    capTimer = setInterval(function () { if (!capPaused) showCap((S.cap + 1) % CAP_COUNT); }, CAP_INTERVAL);
  }
  function showCap(i) {
    if (i === S.cap) return;
    clearTimeout(capFadeT);
    S.capVis = false; applyCapVis();
    capFadeT = setTimeout(function () {
      S.cap = i; S.capVis = true;
      var panel = $('[data-cap-panel]');
      panel.innerHTML = R.capPanel(tr(), data());
      panel.setAttribute('data-g', capGrid());
      applyCaps(); applyCapVis();
    }, 180);
  }

  /* ═══════════ الترابط: تبويبٌ كلّ 4 ثوانٍ، وخطوةٌ تضيء كلّ 550 جزءًا ═══════════ */

  var flowTimer, flowFadeT, flowTouchT, flowTouching = false;
  function measureInd() {
    var tabs = $$('[data-flow]'), b = tabs[S.flow];
    if (!b) return;
    var ind = { left: b.offsetLeft + 'px', top: b.offsetTop + 'px', width: b.offsetWidth + 'px', height: b.offsetHeight + 'px', opacity: 1 };
    var p = S.ind;
    if (!p || p.left !== ind.left || p.top !== ind.top || p.width !== ind.width) { S.ind = ind; applyFlowTabs(); }
  }
  function startFlowCycle() {
    clearInterval(flowTimer);
    flowTimer = setInterval(function () {
      var sec = $('[data-flow-section]');
      if ((sec && sec.matches && sec.matches(':hover')) || flowTouching) return;
      showFlow((S.flow + 1) % FLOW_COUNT);
    }, FLOW_INTERVAL);
  }
  function showFlow(i) {
    if (i === S.flow) return;
    clearTimeout(flowFadeT);
    S.flow = i; S.flowVis = false;
    $('[data-list="flowSteps"]').innerHTML = R.flowSteps(tr(), data());
    applyFlowTabs(); applyFlowVis(); measureInd();
    flowFadeT = setTimeout(function () { S.flowVis = true; S.flowTick = 0; applyFlowVis(); applySteps(); }, 200);
  }

  /* ═══════════ اللغة والقائمة ═══════════ */

  function setLang(l) {
    S.lang = l;
    var dir = l === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('lang', l);
    document.documentElement.setAttribute('dir', dir);
    var page = $('[data-site]');
    page.setAttribute('lang', l); page.setAttribute('dir', dir);
    setMenu(false);
    clearErrors();
    renderAll(document);
    applyBilling(); applyCapVis(); applyFlowVis();
    measureInd();
  }
  function setMenu(open) {
    S.menuOpen = open;
    $('[data-menu]').hidden = !open;
    $('[data-action="menu"]').setAttribute('aria-expanded', String(open));
  }

  /* ═══════════ نموذج التواصل: يفتح رسالةً جاهزة في بريد الزائر ═══════════ */

  var FIELDS = ['name', 'company', 'phone', 'email', 'type', 'message'];
  function clearErrors() {
    $$('[data-err]').forEach(function (e) { e.hidden = true; e.textContent = ''; });
  }
  function submit(e) {
    e.preventDefault();
    var f = e.target, t = tr();
    var v = function (n) { return f.elements[n] ? String(f.elements[n].value || '').trim() : ''; };
    var errors = {};
    if (v('name').length < 2) errors.name = t.errName;
    if (v('company').length < 2) errors.company = t.errCompany;
    if (v('phone').replace(/[^\d]/g, '').length < 8) errors.phone = t.errPhone;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v('email'))) errors.email = t.errEmail;
    if (!v('type')) errors.type = t.errType;
    if (v('message').length < 5) errors.message = t.errMessage;
    clearErrors();
    var bad = FIELDS.filter(function (n) { return errors[n]; });
    bad.forEach(function (n) { var el = $('[data-err="' + n + '"]'); el.textContent = errors[n]; el.hidden = false; });
    if (bad.length) return;

    var body = [
      t.fName + ': ' + v('name'), t.fCompany + ': ' + v('company'), t.fPhone + ': ' + v('phone'),
      t.fEmail + ': ' + v('email'), t.fType + ': ' + v('type'), '', v('message')
    ].join('\r\n');
    var href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent(t.mailSubject + ' — ' + v('company')) + '&body=' + encodeURIComponent(body);
    $('[data-mail-again]').setAttribute('href', href);
    setSent(true);
    window.location.href = href;
  }
  function setSent(sent) {
    S.sent = sent;
    $('[data-sent]').hidden = !sent;
    $('[data-contact-form]').hidden = sent;
    if (!sent) { $('[data-contact-form]').reset(); clearErrors(); }
  }

  /* ═══════════ التشغيل ═══════════ */

  function init() {
    if (!$('[data-site]')) return;
    var year = $('[data-year]'); if (year) year.textContent = String(new Date().getFullYear());
    renderAll(document);
    applyBilling();

    document.addEventListener('click', function (e) {
      var el = e.target.closest('[data-action],[data-cap],[data-flow],[data-billing],[data-close-menu]');
      if (!el) return;
      if (el.hasAttribute('data-cap')) { showCap(Number(el.getAttribute('data-cap'))); startCapCycle(); return; }
      if (el.hasAttribute('data-flow')) { showFlow(Number(el.getAttribute('data-flow'))); startFlowCycle(); return; }
      if (el.hasAttribute('data-billing')) { S.billing = el.getAttribute('data-billing'); applyBilling(); return; }
      if (el.hasAttribute('data-close-menu')) { setMenu(false); return; }
      var action = el.getAttribute('data-action');
      if (action === 'lang') setLang(S.lang === 'ar' ? 'en' : 'ar');
      else if (action === 'menu') setMenu(!S.menuOpen);
      else if (action === 'reset-form') setSent(false);
    });
    $('[data-contact-form]').addEventListener('submit', submit);

    $$('[data-cap-hover]').forEach(function (el) {
      el.addEventListener('mouseenter', function () { capPaused = true; });
      el.addEventListener('mouseleave', function () { capPaused = false; });
    });
    var flowSec = $('[data-flow-section]');
    flowSec.addEventListener('touchstart', function () { clearTimeout(flowTouchT); flowTouching = true; }, { passive: true });
    flowSec.addEventListener('touchend', function () {
      clearTimeout(flowTouchT);
      flowTouchT = setTimeout(function () { flowTouching = false; }, 2500);
    }, { passive: true });

    setInterval(function () { S.tick += 1; applyKpis(); applyRules(); }, TICK_MS);
    setInterval(function () { S.flowTick += 1; applySteps(); }, FLOW_STEP_MS);
    startCapCycle();
    startFlowCycle();
    measureInd();
    window.addEventListener('resize', measureInd);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureInd);

    // صورُ القدرات تُطلب قبل أن تدور إليها البطاقات
    window.addEventListener('load', function () {
      CAP_IMGS.concat([IMG + 'costs.webp']).forEach(function (src) { if (src) { var im = new Image(); im.src = src; } });
    });
  }

  if (window.__ABAAD_PRERENDER__) {
    // يرسم النسخة العربية في index.html — لا يشغّل شيئًا
    window.__ABAAD_PRERENDER__.render = function (root) { renderAll(root); };
    return;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
