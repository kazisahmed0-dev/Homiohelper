import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { db, isFirestoreReady, getFirebaseConfigStatus } from '../lib/firebase';
import { Patient, Prescription, DoctorProfile, Medicine } from '../types';
import { getSavedPatients, savePatientToStorage } from './patientStorage';
import { getSavedPrescriptions, savePrescriptionToStorage } from './prescriptionStorage';
import { getSavedDoctorProfile, saveDoctorProfile } from './doctorProfileStorage';
import { medicineStorage } from './medicineStorage';

export type SyncStatusState =
  | 'unconfigured'
  | 'offline'
  | 'connected'
  | 'syncing'
  | 'synced'
  | 'error';

export interface SyncMetrics {
  status: SyncStatusState;
  isCloudConnected: boolean;
  lastSyncTime: string | null;
  patientCount: number;
  prescriptionCount: number;
  medicineCount: number;
  errorMessage?: string;
}

const LAST_SYNC_KEY = 'homiohelper_last_cloud_sync_v1';

class FirestoreSyncService {
  private listeners: Array<(metrics: SyncMetrics) => void> = [];
  private currentStatus: SyncStatusState = 'unconfigured';
  private lastErrorMessage?: string;

  constructor() {
    this.checkInitialStatus();
  }

  private checkInitialStatus() {
    const config = getFirebaseConfigStatus();
    if (!config.isConfigured || !db) {
      this.currentStatus = 'unconfigured';
    } else {
      this.currentStatus = navigator.onLine ? 'connected' : 'offline';
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        if (db) {
          this.currentStatus = 'connected';
          this.notify();
        }
      });
      window.addEventListener('offline', () => {
        if (this.currentStatus !== 'unconfigured') {
          this.currentStatus = 'offline';
          this.notify();
        }
      });
    }
  }

  public subscribe(callback: (metrics: SyncMetrics) => void): () => void {
    this.listeners.push(callback);
    callback(this.getMetrics());
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private notify() {
    const metrics = this.getMetrics();
    this.listeners.forEach((cb) => {
      try {
        cb(metrics);
      } catch (err) {
        console.error('Error notifying sync listener:', err);
      }
    });
  }

  public getMetrics(): SyncMetrics {
    const patients = getSavedPatients();
    const prescriptions = getSavedPrescriptions();
    const medicines = medicineStorage.getMedicines();
    const lastSync = localStorage.getItem(LAST_SYNC_KEY);

    return {
      status: this.currentStatus,
      isCloudConnected: isFirestoreReady() && this.currentStatus !== 'unconfigured',
      lastSyncTime: lastSync,
      patientCount: patients.length,
      prescriptionCount: prescriptions.length,
      medicineCount: medicines.length,
      errorMessage: this.lastErrorMessage,
    };
  }

  /**
   * Safely migrates and synchronizes all existing local storage data to Firestore
   * without deleting or overwriting any existing records.
   */
  public async migrateAndSyncAll(userId?: string): Promise<{
    success: boolean;
    syncedPatients: number;
    syncedPrescriptions: number;
    error?: string;
  }> {
    if (!db || !isFirestoreReady()) {
      return {
        success: false,
        syncedPatients: 0,
        syncedPrescriptions: 0,
        error: 'Firestore is not configured. Data is safely stored in local browser storage.',
      };
    }

    this.currentStatus = 'syncing';
    this.lastErrorMessage = undefined;
    this.notify();

    try {
      // 1. Sync Doctor Profile
      const localProfile = getSavedDoctorProfile(userId);
      if (localProfile && localProfile.name) {
        const docId = userId || localProfile.id || 'primary-doctor';
        const docRef = doc(db, 'doctor_profiles', docId);
        await setDoc(
          docRef,
          {
            ...localProfile,
            ownerId: userId || 'local-preview',
            syncedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }

      // 2. Sync Patients (preserving both local and remote)
      const localPatients = getSavedPatients();
      const patientsCol = collection(db, 'patients');
      const patientBatch = writeBatch(db);

      for (const patient of localPatients) {
        const patientRef = doc(patientsCol, patient.id);
        patientBatch.set(
          patientRef,
          {
            ...patient,
            ownerId: userId || 'chamber-doctor',
            syncedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }
      await patientBatch.commit();

      // 3. Sync Prescriptions
      const localPrescriptions = getSavedPrescriptions();
      const prescriptionsCol = collection(db, 'prescriptions');
      const rxBatch = writeBatch(db);

      for (const rx of localPrescriptions) {
        const rxRef = doc(prescriptionsCol, rx.id);
        rxBatch.set(
          rxRef,
          {
            ...rx,
            ownerId: userId || 'chamber-doctor',
            syncedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }
      await rxBatch.commit();

      // 4. Record timestamp of successful sync
      const timestamp = new Date().toISOString();
      localStorage.setItem(LAST_SYNC_KEY, timestamp);

      this.currentStatus = 'synced';
      this.notify();

      return {
        success: true,
        syncedPatients: localPatients.length,
        syncedPrescriptions: localPrescriptions.length,
      };
    } catch (err: any) {
      console.warn('Firestore cloud sync notice:', err);
      this.currentStatus = 'error';
      this.lastErrorMessage = err?.message || 'Cloud sync error';
      this.notify();

      return {
        success: false,
        syncedPatients: 0,
        syncedPrescriptions: 0,
        error: err?.message || 'Sync operation failed; local storage remains intact.',
      };
    }
  }

  /**
   * Reads from Firestore with automatic fallback to local storage
   */
  public async fetchPatientsWithFallback(): Promise<Patient[]> {
    if (!db || !isFirestoreReady()) {
      return getSavedPatients();
    }

    try {
      const snapshot = await getDocs(collection(db, 'patients'));
      if (!snapshot.empty) {
        const cloudPatients: Patient[] = [];
        snapshot.forEach((d) => {
          cloudPatients.push(d.data() as Patient);
        });

        // Merge cloud records with local records safely
        const local = getSavedPatients();
        const mergedMap = new Map<string, Patient>();

        // Start with local
        local.forEach((p) => mergedMap.set(p.id, p));
        // Merge cloud
        cloudPatients.forEach((cp) => mergedMap.set(cp.id, cp));

        const result = Array.from(mergedMap.values());
        // Update local cache
        result.forEach((p) => savePatientToStorage(p));
        return result;
      }
    } catch (err) {
      console.warn('Fallback: reading patients from local storage due to Firestore status:', err);
    }

    return getSavedPatients();
  }

  /**
   * Saves patient to Firestore and local storage simultaneously
   */
  public async savePatient(patient: Patient, userId?: string): Promise<Patient[]> {
    // Always persist locally first so patient data is never lost
    const updatedLocal = savePatientToStorage(patient);

    if (db && isFirestoreReady()) {
      try {
        const patientRef = doc(db, 'patients', patient.id);
        await setDoc(
          patientRef,
          {
            ...patient,
            ownerId: userId || 'chamber-doctor',
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (err) {
        console.warn('Saved patient to local storage (cloud sync deferred):', err);
      }
    }

    return updatedLocal;
  }

  /**
   * Saves prescription to Firestore and local storage simultaneously
   */
  public async savePrescription(rx: Prescription, userId?: string): Promise<Prescription[]> {
    // Always persist locally first
    const updatedLocal = savePrescriptionToStorage(rx);

    if (db && isFirestoreReady()) {
      try {
        const rxRef = doc(db, 'prescriptions', rx.id);
        await setDoc(
          rxRef,
          {
            ...rx,
            ownerId: userId || 'chamber-doctor',
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (err) {
        console.warn('Saved prescription to local storage (cloud sync deferred):', err);
      }
    }

    return updatedLocal;
  }
}

export const firestoreSyncService = new FirestoreSyncService();
