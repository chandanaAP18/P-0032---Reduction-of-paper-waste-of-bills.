const PAPER_GRAMS_PER_BILL = 5;
const WATER_LITERS_PER_KG_PAPER = 10;
const CO2_KG_PER_PAPER_KG = 1.3;

export const PAYMENT_STATUS_OPTIONS = ['pending', 'paid', 'overdue'];
export const DELIVERY_OPTIONS = ['email', 'sms', 'whatsapp', 'qr-link'];
export const RECURRING_OPTIONS = ['none', 'weekly', 'monthly', 'quarterly'];
export const LANGUAGE_OPTIONS = ['English', 'Hindi', 'Tamil', 'Telugu'];

export const RECEIPT_TRANSLATIONS = {
  English: {
    digitalReceipt: 'Digital Receipt',
    customerName: 'Customer Name',
    customerEmail: 'Customer Email',
    customerAddress: 'Customer Address',
    productService: 'Product / Service',
    billDate: 'Bill Date',
    dueDate: 'Due Date',
    notes: 'Notes',
    subtotal: 'Subtotal',
    gst: 'GST',
    totalAmount: 'Total Amount',
    scan: 'Scan to access this receipt',
    paperless: 'This receipt was delivered digitally to reduce paper waste',
    notProvided: 'Not provided',
    noDueDate: 'No due date',
  },
  Hindi: {
    digitalReceipt: 'डिजिटल रसीद',
    customerName: 'ग्राहक का नाम',
    customerEmail: 'ग्राहक ईमेल',
    customerAddress: 'ग्राहक पता',
    productService: 'उत्पाद / सेवा',
    billDate: 'बिल तिथि',
    dueDate: 'देय तिथि',
    notes: 'टिप्पणी',
    subtotal: 'उप-योग',
    gst: 'जीएसटी',
    totalAmount: 'कुल राशि',
    scan: 'इस रसीद को देखने के लिए स्कैन करें',
    paperless: 'यह रसीद कागज़ बचाने के लिए डिजिटल रूप से भेजी गई है',
    notProvided: 'उपलब्ध नहीं',
    noDueDate: 'कोई देय तिथि नहीं',
  },
  Tamil: {
    digitalReceipt: 'டிஜிட்டல் ரசீது',
    customerName: 'வாடிக்கையாளர் பெயர்',
    customerEmail: 'வாடிக்கையாளர் மின்னஞ்சல்',
    customerAddress: 'வாடிக்கையாளர் முகவரி',
    productService: 'பொருள் / சேவை',
    billDate: 'பில் தேதி',
    dueDate: 'கடைசி தேதி',
    notes: 'குறிப்புகள்',
    subtotal: 'இடைத் தொகை',
    gst: 'ஜிஎஸ்டி',
    totalAmount: 'மொத்தம்',
    scan: 'இந்த ரசீதைக் காண ஸ்கேன் செய்யவும்',
    paperless: 'காகித வீணை குறைக்க இந்த ரசீது டிஜிட்டலாக அனுப்பப்பட்டது',
    notProvided: 'வழங்கப்படவில்லை',
    noDueDate: 'கடைசி தேதி இல்லை',
  },
  Telugu: {
    digitalReceipt: 'డిజిటల్ రసీదు',
    customerName: 'కస్టమర్ పేరు',
    customerEmail: 'కస్టమర్ ఇమెయిల్',
    customerAddress: 'కస్టమర్ చిరునామా',
    productService: 'ఉత్పత్తి / సేవ',
    billDate: 'బిల్ తేదీ',
    dueDate: 'చెల్లింపు తేదీ',
    notes: 'గమనికలు',
    subtotal: 'ఉప మొత్తం',
    gst: 'జిఎస్టి',
    totalAmount: 'మొత్తం చెల్లింపు',
    scan: 'ఈ రసీదును చూడటానికి స్కాన్ చేయండి',
    paperless: 'కాగితం వృథాను తగ్గించడానికి ఈ రసీదు డిజిటల్‌గా పంపబడింది',
    notProvided: 'ఇవ్వలేదు',
    noDueDate: 'చెల్లింపు తేదీ లేదు',
  },
};

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(Number(value || 0));
}

