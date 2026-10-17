import React, { useState, useEffect } from 'react';
import { api } from '../../api/client.js';
import { 
  Database, 
  ShieldCheck, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink, 
  AlertCircle, 
  Save, 
  UploadCloud, 
  DownloadCloud, 
  RefreshCw,
  Users,
  BookOpen,
  Award
} from 'lucide-react';

export const SupabaseSettings: React.FC = () => {
  const [status, setStatus] = useState<any>(null);
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [sqlSchema, setSqlSchema] = useState('');
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadStatus = () => {
    api.getSupabaseStatus().then(res => {
      setStatus(res.status);
      if (res.status.url && !url) {
        setUrl(res.status.url);
      }
    }).catch(console.error);

    api.getSupabaseSchema().then(res => {
      setSqlSchema(res.sql);
    }).catch(console.error);
  };

  useEffect(() => {
    loadStatus();
    const id = setInterval(() => {
      api.getSupabaseStatus().then(res => setStatus(res.status)).catch(() => {});
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const res = await api.updateSupabaseConfig(url, anonKey);
      setStatus(res.status);
      setFeedback({
        type: 'success',
        message: 'Credenciales de Supabase guardadas y verificadas con éxito. Base de datos vinculada.',
      });
      loadStatus();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Error al conectar con Supabase. Revisa la URL y la Anon Key.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePushBackup = async () => {
    setPushing(true);
    setFeedback(null);
    try {
      const res = await api.syncPushToSupabase();
      setFeedback({
        type: 'success',
        message: res.message || 'Respaldo completo subido exitosamente a Supabase.',
      });
      loadStatus();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Error al respaldar en Supabase. Verifica tu conexión.',
      });
    } finally {
      setPushing(false);
    }
  };

  const handlePullRestore = async () => {
    setPulling(true);
    setFeedback(null);
    try {
      const res = await api.syncPullFromSupabase();
      setFeedback({
        type: 'success',
        message: res.message || 'Datos recuperados exitosamente desde Supabase.',
      });
      loadStatus();
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Error al recuperar datos desde Supabase.',
      });
    } finally {
      setPulling(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const isConnected = Boolean(status?.isConnected);

  return (
    <div className="space-y-6">
      {feedback && (
        <div className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="font-bold text-stone-500 hover:text-stone-800 ml-3">×</button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
        <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
          <Database className="w-5 h-5 text-amber-700" />
          Respaldo Permanente en la Nube con Supabase
        </h2>
        <p className="text-xs text-stone-600 mt-1 leading-relaxed">
          Garantiza que la base de datos de tus estudiantes, sus claves de acceso, los textos y los progresos nunca se pierdan al publicar en Vercel u otro hosting público.
        </p>
      </div>

      {/* Cloud Persistence Architecture Banner */}
      <div className={`border p-4 rounded-xl flex items-start gap-3.5 transition-colors ${
        isConnected 
          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' 
          : 'bg-amber-50/80 border-amber-200 text-amber-950'
      }`}>
        {isConnected ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        ) : (
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        )}
        <div className="text-xs space-y-1.5 flex-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm">
              {isConnected 
                ? 'Conexión Activa con Supabase Cloud' 
                : 'Supabase Pendiente de Conexión'}
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
              isConnected 
                ? 'bg-emerald-200 text-emerald-900' 
                : 'bg-amber-200 text-amber-900'
            }`}>
              {isConnected ? 'Sincronizado' : 'Modo Local'}
            </span>
          </div>
          <p className="leading-relaxed">
            {isConnected 
              ? 'Tus datos se respaldan de manera permanente en los servidores cloud de Supabase. Incluso si Vercel reinicia sus instancias o actualizas la web, la nómina de estudiantes, sus claves y las evaluaciones permanecen intactas.' 
              : 'Vercel es una plataforma con almacenamiento temporal que puede descartar datos locales al reiniciar. Conecta tu proyecto de Supabase en 4 sencillos pasos para que los datos queden respaldados permanentemente.'}
          </p>
          
          {/* Quick Stats if connected */}
          {status?.stats && (
            <div className="flex flex-wrap gap-4 pt-2 border-t border-emerald-200/60 text-[11px] font-semibold">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-700" />
                {status.stats.totalUsers} Usuarios ({status.stats.totalStudents} estudiantes)
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                {status.stats.totalTexts} Textos y {status.stats.totalQuestions} Preguntas
              </span>
              <span className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-emerald-700" />
                {status.stats.totalAttempts} Evaluaciones Registradas
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                {status.stats.totalVocab ?? 0} Palabras de Vocabulario
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Guardado automático: estado en vivo y pasos para dejarlo permanente */}
      <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 text-amber-700 ${status?.sync?.state === 'syncing' ? 'animate-spin' : ''}`} />
            Guardado automático
          </h3>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
            status?.sync?.state === 'error' ? 'bg-red-100 text-red-800'
            : status?.sync?.state === 'ok' ? 'bg-emerald-100 text-emerald-800'
            : status?.sync?.state === 'syncing' || status?.sync?.state === 'loading' ? 'bg-amber-100 text-amber-800'
            : 'bg-stone-100 text-stone-600'
          }`}>
            {status?.sync?.state === 'error' ? 'Con error'
              : status?.sync?.state === 'ok' ? 'Al día'
              : status?.sync?.state === 'syncing' ? 'Guardando'
              : status?.sync?.state === 'loading' ? 'Cargando'
              : 'Inactivo'}
          </span>
        </div>
        <p className="text-xs text-stone-600 leading-relaxed">
          Cada cambio (estudiantes, textos, preguntas, vocabulario, respuestas y rachas) se sube solo a Supabase, y al reiniciarse el servidor los datos se cargan de vuelta automáticamente. No necesitas pulsar ningún botón.
        </p>
        {status?.sync?.lastSyncAt && (
          <p className="text-[11px] text-stone-500">
            Última sincronización: <strong>{new Date(status.sync.lastSyncAt).toLocaleString('es-CL')}</strong>
          </p>
        )}
        {status?.sync?.state === 'error' && status.sync.lastError && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-[11px] text-red-900 leading-relaxed">
            <strong>No se pudo sincronizar:</strong> {status.sync.lastError}
          </div>
        )}
        <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-[11px] text-amber-950 leading-relaxed space-y-1">
          <div className="font-bold">Para que sea permanente en Vercel (una sola vez):</div>
          <ol className="list-decimal ml-4 space-y-0.5">
            <li>En Supabase → SQL Editor, ejecuta el archivo <code className="font-mono">supabase-migration.sql</code> del proyecto.</li>
            <li>En Vercel → Settings → Environment Variables, agrega <code className="font-mono">SUPABASE_URL</code> y <code className="font-mono">SUPABASE_ANON_KEY</code> y vuelve a desplegar.</li>
          </ol>
          <div>Sin esas variables, Vercel olvida la conexión en cada reinicio y los datos vuelven a los de ejemplo.</div>
        </div>
      </div>

      {/* Cloud Action Buttons */}
      <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
          <UploadCloud className="w-4 h-4 text-amber-700" />
          Acciones de Sincronización Inmediata
        </h3>
        <p className="text-xs text-stone-500">
          Ejecuta un respaldo completo o descarga la información alojada en tu base de datos Supabase:
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <button
            type="button"
            onClick={handlePushBackup}
            disabled={pushing || !url}
            className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-2 transition-colors"
          >
            <UploadCloud className="w-4 h-4 text-amber-300" />
            {pushing ? 'Subiendo datos a Supabase...' : 'Respaldar Todo en Supabase Ahora'}
          </button>

          <button
            type="button"
            onClick={handlePullRestore}
            disabled={pulling || !url}
            className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 disabled:opacity-50 border border-stone-300 rounded-lg text-xs font-bold shadow-xs flex items-center gap-2 transition-colors"
          >
            <DownloadCloud className="w-4 h-4 text-amber-700" />
            {pulling ? 'Cargando datos desde Supabase...' : 'Recuperar Datos desde Supabase'}
          </button>
        </div>
      </div>

      {/* Guía Rápida en 4 Pasos */}
      <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
          <ExternalLink className="w-4 h-4 text-amber-700" />
          Guía de Configuración: 4 Pasos para Vincular Supabase
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-lg bg-stone-50 border border-stone-200 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-xs text-amber-800">
              <span className="w-5 h-5 rounded-full bg-amber-700 text-white flex items-center justify-center text-[10px]">1</span>
              <span>Crea tu Proyecto</span>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Ingresa a <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-amber-700 underline font-semibold">supabase.com</a>, crea tu cuenta gratuita y selecciona <strong>New Project</strong>.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-stone-50 border border-stone-200 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-xs text-amber-800">
              <span className="w-5 h-5 rounded-full bg-amber-700 text-white flex items-center justify-center text-[10px]">2</span>
              <span>Ejecuta el Script SQL</span>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Copia el código del <strong>Script SQL</strong> ubicado abajo (botón «Copiar SQL») y pégalo en el <strong>SQL Editor</strong> de Supabase.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-stone-50 border border-stone-200 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-xs text-amber-800">
              <span className="w-5 h-5 rounded-full bg-amber-700 text-white flex items-center justify-center text-[10px]">3</span>
              <span>Copia Credenciales</span>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              En tu proyecto ve a <strong>Project Settings → API</strong>. Copia la <strong>Project URL</strong> y la <strong>anon public key</strong>.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-stone-50 border border-stone-200 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-xs text-amber-800">
              <span className="w-5 h-5 rounded-full bg-amber-700 text-white flex items-center justify-center text-[10px]">4</span>
              <span>Guarda y Vincula</span>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Pega la URL y la Anon Key en el formulario inferior y haz clic en <strong>Guardar y Verificar Credenciales</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Supabase Config Form */}
      <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-stone-900">
            Formulario de Conexión de Supabase
          </h3>
          <p className="text-xs text-stone-500">
            Ingresa las credenciales de tu proyecto de Supabase. Estas también pueden definirse como variables de entorno en Vercel (<code>VITE_SUPABASE_URL</code> y <code>VITE_SUPABASE_ANON_KEY</code>).
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Project URL de Supabase (VITE_SUPABASE_URL)
            </label>
            <input
              type="text"
              placeholder="https://xyzabcdefghijklm.supabase.co"
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Anon Public API Key (VITE_SUPABASE_ANON_KEY)
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKey}
              onChange={e => setAnonKey(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 font-mono"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Guardando...' : 'Guardar y Verificar Credenciales'}
            </button>
            {isConnected && (
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                <Check className="w-4 h-4" /> Conectado con Éxito
              </span>
            )}
          </div>
        </form>
      </div>

      {/* SQL Script Viewer */}
      <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              Script SQL de Tablas y Políticas RLS
            </h3>
            <p className="text-xs text-stone-500">
              Copia este script completo y ejecútalo una única vez en el SQL Editor de tu panel de Supabase.
            </p>
          </div>
          <button
            onClick={handleCopySql}
            className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-700" />
                <span>Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar SQL</span>
              </>
            )}
          </button>
        </div>

        <div className="relative">
          <pre className="p-4 bg-stone-900 text-stone-100 rounded-lg text-xs font-mono max-h-72 overflow-y-auto reading-scrollbar">
            {sqlSchema || '-- Cargando esquema SQL...'}
          </pre>
        </div>
      </div>
    </div>
  );
};
