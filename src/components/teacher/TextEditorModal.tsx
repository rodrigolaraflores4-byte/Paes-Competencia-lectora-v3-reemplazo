import React, { useState, useEffect } from 'react';
import { TextItem, TextType, TextDifficulty, TextEditorialStatus } from '../../types/index.js';
import { X, BookOpen, AlertCircle, Hash, AlignLeft } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (textData: Partial<TextItem>) => Promise<void>;
  existingText?: TextItem | null;
}

export const TextEditorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  existingText,
}) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [source, setSource] = useState('');
  const [type, setType] = useState<TextType>('argumentativo');
  const [difficulty, setDifficulty] = useState<TextDifficulty>('medio');
  const [status, setStatus] = useState<TextEditorialStatus>('borrador');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existingText) {
      setTitle(existingText.title);
      setAuthor(existingText.author || '');
      setSource(existingText.source || '');
      setType(existingText.type);
      setDifficulty(existingText.difficulty);
      setStatus(existingText.status);
      setContent(existingText.content);
    } else {
      setTitle('');
      setAuthor('');
      setSource('');
      setType('argumentativo');
      setDifficulty('medio');
      setStatus('borrador');
      setContent('');
    }
    setError(null);
  }, [existingText, isOpen]);

  if (!isOpen) return null;

  const handleAutoNumberParagraphs = () => {
    if (!content.trim()) return;
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    const numbered = paragraphs.map((p, index) => {
      // Clean existing [1], [2] tags at start
      const clean = p.replace(/^\[\d+\]\s*/, '').trim();
      return `[${index + 1}] ${clean}`;
    });
    setContent(numbered.join('\n\n'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('El título del texto es obligatorio.');
      return;
    }
    if (!content.trim()) {
      setError('El contenido del texto no puede estar vacío.');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        author: author.trim(),
        source: source.trim(),
        type,
        difficulty,
        status,
        content: content.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el texto');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-stone-200 my-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div>
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-700" />
              {existingText ? 'Editar Material de Lectura' : 'Nuevo Texto para el Banco'}
            </h3>
            <p className="text-xs text-stone-600">
              Registra textos para formular preguntas de comprensión lectora para IV° Medio
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-lg hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Title and metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Título del Texto *
              </label>
              <input
                type="text"
                placeholder="Ej: La inteligencia artificial y el oficio de pensar"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Autor o Emisor
              </label>
              <input
                type="text"
                placeholder="Ej: Carlos Peña / Gabriel García Márquez"
                value={author}
                onChange={e => setAuthor(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Fuente o Medio
              </label>
              <input
                type="text"
                placeholder="Ej: Diario El Mercurio / DEMRE 2024 / Revista Mensaje"
                value={source}
                onChange={e => setSource(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Tipo de Texto *
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value as TextType)}
                className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 bg-white"
              >
                <option value="argumentativo">Argumentativo</option>
                <option value="columna_opinion">Columna de opinión</option>
                <option value="ensayo">Ensayo</option>
                <option value="expositivo">Expositivo / Científico</option>
                <option value="narrativo">Narrativo</option>
                <option value="literario">Literario / Dramático</option>
                <option value="noticia">Noticia / Crónica</option>
                <option value="instructivo">Instructivo / Dialógico</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Nivel de Dificultad *
              </label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value as TextDifficulty)}
                className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 bg-white"
              >
                <option value="inicial">Inicial (Comprensión directa)</option>
                <option value="medio">Medio (PAES regular)</option>
                <option value="avanzado">Avanzado (Complejidad inferencial alta)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Estado Editorial *
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as TextEditorialStatus)}
                className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 bg-white"
              >
                <option value="borrador">Borrador (Solo visible para docente)</option>
                <option value="en_revision">En revisión (Pendiente de preguntas)</option>
                <option value="aprobado">Aprobado (Listo para asignar a cursos)</option>
                <option value="archivado">Archivado</option>
              </select>
            </div>
          </div>

          {/* Text Content */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                Texto Completo (Párrafos y saltos de línea) *
              </label>
              <button
                type="button"
                onClick={handleAutoNumberParagraphs}
                className="text-xs text-amber-800 hover:text-amber-900 font-semibold flex items-center gap-1 hover:underline"
                title="Inserta numeración [1], [2], [3] al inicio de cada párrafo para facilitar preguntas de localización"
              >
                <Hash className="w-3.5 h-3.5" />
                Numerar párrafos [1], [2] automáticamente
              </button>
            </div>
            <textarea
              rows={12}
              placeholder="Escribe o pega aquí el texto completo conservando párrafos..."
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full p-4 text-sm font-serif-reading leading-relaxed border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 bg-stone-50/30"
              required
            />
            <p className="text-[11px] text-stone-500 mt-1">
              Consejo PAES: Utiliza doble salto de línea entre párrafos. La numeración [1], [2], [3] ayuda a los estudiantes a localizar información en sus teléfonos.
            </p>
          </div>

          {/* Footer buttons */}
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
              className="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-sm font-bold shadow-sm transition-colors"
            >
              {saving ? 'Guardando...' : existingText ? 'Guardar Cambios' : 'Crear Texto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