export function calculateBillTotals({ price, quantity = 1, gstRate = 0 }) {
  const subtotal = Number(price || 0) * Number(quantity || 1);
  const taxAmount = subtotal * (Number(gstRate || 0) / 100);
  const total = subtotal + taxAmount;

  return { subtotal, taxAmount, total };
}

export function calculateLoyaltyPoints(totalAmount) {
  return Math.floor(Number(totalAmount || 0) / 100) * 10;
}

export function formatCustomerAddress(bill) {
  const parts = [
    bill?.customerAddressLine1,
    bill?.customerAddressLine2,
    [bill?.customerCity, bill?.customerState].filter(Boolean).join(', '),
    bill?.customerPostalCode,
    bill?.customerCountry,
  ].filter(Boolean);

  return parts.join(', ');
}

export function isOverdue(bill) {
  return Boolean(
    bill?.dueDate && bill?.paymentStatus !== 'paid' && new Date(`${bill.dueDate}T23:59:59`).getTime() < Date.now()
  );
}

export function getEffectivePaymentStatus(bill) {
  return isOverdue(bill) ? 'overdue' : bill?.paymentStatus || 'pending';
}

export function getEcoMetrics(bills = []) {
  const digitalBills = bills.filter((bill) => !bill.printRequested).length;
  const paperSavedGrams = digitalBills * PAPER_GRAMS_PER_BILL;
  const paperSavedKg = paperSavedGrams / 1000;

  return {
    digitalBills,
    printedBills: bills.length - digitalBills,
    paperSavedGrams,
    waterSavedLiters: paperSavedKg * WATER_LITERS_PER_KG_PAPER,
    co2SavedKg: paperSavedKg * CO2_KG_PER_PAPER_KG,
    treesEquivalent: paperSavedGrams / 1000 / 8.3,
  };
}

export function getBillAnalytics(bills = []) {
  const revenue = bills.reduce((sum, bill) => sum + Number(bill.price || 0), 0);
  const paidBills = bills.filter((bill) => getEffectivePaymentStatus(bill) === 'paid');
  const pendingBills = bills.filter((bill) => getEffectivePaymentStatus(bill) === 'pending');
  const overdueBills = bills.filter((bill) => getEffectivePaymentStatus(bill) === 'overdue');
  const recurringBills = bills.filter((bill) => bill.recurringInterval && bill.recurringInterval !== 'none');
  const eco = getEcoMetrics(bills);
  const uniqueCustomers = aggregateCustomers(bills);
  const monthKey = new Date().toISOString().slice(0, 7);
  const thisMonthBills = bills.filter((bill) => (bill.date || '').startsWith(monthKey));

  return {
    totalBills: bills.length,
    revenue,
    paidRevenue: paidBills.reduce((sum, bill) => sum + Number(bill.price || 0), 0),
    pendingRevenue: pendingBills.reduce((sum, bill) => sum + Number(bill.price || 0), 0),
    paidCount: paidBills.length,
    pendingCount: pendingBills.length,
    overdueCount: overdueBills.length,
    recurringCount: recurringBills.length,
    customerCount: uniqueCustomers.length,
    thisMonthRevenue: thisMonthBills.reduce((sum, bill) => sum + Number(bill.price || 0), 0),
    eco,
  };
}

