import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index.js';
import { api } from '../api/client.js';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (identifier: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  switchUser: (userId: string, isImpersonation?: boolean) => Promise<void>;
  returnToTeacherSession: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isTeacher: boolean;
  isStudent: boolean;
  isAuthenticated: boolean;
  impersonatingFromTeacher: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      // Usar sessionStorage para la sesión activa de navegación:
      // Cuando alguien abre el dominio en una nueva ventana/pestaña, SIEMPRE verá la pantalla de inicio de sesión
      const activeSessionUserId = sessionStorage.getItem('paes_session_user_id');
      if (!activeSessionUserId) {
        // Ninguna sesión explícita en esta pestaña: debe iniciar sesión con su RUT/correo y clave
        setCurrentUser(null);
        setLoading(false);
        return;
      }

      const data = await api.getCurrentUser();
      if (data?.user && data.user.id === activeSessionUserId) {
        setCurrentUser(data.user);
      } else {
        sessionStorage.removeItem('paes_session_user_id');
        localStorage.removeItem('paes_session_user_id');
        setCurrentUser(null);
      }
    } catch (err) {
      console.error('Error fetching current user:', err);
      sessionStorage.removeItem('paes_session_user_id');
      localStorage.removeItem('paes_session_user_id');
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (identifier: string, password?: string) => {
    setLoading(true);
    try {
      const res = await api.login(identifier, password);
      setCurrentUser(res.user);
      sessionStorage.setItem('paes_session_user_id', res.user.id);
      localStorage.setItem('paes_session_user_id', res.user.id);
      // Limpiar cualquier impersonación previa al iniciar sesión explícita
      sessionStorage.removeItem('paes_impersonating_teacher_id');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.logout();
    } catch (err) {
      console.error(err);
    } finally {
      sessionStorage.removeItem('paes_session_user_id');
      sessionStorage.removeItem('paes_impersonating_teacher_id');
      localStorage.removeItem('paes_session_user_id');
      setCurrentUser(null);
      setLoading(false);
    }
  };

  const switchUser = async (userId: string, isImpersonation: boolean = false) => {
    setLoading(true);
    try {
      if (isImpersonation && currentUser?.role === 'docente') {
        sessionStorage.setItem('paes_impersonating_teacher_id', currentUser.id);
      }
      const data = await api.switchUser(userId);
      setCurrentUser(data.user);
      sessionStorage.setItem('paes_session_user_id', data.user.id);
      localStorage.setItem('paes_session_user_id', data.user.id);
    } catch (err) {
      console.error('Error switching user:', err);
    } finally {
      setLoading(false);
    }
  };

  const returnToTeacherSession = async () => {
    const teacherId = typeof window !== 'undefined' 
      ? (sessionStorage.getItem('paes_impersonating_teacher_id') || 'doc_1')
      : 'doc_1';
    
    sessionStorage.removeItem('paes_impersonating_teacher_id');
    await switchUser(teacherId, false);
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  const isTeacher = currentUser?.role === 'docente';
  const isStudent = currentUser?.role === 'estudiante';
  const isAuthenticated = Boolean(currentUser);
  const impersonatingFromTeacher = Boolean(
    isStudent && 
    typeof window !== 'undefined' && 
    sessionStorage.getItem('paes_impersonating_teacher_id')
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        login,
        logout,
        switchUser,
        returnToTeacherSession,
        refreshUser,
        isTeacher,
        isStudent,
        isAuthenticated,
        impersonatingFromTeacher,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
