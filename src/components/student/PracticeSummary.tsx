import React, { useState } from 'react';
import { Attempt, Assignment, Question, DemreSkill, OptionLetter, TextItem } from '../../types/index.js';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft, 
  RotateCcw, 
  Target, 
  BookOpen, 
  X,
  Sparkles,
  Compass,
  Lightbulb,
  ArrowRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { TextAnnotator } from './TextAnnotator.js';

interface Props {
  attempt: Attempt;
  assignment: Assignment;
  questions: Question[];
  text?: Partial<TextItem> | null;
  onBackToDashboard: () => void;
  onRetry?: () => void;
  canRetry: boolean;
}

const SKILL_RECOMMENDATIONS: Record<DemreSkill, {
  title: string;
  focus: string;
  diagnosis: string;
  strategies: string[];
}> = {
  localizar: {
    title: 'Habilidad: Localizar Información Explícita',
    focus: 'Extracción precisa y rastreo visual sin sobreinterpretar',
    diagnosis: 'Presentaste errores al identificar datos que estaban expresados textualmente en la lectura. El error común DEMRE en esta habilidad es dejarse llevar por inferencias o suposiciones en lugar de verificar lo que dice el texto palabra por palabra.',
    strategies: [
      'Técnica de escaneo visual (scanning): Destaca palabras clave de la pregunta (fechas, nombres, tecnicismos) y rastréalas en el párrafo antes de mirar las alternativas.',
      'Cotejo literal: Si una opción incluye valoraciones o consecuencias que el texto no explicitó, descártala de inmediato aunque parezca lógica.',
      'Identificación de sinónimos: El DEMRE suele reformular la información literal usando sinónimos directos o paráfrasis simples.'
    ],
  },
  interpretar_relacionar: {
    title: 'Habilidad: Interpretar y Relacionar',
    focus: 'Inferencia de sentido global, propósito y relaciones lógicas',
    diagnosis: 'Tuviste dificultades para deducir el sentido implícito, la idea central de párrafos o las relaciones de causa-consecuencia entre partes del texto. Es el núcleo de la prueba PAES (50%+ de las preguntas).',
    strategies: [
      'Síntesis por párrafo: Antes de responder, resume mentalmente cada párrafo en una sola frase: "¿Qué idea nueva aportó este párrafo?".',
      'Atención a conectores lógicos: Conectores como "sin embargo", "por consiguiente" o "a pesar de" revelan giros argumentativos esenciales.',
      'Propósito vs Tema: Recuerda que el tema es "de qué trata el texto", mientras que el propósito comunicativo es "para qué el autor lo escribió" (convencer, criticar, informar, conmover).'
    ],
  },
  evaluar: {
    title: 'Habilidad: Evaluar y Reflexionar',
    focus: 'Juicio crítico sobre la postura del autor, pertinencia y validez',
    diagnosis: 'Registraste desaciertos al evaluar la postura crítica del emisor, la suficiencia de sus pruebas o la intencionalidad de recursos retóricos. Esta habilidad exige tomar distancia crítica del texto.',
    strategies: [
      'Análisis de adjetivos y verbos modales: Observa cómo califica el autor los hechos ("lamentablemente", "indiscutiblemente", "se pretende") para captar su sesgo o grado de certeza.',
      'Distinción Hecho vs Opinión: Separa los datos empíricos comprobables de los juicios valorativos o supuestos ideológicos del emisor.',
      'Suficiencia argumentativa: Pregúntate si las evidencias presentadas alcanzan realmente para justificar la conclusión del autor o si incurre en una generalización apresurada.'
    ],
  },
};