export function aggregateCustomers(bills = []) {
  const byKey = new Map();

  bills.forEach((bill) => {
    const key = bill.customerEmail || bill.customerPhone || bill.customerName;
    if (!key) return;

    const existing = byKey.get(key) || {
      id: key,
      customerName: bill.customerName,
      customerEmail: bill.customerEmail || '',
      customerPhone: bill.customerPhone || '',
      customerAddressLine1: bill.customerAddressLine1 || '',
      customerAddressLine2: bill.customerAddressLine2 || '',
      customerCity: bill.customerCity || '',
      customerState: bill.customerState || '',
      customerPostalCode: bill.customerPostalCode || '',
      customerCountry: bill.customerCountry || 'India',
      preferredChannel: bill.deliveryPreference || 'email',
      preferredLanguage: bill.receiptLanguage || 'English',
      printRequested: Boolean(bill.printRequested),
      totalBills: 0,
      totalSpent: 0,
      loyaltyPoints: 0,
      averageRating: 0,
      lastBillDate: bill.date || bill.createdAt,
    };

    existing.totalBills += 1;
    existing.totalSpent += Number(bill.price || 0);
    existing.loyaltyPoints += Number(bill.loyaltyPoints || 0);
    existing.lastBillDate = new Date(existing.lastBillDate).getTime() > new Date(bill.date || bill.createdAt).getTime()
      ? existing.lastBillDate
      : bill.date || bill.createdAt;

    if (bill.feedbackRating) {
      existing.averageRating = existing.averageRating
        ? (existing.averageRating + Number(bill.feedbackRating)) / 2
        : Number(bill.feedbackRating);
    }

    [
      'customerName',
      'customerEmail',
      'customerPhone',
      'customerAddressLine1',
      'customerAddressLine2',
      'customerCity',
      'customerState',
      'customerPostalCode',
      'customerCountry',
    ].forEach((field) => {
      if (bill[field]) existing[field] = bill[field];
    });

    if (bill.deliveryPreference) existing.preferredChannel = bill.deliveryPreference;
    if (bill.receiptLanguage) existing.preferredLanguage = bill.receiptLanguage;
    existing.printRequested = Boolean(bill.printRequested);

    byKey.set(key, existing);
  });

  return Array.from(byKey.values()).sort(
    (a, b) => new Date(b.lastBillDate).getTime() - new Date(a.lastBillDate).getTime()
  );
}

export function getUpcomingReminders(bills = []) {
  return bills
    .filter((bill) => bill.dueDate && getEffectivePaymentStatus(bill) !== 'paid')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);
}

export function buildPaymentLink({ bill, upiId }) {
  if (bill?.paymentLink) return bill.paymentLink;
  if (!upiId) return '';

  const params = new URLSearchParams({
    pa: upiId,
    pn: bill.customerName || 'Bill Payment',
    am: String(Number(bill.price || 0).toFixed(2)),
    cu: 'INR',
    tn: bill.billNumber || bill.id || 'Digital bill payment',
  });

  return `upi://pay?${params.toString()}`;
}

export function buildWhatsAppLink(billUrl, bill) {
  const text = encodeURIComponent(
    `Hello ${bill.customerName || ''}, here is your digital bill ${bill.billNumber || ''}: ${billUrl}`.trim()
  );
  return `https://wa.me/?text=${text}`;
}

export function buildMailtoLink(billUrl, bill) {
  const subject = encodeURIComponent(`Your digital bill ${bill.billNumber || ''}`.trim());
  const body = encodeURIComponent(
    `Hello ${bill.customerName || ''},\n\nYou can view your bill here: ${billUrl}\n\nThank you.`
  );
  return `mailto:${bill.customerEmail || ''}?subject=${subject}&body=${body}`;
}

export function exportBillsToCsv(bills = []) {
  const headers = [
    'Bill Number',
    'Customer Name',
    'Customer Email',
    'Customer Phone',
    'Address',
    'Product',
    'Date',
    'Due Date',
    'Total',
    'Status',
    'Delivery',
    'Language',
    'Recurring',
    'Print Requested',
    'Loyalty Points',
    'Feedback Rating',
  ];

  const rows = bills.map((bill) => [
    bill.billNumber,
    bill.customerName,
    bill.customerEmail,
    bill.customerPhone,
    formatCustomerAddress(bill),
    bill.productName,
    bill.date,
    bill.dueDate,
    Number(bill.price || 0).toFixed(2),
    getEffectivePaymentStatus(bill),
    bill.deliveryPreference || 'email',
    bill.receiptLanguage || 'English',
    bill.recurringInterval || 'none',
    bill.printRequested ? 'Yes' : 'No',
    bill.loyaltyPoints || 0,
    bill.feedbackRating || '',
  ]);

  return [headers, ...rows]
    .map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');
}
