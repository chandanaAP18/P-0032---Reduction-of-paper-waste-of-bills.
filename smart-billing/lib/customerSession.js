export const CUSTOMER_SESSION_KEY = 'billgreen_customer_access';

export function saveCustomerSession(session) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(session));
}

export function getCustomerSession() {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(CUSTOMER_SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearCustomerSession() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(CUSTOMER_SESSION_KEY);
}
