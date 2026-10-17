import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { BookOpen, Lock, User, AlertCircle, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { cleanRut, formatRut } from '../../utils/rut.js';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setIdentifier(val);
  };

  const handleIdentifierBlur = () => {
    const raw = identifier.trim();
    // Si no contiene '@' y parece un RUT chileno (al menos 7 caracteres alfanuméricos)
    if (!raw.includes('@') && raw.length >= 7) {
      const cleaned = cleanRut(raw);
      if (cleaned.length >= 7 && cleaned.length <= 9) {
        setIdentifier(formatRut(cleaned));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Por favor ingresa tu RUT chileno o tu correo electrónico.');
      return;
    }

    if (!password.trim()) {
      setError('Por favor ingresa tu contraseña.');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await login(identifier.trim(), password.trim());
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans-ui text-stone-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex w-14 h-14 rounded-2xl bg-amber-800 text-white items-center justify-center font-bold text-2xl shadow-md mb-3">
          <BookOpen className="w-7 h-7 text-amber-200" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">
          PAES Lector
        </h1>
        <p className="text-xs text-stone-600 mt-1 max-w-sm mx-auto">
          Plataforma de Preparación para la Competencia Lectora · Enseñanza Media
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-md rounded-2xl border border-stone-200 sm:px-10">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-stone-900">
              Iniciar Sesión
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Ingresa con tu RUT chileno (o correo electrónico) y tu contraseña.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                RUT Chileno o Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="ej: 12.345.678-5 o 20.123.456-7"
                  value={identifier}
                  onChange={handleIdentifierChange}
                  onBlur={handleIdentifierBlur}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 bg-stone-50/50"
                  required
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                Puedes escribir tu RUT con puntos y guion (ej: 12.345.678-5 o 20.123.456-7) o sin formato.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                  Contraseña
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 bg-stone-50/50"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 bg-amber-800 hover:bg-amber-900 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>{submitting ? 'Ingresando...' : 'Entrar a PAES Lector'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 text-center text-xs text-stone-500">
          <span>PAES de Competencia Lectora · Marco Oficial DEMRE</span>
        </div>
      </div>
    </div>
  );
};
