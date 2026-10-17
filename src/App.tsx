import React, { useState, useEffect } from 'react';
import { NavigationTab, Patient, NotificationMessage } from './types';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { DoctorProfileProvider, useDoctorProfile } from './context/DoctorProfileContext';
import { AppLayout } from './components/layout/AppLayout';
import { NewPatientModal } from './components/modals/NewPatientModal';
import { AuthModal } from './components/modals/AuthModal';
import { DoctorProfileModal } from './components/modals/DoctorProfileModal';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { PatientsPage } from './pages/PatientsPage';
import { PatientHistoryPage } from './pages/PatientHistoryPage';
import { VisitsPage } from './pages/VisitsPage';
import { PrescriptionsPage } from './pages/PrescriptionsPage';
import { MedicinesPage } from './pages/MedicinesPage';
import { InventoryPage } from './pages/InventoryPage';
import { SalesDispensingPage } from './pages/SalesDispensingPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

import { getSavedPatients, savePatientToStorage } from './services/patientStorage';
import { PrescriptionPrintPage } from './components/prescription/PrescriptionPrintPage';

function HomioHelperApp() {
  const { t } = useLanguage();
  const { isProfileModalOpen, closeProfileModal } = useDoctorProfile();

  // Check if current view is dedicated print mode (e.g. ?print=true or #print)
  const [isPrintMode, setIsPrintMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return params.get('print') === 'true' || window.location.hash === '#print';
  });

  useEffect(() => {
    const checkPrintMode = () => {
      const params = new URLSearchParams(window.location.search);
      setIsPrintMode(params.get('print') === 'true' || window.location.hash === '#print');
    };
    window.addEventListener('popstate', checkPrintMode);
    window.addEventListener('hashchange', checkPrintMode);
    return () => {
      window.removeEventListener('popstate', checkPrintMode);
      window.removeEventListener('hashchange', checkPrintMode);
    };
  }, []);

  // Active navigation tab
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');

  // Patients registered in clinic database (persisted via patientStorage)
  const [patients, setPatients] = useState<Patient[]>(() => getSavedPatients());

  // Selected patient for history or consultation view
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // New Patient Modal state
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);

  // Auth Modal state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Flash notification state
  const [notification, setNotification] = useState<NotificationMessage | null>(null);

  // Compute next registration number
  const nextRegNo = `HOM-${1001 + patients.length}`;

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  // Handle URL hash navigation if user uses browser history / direct links
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as NavigationTab;
      const validTabs: NavigationTab[] = [
        'dashboard',
        'patients',
        'patient-history',
        'visits',
        'prescriptions',
        'medicines',
        'inventory',
        'sales-dispensing',
        'reports',
        'settings',
      ];
      if (validTabs.includes(hash)) {
        setCurrentTab(hash);
      }
    };

    if (window.location.hash) {
      handleHashChange();
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleTabChange = (tab: NavigationTab) => {
    setCurrentTab(tab);
    window.location.hash = tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddPatient = (patient: Patient) => {
    savePatientToStorage(patient);
    setPatients((prev) => [patient, ...prev]);
    setSelectedPatientId(patient.id);
    setNotification({
      id: `notif-${Date.now()}`,
      type: 'success',
      title: t('patientsSuccessTitle'),
      message: `${patient.name} (${patient.regNo}) - ${t('patientsSuccessAdd')}`,
    });

    // Auto-dismiss notification after 5 seconds
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatientId(patient.id);
    handleTabChange('patient-history');
  };

  if (isPrintMode) {
    return <PrescriptionPrintPage onClose={() => setIsPrintMode(false)} />;
  }

  return (
    <>
      <AppLayout
        currentTab={currentTab}
        onSelectTab={handleTabChange}
        onOpenNewPatient={() => setIsNewPatientModalOpen(true)}
        onOpenAuthModal={() => handleOpenAuth('login')}
        totalPatientsCount={patients.length}
        notification={notification}
        onDismissNotification={() => setNotification(null)}
      >
        {currentTab === 'dashboard' && (
          <DashboardPage
            patients={patients}
            onNavigate={handleTabChange}
            onOpenNewPatient={() => setIsNewPatientModalOpen(true)}
            onSelectPatient={handleSelectPatient}
          />
        )}

        {currentTab === 'patients' && (
          <PatientsPage
            patients={patients}
            onOpenNewPatient={() => setIsNewPatientModalOpen(true)}
            onSelectPatient={handleSelectPatient}
            onNavigate={handleTabChange}
          />
        )}

        {currentTab === 'patient-history' && (
          <PatientHistoryPage
            patients={patients}
            selectedPatientId={selectedPatientId}
            onSelectPatient={(p) => setSelectedPatientId(p.id)}
            onNavigate={handleTabChange}
          />
        )}

        {currentTab === 'visits' && (
          <VisitsPage
            patients={patients}
            onNavigate={handleTabChange}
            onOpenNewPatient={() => setIsNewPatientModalOpen(true)}
          />
        )}

        {currentTab === 'prescriptions' && (
          <PrescriptionsPage
            patients={patients}
            onNavigate={handleTabChange}
            onOpenNewPatient={() => setIsNewPatientModalOpen(true)}
          />
        )}

        {currentTab === 'medicines' && (
          <MedicinesPage onNavigate={handleTabChange} />
        )}

        {currentTab === 'inventory' && (
          <InventoryPage onNavigate={handleTabChange} />
        )}

        {currentTab === 'sales-dispensing' && (
          <SalesDispensingPage onNavigate={handleTabChange} />
        )}

        {currentTab === 'reports' && (
          <ReportsPage onNavigate={handleTabChange} />
        )}

        {currentTab === 'settings' && (
          <SettingsPage onOpenAuthModal={handleOpenAuth} />
        )}
      </AppLayout>

      {/* Register New Patient Modal */}
      <NewPatientModal
        isOpen={isNewPatientModalOpen}
        onClose={() => setIsNewPatientModalOpen(false)}
        onAddPatient={handleAddPatient}
        nextRegNo={nextRegNo}
      />

      {/* Doctor & Staff Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authModalMode}
      />

      {/* Doctor & Chamber Profile Modal */}
      <DoctorProfileModal
        isOpen={isProfileModalOpen}
        onClose={closeProfileModal}
      />
    </>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <DoctorProfileProvider>
          <HomioHelperApp />
        </DoctorProfileProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
