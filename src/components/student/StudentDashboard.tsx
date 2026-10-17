import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../api/client.js';
import { StudentPractice } from './StudentPractice.js';
import { VocabularyPractice } from './VocabularyPractice.js';
import { getStoredStreak, getTodayIso, hydrateStreakFromServer, StreakData } from '../../utils/streak.js';
import { StudentAdaptiveProfile, LearningSkillModule, DemreSkill } from '../../types/index.js';
import { 
  BookOpen, 
  Award, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  RotateCcw, 
  Layers, 
  Calendar,
  AlertCircle,
  Sparkles,
  Target,
  Brain,
  Compass,
  FileCheck2,
  TrendingUp,
  ChevronRight,
  Flame,
  Check,
  HelpCircle
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [adaptiveProfile, setAdaptiveProfile] = useState<StudentAdaptiveProfile | null>(null);
  const [learningModules, setLearningModules] = useState<LearningSkillModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState<StreakData>(() => getStoredStreak(currentUser?.id));

  // Main navigation: 'ensayos' | 'aprendizaje' | 'vocabulario' | 'historial'
  const [mainSection, setMainSection] = useState<'ensayos' | 'aprendizaje' | 'vocabulario' | 'historial'>('ensayos');

  // Active practice runner state
  const [activeAssignmentId, setActiveAssignmentId] = useState<string | null>(null);

  const [loadError, setLoadError] = useState('');
  const [diag, setDiag] = useState<any>(null);

  const loadData = async () => {
    setLoading(true);
    setLoadError('');
    // Cada solicitud es independiente: si una falla, las demás secciones siguen funcionando
    const [asig, res, prof, mod] = await Promise.allSettled([
      api.getStudentAssignments(),
      api.getMyResults(),
      api.getAdaptiveProfile(),
      api.getLearningModules(),
    ]);
    if (asig.status === 'fulfilled') {
      setAssignments(asig.value.assignments || []);
      if ((asig.value.assignments || []).length === 0) {
        api.getDiagnostics().then(d => setDiag(d.diagnostics)).catch(() => {});
      }
    }
    else setLoadError(asig.reason?.message || 'No se pudieron cargar las actividades.');
    if (res.status === 'fulfilled') setResults(res.value.results || []);
    if (prof.status === 'fulfilled' && prof.value.profile) setAdaptiveProfile(prof.value.profile);
    if (mod.status === 'fulfilled' && mod.value.modules) setLearningModules(mod.value.modules);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    if (currentUser?.id) {
      setStreak(getStoredStreak(currentUser.id));
      hydrateStreakFromServer(currentUser.id)
        .then(remote => { if (remote) setStreak(remote); })
        .catch(() => {});
    }
  }, [currentUser]);

  const getWeekDays = () => {
    const now = new Date();
    const currentDay = now.getDay();
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);

    const days = [];
    const dayLabels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
    const fullLabels = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const isToday = iso === getTodayIso();
      const isPastOrToday = iso <= getTodayIso();
      days.push({
        label: dayLabels[i],
        fullName: fullLabels[i],
        iso,
        isToday,
        isPastOrToday,
      });
    }
    return days;
  };

  // If currently practicing an assignment
  if (activeAssignmentId) {
    return (
      <StudentPractice
        assignmentId={activeAssignmentId}
        onExit={() => {
          setActiveAssignmentId(null);
          loadData();
        }}
      />
    );
  }

  const recommendation = adaptiveProfile?.recommendation;

  // Filter assignments
  const emptyPanel = (
    <div className="p-5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs space-y-2">
      <div className="font-bold text-sm">Todavía no hay actividades publicadas para ti</div>
      <p className="leading-relaxed">
        Tu docente debe tener al menos un texto <strong>aprobado</strong> con preguntas y una actividad activa. Si ya lo hizo, pulsa
        <strong> Actualizar</strong>; si sigue igual, avísale con este detalle:
      </p>
      {diag && (
        <p className="font-mono text-[11px] bg-white/70 rounded p-2 border border-amber-200">
          textos: {Object.entries(diag.texts || {}).map(([k, v]) => `${k}=${v}`).join(', ') || '0'} · sin preguntas: {diag.textsWithoutQuestions} ·
          actividades: {Object.entries(diag.assignmentsByStatus || {}).map(([k, v]) => `${k}=${v}`).join(', ') || '0'} · nube: {diag.cloud}
        </p>
      )}
      <button onClick={loadData} className="px-3 py-1.5 rounded-lg bg-amber-800 text-white font-bold cursor-pointer">Actualizar</button>
    </div>
  );

  const evaluativeAssignments = assignments.filter(a => a.mode === 'evaluacion');
  const formativeAssignments = assignments.filter(a => a.mode === 'formativo');

  const handleRecommendationClick = () => {
    if (!recommendation) return;
    if (recommendation.suggestedActionType === 'iniciar_ensayo') {
      // Find first available evaluative assignment or first pending
      const target = evaluativeAssignments.find(a => !a.is_locked) || assignments[0];
      if (target) {
        setActiveAssignmentId(target.id);
      } else {
        setMainSection('ensayos');
      }
    } else {
      // Switch to Aprendizaje section and target specific skill
      setMainSection('aprendizaje');
    }
  };

  const skillColorMap: Record<DemreSkill, { bg: string; text: string; border: string; badge: string }> = {
    localizar: { bg: 'bg-blue-50/70', text: 'text-blue-900', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-800' },
    interpretar_relacionar: { bg: 'bg-purple-50/70', text: 'text-purple-900', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-800' },
    evaluar: { bg: 'bg-emerald-50/70', text: 'text-emerald-900', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-800' },
  };

  const statusLabelMap = {
    sin_datos: { label: 'Sin datos', color: 'text-stone-500 bg-stone-100' },
    por_reforzar: { label: 'Por reforzar', color: 'text-red-800 bg-red-100' },
    en_progreso: { label: 'En progreso', color: 'text-amber-800 bg-amber-100' },
    consolidado: { label: 'Consolidado', color: 'text-emerald-800 bg-emerald-100' },
  };

  return (
    <div className="space-y-6">
      {/* Student Welcome Banner */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
              Estudiante PAES
            </span>
            {currentUser?.rut && (
              <span className="text-xs font-mono text-stone-500">
                RUT: {currentUser.rut}
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-stone-900">
            ¡Hola, {currentUser?.name}!
          </h2>
          <p className="text-xs text-stone-600 mt-0.5">
            Prepara la PAES de Competencia Lectora combinando evaluación por puntaje y práctica adaptativa por habilidades.
          </p>
        </div>

        {/* Quick KPI pills */}
        <div className="flex items-center gap-4 bg-stone-50 p-3 rounded-lg border border-stone-200 self-start sm:self-auto text-xs">
          <div>
            <div className="text-stone-500">Ensayos Rendidos</div>
            <div className="text-lg font-bold text-stone-900">
              {adaptiveProfile?.totalEnsayosCompleted ?? results.length}
            </div>
          </div>
          <div className="border-l border-stone-200 pl-4">
            <div className="text-stone-500">Estimación PAES</div>
            <div className="text-lg font-bold text-amber-800">
              {adaptiveProfile?.latestPaesEstimated ?? 150} pts
            </div>
          </div>
        </div>
      </div>

      {/* Racha de Días Estilo Duolingo 🔥 */}
      {(() => {
        const isPracticedToday = streak.lastActiveDate === getTodayIso();
        const weekDays = getWeekDays();

        return (
          <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-yellow-500/10 border border-orange-300/80 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center text-2xl shadow-md shrink-0">
                🔥
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-black text-orange-950 tracking-tight">
                    {streak.currentStreak} {streak.currentStreak === 1 ? 'Día de Racha' : 'Días de Racha Activa'}
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-orange-100 text-orange-900 border border-orange-200">
                    Racha Diaria PAES
                  </span>
                </div>
                <p className="text-xs text-orange-900 mt-0.5">
                  {isPracticedToday ? (
                    <span className="font-semibold text-emerald-800 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600 inline" />
                      ¡Racha asegurada por hoy! Tu hábito diario consolida tu comprensión lectora.
                    </span>
                  ) : (
                    <span>
                      Récord histórico: <strong>{streak.highestStreak} días</strong>. Practica una lectura o léxico hoy para no perderla.
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Weekly Days bubbles (L, M, M, J, V, S, D) */}
            <div className="flex items-center gap-1.5 self-start md:self-auto">
              {weekDays.map(d => {
                const isPracticed = streak.history?.includes(d.iso);
                return (
                  <div key={d.iso} className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold text-stone-500">{d.label}</span>
                    <div
                      title={`${d.fullName} (${d.iso}): ${isPracticed ? 'Práctica completada' : 'Sin práctica'}`}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                        isPracticed
                          ? 'bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-2xs scale-105'
                          : d.isToday
                          ? 'border-2 border-orange-500 bg-orange-50 text-orange-800 animate-pulse'
                          : 'bg-stone-200/70 text-stone-400'
                      }`}
                    >
                      {isPracticed ? '🔥' : d.isToday ? '•' : '○'}
                    </div>
                  </div>
                );
              })}

              <button
                onClick={() => setMainSection('vocabulario')}
                className="ml-2 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shrink-0 transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                title="Practicar léxico contextual para sumar a tu racha"
              >
                <span>Entrenar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })()}

      {/* Adaptive Recommendation Card (The Bridge between Ensayo & Aprendizaje) */}
      {recommendation && (
        <div className={`p-5 rounded-xl border transition-all ${
          recommendation.status === 'reforzamiento_prioritario'
            ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-600/10'
            : recommendation.status === 'diagnostico_requerido'
            ? 'bg-blue-50/80 border-blue-300'
            : 'bg-emerald-50/70 border-emerald-300'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-700 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <Compass className="w-5 h-5 text-amber-100" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded">
                    Ruta Adaptativa Personalizada
                  </span>
                  {recommendation.skillLabel && (
                    <span className="text-[11px] font-semibold text-stone-700 bg-white/80 px-2 py-0.5 rounded border border-stone-200">
                      Habilidad: {recommendation.skillLabel}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-stone-900">
                  {recommendation.title}
                </h3>
                <p className="text-xs text-stone-700 max-w-2xl leading-relaxed">
                  {recommendation.message}
                </p>
                <p className="text-[11px] text-stone-500 italic pt-0.5">
                  Evidencia pedagógica: {recommendation.evidence}
                </p>
              </div>
            </div>

            <button
              onClick={handleRecommendationClick}
              className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shrink-0 transition-colors shadow-xs"
            >
              <span>{recommendation.actionLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Canonical Navigation Tabs: Ensayos vs Aprendizaje vs Historial */}
      <div className="flex border-b border-stone-200 gap-2 sm:gap-6 text-xs font-bold uppercase tracking-wider overflow-x-auto">
        <button
          onClick={() => setMainSection('ensayos')}
          className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            mainSection === 'ensayos'
              ? 'border-amber-700 text-amber-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Sección A: Ensayos PAES ({evaluativeAssignments.length || assignments.length})</span>
        </button>

        <button
          onClick={() => setMainSection('aprendizaje')}
          className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            mainSection === 'aprendizaje'
              ? 'border-amber-700 text-amber-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Brain className="w-4 h-4 text-purple-700" />
          <span>Sección B: Aprendizaje y Habilidades (3)</span>
        </button>

        <button
          onClick={() => setMainSection('vocabulario')}
          className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            mainSection === 'vocabulario'
              ? 'border-amber-700 text-amber-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>Sección C: Léxico Contextual y Vocabulario</span>
          <span className="text-[10px] bg-orange-100 text-orange-900 px-1.5 py-0.5 rounded font-bold">
            🔥 Racha
          </span>
        </button>

        <button
          onClick={() => setMainSection('historial')}
          className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            mainSection === 'historial'
              ? 'border-amber-700 text-amber-900'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Award className="w-4 h-4 text-amber-600" />
          <span>Historial y Evolución ({results.length})</span>
        </button>
      </div>

      {loadError && !loading && (
        <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center justify-between gap-3">
          <span><strong>No se pudieron cargar tus actividades:</strong> {loadError}</span>
          <button onClick={loadData} className="px-3 py-1.5 rounded-lg bg-red-700 text-white font-bold cursor-pointer shrink-0">Reintentar</button>
        </div>
      )}
      {loading ? (
        <div className="p-12 text-center text-sm text-stone-500">
          Cargando tus actividades de lectura y perfil adaptativo...
        </div>
      ) : mainSection === 'ensayos' ? (
        /* ================= SECCIÓN ENSAYO ================= */
        <div className="space-y-6">
          {assignments.length === 0 && emptyPanel}
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-stone-900 block">
                Condiciones de Ensayo Oficial PAES
              </span>
              <p className="text-stone-600 mt-0.5">
                Evaluaciones sin pistas intermedias para medir con exactitud tu comprensión lectora y proyectar tu puntaje en escala DEMRE (100 a 1000 puntos).
              </p>
            </div>
            <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2.5 py-1 rounded shrink-0">
              Modo Evaluación Activo
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(evaluativeAssignments.length > 0 ? evaluativeAssignments : assignments).map(asig => {
              const hasOngoing = asig.has_ongoing;
              const isLocked = asig.is_locked;

              return (
                <div
                  key={asig.id}
                  className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between hover:border-amber-400 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-amber-100 text-amber-900">
                        Ensayo Evaluativo
                      </span>
                      {asig.best_score !== null && (
                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                          Último Logro: {asig.best_score}%
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-stone-900 mb-1">
                      {asig.title}
                    </h3>

                    <p className="text-xs text-stone-600 mb-3 line-clamp-2">
                      Texto: <span className="font-semibold text-stone-800">{asig.text_title}</span>
                    </p>

                    <div className="text-[11px] text-stone-500 space-y-1 mb-4">
                      <div>
                        Preguntas con alternativas A, B, C y D. Las claves y justificaciones se revelan únicamente al enviar el ensayo final.
                      </div>
                      <div className="flex items-center gap-2">
                        <span>Preguntas: <strong className="text-stone-700">{asig.question_count}</strong></span>
                        <span>·</span>
                        <span>Intentos realizados: <strong className="text-stone-700">{asig.attempts_count}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-100">
                    {isLocked ? (
                      <div className="text-xs font-semibold text-stone-500 py-1 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Ensayo finalizado (Límite de intentos alcanzado)
                      </div>
                    ) : (
                      <button
                        onClick={() => setActiveAssignmentId(asig.id)}
                        className={`w-full py-2.5 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs ${
                          hasOngoing
                            ? 'bg-amber-700 hover:bg-amber-800 text-white'
                            : 'bg-stone-900 hover:bg-stone-800 text-white'
                        }`}
                      >
                        {hasOngoing ? (
                          <>
                            <RotateCcw className="w-4 h-4" />
                            <span>Retomar Ensayo en Progreso</span>
                          </>
                        ) : (
                          <>
                            <FileCheck2 className="w-4 h-4" />
                            <span>Rendir Ensayo PAES</span>
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : mainSection === 'aprendizaje' ? (
        /* ================= SECCIÓN APRENDIZAJE ================= */
        <div className="space-y-6">
          {assignments.length === 0 && emptyPanel}
          <div className="bg-purple-50/60 p-4 rounded-xl border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-purple-900 block">
                Zona de Aprendizaje y Desarrollo de Habilidades
              </span>
              <p className="text-purple-800 mt-0.5">
                Práctica formativa libre sin penalización de nota. Equivocarse es parte del aprendizaje: recibe explicaciones inmediatas de por qué tu respuesta no fue la adecuada y qué evidencia textual revisar.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-purple-900 bg-purple-100 px-2.5 py-1 rounded shrink-0">
              Retroalimentación Inmediata
            </span>
          </div>

          {/* 3 DEMRE Skill Modules */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {learningModules.map(mod => {
              const colors = skillColorMap[mod.skill];
              const statusBadge = statusLabelMap[mod.studentStatus] || statusLabelMap.sin_datos;
              const isRecommended = recommendation?.primarySkill === mod.skill;

              return (
                <div
                  key={mod.skill}
                  className={`bg-white rounded-xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
                    isRecommended
                      ? 'border-amber-500 ring-2 ring-amber-600/20'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${colors.badge}`}>
                        {mod.label}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${statusBadge.color}`}>
                        {statusBadge.label}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-stone-900">
                        Habilidad: {mod.label}
                      </h4>
                      <p className="text-xs text-stone-600 mt-1">
                        {mod.description}
                      </p>
                    </div>

                    {/* DEMRE definition callout */}
                    <div className={`p-3 rounded-lg border text-[11px] ${colors.bg} ${colors.border} ${colors.text}`}>
                      <strong className="block mb-0.5">Marco DEMRE:</strong>
                      {mod.demreDefinition}
                    </div>

                    {/* Progress bar */}
                    <div>
                      <div className="flex items-center justify-between text-xs text-stone-600 mb-1">
                        <span>Precisión en Ensayos</span>
                        <span className="font-bold text-stone-900">{mod.studentAccuracy}%</span>
                      </div>
                      <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden border border-stone-200">
                        <div
                          className="bg-amber-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${mod.studentAccuracy}%` }}
                        />
                      </div>
                    </div>

                    {/* Recommended texts for this skill */}
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                        Lecturas de Práctica Disponibles:
                      </span>
                      {mod.recommendedTexts.slice(0, 2).map(txt => (
                        <div
                          key={txt.id}
                          className="p-2 rounded border border-stone-100 bg-stone-50/70 text-xs flex items-center justify-between hover:bg-stone-100 transition-colors"
                        >
                          <span className="truncate max-w-[170px] font-medium text-stone-800">
                            {txt.title}
                          </span>
                          <span className="text-[10px] text-stone-500 font-semibold shrink-0">
                            {txt.questionCount} preg.
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Practice button */}
                  <div className="pt-4 mt-4 border-t border-stone-100">
                    <button
                      onClick={() => {
                        // Launch first assignment with this text or formative
                        const target = mod.recommendedTexts.find(t => t.assignmentId)?.assignmentId || assignments[0]?.id;
                        if (target) {
                          setActiveAssignmentId(target);
                        } else {
                          alert('El docente activará nuevas lecturas para esta habilidad en breve.');
                        }
                      }}
                      className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <span>Practicar Habilidad</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Formative available assignments */}
          {formativeAssignments.length > 0 && (
            <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-3">
              <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-700" />
                Talleres Formativos con Retroalimentación Paso a Paso
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {formativeAssignments.map(asig => (
                  <div
                    key={asig.id}
                    className="p-4 rounded-lg border border-stone-200 bg-stone-50/50 flex items-center justify-between gap-3"
                  >
                    <div>
                      <span className="font-semibold text-xs text-stone-900 block">{asig.title}</span>
                      <span className="text-[11px] text-stone-500">Texto: {asig.text_title} · {asig.question_count} preguntas</span>
                    </div>
                    <button
                      onClick={() => setActiveAssignmentId(asig.id)}
                      className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded text-xs font-bold shrink-0 transition-colors"
                    >
                      Comenzar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : mainSection === 'vocabulario' ? (
        /* ================= SECCIÓN VOCABULARIO Y LÉXICO CONTEXTUAL ================= */
        <div className="space-y-6">
          <VocabularyPractice
            userId={currentUser?.id}
            onStreakUpdated={(newStreak) => setStreak(newStreak)}
          />
        </div>
      ) : (
        /* ================= SECCIÓN HISTORIAL ================= */
        <div className="space-y-4">
          {results.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl border border-stone-200">
              <Award className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-stone-700">Aún no has completado actividades</p>
              <p className="text-xs text-stone-500 mt-1">
                Ingresa a la sección "Ensayos PAES" o "Aprendizaje" para registrar tus primeros avances.
              </p>
            </div>
          ) : (
            results.map(att => (
              <div
                key={att.id}
                className="bg-white p-4 sm:p-5 rounded-xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                      {att.mode || 'Ensayo'}
                    </span>
                    <span className="text-[11px] text-stone-400">
                      Intento #{att.attempt_number} · {att.completed_at ? new Date(att.completed_at).toLocaleDateString('es-CL') : ''}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-stone-900">
                    {att.assignment_title}
                  </h4>
                  <p className="text-xs text-stone-500">
                    Texto: <span className="italic">{att.text_title}</span>
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <div className="text-xs text-stone-500">Logro</div>
                    <div className="text-base sm:text-lg font-bold text-stone-900">
                      {att.percentage}% ({att.score}/{att.total_points} pts)
                    </div>
                  </div>

                  <div className="text-right bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                    <div className="text-[10px] uppercase font-bold text-amber-800">Escala PAES</div>
                    <div className="text-base sm:text-lg font-bold text-amber-900">
                      {att.paes_estimated_score} <span className="text-xs">pts</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
