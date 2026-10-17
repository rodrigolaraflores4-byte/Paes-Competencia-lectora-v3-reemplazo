import React, { useState, useEffect } from 'react';
import { Question, DemreSkill, OptionLetter } from '../../types/index.js';
import { HelpCircle, CheckCircle, AlertCircle, X, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (questionData: Partial<Question>) => Promise<void>;
  existingQuestion?: Question | null;
  textTitle: string;
}

export const QuestionEditorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  existingQuestion,
  textTitle,
}) => {
  const [prompt, setPrompt] = useState('');
  const [skill, setSkill] = useState<DemreSkill>('interpretar_relacionar');
  const [options, setOptions] = useState<{ A: string; B: string; C: string; D: string }>({
    A: '',
    B: '',
    C: '',
    D: '',
  });
  const [correctOption, setCorrectOption] = useState<OptionLetter>('A');
  const [explanation, setExplanation] = useState('');
  const [distractorExplanations, setDistractorExplanations] = useState<{
    A: string;
    B: string;
    C: string;
    D: string;
  }>({
    A: '',
    B: '',
    C: '',
    D: '',
  });
  const [points, setPoints] = useState<number>(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existingQuestion) {
      setPrompt(existingQuestion.prompt);
      setSkill(existingQuestion.skill);
      setOptions({ ...existingQuestion.options });
      setCorrectOption(existingQuestion.correct_option);
      setExplanation(existingQuestion.explanation);
      setDistractorExplanations({
        A: existingQuestion.distractor_explanations?.A || '',
        B: existingQuestion.distractor_explanations?.B || '',
        C: existingQuestion.distractor_explanations?.C || '',
        D: existingQuestion.distractor_explanations?.D || '',
      });
      setPoints(existingQuestion.points || 1);
    } else {
      setPrompt('');
      setSkill('interpretar_relacionar');
      setOptions({ A: '', B: '', C: '', D: '' });
      setCorrectOption('A');
      setExplanation('');
      setDistractorExplanations({ A: '', B: '', C: '', D: '' });
      setPoints(1);
    }
    setError(null);
  }, [existingQuestion, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!prompt.trim()) {
      setError('El enunciado de la pregunta es obligatorio.');
      return;
    }
    if (!options.A.trim() || !options.B.trim() || !options.C.trim() || !options.D.trim()) {
      setError('Debes completar las cuatro alternativas (A, B, C y D).');
      return;
    }
    if (!explanation.trim()) {
      setError('La justificación de la respuesta correcta es indispensable para la retroalimentación.');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        prompt: prompt.trim(),
        skill,
        options: {
          A: options.A.trim(),
          B: options.B.trim(),
          C: options.C.trim(),
          D: options.D.trim(),
        },
        correct_option: correctOption,
        explanation: explanation.trim(),
        distractor_explanations: {
          A: distractorExplanations.A.trim(),
          B: distractorExplanations.B.trim(),
          C: distractorExplanations.C.trim(),
          D: distractorExplanations.D.trim(),
        },
        points,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar la pregunta');
    } finally {
      setSaving(false);
    }
  };

  const skillDescriptions: Record<DemreSkill, { label: string; def: string; examples: string }> = {
    localizar: {
      label: 'Localizar',
      def: 'Rastrear, identificar y extraer información explícita formulada en el texto (datos, fechas, nombres, ideas literales).',
      examples: 'Ejemplos: "¿Cuál es el motivo señalado en el párrafo 2?", "¿Según el texto, qué acción realizó X?"',
    },
    interpretar_relacionar: {
      label: 'Interpretar y relacionar',
      def: 'Construir significado integrando partes del texto: inferencias, sintetizar párrafos, determinar propósito o tono del emisor.',
      examples: 'Ejemplos: "¿Qué función cumple el párrafo 3?", "¿Cuál es la actitud del emisor?", "¿Qué se infiere de...?"',
    },
    evaluar: {
      label: 'Evaluar',
      def: 'Emitir un juicio crítico sobre la forma, pertinencia, coherencia, solidez argumentativa o intención del emisor.',
      examples: 'Ejemplos: "¿Con qué propósito se incluye la cita de X?", "¿Qué tan adecuada es la conclusión respecto a la tesis?"',
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-stone-200 my-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div>
            <h3 className="text-lg font-bold text-stone-900">
              {existingQuestion ? 'Editar Pregunta de Comprensión' : 'Agregar Pregunta al Texto'}
            </h3>
            <p className="text-xs text-stone-600 truncate max-w-md">
              Texto: <span className="font-semibold text-stone-800">{textTitle}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-lg hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Skill Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Habilidad Evaluada (DEMRE) *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(['localizar', 'interpretar_relacionar', 'evaluar'] as DemreSkill[]).map(s => {
                const isSelected = skill === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSkill(s)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'border-amber-600 bg-amber-50/70 text-amber-950 font-semibold ring-2 ring-amber-600/20'
                        : 'border-stone-200 hover:border-amber-400 hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <div className="text-sm font-bold flex items-center justify-between">
                      {skillDescriptions[s].label}
                      {isSelected && <CheckCircle className="w-4 h-4 text-amber-700" />}
                    </div>
                    <div className="text-[11px] text-stone-600 mt-1 line-clamp-2">
                      {skillDescriptions[s].def}
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-stone-500 mt-1.5 italic">
              {skillDescriptions[skill].examples}
            </p>
          </div>

          {/* Prompt */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Enunciado de la Pregunta *
            </label>
            <textarea
              rows={3}
              placeholder="Ej: A partir del párrafo [2], ¿qué función cumple la mención de Aristóteles en el razonamiento del fraile?"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600"
              required
            />
          </div>

          {/* Alternatives A, B, C, D */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                Alternativas de Respuesta (Marca la correcta) *
              </label>
              <span className="text-[11px] text-stone-500">
                Elige la alternativa correcta con el selector radial
              </span>
            </div>

            {(['A', 'B', 'C', 'D'] as OptionLetter[]).map(letter => {
              const isCorrect = correctOption === letter;
              return (
                <div
                  key={letter}
                  className={`p-3 rounded-lg border transition-all ${
                    isCorrect
                      ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600/30'
                      : 'border-stone-200 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <label className="flex items-center gap-2 cursor-pointer pt-2 shrink-0">
                      <input
                        type="radio"
                        name="correct_option"
                        value={letter}
                        checked={isCorrect}
                        onChange={() => setCorrectOption(letter)}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-stone-300"
                      />
                      <span className={`w-6 h-6 rounded font-bold text-xs flex items-center justify-center ${
                        isCorrect ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-700'
                      }`}>
                        {letter}
                      </span>
                    </label>
                    <div className="flex-1 space-y-2">
                      <textarea
                        rows={2}
                        placeholder={`Texto de la alternativa ${letter}...`}
                        value={options[letter]}
                        onChange={e =>
                          setOptions(prev => ({ ...prev, [letter]: e.target.value }))
                        }
                        className="w-full px-3 py-1.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 bg-white"
                        required
                      />
                      
                      {/* Distractor Explanation (if not correct) */}
                      {!isCorrect && (
                        <div className="pt-1.5 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                              <span>¿Cuál es el error del estudiante en esta opción ({letter})?</span>
                              <span className="text-[10px] font-normal text-stone-500">(Retroalimentación formativa)</span>
                            </label>
                          </div>
                          
                          {/* Quick DEMRE error suggestions */}
                          <div className="flex flex-wrap gap-1">
                            {[
                              'Tergiversación del texto',
                              'Generalización sin respaldo',
                              'Información no presente en la lectura',
                              'Contradice la idea del emisor',
                              'Confunde causa con consecuencia',
                              'Dato secundario que no responde al enunciado',
                            ].map(errTag => (
                              <button
                                key={errTag}
                                type="button"
                                onClick={() => {
                                  const currentVal = distractorExplanations[letter] || '';
                                  if (!currentVal) {
                                    setDistractorExplanations(prev => ({ ...prev, [letter]: `${errTag}: ` }));
                                  } else if (!currentVal.includes(errTag)) {
                                    setDistractorExplanations(prev => ({ ...prev, [letter]: `${errTag}. ${currentVal}` }));
                                  }
                                }}
                                className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors"
                                title="Haz clic para añadir este tipo de error"
                              >
                                + {errTag}
                              </button>
                            ))}
                          </div>

                          <textarea
                            rows={2}
                            placeholder={`Explica por qué la alternativa ${letter} es un error (ej: El estudiante confunde una opinión personal con el hecho descrito en el párrafo 3...)`}
                            value={distractorExplanations[letter]}
                            onChange={e =>
                              setDistractorExplanations(prev => ({
                                ...prev,
                                [letter]: e.target.value,
                              }))
                            }
                            className="w-full px-2.5 py-1.5 text-xs border border-amber-200 rounded-md bg-amber-50/40 text-stone-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-amber-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Explanation for Correct Option */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1 flex items-center gap-1.5">
              <span>Justificación de la Alternativa Correcta ({correctOption}) *</span>
              <span className="text-[11px] font-normal text-stone-500">
                (Visible en retroalimentación formativa)
              </span>
            </label>
            <textarea
              rows={3}
              placeholder="Explica detalladamente por qué esta opción responde con precisión al enunciado basándose en marcas textuales..."
              value={explanation}
              onChange={e => setExplanation(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 bg-emerald-50/20"
              required
            />
          </div>

          {/* Points */}
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
              Puntaje asignado:
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={points}
              onChange={e => setPoints(Number(e.target.value))}
              className="w-20 px-2 py-1 text-sm border border-stone-200 rounded text-center focus:outline-none focus:ring-1 focus:ring-amber-600"
            />
            <span className="text-xs text-stone-500">punto(s) (valor estándar DEMRE: 1 pto)</span>
          </div>

          {/* Footer actions */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 border border-stone-300 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-1.5"
            >
              {saving ? 'Guardando...' : existingQuestion ? 'Guardar Cambios' : 'Añadir Pregunta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
