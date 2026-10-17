import { Prescription } from '../types';

const RX_STORAGE_KEY = 'homiohelper_prescriptions_data';

const DEFAULT_SAMPLE_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'rx-sample-101',
    prescriptionNo: 'RX-2401',
    patientId: 'patient-demo-1',
    patientName: 'রফিকুল ইসলাম (Rafiqul Islam)',
    patientAge: 42,
    patientGender: 'male',
    patientMobile: '01819-876543',
    patientRegNo: 'HOM-1001',
    patientAddress: 'মিরপুর-১০, ঢাকা',
    patientBloodGroup: 'B+',
    date: '13/10/2026',
    chiefComplaint: 'তীব্র জয়েন্টে ব্যথা ও শক্ত ভাব, ঠান্ডা বাতাসে বৃদ্ধি, চলাফেরায় উপশম (Acute joint pain & stiffness)',
    diagnosis: 'Rheumatoid Arthritis / বাতজ্বর',
    bp: '125/80 mmHg',
    weight: '68 kg',
    temperature: '98.4°F',
    remedies: [
      {
        id: 'rem-1',
        medicineName: 'Rhus Toxicodendron',
        potency: '200C',
        form: 'globules',
        dosage: '৪ দানা করে (4 globules)',
        frequency: 'দিনে ২ বার খাবার ৩০ মিনিট আগে (Twice daily before meals)',
        duration: '৭ দিন (7 days)',
        instructions: 'সকালে ও সন্ধ্যায় পরিষ্কার পানির সাথে সেব্য।',
      },
      {
        id: 'rem-2',
        medicineName: 'Bryonia Alba',
        potency: '30C',
        form: 'liquid',
        dosage: '৫ ফোঁটা আধা কাপ পানিতে',
        frequency: 'দুপুরে ১ বার (Once daily at noon)',
        duration: '৭ দিন (7 days)',
        instructions: 'তীব্র যন্ত্রণার সময় প্রয়োজন হলে সেব্য।',
      },
    ],
    dietRestrictions: 'কাঁচা পেঁয়াজ, কাঁচা রসুন, টক জাতীয় খাবার, কড়া চা-কফি ও তামাক সম্পূর্ণ পরিহার করুন।',
    specialInstructions: 'ভারী ওজন বহন করা থেকে বিরত থাকুন এবং কুসুম গরম সেঁক দিন।',
    followUpDate: '20/10/2026',
    createdAt: '2026-10-13T10:00:00.000Z',
  },
];

export function getSavedPrescriptions(): Prescription[] {
  try {
    const raw = localStorage.getItem(RX_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading prescriptions from localStorage:', err);
  }
  return DEFAULT_SAMPLE_PRESCRIPTIONS;
}

export function savePrescriptionToStorage(rx: Prescription): Prescription[] {
  const current = getSavedPrescriptions();
  const existingIdx = current.findIndex((item) => item.id === rx.id);
  let updated: Prescription[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = rx;
  } else {
    updated = [rx, ...current];
  }

  try {
    localStorage.setItem(RX_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error writing prescription to localStorage:', err);
  }

  // Asynchronously attempt Firestore sync if configured
  (async () => {
    try {
      const { db, isFirestoreReady } = await import('../lib/firebase');
      if (db && isFirestoreReady()) {
        const { doc, setDoc } = await import('firebase/firestore');
        await setDoc(
          doc(db, 'prescriptions', rx.id),
          {
            ...rx,
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

export function deletePrescriptionFromStorage(id: string): Prescription[] {
  const current = getSavedPrescriptions();
  const updated = current.filter((item) => item.id !== id);
  try {
    localStorage.setItem(RX_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error deleting prescription from localStorage:', err);
  }

  (async () => {
    try {
      const { db, isFirestoreReady } = await import('../lib/firebase');
      if (db && isFirestoreReady()) {
        const { doc, deleteDoc } = await import('firebase/firestore');
        await deleteDoc(doc(db, 'prescriptions', id));
      }
    } catch (e) {
      // ignore
    }
  })();

  return updated;
}

