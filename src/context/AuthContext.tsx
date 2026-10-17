import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  AuthError,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth';
import { auth, isFirebaseConfigured, getFirebaseConfigStatus } from '../lib/firebase';
import { validateAndFormatBDPhone } from '../lib/bangladeshPhone';

export interface DoctorRegistrationProfile {
  name?: string;
  qualification?: string;
  chamberName?: string;
  chamberAddress?: string;
  regNumber?: string;
  phone?: string;
  email?: string;
}

export interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  isConfigured: boolean;
  missingKeys: string[];
  // Primary Email + Password & Reset flows
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; user?: User; error?: string; errorCode?: string }>;
  registerDoctor: (
    email: string,
    password: string,
    doctorProfile?: DoctorRegistrationProfile
  ) => Promise<{ success: boolean; user?: User; error?: string; errorCode?: string }>;
  resetPassword: (
    email: string
  ) => Promise<{ success: boolean; error?: string; errorCode?: string }>;
  logout: () => Promise<void>;
  // Secondary / Phone helper methods (preserved for backward compatibility)
  sendPhoneOtp: (
    phoneNumber: string,
    containerOrId: string | HTMLElement,
    size?: 'normal' | 'invisible'
  ) => Promise<{
    success: boolean;
    confirmationResult?: ConfirmationResult;
    formattedPhone?: string;
    error?: string;
    errorCode?: string;
  }>;
  verifyPhoneOtp: (
    confirmationResult: ConfirmationResult,
    otpCode: string,
    doctorProfile?: DoctorRegistrationProfile
  ) => Promise<{
    success: boolean;
    user?: User;
    error?: string;
    errorCode?: string;
  }>;
  clearRecaptcha: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const configStatus = getFirebaseConfigStatus();
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    if (!auth || !isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setCurrentUser(user);
        setLoading(false);
      },
      (error) => {
        console.error('Firebase Auth state change error:', error);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
      clearRecaptcha();
    };
  }, []);

  const clearRecaptcha = () => {
    if (recaptchaVerifierRef.current) {
      try {
        recaptchaVerifierRef.current.clear();
      } catch (err) {
        console.warn('Error clearing reCAPTCHA verifier:', err);
      }
      recaptchaVerifierRef.current = null;
    }
  };

  /**
   * Signs in an existing practitioner using Email Address & Password.
   */
  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; user?: User; error?: string; errorCode?: string }> => {
    if (!auth || !isFirebaseConfigured) {
      return {
        success: false,
        error: 'Firebase is not yet configured with project API credentials.',
        errorCode: 'auth/config-missing',
      };
    }

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      return {
        success: false,
        error: 'Please enter your email address.',
        errorCode: 'auth/invalid-email',
      };
    }
    if (!password) {
      return {
        success: false,
        error: 'Please enter your password.',
        errorCode: 'auth/missing-password',
      };
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
      setCurrentUser(cred.user);
      return {
        success: true,
        user: cred.user,
      };
    } catch (err: unknown) {
      const error = err as AuthError;
      console.warn('Firebase signInWithEmailAndPassword code:', error.code, error.message);
      return {
        success: false,
        error: error.message,
        errorCode: error.code,
      };
    }
  };

  /**
   * Registers a new authorized practitioner account with Email, Password, and Profile.
   */
  const registerDoctor = async (
    email: string,
    password: string,
    doctorProfile?: DoctorRegistrationProfile
  ): Promise<{ success: boolean; user?: User; error?: string; errorCode?: string }> => {
    if (!auth || !isFirebaseConfigured) {
      return {
        success: false,
        error: 'Firebase is not yet configured with project API credentials.',
        errorCode: 'auth/config-missing',
      };
    }

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      return {
        success: false,
        error: 'Please enter an email address.',
        errorCode: 'auth/invalid-email',
      };
    }
    if (!password || password.length < 6) {
      return {
        success: false,
        error: 'Password must be at least 6 characters.',
        errorCode: 'auth/weak-password',
      };
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const user = cred.user;

      if (doctorProfile?.name && user) {
        try {
          await updateProfile(user, { displayName: doctorProfile.name.trim() });
        } catch (profileErr) {
          console.warn('Could not set displayName on Firebase Auth user:', profileErr);
        }
      }

      setCurrentUser(user);
      return {
        success: true,
        user,
      };
    } catch (err: unknown) {
      const error = err as AuthError;
      console.warn('Firebase createUserWithEmailAndPassword code:', error.code, error.message);
      return {
        success: false,
        error: error.message,
        errorCode: error.code,
      };
    }
  };

  /**
   * Sends a password reset link to the doctor's email via Firebase Auth.
   */
  const resetPassword = async (
    email: string
  ): Promise<{ success: boolean; error?: string; errorCode?: string }> => {
    if (!auth || !isFirebaseConfigured) {
      return {
        success: false,
        error: 'Firebase is not yet configured with project API credentials.',
        errorCode: 'auth/config-missing',
      };
    }

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      return {
        success: false,
        error: 'Please enter your registered email address.',
        errorCode: 'auth/invalid-email',
      };
    }

    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      return { success: true };
    } catch (err: unknown) {
      const error = err as AuthError;
      console.warn('Firebase sendPasswordResetEmail code:', error.code, error.message);
      return {
        success: false,
        error: error.message,
        errorCode: error.code,
      };
    }
  };

  /**
   * Signs the user out of Firebase Auth.
   */
  const logout = async (): Promise<void> => {
    clearRecaptcha();
    if (auth && isFirebaseConfigured) {
      try {
        await signOut(auth);
      } catch (err) {
        console.warn('Sign out error:', err);
      }
    }
    setCurrentUser(null);
  };

  /**
   * Phone OTP support (preserved)
   */
  const sendPhoneOtp = async (
    phoneNumber: string,
    containerOrId: string | HTMLElement,
    size: 'normal' | 'invisible' = 'normal'
  ): Promise<{
    success: boolean;
    confirmationResult?: ConfirmationResult;
    formattedPhone?: string;
    error?: string;
    errorCode?: string;
  }> => {
    if (!auth || !isFirebaseConfigured) {
      return {
        success: false,
        error: 'CONFIG_MISSING',
        errorCode: 'auth/config-missing',
      };
    }

    const validation = validateAndFormatBDPhone(phoneNumber);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error || 'Invalid Bangladeshi mobile number',
        errorCode: 'auth/invalid-phone-number',
      };
    }

    const e164Phone = validation.formattedE164;

    try {
      clearRecaptcha();
      const verifier = new RecaptchaVerifier(auth, containerOrId, {
        size: size,
        callback: () => {},
        'expired-callback': () => {
          console.warn('reCAPTCHA expired. User should retry.');
        },
      });

      recaptchaVerifierRef.current = verifier;
      await verifier.render();

      const confirmationResult = await signInWithPhoneNumber(auth, e164Phone, verifier);

      return {
        success: true,
        confirmationResult,
        formattedPhone: validation.formattedDisplay,
      };
    } catch (err: unknown) {
      const error = err as AuthError;
      console.error('Firebase signInWithPhoneNumber error:', error);
      clearRecaptcha();
      return {
        success: false,
        error: error.message || 'SMS OTP failed to dispatch',
        errorCode: error.code,
      };
    }
  };

  const verifyPhoneOtp = async (
    confirmationResult: ConfirmationResult,
    otpCode: string,
    doctorProfile?: DoctorRegistrationProfile
  ): Promise<{
    success: boolean;
    user?: User;
    error?: string;
    errorCode?: string;
  }> => {
    if (!otpCode || otpCode.trim().length < 6) {
      return {
        success: false,
        error: 'Please enter the 6-digit verification code',
        errorCode: 'auth/invalid-verification-code',
      };
    }

    try {
      const userCredential = await confirmationResult.confirm(otpCode.trim());
      const user = userCredential.user;

      if (doctorProfile?.name && user) {
        try {
          await updateProfile(user, { displayName: doctorProfile.name.trim() });
        } catch (updateErr) {
          console.warn('Could not update user display name:', updateErr);
        }
      }

      setCurrentUser(user);
      clearRecaptcha();

      return {
        success: true,
        user,
      };
    } catch (err: unknown) {
      const error = err as AuthError;
      console.error('Firebase verify OTP error:', error);
      return {
        success: false,
        error: error.message || 'Invalid or expired OTP',
        errorCode: error.code,
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        isConfigured: isFirebaseConfigured,
        missingKeys: configStatus.missingKeys,
        login,
        registerDoctor,
        resetPassword,
        logout,
        sendPhoneOtp,
        verifyPhoneOtp,
        clearRecaptcha,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
