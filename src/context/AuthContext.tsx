import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { authService, internService } from '../services/firebaseService';

interface AppUser {
  id: string;
  email: string;
  role: 'admin' | 'intern';
  name: string;
  uid: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        // Check if admin
        if (firebaseUser.email === 'divyanshpansari123@gmail.com') {
          setUser({
            id: 'admin',
            email: firebaseUser.email,
            role: 'admin',
            name: 'Divyansh Pansari',
            uid: firebaseUser.uid
          });
        } else {
          // Get intern data from Firestore using UID
          const internResult = await internService.getAllInterns();
          if (internResult.success) {
            const intern = internResult.data.find((i: any) => i.uid === firebaseUser.uid);
            if (intern) {
              setUser({
                id: intern.id,
                email: intern.email,
                role: 'intern',
                name: intern.name,
                uid: firebaseUser.uid
              });
            } else {
              console.error('Intern not found in database');
              setUser(null);
            }
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const result = await authService.login(email, password);
      if (result.success) {
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updatePassword = async (newPassword: string): Promise<boolean> => {
    try {
      const result = await authService.updatePassword(newPassword);
      return result.success;
    } catch (error) {
      console.error('Password update error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
};