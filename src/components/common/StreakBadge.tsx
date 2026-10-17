import React, { useState } from 'react';
import { Flame, Calendar, Award, Sparkles, Check, X, ShieldAlert } from 'lucide-react';
import { StreakData, getTodayIso, getYesterdayIso } from '../../utils/streak.js';

interface Props {
  streak: StreakData;
  onRefresh?: () => void;
}

export const StreakBadge: React.FC<Props> = ({ streak }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const today = getTodayIso();
  const practicedToday = streak.lastActiveDate === today;

  // Compute 7 days of the current week (Lun-Dom)
  const daysOfWeek = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const now = new Date();
  const currentDayIndex = (now.getDay() + 6) % 7; // 0 = Lunes, 6 = Domingo

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-2xs border cursor-pointer ${
          practicedToday
            ? 'bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-red-500/15 border-orange-300 text-orange-950 hover:border-orange-400 hover:scale-105'
            : 'bg-stone-100 border-stone-200 text-stone-600 hover:bg-stone-200/70'
        }`}
        title="Ver tu racha de días de práctica estilo Duolingo"
      >
        <span className={`text-base leading-none transition-transform ${practicedToday ? 'animate-bounce' : 'grayscale opacity-70'}`}>
          🔥
        </span>
        <span className="font-mono font-bold tracking-tight text-sm text-orange-900">
          {streak.currentStreak}
        </span>
        <span className="text-[11px] font-semibold text-orange-900 hidden sm:inline">
          {streak.currentStreak === 1 ? 'día' : 'días'}
        </span>
      </button>

      {/* Streak Modal Popover */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-stone-200 text-center relative space-y-4">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 font-bold text-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Flame Icon Hero */}
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 bg-orange-400/20 rounded-full blur-xl animate-pulse" />
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 flex items-center justify-center shadow-lg transform -rotate-3 text-4xl">
                🔥
              </div>
            </div>

            <div>
              <div className="inline-block px-3 py-0.5 rounded-full bg-orange-100 text-orange-900 text-[11px] font-bold uppercase tracking-wider mb-1">
                Racha de Práctica PAES
              </div>
              <h3 className="text-2xl font-black text-stone-900 tracking-tight">
                ¡{streak.currentStreak} {streak.currentStreak === 1 ? 'Día de Racha' : 'Días de Racha'}!
              </h3>
              <p className="text-xs text-stone-600 mt-1">
                {practicedToday
                  ? '¡Felicidades! Has practicado hoy y mantienes tu llama encendida. Vuelve mañana para sumar otro día.'
                  : 'Completa un ejercicio de vocabulario o una lectura hoy para encender tu fuego.'}
              </p>
            </div>

            {/* Weekly Tracker Pills */}
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-2">
              <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center justify-between">
                <span>Esta semana</span>
                <span className="text-orange-900 font-bold">Récord: {streak.highestStreak} días</span>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {daysOfWeek.map((day, idx) => {
                  const isCurrent = idx === currentDayIndex;
                  const isPast = idx < currentDayIndex;
                  const active = (isCurrent && practicedToday) || (isPast && idx >= currentDayIndex - streak.currentStreak);

                  return (
                    <div key={idx} className="flex flex-col items-center gap-1">
                      <span className="text-[10px] font-bold text-stone-500">{day}</span>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        active
                          ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-xs'
                          : isCurrent
                          ? 'border-2 border-dashed border-orange-400 text-orange-600 bg-orange-50'
                          : 'bg-stone-200/70 text-stone-400'
                      }`}>
                        {active ? '🔥' : isCurrent ? '•' : ''}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Gamification Milestone Badges */}
            <div className="text-left space-y-1.5 pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                Hitos de Constancia:
              </span>
              <div className="space-y-1 text-xs">
                <div className={`flex items-center justify-between p-2 rounded-lg border ${
                  streak.highestStreak >= 3 ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-stone-50 border-stone-200 text-stone-500'
                }`}>
                  <span className="flex items-center gap-1.5 font-semibold">
                    <span>✨</span> Chispa Inicial (3 días)
                  </span>
                  <span className="font-bold text-[11px]">{streak.highestStreak >= 3 ? '¡Alcanzado!' : `${streak.currentStreak}/3`}</span>
                </div>
                <div className={`flex items-center justify-between p-2 rounded-lg border ${
                  streak.highestStreak >= 7 ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-stone-50 border-stone-200 text-stone-500'
                }`}>
                  <span className="flex items-center gap-1.5 font-semibold">
                    <span>🏆</span> Hábito Lector (7 días)
                  </span>
                  <span className="font-bold text-[11px]">{streak.highestStreak >= 7 ? '¡Alcanzado!' : `${streak.currentStreak}/7`}</span>
                </div>
                <div className={`flex items-center justify-between p-2 rounded-lg border ${
                  streak.highestStreak >= 14 ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-stone-50 border-stone-200 text-stone-500'
                }`}>
                  <span className="flex items-center gap-1.5 font-semibold">
                    <span>🔥</span> Maestro de Competencia Lectora (14 días)
                  </span>
                  <span className="font-bold text-[11px]">{streak.highestStreak >= 14 ? '¡Alcanzado!' : `${streak.currentStreak}/14`}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setModalOpen(false)}
              className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              ¡Continuar Practicando!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