export const PracticeSummary: React.FC<Props> = ({
  attempt,
  assignment,
  questions,
  text,
  onBackToDashboard,
  onRetry,
  canRetry,
}) => {
  const [showReadingModal, setShowReadingModal] = useState(false);
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans'>('serif');
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const isFormativo = assignment.mode === 'formativo';

  // Calculate skills breakdown for this attempt
  const skillBreakdown: Record<DemreSkill, { total: number; correct: number; label: string }> = {
    localizar: { total: 0, correct: 0, label: 'Localizar' },
    interpretar_relacionar: { total: 0, correct: 0, label: 'Interpretar y relacionar' },
    evaluar: { total: 0, correct: 0, label: 'Evaluar' },
  };

  questions.forEach(q => {
    const ans = attempt.answers[q.id];
    if (ans && skillBreakdown[q.skill]) {
      skillBreakdown[q.skill].total++;
      if (ans.is_correct) skillBreakdown[q.skill].correct++;
    }
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 sm:p-8 shadow-xs text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-inner">
          <Award className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
            {isFormativo ? 'Práctica Formativa Completada' : 'Evaluación Sumativa Finalizada'}
          </span>
          <h2 className="text-2xl font-bold text-stone-900 mt-1">
            {assignment.title}
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Texto: <span className="font-semibold text-stone-700">{assignment.text_title}</span>
          </p>
        </div>

        {/* Score cards */}
        <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto pt-2">
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
            <span className="text-[11px] font-semibold text-stone-500 uppercase block">Puntaje</span>
            <div className="text-xl sm:text-2xl font-bold text-stone-900 mt-0.5">
              {attempt.score} / {attempt.total_points}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
            <span className="text-[11px] font-semibold text-stone-500 uppercase block">Logro</span>
            <div className="text-xl sm:text-2xl font-bold text-stone-900 mt-0.5">
              {attempt.percentage}%
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
            <span className="text-[11px] font-semibold text-amber-800 uppercase block">Escala PAES</span>
            <div className="text-xl sm:text-2xl font-bold text-amber-800 mt-0.5">
              {attempt.paes_estimated_score} <span className="text-xs font-medium">pts</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
          <button
            onClick={onBackToDashboard}
            className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Mis Actividades
          </button>
          {text?.content && (
            <button
              onClick={() => setShowReadingModal(true)}
              className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <BookOpen className="w-4 h-4 text-amber-700" />
              Ver Texto y Mis Anotaciones
            </button>
          )}
          {canRetry && onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <RotateCcw className="w-4 h-4" />
              Nuevo Intento
            </button>
          )}
        </div>
      </div>

      {/* Skills Performance Breakdown */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
          <Target className="w-4 h-4 text-purple-700" />
          Desempeño por Habilidad DEMRE en esta Lectura
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(['localizar', 'interpretar_relacionar', 'evaluar'] as DemreSkill[]).map(skill => {
            const data = skillBreakdown[skill];
            if (data.total === 0) return null;
            const pct = Math.round((data.correct / data.total) * 100);

            return (
              <div key={skill} className="p-3.5 rounded-lg bg-stone-50 border border-stone-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-800 uppercase">
                    {data.label}
                  </span>
                  <span className="text-sm font-bold text-stone-900">{pct}%</span>
                </div>
                <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="text-[11px] text-stone-500">
                  {data.correct} correctas de {data.total}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Plan de Refuerzo Pedagógico para Habilidades Descendidas */}
      {(() => {
        const rankedSkills = (['localizar', 'interpretar_relacionar', 'evaluar'] as DemreSkill[])
          .map(s => {
            const data = skillBreakdown[s];
            return {
              skill: s,
              label: data.label,
              total: data.total,
              correct: data.correct,
              pct: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
            };
          })
          .filter(s => s.total > 0)
          .sort((a, b) => a.pct - b.pct);

        const lowest = rankedSkills[0];
        if (!lowest) return null;

        const rec = SKILL_RECOMMENDATIONS[lowest.skill];
        const isDescended = lowest.pct < 70;

        return (
          <div className={`p-6 rounded-xl border shadow-xs space-y-4 ${
            isDescended
              ? 'bg-amber-50/70 border-amber-300'
              : 'bg-emerald-50/60 border-emerald-300'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  isDescended ? 'bg-amber-700 text-white' : 'bg-emerald-700 text-white'
                }`}>
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      isDescended ? 'bg-amber-200 text-amber-900' : 'bg-emerald-200 text-emerald-900'
                    }`}>
                      {isDescended ? 'Habilidad Descendida Detectada' : 'Habilidad a Consolidar'}
                    </span>
                    <span className="text-xs font-bold text-stone-700">
                      Logro en esta lectura: {lowest.pct}% ({lowest.correct}/{lowest.total})
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-stone-900 mt-0.5">
                    Plan de Refuerzo Personalizado: {lowest.label}
                  </h3>
                </div>
              </div>

              <button
                onClick={onBackToDashboard}
                className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs self-start sm:self-auto shrink-0"
              >
                <span>Ejercitar {lowest.label}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Diagnostic Details */}
            <div className="bg-white/90 p-4 rounded-lg border border-amber-200/80 space-y-3">
              <div className="text-xs text-stone-800 leading-relaxed">
                <strong className="text-stone-900 block mb-1">Diagnóstico según Criterios Oficiales DEMRE:</strong>
                {rec.diagnosis}
              </div>

              <div className="pt-2 border-t border-stone-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block mb-2 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-700" />
                  Estrategias Clave para Practicar y Superar esta Dificultad:
                </span>
                <ul className="space-y-1.5 text-xs text-stone-700 list-disc list-inside">
                  {rec.strategies.map((strat, sIdx) => (
                    <li key={sIdx} className="leading-relaxed">
                      {strat}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Questions Detailed Review */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-5">
        <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-amber-700" />
          Revisión Detallada de Preguntas y Retroalimentación
        </h3>

        <div className="space-y-4">
          {questions.map((q, idx) => {
            const answer = attempt.answers[q.id];
            const isCorrect = answer?.is_correct;
            const selected = answer?.selected_option;

            return (
              <div
                key={q.id}
                className={`p-4 rounded-lg border space-y-3 ${
                  isCorrect
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-red-200 bg-red-50/20'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-stone-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-stone-600 capitalize">
                      {q.skill.replace('_', ' ')}
                    </span>
                  </div>

                  {isCorrect ? (
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Correcta (+{answer?.points_earned} pto)
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-red-800 bg-red-100 px-2 py-0.5 rounded flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Incorrecta (0 ptos)
                    </span>
                  )}
                </div>

                <p className="text-sm font-semibold text-stone-900">
                  {q.prompt}
                </p>

                {/* Alternatives state */}
                <div className="grid grid-cols-1 gap-2 text-xs">
                  {(['A', 'B', 'C', 'D'] as OptionLetter[]).map(letter => {
                    const isSelected = selected === letter;
                    const isRightOption = q.correct_option === letter;

                    let style = 'border-stone-200 bg-white text-stone-700';
                    if (isRightOption) {
                      style = 'border-emerald-600 bg-emerald-50 text-emerald-950 font-semibold ring-1 ring-emerald-500/20';
                    } else if (isSelected && !isCorrect) {
                      style = 'border-red-500 bg-red-50 text-red-950 font-semibold ring-1 ring-red-500/20';
                    }

                    return (
                      <div
                        key={letter}
                        className={`p-2.5 rounded-lg border flex items-start gap-2.5 ${style}`}
                      >
                        <span className={`w-5 h-5 rounded font-bold text-[10px] flex items-center justify-center shrink-0 ${
                          isRightOption ? 'bg-emerald-600 text-white' : isSelected ? 'bg-red-600 text-white' : 'bg-stone-200 text-stone-700'
                        }`}>
                          {letter}
                        </span>
                        <div className="flex-1">
                          <span>{q.options[letter]}</span>
                          {isRightOption && (
                            <span className="block text-[10px] text-emerald-700 font-bold mt-0.5">
                              ✓ Clave correcta
                            </span>
                          )}
                          {isSelected && !isRightOption && (
                            <span className="block text-[10px] text-red-700 font-bold mt-0.5">
                              ✗ Tu respuesta seleccionada
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Justification */}
                <div className="p-3 bg-white rounded-lg border border-stone-200 text-xs space-y-1">
                  <div className="font-bold text-stone-900">
                    Justificación Pedagógica:
                  </div>
                  <p className="text-stone-700 leading-relaxed">
                    {q.explanation}
                  </p>
                  {selected && !isCorrect && q.distractor_explanations?.[selected] && (
                    <div className="pt-2 mt-2 border-t border-stone-100 text-amber-900 font-medium">
                      Análisis de tu distractor ({selected}): {q.distractor_explanations[selected]}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal to review reading and annotations */}
      {showReadingModal && text?.content && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-stone-200">
            <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-700" />
                <div>
                  <h3 className="text-sm font-bold text-stone-900">
                    Lectura con tus Marcas y Anotaciones Activas
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Revisa las marcas y notas al margen que utilizaste para responder
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowReadingModal(false)}
                className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-200 hover:text-stone-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden flex flex-col">
              <TextAnnotator
                textId={text.id || assignment.text_id || 'main'}
                assignmentId={assignment.id}
                title={text.title || assignment.text_title || 'Lectura'}
                author={text.author}
                source={text.source}
                content={text.content}
                fontSize={fontSize}
                fontFamily={fontFamily}
                onChangeFontSize={setFontSize}
                onChangeFontFamily={setFontFamily}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
