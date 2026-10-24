import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Highlighter,
  PenLine,
  StickyNote,
  Trash2,
  BookOpen,
  HelpCircle,
  X,
  Plus,
  Check,
  ChevronRight,
  ExternalLink,
  Info,
  Palette,
  Sparkles,
  ArrowRight,
  Bookmark,
  Share2,
  Copy,
  Sliders,
  Type,
  Eraser
} from 'lucide-react';

export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'underline';

export interface TextAnnotation {
  id: string;
  start: number;
  end: number;
  text: string;
  color: HighlightColor;
  note?: string;
  createdAt: number;
}

interface Props {
  textId: string;
  assignmentId: string;
  title: string;
  author?: string;
  source?: string;
  content: string;
  fontSize: 'sm' | 'base' | 'lg';
  fontFamily: 'serif' | 'sans';
  onChangeFontSize: (size: 'sm' | 'base' | 'lg') => void;
  onChangeFontFamily: (family: 'serif' | 'sans') => void;
  onSwitchToQuestions?: () => void;
  questionNumber?: number;
  totalQuestions?: number;
}

const COLOR_CONFIG: Record<
  HighlightColor,
  {
    name: string;
    strategy: string;
    bgClass: string;
    borderClass: string;
    chipBg: string;
    chipText: string;
    badgeBg: string;
    iconColor: string;
  }
> = {
  yellow: {
    name: 'Amarillo',
    strategy: 'Idea Principal / Tesis',
    bgClass: 'bg-amber-200/90 text-stone-900 border-b-2 border-amber-400 rounded-[2px]',
    borderClass: 'border-amber-400',
    chipBg: 'bg-amber-100 hover:bg-amber-200 border-amber-300',
    chipText: 'text-amber-900',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
    iconColor: '#f59e0b',
  },
  green: {
    name: 'Verde',
    strategy: 'Datos y Evidencias',
    bgClass: 'bg-emerald-200/90 text-stone-900 border-b-2 border-emerald-400 rounded-[2px]',
    borderClass: 'border-emerald-400',
    chipBg: 'bg-emerald-100 hover:bg-emerald-200 border-emerald-300',
    chipText: 'text-emerald-900',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    iconColor: '#10b981',
  },
  blue: {
    name: 'Celeste',
    strategy: 'Conceptos y Definición',
    bgClass: 'bg-sky-200/90 text-stone-900 border-b-2 border-sky-400 rounded-[2px]',
    borderClass: 'border-sky-400',
    chipBg: 'bg-sky-100 hover:bg-sky-200 border-sky-300',
    chipText: 'text-sky-900',
    badgeBg: 'bg-sky-100 text-sky-800 border-sky-200',
    iconColor: '#0ea5e9',
  },
  pink: {
    name: 'Rosa',
    strategy: 'Detalles y Personajes',
    bgClass: 'bg-pink-200/90 text-stone-900 border-b-2 border-pink-400 rounded-[2px]',
    borderClass: 'border-pink-400',
    chipBg: 'bg-pink-100 hover:bg-pink-200 border-pink-300',
    chipText: 'text-pink-900',
    badgeBg: 'bg-pink-100 text-pink-800 border-pink-200',
    iconColor: '#ec4899',
  },
  underline: {
    name: 'Subrayado',
    strategy: 'Marcado con Lápiz',
    bgClass: 'underline decoration-amber-700 decoration-2 underline-offset-4 bg-amber-50/40 text-stone-900',
    borderClass: 'border-amber-600',
    chipBg: 'bg-stone-100 hover:bg-stone-200 border-stone-300',
    chipText: 'text-stone-800',
    badgeBg: 'bg-stone-100 text-stone-800 border-stone-200',
    iconColor: '#b45309',
  },
};

