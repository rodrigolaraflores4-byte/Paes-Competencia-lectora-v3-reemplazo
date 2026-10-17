import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../api/client.js';
import { VocabExercise, VocabAnalytics, OptionLetter } from '../../types/index.js';
import {
  BookMarked,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  BarChart3,
  Loader2,
  Save,
  Users,
  Target,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

type Draft = Omit<VocabExercise, 'id'>;
const LETTERS: OptionLetter[] = ['A', 'B', 'C', 'D'];

const emptyDraft = (): Draft => ({
  target_word: '',
  context_sentence: '',
  full_passage: '',
  source: '',
  category: 'literario',
  difficulty: 'medio',
  options: {
    A: { synonym: '', justification: '' },
    B: { synonym: '', justification: '' },
    C: { synonym: '', justification: '' },
    D: { synonym: '', justification: '' },
  },
  correct_option: 'A',
  explanation: '',
  nuance_tip: '',
});

const DIFF_STYLE: Record<string, string> = {
  inicial: 'bg-emerald-100 text-emerald-900',
  medio: 'bg-blue-100 text-blue-900',
  avanzado: 'bg-purple-100 text-purple-900',
};

const accuracyColor = (pct: number, answers: number) =>
  answers === 0 ? 'text-stone-400' : pct >= 70 ? 'text-emerald-700' : pct >= 40 ? 'text-amber-700' : 'text-red-700';

export const VocabularyManager: React.FC = () => {
  const [exercises, setExercises] = useState<VocabExercise[]>([]);
  const [analytics, setAnalytics] = useState<VocabAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'bank' | 'results'>('bank');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('todos');
  const [difficulty, setDifficulty] = useState('todos');
  const [editing, setEditing] = useState<{ id?: string; draft: Draft } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<VocabExercise | null>(null);

  const notify = (ok: boolean, text: string) => {
    setToast({ ok, text });
    setTimeout(() => setToast(null), 3200);
  };

  const load = async () => {
    try {
      const [v, a] = await Promise.all([api.getVocab(), api.getVocabAnalytics().catch(() => null)]);
      setExercises(v.exercises);
      setAnalytics(a?.analytics ?? null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const statsByWord = useMemo(() => new Map((analytics?.perWord ?? []).map(w => [w.id, w])), [analytics]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return exercises.filter(e => {
      if (category !== 'todos' && e.category !== category) return false;
      if (difficulty !== 'todos' && e.difficulty !== difficulty) return false;
      if (!q) return true;
      return e.target_word.toLowerCase().includes(q) || e.context_sentence.toLowerCase().includes(q);
    });
  }, [exercises, search, category, difficulty]);

  const openNew = () => {
    setError('');
    setEditing({ draft: emptyDraft() });
  };

  const openEdit = (ex: VocabExercise) => {
    const { id, ...rest } = ex;
    setError('');
    setEditing({ id, draft: JSON.parse(JSON.stringify(rest)) });
  };

  const setField = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setEditing(prev => (prev ? { ...prev, draft: { ...prev.draft, [key]: value } } : prev));

  const setOption = (letter: OptionLetter, field: 'synonym' | 'justification', value: string) =>
    setEditing(prev =>
      prev
        ? {
            ...prev,
            draft: {
              ...prev.draft,
              options: { ...prev.draft.options, [letter]: { ...prev.draft.options[letter], [field]: value } },
            },
          }
        : prev
    );

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    setError('');
    try {
      await api.saveVocab(editing.draft, editing.id);
      setEditing(null);
      await load();
      notify(true, editing.id ? 'Palabra actualizada y guardada en la nube.' : 'Palabra creada y guardada en la nube.');
    } catch (e: any) {
      setError(e.message || 'No se pudo guardar la palabra.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await api.deleteVocab(confirmDelete.id);
      setConfirmDelete(null);
      await load();
      notify(true, 'Palabra eliminada.');
    } catch (e: any) {
      setConfirmDelete(null);
      notify(false, e.message || 'No se pudo eliminar.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-stone-500 gap-2 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" /> Cargando vocabulario…
      </div>
    );
  }

  const hardest = [...(analytics?.perWord ?? [])].filter(w => w.answers >= 1).sort((a, b) => a.accuracy - b.accuracy).slice(0, 5);

  return (
    <div className="space-y-5">
      {/* Encabezado */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
            <BookMarked className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900">Vocabulario y léxico en contexto</h2>
            <p className="text-xs text-stone-600 mt-0.5 max-w-xl leading-relaxed">
              Crea y edita las palabras que practican tus estudiantes. Todo se guarda automáticamente en Supabase y
              verás cómo les va en cada palabra.
            </p>
          </div>
        </div>
        <button
          onClick={openNew}
          className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Nueva palabra
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: BookMarked, label: 'Palabras en el banco', value: exercises.length, tone: 'text-purple-800 bg-purple-50' },
          { icon: Target, label: 'Respuestas de estudiantes', value: analytics?.totalAnswers ?? 0, tone: 'text-blue-800 bg-blue-50' },
          { icon: CheckCircle2, label: 'Precisión general', value: `${analytics?.overallAccuracy ?? 0}%`, tone: 'text-emerald-800 bg-emerald-50' },
          {
            icon: Users,
            label: 'Estudiantes que practicaron',
            value: (analytics?.perStudent ?? []).filter(s => s.answered > 0).length,
            tone: 'text-amber-800 bg-amber-50',
          },
        ].map(k => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs flex items-center gap-3"
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${k.tone}`}>
              <k.icon className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xl font-black text-stone-900 leading-none">{k.value}</div>
              <div className="text-[11px] text-stone-500 mt-1">{k.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pestañas internas */}
      <div className="flex gap-1.5">
        {([
          ['bank', 'Banco de palabras', BookMarked],
          ['results', 'Resultados', BarChart3],
        ] as const).map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              view === id ? 'bg-stone-900 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {view === 'bank' ? (
        <>
          {/* Filtros */}
          <div className="bg-white rounded-xl border border-stone-200 p-3 flex flex-wrap items-center gap-2 text-xs">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar palabra o fragmento…"
                className="w-full pl-8 pr-3 py-2 rounded-lg border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
            </div>
            <select value={category} onChange={e => setCategory(e.target.value)} className="px-2.5 py-2 rounded-lg border border-stone-200 bg-stone-50 font-medium capitalize">
              {['todos', 'literario', 'academico', 'filosofico', 'periodistico'].map(c => (
                <option key={c} value={c}>{c === 'todos' ? 'Todas las categorías' : c}</option>
              ))}
            </select>
            <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="px-2.5 py-2 rounded-lg border border-stone-200 bg-stone-50 font-medium capitalize">
              {['todos', 'inicial', 'medio', 'avanzado'].map(c => (
                <option key={c} value={c}>{c === 'todos' ? 'Todas las dificultades' : c}</option>
              ))}
            </select>
          </div>

          {/* Lista */}
          <div className="grid gap-3 md:grid-cols-2">
            <AnimatePresence initial={false}>
              {filtered.map(ex => {
                const st = statsByWord.get(ex.id);
                return (
                  <motion.div
                    layout
                    key={ex.id}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs hover:shadow-md hover:border-amber-300 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-lg font-black text-stone-900 font-serif tracking-tight">«{ex.target_word}»</h3>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-stone-100 text-stone-600">{ex.category}</span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${DIFF_STYLE[ex.difficulty]}`}>{ex.difficulty}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(ex)} title="Editar" className="p-2 rounded-lg hover:bg-amber-50 text-stone-600 hover:text-amber-800 cursor-pointer">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setConfirmDelete(ex)} title="Eliminar" className="p-2 rounded-lg hover:bg-red-50 text-stone-600 hover:text-red-700 cursor-pointer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-stone-600 italic leading-relaxed mt-2 line-clamp-2">{ex.context_sentence}</p>
                    <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px]">
                      <span className="text-stone-500">
                        Correcta: <strong className="text-stone-800">{ex.correct_option}) {ex.options[ex.correct_option].synonym}</strong>
                      </span>
                      <span className={`font-bold ${accuracyColor(st?.accuracy ?? 0, st?.answers ?? 0)}`}>
                        {st && st.answers > 0 ? `${st.accuracy}% acierto · ${st.answers} resp.` : 'Sin respuestas aún'}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
          {filtered.length === 0 && (
            <div className="p-10 text-center text-sm text-stone-500 bg-white rounded-xl border border-stone-200">
              No hay palabras que coincidan. Prueba otros filtros o crea una nueva.
            </div>
          )}
        </>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs">
            <h3 className="text-sm font-bold text-stone-900 mb-3">Palabras que más cuestan</h3>
            {hardest.length === 0 ? (
              <p className="text-xs text-stone-500">Aún no hay respuestas de estudiantes.</p>
            ) : (
              <div className="space-y-3">
                {hardest.map(w => (
                  <div key={w.id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-bold font-serif text-stone-800">{w.target_word}</span>
                      <span className={`font-bold ${accuracyColor(w.accuracy, w.answers)}`}>{w.accuracy}% · {w.answers} resp.</span>
                    </div>
                    <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${w.accuracy >= 70 ? 'bg-emerald-500' : w.accuracy >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${w.accuracy}%` }}
                        transition={{ duration: 0.6 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs">
            <h3 className="text-sm font-bold text-stone-900 mb-3">Estudiantes</h3>
            <div className="max-h-[420px] overflow-y-auto reading-scrollbar -mx-1 px-1">
              <table className="w-full text-xs">
                <thead className="text-stone-500 text-left">
                  <tr>
                    <th className="pb-2 font-semibold">Nombre</th>
                    <th className="pb-2 font-semibold text-right">Resp.</th>
                    <th className="pb-2 font-semibold text-right">Acierto</th>
                    <th className="pb-2 font-semibold text-right">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {[...(analytics?.perStudent ?? [])]
                    .sort((a, b) => b.answered - a.answered || a.name.localeCompare(b.name))
                    .map(s => (
                      <tr key={s.id}>
                        <td className="py-2 font-medium text-stone-800 truncate max-w-[180px]">{s.name}</td>
                        <td className="py-2 text-right text-stone-600">{s.answered}</td>
                        <td className={`py-2 text-right font-bold ${accuracyColor(s.accuracy, s.answered)}`}>{s.answered ? `${s.accuracy}%` : '—'}</td>
                        <td className="py-2 text-right text-stone-600">{s.points}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Editor */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-start justify-center p-4 overflow-y-auto"
            onClick={() => !saving && setEditing(null)}
          >
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-6"
            >
              <div className="flex items-center justify-between p-5 border-b border-stone-100">
                <h3 className="font-bold text-stone-900">{editing.id ? 'Editar palabra' : 'Nueva palabra de vocabulario'}</h3>
                <button onClick={() => setEditing(null)} className="p-1.5 rounded-lg hover:bg-stone-100 cursor-pointer"><X className="w-4 h-4" /></button>
              </div>

              <div className="p-5 space-y-4 text-xs">
                <div className="grid sm:grid-cols-3 gap-3">
                  <label className="space-y-1 sm:col-span-1">
                    <span className="font-bold text-stone-700">Palabra *</span>
                    <input value={editing.draft.target_word} onChange={e => setField('target_word', e.target.value)} placeholder="Ej: SOSLAYAR" className="w-full px-3 py-2 rounded-lg border border-stone-200 uppercase font-bold" />
                  </label>
                  <label className="space-y-1">
                    <span className="font-bold text-stone-700">Categoría</span>
                    <select value={editing.draft.category} onChange={e => setField('category', e.target.value as Draft['category'])} className="w-full px-3 py-2 rounded-lg border border-stone-200 capitalize">
                      {['literario', 'academico', 'filosofico', 'periodistico'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </label>
                  <label className="space-y-1">
                    <span className="font-bold text-stone-700">Dificultad</span>
                    <select value={editing.draft.difficulty} onChange={e => setField('difficulty', e.target.value as Draft['difficulty'])} className="w-full px-3 py-2 rounded-lg border border-stone-200 capitalize">
                      {['inicial', 'medio', 'avanzado'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </label>
                </div>

                <label className="block space-y-1">
                  <span className="font-bold text-stone-700">Oración de contexto * <span className="font-normal text-stone-400">(escribe la palabra en mayúsculas dentro de la oración)</span></span>
                  <textarea rows={2} value={editing.draft.context_sentence} onChange={e => setField('context_sentence', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-200 font-serif" />
                </label>
                <label className="block space-y-1">
                  <span className="font-bold text-stone-700">Fragmento completo <span className="font-normal text-stone-400">(opcional)</span></span>
                  <textarea rows={3} value={editing.draft.full_passage || ''} onChange={e => setField('full_passage', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-200 font-serif" />
                </label>
                <label className="block space-y-1">
                  <span className="font-bold text-stone-700">Fuente <span className="font-normal text-stone-400">(opcional)</span></span>
                  <input value={editing.draft.source || ''} onChange={e => setField('source', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-200" />
                </label>

                <div className="space-y-2">
                  <span className="font-bold text-stone-700 block">Alternativas * <span className="font-normal text-stone-400">(marca la correcta)</span></span>
                  {LETTERS.map(l => {
                    const correct = editing.draft.correct_option === l;
                    return (
                      <div key={l} className={`grid sm:grid-cols-[auto_150px_1fr] gap-2 items-center p-2.5 rounded-xl border transition-colors ${correct ? 'border-emerald-400 bg-emerald-50/60' : 'border-stone-200'}`}>
                        <button
                          type="button"
                          onClick={() => setField('correct_option', l)}
                          title="Marcar como correcta"
                          className={`w-8 h-8 rounded-lg font-bold text-xs cursor-pointer transition-colors ${correct ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                        >
                          {l}
                        </button>
                        <input value={editing.draft.options[l].synonym} onChange={e => setOption(l, 'synonym', e.target.value)} placeholder="SINÓNIMO" className="px-3 py-2 rounded-lg border border-stone-200 uppercase font-bold" />
                        <input value={editing.draft.options[l].justification || ''} onChange={e => setOption(l, 'justification', e.target.value)} placeholder="porque… (justificación contextual)" className="px-3 py-2 rounded-lg border border-stone-200" />
                      </div>
                    );
                  })}
                </div>

                <label className="block space-y-1">
                  <span className="font-bold text-stone-700">Explicación de la respuesta correcta *</span>
                  <textarea rows={3} value={editing.draft.explanation} onChange={e => setField('explanation', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-200" />
                </label>
                <label className="block space-y-1">
                  <span className="font-bold text-stone-700">Tip PAES <span className="font-normal text-stone-400">(opcional)</span></span>
                  <textarea rows={2} value={editing.draft.nuance_tip} onChange={e => setField('nuance_tip', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-stone-200" />
                </label>

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 p-5 border-t border-stone-100">
                <button onClick={() => setEditing(null)} disabled={saving} className="px-4 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-700 hover:bg-stone-50 cursor-pointer">Cancelar</button>
                <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 disabled:opacity-60 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Guardando…' : 'Guardar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmar eliminación */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-stone-900/50 flex items-center justify-center p-4" onClick={() => setConfirmDelete(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()} className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <h3 className="font-bold text-stone-900">¿Eliminar «{confirmDelete.target_word}»?</h3>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">También se borrarán las respuestas que los estudiantes dieron a esta palabra. Esta acción no se puede deshacer.</p>
              <div className="flex justify-end gap-2 mt-5">
                <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-bold cursor-pointer">Cancelar</button>
                <button onClick={handleDelete} className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer">Eliminar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Aviso */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-[60] px-4 py-2.5 rounded-xl text-xs font-bold shadow-xl text-white ${toast.ok ? 'bg-emerald-600' : 'bg-red-600'}`}
          >
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
