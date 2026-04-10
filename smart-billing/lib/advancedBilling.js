import { format, subMonths } from 'date-fns';
import { calculateBillTotals, formatCurrency, getEffectivePaymentStatus } from './billInsights';

export const BARCODE_CATALOG = {
  '8901234567890': { productName: 'Notebook Bundle', unitPrice: 299, gstRate: 12 },
  '978020137962': { productName: 'Office Pen Pack', unitPrice: 149, gstRate: 5 },
  '5012345678900': { productName: 'Printer Paper Ream', unitPrice: 375, gstRate: 18 },
};

export function parseBillText(text = '') {
  const normalized = text.replace(/\r/g, '').trim();
  if (!normalized) return null;

  const line = (label) => normalized.match(new RegExp(`${label}[:\\-]?\\s*(.+)`, 'i'))?.[1]?.split('\n')[0]?.trim() || '';
  const amount = normalized.match(/(?:total|amount|price)[:\-]?\s*(?:rs\.?|inr|₹)?\s*([\d,.]+)/i)?.[1] || '';
  const customerName = line('customer|name|bill to');
  const productName = line('product|item|service|description');
  const date = normalized.match(/(\d{4}-\d{2}-\d{2}|\d{2}[\/\-]\d{2}[\/\-]\d{4})/)?.[1] || '';
  const billDate = date.includes('/') || (date.includes('-') && date.indexOf('-') === 2)
    ? date.split(/[\/\-]/).reverse().join('-')
    : date;

  return {
    customerName,
    productName,
    unitPrice: amount.replace(/,/g, ''),
    date: billDate,
  };
}

export function getBarcodeSuggestion(barcode) {
  return BARCODE_CATALOG[barcode] || null;
}