export const TextAnnotator: React.FC<Props> = ({
  textId,
  assignmentId,
  title,
  author,
  source,
  content,
  fontSize,
  fontFamily,
  onChangeFontSize,
  onChangeFontFamily,
  onSwitchToQuestions,
  questionNumber,
  totalQuestions,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textBodyRef = useRef<HTMLDivElement>(null);

  // Storage key
  const storageKey = `paes_annot_${assignmentId}_${textId || 'current'}`;

  // Annotations state
  const [annotations, setAnnotations] = useState<TextAnnotation[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading saved annotations:', e);
    }
    return [];
  });

  // Save to local storage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(annotations));
    } catch (e) {
      console.error('Error saving annotations:', e);
    }
  }, [annotations, storageKey]);

  // Active Tool in top bar
  const [activeTool, setActiveTool] = useState<
    'select' | 'eraser' | HighlightColor
  >('yellow');

  // Floating selection menu position & state
  const [floatingMenu, setFloatingMenu] = useState<{
    x: number;
    y: number;
    start: number;
    end: number;
    selectedText: string;
    isNoteMode?: boolean;
    noteDraft?: string;
  } | null>(null);

  // Clicked existing annotation popover
  const [activeAnnotationPopover, setActiveAnnotationPopover] = useState<{
    annotation: TextAnnotation;
    x: number;
    y: number;
    editingNote?: boolean;
    noteText?: string;
  } | null>(null);

  // Notes drawer sidebar open
  const [showNotesDrawer, setShowNotesDrawer] = useState(false);

  // Strategy guide modal open
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Notification feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Calculate text character offset from DOM Selection
  const getCharOffset = (
    container: HTMLElement,
    targetNode: Node,
    targetOffset: number
  ): number => {
    let offset = 0;
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    let currentNode = walker.nextNode();
    while (currentNode) {
      if (currentNode === targetNode) {
        return offset + targetOffset;
      }
      offset += currentNode.textContent?.length || 0;
      currentNode = walker.nextNode();
    }
    return offset;
  };

  // Dispositivos táctiles: el panel de marcado va abajo, con botones grandes
  const isCoarse = typeof window !== 'undefined' && !!window.matchMedia?.('(pointer: coarse)').matches;
  const [mobileSel, setMobileSel] = useState<{
    start: number;
    end: number;
    text: string;
    noteMode?: boolean;
    noteDraft?: string;
    noteColor?: HighlightColor;
  } | null>(null);

  // En el celular no existe "mouseup": se escucha el cambio de selección (con una breve pausa
  // para que el estudiante termine de ajustar los tiradores de selección)
  useEffect(() => {
    if (!isCoarse) return;
    let timer: ReturnType<typeof setTimeout>;
    const onChange = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const sel = window.getSelection();
        const container = textBodyRef.current;
        if (!sel || sel.isCollapsed || !sel.rangeCount || !container) {
          setMobileSel(prev => (prev?.noteMode ? prev : null));
          return;
        }
        const range = sel.getRangeAt(0);
        if (!container.contains(range.commonAncestorContainer)) return;
        const str = sel.toString();
        if (!str.trim()) return;
        let start = getCharOffset(container, range.startContainer, range.startOffset);
        let end = getCharOffset(container, range.endContainer, range.endOffset);
        if (start > end) [start, end] = [end, start];
        if (content.slice(start, end) !== str) {
          const from = Math.max(0, start - 60);
          const idx = content.slice(from, Math.min(content.length, end + 60)).indexOf(str);
          if (idx !== -1) { start = from + idx; end = start + str.length; }
        }
        setMobileSel(prev => ({ start, end, text: str, noteMode: prev?.noteMode, noteDraft: prev?.noteDraft, noteColor: prev?.noteColor }));
      }, 350);
    };
    document.addEventListener('selectionchange', onChange);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('selectionchange', onChange);
    };
  }, [isCoarse, content]);

  // Handle Text Selection event
  const handleMouseUp = () => {
    if (isCoarse) return; // en pantallas táctiles lo maneja el panel inferior
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.rangeCount) {
      return;
    }

    const range = selection.getRangeAt(0);
    const container = textBodyRef.current;
    if (!container || !container.contains(range.commonAncestorContainer)) {
      return;
    }

    const selectedStr = selection.toString();
    if (!selectedStr || selectedStr.trim().length === 0) {
      return;
    }

    let start = getCharOffset(container, range.startContainer, range.startOffset);
    let end = getCharOffset(container, range.endContainer, range.endOffset);

    if (start > end) {
      const temp = start;
      start = end;
      end = temp;
    }

    // Exact check / auto-alignment with content
    if (content.slice(start, end) !== selectedStr) {
      const searchStart = Math.max(0, start - 60);
      const searchEnd = Math.min(content.length, end + 60);
      const localIdx = content.slice(searchStart, searchEnd).indexOf(selectedStr);
      if (localIdx !== -1) {
        start = searchStart + localIdx;
        end = start + selectedStr.length;
      }
    }

    // If active tool is a color and user isn't in select/eraser mode, apply immediately!
    if (activeTool !== 'select' && activeTool !== 'eraser') {
      applyHighlight(start, end, activeTool);
      selection.removeAllRanges();
      return;
    }

    // Otherwise show floating toolbar
    const rect = range.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect() || {
      left: 0,
      top: 0,
    };

    setFloatingMenu({
      x: Math.max(10, rect.left - containerRect.left + rect.width / 2),
      y: Math.max(10, rect.top - containerRect.top - 12),
      start,
      end,
      selectedText: selectedStr,
    });
  };

  // Apply a highlight or underline
  const applyHighlight = (
    start: number,
    end: number,
    color: HighlightColor,
    note?: string
  ) => {
    if (start >= end) return;

    // Filter overlapping existing annotations
    const remaining: TextAnnotation[] = [];
    for (const h of annotations) {
      if (h.end <= start || h.start >= end) {
        remaining.push(h);
      } else if (h.start < start && h.end > end) {
        remaining.push({ ...h, id: `${h.id}_1`, end: start });
        remaining.push({ ...h, id: `${h.id}_2`, start: end });
      } else if (h.start < start && h.end <= end) {
        remaining.push({ ...h, end: start });
      } else if (h.start >= start && h.end > end) {
        remaining.push({ ...h, start: end });
      }
    }

    const newAnnot: TextAnnotation = {
      id: `hl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      start,
      end,
      text: content.slice(start, end),
      color,
      note,
      createdAt: Date.now(),
    };

    remaining.push(newAnnot);
    remaining.sort((a, b) => a.start - b.start);
    setAnnotations(remaining);

    setFloatingMenu(null);
    window.getSelection()?.removeAllRanges();

    if (note) {
      showToast('Anotación agregada con éxito');
    }
  };

  // Delete an annotation
  const removeAnnotation = (id: string) => {
    setAnnotations(prev => prev.filter(a => a.id !== id));
    setActiveAnnotationPopover(null);
    showToast('Marca eliminada');
  };

  // Clear all annotations
  const handleClearAll = () => {
    if (annotations.length === 0) return;
    if (
      window.confirm(
        '¿Deseas borrar todas las marcas y notas de este texto? Esta acción no se puede deshacer.'
      )
    ) {
      setAnnotations([]);
      setActiveAnnotationPopover(null);
      setFloatingMenu(null);
      showToast('Se limpiaron todas las marcas');
    }
  };

  // Update note on existing annotation
  const handleUpdateNote = (id: string, noteText: string) => {
    setAnnotations(prev =>
      prev.map(a => (a.id === id ? { ...a, note: noteText.trim() || undefined } : a))
    );
    setActiveAnnotationPopover(prev =>
      prev ? { ...prev, annotation: { ...prev.annotation, note: noteText.trim() || undefined }, editingNote: false } : null
    );
    showToast('Nota actualizada');
  };

  // Update color on existing annotation
  const handleChangeColor = (id: string, newColor: HighlightColor) => {
    setAnnotations(prev =>
      prev.map(a => (a.id === id ? { ...a, color: newColor } : a))
    );
    setActiveAnnotationPopover(prev =>
      prev ? { ...prev, annotation: { ...prev.annotation, color: newColor } } : null
    );
  };

  // Scroll to highlight in text body
  const scrollToAnnotation = (id: string) => {
    const el = document.getElementById(`annot-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-4', 'ring-amber-400/80', 'transition-all');
      setTimeout(() => {
        el.classList.remove('ring-4', 'ring-amber-400/80');
      }, 1500);
    }
  };

  // Copy notes to clipboard
  const handleCopyNotes = () => {
    if (annotations.length === 0) return;
    const lines = annotations.map((a, i) => {
      const cat = COLOR_CONFIG[a.color].strategy;
      const noteStr = a.note ? `\n   📝 Nota: ${a.note}` : '';
      return `${i + 1}. [${cat}] "${a.text}"${noteStr}`;
    });
    const summary = `NOTAS DE LECTURA PAES: ${title}\n\n${lines.join('\n\n')}`;
    navigator.clipboard.writeText(summary);
    showToast('Anotaciones copiadas al portapapeles');
  };

  // Slices content into text segments and highlights
  const textSegments = useMemo(() => {
    const segments: Array<{
      type: 'text' | 'highlight';
      content: string;
      annotation?: TextAnnotation;
    }> = [];

    if (!annotations.length) {
      return [{ type: 'text' as const, content }];
    }

    let currentIndex = 0;
    annotations.forEach(annot => {
      // Normal text before highlight
      if (annot.start > currentIndex) {
        segments.push({
          type: 'text',
          content: content.slice(currentIndex, annot.start),
        });
      }
      // Highlighted text
      segments.push({
        type: 'highlight',
        content: content.slice(annot.start, annot.end),
        annotation: annot,
      });
      currentIndex = annot.end;
    });

    // Remaining text after last highlight
    if (currentIndex < content.length) {
      segments.push({
        type: 'text',
        content: content.slice(currentIndex),
      });
    }

    return segments;
  }, [content, annotations]);

  // Click on a highlighted segment in text
  const handleHighlightClick = (
    e: React.MouseEvent,
    annot: TextAnnotation
  ) => {
    e.stopPropagation();

    // If eraser tool is active, delete directly
    if (activeTool === 'eraser') {
      removeAnnotation(annot.id);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect() || {
      left: 0,
      top: 0,
    };

    setActiveAnnotationPopover({
      annotation: annot,
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.bottom - containerRect.top + 8,
      editingNote: false,
      noteText: annot.note || '',
    });
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 flex flex-col overflow-hidden relative select-text"
      onMouseUp={handleMouseUp}
    >
      {/* Toast alert */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Reader & Annotator Toolbar */}
      <div className="p-2 sm:p-2.5 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
        {/* Tool selector (Select, Highlighter colors, Underline, Eraser) */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-stone-200 shadow-2xs">
          {/* Normal Select mode */}
          <button
            onClick={() => setActiveTool('select')}
            className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 transition-colors ${
              activeTool === 'select'
                ? 'bg-stone-900 text-white shadow-2xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
            title="Modo selección normal (muestra menú flotante)"
          >
            <PenLine className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Seleccionar</span>
          </button>

          <div className="w-[1px] h-4 bg-stone-200 mx-0.5" />

          {/* Color Highlighters */}
          {(['yellow', 'green', 'blue', 'pink', 'underline'] as HighlightColor[]).map(
            color => {
              const cfg = COLOR_CONFIG[color];
              const isSelected = activeTool === color;
              return (
                <button
                  key={color}
                  onClick={() => setActiveTool(color)}
                  className={`w-9 h-9 sm:w-7 sm:h-7 rounded-md flex items-center justify-center transition-transform ${
                    isSelected
                      ? 'ring-2 ring-stone-900 scale-105 shadow-2xs'
                      : 'hover:scale-105 opacity-80 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor:
                      color === 'underline' ? '#f5f5f4' : cfg.iconColor,
                  }}
                  title={`Marcador: ${cfg.strategy} (${cfg.name})`}
                >
                  {color === 'underline' ? (
                    <span className="text-[11px] font-bold text-stone-700 underline decoration-2">
                      U
                    </span>
                  ) : isSelected ? (
                    <Check className="w-3.5 h-3.5 text-stone-900 stroke-[3]" />
                  ) : null}
                </button>
              );
            }
          )}

          <div className="w-[1px] h-4 bg-stone-200 mx-0.5" />

          {/* Eraser */}
          <button
            onClick={() => setActiveTool('eraser')}
            className={`p-2.5 sm:p-1.5 rounded text-xs transition-colors ${
              activeTool === 'eraser'
                ? 'bg-red-600 text-white shadow-2xs'
                : 'text-stone-600 hover:bg-red-50 hover:text-red-600'
            }`}
            title="Modo Borrador: haz clic en cualquier subrayado o resaltado para quitarlo"
          >
            <Eraser className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action buttons: Notes Drawer, Guide, Font toggles */}
        <div className="flex items-center gap-1.5 ml-auto">
          {/* Notes drawer button */}
          <button
            onClick={() => setShowNotesDrawer(!showNotesDrawer)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              showNotesDrawer || annotations.length > 0
                ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-2xs'
                : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
            title="Ver mis marcas y anotaciones"
          >
            <StickyNote className="w-3.5 h-3.5 text-amber-700" />
            <span>Notas</span>
            <span className="w-4 h-4 rounded-full bg-amber-700 text-white text-[10px] font-bold flex items-center justify-center">
              {annotations.length}
            </span>
          </button>

          {/* DEMRE Strategy Guide */}
          <button
            onClick={() => setShowGuideModal(true)}
            className="p-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 hover:text-amber-800"
            title="Estrategias de Marcado PAES (Guía DEMRE)"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>

          {/* Tamaño de letra en celular: un solo botón que rota A- / A / A+ */}
          <button
            onClick={() => onChangeFontSize(fontSize === 'sm' ? 'base' : fontSize === 'base' ? 'lg' : 'sm')}
            className="sm:hidden px-2.5 h-9 rounded-lg border border-stone-200 bg-white text-stone-700 text-xs font-bold"
            aria-label="Cambiar tamaño de letra"
          >
            Aa {fontSize === 'sm' ? '−' : fontSize === 'lg' ? '+' : ''}
          </button>

          {/* Typography options */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={() =>
                onChangeFontFamily(fontFamily === 'serif' ? 'sans' : 'serif')
              }
              className="p-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
              title="Alternar entre Serif y Sans-Serif"
            >
              <Type className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center border border-stone-200 bg-white rounded-lg overflow-hidden text-xs">
              <button
                onClick={() => onChangeFontSize('sm')}
                className={`px-1.5 py-1 font-bold ${
                  fontSize === 'sm'
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-600 hover:bg-stone-50'
                }`}
              >
                A-
              </button>
              <button
                onClick={() => onChangeFontSize('base')}
                className={`px-1.5 py-1 font-bold ${
                  fontSize === 'base'
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-600 hover:bg-stone-50'
                }`}
              >
                A
              </button>
              <button
                onClick={() => onChangeFontSize('lg')}
                className={`px-1.5 py-1 font-bold ${
                  fontSize === 'lg'
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-600 hover:bg-stone-50'
                }`}
              >
                A+
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Reading area + Optional Side Notes Drawer */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Scrollable Text Body */}
        <div className="flex-1 overflow-y-auto reading-scrollbar p-4 pb-32 sm:p-8 sm:pb-8 md:p-10 bg-white">
          <div className="max-w-2xl mx-auto space-y-5">
            {/* Reading Header */}
            <div className="pb-4 border-b border-stone-100">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                  Lectura PAES de Competencia Lectora
                </span>
                {annotations.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-[11px] text-stone-400 hover:text-red-600 flex items-center gap-1 transition-colors"
                    title="Limpiar todas las marcas"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Limpiar marcas</span>
                  </button>
                )}
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-stone-900 mt-1">
                {title}
              </h1>
              <p className="text-xs text-stone-500 mt-0.5">
                {author && <span>{author} · </span>}
                {source && <span className="italic">{source}</span>}
              </p>
            </div>

            {/* Reading Content with Active Annotations */}
            <div
              ref={textBodyRef}
              className={`reading-body leading-relaxed text-stone-900 whitespace-pre-line ${
                fontFamily === 'serif' ? 'font-serif-reading' : 'font-sans-ui'
              } ${
                fontSize === 'sm'
                  ? 'text-sm'
                  : fontSize === 'lg'
                  ? 'text-lg leading-loose'
                  : 'text-base'
              }`}
            >
              {textSegments.map((segment, idx) => {
                if (segment.type === 'text') {
                  return <span key={idx}>{segment.content}</span>;
                }

                const annot = segment.annotation!;
                const cfg = COLOR_CONFIG[annot.color];

                return (
                  <span
                    key={annot.id}
                    id={`annot-${annot.id}`}
                    onClick={e => handleHighlightClick(e, annot)}
                    className={`cursor-pointer group relative inline ${cfg.bgClass} transition-colors`}
                    title={`${cfg.strategy}${annot.note ? `: "${annot.note}"` : ' (Clic para ver opciones)'}`}
                  >
                    {segment.content}
                    {/* Small icon badge if there's a note */}
                    {annot.note && (
                      <span className="inline-flex items-center ml-0.5 px-1 py-0.2 bg-stone-900 text-white rounded text-[10px] font-bold align-middle shadow-2xs hover:scale-110 transition-transform">
                        📝
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Side Drawer: Estrategias y Notas al Margen */}
        {showNotesDrawer && (
          <div className="w-72 sm:w-80 bg-stone-50 border-l border-stone-200 flex flex-col shrink-0 overflow-hidden shadow-lg animate-in slide-in-from-right duration-200 z-20">
            {/* Drawer Header */}
            <div className="p-3.5 bg-white border-b border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StickyNote className="w-4 h-4 text-amber-700" />
                <h3 className="text-xs font-bold text-stone-900">
                  Estrategias y Notas ({annotations.length})
                </h3>
              </div>
              <div className="flex items-center gap-1">
                {annotations.length > 0 && (
                  <button
                    onClick={handleCopyNotes}
                    className="p-1 rounded text-stone-500 hover:text-stone-900 hover:bg-stone-100"
                    title="Copiar todas las anotaciones"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setShowNotesDrawer(false)}
                  className="p-1 rounded text-stone-400 hover:text-stone-900 hover:bg-stone-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List of Annotations */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 reading-scrollbar">
              {annotations.length === 0 ? (
                <div className="text-center py-10 px-4 text-stone-400 space-y-2">
                  <Bookmark className="w-8 h-8 mx-auto opacity-30 text-amber-800" />
                  <p className="text-xs font-medium">Aún no tienes marcas ni notas</p>
                  <p className="text-[11px] leading-relaxed text-stone-400">
                    Selecciona cualquier frase del texto para subrayar ideas principales, evidencias o escribir comentarios al margen.
                  </p>
                </div>
              ) : (
                annotations.map((annot, idx) => {
                  const cfg = COLOR_CONFIG[annot.color];
                  return (
                    <div
                      key={annot.id}
                      className="p-3 bg-white rounded-lg border border-stone-200 shadow-2xs space-y-2 hover:border-amber-400 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${cfg.badgeBg}`}
                        >
                          {cfg.strategy}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => scrollToAnnotation(annot.id)}
                            className="text-[10px] text-amber-800 font-bold hover:underline flex items-center gap-0.5"
                          >
                            <span>Ver</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => removeAnnotation(annot.id)}
                            className="p-1 text-stone-400 hover:text-red-600 rounded"
                            title="Eliminar marca"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Quoted Text */}
                      <p className="text-xs text-stone-800 italic line-clamp-2 border-l-2 border-stone-300 pl-2">
                        "{annot.text}"
                      </p>

                      {/* Note text if available */}
                      {annot.note ? (
                        <div className="p-2 rounded bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-950 font-medium">
                          <span className="font-bold text-amber-900 block text-[10px]">
                            📝 Nota al margen:
                          </span>
                          {annot.note}
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            const newNote = window.prompt(
                              'Escribe tu nota o comentario de lectura:',
                              ''
                            );
                            if (newNote) handleUpdateNote(annot.id, newNote);
                          }}
                          className="text-[11px] text-stone-500 hover:text-amber-800 flex items-center gap-1 font-medium"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Agregar nota</span>
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Actions */}
            {annotations.length > 0 && (
              <div className="p-2.5 bg-white border-t border-stone-200 flex items-center justify-between text-xs">
                <button
                  onClick={handleCopyNotes}
                  className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded font-semibold text-xs flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copiar resumen</span>
                </button>
                <button
                  onClick={handleClearAll}
                  className="text-stone-400 hover:text-red-600 text-xs font-semibold"
                >
                  Borrar todo
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Panel de marcado para celular (botones grandes, abajo, sin tapar la selección) */}
      {isCoarse && mobileSel && (
        <div
          className="fixed inset-x-0 bottom-0 z-[60] bg-stone-900 text-white px-3 pt-3 rounded-t-2xl shadow-2xl border-t border-stone-700 animate-in slide-in-from-bottom duration-200"
          style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
          onMouseDown={e => e.preventDefault()}
          onTouchStart={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="text-[11px] text-stone-300 italic truncate">
              “{mobileSel.text.length > 70 ? mobileSel.text.slice(0, 70) + '…' : mobileSel.text}”
            </p>
            <button
              onClick={() => { setMobileSel(null); window.getSelection()?.removeAllRanges(); }}
              className="shrink-0 w-9 h-9 rounded-lg bg-stone-800 flex items-center justify-center"
              aria-label="Cancelar selección"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-6 gap-2">
            {(['yellow', 'green', 'blue', 'pink', 'underline'] as HighlightColor[]).map(color => {
              const cfg = COLOR_CONFIG[color];
              const picked = mobileSel.noteMode && mobileSel.noteColor === color;
              return (
                <button
                  key={color}
                  onClick={() => {
                    if (mobileSel.noteMode) {
                      setMobileSel({ ...mobileSel, noteColor: color });
                    } else {
                      applyHighlight(mobileSel.start, mobileSel.end, color);
                      setMobileSel(null);
                    }
                  }}
                  className={`h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 ${picked ? 'ring-2 ring-white' : ''}`}
                  style={{ backgroundColor: color === 'underline' ? '#e7e5e4' : cfg.iconColor }}
                >
                  {color === 'underline' ? (
                    <span className="text-sm font-bold text-stone-800 underline decoration-2">U</span>
                  ) : (
                    <span className="w-4 h-4 rounded-full bg-white/60" />
                  )}
                  <span className="text-[9px] font-bold text-stone-900 leading-none">{cfg.name}</span>
                </button>
              );
            })}
            <button
              onClick={() => setMobileSel({ ...mobileSel, noteMode: !mobileSel.noteMode, noteColor: mobileSel.noteColor || 'yellow', noteDraft: mobileSel.noteDraft || '' })}
              className={`h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 ${mobileSel.noteMode ? 'bg-amber-500 text-stone-900' : 'bg-stone-700 text-white'}`}
            >
              <StickyNote className="w-4 h-4" />
              <span className="text-[9px] font-bold leading-none">Nota</span>
            </button>
          </div>

          {mobileSel.noteMode && (
            <div className="flex gap-2 mt-2">
              <input
                value={mobileSel.noteDraft || ''}
                onChange={e => setMobileSel({ ...mobileSel, noteDraft: e.target.value })}
                placeholder="Escribe tu nota…"
                className="flex-1 min-w-0 px-3 py-2.5 rounded-lg bg-stone-800 text-white border border-stone-600 focus:outline-none focus:border-amber-400"
                style={{ fontSize: '16px' }}
              />
              <button
                onClick={() => {
                  applyHighlight(mobileSel.start, mobileSel.end, mobileSel.noteColor || 'yellow', (mobileSel.noteDraft || '').trim() || undefined);
                  setMobileSel(null);
                }}
                className="px-4 rounded-lg bg-amber-500 text-stone-900 font-bold text-sm"
              >
                Guardar
              </button>
            </div>
          )}
        </div>
      )}

      {/* Floating Toolbar when selecting text */}
      {floatingMenu && (
        <div
          className="absolute z-50 bg-stone-900 text-white rounded-xl shadow-xl px-2.5 py-1.5 flex items-center gap-1.5 -translate-x-1/2 -translate-y-full animate-in fade-in zoom-in-95 duration-150 border border-stone-700"
          style={{
            left: `${floatingMenu.x}px`,
            top: `${floatingMenu.y}px`,
          }}
        >
          {!floatingMenu.isNoteMode ? (
            <>
              {/* Color pickers */}
              {(['yellow', 'green', 'blue', 'pink', 'underline'] as HighlightColor[]).map(
                color => {
                  const cfg = COLOR_CONFIG[color];
                  return (
                    <button
                      key={color}
                      onClick={() =>
                        applyHighlight(
                          floatingMenu.start,
                          floatingMenu.end,
                          color
                        )
                      }
                      className="w-6 h-6 rounded-md flex items-center justify-center hover:scale-110 transition-transform"
                      style={{
                        backgroundColor:
                          color === 'underline' ? '#e7e5e4' : cfg.iconColor,
                      }}
                      title={`${cfg.strategy} (${cfg.name})`}
                    >
                      {color === 'underline' && (
                        <span className="text-[10px] font-bold text-stone-800 underline decoration-2">
                          U
                        </span>
                      )}
                    </button>
                  );
                }
              )}

              <div className="w-[1px] h-4 bg-stone-700 mx-0.5" />

              {/* Add Note Button */}
              <button
                onClick={() =>
                  setFloatingMenu({
                    ...floatingMenu,
                    isNoteMode: true,
                    noteDraft: '',
                  })
                }
                className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium flex items-center gap-1"
                title="Añadir nota al margen"
              >
                <StickyNote className="w-3 h-3 text-amber-400" />
                <span>Nota</span>
              </button>

              {/* Dismiss */}
              <button
                onClick={() => {
                  setFloatingMenu(null);
                  window.getSelection()?.removeAllRanges();
                }}
                className="p-1 rounded text-stone-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            /* Inline note input inside floating toolbar */
            <div className="flex items-center gap-1.5 py-0.5">
              <input
                type="text"
                autoFocus
                placeholder="Nota al margen (ej. Idea del párrafo)..."
                value={floatingMenu.noteDraft || ''}
                onChange={e =>
                  setFloatingMenu({
                    ...floatingMenu,
                    noteDraft: e.target.value,
                  })
                }
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    applyHighlight(
                      floatingMenu.start,
                      floatingMenu.end,
                      'yellow',
                      floatingMenu.noteDraft
                    );
                  }
                }}
                className="px-2 py-1 rounded bg-stone-800 text-white text-xs border border-stone-600 focus:outline-none focus:border-amber-400 w-48 sm:w-56"
              />
              <button
                onClick={() =>
                  applyHighlight(
                    floatingMenu.start,
                    floatingMenu.end,
                    'yellow',
                    floatingMenu.noteDraft
                  )
                }
                className="p-1 rounded bg-amber-600 hover:bg-amber-500 text-white"
                title="Guardar nota"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() =>
                  setFloatingMenu({
                    ...floatingMenu,
                    isNoteMode: false,
                  })
                }
                className="p-1 rounded text-stone-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Popover when clicking an existing highlight */}
      {activeAnnotationPopover && (
        <div
          className="absolute z-50 bg-white rounded-xl shadow-xl p-3 border border-stone-200 text-stone-900 -translate-x-1/2 animate-in fade-in zoom-in-95 duration-150 w-72 space-y-2.5"
          style={{
            left: `${Math.min(
              Math.max(150, activeAnnotationPopover.x),
              (containerRef.current?.clientWidth || 300) - 150
            )}px`,
            top: `${activeAnnotationPopover.y}px`,
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                COLOR_CONFIG[activeAnnotationPopover.annotation.color].badgeBg
              }`}
            >
              {
                COLOR_CONFIG[activeAnnotationPopover.annotation.color]
                  .strategy
              }
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  removeAnnotation(activeAnnotationPopover.annotation.id)
                }
                className="p-1 text-stone-400 hover:text-red-600 rounded"
                title="Eliminar marca"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setActiveAnnotationPopover(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Change color row */}
          <div className="flex items-center gap-1.5 pt-1">
            <span className="text-[10px] font-semibold text-stone-500 uppercase">
              Color:
            </span>
            {(['yellow', 'green', 'blue', 'pink', 'underline'] as HighlightColor[]).map(
              c => {
                const cfg = COLOR_CONFIG[c];
                const isCur =
                  activeAnnotationPopover.annotation.color === c;
                return (
                  <button
                    key={c}
                    onClick={() =>
                      handleChangeColor(
                        activeAnnotationPopover.annotation.id,
                        c
                      )
                    }
                    className={`w-5 h-5 rounded-md flex items-center justify-center ${
                      isCur
                        ? 'ring-2 ring-stone-900 scale-110'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor:
                        c === 'underline' ? '#e7e5e4' : cfg.iconColor,
                    }}
                  >
                    {c === 'underline' && (
                      <span className="text-[8px] font-bold text-stone-800 underline">
                        U
                      </span>
                    )}
                  </button>
                );
              }
            )}
          </div>

          {/* Note section */}
          {activeAnnotationPopover.editingNote ? (
            <div className="space-y-1.5">
              <textarea
                autoFocus
                rows={2}
                value={activeAnnotationPopover.noteText || ''}
                onChange={e =>
                  setActiveAnnotationPopover({
                    ...activeAnnotationPopover,
                    noteText: e.target.value,
                  })
                }
                placeholder="Escribe tu anotación o comentario..."
                className="w-full text-xs p-2 rounded-lg border border-stone-200 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 resize-none"
              />
              <div className="flex items-center justify-end gap-1.5">
                <button
                  onClick={() =>
                    setActiveAnnotationPopover({
                      ...activeAnnotationPopover,
                      editingNote: false,
                    })
                  }
                  className="px-2 py-1 text-xs text-stone-500 hover:text-stone-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={() =>
                    handleUpdateNote(
                      activeAnnotationPopover.annotation.id,
                      activeAnnotationPopover.noteText || ''
                    )
                  }
                  className="px-2.5 py-1 bg-amber-700 text-white rounded text-xs font-semibold hover:bg-amber-800"
                >
                  Guardar
                </button>
              </div>
            </div>
          ) : (
            <div className="p-2 bg-stone-50 rounded-lg border border-stone-100 flex items-start justify-between gap-2">
              <div className="text-xs text-stone-700">
                {activeAnnotationPopover.annotation.note ? (
                  <p className="font-medium text-stone-900">
                    {activeAnnotationPopover.annotation.note}
                  </p>
                ) : (
                  <p className="text-stone-400 italic">Sin nota al margen</p>
                )}
              </div>
              <button
                onClick={() =>
                  setActiveAnnotationPopover({
                    ...activeAnnotationPopover,
                    editingNote: true,
                    noteText:
                      activeAnnotationPopover.annotation.note || '',
                  })
                }
                className="text-[11px] text-amber-800 font-bold hover:underline shrink-0"
              >
                {activeAnnotationPopover.annotation.note
                  ? 'Editar'
                  : '+ Nota'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Guide Modal: Estrategias de Lectura Activa PAES */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-700" />
                <h3 className="text-base font-bold text-stone-900">
                  Estrategias de Lectura Activa PAES
                </h3>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1 rounded text-stone-400 hover:text-stone-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Subrayar y hacer notas al margen no es pintar el texto: es una
              técnica metacognitiva recomendada por DEMRE para responder con
              precisión y velocidad. Utiliza el código de colores sugerido:
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-950 font-bold block">
                    Amarillo: Idea Principal / Tesis
                  </strong>
                  <span className="text-stone-600">
                    Marca la idea central de cada párrafo o la postura principal del
                    autor. Te servirá para preguntas de síntesis y propósito general.
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-950 font-bold block">
                    Verde: Evidencias y Datos Textuales
                  </strong>
                  <span className="text-stone-600">
                    Marca fechas, cifras, nombres de expertos, estadísticas o citas directas.
                    Vital para las preguntas de la habilidad de <em>Localizar</em>.
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-sky-50 border border-sky-200 flex items-start gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-sky-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-sky-950 font-bold block">
                    Celeste: Conceptos Clave y Definiciones
                  </strong>
                  <span className="text-stone-600">
                    Términos especializados, palabras del vocabulario en contexto o
                    distinciones teóricas.
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-pink-50 border border-pink-200 flex items-start gap-2.5">
                <span className="w-3.5 h-3.5 rounded-full bg-pink-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-pink-950 font-bold block">
                    Rosa: Contrastes y Matices
                  </strong>
                  <span className="text-stone-600">
                    Conectores adversativos («sin embargo», «por el contrario») que cambian
                    el sentido del argumento.
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-stone-100 border border-stone-200 flex items-start gap-2.5">
                <span className="text-base leading-none">📝</span>
                <div>
                  <strong className="text-stone-900 font-bold block">
                    Notas al Margen:
                  </strong>
                  <span className="text-stone-600">
                    Escribe 2 o 3 palabras al lado de un párrafo (ej: «Contraargumento», «Ejemplo», «Conclusión»). Así no tendrás que releer todo el texto para cada pregunta.
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowGuideModal(false)}
                className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-bold hover:bg-stone-800"
              >
                Entendido, ¡a practicar!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
