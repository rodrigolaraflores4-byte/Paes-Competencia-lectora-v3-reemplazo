/**
 * Utilidades para el sistema de Racha de Días (Estilo Duolingo)
 * Registra y computa días consecutivos de práctica activa del estudiante.
 */

import { api } from '../api/client.js';

const STREAK_KEY = 'paes_student_streak_v1';

export interface StreakData {
  currentStreak: number;
  highestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  history: string[]; // List of YYYY-MM-DD
}

function formatDateToIso(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayIso(): string {
  return formatDateToIso(new Date());
}

export function getYesterdayIso(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return formatDateToIso(d);
}

export function getStoredStreak(userId: string = 'default'): StreakData {
  try {
    const raw = localStorage.getItem(`${STREAK_KEY}_${userId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Validar si la racha se rompió (no practicó ni hoy ni ayer)
      const today = getTodayIso();
      const yesterday = getYesterdayIso();
      if (parsed.lastActiveDate !== today && parsed.lastActiveDate !== yesterday) {
        // Racha expirada si pasó más de un día
        if (parsed.lastActiveDate && parsed.lastActiveDate < yesterday) {
          parsed.currentStreak = 0;
        }
      }
      return parsed;
    }
  } catch {
    // ignore
  }

  return {
    currentStreak: 1, // Motivación inicial al empezar
    highestStreak: 1,
    lastActiveDate: getTodayIso(),
    history: [getTodayIso()],
  };
}

export function recordStreakActivity(userId: string = 'default'): {
  streak: StreakData;
  isNewDay: boolean;
  message: string;
} {
  const today = getTodayIso();
  const yesterday = getYesterdayIso();
  const current = getStoredStreak(userId);

  if (current.lastActiveDate === today) {
    // Ya registró actividad hoy, mantener
    return {
      streak: current,
      isNewDay: false,
      message: '¡Ya aseguraste tu racha de hoy! Vuelve mañana para seguir sumando días.',
    };
  }

  let newStreakCount = 1;
  let isConsecutive = false;

  if (current.lastActiveDate === yesterday) {
    // Practicó ayer: suma 1 día consecutivo
    newStreakCount = (current.currentStreak || 0) + 1;
    isConsecutive = true;
  } else {
    // Se interrumpió la racha o es primera vez
    newStreakCount = 1;
  }

  const updatedHistory = Array.from(new Set([...(current.history || []), today]));
  const highest = Math.max(current.highestStreak || 0, newStreakCount);

  const updated: StreakData = {
    currentStreak: newStreakCount,
    highestStreak: highest,
    lastActiveDate: today,
    history: updatedHistory,
  };

  try {
    localStorage.setItem(`${STREAK_KEY}_${userId}`, JSON.stringify(updated));
  } catch (err) {
    console.warn('Could not save streak to storage:', err);
  }
  // Respaldo en el servidor (y de ahí a Supabase) para no perder la racha al cambiar de dispositivo
  void api.saveStreak(updated);

  return {
    streak: updated,
    isNewDay: true,
    message: isConsecutive
      ? `¡Racha incrementada a ${newStreakCount} días consecutivos! 🔥`
      : '¡Iniciaste una nueva racha hoy! Vuelve mañana para no perderla.',
  };
}


/**
 * Recupera la racha guardada en el servidor (si es más reciente que la local)
 * para que no se pierda al cambiar de navegador o dispositivo.
 */
export async function hydrateStreakFromServer(userId: string): Promise<StreakData | null> {
  const { streak } = await api.getStreak();
  if (!streak || !streak.lastActiveDate) return null;
  const local = getStoredStreak(userId);
  if (streak.lastActiveDate >= (local.lastActiveDate || '')) {
    const merged: StreakData = {
      currentStreak: streak.currentStreak,
      highestStreak: Math.max(streak.highestStreak, local.highestStreak || 0),
      lastActiveDate: streak.lastActiveDate,
      history: Array.from(new Set([...(streak.history || []), ...(local.history || [])])).sort(),
    };
    try { localStorage.setItem(`${STREAK_KEY}_${userId}`, JSON.stringify(merged)); } catch { /* ignore */ }
    return getStoredStreak(userId);
  }
  return null;
}
