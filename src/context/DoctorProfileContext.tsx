import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DoctorProfile } from '../types';
import { useAuth } from './AuthContext';
import {
  getSavedDoctorProfile,
  saveDoctorProfile,
  isDoctorProfileComplete,
  INITIAL_PREVIEW_PROFILE,
} from '../services/doctorProfileStorage';

export interface DoctorProfileContextType {
  doctorProfile: DoctorProfile;
  isProfileComplete: boolean;
  updateDoctorProfile: (data: Partial<DoctorProfile>) => Promise<boolean>;
  isProfileModalOpen: boolean;
  openProfileModal: () => void;
  closeProfileModal: () => void;
}

const DoctorProfileContext = createContext<DoctorProfileContextType | undefined>(undefined);

export const DoctorProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile>(() => {
    return getSavedDoctorProfile(currentUser?.uid);
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // Reload or switch profile when auth state changes (login / logout)
  useEffect(() => {
    if (currentUser?.uid) {
      const saved = getSavedDoctorProfile(currentUser.uid);
      // If blank name, prefill from displayName or email
      if (!saved.name && currentUser.displayName) {
        saved.name = currentUser.displayName;
      }
      if (!saved.email && currentUser.email) {
        saved.email = currentUser.email;
      }
      saved.userId = currentUser.uid;
      setDoctorProfile(saved);
    } else {
      // Guest or preview session
      const savedGuest = getSavedDoctorProfile();
      setDoctorProfile(savedGuest || INITIAL_PREVIEW_PROFILE);
    }
  }, [currentUser]);

  const updateDoctorProfile = async (data: Partial<DoctorProfile>): Promise<boolean> => {
    try {
      const merged: DoctorProfile = {
        ...doctorProfile,
        ...data,
        userId: currentUser?.uid || doctorProfile.userId,
        updatedAt: new Date().toISOString(),
      };
      const saved = await saveDoctorProfile(merged);
      setDoctorProfile(saved);
      return true;
    } catch (err) {
      console.error('Failed to update doctor profile:', err);
      return false;
    }
  };

  const isComplete = isDoctorProfileComplete(doctorProfile);

  return (
    <DoctorProfileContext.Provider
      value={{
        doctorProfile,
        isProfileComplete: isComplete,
        updateDoctorProfile,
        isProfileModalOpen,
        openProfileModal: () => setIsProfileModalOpen(true),
        closeProfileModal: () => setIsProfileModalOpen(false),
      }}
    >
      {children}
    </DoctorProfileContext.Provider>
  );
};

export const useDoctorProfile = (): DoctorProfileContextType => {
  const context = useContext(DoctorProfileContext);
  if (!context) {
    throw new Error('useDoctorProfile must be used within a DoctorProfileProvider');
  }
  return context;
};
