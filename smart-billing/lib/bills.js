import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';

const BILLS_COLLECTION = 'bills';

function generateBillNumber() {
  const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `BG-${stamp}-${suffix}`;
}

function normalizeBill(snapshot) {
  const data = snapshot.data();
  return {
    id: snapshot.id,
    ...data,
    billNumber: data.billNumber || `BG-${snapshot.id.slice(-6).toUpperCase()}`,
    customerEmail: data.customerEmail || '',
    customerPhone: data.customerPhone || '',
    customerAddressLine1: data.customerAddressLine1 || '',
    customerAddressLine2: data.customerAddressLine2 || '',
    customerCity: data.customerCity || '',
    customerState: data.customerState || '',
    customerPostalCode: data.customerPostalCode || '',
    customerCountry: data.customerCountry || 'India',
    deliveryPreference: data.deliveryPreference || 'email',
    paymentStatus: data.paymentStatus || 'pending',
    recurringInterval: data.recurringInterval || 'none',
    printRequested: Boolean(data.printRequested),
    reminderStatus: data.reminderStatus || 'scheduled',
    notes: data.notes || '',
    dueDate: data.dueDate || '',
    paymentLink: data.paymentLink || '',
    receiptLanguage: data.receiptLanguage || 'English',
    feedbackRating: Number(data.feedbackRating || 0),
    feedbackText: data.feedbackText || '',
    loyaltyPoints: Number(data.loyaltyPoints || 0),
    barcode: data.barcode || '',
    importedFromPaper: Boolean(data.importedFromPaper),
    subtotal: Number(data.subtotal ?? data.price ?? 0),
    gstRate: Number(data.gstRate ?? 0),
    taxAmount: Number(data.taxAmount ?? 0),
    price: Number(data.price ?? 0),
    quantity: Number(data.quantity ?? 1),
    createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
  };
}

function prepareBillData(userId, billData) {
  return {
    ...billData,
    userId,
    billNumber: billData.billNumber || generateBillNumber(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    price: parseFloat(billData.price),
    subtotal: parseFloat(billData.subtotal ?? billData.price),
    quantity: parseFloat(billData.quantity ?? 1),
    gstRate: parseFloat(billData.gstRate ?? 0),
    taxAmount: parseFloat(billData.taxAmount ?? 0),
    loyaltyPoints: Number(billData.loyaltyPoints || 0),
    customerEmail: (billData.customerEmail || '').trim().toLowerCase(),
  };
}

export async function createBill(userId, billData) {
  const docRef = await addDoc(collection(db, BILLS_COLLECTION), prepareBillData(userId, billData));
  return docRef.id;
}

export async function importBills(userId, bills = []) {
  const importedIds = [];
  for (const bill of bills) {
    const docRef = await addDoc(collection(db, BILLS_COLLECTION), prepareBillData(userId, bill));
    importedIds.push(docRef.id);
  }
  return importedIds;
}

export async function getUserBills(userId) {
  const q = query(
    collection(db, BILLS_COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(normalizeBill);
}

export async function getAllBills() {
  const q = query(collection(db, BILLS_COLLECTION), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(normalizeBill);
}

export async function getBillById(billId) {
  const docRef = doc(db, BILLS_COLLECTION, billId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return normalizeBill(snapshot);
}

export async function updateBillStatus(billId, updates) {
  const docRef = doc(db, BILLS_COLLECTION, billId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function getCustomerBillsByAccess(customerEmail, customerPhone) {
  let snapshot = null;

  if (customerEmail) {
    snapshot = await getDocs(
      query(collection(db, BILLS_COLLECTION), where('customerEmail', '==', customerEmail.trim().toLowerCase()))
    );
  }

  let docs = snapshot?.docs || [];

  if ((!docs.length || !customerEmail) && customerPhone) {
    const phoneSnapshot = await getDocs(
      query(collection(db, BILLS_COLLECTION), where('customerPhone', '==', customerPhone.trim()))
    );
    docs = phoneSnapshot.docs;
  }

  if (customerEmail && customerPhone) {
    docs = docs.filter((entry) => {
      const data = entry.data();
      return data.customerEmail === customerEmail.trim().toLowerCase() || data.customerPhone === customerPhone.trim();
    });
  }

  return docs
    .map(normalizeBill)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
