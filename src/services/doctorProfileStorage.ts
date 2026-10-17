import { DoctorProfile } from '../types';

const STORAGE_PREFIX = 'homiohelper_doctor_profile_';
const CURRENT_PROFILE_KEY = 'homiohelper_current_doctor_profile';

/**
 * Baseline template profile for initial preview when no user is logged in.
 * Can be fully edited or overridden by any doctor.
 */
export const INITIAL_PREVIEW_PROFILE: DoctorProfile = {
  id: 'doc-preview',
  name: 'ডা. এম. এ. রহমান (Dr. M. A. Rahman)',
  qualification: 'BHMS (DU), DHMS, কনসালট্যান্ট হোমিওপ্যাথ',
  chamberName: 'আল-শিফা হোমিওপ্যাথিক আরোগ্য নিকেতন',
  chamberAddress: 'বাড়ি ১৪, রোড ৪, ধানমন্ডি, ঢাকা-১২০৫, বাংলাদেশ',
  regNumber: 'রেজি নং: BD-H-4491 (বাংলাদেশ হোমিওপ্যাথি বোর্ড)',
  phone: '+880 1711-234567',
  email: 'dr.rahman@homiohelper.bd',
  additionalInfo: 'রোগী দেখার সময়: প্রতিদিন বিকাল ৫:০০ - রাত ৯:০০ (শুক্রবার বন্ধ)',
  updatedAt: new Date().toISOString(),
};

/**
 * Checks whether all required doctor profile fields are completed.
 * Required:
 * - Full name
 * - Qualification / designation
 * - Chamber or clinic name
 * - Chamber address
 */
export function isDoctorProfileComplete(profile: DoctorProfile | null | undefined): boolean {
  if (!profile) return false;
  return Boolean(
    profile.name?.trim() &&
    profile.qualification?.trim() &&
    profile.chamberName?.trim() &&
    profile.chamberAddress?.trim()
  );
}

/**
 * Retrieves the saved doctor profile for a specific user ID or current session.
 */
export function getSavedDoctorProfile(userId?: string): DoctorProfile {
  try {
    if (userId) {
      const userSpecific = localStorage.getItem(`${STORAGE_PREFIX}${userId}`);
      if (userSpecific) {
        return JSON.parse(userSpecific) as DoctorProfile;
      }
    }

    const currentProfile = localStorage.getItem(CURRENT_PROFILE_KEY);
    if (currentProfile) {
      return JSON.parse(currentProfile) as DoctorProfile;
    }
  } catch (err) {
    console.error('Error loading doctor profile from storage:', err);
  }

  // If no saved profile exists yet for a specific user, create a blank profile draft
  if (userId) {
    return {
      id: `doc-${userId}`,
      userId,
      name: '',
      qualification: '',
      chamberName: '',
      chamberAddress: '',
      regNumber: '',
      phone: '',
      email: '',
      additionalInfo: '',
      updatedAt: new Date().toISOString(),
    };
  }

  return INITIAL_PREVIEW_PROFILE;
}

/**
 * Saves the doctor profile both for the user's specific account and the current active session.
 * Also synchronizes to Firestore if cloud database is configured and available.
 */
export async function saveDoctorProfile(profile: DoctorProfile): Promise<DoctorProfile> {
  const updated: DoctorProfile = {
    ...profile,
    updatedAt: new Date().toISOString(),
  };

  try {
    const json = JSON.stringify(updated);
    if (updated.userId) {
      localStorage.setItem(`${STORAGE_PREFIX}${updated.userId}`, json);
    }
    localStorage.setItem(CURRENT_PROFILE_KEY, json);
  } catch (err) {
    console.error('Error persisting doctor profile to localStorage:', err);
  }

  // Asynchronously attempt Firestore sync if initialized
  try {
    const { db, isFirestoreReady } = await import('../lib/firebase');
    if (db && isFirestoreReady()) {
      const { doc, setDoc } = await import('firebase/firestore');
      const docId = updated.userId || 'primary-doctor';
      await setDoc(
        doc(db, 'doctor_profiles', docId),
        {
          ...updated,
          ownerId: updated.userId || 'chamber-doctor',
          syncedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }
  } catch (cloudErr) {
    // Cloud sync failure does not interrupt local profile operation
    console.warn('Doctor profile persisted to local storage (cloud sync pending):', cloudErr);
  }

  return updated;
}

