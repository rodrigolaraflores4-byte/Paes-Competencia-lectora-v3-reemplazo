import React, { useState } from 'react';
import { KeyRound, Eye, EyeOff, CheckCircle2, AlertCircle, X, ShieldCheck } from 'lucide-react';
import { api } from '../../api/client.js';
import { User } from '../../types/index.js';

interface ChangePasswordModalProps {
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!newPassword || newPassword.trim().length < 4) {
      setError('La nueva contraseña debe tener al menos 4 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden. Por favor verifica que ambas sean idénticas.');
      return;
    }

    if (newPassword === currentPassword) {
      setError('La nueva contraseña debe ser diferente a la contraseña actual.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.changePassword(currentPassword, newPassword);
      setSuccessMessage(res.message || '¡Tu contraseña ha sido actualizada exitosamente!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'No fue posible actualizar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccessMessage(null);
    onClose();
  };

  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight text-white flex items-center gap-2">
                Cambiar Contraseña
              </h3>
              <p className="text-xs text-stone-300">
                {currentUser.name} · {currentUser.role === 'docente' ? 'Docente' : 'Estudiante'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {successMessage ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-lg text-stone-900">¡Contraseña Actualizada!</h4>
                <p className="text-sm text-stone-600 max-w-sm mx-auto">
                  {successMessage}
                </p>
              </div>
              <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 text-xs text-amber-900 text-left">
                <strong>Recordatorio:</strong> Tu usuario activo sigue conectado. La próxima vez que inicies sesión desde el acceso principal, utiliza tu nueva contraseña establecida.
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
                >
                  Entendido y Continuar
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-stone-600">
                Ingresa tu contraseña actual y define una nueva clave personal para proteger tu cuenta en la plataforma.
              </p>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Current password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Contraseña Actual
                </label>
                <div className="relative">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Contraseña actual (ej. paes2026)"
                    className="w-full pl-3 pr-10 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-stone-400 mt-1">
                  Si nunca la has cambiado, la clave inicial por defecto es <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-700 font-mono">paes2026</code>.
                </p>
              </div>

              {/* New password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 4 caracteres"
                    minLength={4}
                    className="w-full pl-3 pr-10 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center justify-between">
                  <span>Confirmar Nueva Contraseña</span>
                  {passwordsMatch && (
                    <span className="text-[11px] text-emerald-600 font-normal flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Coinciden
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite la nueva contraseña"
                    className={`w-full pl-3 pr-10 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 ${
                      passwordsMatch
                        ? 'border-emerald-300 focus:ring-emerald-500/20 focus:border-emerald-500'
                        : 'border-stone-200 focus:ring-amber-600/30 focus:border-amber-600'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 border border-stone-200 hover:bg-stone-50 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !newPassword || !confirmPassword}
                  className="px-5 py-2 text-xs font-bold bg-amber-700 hover:bg-amber-800 disabled:bg-stone-300 text-white rounded-xl shadow-xs transition-colors flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Actualizar Contraseña</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
