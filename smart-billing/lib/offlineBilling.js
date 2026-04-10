export const BILL_DRAFT_KEY = 'billgreen_bill_draft';
export const BILL_QUEUE_KEY = 'billgreen_offline_queue';

export function saveBillDraft(draft) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(BILL_DRAFT_KEY, JSON.stringify(draft));
}

export function loadBillDraft() {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(window.localStorage.getItem(BILL_DRAFT_KEY) || 'null');
  } catch {
    return null;
  }
}

export function clearBillDraft() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(BILL_DRAFT_KEY);
}

export function enqueueOfflineBill(bill) {
  if (typeof window === 'undefined') return;
  const current = getOfflineQueue();
  current.push(bill);
  window.localStorage.setItem(BILL_QUEUE_KEY, JSON.stringify(current));
}

export function getOfflineQueue() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.localStorage.getItem(BILL_QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function clearOfflineQueue() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(BILL_QUEUE_KEY);
}
