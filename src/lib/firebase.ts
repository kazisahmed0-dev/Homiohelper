import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import appletConfig from '../../firebase-applet-config.json';

/**
 * Firebase Configuration for HomioHelper
 * Loaded from firebase-applet-config.json with Vite environment variable fallbacks.
 */
const firebaseConfig = {
  apiKey: appletConfig.apiKey || import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: appletConfig.authDomain || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: appletConfig.projectId || import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: appletConfig.storageBucket || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: appletConfig.messagingSenderId || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: appletConfig.appId || import.meta.env.VITE_FIREBASE_APP_ID,
};

const databaseId: string | undefined = appletConfig.firestoreDatabaseId || undefined;

export interface FirebaseConfigStatus {
  isConfigured: boolean;
  isFirestoreAvailable: boolean;
  projectId?: string;
  databaseId?: string;
  missingKeys: string[];
}

/**
 * Checks whether the environment has supplied valid Firebase configuration.
 */
export function getFirebaseConfigStatus(): FirebaseConfigStatus {
  const missing: string[] = [];
  if (!firebaseConfig.apiKey) missing.push('VITE_FIREBASE_API_KEY');
  if (!firebaseConfig.authDomain) missing.push('VITE_FIREBASE_AUTH_DOMAIN');
  if (!firebaseConfig.projectId) missing.push('VITE_FIREBASE_PROJECT_ID');
  if (!firebaseConfig.appId) missing.push('VITE_FIREBASE_APP_ID');

  const configured = missing.length === 0;

  return {
    isConfigured: configured,
    isFirestoreAvailable: configured && Boolean(db),
    projectId: firebaseConfig.projectId,
    databaseId: databaseId,
    missingKeys: missing,
  };
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

const initialStatus = getFirebaseConfigStatus();

if (initialStatus.isConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    // CRITICAL: Mount on specific Firestore database ID provisioned for this applet
    db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
    console.info('HomioHelper: Connected to Cloud Firestore in project', firebaseConfig.projectId);
  } catch (error) {
    console.error('Firebase/Firestore initialization error:', error);
  }
} else {
  // In development / local offline mode before credentials are provided
  if (import.meta.env.DEV) {
    console.info(
      'HomioHelper Database: Operating in local offline-first mode (localStorage). Missing env keys:',
      initialStatus.missingKeys
    );
  }
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo:
        auth?.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export { app, auth, db, firebaseConfig };
export const isFirebaseConfigured = initialStatus.isConfigured;
export const isFirestoreReady = () => Boolean(db);
