import React, { createContext, useContext, useMemo, useState } from 'react';

type UserRole = 'user' | 'admin' | 'driver';

type UserProfile = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
};

type AuthContextValue = {
  isLoggedIn: boolean;
  role: UserRole | null;
  adminToken: string | null;
  driverToken: string | null;
  userEmail: string | null;
  userProfile: UserProfile | null;
  loginAsUser: (email: string, profile?: Partial<UserProfile>) => void;
  loginAsAdmin: (token: string) => void;
  loginAsDriver: (token: string, email: string) => void;
  setUserEmail: (email: string) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<UserRole | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [driverToken, setDriverToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const value = useMemo(
    () => ({
      isLoggedIn,
      role,
      adminToken,
      driverToken,
      userEmail,
      userProfile,
      loginAsUser: (email: string, profile?: Partial<UserProfile>) => {
        const normalizedEmail = email.trim().toLowerCase();

        setIsLoggedIn(true);
        setRole('user');
        setAdminToken(null);
        setDriverToken(null);
        setUserEmail(normalizedEmail);
        setUserProfile({
          fullName: profile?.fullName?.trim() || '',
          email: normalizedEmail,
          phone: profile?.phone?.trim() || '',
          address: profile?.address?.trim() || '',
        });
      },
      loginAsAdmin: (token: string) => {
        setIsLoggedIn(true);
        setRole('admin');
        setAdminToken(token);
        setDriverToken(null);
        setUserEmail(null);
        setUserProfile(null);
      },
      loginAsDriver: (token: string, email: string) => {
        setIsLoggedIn(true);
        setRole('driver');
        setDriverToken(token);
        setAdminToken(null);
        setUserEmail(email);
        setUserProfile(null);
      },
      setUserEmail: (email: string) => {
        const normalizedEmail = email.trim().toLowerCase();

        setUserEmail(normalizedEmail);
        setUserProfile((currentProfile) => ({
          fullName: currentProfile?.fullName || '',
          email: normalizedEmail,
          phone: currentProfile?.phone || '',
          address: currentProfile?.address || '',
        }));
      },
      updateUserProfile: (updates: Partial<UserProfile>) => {
        setUserProfile((currentProfile) => {
          const nextEmail =
            typeof updates.email === 'string'
              ? updates.email.trim().toLowerCase()
              : (currentProfile?.email || userEmail || '');

          const nextProfile: UserProfile = {
            fullName:
              typeof updates.fullName === 'string'
                ? updates.fullName.trim()
                : (currentProfile?.fullName || ''),
            email: nextEmail,
            phone:
              typeof updates.phone === 'string'
                ? updates.phone.trim()
                : (currentProfile?.phone || ''),
            address:
              typeof updates.address === 'string'
                ? updates.address.trim()
                : (currentProfile?.address || ''),
          };

          setUserEmail(nextEmail || null);
          return nextProfile;
        });
      },
      logout: () => {
        setIsLoggedIn(false);
        setRole(null);
        setAdminToken(null);
        setDriverToken(null);
        setUserEmail(null);
        setUserProfile(null);
      },
    }),
    [adminToken, driverToken, isLoggedIn, role, userEmail, userProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
