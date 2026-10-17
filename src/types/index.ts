export type NavigationTab =
  | 'dashboard'
  | 'patients'
  | 'patient-history'
  | 'visits'
  | 'prescriptions'
  | 'medicines'
  | 'inventory'
  | 'sales-dispensing'
  | 'reports'
  | 'settings';

export type Language = 'en' | 'bn';

export interface Patient {
  id: string;
  regNo: string;
  name: string;
  mobile: string;
  age: number | string;
  gender: 'male' | 'female' | 'other';
  bloodGroup?: string;
  district?: string;
  address?: string;
  chiefComplaint?: string;
  registeredAt: string;
  lastVisitAt?: string;
  totalVisits: number;
}

export interface Visit {
  id: string;
  patientId: string;
  patientName: string;
  patientRegNo: string;
  date: string;
  chiefComplaint: string;
  remedyPrescribed: string;
  potency: string;
  doseSchedule: string;
  status: 'completed' | 'in-consultation' | 'waiting';
  fee: number;
}

export interface DoctorProfile {
  id: string;
  userId?: string;
  name: string; // Required: Doctor's full name
  qualification: string; // Required: Professional designation or qualification
  chamberName: string; // Required: Chamber or clinic name
  chamberAddress: string; // Required: Chamber address
  regNumber?: string; // Optional: Medical registration number
  phone?: string; // Optional: Phone number
  email?: string; // Optional: Email address
  additionalInfo?: string; // Optional: Additional professional information
  logoUrl?: string; // Optional: Clinic logo URL or image
  updatedAt?: string;
}

export interface PrescribedRemedy {
  id: string;
  medicineName: string;
  potency: string;
  form?: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  // Optional specific instructions beneath medicine
  whenToTake?: string; // e.g., 'Morning & Night' / 'সকালে ও রাতে'
  howToTake?: string; // e.g., 'With 1/2 cup warm water' / 'আধা কাপ পানিতে'
  beforeAfterFood?: string; // e.g., '30 min before food' / 'খাবার ৩০ মিনিট আগে'
  additionalInstructions?: string; // e.g., 'Shake bottle well' / 'শিশি ভালো করে ঝাঁকান'
}

export interface Prescription {
  id: string;
  prescriptionNo: string;
  patientId: string;
  patientName: string;
  patientAge?: number | string;
  patientGender?: 'male' | 'female' | 'other';
  patientMobile?: string;
  patientRegNo?: string;
  patientAddress?: string;
  patientBloodGroup?: string;
  date: string;
  
  // Clinical Findings, History, Notes, Diagnosis & Procedures
  chiefComplaint?: string;
  patientHistory?: string; // Patient past history / miasmatic background
  clinicalNotes?: string; // Clinical findings & examination notes
  diagnosis?: string;
  procedures?: string; // Clinical procedures / modalities
  investigations?: string; // Recommended investigations / diagnostic tests
  
  // Vitals
  bp?: string;
  pulse?: string;
  weight?: string;
  temperature?: string;
  
  // Remedies
  remedies: PrescribedRemedy[];
  
  // Food Restrictions & Advice (blank by default, printed only when entered)
  foodsToAvoid?: string; // Foods to avoid / বর্জনীয় খাদ্য
  foodsPermitted?: string; // Foods permitted or recommended / অনুমোদিত খাদ্য
  generalPrecautions?: string; // General precautions / সাধারণ সতর্কতা
  additionalAdvice?: string; // Additional advice / অতিরিক্ত পরামর্শ
  dietRestrictions?: string; // preserved for backwards compatibility
  specialInstructions?: string; // preserved for backwards compatibility
  warning?: string; // Optional warning entered by doctor; blank by default
  followUpDate?: string;
  doctorProfile?: DoctorProfile;
  createdAt?: string;
}

export type MedicineCategory =
  | 'dilution'
  | 'mother_tincture'
  | 'biochemic'
  | 'trituration'
  | 'patent'
  | string;

export interface Medicine {
  id: string;
  name: string; // English / Latin standard (required)
  nameBn?: string; // Bengali medicine name (optional)
  commonName?: string; // Common name or description (optional)
  category: MedicineCategory;
  availablePotencies: string[]; // e.g. ['Q', '30C', '200C', '1M']
  form?: 'liquid' | 'globules' | 'tablets' | 'powder' | 'ointment' | string;
  packSize?: string; // e.g. '30ml', '100ml', '1 Dram', '100g'
  stockQuantity: number;
  unit: string;
  reorderLevel: number;
  rackLocation?: string;
  notes?: string;
  status?: 'active' | 'archived';
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
}
