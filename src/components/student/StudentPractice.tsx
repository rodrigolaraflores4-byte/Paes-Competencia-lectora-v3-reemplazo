import React, { useState, useEffect } from 'react';
import { api } from '../../api/client.js';
import { Attempt, Assignment, TextItem, OptionLetter, DemreSkill } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import { recordStreakActivity } from '../../utils/streak.js';
import { PracticeSummary } from './PracticeSummary.js';
import { TextAnnotator } from './TextAnnotator.js';
import { 
  BookOpen, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Type, 
  Sparkles, 
  AlertCircle,
  Eye,
  FileText
} from 'lucide-react';

interface Props {
  assignmentId: string;
  onExit: () => void;
}

export const StudentPractice: React.FC<Props> = ({ assignmentId, onExit }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [text, setText] = useState<Partial<TextItem> | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<OptionLetter | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<any | null>(null);

  // Completed state
  const [isCompleted, setIsCompleted] = useState(false);
  const [finalQuestions, setFinalQuestions] = useState<any[]>([]);

  // Mobile layout state: 'split' on desktop; on mobile: 'text' or 'question'
  const [mobileTab, setMobileTab] = useState<'text' | 'question'>('question');

  // Reader customization
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans'>('serif');

  const startOrResumePractice = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.startAttempt(assignmentId);
      setAttempt(data.attempt);
      setAssignment(data.assignment);
      setText(data.text);
      setQuestions(data.questions);

      // Find first unanswered question or resume
      const firstUnansweredIndex = data.questions.findIndex(q => !q.already_answered);
      if (firstUnansweredIndex !== -1) {
        setCurrentIndex(firstUnansweredIndex);
        setSelectedOption(null);
      } else if (data.attempt.status === 'completed') {
        // If already completed, load summary
        await handleFinishAttempt(data.attempt.id);
        return;
      } else {
        // All answered but not finished
        setCurrentIndex(data.questions.length - 1);
        const lastQ = data.questions[data.questions.length - 1];
        if (lastQ.already_answered) {
          setSelectedOption(lastQ.selected_option || null);
          if (lastQ.feedback) setCurrentFeedback(lastQ.feedback);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar la actividad');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    startOrResumePractice();
  }, [assignmentId]);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const isAnswered = Boolean(currentQuestion?.already_answered || currentFeedback);

  const handleSelectOption = (letter: OptionLetter) => {
    if (isAnswered) return;
    setSelectedOption(letter);
  };

  const handleSubmitAnswer = async () => {
    if (!attempt || !currentQuestion || !selectedOption || submitting) return;

    setSubmitting(true);
    try {
      const res = await api.recordAnswer(attempt.id, currentQuestion.id, selectedOption);
      setAttempt(res.attempt);
      // La racha suma con cualquier ejercicio respondido (no hace falta terminar el ensayo)
      if (currentUser?.id) recordStreakActivity(currentUser.id);

      // In formative mode, show feedback
      if (assignment?.mode === 'formativo') {
        setCurrentFeedback({
          is_correct: res.isCorrect,
          correct_option: res.correctOption,
          explanation: res.explanation,
          distractor_explanation: res.distractorExplanation,
        });
      } else {
        // Evaluative mode: move straight to next question or prompt to finish
        if (!isLastQuestion) {
          handleNextQuestion();
        } else {
          await handleFinishAttempt(attempt.id);
        }
      }

      // Mark current question in questions array as answered
      const updatedQuestions = [...questions];
      updatedQuestions[currentIndex] = {
        ...updatedQuestions[currentIndex],
        already_answered: true,
        selected_option: selectedOption,
        feedback: assignment?.mode === 'formativo' ? {
          is_correct: res.isCorrect,
          correct_option: res.correctOption,
          explanation: res.explanation,
          distractor_explanation: res.distractorExplanation,
        } : undefined,
      };
      setQuestions(updatedQuestions);
    } catch (err: any) {
      alert(err.message || 'Error al enviar respuesta');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      const nextQ = questions[nextIdx];
      setSelectedOption(nextQ?.selected_option || null);
      setCurrentFeedback(nextQ?.feedback || null);
      // Auto-switch mobile view to question for good mobile UX
      setMobileTab('question');
    }
  };

  const handlePreviousQuestion = () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      const prevQ = questions[prevIdx];
      setSelectedOption(prevQ?.selected_option || null);
      setCurrentFeedback(prevQ?.feedback || null);
    }
  };

  const handleFinishAttempt = async (attId?: string) => {
    const idToFinish = attId || attempt?.id;
    if (!idToFinish) return;

    setSubmitting(true);
    try {
      const res = await api.finishAttempt(idToFinish);
      setAttempt(res.attempt);
      setAssignment(res.assignment);
      setFinalQuestions(res.questions);
      setIsCompleted(true);
      if (currentUser?.id) {
        recordStreakActivity(currentUser.id);
      }
    } catch (err: any) {
      alert(err.message || 'Error al finalizar el intento');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSafeExit = () => {
    const answeredCount = questions.filter(q => q.already_answered).length;
    if (!isCompleted && answeredCount < questions.length) {
      if (window.confirm('Tienes preguntas pendientes por responder. ¿Seguro que deseas salir? Tu avance quedará guardado para retomarlo más tarde.')) {
        onExit();
      }
    } else {
      onExit();
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-stone-200 p-12 text-center text-sm text-stone-500">
        Cargando texto de lectura y preguntas...
      </div>
    );
  }

  if (error || !attempt || !assignment || !text) {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-8 text-center space-y-4 max-w-lg mx-auto">
        <AlertCircle className="w-10 h-10 text-red-600 mx-auto" />
        <h3 className="text-base font-bold text-stone-900">No se pudo cargar la práctica</h3>
        <p className="text-xs text-stone-600">{error || 'Información de actividad no disponible.'}</p>
        <button
          onClick={onExit}
          className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold"
        >
          Volver a mis actividades
        </button>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <PracticeSummary
        attempt={attempt}
        assignment={assignment}
        questions={finalQuestions.length > 0 ? finalQuestions : questions}
        text={text}
        onBackToDashboard={onExit}
        onRetry={assignment.max_attempts > 1 ? () => { setIsCompleted(false); startOrResumePractice(); } : undefined}
        canRetry={assignment.max_attempts > 1}
      />
    );
  }

  const skillBadge: Record<DemreSkill, { label: string; color: string }> = {
    localizar: { label: 'Localizar', color: 'bg-blue-100 text-blue-800' },
    interpretar_relacionar: { label: 'Interpretar y relacionar', color: 'bg-purple-100 text-purple-800' },
    evaluar: { label: 'Evaluar', color: 'bg-emerald-100 text-emerald-800' },
  };

  const activeBadge = skillBadge[currentQuestion.skill as DemreSkill] || skillBadge.interpretar_relacionar;

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[600px] bg-stone-100 -m-4 sm:-m-6 rounded-xl overflow-hidden border border-stone-200 shadow-sm">
      {/* Top Practice Navigation Bar */}
      <div className="bg-white px-4 py-3 border-b border-stone-200 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={handleSafeExit}
            className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors text-xs font-semibold flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Salir</span>
          </button>
          <div>
            <h2 className="text-sm font-bold text-stone-900 truncate max-w-[200px] sm:max-w-md">
              {assignment.title}
            </h2>
            <div className="flex items-center gap-2 text-[11px] text-stone-500">
              <span className="capitalize">{assignment.mode}</span>
              <span>·</span>
              <span>Pregunta {currentIndex + 1} de {questions.length}</span>
            </div>
          </div>
        </div>

        {/* Mobile Tab Toggle Buttons (only on screens < 1024px) */}
        <div className="flex lg:hidden bg-stone-100 p-0.5 rounded-lg border border-stone-200 text-xs">
          <button
            onClick={() => setMobileTab('text')}
            className={`px-3 py-1 rounded-md font-semibold transition-colors flex items-center gap-1 ${
              mobileTab === 'text'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Texto
          </button>
          <button
            onClick={() => setMobileTab('question')}
            className={`px-3 py-1 rounded-md font-semibold transition-colors flex items-center gap-1 ${
              mobileTab === 'question'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Pregunta {currentIndex + 1}
          </button>
        </div>

        {/* Reader customization toggles (Desktop & Mobile) */}
        <div className="hidden sm:flex items-center gap-2 text-xs">
          <button
            onClick={() => setFontFamily(fontFamily === 'serif' ? 'sans' : 'serif')}
            className="px-2 py-1 rounded border border-stone-200 text-stone-600 hover:bg-stone-50 flex items-center gap-1"
            title="Cambiar tipografía"
          >
            <Type className="w-3.5 h-3.5" />
            <span>{fontFamily === 'serif' ? 'Serif (Libro)' : 'Sans-Serif'}</span>
          </button>
          <div className="flex items-center border border-stone-200 rounded overflow-hidden">
            <button
              onClick={() => setFontSize('sm')}
              className={`px-2 py-1 font-bold ${fontSize === 'sm' ? 'bg-stone-900 text-white' : 'hover:bg-stone-50 text-stone-700'}`}
              title="Texto más pequeño"
            >
              A-
            </button>
            <button
              onClick={() => setFontSize('base')}
              className={`px-2 py-1 font-bold ${fontSize === 'base' ? 'bg-stone-900 text-white' : 'hover:bg-stone-50 text-stone-700'}`}
              title="Texto mediano"
            >
              A
            </button>
            <button
              onClick={() => setFontSize('lg')}
              className={`px-2 py-1 font-bold ${fontSize === 'lg' ? 'bg-stone-900 text-white' : 'hover:bg-stone-50 text-stone-700'}`}
              title="Texto más grande"
            >
              A+
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-stone-200 h-1 shrink-0">
        <div
          className="bg-amber-600 h-1 transition-all duration-300"
          style={{ width: `${((currentIndex + (isAnswered ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      {/* Main Split Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT PANE: Reading Text with Interactive Annotator */}
        <div
          className={`flex-1 bg-white border-r border-stone-200 flex flex-col overflow-hidden ${
            mobileTab === 'text' ? 'block' : 'hidden lg:flex'
          }`}
        >
          {text?.content ? (
            <TextAnnotator
              textId={text.id || assignment?.text_id || 'main'}
              assignmentId={assignmentId}
              title={text.title || assignment?.text_title || 'Lectura PAES'}
              author={text.author}
              source={text.source}
              content={text.content}
              fontSize={fontSize}
              fontFamily={fontFamily}
              onChangeFontSize={setFontSize}
              onChangeFontFamily={setFontFamily}
              onSwitchToQuestions={() => setMobileTab('question')}
              questionNumber={currentIndex + 1}
              totalQuestions={questions.length}
            />
          ) : (
            <div className="p-8 text-center text-stone-400 text-sm">
              Cargando lectura...
            </div>
          )}

          {/* Quick jump to question button for mobile */}
          <div className="p-3 bg-stone-50 border-t border-stone-200 lg:hidden text-center shrink-0">
            <button
              onClick={() => setMobileTab('question')}
              className="w-full py-2 bg-amber-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>Ver Pregunta {currentIndex + 1} de {questions.length}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* RIGHT PANE: Question & Options */}
        <div
          className={`w-full lg:w-[480px] xl:w-[540px] bg-stone-50/80 flex flex-col overflow-hidden shrink-0 ${
            mobileTab === 'question' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Question Header */}
          <div className="p-4 sm:p-5 bg-white border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-stone-900 text-white font-bold text-xs flex items-center justify-center">
                {currentIndex + 1}
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${activeBadge.color}`}>
                Habilidad: {activeBadge.label}
              </span>
            </div>
            <span className="text-xs text-stone-500 font-medium">
              {currentQuestion.points} pto.
            </span>
          </div>

          {/* Question Body */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto reading-scrollbar space-y-4">
            {/* Prompt */}
            <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-xs">
              <p className="text-sm font-semibold text-stone-900 leading-snug">
                {currentQuestion.prompt}
              </p>
            </div>

            {/* Alternatives */}
            <div className="space-y-2.5">
              {(['A', 'B', 'C', 'D'] as OptionLetter[]).map(letter => {
                const isSelected = selectedOption === letter;
                const feedback = currentFeedback || currentQuestion.feedback;
                const isCorrectOption = feedback?.correct_option === letter;

                let stateClasses = 'border-stone-200 bg-white hover:border-amber-400 hover:bg-stone-50 text-stone-800';

                if (isAnswered && feedback) {
                  if (isCorrectOption) {
                    stateClasses = 'border-emerald-600 bg-emerald-50 text-emerald-950 font-semibold ring-2 ring-emerald-600/20';
                  } else if (isSelected && !feedback.is_correct) {
                    stateClasses = 'border-red-500 bg-red-50 text-red-950 font-semibold ring-2 ring-red-500/20';
                  } else {
                    stateClasses = 'border-stone-200 bg-stone-100/50 text-stone-400 opacity-70';
                  }
                } else if (isSelected) {
                  stateClasses = 'border-amber-700 bg-amber-50/70 text-amber-950 font-semibold ring-2 ring-amber-700/20';
                }

                return (
                  <button
                    key={letter}
                    onClick={() => handleSelectOption(letter)}
                    disabled={isAnswered || submitting}
                    className={`w-full min-h-[50px] p-3 rounded-xl border text-left text-xs sm:text-sm flex items-start gap-3 transition-all ${stateClasses}`}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 transition-colors ${
                        isAnswered && isCorrectOption
                          ? 'bg-emerald-600 text-white'
                          : isAnswered && isSelected && !feedback?.is_correct
                          ? 'bg-red-600 text-white'
                          : isSelected
                          ? 'bg-amber-700 text-white'
                          : 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      {letter}
                    </span>
                    <div className="flex-1 pt-0.5">
                      <span>{currentQuestion.options[letter]}</span>
                      {isAnswered && isCorrectOption && (
                        <span className="block text-[11px] font-bold text-emerald-800 mt-1">
                          ✓ Alternativa correcta
                        </span>
                      )}
                      {isAnswered && isSelected && !feedback?.is_correct && (
                        <span className="block text-[11px] font-bold text-red-800 mt-1">
                          ✗ Tu elección
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Formative Instant Feedback Card */}
            {isAnswered && (currentFeedback || currentQuestion.feedback) && (
              <div
                className={`p-4 rounded-xl border text-xs space-y-2 animate-fadeIn ${
                  (currentFeedback?.is_correct || currentQuestion.feedback?.is_correct)
                    ? 'border-emerald-200 bg-emerald-50/80 text-emerald-950'
                    : 'border-amber-200 bg-amber-50/80 text-amber-950'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-sm">
                  {(currentFeedback?.is_correct || currentQuestion.feedback?.is_correct) ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>¡Respuesta Correcta!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span>Respuesta Incorrecta</span>
                    </>
                  )}
                </div>

                <div className="font-semibold text-stone-800">
                  Justificación de la clave ({currentFeedback?.correct_option || currentQuestion.feedback?.correct_option}):
                </div>
                <p className="text-stone-700 leading-relaxed">
                  {currentFeedback?.explanation || currentQuestion.feedback?.explanation}
                </p>

                {(currentFeedback?.distractor_explanation || currentQuestion.feedback?.distractor_explanation) && (
                  <div className="pt-2 border-t border-stone-200/60 text-stone-600 italic">
                    Sobre tu alternativa: {currentFeedback?.distractor_explanation || currentQuestion.feedback?.distractor_explanation}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="p-4 bg-white border-t border-stone-200 flex items-center justify-between gap-3 shrink-0">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentIndex === 0}
              className="px-3 py-2 border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 disabled:opacity-30 hover:bg-stone-50 transition-colors"
            >
              Anterior
            </button>

            {!isAnswered ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedOption || submitting}
                className="flex-1 py-2.5 bg-amber-700 hover:bg-amber-800 disabled:opacity-40 text-white rounded-lg text-xs sm:text-sm font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                {submitting ? 'Registrando...' : 'Responder'}
              </button>
            ) : isLastQuestion ? (
              <button
                onClick={() => handleFinishAttempt()}
                disabled={submitting}
                className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs sm:text-sm font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                {submitting ? 'Finalizando...' : 'Finalizar y Ver Resultados'}
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="flex-1 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs sm:text-sm font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Siguiente Pregunta</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
