import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cloud, CloudOff, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { api } from '../../api/client.js';

interface Props {
  onClick?: () => void;
}

type View = { icon: React.ReactNode; label: string; tone: string; title: string };

/** Indicador del guardado automático en Supabase (se actualiza solo). */
export const SyncBadge: React.FC<Props> = ({ onClick }) => {
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const res = await api.getSupabaseStatus();
        if (alive) setStatus(res.status);
      } catch {
        /* se mantiene el último estado */
      }
    };
    tick();
    const id = setInterval(tick, 6000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  if (!status) return null;

  const sync = status.sync;
  let view: View;
  if (!status.configured || sync?.state === 'disabled') {
    view = { icon: <CloudOff className="w-3.5 h-3.5" />, label: 'Sin nube', tone: 'bg-stone-100 text-stone-600 border-stone-200', title: 'Supabase no está vinculado: los datos pueden perderse. Clic para configurarlo.' };
  } else if (sync?.state === 'error') {
    view = { icon: <AlertCircle className="w-3.5 h-3.5" />, label: 'Error de guardado', tone: 'bg-red-50 text-red-800 border-red-300', title: sync.lastError || 'No se pudo sincronizar con Supabase.' };
  } else if (sync?.state === 'syncing' || sync?.state === 'loading' || sync?.pending) {
    view = { icon: <RefreshCw className="w-3.5 h-3.5 animate-spin" />, label: 'Guardando…', tone: 'bg-amber-50 text-amber-900 border-amber-300', title: 'Subiendo cambios a Supabase.' };
  } else {
    const at = sync?.lastSyncAt ? new Date(sync.lastSyncAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) : '';
    view = { icon: <Cloud className="w-3.5 h-3.5" />, label: 'Guardado en la nube', tone: 'bg-emerald-50 text-emerald-800 border-emerald-300', title: at ? `Última sincronización: ${at}` : 'Conectado a Supabase.' };
  }

  return (
    <button
      onClick={onClick}
      title={view.title}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-bold transition-colors cursor-pointer ${view.tone}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={view.label}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          className="flex items-center"
        >
          {view.icon}
        </motion.span>
      </AnimatePresence>
      <span className="hidden md:inline">{view.label}</span>
      {view.label === 'Guardado en la nube' && <CheckCircle2 className="w-3 h-3 hidden lg:block opacity-60" />}
    </button>
  );
};
