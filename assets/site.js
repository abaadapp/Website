/*
 * أبعاد — الموقع التعريفي على abaadapp.om
 *
 * صفحتان ثابتتان: index.html بالعربية على / وen/index.html بالإنجليزية على /en/،
 * كلٌّ منهما جاهزةٌ بلغتها لمن لا يشغّل JavaScript ولمحرّكات البحث. وهذا الملفّ
 * يشغّل ما يتحرّك فيهما — قائمة الجوال، بطاقات القدرات، تبويبات الترابط، الأتمتة،
 * الأسعار الشهرية/السنوية، ونموذج التواصل. النصوص والتوقيتات منقولةٌ من التصميم
 * كما هي. وتبديل اللغة رابطٌ عاديّ بين الصفحتين.
 *
 * والقوائم تُرسم من البيانات أدناه بلغة الصفحة؛ ورسمُها نفسُه هو ما في الصفحتين
 * (npm run prerender).
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
  // صفحتا اللغتين على الموقع نفسه
  var PAGES = { ar: '/', en: '/en/' };
  var MAIL = 'abaadappom@gmail.com';
  /*
   * نموذجُ «تواصل معنا» يُرسَل إلى CRM أبعاد على النظام — لا إلى بريد الزائر.
   * بابٌ عامّ بلا مفتاحٍ ولا سرّ: يحرسه الخادم (الأصل، والخنق، والفخّ، والتحقّق).
   */
  var CONTACT_URL = APP + '/website/contact';
  // نوعُ النشاط يُرسَل مفتاحًا ثابتًا بترتيب `types` ثمّ «أخرى» — والتسميةُ للعرض وحده
  var TYPE_KEYS = ['retail', 'ecommerce', 'services', 'subscriptions', 'other'];
  var IMG = '/assets/img/';
  /*
   * واتساب أبعاد — رقمُ التواصل الرسميّ نفسُه (`ciPhoneV`) بأرقامه وحدها، كما يطلبه wa.me.
   * والرابطُ يفتح المحادثةَ برسالةٍ جاهزة ولا يرسلها: الزائرُ يضغط «إرسال» بنفسه.
   */
  var WA = '96871141624';
  /*
   * ═══ العرضُ الجديد: الأساسيّةُ بلا نقطة البيع، وإضافاتُ كلّ باقة ═══
   *
   * مقبضُ نشرٍ مستقلّ، مطفأٌ حتى يُعتمد الإطلاقُ التجاريّ. يتبع النظامَ ولا يسبقه:
   * لا يُشعَل قبل `new_merchant_addon_pricing_enabled` في لوحة المنصّة (abaad.Saas،
   * `Addons\PricingPolicy`). فقبله يُسجَّل الزائرُ على السياسة السابقة، وأساسيّتُها
   * فيها نقطةُ البيع كما تقول البطاقةُ اليوم — والإعلانُ عن غيرها وعدٌ لا يُنفَّذ.
   *
   * ومطفأً لا يتغيّر في الصفحة شيء: البطاقاتُ كما كانت، وقسمُ الإضافات مخفيّ.
   * ويُشعَل بسطرٍ هنا ثمّ `npm run prerender` — في طلبٍ وحده بعد الإطلاق.
   */
  var ADDON_OFFER = true;

  var T = {
    ar: {
      langSwitch: 'English', langAria: 'التبديل إلى الإنجليزية', login: 'تسجيل الدخول', startNow: 'ابدأ الآن',
      brand: 'أبعاد', navAria: 'أقسام الموقع', menuAria: 'القائمة',
      navHome: 'الرئيسية', navPlatform: 'المنصة', navSolutions: 'الحلول', navContact: 'تواصل معنا', navPricing: 'الأسعار',
      priceTitle: 'باقات واضحة تناسب نشاطك.', priceSub: 'اختر الباقة التي تناسب حجم نشاطك، وابدأ بما تحتاجه اليوم.',
      billMonthly: 'شهري', billHalf: 'نصف سنوي', billYearly: 'سنوي',
      heroTitle: 'كل أعمالك. في مكان واحد.',
      heroSub: 'أبعاد منصة متكاملة تجمع المبيعات، الإدارة، التجارة الإلكترونية، العملاء، المدفوعات، المالية والأتمتة — لتشغّل أعمالك من مكان واحد وتنمو بوضوح أكبر.',
      heroCta: 'ابدأ مع أبعاد', heroCta2: 'استكشف المنصة',
      slotHero: 'لوحة تحكم أبعاد ونقطة البيع والمتجر الإلكتروني وواتساب',
      altPos: 'نقطة البيع في أبعاد', altCheckout: 'إتمام الدفع', altProduct: 'بطاقة منتج', altCosts: 'التكاليف والخسائر في أبعاد',
      altWa: 'محادثة واتساب من أبعاد', altStore: 'متجر إلكتروني من أبعاد على اللابتوب والجوال',
      aboutBadge: 'منصة أبعاد', aboutTitle: 'كل أعمالك في نظام واحد.',
      aboutSub: 'أدر المبيعات والطلبات والمخزون والعملاء والمالية من منصة واحدة، بدل التنقل بين أنظمة متعددة.',
      platBadge: 'كل ما تحتاجه', platTitle: 'منصة واحدة. لكل عملياتك.',
      platSub: 'كل ما تحتاجه لإدارة أعمالك، من البيع والمخزون إلى العملاء والمالية، في منصة واحدة مترابطة.',
      dashBadge: 'التحليلات ولوحة التحكم', dashTitle: 'شاهد أعمالك كاملة من مكان واحد.',
      dashSub: 'كل ما تحتاج معرفته عن أعمالك، أمامك بوضوح. مبيعاتك، أرباحك، طلباتك ومخزونك في لوحة واحدة تساعدك تقرر أسرع.',
      slotDash: 'لوحة تحكم أبعاد',
      connTitle: 'القوة ليست في الأدوات فقط. بل في ترابطها.',
      connSub: 'كل عملية داخل أبعاد تتصل ببقية المنصة، لتقلل العمل اليدوي وتحافظ على بيانات أعمالك محدثة في مكان واحد.',
      waBadge: 'واتساب + الأتمتة', autoLabel: 'الأتمتة',
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
      sending: 'جارٍ الإرسال…',
      // «تم الاستلام» بعد أن حفظه الخادم فعلًا — لا قبل
      sentTitle: 'تم استلام طلبك بنجاح.',
      sentBody: 'سنتواصل معك قريبًا.',
      mailOr: 'أو راسلنا مباشرة على',
      sendAnother: 'إرسال طلب آخر',
      errSend: 'تعذر إرسال الطلب الآن. حاول مرة أخرى.',
      errBusy: 'محاولات كثيرة خلال وقت قصير. انتظر قليلًا ثم حاول مرة أخرى.',
      errName: 'الرجاء إدخال الاسم.', errCompany: 'الرجاء إدخال اسم النشاط.', errPhone: 'الرجاء إدخال رقم هاتف صحيح.',
      errEmail: 'الرجاء إدخال بريد إلكتروني صحيح.', errType: 'الرجاء اختيار نوع النشاط.', errMessage: 'الرجاء كتابة رسالة قصيرة.',
      privacy: 'سياسة الخصوصية', terms: 'الشروط',
      ciEmail: 'البريد', ciPhone: 'الهاتف', ciEmailV: MAIL, ciPhoneV: '+968 71141624',
      screenshot: 'لقطة شاشة: '
    },
    en: {
      langSwitch: 'العربية', langAria: 'Switch to Arabic', login: 'Log in', startNow: 'Get started',
      brand: 'Abaad', navAria: 'Site navigation', menuAria: 'Menu',
      navHome: 'Home', navPlatform: 'Platform', navSolutions: 'Solutions', navContact: 'Contact us', navPricing: 'Pricing',
      priceTitle: 'Clear plans that fit your business.', priceSub: 'Pick the right plan, then add the devices or services you need.',
      billMonthly: 'Monthly', billHalf: 'Semi-annual', billYearly: 'Yearly',
      heroTitle: 'Your whole business. In one place.',
      heroSub: 'Abaad is an integrated platform that brings together sales, management, e-commerce, customers, payments, finance and automation — so you run your business from one place and grow with more clarity.',
      heroCta: 'Start with Abaad', heroCta2: 'Explore the platform',
      slotHero: 'The Abaad dashboard, point of sale, online store and WhatsApp',
      altPos: 'Abaad point of sale', altCheckout: 'Checkout', altProduct: 'Product card', altCosts: 'Abaad costs and losses',
      altWa: 'WhatsApp conversation', altStore: 'Online store',
      aboutBadge: 'The Abaad platform', aboutTitle: 'One system instead of many.',
      aboutSub: 'From running your day-to-day to selling, talking to customers and tracking your numbers, Abaad brings your business operations into one connected system.',
      platBadge: 'Everything you need', platTitle: 'One platform. For every operation.',
      platSub: 'Integrated tools covering your business cycle, from management and sales to communication and finance.',
      dashBadge: 'Analytics & dashboard', dashTitle: 'See your whole business from one place.',
      dashSub: 'Everything you need to know about your business, clearly in front of you. Your sales, profits, orders and inventory in one dashboard that helps you decide faster.',
      slotDash: 'The Abaad dashboard',
      connTitle: 'The power is not just in the tools. It is in how they connect.',
      connSub: 'Every operation in Abaad connects to the rest of the platform, reducing manual work and keeping your business data up to date in one place.',
      waBadge: 'WhatsApp + Automation', autoLabel: 'Automation',
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
      sending: 'Sending…',
      sentTitle: 'Your request has been received.',
      sentBody: 'We’ll contact you soon.',
      mailOr: 'Or email us directly at',
      sendAnother: 'Send another request',
      errSend: 'Couldn’t send your request. Please try again.',
      errBusy: 'Too many attempts in a short time. Please wait a moment and try again.',
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

  /*
   * الأسعار باللغتين — والأرقام واحدة فيهما (m شهريًا، y سنويًا، was ما يحلّ السنويُّ
   * محلَّه)؛ تتبدّل الكلماتُ وحدها.
   */
  var PRICING = {};
  PRICING.ar = {
    cur: 'ر.ع', perMonth: 'شهريًا', perHalf: 'نصف سنويًا', perYear: 'سنويًا', popular: 'الأكثر طلبًا', save: 'وفّر قيمة شهرين', instead: 'بدل',
    limitsH: 'حدود الاستخدام', waH: 'واتساب', excH: 'غير مشمول في هذه الباقة',
    addH: 'تخصيصات اختيارية', addTag: 'إضافة اختيارية', addCta: 'تواصل معنا للتفعيل',
    waNote: 'في الباقات التي تشمل واتساب: 100 رسالة مجانية شهريًا عبر رقم أبعاد.',
    waPack: '500 رسالة إضافية — 7.500 ر.ع',
    onRequest: 'حسب الطلب',
    /*
     * ما يُضاف إلى الباقة — خدمةٌ وباقتا أجهزة، تحت الأسعار كما في التصميم.
     * لا `price` = «حسب الطلب». وأسماءُ باقتَي الأجهزة مؤقّتة حتى تُعتمد.
     */
    extras: [
      { tag: 'خدمة', name: 'تطبيق هاتف خاص مخصص', desc: 'تطبيق باسم نشاطك وهويتك.', price: '880', cta: 'اطلب الخدمة' },
      { tag: 'باقة أجهزة', name: 'باقة الأجهزة الأولى', desc: 'آيباد + ستاند', cta: 'اطلب السعر' },
      { tag: 'باقة أجهزة', name: 'باقة الأجهزة الثانية', desc: 'آيباد + ستاند + طابعة حرارية + درج كاش', cta: 'اطلب السعر' }
    ],
    /*
     * كلُّ بطاقةٍ تذكر ما تضيفه على التي قبلها، لا ما فيها كلَّه — وبأسماء
     * قدرات النظام (`PlanFeatures` في abaad.Saas): ما يُغلق في الأساسية هو
     * القدراتُ السبع، وتفتحها الاحترافية كلَّها، والمؤسساتُ مثلُها بحدودٍ أعلى
     * ومعها قدراتُ إدارة الفروع التي لا تُفتح لغيرها.
     * فالاسمُ هنا هو ما يقرؤه التاجر في رسالة «رقِّ الباقة لفتحها».
     * وبندٌ `{ t, d }` عنوانٌ وشرحُه تحته.
     *
     * والحدودُ هي ما يفرضه النظام (`PlanLimits`، وترحيل
     * `2026_10_17_120000_the_plans_climb_one_ladder_of_limits`): فروع 1·3·10،
     * ومستخدمون نشطون 3·15·100 والمالكُ منهم، ومنتجات 500·10,000·بلا حدّ.
     * وما فوق عشرة فروع سعرٌ خاصّ (`more`).
     */
    plans: [
      { name: 'الأساسية', tag: 'إدارة متجرك اليومية', desc: 'كل ما تحتاجه لتشغيل وإدارة متجرك يوميًا.', m: '9.900', h: '59.400', y: '99', was: '118.800',
        limits: ['فرع واحد', 'حتى 3 مستخدمين نشطين مع المالك', 'حتى 500 منتج'], incH: 'التشغيل',
        inc: ['نقطة البيع والمبيعات والطلبات', 'إدارة المنتجات', 'إدارة المخزون', 'العملاء', 'الموردون والمشتريات', 'فواتير العملاء', 'المالية والمصروفات', 'الرواتب والموظفون', 'لوحة التجهيز', 'لوحة التحكم والملخصات', 'التقارير الأساسية'],
        exc: ['الموقع الإلكتروني', 'أدوات التسويق', 'برنامج الولاء', 'التقارير المتقدمة', 'الصلاحيات المخصصة', 'التطبيقات التكاملية', 'واتساب'] },
      { name: 'الاحترافية', tag: 'إدارة + نمو', desc: 'شغّل متجرك وطوّر مبيعاتك بحضور رقمي وأدوات نمو متكاملة.', m: '29.900', h: '179.400', y: '299', was: '358.800', featured: true,
        limits: ['حتى 3 فروع', 'حتى 15 مستخدمًا نشطًا مع المالك', 'حتى 10,000 منتج'], incH: 'كل ما في الأساسية، ومعها',
        inc: [
          { t: 'الموقع الإلكتروني', d: 'متجرك أونلاين بتصميمه ونطاقه وظهوره في البحث.' },
          { t: 'أدوات التسويق', d: 'الكوبونات والعروض وتقييمات العملاء.' },
          { t: 'برنامج الولاء', d: 'نقاط يجمعها عملاؤك ويستبدلونها عند الصندوق.' },
          { t: 'التقارير المتقدمة', d: 'تحليل الهالك وتصدير التقارير.' },
          { t: 'الصلاحيات المخصصة', d: 'تحدد الأقسام التي يصل إليها كل موظف.' },
          { t: 'التطبيقات التكاملية', d: 'خرائط Google وملف نشاطك على Google Business.' }
        ],
        wa: ['إشعارات واتساب عبر رقم أبعاد', '100 رسالة واتساب مجانية شهريًا', 'إمكانية شراء رصيد رسائل إضافي'],
        add: [{ t: 'استخدم رقم واتساب متجرك', d: 'اربط رقم واتساب أعمالك الخاص بدل رقم أبعاد — متاح كإضافة اختيارية.' }, { t: 'خصص موقعك الإلكتروني', d: 'تخصيص احترافي للموقع بما يناسب هوية نشاطك — خدمة إضافية.' }] },
      /*
       * والمؤسساتُ: حدودٌ أعلى، وإدارةُ الفروع التي تُباع معها وحدها — قدراتُ
       * `PlanFeatures::ENTERPRISE` في abaad.Saas (نقلُ المخزون، وطلباتُ التزويد،
       * وأداءُ الفروع، والتقريرُ الأسبوعيّ، والتنبيهاتُ المركزيّة). كلُّ بندٍ هنا
       * شاشةٌ تعمل في النظام، ولا يُوعَد بإرسالٍ أسبوعيٍّ بالبريد أو واتساب.
       */
      { name: 'المؤسسات', tag: 'إدارة متقدمة لجميع فروعك', desc: 'للشركات والمتاجر متعددة الفروع التي تحتاج إلى متابعة الأداء وإدارة المخزون والطلبات والموافقات من نظام واحد.', m: '69.900', h: '419.400', y: '699', was: '838.800',
        limits: ['حتى 10 فروع', 'حتى 100 مستخدم نشط مع المالك', 'منتجات غير محدودة'], incH: 'كل ما في الاحترافية، بالإضافة إلى',
        more: 'أكثر من 10 فروع؟ تواصل معنا لسعر خاص',
        inc: [
          { t: 'تشغيل عدة فروع', d: 'حتى 10 فروع من نظام واحد.' },
          { t: 'فريق أكبر', d: 'حتى 100 مستخدم نشط مع المالك.' },
          { t: 'منتجات غير محدودة', d: 'إدارة عدد غير محدود من المنتجات.' },
          { t: 'نقل المخزون بين الفروع', d: 'نقل المنتجات بسندات موثقة، مع متابعة الإرسال وتأكيد الاستلام.' },
          { t: 'طلبات تزويد الفروع', d: 'تطلب الفروع البضاعة وتتابع الموافقة والتجهيز والتسليم.' },
          { t: 'إدارة الموافقات', d: 'التحكم في من يطلب ومن يعتمد ومن يرسل ومن يستلم.' },
          { t: 'مقارنة أداء الفروع', d: 'متابعة مبيعات وأرباح ومخزون جميع الفروع في لوحة مركزية.' },
          { t: 'تقارير حركة المخزون', d: 'مراجعة التحويلات والكميات والفروقات بين الفروع.' },
          { t: 'تنبيهات مركزية', d: 'متابعة نقص المخزون والطلبات المعلقة والتحويلات المتأخرة.' },
          { t: 'تقرير أسبوعي للفروع', d: 'ملخص أسبوعي للمبيعات والأرباح والمخزون والعمليات.' }
        ],
        wa: ['إشعارات واتساب عبر رقم أبعاد', '100 رسالة واتساب مجانية شهريًا', 'إمكانية شراء رصيد رسائل إضافي'],
        add: [{ t: 'استخدم رقم واتساب شركتك', d: 'اربط رقم واتساب أعمالك الخاص بدل رقم أبعاد — متاح كإضافة اختيارية.' }, { t: 'خصص موقعك الإلكتروني', d: 'تخصيص احترافي للموقع بما يناسب هويتك وفروعك — خدمة إضافية.' }] }
    ],
    /*
     * الباقة المخصّصة — كلُّ ما في الباقات الثلاث، ويُبنى فوقه ما يحتاجه النشاط.
     * بلا سعر: مكانُه «تواصل معنا». وليست في `plans` لأنّها لا تُشترى عند التسجيل.
     */
    custom: { name: 'المخصصة', tag: 'مصممة على احتياجك', desc: 'للشركات والأفراد الذين يحتاجون تخصيصًا ومميزات تُبنى على احتياجهم.',
      incH: 'ما تحصل عليه',
      inc: [
        { t: 'كل مميزات الباقات', d: 'كل ما في الأساسية والاحترافية والمؤسسات.' },
        { t: 'مميزات مخصصة لنشاطك', d: 'نبني ما يحتاجه عملك من مميزات وتقارير وطريقة عمل.' },
        { t: 'حدود على مقاسك', d: 'فروع ومستخدمون ومنتجات بالعدد الذي تحتاجه.' }
      ],
      cta: 'تواصل معنا عبر واتساب' }
  };
  PRICING.en = {
    cur: 'OMR', perMonth: 'month', perHalf: '6 months', perYear: 'year', popular: 'Most popular', save: 'Save two months', instead: 'instead of',
    limitsH: 'Usage limits', waH: 'WhatsApp', excH: 'Not included in this plan',
    addH: 'Optional customizations', addTag: 'Optional add-on', addCta: 'Contact us to activate',
    waNote: 'On plans that include WhatsApp: 100 free messages a month through the Abaad number.',
    waPack: '500 extra messages — 7.500 OMR',
    onRequest: 'On request',
    extras: [
      { tag: 'Service', name: 'Your own custom mobile app', desc: 'An app in your business name and brand.', price: '880', cta: 'Request the service' },
      { tag: 'Device bundle', name: 'Device Bundle 1', desc: 'iPad + stand', cta: 'Request a quote' },
      { tag: 'Device bundle', name: 'Device Bundle 2', desc: 'iPad + stand + thermal printer + cash drawer', cta: 'Request a quote' }
    ],
    plans: [
      { name: 'Basic', tag: 'Run your store day to day', desc: 'Everything you need to run and manage your store every day.', m: '9.900', h: '59.400', y: '99', was: '118.800',
        limits: ['1 branch', 'Up to 3 active users, including the owner', 'Up to 500 products'], incH: 'Operations',
        inc: ['Point of sale, sales and orders', 'Product management', 'Inventory management', 'Customers', 'Suppliers and purchasing', 'Customer invoices', 'Finance and expenses', 'Payroll and employees', 'Preparation board', 'Dashboard and summaries', 'Basic reports'],
        exc: ['Website', 'Marketing tools', 'Loyalty program', 'Advanced reports', 'Custom permissions', 'Integrations', 'WhatsApp'] },
      { name: 'Professional', tag: 'Management + growth', desc: 'Run your store and grow your sales with a digital presence and integrated growth tools.', m: '29.900', h: '179.400', y: '299', was: '358.800', featured: true,
        limits: ['Up to 3 branches', 'Up to 15 active users, including the owner', 'Up to 10,000 products'], incH: 'Everything in Basic, plus',
        inc: [
          { t: 'Website', d: 'Your store online, with its own design, domain and search visibility.' },
          { t: 'Marketing tools', d: 'Coupons, offers and customer reviews.' },
          { t: 'Loyalty program', d: 'Points your customers earn and redeem at the till.' },
          { t: 'Advanced reports', d: 'Waste analysis and report export.' },
          { t: 'Custom permissions', d: 'Choose which sections each employee can reach.' },
          { t: 'Integrations', d: 'Google Maps and your Google Business profile.' }
        ],
        wa: ['WhatsApp notifications through the Abaad number', '100 free WhatsApp messages a month', 'Option to buy extra message credit'],
        add: [{ t: "Use your store's WhatsApp number", d: 'Connect your own business WhatsApp number instead of the Abaad number — available as an optional add-on.' }, { t: 'Customize your website', d: 'Professional customization of your website to match your brand — an additional service.' }] },
      { name: 'Enterprise', tag: 'Advanced management for all your branches', desc: 'For multi-branch businesses that need to monitor performance and manage inventory, requests, and approvals from one system.', m: '69.900', h: '419.400', y: '699', was: '838.800',
        limits: ['Up to 10 branches', 'Up to 100 active users, including the owner', 'Unlimited products'], incH: 'Everything in Professional, plus',
        more: 'More than 10 branches? Contact us for custom pricing',
        inc: [
          { t: 'Multi-branch operations', d: 'Up to 10 branches in one system.' },
          { t: 'Larger teams', d: 'Up to 100 active users, including the owner.' },
          { t: 'Unlimited products', d: 'Manage an unlimited number of products.' },
          { t: 'Inter-branch inventory transfers', d: 'Transfer products with documented records, dispatch tracking, and receipt confirmation.' },
          { t: 'Branch replenishment requests', d: 'Request stock, approve replenishment, and track fulfillment.' },
          { t: 'Approval workflows', d: 'Control who can request, approve, dispatch, and receive stock.' },
          { t: 'Branch performance comparison', d: 'Compare branch sales, profits, and inventory in a centralized dashboard.' },
          { t: 'Inventory transfer reports', d: 'Track stock movements, quantities, and discrepancies.' },
          { t: 'Centralized alerts', d: 'Stay informed about low stock, pending requests, and delayed transfers.' },
          { t: 'Weekly branch report', d: 'Review weekly sales, profit, inventory, and operational performance.' }
        ],
        wa: ['WhatsApp notifications through the Abaad number', '100 free WhatsApp messages a month', 'Option to buy extra message credit'],
        add: [{ t: "Use your company's WhatsApp number", d: 'Connect your own business WhatsApp number instead of the Abaad number — available as an optional add-on.' }, { t: 'Customize your website', d: 'Professional customization of your website to fit your brand and branches — an additional service.' }] }
    ],
    custom: { name: 'Custom', tag: 'Built around your needs', desc: 'For companies and individuals who need customization and features built around their needs.',
      incH: 'What you get',
      inc: [
        { t: 'Every plan feature', d: 'Everything in Basic, Professional and Enterprise.' },
        { t: 'Features built for your business', d: 'We build the features, reports and workflow your business needs.' },
        { t: 'Limits that fit your size', d: 'As many branches, users and products as you need.' }
      ],
      cta: 'Contact us on WhatsApp' }
  };

  /*
   * ═══ إضافاتُ الاشتراك — نسخةٌ للعرض من كتالوج النظام ═══
   *
   * المصدرُ كتالوجُ «إضافات الاشتراك» في لوحة المنصّة (abaad.Saas): رموزُه وأسماؤه،
   * وأين يُشترى كلٌّ (`eligible`) وأين يُشمل (`included`) — كما زرعه ترحيلُ
   * `2026_10_30_090000_future_merchants_grow_their_subscription_with_addons`
   * (`CATALOG` و`PLANS`)، والوصفُ من `Addons\Catalog::DESCRIPTIONS`. ولا بابَ عامًّا
   * يقرؤه الموقعُ منه، فهو منسوخٌ هنا: إن تغيّر في اللوحة اسمٌ أو أهليّةٌ أو أُوقف
   * بيعُ إضافة، يُعدَّل هنا معه.
   *
   * ولا أسعار فيه عمدًا: سعرُ الإضافة في اللوحة وفواتيرها، والزائرُ يسأل عنه بواتساب.
   * والمشمولُ في باقةٍ لا يُعرض فيها إضافةً تُشترى — يُذكر «مشمولة في الباقة».
   */
  var ADDON_PLANS = [
    { key: 'basic', eligible: ['pos', 'website', 'marketing', 'loyalty', 'whatsapp'], included: [] },
    { key: 'professional', eligible: ['extra_branch', 'gift_orders', 'whatsapp_own_number', 'api_integrations'], included: ['pos', 'website', 'marketing', 'loyalty', 'whatsapp'] },
    { key: 'enterprise', eligible: ['gift_orders', 'whatsapp_own_number', 'api_integrations'], included: ['pos', 'website', 'marketing', 'loyalty', 'whatsapp'] }
  ];
  // أيقونةٌ لكلّ إضافة — خطوطٌ بلون النصّ، بلا ملفّ
  var ADDON_ICONS = {
    pos: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"></path><path d="M9 8h6M9 12h6M9 16h3"></path>',
    website: '<path d="M5 8h14l-1.2 12H6.2z"></path><path d="M9 8V6.5a3 3 0 0 1 6 0V8"></path>',
    marketing: '<path d="M3.5 12.5V4h8.5l9 9-8.5 8.5z"></path><circle cx="8" cy="8.5" r="1.4"></circle>',
    loyalty: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.9z"></path>',
    whatsapp: '<path d="M4.5 19.5l1.2-3.6A7.8 7.8 0 1 1 8.4 18.4z"></path><path d="M9.2 9.3c.3 2.3 2.4 4.4 4.7 4.8"></path>',
    extra_branch: '<path d="M3 21h18"></path><path d="M5 21V9.5L12 4l7 5.5V21"></path><path d="M9.5 21v-5.5h5V21"></path>',
    gift_orders: '<path d="M4.5 11.5h15V21h-15z"></path><path d="M3.5 7.5h17v4h-17z"></path><path d="M12 7.5V21"></path><path d="M12 7.5C10.5 4.5 7 4.5 7 6.3s3 1.2 5 1.2zm0 0c1.5-3 5-3 5-1.2s-3 1.2-5 1.2z"></path>',
    whatsapp_own_number: '<path d="M6 3.5h3.5l1.8 4.6-2.3 1.4a10.5 10.5 0 0 0 5.5 5.5l1.4-2.3 4.6 1.8V18a2.5 2.5 0 0 1-2.5 2.5A15 15 0 0 1 3.5 6 2.5 2.5 0 0 1 6 3.5z"></path>',
    api_integrations: '<path d="M8 7l-5 5 5 5"></path><path d="M16 7l5 5-5 5"></path><path d="M13.5 5l-3 14"></path>'
  };

  /*
   * ═══ الاشتراك المدفوع عبر فريق أبعاد ═══
   *
   * التسجيلُ الذاتيّ تجربةُ الأساسيّة وحدها (abaad.Saas `Signup`): أربعةَ عشر يومًا بلا
   * اختيار باقةٍ ولا دفع. فزرُّ الأساسيّة يذهب إلى التسجيل، وأزرارُ الباقات المدفوعة
   * والمخصّصة وتفعيلِ الإضافات تفتح واتساب أبعاد برسالةٍ تذكر الباقة ومدّتها — والفريقُ
   * يفتح الاشتراك ويُصدر فاتورته من لوحة المنصّة.
   */
  PRICING.ar.trialCta = 'ابدأ تجربتك المجانية';
  /*
   * وما تشمله التجربةُ يُقال تحت زرّها: الأساسيّةُ أربعةَ عشر يومًا بلا نقطة البيع ولا
   * إضافة (abaad.Saas `TrialOffer`) — مفتوحًا كان الإطلاقُ أو مطفأً. فلا يسجّل زائرٌ
   * ينتظر صندوقًا لا تفتحه التجربة.
   */
  PRICING.ar.trialNote = 'تجربة 14 يومًا على الباقة الأساسية، دون نقطة البيع POS والإضافات.';
  PRICING.ar.subscribeCta = 'اشترك عبر واتساب';
  PRICING.ar.addWaCta = 'استفسر عن التفعيل عبر واتساب';
  PRICING.ar.cycleLabel = { m: 'شهري', h: 'نصف سنوي', y: 'سنوي' };
  PRICING.ar.planKeys = ['basic', 'professional', 'enterprise'];
  PRICING.ar.subscribeMsg = {
    hello: 'السلام عليكم فريق أبعاد،', want: 'أرغب بالاشتراك في إحدى باقات نظام أبعاد.', plan: 'الباقة: ', cycle: 'المدة: ',
    ask: 'أريد معرفة طريقة الاشتراك والدفع والتفعيل.', thanks: 'شكرًا لكم.',
    add: 'أرغب بالاستفسار عن تفعيل إضافات اختيارية لباقتي.', addList: 'الإضافات:', addAsk: 'أرجو تزويدي بالأسعار والتفاصيل وطريقة التفعيل.',
    custom: 'أرغب بالاستفسار عن الباقة المخصصة لنشاطي.', customAsk: 'أرجو التواصل معي لمعرفة التفاصيل والسعر.',
    more: 'أرغب بالاستفسار عن سعر خاص لأكثر من 10 فروع.'
  };
  PRICING.en.trialCta = 'Start your free trial';
  PRICING.en.trialNote = 'A 14-day trial of the Basic plan, without the POS or add-ons.';
  PRICING.en.subscribeCta = 'Subscribe on WhatsApp';
  PRICING.en.addWaCta = 'Ask to activate on WhatsApp';
  PRICING.en.cycleLabel = { m: 'Monthly', h: 'Semi-annual', y: 'Yearly' };
  PRICING.en.planKeys = ['basic', 'professional', 'enterprise'];
  PRICING.en.subscribeMsg = {
    hello: 'Hello Abaad team,', want: "I'd like to subscribe to one of Abaad's plans.", plan: 'Plan: ', cycle: 'Billing: ',
    ask: "I'd like to know how to subscribe, pay and activate it.", thanks: 'Thank you.',
    add: "I'd like to ask about activating optional add-ons for my plan.", addList: 'Add-ons:', addAsk: 'Please send me the prices, details and how to activate them.',
    custom: "I'd like to ask about a custom plan for my business.", customAsk: 'Please contact me with the details and the price.',
    more: "I'd like to ask about a special price for more than 10 branches."
  };

  PRICING.ar.addonsTag = 'الإضافات';
  PRICING.ar.addonsTitle = 'طوّر نظامك حسب احتياجات مشروعك';
  PRICING.ar.addonsSub = 'مع أبعاد، تقدر تبدأ بالخدمات الأساسية وتضيف المزيد من المميزات مع نمو نشاطك، بكل مرونة.';
  PRICING.ar.addons = {
    heads: { basic: 'الإضافات المتاحة للباقة الأساسية', professional: 'الإضافات المتاحة للباقة الاحترافية', enterprise: 'الإضافات المتاحة لباقة المؤسسات' },
    // اسمُ الباقة في الرسالة — بالاسمين، فيعرفها فريقُ أبعاد أيًّا كانت لغةُ الزائر
    planLabel: { basic: 'الأساسية (Basic)', professional: 'الاحترافية (Professional)', enterprise: 'المؤسسات (Enterprise)' },
    tag: 'إضافة اختيارية', includedH: 'مشمولة في الباقة', pick: 'حدّد', ask: 'استفسر عبر واتساب',
    askSelected: 'استفسر عن الإضافات المحددة', copy: 'انسخ الرسالة',
    none: 'حدّد إضافة واحدة على الأقل، ثمّ استفسر عنها.',
    copied: 'نُسخت الرسالة — الصقها في واتساب وأرسلها إلى +968 71141624.',
    copyFail: 'تعذّر النسخ تلقائيًا — حدّد الرسالة أدناه وانسخها، ثمّ أرسلها في واتساب إلى +968 71141624.',
    items: {
      pos: { name: 'نظام الكاشير ونقاط البيع POS', desc: 'البيع من صندوق المحل وإصدار الإيصالات ومتابعة جلسات الكاشير.' },
      website: { name: 'المتجر الإلكتروني وإدارة الطلبات', desc: 'متجر إلكتروني باسمك يستقبل طلبات زبائنك وتديرها من لوحتك.' },
      marketing: { name: 'العروض والخصومات والكوبونات', desc: 'الكوبونات والعروض وتقييمات العملاء.' },
      loyalty: { name: 'برنامج الولاء والمكافآت', desc: 'نقاط يجمعها عملاؤك من مشترياتهم ويستبدلونها عند الصندوق.' },
      whatsapp: { name: 'إشعارات واتساب', desc: 'إرسال حالة الطلب إلى العميل عبر واتساب.' },
      extra_branch: { name: 'فرع إضافي', desc: 'فروع فوق حد الفروع في باقتك.',
        one: 'أرغب بالاستفسار عن إضافة فرع جديد.', askOne: 'أريد معرفة التكلفة والشروط وطريقة التفعيل.' },
      gift_orders: { name: 'إدارة الهدايا والطلبات المخصصة', desc: 'طلبات الإهداء ببيانات المستلم ومناسبته، والطلبات المخصصة بحقولها.' },
      whatsapp_own_number: { name: 'ربط واتساب برقم المتجر', desc: 'إرسال رسائل متجرك من رقم واتساب الخاص به بدل الرقم المشترك.',
        by: { enterprise: { name: 'ربط واتساب برقم الشركة', desc: 'إرسال رسائل شركتك من رقم واتساب الخاص بها بدل الرقم المشترك.' } } },
      api_integrations: { name: 'التكامل مع الأنظمة الخارجية API', desc: 'ربط أبعاد بأنظمتك الأخرى عبر واجهة API، يُدرس مع فريق أبعاد حسب احتياجك.' }
    },
    msg: {
      hello: 'السلام عليكم فريق أبعاد،', one: 'أرغب بالاستفسار عن إحدى إضافات نظام أبعاد.', many: 'أرغب بالاستفسار عن الإضافات التالية:',
      plan: 'الباقة: ', addon: 'الإضافة المطلوبة: ', addons: 'الإضافات المطلوبة:',
      askOne: 'أريد معرفة سعر الإضافة وطريقة الاشتراك والتفعيل.', askMany: 'أرجو تزويدي بالأسعار والتفاصيل وطريقة التفعيل.', thanks: 'شكرًا لكم.'
    }
  };
  PRICING.en.addonsTag = 'Add-ons';
  PRICING.en.addonsTitle = 'Grow your system with your business';
  PRICING.en.addonsSub = 'With Abaad, start with the essentials and add more features as your business grows — with full flexibility.';
  PRICING.en.addons = {
    heads: { basic: 'Add-ons for the Basic plan', professional: 'Add-ons for the Professional plan', enterprise: 'Add-ons for the Enterprise plan' },
    planLabel: { basic: 'Basic', professional: 'Professional', enterprise: 'Enterprise' },
    tag: 'Optional add-on', includedH: 'Included in the plan', pick: 'Select', ask: 'Ask on WhatsApp',
    askSelected: 'Ask about the selected add-ons', copy: 'Copy the message',
    none: 'Select at least one add-on, then ask about it.',
    copied: 'Message copied — paste it in WhatsApp and send it to +968 71141624.',
    copyFail: 'Could not copy automatically — select the message below and copy it, then send it on WhatsApp to +968 71141624.',
    items: {
      pos: { name: 'Cashier & point of sale (POS)', desc: 'Sell from the shop till, issue receipts and follow cashier sessions.' },
      website: { name: 'Online store & order management', desc: "An online store in your name that takes your customers' orders, managed from your dashboard." },
      marketing: { name: 'Offers, discounts & coupons', desc: 'Coupons, offers and customer reviews.' },
      loyalty: { name: 'Loyalty & rewards', desc: 'Points your customers earn on purchases and redeem at the till.' },
      whatsapp: { name: 'WhatsApp notifications', desc: 'Send order status to the customer on WhatsApp.' },
      extra_branch: { name: 'Extra branch', desc: "Branches beyond your plan's branch limit.",
        one: "I'd like to ask about adding a new branch.", askOne: "I'd like to know the cost, the terms and how to activate it." },
      gift_orders: { name: 'Gift & custom orders', desc: 'Gift orders with the recipient and occasion, and custom orders with their own fields.' },
      whatsapp_own_number: { name: 'WhatsApp on your own number', desc: "Send your store's messages from its own WhatsApp number instead of the shared one.",
        by: { enterprise: { name: "WhatsApp on your company's number", desc: "Send your company's messages from its own WhatsApp number instead of the shared one." } } },
      api_integrations: { name: 'External systems integration (API)', desc: 'Connect Abaad to your other systems through an API, scoped with the Abaad team to your needs.' }
    },
    msg: {
      hello: 'Hello Abaad team,', one: "I'd like to ask about one of Abaad's add-ons.", many: "I'd like to ask about the following add-ons:",
      plan: 'Plan: ', addon: 'Add-on: ', addons: 'Add-ons:',
      askOne: "I'd like to know the add-on's price and how to subscribe and activate it.", askMany: 'Please send me the prices, details and how to activate them.', thanks: 'Thank you.'
    }
  };
  /*
   * والبطاقتان تحت العرض الجديد (`ADDON_OFFER`): الأساسيّةُ بلا نقطة البيع، وإضافاتُها
   * الخمس تحتها؛ والاحترافيّةُ تذكر نقطةَ البيع أوّلَ ما تضيفه. وما يبقى خارج الأساسيّة
   * قدراتٌ من الباقة لا تُباع إضافة (`PlanFeatures`). والسعرُ هو هو — 9.900 و99.
   */
  PRICING.ar.offerPlans = [
    { inc: ['المبيعات والطلبات', 'إدارة المنتجات', 'إدارة المخزون', 'العملاء', 'الموردون والمشتريات', 'فواتير العملاء', 'المالية والمصروفات', 'الرواتب والموظفون', 'لوحة التجهيز', 'لوحة التحكم والملخصات', 'التقارير الأساسية'],
      addH: 'إضافات اختيارية', addCta: 'استفسر عنها عبر واتساب', addHref: '#addons',
      add: [{ t: 'نظام الكاشير ونقاط البيع POS' }, { t: 'المتجر الإلكتروني وإدارة الطلبات' }, { t: 'العروض والخصومات والكوبونات' }, { t: 'برنامج الولاء والمكافآت' }, { t: 'إشعارات واتساب' }],
      exc: ['التقارير المتقدمة', 'الصلاحيات المخصصة', 'التطبيقات التكاملية'] },
    { incPlus: [{ t: 'نظام الكاشير ونقاط البيع', d: 'البيع من صندوق المحل وإصدار الإيصالات ومتابعة جلسات الكاشير.' }] }
  ];
  PRICING.en.offerPlans = [
    { inc: ['Sales and orders', 'Product management', 'Inventory management', 'Customers', 'Suppliers and purchasing', 'Customer invoices', 'Finance and expenses', 'Payroll and employees', 'Preparation board', 'Dashboard and summaries', 'Basic reports'],
      addH: 'Optional add-ons', addCta: 'Ask about them on WhatsApp', addHref: '#addons',
      add: [{ t: 'Cashier & point of sale (POS)' }, { t: 'Online store & order management' }, { t: 'Offers, discounts & coupons' }, { t: 'Loyalty & rewards' }, { t: 'WhatsApp notifications' }],
      exc: ['Advanced reports', 'Custom permissions', 'Integrations'] },
    { incPlus: [{ t: 'Cashier & point of sale', d: 'Sell from the shop till, issue receipts and follow cashier sessions.' }] }
  ];

  var CAP_IMGS = [null, IMG + 'invoices.webp', IMG + 'store.webp', IMG + 'customer.webp'];
  var TYPE_IMGS = [IMG + 'solution-retail.webp', IMG + 'solution-ecommerce.webp', IMG + 'solution-services.webp', IMG + 'solution-subscriptions.webp'];
  var CAP_COUNT = 5, CAP_INTERVAL = 3500;
  var FLOW_COUNT = 3, FLOW_INTERVAL = 4000, FLOW_STEP_MS = 550;
  var TICK_MS = 1100;

  var S = { lang: 'ar', menuOpen: false, cap: 0, capVis: true, billing: 'm', flow: 0, flowVis: true, flowTick: 0, ind: null, tick: 0, sent: false, sending: false, picks: { basic: [], professional: [], enterprise: [] } };

  function pad(n) { return String(n).padStart(2, '0'); }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  function tr() { return T[S.lang]; }
  function data() { return DATA[S.lang]; }
  function pricing() { return PRICING[S.lang]; }
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
          '<div style="position:absolute;inset:0;overflow:hidden"><img src="' + IMG + 'pos.webp" alt="' + esc(t.altPos) + '" style="position:absolute;left:-12.42%;top:0;width:127.45%;max-width:none;height:auto;display:block"></div>' +
          '<img src="' + IMG + 'pos-checkout.webp" alt="' + esc(t.altCheckout) + '" style="position:absolute;left:71.39%;top:1.03%;width:27.93%;height:auto;display:block;border-radius:6.8% / 8.1%;box-shadow:0 2px 4px rgba(15,15,15,.05),0 14px 32px rgba(15,15,15,.12)">' +
          '<img src="' + IMG + 'pos-product.webp" alt="' + esc(t.altProduct) + '" style="position:absolute;left:2.36%;top:52.5%;width:23.73%;height:auto;display:block;border-radius:8.6% / 5.8%;box-shadow:0 2px 4px rgba(15,15,15,.05),0 14px 32px rgba(15,15,15,.12)">' +
          '</div>';
      } else if (i === 4) {
        html += '<div style="border-radius:18px;overflow:hidden;background:#f7f8f9;border:1px solid rgba(15,15,15,.06);box-shadow:0 1px 3px rgba(15,15,15,.04),0 16px 40px rgba(15,15,15,.07)">' +
          '<img src="' + IMG + 'costs.webp" alt="' + esc(t.altCosts) + '" width="1735" height="877" style="display:block;width:100%;height:auto;object-fit:contain"></div>';
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
      var pr = pricing(), yearly = S.billing === 'y', a = arrow();
      var check = function (stroke, f) {
        var body = typeof f === 'string' ? '<span>' + esc(f) + '</span>'
          : '<span><span style="display:block;font-weight:600">' + esc(f.t) + '</span><span style="display:block;margin-top:1px;font-size:13.5px;line-height:1.7;color:var(--muted)">' + esc(f.d) + '</span></span>';
        return '<li style="display:flex;align-items:flex-start;gap:10px;font-size:14.5px;line-height:1.6"><svg viewBox="0 0 16 16" width="16" height="16" style="flex:none;margin-top:3px" aria-hidden="true"><path d="M3.5 8.4l2.9 2.9 6.1-6.6" fill="none" stroke="' + stroke + '" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path></svg>' + body + '</li>';
      };
      return pr.plans.map(function (_, i) {
        var p = planFor(i), on = !!p.featured;
        var html = '<div data-plan="' + i + '" style="position:relative;background:var(--card);border:' + (on ? '1.5px solid var(--ink)' : '1px solid var(--line)') + ';border-radius:22px;padding:30px 26px 26px;display:flex;flex-direction:column;box-shadow:' + (on ? '0 2px 6px rgba(15,15,15,.04),0 18px 44px rgba(15,15,15,.08)' : 'none') + '">' +
          (on ? '<span style="position:absolute;top:26px;inset-inline-end:24px;background:var(--peach);color:var(--peach-ink);border-radius:999px;padding:5px 12px;font-size:12.5px;font-weight:700">' + esc(pr.popular) + '</span>' : '') +
          '<h3 style="margin:0;font-size:22px;font-weight:700">' + esc(p.name) + '</h3>' +
          '<p style="margin:6px 0 0;font-size:14.5px;font-weight:700;color:var(--peach-ink)">' + esc(p.tag) + '</p>' +
          '<p style="margin:10px 0 0;font-size:15px;line-height:1.8;color:var(--ink2);text-wrap:pretty;min-height:54px">' + esc(p.desc) + '</p>' +
          '<div style="display:flex;align-items:baseline;gap:8px;margin-top:20px;white-space:nowrap">' +
          '<span data-price style="font-size:clamp(38px,4vw,46px);font-weight:700;letter-spacing:-.02em;line-height:1" dir="ltr">' + billPrice(p) + '</span>' +
          '<span data-period style="font-size:15px;font-weight:600;color:var(--ink2)">' + esc(pr.cur) + ' / ' + esc(billPeriod(pr)) + '</span></div>' +
          '<div data-was style="min-height:22px;margin-top:8px;font-size:13.5px;color:var(--muted)">' + (yearly ? wasLine(p) : '') + '</div>' +
          '<div style="margin-top:18px;background:var(--bg2);border-radius:14px;padding:14px 16px">' +
          '<div style="font-size:12.5px;font-weight:700;color:var(--muted)">' + esc(pr.limitsH) + '</div>' +
          '<ul data-limits style="list-style:none;margin:8px 0 0;padding:0;display:flex;flex-direction:column;gap:6px">' +
          p.limits.map(function (lm) { return '<li style="font-size:15px;font-weight:600">' + esc(lm) + '</li>'; }).join('') + '</ul></div>' +
          (p.more ? '<a data-more href="' + esc(waLink(moreText(i))) + '" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:6px;margin-top:10px;font-size:13.5px;font-weight:700;color:var(--ink)">' + esc(p.more) + '<span aria-hidden="true">' + a + '</span></a>' : '') +
          '<div style="margin-top:20px;font-size:13.5px;font-weight:700;color:var(--ink)">' + esc(p.incH) + '</div>' +
          '<ul data-inc style="list-style:none;margin:10px 0 0;padding:0;display:flex;flex-direction:column;gap:9px">' +
          p.inc.map(function (f) { return check('var(--ink)', f); }).join('') + '</ul>';
        if (p.wa && p.wa.length) {
          html += '<div style="margin-top:18px;font-size:13.5px;font-weight:700;color:var(--ink)">' + esc(pr.waH) + '</div>' +
            '<ul style="list-style:none;margin:10px 0 0;padding:0;display:flex;flex-direction:column;gap:9px">' +
            p.wa.map(function (f) { return check('var(--wa)', f); }).join('') + '</ul>';
        }
        if (p.add && p.add.length) {
          html += '<div style="margin-top:18px;border:1px dashed #c9c9cb;border-radius:14px;padding:14px 16px">' +
            '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><span style="font-size:13px;font-weight:700;color:var(--ink)">' + esc(p.addH || pr.addH) + '</span><span style="background:var(--bg2);border-radius:999px;padding:2px 9px;font-size:11.5px;font-weight:700;color:var(--muted)">' + esc(pr.addTag) + '</span></div>' +
            '<ul style="list-style:none;margin:10px 0 0;padding:0;display:flex;flex-direction:column;gap:10px">' +
            p.add.map(function (ad) {
              return '<li style="display:flex;align-items:flex-start;gap:10px"><span aria-hidden="true" style="flex:none;font-size:14px;line-height:1.5;font-weight:700;color:var(--muted)">+</span><div><div style="font-size:14.5px;font-weight:600;line-height:1.5">' + esc(ad.t) + '</div>' +
                (ad.d ? '<div style="margin-top:2px;font-size:13.5px;line-height:1.7;color:var(--muted)">' + esc(ad.d) + '</div>' : '') + '</div></li>';
            }).join('') + '</ul>' +
            (p.addHref
              ? '<a href="' + p.addHref + '" style="display:inline-flex;align-items:center;gap:6px;margin-top:12px;font-size:13.5px;font-weight:700;color:var(--ink)">' + esc(p.addCta) + '<span aria-hidden="true">' + a + '</span></a></div>'
              : '<a data-add-cta href="' + esc(waLink(addText(i, p.add))) + '" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:6px;margin-top:12px;font-size:13.5px;font-weight:700;color:var(--wa)">' + WA_ICON + esc(pr.addWaCta) + '</a></div>');
        }
        if (p.exc && p.exc.length) {
          html += '<div style="margin-top:18px;padding-top:16px;border-top:1px dashed var(--line)">' +
            '<div style="font-size:13px;font-weight:700;color:var(--muted)">' + esc(pr.excH) + '</div>' +
            '<ul data-exc style="list-style:none;margin:8px 0 0;padding:0;display:flex;flex-direction:column;gap:6px">' +
            p.exc.map(function (f) { return '<li style="display:flex;align-items:center;gap:10px;font-size:14px;color:var(--muted)"><span style="width:9px;height:1.5px;background:#c9c9cb;flex:none"></span>' + esc(f) + '</li>'; }).join('') + '</ul></div>';
        }
        // الأساسيّةُ تجربةٌ بالتسجيل الذاتيّ؛ والمدفوعةُ عبر فريق أبعاد بواتساب — بالباقة ومدّتها
        var paid = i > 0;
        html += '<div style="flex:1"></div>' +
          '<a data-plan-cta href="' + esc(paid ? waLink(subscribeText(i)) : LINKS.register) + '"' + (paid ? ' target="_blank" rel="noopener"' : '') + ' style="margin-top:26px;text-align:center;border-radius:999px;padding:15px 24px;font-size:15.5px;font-weight:700;background:' + (on ? 'var(--ink)' : 'transparent') + ';color:' + (on ? '#fff' : 'var(--ink)') + ';border:1px solid var(--ink)">' + esc(paid ? pr.subscribeCta : pr.trialCta) + '</a>' +
          (paid ? '' : '<p data-trial-note style="margin:10px 0 0;text-align:center;font-size:12.5px;line-height:1.6;color:var(--muted)">' + esc(pr.trialNote) + '</p>') + '</div>';
        return html;
      }).join('') + custom(pr.custom);
      // صفٌّ كاملٌ تحت الثلاث، وليست `data-plan`: لا سعرَ يبدّله الشهريُّ والسنويّ، وزرُّها إلى «تواصل معنا» لا إلى التسجيل
      function custom(c) {
        return '<div data-custom-plan data-g="custom-plan" style="grid-column:1/-1;background:var(--card);border:1px solid var(--line);border-radius:22px;padding:30px 26px 26px;display:grid;grid-template-columns:minmax(0,1fr);gap:22px 40px">' +
          '<div><h3 style="margin:0;font-size:22px;font-weight:700">' + esc(c.name) + '</h3>' +
          '<p style="margin:6px 0 0;font-size:14.5px;font-weight:700;color:var(--peach-ink)">' + esc(c.tag) + '</p>' +
          '<p style="margin:10px 0 0;font-size:15px;line-height:1.8;color:var(--ink2);text-wrap:pretty">' + esc(c.desc) + '</p></div>' +
          '<div><div style="font-size:13.5px;font-weight:700;color:var(--ink)">' + esc(c.incH) + '</div>' +
          '<ul data-inc style="list-style:none;margin:10px 0 0;padding:0;display:flex;flex-direction:column;gap:9px">' +
          c.inc.map(function (f) { return check('var(--ink)', f); }).join('') + '</ul></div>' +
          '<a data-custom-cta href="' + esc(waLink(customText())) + '" target="_blank" rel="noopener" style="align-self:center;text-align:center;white-space:nowrap;border-radius:999px;padding:15px 32px;font-size:15.5px;font-weight:700;background:var(--ink);color:#fff;border:1px solid var(--ink)">' + esc(c.cta) + '</a></div>';
      }
    },
    /*
     * إضافاتُ كلّ باقة — بلا سعر، ولكلٍّ رابطُ واتساب برسالتها، وتحديدُ عدّةٍ برسالةٍ واحدة.
     * ورابطُ البطاقة مرسومٌ في الصفحة: يعمل بلا JavaScript. والتحديدُ وزرّاه يعملان به.
     */
    addons: function () {
      if (!ADDON_OFFER) return '';
      var A = pricing().addons;
      var icon = function (c) {
        return '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ADDON_ICONS[c] + '</svg>';
      };
      return ADDON_PLANS.map(function (plan) {
        var head = 'addons-' + plan.key;
        var cards = plan.eligible.map(function (c) {
          var it = addonText(A, c, plan.key), id = 'addon-' + plan.key + '-' + c;
          return '<li data-addon="' + c + '" style="position:relative;background:var(--card);border:1px solid var(--line);border-radius:18px;padding:18px 18px 16px;display:flex;flex-direction:column;gap:10px;transition:border-color .2s,box-shadow .2s">' +
            '<div style="display:flex;align-items:flex-start;gap:12px">' +
            '<span style="flex:none;width:40px;height:40px;border-radius:12px;background:var(--peach);color:var(--peach-ink);display:flex;align-items:center;justify-content:center">' + icon(c) + '</span>' +
            '<div style="min-width:0;flex:1"><h4 id="' + id + '" style="margin:0;font-size:16px;font-weight:700;line-height:1.5">' + esc(it.name) + '</h4>' +
            '<span style="display:inline-block;margin-top:4px;background:var(--bg2);border-radius:999px;padding:2px 9px;font-size:11.5px;font-weight:700;color:var(--muted)">' + esc(A.tag) + '</span></div>' +
            '<label style="flex:none;display:flex;align-items:center;justify-content:center;width:40px;height:40px;margin:-8px;cursor:pointer">' +
            '<input type="checkbox" data-pick="' + plan.key + ':' + c + '" aria-label="' + esc(A.pick + ' ' + it.name) + '" style="width:20px;height:20px;margin:0;accent-color:var(--ink);cursor:pointer"></label></div>' +
            '<p style="margin:0;font-size:14px;line-height:1.75;color:var(--ink2);text-wrap:pretty">' + esc(it.desc) + '</p>' +
            '<div style="flex:1"></div>' +
            '<a data-ask href="' + esc(waLink(enquiry(plan.key, [c]))) + '" target="_blank" rel="noopener" style="align-self:flex-start;display:inline-flex;align-items:center;gap:7px;font-size:14px;font-weight:700;color:var(--wa)">' +
            WA_ICON + esc(A.ask) + '</a></li>';
        }).join('');
        var included = plan.included.length
          ? '<div data-included style="margin-top:14px;display:flex;flex-wrap:wrap;align-items:center;gap:8px"><span style="font-size:13px;font-weight:700;color:var(--muted)">' + esc(A.includedH) + ':</span>' +
            plan.included.map(function (c) {
              return '<span style="display:inline-flex;align-items:center;gap:5px;background:var(--bg2);border-radius:999px;padding:4px 11px;font-size:13px;font-weight:600;color:var(--ink2)"><svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><path d="M3.5 8.4l2.9 2.9 6.1-6.6" fill="none" stroke="var(--ink)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>' + esc(addonText(A, c, plan.key).name) + '</span>';
            }).join('') + '</div>'
          : '';
        return '<div data-addon-plan="' + plan.key + '" role="group" aria-labelledby="' + head + '" style="background:var(--bg2);border-radius:24px;padding:clamp(18px,3vw,28px)">' +
          '<h3 id="' + head + '" style="margin:0;font-size:clamp(19px,2.2vw,22px);font-weight:700;line-height:1.5">' + esc(A.heads[plan.key]) + '</h3>' + included +
          '<ul style="list-style:none;margin:16px 0 0;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,180px),1fr));gap:12px">' + cards + '</ul>' +
          // التحديدُ وزرّاه — يُظهرها التشغيل؛ بلا JavaScript لا عملَ لها، ورابطُ كلّ بطاقةٍ يكفي
          '<div data-addon-bar hidden style="margin-top:16px;display:flex;flex-wrap:wrap;align-items:center;gap:10px 14px">' +
          '<a data-ask-selected="' + plan.key + '" role="button" aria-disabled="true" tabindex="0" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:8px;border-radius:999px;padding:12px 20px;font-size:14.5px;font-weight:700;background:var(--wa);color:#fff;opacity:.45;cursor:not-allowed">' +
          WA_ICON + '<span>' + esc(A.askSelected) + '</span><span data-count dir="ltr">(0)</span></a>' +
          '<button type="button" data-copy="' + plan.key + '" disabled style="border:1px solid var(--line);background:var(--card);border-radius:999px;padding:11px 18px;font-size:14px;font-weight:700;color:var(--ink);cursor:pointer">' + esc(A.copy) + '</button>' +
          '<p data-addon-status role="status" aria-live="polite" style="margin:0;flex-basis:100%;font-size:13.5px;line-height:1.7;color:var(--muted)"></p>' +
          '<textarea data-addon-text readonly hidden rows="8" style="flex-basis:100%;width:100%;border:1px solid var(--line);border-radius:12px;padding:10px 12px;font-size:16px;line-height:1.7;background:var(--card);color:var(--ink)"></textarea></div></div>';
      }).join('');
    },
    // بطاقاتُ ما يُضاف تحت الأسعار — زرُّها إلى «تواصل معنا»، لا إلى التسجيل
    extras: function () {
      var pr = pricing(), a = arrow();
      return pr.extras.map(function (x, i) {
        return '<div data-extra="' + i + '" style="background:var(--card);border:1px solid var(--line);border-radius:22px;padding:26px 26px 22px;display:flex;flex-direction:column">' +
          '<span style="align-self:flex-start;background:var(--bg2);color:var(--ink2);border-radius:8px;padding:5px 11px;font-size:13px;font-weight:700">' + esc(x.tag) + '</span>' +
          '<h3 style="margin:18px 0 0;font-size:20px;font-weight:700;line-height:1.5">' + esc(x.name) + '</h3>' +
          '<p style="margin:6px 0 0;font-size:15px;line-height:1.8;color:var(--ink2);text-wrap:pretty">' + esc(x.desc) + '</p>' +
          '<div style="flex:1"></div>' +
          '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:20px;padding-top:18px;border-top:1px solid var(--line)">' +
          (x.price
            ? '<span data-extra-price style="font-size:18px;font-weight:700;white-space:nowrap">' + esc(x.price) + ' ' + esc(pr.cur) + '</span>'
            : '<span data-extra-price style="font-size:18px;font-weight:700">' + esc(pr.onRequest) + '</span>') +
          '<a href="#contact" style="display:inline-flex;align-items:center;gap:6px;font-size:14.5px;font-weight:700;color:var(--ink)">' + esc(x.cta) + '<span aria-hidden="true">' + a + '</span></a></div></div>';
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
        d.types.map(function (x) { return x.title; }).concat([t.other]).map(function (o, i) {
          return '<option value="' + TYPE_KEYS[i] + '">' + esc(o) + '</option>';
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
  /* ═══════════ الاشتراكُ المدفوع ورسالتُه ═══════════ */

  /** رسالةُ الاشتراك في باقةٍ مدفوعة — باسمها ومدّتِها المختارة في الأسعار */
  function subscribeText(i) {
    var pr = pricing(), m = pr.subscribeMsg;
    return [m.hello, '', m.want, '', m.plan + pr.addons.planLabel[pr.planKeys[i]], '', m.cycle + pr.cycleLabel[S.billing], '', m.ask, '', m.thanks].join('\n');
  }
  /** رسالةُ تفعيل الإضافات الاختياريّة المذكورة في بطاقة الباقة */
  function addText(i, items) {
    var pr = pricing(), m = pr.subscribeMsg;
    return [m.hello, '', m.add, '', m.plan + pr.addons.planLabel[pr.planKeys[i]], '', m.addList]
      .concat(items.map(function (ad) { return '- ' + ad.t + '.'; }), ['', m.addAsk, '', m.thanks]).join('\n');
  }
  /** «أكثر من عشرة فروع؟» — سعرٌ خاصّ يُسأل عنه الفريق */
  function moreText(i) {
    var pr = pricing(), m = pr.subscribeMsg;
    return [m.hello, '', m.more, '', m.plan + pr.addons.planLabel[pr.planKeys[i]], '', m.customAsk, '', m.thanks].join('\n');
  }
  function customText() {
    var m = pricing().subscribeMsg;
    return [m.hello, '', m.custom, '', m.customAsk, '', m.thanks].join('\n');
  }

  /* ═══════════ الإضافات ورسالةُ واتساب ═══════════ */

  /** بطاقةُ الباقة كما تُعرض — وتحت العرض الجديد بما يتغيّر فيها (`offerPlans`) */
  function planFor(i) {
    var pr = pricing(), p = pr.plans[i], o = ADDON_OFFER && pr.offerPlans[i];
    if (!o) return p;
    var q = Object.assign({}, p, o);
    if (o.incPlus) q.inc = o.incPlus.concat(p.inc);
    delete q.incPlus;
    return q;
  }
  /** اسمُ الإضافة ووصفُها في باقتها — «رقم الشركة» في المؤسسات */
  function addonText(A, code, planKey) {
    var it = A.items[code], by = it.by && it.by[planKey];
    return by ? Object.assign({}, it, by) : it;
  }
  function addonPlan(key) { return ADDON_PLANS.filter(function (p) { return p.key === key; })[0]; }
  /**
   * رسالةُ الاستفسار بلغة الصفحة — باسم الباقة والإضافات المحدّدة.
   *
   * وما ليس من إضافات الباقة لا يدخلها (مشمولٌ فيها أو لا يُباع لها)، والمكرّرُ مرّة،
   * والترتيبُ ترتيبُ الكتالوج. ولا تحديد = لا رسالة (`null`) — لا يُفتح واتساب بفراغ.
   */
  function enquiry(planKey, codes, lang) {
    var A = PRICING[lang || S.lang].addons, m = A.msg, plan = addonPlan(planKey);
    if (!plan) return null;
    var picked = plan.eligible.filter(function (c) { return codes.indexOf(c) !== -1; });
    if (!picked.length) return null;
    var name = function (c) { return addonText(A, c, planKey).name; };
    var lines;
    if (picked.length === 1) {
      var it = A.items[picked[0]];
      lines = [m.hello, '', it.one || m.one, '', m.plan + A.planLabel[planKey], '', m.addon + name(picked[0]) + '.', '', it.askOne || m.askOne, '', m.thanks];
    } else {
      lines = [m.hello, '', m.many, '', m.plan + A.planLabel[planKey], '', m.addons]
        .concat(picked.map(function (c) { return '- ' + name(c) + '.'; }), ['', m.askMany, '', m.thanks]);
    }
    return lines.join('\n');
  }
  /** wa.me برسالةٍ مرمَّزة — يفتح واتساب الهاتف أو WhatsApp Web، ولا يُرسل شيئًا */
  function waLink(text) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(text); }
  var WA_ICON = '<svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" style="flex:none"><path fill="currentColor" d="M12 2.5a9.5 9.5 0 0 0-8.2 14.3L2.5 21.5l4.8-1.3A9.5 9.5 0 1 0 12 2.5zm0 17.3c-1.5 0-2.9-.4-4.1-1.1l-.3-.2-2.8.8.8-2.7-.2-.3A7.8 7.8 0 1 1 12 19.8zm4.3-5.8c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.4.1-.5l.4-.4.2-.4v-.4l-.7-1.7c-.2-.5-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.4c.1.2 1.6 2.5 3.9 3.5 1.4.6 1.9.6 2.6.5.4-.1 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1l-.4-.2z"></path></svg>';

  /*
   * السعرُ ومدّتُه بحسب الزرّ: شهريّ (`m`)، أو نصف سنويّ (`h`)، أو سنويّ (`y`).
   *
   * ونصفُ السنة ستّةُ أشهرٍ بسعرها بلا خصم، فلا «بدل» ولا «وفّر» معه — هما
   * للسنويّ وحده، وهو الذي يوفّر قيمة شهرين.
   */
  function billPrice(p) { return S.billing === 'y' ? p.y : S.billing === 'h' ? p.h : p.m; }
  function billPeriod(pr) { return S.billing === 'y' ? pr.perYear : S.billing === 'h' ? pr.perHalf : pr.perMonth; }
  function wasLine(p) {
    var pr = pricing();
    return '<span>' + esc(pr.instead) + ' </span><s dir="ltr" style="unicode-bidi:isolate">' + p.was + '</s><span> ' + esc(pr.cur) + '</span>';
  }

  var WA_BUBBLE = '<div dir="rtl" lang="ar" style="position:absolute;z-index:2;left:calc(3% + 10px);bottom:calc(7% + 12px);transform:scale(1.09);transform-origin:left bottom;width:165px;min-height:76px;box-sizing:border-box;background:#fff;border:1px solid rgba(15,15,15,.08);border-radius:14px;box-shadow:0 2px 4px rgba(15,15,15,.04),0 12px 28px rgba(15,15,15,.10);padding:11px 12px;display:flex;gap:9px;align-items:flex-start;text-align:start">' +
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
    $$('[data-pr]', root).forEach(function (el) { el.textContent = pricing()[el.getAttribute('data-pr')]; });
    $$('[data-list]', root).forEach(function (el) {
      var draw = R[el.getAttribute('data-list')];
      if (draw) el.innerHTML = draw(t, d);
    });
    // قسمُ الإضافات لا يظهر قبل العرض الجديد — ولا رابطَ إليه
    $$('[data-addons-section]', root).forEach(function (el) { el.hidden = !ADDON_OFFER; });
    var panel = $('[data-cap-panel]', root);
    if (panel) panel.setAttribute('data-g', capGrid());
    $$('[data-arrow]', root).forEach(function (el) { el.textContent = arrow(); });
    $$('[data-mail]', root).forEach(function (el) { el.textContent = MAIL; el.setAttribute('href', 'mailto:' + MAIL); });
    var other = S.lang === 'ar' ? 'en' : 'ar';
    $$('[data-lang-link]', root).forEach(function (a) {
      a.setAttribute('href', PAGES[other]); a.setAttribute('hreflang', other); a.setAttribute('lang', other);
    });
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
    var yearly = S.billing === 'y', pr = pricing();
    $$('[data-billing]').forEach(function (b) {
      var on = b.getAttribute('data-billing') === S.billing, k = billingLook(on);
      b.style.background = k.bg; b.style.color = k.fg; b.style.boxShadow = k.sh;
      b.setAttribute('aria-selected', String(on));
    });
    $('[data-save]').style.opacity = yearly ? '1' : '0';
    $$('[data-plan]').forEach(function (card) {
      var p = pr.plans[Number(card.getAttribute('data-plan'))];
      $('[data-price]', card).textContent = billPrice(p);
      $('[data-period]', card).textContent = pr.cur + ' / ' + billPeriod(pr);
      $('[data-was]', card).innerHTML = yearly ? wasLine(p) : '';
      // والرسالةُ تقول المدّةَ المختارة الآن — شهريًّا أو نصف سنويًّا أو سنويًّا
      var i = Number(card.getAttribute('data-plan')), cta = $('[data-plan-cta]', card);
      if (cta && i > 0) cta.setAttribute('href', waLink(subscribeText(i)));
    });
  }

  /* ═══════════ تحديدُ الإضافات: رسالةٌ واحدةٌ لكلّ باقة ═══════════ */

  function addonBox(planKey) { return $('[data-addon-plan="' + planKey + '"]'); }
  function say(box, text) { $('[data-addon-status]', box).textContent = text || ''; }
  function applyPicks(planKey) {
    var box = addonBox(planKey);
    if (!box) return;
    var picks = S.picks[planKey], text = enquiry(planKey, picks);
    $$('[data-addon]', box).forEach(function (card) {
      var on = picks.indexOf(card.getAttribute('data-addon')) !== -1;
      card.style.borderColor = on ? 'var(--ink)' : 'var(--line)';
      card.style.boxShadow = on ? '0 1px 3px rgba(15,15,15,.06),0 10px 24px rgba(15,15,15,.06)' : 'none';
    });
    var ask = $('[data-ask-selected]', box), copy = $('[data-copy]', box);
    $('[data-count]', ask).textContent = '(' + picks.length + ')';
    // بلا تحديد لا رابط: لا تُفتح محادثةٌ برسالةٍ لا تقول شيئًا
    if (text) ask.setAttribute('href', waLink(text)); else ask.removeAttribute('href');
    ask.setAttribute('aria-disabled', String(!text));
    ask.style.opacity = text ? '1' : '.45';
    ask.style.cursor = text ? 'pointer' : 'not-allowed';
    copy.disabled = !text;
    var shown = $('[data-addon-text]', box);
    if (!shown.hidden) shown.value = text || '';
    if (!text) shown.hidden = true;
    if (text) say(box, '');
  }
  function pick(input) {
    var parts = input.getAttribute('data-pick').split(':'), list = S.picks[parts[0]];
    var at = list.indexOf(parts[1]);
    if (input.checked && at === -1) list.push(parts[1]);
    if (!input.checked && at !== -1) list.splice(at, 1);
    applyPicks(parts[0]);
  }
  /** ينسخ الرسالة — وإن تعذّر النسخُ تظهر مكتوبةً ليُنسخ باليد، فلا يقف الزائرُ بلا طريق */
  function copyEnquiry(planKey) {
    var box = addonBox(planKey), text = enquiry(planKey, S.picks[planKey]), A = pricing().addons;
    if (!text) { say(box, A.none); return; }
    var shown = $('[data-addon-text]', box);
    var failed = function () {
      shown.value = text; shown.hidden = false; shown.focus(); shown.select();
      say(box, A.copyFail);
    };
    var done = function () { shown.hidden = true; say(box, A.copied); };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, failed);
        return;
      }
    } catch (e) { /* يُكمل إلى النسخ اليدويّ */ }
    failed();
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

  /* ═══════════ القائمة ═══════════ */

  function setMenu(open) {
    S.menuOpen = open;
    $('[data-menu]').hidden = !open;
    $('[data-action="menu"]').setAttribute('aria-expanded', String(open));
  }

  /* ═══════════ نموذج التواصل: يُحفظ في CRM أبعاد ═══════════ */

  var FIELDS = ['name', 'company', 'phone', 'email', 'type', 'message'];
  // اسمُ الحقل عند الخادم — والخادمُ يقبل هذه وحدها، ويفرض المصدرَ والمرحلةَ بنفسه
  var API = { name: 'name', company: 'business_name', phone: 'phone', email: 'email', type: 'activity_type', message: 'message' };
  var SEND_TIMEOUT_MS = 20000;

  function clearErrors() {
    $$('[data-err]').forEach(function (e) { e.hidden = true; e.textContent = ''; });
    setStatus('');
  }
  function showErrors(errors) {
    var t = tr();
    var msg = { name: t.errName, company: t.errCompany, phone: t.errPhone, email: t.errEmail, type: t.errType, message: t.errMessage };
    FIELDS.forEach(function (n) {
      if (!errors[n]) return;
      var el = $('[data-err="' + n + '"]'); el.textContent = msg[n]; el.hidden = false;
    });
  }
  function setStatus(text) {
    var el = $('[data-form-status]');
    if (!el) return;
    el.textContent = text; el.hidden = !text;
  }
  function setSending(on) {
    S.sending = on;
    var b = $('[data-contact-form] [type="submit"]');
    b.disabled = on;
    b.setAttribute('aria-busy', String(on));
    b.textContent = on ? tr().sending : tr().submit;
  }

  function submit(e) {
    e.preventDefault();
    if (S.sending) return; // ضغطةٌ ثانيةٌ أثناء الإرسال لا تُرسل طلبًا ثانيًا
    var f = e.target, t = tr();
    var v = function (n) { return f.elements[n] ? String(f.elements[n].value || '').trim() : ''; };
    var errors = {};
    if (v('name').length < 2) errors.name = true;
    if (v('company').length < 2) errors.company = true;
    if (v('phone').replace(/[^\d]/g, '').length < 8) errors.phone = true;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v('email'))) errors.email = true;
    if (TYPE_KEYS.indexOf(v('type')) < 0) errors.type = true;
    if (v('message').length < 5) errors.message = true;
    clearErrors();
    if (FIELDS.some(function (n) { return errors[n]; })) { showErrors(errors); return; }

    var body = new URLSearchParams();
    FIELDS.forEach(function (n) { body.append(API[n], v(n)); });
    body.append('locale', S.lang);
    body.append('contact_hp', f.elements.contact_hp ? f.elements.contact_hp.value : '');

    setSending(true);
    var ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, SEND_TIMEOUT_MS) : null;
    // طلبٌ «بسيط» عابرٌ للأصل: نموذجٌ مُرمَّز وAccept — فلا preflight ولا كعكات
    fetch(CONTACT_URL, {
      method: 'POST', body: body, mode: 'cors', credentials: 'omit',
      headers: { Accept: 'application/json' }, signal: ctrl ? ctrl.signal : undefined
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) { return { status: res.status, data: data || {} }; });
    }).then(function (r) {
      clearTimeout(timer); setSending(false);
      if (r.status === 200 && r.data.ok === true) { f.reset(); setSent(true); return; }
      if (r.status === 422 && r.data.errors) {
        var back = { business_name: 'company', activity_type: 'type' }, shown = {};
        Object.keys(r.data.errors).forEach(function (k) { shown[back[k] || k] = true; });
        if (FIELDS.some(function (n) { return shown[n]; })) { showErrors(shown); return; }
      }
      // ما لم يُحفظ لا يُمسح: البياناتُ باقيةٌ في الخانات لمحاولةٍ أخرى
      setStatus(r.status === 429 ? t.errBusy : t.errSend);
    }, function () {
      clearTimeout(timer); setSending(false);
      setStatus(t.errSend);
    });
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
    S.lang = $('[data-site]').getAttribute('lang') === 'en' ? 'en' : 'ar';
    var year = $('[data-year]'); if (year) year.textContent = String(new Date().getFullYear());
    renderAll(document);
    applyBilling();
    $$('[data-addon-bar]').forEach(function (bar) { bar.hidden = false; });
    ADDON_PLANS.forEach(function (p) { applyPicks(p.key); });
    document.addEventListener('change', function (e) {
      if (e.target.matches && e.target.matches('[data-pick]')) pick(e.target);
    });
    // «استفسر عن المحدّدة» بلا تحديد ليس رابطًا — فـEnter والمسافة يقولان ما يُنتظر
    document.addEventListener('keydown', function (e) {
      var el = e.target.closest && e.target.closest('[data-ask-selected]');
      if (el && !el.hasAttribute('href') && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault(); say(addonBox(el.getAttribute('data-ask-selected')), pricing().addons.none);
      }
    });

    document.addEventListener('click', function (e) {
      var el = e.target.closest('[data-action],[data-cap],[data-flow],[data-billing],[data-close-menu],[data-ask-selected],[data-copy]');
      if (!el) return;
      if (el.hasAttribute('data-ask-selected')) {
        // بلا تحديد: لا رابط، ويُقال ما يُنتظر — ومع تحديدٍ يفتح الرابطُ واتساب كما هو
        if (!el.hasAttribute('href')) { e.preventDefault(); say(addonBox(el.getAttribute('data-ask-selected')), pricing().addons.none); }
        return;
      }
      if (el.hasAttribute('data-copy')) { copyEnquiry(el.getAttribute('data-copy')); return; }
      if (el.hasAttribute('data-cap')) { showCap(Number(el.getAttribute('data-cap'))); startCapCycle(); return; }
      if (el.hasAttribute('data-flow')) { showFlow(Number(el.getAttribute('data-flow'))); startFlowCycle(); return; }
      if (el.hasAttribute('data-billing')) { S.billing = el.getAttribute('data-billing'); applyBilling(); return; }
      if (el.hasAttribute('data-close-menu')) { setMenu(false); return; }
      var action = el.getAttribute('data-action');
      if (action === 'menu') setMenu(!S.menuOpen);
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
    // يرسم الصفحة بلغتها (index.html وen/index.html) — لا يشغّل شيئًا
    window.__ABAAD_PRERENDER__.render = function (root, lang) { S.lang = lang; renderAll(root); };
    return;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
