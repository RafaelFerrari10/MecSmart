import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../../firebase/config';

interface UsuarioData {
  uid: string;
  nome: string;
  email: string;
  tipo: 'Mecanico' | 'Cliente' | 'Admin';
}

interface AuthContextType {
  user: User | null;
  userData: UsuarioData | null;
  loading: boolean;
  isAuthenticated: boolean;
  isMecanico: boolean;
  isAdmin: boolean;
  isCliente: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UsuarioData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'usuarios', currentUser.uid));
          if (userDoc.exists()) {
            setUserData({
              uid: currentUser.uid,
              ...userDoc.data()
            } as UsuarioData);
          }
        } catch (error) {
          console.error('Erro ao buscar dados do usuário:', error);
        }
      } else {
        setUserData(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    user,
    userData,
    loading,
    isAuthenticated: !!user,
    isMecanico: userData?.tipo === 'Mecanico',
    isAdmin: userData?.tipo === 'Admin',
    isCliente: userData?.tipo === 'Cliente',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}