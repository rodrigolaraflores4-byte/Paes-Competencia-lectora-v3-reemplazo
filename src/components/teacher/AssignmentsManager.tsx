import React, { useState, useEffect } from 'react';
import { api } from '../../api/client.js';
import { Assignment, TextItem, AssignmentMode } from '../../types/index.js';
import { Layers, Plus, Calendar, CheckCircle2, Clock, BookOpen, AlertCircle, Users, Check, Sparkles } from 'lucide-react';

export const AssignmentsManager: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [approvedTexts, setApprovedTexts] = useState<TextItem[]>([]);
  const [loading, setLoading] = useState(true);

  // New assignment modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedTextId, setSelectedTextId] = useState('');
  const [mode, setMode] = useState<AssignmentMode>('evaluacion');
  const [dueDate, setDueDate] = useState('');
  const [maxAttempts, setMaxAttempts] = useState<number>(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [asigRes, textsRes] = await Promise.all([
        api.getAssignments(),
        api.getTexts({ status: 'aprobado' }),
      ]);
      setAssignments(asigRes.assignments);
      setApprovedTexts(textsRes.texts);
      if (textsRes.texts.length > 0 && !selectedTextId) {
        setSelectedTextId(textsRes.texts[0].id);
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

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('El título de la actividad o ensayo es obligatorio.');
      return;
    }
    if (!selectedTextId) {
      setError('Debes seleccionar un texto aprobado del banco.');
      return;
    }

    setSaving(true);
    try {
      await api.createAssignment({
        title: title.trim(),
        text_id: selectedTextId,
        course_ids: [],
        is_global: true,
        mode,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        max_attempts: maxAttempts,
      });
      setFeedback('Actividad publicada y disponible para todos los estudiantes.');
      setIsModalOpen(false);
      setTitle('');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Error al crear la asignación');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (asig: Assignment) => {
    const newStatus = asig.status === 'activa' ? 'cerrada' : 'activa';
    try {
      await api.updateAssignment(asig.id, { status: newStatus });
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="font-bold">×</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-700" />
            Publicación de Ensayos y Actividades
          </h2>
          <p className="text-xs text-stone-600 mt-0.5">
            Habilita lecturas para todos los estudiantes en modalidad Ensayo Evaluativo o Taller de Aprendizaje
          </p>
        </div>
        <button
          onClick={() => {
            setError(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-sm font-bold shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Publicar Nueva Actividad
        </button>
      </div>

      {/* Assignments list */}
      {loading ? (
        <div className="p-12 text-center text-sm text-stone-500">
          Cargando actividades y ensayos...
        </div>
      ) : assignments.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-stone-200">
          <Layers className="w-10 h-10 text-stone-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-stone-700">No hay actividades publicadas</p>
          <p className="text-xs text-stone-500 mt-1">Crea tu primera actividad vinculando un texto aprobado del banco.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments.map(asig => {
            const isFormativo = asig.mode === 'formativo';
            return (
              <div
                key={asig.id}
                className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between hover:border-amber-300 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        isFormativo
                          ? 'bg-purple-100 text-purple-900'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {isFormativo ? 'Modo Aprendizaje (Formativo)' : 'Modo Ensayo (Evaluativo)'}
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        asig.status === 'activa'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-stone-100 text-stone-600'
                      }`}
                    >
                      {asig.status === 'activa' ? 'Disponible' : 'Cerrada'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-stone-900 mb-1">
                    {asig.title}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-stone-600 mb-3">
                    <BookOpen className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="truncate">{asig.text_title}</span>
                    <span className="text-stone-400">·</span>
                    <span className="font-semibold text-stone-700">{asig.question_count} preguntas</span>
                  </div>

                  <div className="mb-3">
                    <span className="text-[11px] font-medium bg-stone-100 text-stone-700 px-2 py-0.5 rounded inline-flex items-center gap-1">
                      <Users className="w-3 h-3 text-stone-500" />
                      Disponible individualmente para todos los estudiantes
                    </span>
                  </div>

                  <div className="text-[11px] text-stone-500 space-y-1">
                    <div>
                      {isFormativo
                        ? 'Retroalimentación instantánea: el estudiante ve la clave y explicaciones al responder cada pregunta.'
                        : 'Evaluación formal: claves y justificaciones ocultas hasta terminar el intento.'}
                    </div>
                    {asig.max_attempts && (
                      <div>Máximo de intentos: <span className="font-semibold text-stone-700">{asig.max_attempts}</span></div>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-stone-400">
                    Publicada: {new Date(asig.created_at).toLocaleDateString('es-CL')}
                  </span>
                  <button
                    onClick={() => handleToggleStatus(asig)}
                    className={`font-semibold px-2.5 py-1 rounded transition-colors ${
                      asig.status === 'activa'
                        ? 'text-stone-600 hover:text-stone-900 bg-stone-100'
                        : 'text-emerald-700 hover:text-emerald-800 bg-emerald-50'
                    }`}
                  >
                    {asig.status === 'activa' ? 'Cerrar acceso' : 'Habilitar acceso'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-stone-200">
            <h3 className="text-lg font-bold text-stone-900 mb-1">
              Publicar Ensayo o Actividad
            </h3>
            <p className="text-xs text-stone-600 mb-4">
              Vincula un texto aprobado del banco para que esté accesible a todos los estudiantes
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Título de la Actividad *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Ensayo PAES N°2: Competencia Lectora"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Texto de Lectura (Solo Aprobados) *
                </label>
                {approvedTexts.length === 0 ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg">
                    No hay textos aprobados en el banco. Ve al módulo "Banco de Textos", revisa un texto y haz clic en "Aprobar para Práctica".
                  </div>
                ) : (
                  <select
                    value={selectedTextId}
                    onChange={e => setSelectedTextId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 bg-white"
                  >
                    {approvedTexts.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.title} ({t.questions?.length || 0} preguntas · {t.difficulty})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Mode */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Modalidad de Uso *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMode('evaluacion')}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      mode === 'evaluacion'
                        ? 'border-amber-700 bg-amber-50 text-amber-950 font-bold ring-1 ring-amber-600/30'
                        : 'border-stone-200 bg-white text-stone-700'
                    }`}
                  >
                    <div className="text-xs font-bold">Modo Ensayo (PAES)</div>
                    <div className="text-[11px] font-normal text-stone-600 mt-0.5">
                      Respuestas ocultas hasta terminar la prueba completa
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('formativo')}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      mode === 'formativo'
                        ? 'border-purple-600 bg-purple-50 text-purple-950 font-bold ring-1 ring-purple-600/30'
                        : 'border-stone-200 bg-white text-stone-700'
                    }`}
                  >
                    <div className="text-xs font-bold">Modo Aprendizaje</div>
                    <div className="text-[11px] font-normal text-stone-600 mt-0.5">
                      Retroalimentación inmediata pregunta a pregunta
                    </div>
                  </button>
                </div>
              </div>

              {/* Max Attempts & Due date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Intentos Permitidos
                  </label>
                  <select
                    value={maxAttempts}
                    onChange={e => setMaxAttempts(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white"
                  >
                    <option value={1}>1 intento estricto</option>
                    <option value={2}>2 intentos</option>
                    <option value={3}>3 intentos</option>
                    <option value={999}>Ilimitados</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Fecha de Cierre (Opcional)
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded-lg text-xs font-semibold text-stone-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || approvedTexts.length === 0}
                  className="px-4 py-2 bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-xs"
                >
                  {saving ? 'Publicando...' : 'Publicar Actividad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
