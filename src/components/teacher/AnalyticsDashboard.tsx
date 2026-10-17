import React, { useState, useEffect } from 'react';
import { api } from '../../api/client.js';
import { AnalyticsSummary, Assignment, DemreSkill } from '../../types/index.js';
import { 
  BarChart3, 
  Download, 
  TrendingUp, 
  Users, 
  Award, 
  AlertTriangle, 
  Filter, 
  Target,
  Search,
  BookOpen
} from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<string>('');
  const [studentSearch, setStudentSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [anRes, asRes] = await Promise.all([
        api.getAnalytics(undefined, selectedAssignment || undefined),
        api.getAssignments(),
      ]);
      setAnalytics(anRes.analytics);
      setAssignments(asRes.assignments);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedAssignment]);

  const handleDownloadCsv = () => {
    const url = api.getExportUrl(undefined, selectedAssignment || undefined);
    window.open(url, '_blank');
  };

  const skillColorMap: Record<DemreSkill, { bg: string; bar: string; text: string }> = {
    localizar: { bg: 'bg-blue-50', bar: 'bg-blue-600', text: 'text-blue-800' },
    interpretar_relacionar: { bg: 'bg-purple-50', bar: 'bg-purple-600', text: 'text-purple-800' },
    evaluar: { bg: 'bg-emerald-50', bar: 'bg-emerald-600', text: 'text-emerald-800' },
  };

  const filteredStudentStats = (analytics?.studentStats || []).filter(st => {
    if (!studentSearch.trim()) return true;
    const q = studentSearch.toLowerCase();
    return st.studentName.toLowerCase().includes(q) || (st.studentRut && st.studentRut.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6">
      {/* Header and Download Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-700" />
            Analítica de Desempeño y Habilidades DEMRE
          </h2>
          <p className="text-xs text-stone-600 mt-0.5">
            Métricas individuales y globales a partir de los ensayos completados por los estudiantes
          </p>
        </div>
        <button
          onClick={handleDownloadCsv}
          className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs sm:text-sm font-bold shadow-xs flex items-center gap-2 transition-colors self-start sm:self-auto"
          title="Descarga archivo CSV compatible con Excel con todos los estudiantes y sus notas"
        >
          <Download className="w-4 h-4 text-amber-400" />
          Descargar Planilla Excel (CSV)
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-stone-600 uppercase tracking-wider shrink-0">
          <Filter className="w-4 h-4 text-stone-400" />
          Filtrar por Actividad o Ensayo:
        </div>
        <div className="w-full sm:w-80">
          <select
            value={selectedAssignment}
            onChange={e => setSelectedAssignment(e.target.value)}
            className="w-full px-3 py-1.5 text-xs border border-stone-200 rounded-lg bg-stone-50 focus:bg-white"
          >
            <option value="">Todas las Actividades y Ensayos</option>
            {assignments.map(a => (
              <option key={a.id} value={a.id}>{a.title}</option>
            ))}
          </select>
        </div>
      </div>

      {loading || !analytics ? (
        <div className="p-12 text-center text-sm text-stone-500">
          Calculando analítica de estudiantes...
        </div>
      ) : (
        <>
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
              <span className="text-xs text-stone-500 font-semibold uppercase">Participación</span>
              <div className="text-2xl font-bold text-stone-900 mt-1">
                {analytics.participationRate}%
              </div>
              <div className="text-[11px] text-stone-500 mt-1">
                {analytics.activeStudents} de {analytics.totalStudents} estudiantes
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
              <span className="text-xs text-stone-500 font-semibold uppercase">Promedio General</span>
              <div className="text-2xl font-bold text-stone-900 mt-1">
                {analytics.overallAverage}%
              </div>
              <div className="text-[11px] text-stone-500 mt-1">
                {analytics.totalAttempts} ensayos completados
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
              <span className="text-xs text-stone-500 font-semibold uppercase">Puntaje PAES Ref.</span>
              <div className="text-2xl font-bold text-amber-700 mt-1">
                {Math.round(150 + (analytics.overallAverage / 100) * 850)} pts
              </div>
              <div className="text-[11px] text-stone-500 mt-1">
                Escala oficial DEMRE 100-1000
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
              <span className="text-xs text-stone-500 font-semibold uppercase">Preguntas Críticas</span>
              <div className="text-2xl font-bold text-red-600 mt-1">
                {analytics.criticalQuestions.length}
              </div>
              <div className="text-[11px] text-stone-500 mt-1">
                Con error superior al 40%
              </div>
            </div>
          </div>

          {/* Individual Students Performance Overview */}
          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-700" />
                  Rendimiento Individual de Estudiantes
                </h3>
                <p className="text-xs text-stone-500">
                  Seguimiento del puntaje y promedio alcanzado por cada estudiante
                </p>
              </div>

              {/* Search in table */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Buscar estudiante o RUT..."
                  value={studentSearch}
                  onChange={e => setStudentSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-600 bg-stone-50"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-2.5">Estudiante</th>
                    <th className="px-4 py-2.5">RUT Chileno</th>
                    <th className="px-4 py-2.5 text-center">Ensayos Rendidos</th>
                    <th className="px-4 py-2.5 text-center">Promedio Logro</th>
                    <th className="px-4 py-2.5 text-center">Puntaje PAES Ref.</th>
                    <th className="px-4 py-2.5 text-right">Último Ensayo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredStudentStats.slice(0, 50).map(st => (
                    <tr key={st.studentId} className="hover:bg-stone-50/70 transition-colors">
                      <td className="px-4 py-2.5 font-semibold text-stone-900">
                        {st.studentName}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-stone-600">
                        {st.studentRut || '—'}
                      </td>
                      <td className="px-4 py-2.5 text-center font-semibold text-stone-800">
                        {st.totalAttempts}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {st.totalAttempts > 0 ? (
                          <span className="font-bold text-stone-900">{st.averageScore}%</span>
                        ) : (
                          <span className="text-stone-400">Sin ensayos</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {st.totalAttempts > 0 ? (
                          <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            {st.paesEstimated} pts
                          </span>
                        ) : (
                          <span className="text-stone-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right text-stone-500 text-[11px]">
                        {st.latestAttemptDate
                          ? new Date(st.latestAttemptDate).toLocaleDateString('es-CL')
                          : 'Pendiente'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredStudentStats.length > 50 && (
              <p className="text-[11px] text-stone-500 text-center pt-2">
                Mostrando 50 de {filteredStudentStats.length} estudiantes. Usa el buscador para filtrar.
              </p>
            )}
          </div>

          {/* Breakdown by DEMRE Skills (Localizar, Interpretar y relacionar, Evaluar) */}
          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-700" />
                Desglose Global por Habilidad Evaluada (DEMRE)
              </h3>
              <p className="text-xs text-stone-500">
                Porcentaje de respuestas correctas según la destreza cognitiva requerida
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analytics.skillsBreakdown.map(skillItem => {
                const colors = skillColorMap[skillItem.skill];
                return (
                  <div
                    key={skillItem.skill}
                    className={`p-4 rounded-xl border border-stone-200 ${colors.bg} space-y-2`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}>
                        {skillItem.label}
                      </span>
                      <span className="text-base font-bold text-stone-900">
                        {skillItem.accuracy}%
                      </span>
                    </div>

                    <div className="w-full bg-stone-200/80 h-2 rounded-full overflow-hidden">
                      <div
                        className={`${colors.bar} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${skillItem.accuracy}%` }}
                      />
                    </div>

                    <div className="text-[11px] text-stone-600 flex justify-between pt-1">
                      <span>Aciertos: {skillItem.correctAnswers} / {skillItem.totalQuestions}</span>
                      <span>
                        {skillItem.accuracy >= 75 ? 'Nivel óptimo' : skillItem.accuracy >= 55 ? 'Reforzar' : 'Crítico'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Critical Questions Traffic Light */}
          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                Semáforo de Preguntas Críticas (Mayor Tasa de Error)
              </h3>
              <p className="text-xs text-stone-500">
                Preguntas donde los estudiantes presentaron mayor dificultad para retroalimentar en la siguiente clase
              </p>
            </div>

            {analytics.criticalQuestions.length === 0 ? (
              <div className="p-6 text-center text-xs text-stone-500 bg-stone-50 rounded-lg">
                No hay preguntas con error significativo registrado.
              </div>
            ) : (
              <div className="space-y-3">
                {analytics.criticalQuestions.map((q) => (
                  <div
                    key={q.questionId}
                    className="p-4 rounded-lg border border-red-200 bg-red-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-red-800 bg-red-100 px-2 py-0.5 rounded">
                          {q.errorRate}% de error
                        </span>
                        <span className="font-medium text-stone-600 bg-stone-100 px-2 py-0.5 rounded capitalize">
                          {q.skill.replace('_', ' ')}
                        </span>
                        <span className="text-stone-500 text-[11px]">
                          ({q.totalAnswers} respuestas analizadas)
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-stone-900">
                        {q.prompt}
                      </p>
                      <p className="text-[11px] text-stone-500">
                        Texto: <span className="italic">{q.textTitle}</span> · Clave correcta: <span className="font-bold text-emerald-800">Alternativa {q.correctOption}</span>
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="text-xs font-bold text-red-700 bg-red-100/80 px-2.5 py-1 rounded">
                        Revisar en clase
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
