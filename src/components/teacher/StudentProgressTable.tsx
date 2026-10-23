import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { api } from '../../api/client.js';
import { StudentProgressRow, StudentProgressSummary } from '../../types/index.js';
import { Flame, Search, Download, RefreshCw, Users, TrendingUp, Trophy, Moon, ArrowUpDown } from 'lucide-react';

type SortKey = 'name' | 'progress' | 'streak' | 'achievement' | 'last';
type Filter = 'all' | 'streak' | 'inactive' | 'low';

const logroTone = (pct: number, hasData: boolean) =>
  !hasData ? 'text-stone-400' : pct >= 75 ? 'text-emerald-700' : pct >= 55 ? 'text-amber-700' : 'text-red-700';
const logroBar = (pct: number) => (pct >= 75 ? 'bg-emerald-500' : pct >= 55 ? 'bg-amber-500' : 'bg-red-500');

const relativeDay = (iso: string | null) => {
  if (!iso) return 'Sin actividad';
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return 'Hoy';
  if (days === 1) return 'Ayer';
  if (days < 7) return `Hace ${days} días`;
  return new Date(iso).toLocaleDateString('es-CL');
};

export const StudentProgressTable: React.FC = () => {
  const [rows, setRows] = useState<StudentProgressRow[]>([]);
  const [summary, setSummary] = useState<StudentProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getStudentProgress();
      setRows(res.rows);
      setSummary(res.summary);
    } catch (e: any) {
      setError(e.message || 'No se pudo cargar el seguimiento.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir(key === 'name' ? 'asc' : 'desc');
    }
  };

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = rows.filter(r => {
      const hasData = r.readingAnswers + r.vocabAnswers > 0;
      if (filter === 'streak' && r.streakDays === 0) return false;
      if (filter === 'inactive' && hasData) return false;
      if (filter === 'low' && !(hasData && r.achievementPct < 55)) return false;
      if (!q) return true;
      return r.name.toLowerCase().includes(q) || (r.rut || '').toLowerCase().includes(q);
    });
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...list].sort((a, b) => {
      switch (sortKey) {
        case 'progress': return (a.progressPct - b.progressPct) * dir;
        case 'streak': return (a.streakDays - b.streakDays) * dir;
        case 'achievement': return (a.achievementPct - b.achievementPct) * dir;
        case 'last': return ((a.lastActivity || '').localeCompare(b.lastActivity || '')) * dir;
        default: return a.name.localeCompare(b.name) * dir;
      }
    });
  }, [rows, search, filter, sortKey, sortDir]);

  const exportCsv = () => {
    const header = ['Estudiante', 'RUT', 'Avance %', 'Actividades realizadas', 'Actividades disponibles', 'Palabras practicadas', 'Palabras disponibles', 'Racha (días)', 'Mejor racha', '% Logro', '% Logro lectura', '% Logro vocabulario', 'Última actividad'];
    const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const lines = visible.map(r => [
      r.name, r.rut || '', r.progressPct, r.activitiesDone, r.activitiesTotal, r.vocabDone, r.vocabTotal,
      r.streakDays, r.bestStreak, r.achievementPct, r.readingPct ?? '', r.vocabPct ?? '',
      r.lastActivity ? new Date(r.lastActivity).toLocaleDateString('es-CL') : '',
    ].map(esc).join(';'));
    const csv = '\uFEFF' + [header.map(esc).join(';'), ...lines].join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'seguimiento-estudiantes.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const SortHead: React.FC<{ k: SortKey; label: string; className?: string }> = ({ k, label, className = '' }) => (
    <th className={`px-4 py-3 font-semibold ${className}`}>
      <button onClick={() => toggleSort(k)} className={`inline-flex items-center gap-1 uppercase tracking-wider text-[10px] cursor-pointer hover:text-stone-900 ${sortKey === k ? 'text-amber-800' : ''}`}>
        {label}
        <ArrowUpDown className="w-3 h-3 opacity-60" />
      </button>
    </th>
  );

  const kpis = [
    { icon: Users, label: 'Estudiantes', value: summary?.students ?? 0, tone: 'text-blue-800 bg-blue-50' },
    { icon: TrendingUp, label: 'Avance promedio', value: `${summary?.avgProgress ?? 0}%`, tone: 'text-amber-800 bg-amber-50' },
    { icon: Trophy, label: 'Logro promedio', value: `${summary?.avgAchievement ?? 0}%`, tone: 'text-emerald-800 bg-emerald-50' },
    { icon: Flame, label: 'Con racha activa', value: summary?.activeStreaks ?? 0, tone: 'text-orange-800 bg-orange-50' },
    { icon: Moon, label: 'Sin actividad aún', value: summary?.inactive ?? 0, tone: 'text-stone-700 bg-stone-100' },
  ];

  const filters: [Filter, string][] = [
    ['all', 'Todos'],
    ['streak', 'Con racha'],
    ['inactive', 'Sin actividad'],
    ['low', 'Logro bajo 55%'],
  ];

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-xs p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-700" />
            Seguimiento de estudiantes
          </h3>
          <p className="text-xs text-stone-500 mt-0.5 max-w-2xl leading-relaxed">
            <strong>Avance:</strong> actividades y palabras de vocabulario realizadas sobre las disponibles. <strong>Racha:</strong> días seguidos practicando
            (cualquier ejercicio). <strong>% Logro:</strong> respuestas correctas sobre respuestas dadas, sumando lectura y vocabulario.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={load} className="px-3 py-2 rounded-lg border border-stone-200 text-xs font-bold text-stone-700 hover:bg-stone-50 flex items-center gap-1.5 cursor-pointer">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Actualizar
          </button>
          <button onClick={exportCsv} disabled={visible.length === 0} className="px-3 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer">
            <Download className="w-3.5 h-3.5 text-amber-400" /> Descargar lista
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
        {kpis.map(k => (
          <div key={k.label} className="rounded-lg border border-stone-200 p-3 flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${k.tone}`}><k.icon className="w-4 h-4" /></div>
            <div className="min-w-0">
              <div className="text-lg font-black text-stone-900 leading-none">{k.value}</div>
              <div className="text-[10px] text-stone-500 mt-1 truncate">{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-2 md:items-center">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre o RUT…"
            className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {filters.map(([id, label]) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${filter === id ? 'bg-amber-700 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs font-medium">{error}</div>}

      <div className="overflow-x-auto rounded-lg border border-stone-200">
        <table className="w-full text-xs min-w-[760px]">
          <thead className="bg-stone-50 text-stone-500 text-left">
            <tr>
              <SortHead k="name" label="Estudiante" />
              <SortHead k="progress" label="Avance" />
              <SortHead k="streak" label="Racha" className="text-center" />
              <SortHead k="achievement" label="% Logro" />
              <SortHead k="last" label="Última actividad" className="text-right" />
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {visible.map((r, i) => {
              const hasData = r.readingAnswers + r.vocabAnswers > 0;
              return (
                <motion.tr
                  key={r.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i, 12) * 0.02 }}
                  className="hover:bg-amber-50/40"
                >
                  <td className="px-4 py-3">
                    <div className="font-bold text-stone-900">{r.name}</div>
                    {r.rut && <div className="text-[10px] text-stone-400 font-mono">{r.rut}</div>}
                  </td>
                  <td className="px-4 py-3 w-64">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-stone-100 overflow-hidden">
                        <motion.div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-600" initial={{ width: 0 }} animate={{ width: `${r.progressPct}%` }} transition={{ duration: 0.6 }} />
                      </div>
                      <span className="font-black text-stone-900 w-9 text-right">{r.progressPct}%</span>
                    </div>
                    <div className="text-[10px] text-stone-500 mt-1">
                      {r.activitiesDone}/{r.activitiesTotal} actividades · {r.vocabDone}/{r.vocabTotal} palabras
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {r.streakDays > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-800 font-black">
                        <Flame className="w-3.5 h-3.5 text-orange-500" /> {r.streakDays} {r.streakDays === 1 ? 'día' : 'días'}
                      </span>
                    ) : (
                      <span className="text-stone-400">0 días</span>
                    )}
                    {r.bestStreak > 0 && <div className="text-[10px] text-stone-400 mt-1">Récord: {r.bestStreak}</div>}
                  </td>
                  <td className="px-4 py-3 w-56">
                    {hasData ? (
                      <>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full bg-stone-100 overflow-hidden">
                            <motion.div className={`h-full rounded-full ${logroBar(r.achievementPct)}`} initial={{ width: 0 }} animate={{ width: `${r.achievementPct}%` }} transition={{ duration: 0.6 }} />
                          </div>
                          <span className={`font-black w-9 text-right ${logroTone(r.achievementPct, true)}`}>{r.achievementPct}%</span>
                        </div>
                        <div className="text-[10px] text-stone-500 mt-1">
                          Lectura {r.readingPct ?? '—'}{r.readingPct !== null && '%'} · Vocabulario {r.vocabPct ?? '—'}{r.vocabPct !== null && '%'}
                        </div>
                      </>
                    ) : (
                      <span className="text-stone-400">Sin respuestas</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-stone-500 text-[11px]">{relativeDay(r.lastActivity)}</td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
        {!loading && visible.length === 0 && (
          <div className="p-8 text-center text-xs text-stone-500">
            {rows.length === 0 ? 'Aún no hay estudiantes registrados.' : 'Ningún estudiante coincide con los filtros.'}
          </div>
        )}
      </div>
    </div>
  );
};
