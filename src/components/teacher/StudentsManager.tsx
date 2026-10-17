import React, { useState, useEffect } from 'react';
import { api } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.js';
import { User } from '../../types/index.js';
import { cleanRut, formatRut } from '../../utils/rut.js';
import { 
  Users, 
  UserPlus, 
  Upload, 
  Search, 
  Check, 
  AlertCircle, 
  FileSpreadsheet, 
  Lock, 
  KeyRound, 
  Trash2, 
  Download, 
  RefreshCw, 
  Database, 
  FileDown, 
  CheckCircle2, 
  HelpCircle,
  FolderUp,
  Copy,
  UploadCloud,
  Eye,
  X
} from 'lucide-react';

export const StudentsManager: React.FC = () => {
  const { switchUser } = useAuth();
  const [students, setStudents] = useState<User[]>([]);
  const [studentStats, setStudentStats] = useState<Record<string, { attempts: number; avg: number; paes: number }>>({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Single student modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRut, setNewRut] = useState('');
  const [newPassword, setNewPassword] = useState('PAES2026');
  const [savingSingle, setSavingSingle] = useState(false);
  const [copiedPasswordId, setCopiedPasswordId] = useState<string | null>(null);
  const [syncingSupabase, setSyncingSupabase] = useState(false);

  // CSV Import modal
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [csvContent, setCsvContent] = useState('');
  const [importingCsv, setImportingCsv] = useState(false);

  // Reset student password modal
  const [resetModalStudent, setResetModalStudent] = useState<User | null>(null);
  const [resetPasswordValue, setResetPasswordValue] = useState('PAES2026');
  const [resettingPassword, setResettingPassword] = useState(false);

  // Delete student modal
  const [deleteConfirmStudent, setDeleteConfirmStudent] = useState<User | null>(null);
  const [deletingStudent, setDeletingStudent] = useState(false);

  // Clear demo / all students modal
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [clearMode, setClearMode] = useState<'demo' | 'all'>('demo');
  const [clearingStudents, setClearingStudents] = useState(false);

  // Restore demo students
  const [restoringDemo, setRestoringDemo] = useState(false);

  // Backup & export modal
  const [backupModalOpen, setBackupModalOpen] = useState(false);
  const [restoringBackup, setRestoringBackup] = useState(false);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sRes, anRes] = await Promise.all([
        api.getStudents(),
        api.getAnalytics(),
      ]);
      setStudents(sRes.students);

      // Map student performance stats
      if (anRes.analytics?.studentStats) {
        const statsMap: Record<string, { attempts: number; avg: number; paes: number }> = {};
        anRes.analytics.studentStats.forEach(st => {
          statsMap[st.studentId] = {
            attempts: st.totalAttempts,
            avg: st.averageScore,
            paes: st.paesEstimated,
          };
        });
        setStudentStats(statsMap);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleViewAsStudent = async (student: User) => {
    try {
      await switchUser(student.id, true);
    } catch (err: any) {
      alert(err.message || 'Error al ingresar a la sesión del estudiante');
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSingle(true);
    try {
      const cleanR = cleanRut(newRut);
      const formattedRut = cleanR ? formatRut(cleanR) : undefined;
      const generatedEmail = newEmail.trim() || `${(cleanR || 'estudiante_' + Date.now()).toLowerCase()}@estudiantes.cl`;
      const finalPassword = newPassword.trim() || 'PAES2026';

      await api.createStudent({
        name: newName.trim(),
        email: generatedEmail,
        rut: formattedRut,
        course_id: 'general',
        password: finalPassword,
      });

      setFeedback({ 
        type: 'success', 
        message: `Estudiante ${newName.trim()} matriculado exitosamente en la base completa. Acceso: RUT ${formattedRut || generatedEmail} · Clave: ${finalPassword}` 
      });
      setAddModalOpen(false);
      setNewName('');
      setNewEmail('');
      setNewRut('');
      setNewPassword('PAES2026');
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSavingSingle(false);
    }
  };

  const handleSyncSupabase = async () => {
    setSyncingSupabase(true);
    try {
      const res = await api.syncPushToSupabase();
      setFeedback({ 
        type: 'success', 
        message: res.message || 'Nómina y evaluaciones respaldadas exitosamente en la base de datos Supabase.' 
      });
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error al respaldar en Supabase' });
    } finally {
      setSyncingSupabase(false);
    }
  };

  const copyPassword = (pwd: string, id: string) => {
    navigator.clipboard.writeText(pwd);
    setCopiedPasswordId(id);
    setTimeout(() => setCopiedPasswordId(null), 2000);
  };

  const handleImportCsv = async (e: React.FormEvent) => {
    e.preventDefault();
    setImportingCsv(true);
    try {
      const res = await api.importStudentsCsv(csvContent, '');
      setFeedback({
        type: 'success',
        message: `Importación exitosa: ${res.importedCount} estudiantes incorporados a la lista.`,
      });
      setCsvModalOpen(false);
      setCsvContent('');
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setImportingCsv(false);
    }
  };

  const handleLoadCsvTemplate = () => {
    setCsvContent(
`Nombre;Email;RUT
Matías Valenzuela;matias.valenzuela@estudiantes.cl;21.456.789-3
Camila Araya;camila.araya@estudiantes.cl;21.678.901-5
Nicolás Castillo;nicolas.castillo@estudiantes.cl;21.890.123-K`
    );
  };

  const handleResetStudentPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalStudent) return;
    setResettingPassword(true);
    try {
      const res = await api.resetStudentPassword(resetModalStudent.id, resetPasswordValue);
      setFeedback({
        type: 'success',
        message: res.message || `Contraseña de ${resetModalStudent.name} actualizada a "${resetPasswordValue}".`,
      });
      setResetModalStudent(null);
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error al actualizar contraseña' });
    } finally {
      setResettingPassword(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!deleteConfirmStudent) return;
    setDeletingStudent(true);
    try {
      const res = await api.deleteStudent(deleteConfirmStudent.id);
      setFeedback({ type: 'success', message: res.message });
      setDeleteConfirmStudent(null);
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error al eliminar estudiante' });
    } finally {
      setDeletingStudent(false);
    }
  };

  const handleClearStudents = async () => {
    setClearingStudents(true);
    try {
      const res = clearMode === 'demo' ? await api.clearDemoStudents() : await api.clearAllStudents();
      setFeedback({ type: 'success', message: res.message });
      setClearModalOpen(false);
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error al limpiar estudiantes' });
    } finally {
      setClearingStudents(false);
    }
  };

  const handleRestoreDemo = async () => {
    setRestoringDemo(true);
    try {
      const res = await api.restoreDemoStudents();
      setFeedback({ type: 'success', message: res.message });
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Error al restaurar demo' });
    } finally {
      setRestoringDemo(false);
    }
  };

  const handleDownloadBackup = () => {
    window.location.href = '/api/backup/export';
  };

  const handleDownloadCsv = () => {
    window.location.href = '/api/export/csv';
  };

  const handleRestoreBackupFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRestoringBackup(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const res = await api.restoreBackup(parsed);
      setFeedback({ type: 'success', message: res.message || 'Copia de seguridad restaurada correctamente.' });
      setBackupModalOpen(false);
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: 'Archivo de respaldo inválido: ' + (err.message || 'Formato no soportado') });
    } finally {
      setRestoringBackup(false);
      if (e.target) e.target.value = '';
    }
  };

  const filteredStudents = students.filter(st => {
    if (search) {
      const q = search.toLowerCase();
      return (
        st.name.toLowerCase().includes(q) ||
        (st.rut && st.rut.toLowerCase().includes(q)) ||
        st.email.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {feedback && (
        <div
          className={`p-3 rounded-lg text-xs font-medium flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="font-bold">×</button>
        </div>
      )}

      {/* Header and Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-700" />
              Base Completa de Estudiantes
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-200">
              {students.length} {students.length === 1 ? 'estudiante' : 'estudiantes'}
            </span>
          </div>
          <p className="text-xs text-stone-600 mt-1">
            Nómina global unificada de alumnos (sin separación de cursos). Cada estudiante accede con su RUT y clave.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sincronizar con Supabase */}
          <button
            onClick={handleSyncSupabase}
            disabled={syncingSupabase}
            className="px-3.5 py-2 border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
            title="Respaldar de inmediato la lista de estudiantes y sus progresos en la base de datos Supabase"
          >
            <UploadCloud className={`w-4 h-4 text-emerald-700 ${syncingSupabase ? 'animate-bounce' : ''}`} />
            <span>{syncingSupabase ? 'Sincronizando...' : 'Respaldar en Supabase'}</span>
          </button>

          {/* Quick Backup & Export */}
          <button
            onClick={() => setBackupModalOpen(true)}
            className="px-3 py-2 border border-stone-300 hover:bg-stone-50 text-stone-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            title="Copia de seguridad y exportación de datos"
          >
            <Database className="w-3.5 h-3.5 text-stone-600" />
            <span>Exportar JSON/CSV</span>
          </button>

          {/* Clean / Manage Demo Students */}
          {students.some(s => s.email.includes('@colegio-demo.cl') || s.id.startsWith('est_0')) ? (
            <button
              onClick={() => {
                setClearMode('demo');
                setClearModalOpen(true);
              }}
              className="px-3 py-2 border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Borrar estudiantes de prueba para dejar la lista lista para tus alumnos reales"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-600" />
              <span>Borrar Alumnos de Prueba</span>
            </button>
          ) : (
            <button
              onClick={handleRestoreDemo}
              disabled={restoringDemo}
              className="px-3 py-2 border border-stone-200 hover:bg-stone-50 text-stone-600 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Restaurar los alumnos de demostración ficticios para pruebas"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-stone-500 ${restoringDemo ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Cargar</span> Demo
            </button>
          )}

          {/* Import CSV */}
          <button
            onClick={() => setCsvModalOpen(true)}
            className="px-3.5 py-2 border border-amber-300 bg-amber-50/70 hover:bg-amber-100 text-amber-900 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Upload className="w-4 h-4 text-amber-800" />
            <span>Importar CSV</span>
          </button>

          {/* Register Single Student */}
          <button
            onClick={() => setAddModalOpen(true)}
            className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs sm:text-sm font-bold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Matricular Alumno</span>
          </button>
        </div>
      </div>

      {/* Student Credentials and Password Info Banner */}
      <div className="bg-amber-50/80 border border-amber-200/90 rounded-xl p-4.5 flex items-start gap-3.5 shadow-2xs">
        <KeyRound className="w-5 h-5 text-amber-800 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="font-bold text-amber-950 text-sm">
            Credenciales de Acceso para Estudiantes
          </div>
          <p className="text-amber-900 leading-relaxed">
            • <strong>Usuario:</strong> Cada estudiante ingresa con su <strong>RUT chileno</strong> (ej: <code>21.456.789-3</code> o <code>214567893</code>) o con su correo electrónico.<br />
            • <strong>Contraseña Estándar:</strong> La clave inicial establecida para los alumnos es <strong>PAES2026</strong>. Puedes ver la clave individual de cada alumno en la columna «Clave de Acceso» de la nómina o restablecerla con el botón «Cambiar clave».
          </p>
        </div>
      </div>

      {/* Empty State Banner if no students */}
      {students.length === 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-emerald-950">¡Nómina lista para tus estudiantes reales!</h3>
          <p className="text-xs text-emerald-800 max-w-lg mx-auto">
            No hay estudiantes ficticios en el sistema. Puedes matricular a tus alumnos uno a uno con el botón <strong>«+ Registrar Alumno»</strong> o subir la lista completa de tu curso en segundos con <strong>«Importar CSV»</strong>.
          </p>
        </div>
      )}

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, RUT o correo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600"
          />
        </div>
        <div className="text-xs text-stone-500 font-medium">
          Mostrando {filteredStudents.length} de {students.length} estudiantes
        </div>
      </div>

      {/* Unified Students Table */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase font-semibold">
              <tr>
                <th className="px-4 py-3">Nombre del Estudiante</th>
                <th className="px-4 py-3">RUT Chileno</th>
                <th className="px-4 py-3">Correo Institucional</th>
                <th className="px-4 py-3">Clave de Acceso</th>
                <th className="px-4 py-3 text-center">Ensayos</th>
                <th className="px-4 py-3 text-center">Promedio</th>
                <th className="px-4 py-3 text-center">Escala PAES Ref.</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {filteredStudents.map(st => {
                const stat = studentStats[st.id] || { attempts: 0, avg: 0, paes: 150 };
                const stPassword = st.password || 'PAES2026';
                return (
                  <tr key={st.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="px-4 py-3 font-semibold text-stone-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-[11px] shrink-0">
                        {st.name.charAt(0)}
                      </div>
                      <span className="truncate max-w-[200px]">{st.name}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-stone-700">
                      {st.rut || 'Sin registrar'}
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      {st.email}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 font-bold text-[11px] select-all">
                          {stPassword}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyPassword(stPassword, st.id)}
                          className="p-1 hover:bg-stone-100 rounded text-stone-400 hover:text-stone-700 transition-colors"
                          title="Copiar contraseña al portapapeles"
                        >
                          {copiedPasswordId === st.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-stone-800">
                      {stat.attempts}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {stat.attempts > 0 ? (
                        <span className="font-bold text-stone-900">{stat.avg}%</span>
                      ) : (
                        <span className="text-stone-400">Sin ensayos</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {stat.attempts > 0 ? (
                        <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          {stat.paes} pts
                        </span>
                      ) : (
                        <span className="text-stone-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleViewAsStudent(st)}
                          className="px-2.5 py-1 rounded-md border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 transition-colors text-[11px] font-bold flex items-center gap-1 shadow-2xs"
                          title={`Ingresar a la sesión de ${st.name} para probar su interfaz, lecturas y vocabulario`}
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-800" />
                          <span>Ver como alumno</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setResetModalStudent(st);
                            setResetPasswordValue(st.password || 'PAES2026');
                          }}
                          className="px-2 py-1 rounded-md border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 transition-colors text-[11px] font-semibold flex items-center gap-1"
                          title={`Restablecer o cambiar la contraseña de ${st.name}`}
                        >
                          <KeyRound className="w-3 h-3 text-amber-700" />
                          <span className="hidden sm:inline">Clave</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmStudent(st)}
                          className="p-1 rounded-md border border-stone-200 bg-stone-50 hover:bg-red-50 hover:border-red-300 text-stone-400 hover:text-red-700 transition-colors"
                          title={`Eliminar a ${st.name} de la nómina`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Single Student Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-stone-200">
            <h3 className="text-lg font-bold text-stone-900 mb-1">
              Registrar Nuevo Estudiante
            </h3>
            <p className="text-xs text-stone-600 mb-4">
              Crea una cuenta individual para acceso por Correo o RUT
            </p>

            <form onSubmit={handleCreateStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Florencia Tapia Morales"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  RUT Chileno * (Estándar: 21.345.678-9)
                </label>
                <input
                  type="text"
                  placeholder="Ej: 21.345.678-9 o 213456789"
                  value={newRut}
                  onChange={e => {
                    const val = e.target.value;
                    const cleaned = cleanRut(val);
                    if (cleaned.length >= 8) {
                      setNewRut(formatRut(cleaned));
                    } else {
                      setNewRut(val);
                    }
                  }}
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 font-mono"
                  required
                />
                <span className="text-[11px] text-stone-500 mt-0.5 block">
                  El alumno usará este RUT para ingresar a la plataforma.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Correo Electrónico <span className="text-stone-400 font-normal lowercase">(opcional)</span>
                </label>
                <input
                  type="email"
                  placeholder="Ej: florencia.tapia@estudiantes.cl (opcional)"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600"
                />
                <span className="text-[11px] text-stone-500 mt-0.5 block">
                  Si lo dejas vacío, se auto-asignará automáticamente su RUT como identificador.
                </span>
              </div>


              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Contraseña Inicial de Acceso
                </label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 font-mono font-bold text-amber-900 bg-amber-50/50"
                  required
                />
                <span className="text-[11px] text-stone-500 mt-0.5 block">
                  Predeterminada: <strong>PAES2026</strong> (el alumno o tú pueden cambiarla en cualquier momento).
                </span>
              </div>

              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingSingle}
                  className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  {savingSingle ? 'Matriculando...' : 'Matricular Estudiante'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {csvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-stone-200">
            <h3 className="text-lg font-bold text-stone-900 mb-1 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-amber-700" />
              Importación Masiva de Estudiantes (CSV)
            </h3>
            <p className="text-xs text-stone-600 mb-3">
              Pega filas separadas por punto y coma (;) o comas con las columnas: <span className="font-semibold text-stone-800">Nombre, Email, RUT</span>
            </p>

            <button
              type="button"
              onClick={handleLoadCsvTemplate}
              className="text-xs text-amber-800 hover:text-amber-900 font-bold mb-3 block underline"
            >
              Cargar ejemplo de prueba
            </button>

            <form onSubmit={handleImportCsv} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Contenido CSV
                </label>
                <textarea
                  rows={8}
                  placeholder="Nombre;Email;RUT"
                  value={csvContent}
                  onChange={e => setCsvContent(e.target.value)}
                  className="w-full p-3 text-xs font-mono border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 bg-stone-50"
                  required
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCsvModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded-lg text-xs font-semibold text-stone-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={importingCsv || !csvContent.trim()}
                  className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-bold shadow-xs"
                >
                  {importingCsv ? 'Importando...' : 'Iniciar Importación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Student Password Modal */}
      {resetModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  Restablecer Contraseña
                </h3>
                <p className="text-xs text-stone-500">
                  Estudiante: {resetModalStudent.name}
                </p>
              </div>
            </div>

            <form onSubmit={handleResetStudentPassword} className="space-y-4">
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-stone-500">Correo:</span>
                  <span className="font-semibold text-stone-800">{resetModalStudent.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">RUT:</span>
                  <span className="font-mono text-stone-800">{resetModalStudent.rut || 'Sin registrar'}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Nueva Contraseña para el Alumno *
                </label>
                <input
                  type="text"
                  value={resetPasswordValue}
                  onChange={e => setResetPasswordValue(e.target.value)}
                  placeholder="Ej. paes2026"
                  minLength={4}
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 font-mono"
                  required
                />
                <div className="flex items-center justify-between mt-1 text-[11px] text-stone-400">
                  <span>Mínimo 4 caracteres</span>
                  <button
                    type="button"
                    onClick={() => setResetPasswordValue('PAES2026')}
                    className="text-amber-800 hover:underline font-semibold"
                  >
                    Usar por defecto (PAES2026)
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResetModalStudent(null)}
                  className="px-4 py-2 border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={resettingPassword || !resetPasswordValue.trim()}
                  className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  {resettingPassword ? 'Guardando...' : 'Guardar Nueva Clave'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Single Student Confirmation Modal */}
      {deleteConfirmStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  ¿Eliminar a este estudiante?
                </h3>
                <p className="text-xs text-stone-500">
                  Esta acción retirará al alumno de la nómina general de estudiantes.
                </p>
              </div>
            </div>

            <div className="p-3 bg-red-50/60 border border-red-200 rounded-lg text-xs space-y-1 mb-4">
              <div className="font-bold text-red-900 text-sm">{deleteConfirmStudent.name}</div>
              <div className="text-stone-700 flex justify-between">
                <span>Correo:</span>
                <span className="font-medium">{deleteConfirmStudent.email}</span>
              </div>
              <div className="text-stone-700 flex justify-between">
                <span>RUT:</span>
                <span className="font-mono">{deleteConfirmStudent.rut || 'No especificado'}</span>
              </div>
              <p className="text-[11px] text-red-700 pt-1 border-t border-red-200/60 mt-1">
                * Se eliminarán también los intentos y estadísticas asociadas a este alumno.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmStudent(null)}
                className="px-4 py-2 border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteStudent}
                disabled={deletingStudent}
                className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                {deletingStudent ? 'Eliminando...' : 'Sí, Eliminar Estudiante'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Demo / All Students Modal */}
      {clearModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  Limpieza de Estudiantes de Prueba
                </h3>
                <p className="text-xs text-stone-500">
                  Deja el sistema completamente limpio para matricular tus estudiantes reales.
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              <label 
                className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-colors ${
                  clearMode === 'demo' ? 'border-amber-600 bg-amber-50/50' : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <input
                  type="radio"
                  name="clear_mode"
                  checked={clearMode === 'demo'}
                  onChange={() => setClearMode('demo')}
                  className="mt-1 text-amber-700 focus:ring-amber-600"
                />
                <div>
                  <div className="font-bold text-xs text-stone-900">
                    Eliminar los 12 alumnos de demostración ficticios (Recomendado)
                  </div>
                  <div className="text-[11px] text-stone-600 mt-0.5">
                    Borra las cuentas de prueba iniciales (Benjamín, Sofía, etc.) y sus ensayos simulados, manteniendo intactos los alumnos reales que hayas añadido y la cuenta docente.
                  </div>
                </div>
              </label>

              <label 
                className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-colors ${
                  clearMode === 'all' ? 'border-red-600 bg-red-50/50' : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <input
                  type="radio"
                  name="clear_mode"
                  checked={clearMode === 'all'}
                  onChange={() => setClearMode('all')}
                  className="mt-1 text-red-700 focus:ring-red-600"
                />
                <div>
                  <div className="font-bold text-xs text-stone-900">
                    Vaciar la nómina completa de estudiantes ({students.length} estudiantes)
                  </div>
                  <div className="text-[11px] text-stone-600 mt-0.5">
                    Elimina todos los estudiantes de la lista para empezar desde cero absoluto (la cuenta del docente se mantiene siempre activa).
                  </div>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-stone-200">
              <span className="text-[11px] text-stone-500">
                * Podrás restaurar datos demo en cualquier momento si lo necesitas.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setClearModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleClearStudents}
                  disabled={clearingStudents}
                  className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  {clearingStudents ? 'Borrando...' : 'Confirmar y Limpiar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backup & Export Modal */}
      {backupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">
                    Copias de Seguridad & Exportación de Datos
                  </h3>
                  <p className="text-xs text-stone-500">
                    Tus textos, preguntas, estudiantes y avances están guardados de forma segura.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setBackupModalOpen(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mb-5">
              {/* Option 1: Full JSON backup */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-amber-700" />
                    <span>Copia de Seguridad Completa (JSON)</span>
                  </div>
                  <p className="text-[11px] text-stone-600">
                    Descarga en un solo archivo todos los textos, preguntas, justificaciones pedagógicas, estudiantes registrados, respuestas y puntajes PAES.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadBackup}
                  className="shrink-0 px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar</span>
                </button>
              </div>

              {/* Option 2: Excel / CSV Report */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                    <FileDown className="w-4 h-4 text-emerald-700" />
                    <span>Planilla de Resultados (CSV / Excel)</span>
                  </div>
                  <p className="text-[11px] text-stone-600">
                    Exporta una planilla compatible con Excel con los nombres, correos, RUT, puntajes PAES estimados y promedio de respuestas de los estudiantes.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadCsv}
                  className="shrink-0 px-3 py-1.5 border border-stone-300 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Exportar CSV</span>
                </button>
              </div>

              {/* Option 3: Restore backup */}
              <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                    <FolderUp className="w-4 h-4 text-amber-800" />
                    <span>Restaurar Copia de Seguridad</span>
                  </div>
                  <p className="text-[11px] text-stone-600">
                    Carga un archivo de respaldo (.json) descargado previamente para restaurar todos los datos en cualquier momento o servidor.
                  </p>
                </div>
                <label className="shrink-0 px-3 py-1.5 border border-amber-400 bg-white hover:bg-amber-100 text-amber-900 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors">
                  <FolderUp className="w-3.5 h-3.5" />
                  <span>{restoringBackup ? 'Restaurando...' : 'Subir JSON'}</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleRestoreBackupFile}
                    disabled={restoringBackup}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="p-3 bg-stone-100/70 rounded-lg text-[11px] text-stone-600 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Guardado automático activo:</strong> Cada cambio que realizas (nuevo texto, respuesta de un alumno, cambio de clave) se almacena de forma persistente y sincronizada en el disco del servidor.
              </span>
            </div>

            <div className="pt-4 border-t border-stone-200 flex justify-end mt-4">
              <button
                type="button"
                onClick={() => setBackupModalOpen(false)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-lg text-xs font-bold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