function linearRegression(values = []) {
  if (values.length < 2) return { slope: 0, intercept: values[0] || 0 };
  const n = values.length;
  const sumX = values.reduce((sum, _, index) => sum + index, 0);
  const sumY = values.reduce((sum, value) => sum + value, 0);
  const sumXY = values.reduce((sum, value, index) => sum + index * value, 0);
  const sumXX = values.reduce((sum, _, index) => sum + index * index, 0);
  const denominator = n * sumXX - sumX * sumX;
  if (!denominator) return { slope: 0, intercept: values[0] || 0 };
  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

function standardDeviation(values = []) {
  if (!values.length) return 0;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

export function getMonthlySeries(bills = [], months = 6) {
  return Array.from({ length: months }, (_, index) => {
    const date = subMonths(new Date(), months - index - 1);
    const key = format(date, 'yyyy-MM');
    const label = format(date, 'MMM');
    const monthBills = bills.filter((bill) => (bill.date || '').startsWith(key));
    return {
      key,
      label,
      revenue: monthBills.reduce((sum, bill) => sum + Number(bill.price || 0), 0),
      count: monthBills.length,
      printed: monthBills.filter((bill) => bill.printRequested).length,
      digital: monthBills.filter((bill) => !bill.printRequested).length,
    };
  });
}

export function getForecastData(bills = []) {
  const series = getMonthlySeries(bills, 8);
  const recentRevenue = series.map((item) => item.revenue);
  const recentCount = series.map((item) => item.count);
  const revenueModel = linearRegression(recentRevenue);
  const countModel = linearRegression(recentCount);
  const nextIndex = recentRevenue.length;
  const projectedRevenue = Math.max(0, revenueModel.slope * nextIndex + revenueModel.intercept);
  const projectedCount = Math.max(0, Math.round(countModel.slope * nextIndex + countModel.intercept));
  const volatility = standardDeviation(recentRevenue);
  const meanRevenue = recentRevenue.reduce((sum, value) => sum + value, 0) / Math.max(recentRevenue.length, 1);
  const varianceRatio = meanRevenue ? volatility / meanRevenue : 0;

  return {
    series,
    nextMonthRevenue: projectedRevenue,
    nextMonthBills: projectedCount,
    confidence: bills.length >= 12 && varianceRatio < 0.5 ? 'medium' : bills.length >= 20 && varianceRatio < 0.25 ? 'high' : 'low',
    trend: revenueModel.slope > 0 ? 'up' : revenueModel.slope < 0 ? 'down' : 'flat',
  };
}

export function getAiInsights(bills = []) {
  if (!bills.length) return [];

  const totalRevenue = bills.reduce((sum, bill) => sum + Number(bill.price || 0), 0);
  const averageOrderValue = totalRevenue / bills.length;
  const paid = bills.filter((bill) => getEffectivePaymentStatus(bill) === 'paid');
  const pending = bills.filter((bill) => getEffectivePaymentStatus(bill) !== 'paid');
  const imported = bills.filter((bill) => bill.importedFromPaper);
  const repeatedCustomers = new Map();
  const forecast = getForecastData(bills);

  bills.forEach((bill) => {
    const key = bill.customerEmail || bill.customerPhone || bill.customerName;
    if (!key) return;
    repeatedCustomers.set(key, (repeatedCustomers.get(key) || 0) + 1);
  });

  const repeatCount = Array.from(repeatedCustomers.values()).filter((count) => count > 1).length;
  const topMonth = getMonthlySeries(bills, 6).sort((a, b) => b.revenue - a.revenue)[0];

  return [
    `Average bill value is ${formatCurrency(averageOrderValue)} across ${bills.length} bills.`,
    `${paid.length} bills are paid while ${pending.length} still need follow-up.`,
    `${repeatCount} customers returned for more than one purchase.`,
    topMonth?.revenue ? `${topMonth.label} is your strongest recent month with ${formatCurrency(topMonth.revenue)} in billing.` : null,
    imported.length ? `${imported.length} bills were imported from paper records, helping digitize older transactions.` : null,
    `Forecast suggests revenue may trend ${forecast.trend} next month with around ${formatCurrency(forecast.nextMonthRevenue)} expected.`,
  ].filter(Boolean);
}

export function detectFraudSignals(bills = []) {
  const findings = [];
  const exactKeyMap = new Map();
  const amountMap = new Map();
  const amounts = bills.map((bill) => Number(bill.price || 0));
  const mean = amounts.reduce((sum, value) => sum + value, 0) / Math.max(amounts.length, 1);
  const deviation = standardDeviation(amounts);

  bills.forEach((bill) => {
    const exactKey = [bill.customerName, bill.productName, bill.date, Number(bill.price || 0).toFixed(2)].join('|');
    exactKeyMap.set(exactKey, [...(exactKeyMap.get(exactKey) || []), bill]);

    const amountKey = [bill.customerName, Number(bill.price || 0).toFixed(2)].join('|');
    amountMap.set(amountKey, [...(amountMap.get(amountKey) || []), bill]);
  });

  exactKeyMap.forEach((matches) => {
    if (matches.length > 1) {
      findings.push({
        type: 'duplicate',
        severity: 'high',
        title: 'Exact duplicate billing pattern',
        description: `${matches.length} bills share the same customer, product, date, and amount.`,
        bills: matches.slice(0, 3),
      });
    }
  });

  amountMap.forEach((matches) => {
    if (matches.length >= 3) {
      findings.push({
        type: 'repeat-amount',
        severity: 'medium',
        title: 'Repeated amount for same customer',
        description: `${matches[0].customerName} has ${matches.length} bills with the same amount.`,
        bills: matches.slice(0, 3),
      });
    }
  });

  bills.forEach((bill) => {
    const amount = Number(bill.price || 0);
    const zScore = deviation ? (amount - mean) / deviation : 0;
    if (zScore > 2.2) {
      findings.push({
        type: 'outlier',
        severity: zScore > 3 ? 'high' : 'medium',
        title: 'High-value anomaly',
        description: `${bill.billNumber} is statistically far above your normal billing range.`,
        bills: [bill],
        score: zScore,
      });
    }
    if (bill.importedFromPaper && !bill.customerEmail && !bill.customerPhone) {
      findings.push({
        type: 'import-risk',
        severity: 'low',
        title: 'Imported bill with weak identity data',
        description: `${bill.billNumber} was imported from paper without customer contact details.`,
        bills: [bill],
      });
    }
  });

  return findings.slice(0, 10);
}

export function buildAdminSummary(bills = []) {
  const userMap = new Map();
  bills.forEach((bill) => {
    const existing = userMap.get(bill.userId) || { userId: bill.userId, bills: 0, revenue: 0, imported: 0 };
    existing.bills += 1;
    existing.revenue += Number(bill.price || 0);
    if (bill.importedFromPaper) existing.imported += 1;
    userMap.set(bill.userId, existing);
  });

  return Array.from(userMap.values()).sort((a, b) => b.revenue - a.revenue);
}

export function exportBillsToJson(bills = []) {
  return JSON.stringify(bills, null, 2);
}

export function parseBackupFile(text = '') {
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed)) throw new Error('Backup file must contain an array of bills');

  return parsed.map((bill) => {
    const totals = calculateBillTotals({
      price: bill.unitPrice || bill.subtotal || bill.price,
      quantity: bill.quantity || 1,
      gstRate: bill.gstRate || 0,
    });

    return {
      customerName: bill.customerName || 'Imported Customer',
      customerEmail: (bill.customerEmail || '').toLowerCase(),
      customerPhone: bill.customerPhone || '',
      customerAddressLine1: bill.customerAddressLine1 || '',
      customerAddressLine2: bill.customerAddressLine2 || '',
      customerCity: bill.customerCity || '',
      customerState: bill.customerState || '',
      customerPostalCode: bill.customerPostalCode || '',
      customerCountry: bill.customerCountry || 'India',
      productName: bill.productName || 'Imported Product',
      quantity: Number(bill.quantity || 1),
      subtotal: Number(bill.subtotal ?? totals.subtotal),
      gstRate: Number(bill.gstRate || 0),
      taxAmount: Number(bill.taxAmount ?? totals.taxAmount),
      price: Number(bill.price ?? totals.total),
      date: bill.date || format(new Date(), 'yyyy-MM-dd'),
      dueDate: bill.dueDate || '',
      paymentStatus: bill.paymentStatus || 'pending',
      deliveryPreference: bill.deliveryPreference || 'email',
      recurringInterval: bill.recurringInterval || 'none',
      printRequested: Boolean(bill.printRequested),
      notes: bill.notes || '',
      paymentLink: bill.paymentLink || '',
      reminderStatus: bill.reminderStatus || 'scheduled',
      receiptLanguage: bill.receiptLanguage || 'English',
      loyaltyPoints: Number(bill.loyaltyPoints || 0),
      barcode: bill.barcode || '',
      importedFromPaper: Boolean(bill.importedFromPaper),
    };
  });
}

export function createOfflineQueueItem(form) {
  const totals = calculateBillTotals({ price: form.unitPrice, quantity: form.quantity, gstRate: form.gstRate });
  return { ...form, subtotal: totals.subtotal, taxAmount: totals.taxAmount, price: totals.total, queuedAt: new Date().toISOString() };
}
