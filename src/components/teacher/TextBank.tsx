import React, { useState, useEffect } from 'react';
import { api } from '../../api/client.js';
import { TextItem, Question, TextEditorialStatus, TextType, TextDifficulty, DemreSkill } from '../../types/index.js';
import { TextEditorModal } from './TextEditorModal.js';
import { TextImportModal } from './TextImportModal.js';
import { QuestionEditorModal } from './QuestionEditorModal.js';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Archive, 
  Edit3, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  ArrowUp, 
  ArrowDown, 
  Award, 
  Check, 
  HelpCircle,
  FileCheck,
  Upload
} from 'lucide-react';

export const TextBank: React.FC = () => {
  const [texts, setTexts] = useState<TextItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');

  // Expanded text details
  const [expandedTextId, setExpandedTextId] = useState<string | null>('txt_ia_pensar');

  // Modals state
  const [textModalOpen, setTextModalOpen] = useState(false);
  const [editingText, setEditingText] = useState<TextItem | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [activeTextForQuestion, setActiveTextForQuestion] = useState<TextItem | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchTexts = async () => {
    setLoading(true);
    try {
      const res = await api.getTexts({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        difficulty: difficultyFilter !== 'all' ? difficultyFilter : undefined,
        search: search.trim() || undefined,
      });
      setTexts(res.texts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTexts();
  }, [statusFilter, typeFilter, difficultyFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTexts();
  };

  const handleSaveText = async (textData: Partial<TextItem>) => {
    if (editingText) {
      await api.updateText(editingText.id, textData);
      setFeedbackMsg({ type: 'success', text: 'Texto actualizado exitosamente' });
    } else {
      const res = await api.createText(textData);
      setFeedbackMsg({ type: 'success', text: 'Nuevo texto agregado al banco' });
      setExpandedTextId(res.text.id);
    }
    fetchTexts();
  };

  const handleDeleteText = async (id: string, title: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar el texto "${title}" y todas sus preguntas asociadas?`)) {
      return;
    }
    try {
      await api.deleteText(id);
      setFeedbackMsg({ type: 'success', text: 'Texto eliminado del banco' });
      fetchTexts();
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message });
    }
  };

  const handleApproveText = async (id: string) => {
    try {
      const res = await api.approveText(id);
      if (res.success) {
        setFeedbackMsg({ type: 'success', text: res.message });
        fetchTexts();
      }
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message });
    }
  };

  const handleSaveQuestion = async (qData: Partial<Question>) => {
    if (!activeTextForQuestion) return;
    if (editingQuestion) {
      await api.updateQuestion(activeTextForQuestion.id, editingQuestion.id, qData);
      setFeedbackMsg({ type: 'success', text: 'Pregunta actualizada' });
    } else {
      await api.addQuestion(activeTextForQuestion.id, qData);
      setFeedbackMsg({ type: 'success', text: 'Pregunta agregada exitosamente al texto' });
    }
    fetchTexts();
  };

  const handleDeleteQuestion = async (textId: string, questionId: string) => {
    if (!window.confirm('¿Deseas eliminar esta pregunta?')) return;
    try {
      await api.deleteQuestion(textId, questionId);
      setFeedbackMsg({ type: 'success', text: 'Pregunta eliminada' });
      fetchTexts();
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message });
    }
  };

  const handleMoveQuestion = async (text: TextItem, questionId: string, direction: 'up' | 'down') => {
    if (!text.questions) return;
    const qList = [...text.questions];
    const currentIndex = qList.findIndex(q => q.id === questionId);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= qList.length) return;

    const temp = qList[currentIndex];
    qList[currentIndex] = qList[targetIndex];
    qList[targetIndex] = temp;

    const orderedIds = qList.map(q => q.id);
    await api.reorderQuestions(text.id, orderedIds);
    fetchTexts();
  };

  const skillBadges: Record<DemreSkill, { label: string; color: string }> = {
    localizar: { label: 'Localizar', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    interpretar_relacionar: { label: 'Interpretar y relacionar', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    evaluar: { label: 'Evaluar', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  };

  const statusBadges: Record<TextEditorialStatus, { label: string; icon: any; color: string }> = {
    borrador: { label: 'Borrador', icon: Clock, color: 'text-stone-600 bg-stone-100' },
    en_revision: { label: 'En revisión', icon: Clock, color: 'text-amber-800 bg-amber-100' },
    aprobado: { label: 'Aprobado', icon: CheckCircle2, color: 'text-emerald-800 bg-emerald-100' },
    archivado: { label: 'Archivado', icon: Archive, color: 'text-stone-500 bg-stone-100' },
  };

  return (
    <div className="space-y-6">
      {/* Feedback banner */}
      {feedbackMsg && (
        <div
          className={`p-3 rounded-lg text-xs font-medium flex items-center justify-between transition-all ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <span>{feedbackMsg.text}</span>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="text-stone-400 hover:text-stone-700 text-xs ml-2 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-700" />
            Banco de Textos y Preguntas PAES
          </h2>
          <p className="text-xs text-stone-600 mt-0.5">
            Crea textos con saltos de línea y asocia preguntas con habilidades DEMRE (Localizar, Interpretar y Evaluar)
          </p>
        </div>
        <div className="flex flex-wrap gap-2 self-start sm:self-auto">
          <button
            onClick={() => setImportOpen(true)}
            className="px-4 py-2 bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 rounded-lg text-sm font-bold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Importar textos
          </button>
          <button
            onClick={() => {
              setEditingText(null);
              setTextModalOpen(true);
            }}
            className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-sm font-bold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Crear Nuevo Texto
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs space-y-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Buscar por título, autor o contenido..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs sm:text-sm font-semibold transition-colors"
          >
            Buscar
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-stone-100 text-xs">
          <div>
            <label className="text-[11px] font-bold uppercase text-stone-500 block mb-1">
              Estado Editorial
            </label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-stone-200 rounded-md bg-stone-50 focus:bg-white"
            >
              <option value="all">Todos los estados</option>
              <option value="aprobado">Aprobado (listo para cursos)</option>
              <option value="en_revision">En revisión</option>
              <option value="borrador">Borrador</option>
              <option value="archivado">Archivado</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase text-stone-500 block mb-1">
              Tipo de Texto
            </label>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-stone-200 rounded-md bg-stone-50 focus:bg-white"
            >
              <option value="all">Todos los tipos</option>
              <option value="columna_opinion">Columna de opinión</option>
              <option value="argumentativo">Argumentativo</option>
              <option value="expositivo">Expositivo / Científico</option>
              <option value="narrativo">Narrativo</option>
              <option value="literario">Literario</option>
              <option value="ensayo">Ensayo</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase text-stone-500 block mb-1">
              Dificultad
            </label>
            <select
              value={difficultyFilter}
              onChange={e => setDifficultyFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-stone-200 rounded-md bg-stone-50 focus:bg-white"
            >
              <option value="all">Todas las dificultades</option>
              <option value="inicial">Inicial</option>
              <option value="medio">Medio</option>
              <option value="avanzado">Avanzado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Texts List */}
      {loading ? (
        <div className="p-12 text-center text-sm text-stone-500">
          Cargando banco de textos...
        </div>
      ) : texts.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-stone-200">
          <BookOpen className="w-10 h-10 text-stone-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-stone-700">No se encontraron textos en el banco</p>
          <p className="text-xs text-stone-500 mt-1">Ajusta los filtros o crea un nuevo texto para comenzar.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {texts.map(text => {
            const isExpanded = expandedTextId === text.id;
            const StatusIcon = statusBadges[text.status]?.icon || Clock;
            const questions = text.questions || [];

            return (
              <div
                key={text.id}
                className={`bg-white rounded-xl border transition-all ${
                  isExpanded ? 'border-amber-600/40 shadow-md ring-1 ring-amber-600/10' : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                {/* Header Row */}
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${statusBadges[text.status]?.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusBadges[text.status]?.label}
                      </span>
                      <span className="text-[11px] font-medium bg-stone-100 text-stone-700 px-2 py-0.5 rounded capitalize">
                        {text.type.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] font-medium bg-stone-100 text-stone-700 px-2 py-0.5 rounded capitalize">
                        Dificultad {text.difficulty}
                      </span>
                      <span className="text-[11px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                        {questions.length} {questions.length === 1 ? 'pregunta' : 'preguntas'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-stone-900 leading-snug">
                      {text.title}
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {text.author && <span>{text.author} · </span>}
                      {text.source && <span className="italic">{text.source}</span>}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                    {text.status !== 'aprobado' && (
                      <button
                        onClick={() => handleApproveText(text.id)}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                        title="Valida que tenga preguntas completas y aprueba el texto para uso con estudiantes"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        Aprobar para Práctica
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setEditingText(text);
                        setTextModalOpen(true);
                      }}
                      className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                      title="Editar texto"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteText(text.id, text.title)}
                      className="p-1.5 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar texto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setExpandedTextId(isExpanded ? null : text.id)}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      {isExpanded ? (
                        <>
                          <span>Ocultar preguntas</span>
                          <ChevronUp className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <>
                          <span>Ver preguntas ({questions.length})</span>
                          <ChevronDown className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Details: Reading text preview & Question management */}
                {isExpanded && (
                  <div className="border-t border-stone-200 bg-stone-50/50 p-5 space-y-6">
                    {/* Reading Text Preview Box */}
                    <div className="bg-white p-5 rounded-lg border border-stone-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                          Lectura Completa (Vista Previa Párrafos)
                        </span>
                        <span className="text-[11px] text-stone-400">
                          Párrafos delimitados para facilitar la localización
                        </span>
                      </div>
                      <div className="max-h-60 overflow-y-auto reading-scrollbar pr-3 font-serif-reading text-sm text-stone-800 leading-relaxed whitespace-pre-line bg-stone-50/40 p-4 rounded border border-stone-100">
                        {text.content}
                      </div>
                    </div>

                    {/* Questions Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                          <Award className="w-4 h-4 text-amber-700" />
                          Preguntas Asociadas ({questions.length})
                        </h4>
                        <p className="text-xs text-stone-500">
                          Cada pregunta evalúa una habilidad DEMRE específica con 4 alternativas y justificación
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setActiveTextForQuestion(text);
                          setEditingQuestion(null);
                          setQuestionModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Agregar Pregunta
                      </button>
                    </div>

                    {/* Questions List */}
                    {questions.length === 0 ? (
                      <div className="p-6 text-center border-2 border-dashed border-stone-300 rounded-lg bg-white">
                        <p className="text-xs font-semibold text-stone-600">
                          Este texto aún no tiene preguntas de comprensión
                        </p>
                        <p className="text-[11px] text-stone-500 mt-1">
                          Agrega preguntas con habilidades de Localizar, Interpretar o Evaluar antes de aprobar el texto.
                        </p>
                        <button
                          onClick={() => {
                            setActiveTextForQuestion(text);
                            setEditingQuestion(null);
                            setQuestionModalOpen(true);
                          }}
                          className="mt-3 px-3 py-1.5 bg-amber-700 text-white rounded text-xs font-bold hover:bg-amber-800"
                        >
                          Crear Primera Pregunta
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {questions.map((q, qIndex) => {
                          const badge = skillBadges[q.skill] || skillBadges.interpretar_relacionar;
                          return (
                            <div
                              key={q.id}
                              className="bg-white p-4 rounded-lg border border-stone-200 shadow-xs space-y-3"
                            >
                              {/* Question Top Bar */}
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="w-6 h-6 rounded-full bg-stone-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                                    {qIndex + 1}
                                  </span>
                                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${badge.color}`}>
                                    {badge.label}
                                  </span>
                                  <span className="text-xs text-stone-500 font-medium">
                                    {q.points} pto.
                                  </span>
                                </div>

                                {/* Question order and edit controls */}
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleMoveQuestion(text, q.id, 'up')}
                                    disabled={qIndex === 0}
                                    className="p-1 text-stone-400 hover:text-stone-800 disabled:opacity-30 rounded hover:bg-stone-100"
                                    title="Subir orden"
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleMoveQuestion(text, q.id, 'down')}
                                    disabled={qIndex === questions.length - 1}
                                    className="p-1 text-stone-400 hover:text-stone-800 disabled:opacity-30 rounded hover:bg-stone-100"
                                    title="Bajar orden"
                                  >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setActiveTextForQuestion(text);
                                      setEditingQuestion(q);
                                      setQuestionModalOpen(true);
                                    }}
                                    className="p-1 text-stone-600 hover:text-stone-900 rounded hover:bg-stone-100"
                                    title="Editar pregunta"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteQuestion(text.id, q.id)}
                                    className="p-1 text-stone-400 hover:text-red-700 rounded hover:bg-red-50"
                                    title="Eliminar pregunta"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Prompt */}
                              <p className="text-sm font-semibold text-stone-900">
                                {q.prompt}
                              </p>

                              {/* Options grid */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                {(['A', 'B', 'C', 'D'] as const).map(letter => {
                                  const isCorrect = q.correct_option === letter;
                                  return (
                                    <div
                                      key={letter}
                                      className={`p-2 rounded border flex items-start gap-2 ${
                                        isCorrect
                                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-medium'
                                          : 'border-stone-200 bg-stone-50/50 text-stone-700'
                                      }`}
                                    >
                                      <span
                                        className={`w-5 h-5 rounded font-bold text-[10px] flex items-center justify-center shrink-0 ${
                                          isCorrect
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-stone-200 text-stone-700'
                                        }`}
                                      >
                                        {letter}
                                      </span>
                                      <div className="flex-1">
                                        <span>{q.options[letter]}</span>
                                        {isCorrect && (
                                          <span className="block text-[10px] text-emerald-700 font-bold mt-0.5">
                                            ✓ Alternativa Correcta
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Rationale explanation & Distractor Errors */}
                              <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200/70 text-xs text-amber-950 space-y-2">
                                <div>
                                  <span className="font-bold text-amber-900 block mb-0.5">
                                    Justificación de la Clave Correcta (Alternativa {q.correct_option}):
                                  </span>
                                  <p className="text-stone-700 leading-relaxed">{q.explanation}</p>
                                </div>

                                {q.distractor_explanations && Object.values(q.distractor_explanations).some(Boolean) && (
                                  <div className="pt-2 border-t border-amber-200/50 space-y-1">
                                    <span className="font-bold text-stone-800 text-[11px] block">
                                      Análisis de errores en distractores:
                                    </span>
                                    <div className="space-y-1 text-[11px]">
                                      {(['A', 'B', 'C', 'D'] as const)
                                        .filter(l => l !== q.correct_option && q.distractor_explanations?.[l])
                                        .map(l => (
                                          <div key={l} className="text-stone-600 bg-white/70 p-1.5 rounded border border-amber-100 flex items-start gap-1.5">
                                            <span className="font-bold text-red-700 shrink-0">Opción {l}:</span>
                                            <span>{q.distractor_explanations?.[l]}</span>
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <TextImportModal open={importOpen} onClose={() => setImportOpen(false)} onImported={fetchTexts} />

      <TextEditorModal
        isOpen={textModalOpen}
        onClose={() => setTextModalOpen(false)}
        onSave={handleSaveText}
        existingText={editingText}
      />

      {activeTextForQuestion && (
        <QuestionEditorModal
          isOpen={questionModalOpen}
          onClose={() => {
            setQuestionModalOpen(false);
            setActiveTextForQuestion(null);
            setEditingQuestion(null);
          }}
          onSave={handleSaveQuestion}
          existingQuestion={editingQuestion}
          textTitle={activeTextForQuestion.title}
        />
      )}
    </div>
  );
};
