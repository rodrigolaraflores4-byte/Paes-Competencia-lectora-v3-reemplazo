import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { ChangePasswordModal } from './components/common/ChangePasswordModal.js';
import { TextBank } from './components/teacher/TextBank.js';
import { AssignmentsManager } from './components/teacher/AssignmentsManager.js';
import { StudentsManager } from './components/teacher/StudentsManager.js';
import { AnalyticsDashboard } from './components/teacher/AnalyticsDashboard.js';
import { SupabaseSettings } from './components/teacher/SupabaseSettings.js';
import { VocabularyManager } from './components/teacher/VocabularyManager.js';
import { SyncBadge } from './components/common/SyncBadge.js';
import { StudentDashboard } from './components/student/StudentDashboard.js';
import { LoginPage } from './components/auth/LoginPage.js';
import { api } from './api/client.js';
import { 
  BookOpen, 
  Layers, 
  Users, 
  BarChart3, 
  BookMarked,
  Database, 
  GraduationCap, 
  UserCheck, 
  Sparkles,
  LogOut,
  KeyRound,
  Eye,
  ArrowLeft
} from 'lucide-react';

type TeacherTab = 'bank' | 'assignments' | 'students' | 'vocab' | 'analytics' | 'supabase';

function MainApp() {
  const { 
    currentUser, 
    isTeacher, 
    isStudent, 
    loading, 
    logout, 
    switchUser, 
    returnToTeacherSession, 
    impersonatingFromTeacher 
  } = useAuth();
  const [teacherTab, setTeacherTab] = useState<TeacherTab>('bank');
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [switchingToStudent, setSwitchingToStudent] = useState(false);

  const handleQuickStudentView = async () => {
    setSwitchingToStudent(true);
    try {
      const res = await api.getStudents();
      if (res.students && res.students.length > 0) {
        await switchUser(res.students[0].id, true);
      } else {
        setTeacherTab('students');
        alert('Aún no tienes estudiantes en la base. Registra un estudiante o carga un CSV para probar la interfaz como alumno.');
      }
    } catch (err: any) {
      alert(err.message || 'Error al obtener estudiantes');
    } finally {
      setSwitchingToStudent(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-700 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-stone-700">Cargando PAES Lector...</p>
        </div>
      </div>
    );
  }

  // Si no hay sesión iniciada, mostrar la pantalla de Login con correo/RUT y contraseña
  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans-ui text-stone-900">
      {/* Top Navbar */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40 shadow-xs backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-800 text-white flex items-center justify-center font-bold text-lg shadow-xs">
              <BookOpen className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base sm:text-lg tracking-tight text-stone-900">
                  PAES Lector
                </span>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded uppercase">
                  DEMRE
                </span>
              </div>
              <p className="text-[11px] text-stone-500 hidden sm:block">
                Preparación Competencia Lectora · Enseñanza Media
              </p>
            </div>
          </div>

          {/* User profile, Change Password & Logout buttons */}
          <div className="flex items-center gap-2">
            {isTeacher && <SyncBadge onClick={() => setTeacherTab('supabase')} />}

            {/* Quick Student View for Teacher */}
            {isTeacher && (
              <button
                onClick={handleQuickStudentView}
                disabled={switchingToStudent}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 transition-colors text-xs font-bold shadow-2xs cursor-pointer"
                title="Probar la plataforma desde la sesión de un estudiante para ver cómo funciona su interfaz"
              >
                <Eye className="w-3.5 h-3.5 text-amber-800" />
                <span className="hidden md:inline">{switchingToStudent ? 'Cargando...' : 'Vista Alumno'}</span>
              </button>
            )}

            {/* Change Password Button */}
            <button
              onClick={() => setChangePasswordOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-amber-200/80 bg-amber-50/70 hover:bg-amber-100 text-amber-900 transition-colors text-xs font-semibold"
              title="Cambiar mi contraseña personal"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-800" />
              <span className="hidden lg:inline text-[11px]">Cambiar Clave</span>
            </button>

            {/* Current Active User Pill (Clickable to change password) */}
            <button
              onClick={() => setChangePasswordOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs transition-colors text-left"
              title="Clic para cambiar contraseña o ver perfil"
            >
              <div className={`w-6 h-6 rounded-md text-white flex items-center justify-center font-bold text-[11px] ${
                isTeacher ? 'bg-amber-800' : 'bg-stone-800'
              }`}>
                {isTeacher ? 'D' : 'E'}
              </div>
              <div className="text-left hidden sm:block">
                <div className="font-semibold truncate max-w-[140px]">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-stone-500">
                  {isTeacher ? 'Docente' : (currentUser.rut ? `RUT: ${currentUser.rut}` : 'Estudiante')}
                </div>
              </div>
            </button>

            {/* Logout Button */}
            <button
              onClick={() => logout()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-700 bg-red-50/70 hover:bg-red-100 transition-colors text-xs font-semibold"
              title="Cerrar la sesión actual"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>

        {/* Teacher Navigation Tabs (only shown for teachers) */}
        {isTeacher && (
          <div className="bg-stone-50 border-t border-stone-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 flex overflow-x-auto no-scrollbar gap-1 sm:gap-2 py-1.5">
              <button
                onClick={() => setTeacherTab('bank')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                  teacherTab === 'bank'
                    ? 'bg-amber-700 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Banco de Textos</span>
              </button>

              <button
                onClick={() => setTeacherTab('assignments')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                  teacherTab === 'assignments'
                    ? 'bg-amber-700 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Ensayos y Actividades</span>
              </button>

              <button
                onClick={() => setTeacherTab('students')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                  teacherTab === 'students'
                    ? 'bg-amber-700 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Base de Estudiantes</span>
              </button>

              <button
                onClick={() => setTeacherTab('vocab')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                  teacherTab === 'vocab'
                    ? 'bg-amber-700 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
              >
                <BookMarked className="w-3.5 h-3.5" />
                <span>Vocabulario</span>
              </button>

              <button
                onClick={() => setTeacherTab('analytics')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                  teacherTab === 'analytics'
                    ? 'bg-amber-700 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Analítica y Resultados</span>
              </button>

              <button
                onClick={() => setTeacherTab('supabase')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                  teacherTab === 'supabase'
                    ? 'bg-amber-700 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>Persistencia Supabase</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Impersonation Banner when Teacher is exploring as Student */}
      {impersonatingFromTeacher && (
        <div className="bg-amber-900 text-amber-50 px-4 py-2.5 text-xs font-semibold shadow-md flex items-center justify-between gap-4 sticky top-16 z-30">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-300 shrink-0 animate-pulse" />
            <span>
              <strong>Modo Vista de Alumno:</strong> Estás explorando la plataforma en la sesión de <strong>{currentUser.name}</strong> ({currentUser.rut ? `RUT ${currentUser.rut}` : currentUser.email}). Puedes ensayar, revisar habilidades y practicar vocabulario.
            </span>
          </div>
          <button
            onClick={returnToTeacherSession}
            className="px-3.5 py-1.5 bg-amber-950 hover:bg-black text-amber-200 hover:text-white rounded-lg text-xs font-bold shrink-0 flex items-center gap-1.5 border border-amber-600/60 transition-colors shadow-2xs cursor-pointer"
            title="Volver inmediatamente a tu cuenta de Docente"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a Vista Docente</span>
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {isTeacher ? (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={teacherTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              {teacherTab === 'bank' && <TextBank />}
              {teacherTab === 'assignments' && <AssignmentsManager />}
              {teacherTab === 'students' && <StudentsManager />}
              {teacherTab === 'vocab' && <VocabularyManager />}
              {teacherTab === 'analytics' && <AnalyticsDashboard />}
              {teacherTab === 'supabase' && <SupabaseSettings />}
            </motion.div>
          </AnimatePresence>
        ) : (
          <StudentDashboard />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-4 px-4 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            <strong>PAES Lector</strong> · Sistema de Preparación para la Competencia Lectora DEMRE en Enseñanza Media
          </span>
          <div className="flex items-center gap-3 text-[11px]">
            <span>Habilidades: Localizar · Interpretar y Relacionar · Evaluar</span>
            <span>·</span>
            <span>Persistencia Servidor Activa</span>
          </div>
        </div>
      </footer>

      {/* Change Password Modal */}
      <ChangePasswordModal
        currentUser={currentUser}
        isOpen={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
