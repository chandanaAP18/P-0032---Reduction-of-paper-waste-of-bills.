import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

const USERS_COLLECTION = 'users';

export const defaultUserSettings = {
  businessName: 'BillGreen Store',
  role: 'Admin',
  defaultDeliveryPreference: 'email',
  defaultPrintRequested: false,
  preferredLanguage: 'English',
  upiId: '',
};

export async function getUserSettings(user) {
  if (!user?.uid) return defaultUserSettings;

  const docRef = doc(db, USERS_COLLECTION, user.uid);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    await setDoc(docRef, {
      ...defaultUserSettings,
      displayName: user.displayName || '',
      email: user.email || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return defaultUserSettings;
  }

  return {
    ...defaultUserSettings,
    ...snapshot.data(),
  };
}

export async function saveUserSettings(userId, settings) {
  const docRef = doc(db, USERS_COLLECTION, userId);
  await setDoc(
    docRef,
    {
      ...settings,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function updateUserRole(userId, role) {
  const docRef = doc(db, USERS_COLLECTION, userId);
  await updateDoc(docRef, {
    role,
    updatedAt: serverTimestamp(),
  });
}

