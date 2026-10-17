import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../api/client.js';
import { VocabExercise, OptionLetter } from '../../types/index.js';
import { INITIAL_VOCAB_EXERCISES } from '../../data/vocabData.js';
import { recordStreakActivity, getStoredStreak, StreakData } from '../../utils/streak.js';
import { 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Target, 
  Flame, 
  Check, 
  HelpCircle, 
  Filter, 
  Award, 
  Lightbulb,
  ChevronRight,
  Bookmark
} from 'lucide-react';

interface Props {
  userId?: string;
  onStreakUpdated?: (streak: StreakData) => void;
}

export const VocabularyPractice: React.FC<Props> = ({ userId = 'default', onStreakUpdated }) => {
  const [exercises, setExercises] = useState<VocabExercise[]>(INITIAL_VOCAB_EXERCISES);
  const [pointsToast, setPointsToast] = useState<number | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<OptionLetter | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, { selected: OptionLetter; isCorrect: boolean }>>(() => {
    try {
      const saved = localStorage.getItem(`paes_vocab_answers_${userId}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.getVocab(), api.getVocabProgress()]).then(([vocab, prog]) => {
      if (cancelled) return;
      if (vocab.exercises.length > 0) setExercises(vocab.exercises);
      if (prog.progress.length > 0) {
        setUserAnswers(prev => {
          const merged = { ...prev };
          prog.progress.forEach(p => { merged[p.exercise_id] = { selected: p.selected_option, isCorrect: p.is_correct }; });
          return merged;
        });
      }
    });
    return () => { cancelled = true; };
  }, [userId]);

  const [filterCategory, setFilterCategory] = useState<string>('todos');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('todos');
  const [streakCelebration, setStreakCelebration] = useState<string | null>(null);

  const filteredExercises = exercises.filter(ex => {
    if (filterCategory !== 'todos' && ex.category !== filterCategory) return false;
    if (filterDifficulty !== 'todos' && ex.difficulty !== filterDifficulty) return false;
    return true;
  });

  const currentExercise = filteredExercises[currentIndex] || filteredExercises[0] || exercises[0];

  useEffect(() => {
    // If current exercise was already answered previously, load its state
    if (currentExercise && userAnswers[currentExercise.id]) {
      setSelectedOption(userAnswers[currentExercise.id].selected);
      setIsAnswered(true);
    } else {
      setSelectedOption(null);
      setIsAnswered(false);
    }
    setStreakCelebration(null);
  }, [currentIndex, currentExercise?.id]);

  const handleSelectOption = (letter: OptionLetter) => {
    if (isAnswered) return;
    setSelectedOption(letter);
  };

  const handleVerify = () => {
    if (!selectedOption || isAnswered || !currentExercise) return;

    const isCorrect = selectedOption === currentExercise.correct_option;
    if (isCorrect) {
      setPointsToast(10);
      setTimeout(() => setPointsToast(null), 1600);
    } else {
      setShakeKey(k => k + 1);
    }
    // El servidor corrige y guarda (Supabase); si no responde, queda el respaldo local de abajo
    api.answerVocab(currentExercise.id, selectedOption).catch(() => {});
    const updated = {
      ...userAnswers,
      [currentExercise.id]: { selected: selectedOption, isCorrect },
    };
    setUserAnswers(updated);
    setIsAnswered(true);

    try {
      localStorage.setItem(`paes_vocab_answers_${userId}`, JSON.stringify(updated));
    } catch {
      // ignore
    }

    // Actualizar racha Duolingo al practicar
    const streakResult = recordStreakActivity(userId);
    if (onStreakUpdated) {
      onStreakUpdated(streakResult.streak);
    }
    if (streakResult.isNewDay) {
      setStreakCelebration(streakResult.message);
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredExercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
      const k = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(k)) handleSelectOption(k as OptionLetter);
      else if (e.key === 'Enter') { if (!isAnswered) handleVerify(); else handleNext(); }
      else if (e.key === 'ArrowRight') handleNext();
      else if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const answeredCount = Object.keys(userAnswers).length;
  const correctCount = Object.values(userAnswers).filter(a => a.isCorrect).length;
  const accuracyPct = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

  const currentAnswer = currentExercise ? userAnswers[currentExercise.id] : null;
  const isCorrect = currentAnswer?.isCorrect;

  return (
    <div className="space-y-6">
      {/* Motivational Streak Banner */}
      {streakCelebration && (
        <div className="p-4 bg-gradient-to-r from-orange-500/15 via-amber-500/15 to-yellow-500/15 border border-orange-300 rounded-2xl flex items-center justify-between text-orange-950 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl animate-bounce">🔥</span>
            <div>
              <span className="font-bold text-sm block">{streakCelebration}</span>
              <span className="text-xs text-orange-800">
                ¡Cada ejercicio de vocabulario contextual fortalece tu racha y tu comprensión lectora!
              </span>
            </div>
          </div>
          <button onClick={() => setStreakCelebration(null)} className="font-bold text-stone-400 hover:text-stone-700">×</button>
        </div>
      )}

      {/* Header and Quick Stats */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-purple-900 bg-purple-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Léxico Contextual PAES
            </span>
            <span className="text-xs font-semibold text-stone-500">
              Marco Oficial DEMRE
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
            Taller de Vocabulario y Léxico en Contexto
          </h2>
          <p className="text-xs text-stone-600 mt-0.5 max-w-2xl leading-relaxed">
            Aprende a determinar el sentido exacto de palabras complejas y elegir el sinónimo que preserva el significado en su fragmento discursivo real.
          </p>
        </div>

        {/* Global KPI stats */}
        <div className="flex items-center gap-3 bg-stone-50 border border-stone-200 p-3 rounded-xl self-start md:self-auto text-xs">
          <div>
            <div className="text-stone-500">Ejercicios Realizados</div>
            <div className="text-base font-bold text-stone-900">
              {answeredCount} / {exercises.length}
            </div>
          </div>
          <div className="border-l border-stone-200 pl-3">
            <div className="text-stone-500">Precisión</div>
            <div className="text-base font-bold text-emerald-700">
              {accuracyPct}%
            </div>
          </div>
          <div className="border-l border-stone-200 pl-3">
            <div className="text-stone-500">Aciertos</div>
            <div className="text-base font-bold text-amber-700">
              {correctCount}
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-xl border border-stone-200 px-4 py-3 shadow-xs">
        <div className="flex items-center justify-between text-[11px] font-bold text-stone-500 mb-1.5">
          <span>Tu avance en el taller</span>
          <span>{answeredCount} de {exercises.length} palabras · atajos: A-D, Enter, ← →</span>
        </div>
        <div className="h-2.5 rounded-full bg-stone-100 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500"
            initial={false}
            animate={{ width: `${exercises.length ? Math.min(100, (answeredCount / exercises.length) * 100) : 0}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          />
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            Tipo de Texto:
          </span>
          {(['todos', 'literario', 'academico', 'filosofico', 'periodistico'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => {
                setFilterCategory(cat);
                setCurrentIndex(0);
              }}
              className={`px-2.5 py-1 rounded-lg font-semibold capitalize transition-colors ${
                filterCategory === cat
                  ? 'bg-amber-800 text-white shadow-2xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-stone-600 uppercase tracking-wider">
            Dificultad:
          </span>
          <select
            value={filterDifficulty}
            onChange={e => {
              setFilterDifficulty(e.target.value);
              setCurrentIndex(0);
            }}
            className="px-2.5 py-1 rounded-lg border border-stone-200 bg-stone-50 text-stone-700 font-medium"
          >
            <option value="todos">Todas</option>
            <option value="inicial">Inicial</option>
            <option value="medio">Media</option>
            <option value="avanzado">Avanzada</option>
          </select>
        </div>
      </div>

      {/* Main Exercise Card */}
      {currentExercise ? (
        <motion.div
          key={currentExercise.id}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="relative bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6"
        >
          <AnimatePresence>
            {pointsToast && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: -6, scale: 1 }}
                exit={{ opacity: 0, y: -26 }}
                className="absolute right-6 top-4 z-10 px-3 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-black shadow-lg"
              >
                +{pointsToast} pts ✨
              </motion.div>
            )}
          </AnimatePresence>
          {/* Card Top Pill */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-amber-800 text-white font-bold text-xs flex items-center justify-center">
                {currentIndex + 1}
              </span>
              <span className="text-xs text-stone-500 font-medium">
                de {filteredExercises.length} palabras disponibles
              </span>
              <span className="text-stone-300">·</span>
              <span className="text-[11px] font-bold text-stone-600 uppercase px-2 py-0.5 rounded bg-stone-100">
                {currentExercise.category}
              </span>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                currentExercise.difficulty === 'avanzado'
                  ? 'bg-purple-100 text-purple-900'
                  : currentExercise.difficulty === 'medio'
                  ? 'bg-blue-100 text-blue-900'
                  : 'bg-emerald-100 text-emerald-900'
              }`}>
                Nivel {currentExercise.difficulty}
              </span>
            </div>

            {currentExercise.source && (
              <span className="text-[11px] text-stone-500 italic">
                Fuente: {currentExercise.source}
              </span>
            )}
          </div>

          {/* Target Word Hero */}
          <div className="text-center py-2 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-amber-900 block">
              Término a analizar en contexto:
            </span>
            <h3 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight font-serif">
              «{currentExercise.target_word}»
            </h3>
          </div>

          {/* Fragment Container */}
          <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-200/80 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-800" />
              Fragmento Textual de Lectura:
            </span>
            <p className="text-sm sm:text-base font-serif text-stone-800 leading-relaxed italic">
              {currentExercise.full_passage || currentExercise.context_sentence}
            </p>
          </div>

          {/* Question Prompt */}
          <div>
            <h4 className="text-sm sm:text-base font-bold text-stone-900">
              ¿Cuál es el sentido del término <span className="font-serif text-amber-900">«{currentExercise.target_word}»</span> en el fragmento anterior?
            </h4>
            <p className="text-xs text-stone-500 mt-0.5">
              Selecciona el sinónimo acompañado de la justificación contextual apropiada según el modelo oficial DEMRE:
            </p>
          </div>

          {/* Options Grid */}
          <div className="space-y-3">
            {(['A', 'B', 'C', 'D'] as OptionLetter[]).map(letter => {
              const option = currentExercise.options[letter];
              const isSelected = selectedOption === letter;
              const isOptionCorrect = letter === currentExercise.correct_option;

              let cardStyle = 'border-stone-200 hover:border-amber-400 bg-white';
              let badgeStyle = 'bg-stone-100 text-stone-700';

              if (isAnswered) {
                if (isOptionCorrect) {
                  cardStyle = 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20';
                  badgeStyle = 'bg-emerald-600 text-white';
                } else if (isSelected && !isOptionCorrect) {
                  cardStyle = 'border-red-400 bg-red-50/70';
                  badgeStyle = 'bg-red-600 text-white';
                } else {
                  cardStyle = 'border-stone-200 opacity-60 bg-stone-50';
                }
              } else if (isSelected) {
                cardStyle = 'border-amber-700 bg-amber-50/60 ring-2 ring-amber-700/20';
                badgeStyle = 'bg-amber-800 text-white';
              }

              return (
                <motion.div
                  key={letter + (isAnswered && isSelected && !isOptionCorrect ? shakeKey : '')}
                  onClick={() => handleSelectOption(letter)}
                  whileHover={!isAnswered ? { scale: 1.01, x: 3 } : undefined}
                  whileTap={!isAnswered ? { scale: 0.985 } : undefined}
                  animate={isAnswered && isSelected && !isOptionCorrect ? { x: [0, -8, 8, -5, 5, 0] } : { x: 0 }}
                  transition={{ duration: 0.4 }}
                  className={`p-4 rounded-xl border transition-colors cursor-pointer flex items-start gap-3.5 ${cardStyle}`}
                >
                  <div className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-2xs ${badgeStyle}`}>
                    {letter}
                  </div>
                  <div className="text-xs sm:text-sm leading-relaxed flex-1">
                    <strong className="font-black tracking-wide text-stone-950 font-sans">
                      {option.synonym}
                    </strong>
                    {option.justification && (
                      <span className="text-stone-700 ml-1.5 font-normal">
                        , {option.justification}
                      </span>
                    )}
                  </div>
                  {isAnswered && isOptionCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  )}
                  {isAnswered && isSelected && !isOptionCorrect && (
                    <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Action Button: Verify */}
          {!isAnswered ? (
            <div className="pt-2">
              <button
                onClick={handleVerify}
                disabled={!selectedOption}
                className="w-full sm:w-auto px-6 py-3 bg-amber-800 hover:bg-amber-900 disabled:opacity-40 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Comprobar Respuesta y Sumar a mi Racha 🔥</span>
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Post-Answer Feedback Card */
            <div className={`p-5 rounded-2xl border space-y-3 animate-in fade-in duration-200 ${
              isCorrect ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950' : 'bg-red-50/80 border-red-300 text-red-950'
            }`}>
              <div className="flex items-center gap-2 font-bold text-sm">
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                    <span>¡Excelente! Respuesta Correcta (+10 pts Léxico · Racha Activa 🔥)</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-700" />
                    <span>Respuesta Incorrecta. La opción correcta era la {currentExercise.correct_option}.</span>
                  </>
                )}
              </div>

              {/* Rationale */}
              <div className="bg-white/90 p-4 rounded-xl border border-stone-200 text-xs text-stone-800 space-y-2">
                <div>
                  <strong className="text-stone-900 block mb-0.5">Explicación Contextual Oficial:</strong>
                  <p className="leading-relaxed">{currentExercise.explanation}</p>
                </div>

                {currentExercise.nuance_tip && (
                  <div className="pt-2 border-t border-stone-100 flex items-start gap-2 text-amber-950">
                    <Lightbulb className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-relaxed">
                      <strong>Tip PAES:</strong> {currentExercise.nuance_tip}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bottom Navigator */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="px-3.5 py-2 border border-stone-200 bg-stone-50 hover:bg-stone-100 disabled:opacity-30 rounded-lg text-xs font-semibold text-stone-700 transition-colors"
            >
              ← Palabra Anterior
            </button>

            <span className="text-xs font-semibold text-stone-500">
              Palabra {currentIndex + 1} de {filteredExercises.length}
            </span>

            <button
              onClick={handleNext}
              disabled={currentIndex === filteredExercises.length - 1}
              className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-30 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <span>Siguiente Palabra</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="p-12 text-center text-sm text-stone-500 bg-white rounded-xl border border-stone-200">
          No hay ejercicios que coincidan con los filtros seleccionados.
        </div>
      )}
    </div>
  );
};
