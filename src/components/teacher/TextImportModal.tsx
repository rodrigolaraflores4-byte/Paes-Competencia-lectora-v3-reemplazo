import React, { useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../api/client.js';
import { parseTextImport, TEXT_IMPORT_TEMPLATE, AI_CONVERSION_PROMPT } from '../../utils/textImport.js';
import {
  X,
  Upload,
  FileDown,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  FileText,
} from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
}

type ResultRow = { title: string; ok: boolean; message: string };

export const TextImportModal: React.FC<Props> = ({ open, onClose, onImported }) => {
  const [raw, setRaw] = useState('');
  const [autoApprove, setAutoApprove] = useState(true);
  const [createAssignments, setCreateAssignments] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<ResultRow[] | null>(null);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const items = useMemo(() => (raw.trim() ? parseTextImport(raw) : []), [raw]);
  const importable = items.filter(i => !i.blocking);
  const totalQuestions = importable.reduce((n, i) => n + i.questions.length, 0);

  const reset = () => {
    setRaw('');
    setResults(null);
    setError('');
  };

  const close = () => {
    if (busy) return;
    reset();
    onClose();
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const parts: string[] = [];
    for (const f of Array.from(files)) {
      parts.push(await f.text());
    }
    setRaw(prev => [prev.trim(), ...parts].filter(Boolean).join('\n\n===\n'));
    if (fileRef.current) fileRef.current.value = '';
  };

  const downloadTemplate = () => {
    const blob = new Blob([TEXT_IMPORT_TEMPLATE], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla-textos-paes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(AI_CONVERSION_PROMPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setError('No se pudo copiar automáticamente. Descarga la plantilla y úsala como guía.');
    }
  };

  const handleImport = async () => {
    if (importable.length === 0) return;
    setBusy(true);
    setError('');
    try {
      const res = await api.importTexts(
        importable.map(({ issues, blocking, ...rest }) => rest),
        { autoApprove, createAssignments }
      );
      setResults(res.results);
      if (res.imported > 0) onImported();
    } catch (e: any) {
      setError(e.message || 'No se pudo importar. Intenta de nuevo.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-start justify-center p-4 overflow-y-auto"
          onClick={close}
        >
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-6"
          >
            <div className="flex items-center justify-between p-5 border-b border-stone-100">
              <div>
                <h3 className="font-bold text-stone-900 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-amber-700" /> Importar textos y preguntas
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">Carga varios textos con sus preguntas de una sola vez.</p>
              </div>
              <button onClick={close} className="p-1.5 rounded-lg hover:bg-stone-100 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>

            {results ? (
              <div className="p-5 space-y-3">
                <h4 className="text-sm font-bold text-stone-900">Resultado de la importación</h4>
                <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                  {results.map((r, i) => (
                    <div key={i} className={`flex items-start gap-2 p-3 rounded-lg border text-xs ${r.ok ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-red-50 border-red-200 text-red-900'}`}>
                      {r.ok ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                      <div><div className="font-bold">{r.title}</div><div>{r.message}</div></div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={reset} className="px-4 py-2 rounded-xl border border-stone-200 text-xs font-bold text-stone-700 hover:bg-stone-50 cursor-pointer">Importar más</button>
                  <button onClick={close} className="px-5 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold cursor-pointer">Listo</button>
                </div>
              </div>
            ) : (
              <div className="p-5 space-y-4 text-xs">
                <div className="grid sm:grid-cols-3 gap-2">
                  <button onClick={() => fileRef.current?.click()} className="p-3 rounded-xl border border-stone-200 hover:border-amber-400 hover:bg-amber-50/50 text-left cursor-pointer transition-colors">
                    <FileText className="w-4 h-4 text-amber-700 mb-1" />
                    <div className="font-bold text-stone-900">Subir archivo(s)</div>
                    <div className="text-stone-500">.txt o .md (puedes elegir varios)</div>
                  </button>
                  <button onClick={downloadTemplate} className="p-3 rounded-xl border border-stone-200 hover:border-amber-400 hover:bg-amber-50/50 text-left cursor-pointer transition-colors">
                    <FileDown className="w-4 h-4 text-amber-700 mb-1" />
                    <div className="font-bold text-stone-900">Descargar plantilla</div>
                    <div className="text-stone-500">Rellénala en el Bloc de notas o Word</div>
                  </button>
                  <button onClick={copyPrompt} className="p-3 rounded-xl border border-stone-200 hover:border-amber-400 hover:bg-amber-50/50 text-left cursor-pointer transition-colors">
                    <Sparkles className="w-4 h-4 text-amber-700 mb-1" />
                    <div className="font-bold text-stone-900">{copied ? '¡Instrucciones copiadas!' : 'Copiar instrucciones para IA'}</div>
                    <div className="text-stone-500">Pégalas en Claude/ChatGPT junto a tu material</div>
                  </button>
                </div>
                <input ref={fileRef} type="file" accept=".txt,.md,.text,text/plain" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />

                <label className="block space-y-1">
                  <span className="font-bold text-stone-700">O pega aquí tus textos en el formato de la plantilla</span>
                  <textarea
                    value={raw}
                    onChange={e => setRaw(e.target.value)}
                    rows={10}
                    placeholder={'TÍTULO: ...\nTIPO: argumentativo\nDIFICULTAD: medio\n\nTEXTO:\n...\n\nPREGUNTA 1 [localizar]: ...\nA) ...\nB) ...\nC) ...\nD) ...\nRESPUESTA: B\nEXPLICACIÓN: ...'}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 font-mono text-[11px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </label>

                {items.length > 0 && (
                  <div className="space-y-2">
                    <div className="font-bold text-stone-700">
                      Vista previa: {importable.length} de {items.length} texto(s) listos · {totalQuestions} pregunta(s)
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {items.map((it, i) => (
                        <div key={i} className={`p-3 rounded-lg border ${it.blocking ? 'bg-red-50 border-red-200' : it.issues.length ? 'bg-amber-50/60 border-amber-200' : 'bg-emerald-50/60 border-emerald-200'}`}>
                          <div className="flex items-start gap-2">
                            {it.blocking ? <XCircle className="w-4 h-4 text-red-600 shrink-0" /> : it.issues.length ? <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                            <div className="min-w-0">
                              <div className="font-bold text-stone-900 truncate">{it.title || '(sin título)'}</div>
                              <div className="text-stone-600">
                                {it.type.replace('_', ' ')} · {it.difficulty} · {it.content.length} caracteres · {it.questions.length} pregunta(s)
                              </div>
                              {it.issues.map((m, k) => (
                                <div key={k} className={it.blocking ? 'text-red-800' : 'text-amber-900'}>• {m}</div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" checked={autoApprove} onChange={e => setAutoApprove(e.target.checked)} className="mt-0.5" />
                    <span><strong>Aprobar automáticamente</strong> los textos que tengan preguntas completas</span>
                  </label>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" checked={createAssignments} disabled={!autoApprove} onChange={e => setCreateAssignments(e.target.checked)} className="mt-0.5" />
                    <span><strong>Crear taller formativo y ensayo</strong> para cada texto aprobado</span>
                  </label>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 font-medium">
                    <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <button onClick={close} disabled={busy} className="px-4 py-2.5 rounded-xl border border-stone-200 font-bold text-stone-700 hover:bg-stone-50 cursor-pointer">Cancelar</button>
                  <button
                    onClick={handleImport}
                    disabled={busy || importable.length === 0}
                    className="px-5 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {busy ? 'Importando…' : `Importar ${importable.length || ''} texto(s)`}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
