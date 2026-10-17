import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../api/client.js';
import { User, Course } from '../../types/index.js';
import { Users, GraduationCap, UserCheck, Search, X, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const UserSwitcherModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { currentUser, switchUser } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.getCourses().then(res => setCourses(res.courses)).catch(console.error);
      api.getStudents().then(res => setStudents(res.students)).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectUser = async (userId: string) => {
    setSwitching(true);
    try {
      await switchUser(userId);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSwitching(false);
    }
  };

  const filteredStudents = students.filter(s => {
    if (selectedCourse !== 'all' && s.course_id !== selectedCourse) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return s.name.toLowerCase().includes(q) || (s.rut && s.rut.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div>
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-700" />
              Cambio de Usuario y Rol de Pruebas
            </h3>
            <p className="text-xs text-stone-600 mt-0.5">
              Alterna entre la visión docente y la perspectiva de un estudiante de IV° Medio
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-lg hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Docente Card */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2 block">
              Cuenta Docente Administrador
            </span>
            <button
              onClick={() => handleSelectUser('doc_1')}
              disabled={switching}
              className={`w-full p-4 rounded-lg border text-left flex items-center justify-between transition-all ${
                currentUser?.role === 'docente'
                  ? 'border-amber-600 bg-amber-50/70 ring-2 ring-amber-600/20'
                  : 'border-stone-200 hover:border-amber-400 hover:bg-stone-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-700 text-white flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-stone-900 flex items-center gap-2">
                    Prof. Rodrigo Lara Flores
                    <span className="text-[11px] font-medium bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                      Profesor de Lengua y Literatura
                    </span>
                  </div>
                  <div className="text-xs text-stone-500">
                    rodrigolaraflores4@gmail.com · rodrigo.lara@colegio.cl · RUT: 14.892.341-K
                  </div>
                </div>
              </div>
              {currentUser?.role === 'docente' && (
                <div className="flex items-center gap-1 text-xs font-medium text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-md">
                  <Check className="w-3.5 h-3.5" /> Activo
                </div>
              )}
            </button>
          </div>

          {/* Estudiantes Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Nómina de Estudiantes ({students.length} registrados)
              </span>
              <span className="text-[11px] text-stone-400">
                Clave de acceso: <code className="font-mono text-stone-600 font-bold">paes2026</code>
              </span>
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o RUT de estudiante..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 bg-stone-50/50"
              />
            </div>

            {/* Students list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {filteredStudents.slice(0, 40).map(st => {
                const isCurrent = currentUser?.id === st.id;
                return (
                  <button
                    key={st.id}
                    onClick={() => handleSelectUser(st.id)}
                    disabled={switching}
                    className={`p-2.5 text-left rounded-lg border flex items-center justify-between text-xs transition-colors ${
                      isCurrent
                        ? 'border-emerald-600 bg-emerald-50/80 font-medium'
                        : 'border-stone-200 hover:border-amber-400 hover:bg-stone-50'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-stone-900 truncate max-w-[180px]">{st.name}</div>
                      <div className="text-[11px] text-stone-500">
                        {st.rut ? `RUT: ${st.rut}` : st.email}
                      </div>
                    </div>
                    {isCurrent ? (
                      <span className="text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded text-[10px] font-bold">
                        Tú
                      </span>
                    ) : (
                      <span className="text-stone-400 hover:text-stone-700">Entrar</span>
                    )}
                  </button>
                );
              })}
            </div>
            {filteredStudents.length > 40 && (
              <p className="text-[11px] text-stone-500 text-center mt-2">
                Mostrando 40 de {filteredStudents.length} estudiantes. Usa el buscador para filtrar.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <span>El cambio de usuario es instantáneo y seguro para pruebas locales</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
