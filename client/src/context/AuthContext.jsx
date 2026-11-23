import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setToken, getToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);

  // Check initial token on load
  useEffect(() => {
    async function loadUser() {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await api.getMe();
        if (data.user) {
          setUser(data.user);
          // If already logged in, onboarding is minimized by default, but user can always reopen it
          setShowOnboarding(false);
        }
      } catch (err) {
        console.warn('Session expired or invalid token:', err.message);
        setToken(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (email, password) => {
    const data = await api.login({ email, password });
    setToken(data.token);
    setUser(data.user);
    setShowOnboarding(false);
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  // Role permissions helper based strictly on PDF
  const role = user?.role || 'Guest';
  const permissions = {
    role,
    isAdmin: role === 'Admin',
    isResearcher: role === 'Researcher',
    isTechnician: role === 'Technician',
    isViewer: role === 'Viewer',
    
    // PDF rules:
    // Admin: Can do everything
    // Researcher: Register and edit samples, create transfers, write and edit notes, print labels
    // Technician: Scan QR codes, receive and store samples, update quantity & status, record transfers, print labels. CANNOT delete samples, edit others' experiment notes, manage users
    // Viewer: Read samples, storage, transfers, notes; view audit history; export reports. CANNOT create, edit or delete anything.
    canRegisterSample: ['Admin', 'Researcher', 'Technician'].includes(role),
    canEditSample: ['Admin', 'Researcher', 'Technician'].includes(role),
    canDeleteSample: role === 'Admin', // Strictly Admin only!
    canManageStorage: role === 'Admin', // Build storage structure
    canManageTeam: role === 'Admin',
    canCreateTransfer: ['Admin', 'Researcher', 'Technician'].includes(role),
    canApproveTransfer: role === 'Admin',
    canWriteExperiments: ['Admin', 'Researcher'].includes(role),
    canExportReports: ['Admin', 'Viewer', 'Researcher', 'Technician'].includes(role),
    isReadOnly: role === 'Viewer'
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      permissions,
      showOnboarding,
      setShowOnboarding
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
