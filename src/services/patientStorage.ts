import { Patient } from '../types';

const PATIENTS_STORAGE_KEY = 'homiohelper_patients_records_v1';

// Initial sample patients so the clinic has realistic clinical data ready if none exist yet
const DEFAULT_INITIAL_PATIENTS: Patient[] = [
  {
    id: 'patient-demo-1',
    regNo: 'HOM-1001',
    name: 'রফিকুল ইসলাম (Rafiqul Islam)',
    age: 42,
    gender: 'male',
    mobile: '01819-876543',
    district: 'ঢাকা (Dhaka)',
    address: 'মিরপুর-১০, ঢাকা',
    bloodGroup: 'B+',
    chiefComplaint: 'তীব্র জয়েন্টে ব্যথা ও শক্ত ভাব, ঠান্ডা বাতাসে বৃদ্ধি',
    registeredAt: '2026-10-10T09:30:00.000Z',
    lastVisitAt: '2026-10-13T10:00:00.000Z',
    totalVisits: 1,
  },
  {
    id: 'patient-demo-2',
    regNo: 'HOM-1002',
    name: 'নাজনীন আক্তার (Nazneen Akter)',
    age: 29,
    gender: 'female',
    mobile: '01712-345678',
    district: 'নারায়ণগঞ্জ (Narayanganj)',
    address: 'চাষাড়া, নারায়ণগঞ্জ',
    bloodGroup: 'O+',
    chiefComplaint: 'ক্রনিক মাইগ্রেন ও মাথাব্যথা, রোদে বৃদ্ধি',
    registeredAt: '2026-10-11T11:15:00.000Z',
    lastVisitAt: '2026-10-11T11:15:00.000Z',
    totalVisits: 1,
  },
  {
    id: 'patient-demo-3',
    regNo: 'HOM-1003',
    name: 'তাহমিদ হাসান (Tahmid Hasan)',
    age: 8,
    gender: 'male',
    mobile: '01911-987654',
    district: 'ঢাকা (Dhaka)',
    address: 'উত্তরা সেক্টর ৭, ঢাকা',
    bloodGroup: 'A+',
    chiefComplaint: 'বারবার সর্দি-কাশি ও টনসিলের সমস্যা',
    registeredAt: '2026-10-12T16:00:00.000Z',
    lastVisitAt: '2026-10-12T16:00:00.000Z',
    totalVisits: 1,
  },
];

export function getSavedPatients(): Patient[] {
  try {
    const raw = localStorage.getItem(PATIENTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading patients from storage:', err);
  }
  return DEFAULT_INITIAL_PATIENTS;
}

export function savePatientToStorage(patient: Patient): Patient[] {
  const current = getSavedPatients();
  const existingIdx = current.findIndex((p) => p.id === patient.id || p.regNo === patient.regNo);
  let updated: Patient[];

  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = { ...updated[existingIdx], ...patient };
  } else {
    updated = [patient, ...current];
  }

  try {
    localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error writing patient to storage:', err);
  }

  // Asynchronously attempt Firestore sync if configured
  (async () => {
    try {
      const { db, isFirestoreReady } = await import('../lib/firebase');
      if (db && isFirestoreReady()) {
        const { doc, setDoc } = await import('firebase/firestore');
        const target = updated.find((p) => p.id === patient.id) || patient;
        await setDoc(
          doc(db, 'patients', target.id),
          {
            ...target,
            syncedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }
    } catch (e) {
      // Local storage is primary fallback, ignore or log silently
    }
  })();

  return updated;
}

export function updatePatientLastVisit(patientId: string, visitDate: string): void {
  try {
    const current = getSavedPatients();
    const idx = current.findIndex((p) => p.id === patientId);
    if (idx >= 0) {
      current[idx].lastVisitAt = visitDate;
      current[idx].totalVisits = (current[idx].totalVisits || 1) + 1;
      localStorage.setItem(PATIENTS_STORAGE_KEY, JSON.stringify(current));

      (async () => {
        try {
          const { db, isFirestoreReady } = await import('../lib/firebase');
          if (db && isFirestoreReady()) {
            const { doc, setDoc } = await import('firebase/firestore');
            await setDoc(
              doc(db, 'patients', patientId),
              {
                lastVisitAt: visitDate,
                totalVisits: current[idx].totalVisits,
                updatedAt: new Date().toISOString(),
              },
              { merge: true }
            );
          }
        } catch (e) {
          // ignore background failure
        }
      })();
    }
  } catch (err) {
    console.error('Error updating patient visit:', err);
  }
}

