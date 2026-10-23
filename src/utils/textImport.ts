import type { DemreSkill, OptionLetter, TextDifficulty, TextType } from '../types/index.js';

export interface ImportQuestion {
  prompt: string;
  skill: DemreSkill;
  options: { A: string; B: string; C: string; D: string };
  correct_option: OptionLetter;
  explanation: string;
  distractor_explanations?: { A?: string; B?: string; C?: string; D?: string };
  points: number;
}

export interface ImportItem {
  title: string;
  author: string;
  source: string;
  type: TextType;
  difficulty: TextDifficulty;
  content: string;
  questions: ImportQuestion[];
  issues: string[]; // problemas que impiden importar o avisos
  blocking: boolean; // true = no se puede importar tal cual
}

const TYPES: Record<string, TextType> = {
  narrativo: 'narrativo', cuento: 'narrativo', novela: 'narrativo',
  literario: 'literario', poema: 'literario', poesia: 'literario', poesía: 'literario',
  expositivo: 'expositivo', informativo: 'expositivo',
  argumentativo: 'argumentativo',
  columna_opinion: 'columna_opinion', 'columna de opinion': 'columna_opinion', 'columna de opinión': 'columna_opinion', columna: 'columna_opinion',
  ensayo: 'ensayo',
  noticia: 'noticia',
  instructivo: 'instructivo',
};

const norm = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

const mapType = (raw: string): TextType | null => TYPES[norm(raw).replace(/\s+/g, ' ')] ?? TYPES[raw.toLowerCase().trim()] ?? null;

const mapDifficulty = (raw: string): TextDifficulty | null => {
  const v = norm(raw);
  if (['inicial', 'facil', 'basico', 'baja'].includes(v)) return 'inicial';
  if (['medio', 'media', 'intermedio'].includes(v)) return 'medio';
  if (['avanzado', 'dificil', 'alto', 'alta'].includes(v)) return 'avanzado';
  return null;
};

const mapSkill = (raw: string): DemreSkill | null => {
  const v = norm(raw);
  if (v.startsWith('local')) return 'localizar';
  if (v.startsWith('interp') || v.startsWith('relac')) return 'interpretar_relacionar';
  if (v.startsWith('eval') || v.startsWith('reflex')) return 'evaluar';
  return null;
};

type QDraft = {
  prompt: string;
  skill: DemreSkill | null;
  options: Partial<Record<OptionLetter, string>>;
  correct: OptionLetter | null;
  explanation: string;
  distractors: Partial<Record<OptionLetter, string>>;
  points: number;
  field: 'prompt' | OptionLetter | 'explanation' | `err_${OptionLetter}`;
};

const RE = {
  title: /^\s*t[ií]tulo\s*:\s*(.*)$/i,
  author: /^\s*autor(?:a)?\s*:\s*(.*)$/i,
  source: /^\s*fuente\s*:\s*(.*)$/i,
  type: /^\s*tipo(?:\s+de\s+texto)?\s*:\s*(.*)$/i,
  difficulty: /^\s*dificultad\s*:\s*(.*)$/i,
  text: /^\s*texto\s*:\s*(.*)$/i,
  question: /^\s*pregunta\s*(\d+)?\s*(?:\[([^\]]*)\]|\(([^)]*)\))?\s*[:.\-]?\s*(.*)$/i,
  option: /^\s*([A-Da-d])\s*[)\.\-:]\s*(.*)$/,
  answer: /^\s*(?:respuesta|clave|alternativa)(?:\s+correcta)?\s*:\s*\(?([A-Da-d])\)?/i,
  explanation: /^\s*explicaci[oó]n\s*:\s*(.*)$/i,
  distractor: /^\s*(?:error|no|distractor|descarte)\s*\(?([A-Da-d])\)?\s*:\s*(.*)$/i,
  points: /^\s*puntos?\s*:\s*(\d+)/i,
  separator: /^\s*={3,}\s*$/,
};

function finishQuestion(q: QDraft, n: number, issues: string[]): ImportQuestion | null {
  const label = `Pregunta ${n}`;
  const missing: string[] = [];
  if (!q.prompt.trim()) missing.push('enunciado');
  (['A', 'B', 'C', 'D'] as OptionLetter[]).forEach(l => { if (!q.options[l]?.trim()) missing.push(`alternativa ${l}`); });
  if (!q.correct) missing.push('RESPUESTA');
  if (!q.explanation.trim()) missing.push('EXPLICACIÓN');
  if (missing.length) {
    issues.push(`${label}: falta ${missing.join(', ')}.`);
    return null;
  }
  if (!q.skill) issues.push(`${label}: no indicaste la habilidad entre corchetes; se usó "Interpretar y relacionar".`);
  const d = q.distractors;
  return {
    prompt: q.prompt.trim(),
    skill: q.skill || 'interpretar_relacionar',
    options: {
      A: q.options.A!.trim(), B: q.options.B!.trim(), C: q.options.C!.trim(), D: q.options.D!.trim(),
    },
    correct_option: q.correct!,
    explanation: q.explanation.trim(),
    distractor_explanations: Object.keys(d).length ? d : undefined,
    points: q.points || 1,
  };
}

function parseBlock(block: string): ImportItem | null {
  const lines = block.split(/\r?\n/);
  if (!lines.some(l => l.trim())) return null;

  const item: ImportItem = {
    title: '', author: '', source: '', type: 'argumentativo', difficulty: 'medio',
    content: '', questions: [], issues: [], blocking: false,
  };
  let typeSeen = false;
  let diffSeen = false;
  let mode: 'header' | 'content' | 'question' = 'header';
  let q: QDraft | null = null;
  const content: string[] = [];
  let qCount = 0;

  const closeQuestion = () => {
    if (!q) return;
    const done = finishQuestion(q, qCount, item.issues);
    if (done) item.questions.push(done);
    q = null;
  };

  for (const line of lines) {
    let m: RegExpMatchArray | null;

    if (mode !== 'question' || !q) {
      if ((m = line.match(RE.title))) { item.title = m[1].trim(); mode = 'header'; continue; }
      if ((m = line.match(RE.author))) { item.author = m[1].trim(); continue; }
      if ((m = line.match(RE.source))) { item.source = m[1].trim(); continue; }
      if ((m = line.match(RE.type))) {
        const t = mapType(m[1]);
        if (t) { item.type = t; typeSeen = true; }
        else item.issues.push(`Tipo "${m[1].trim()}" no reconocido; se usó "argumentativo".`);
        continue;
      }
      if ((m = line.match(RE.difficulty))) {
        const d = mapDifficulty(m[1]);
        if (d) { item.difficulty = d; diffSeen = true; }
        else item.issues.push(`Dificultad "${m[1].trim()}" no reconocida; se usó "medio".`);
        continue;
      }
    }

    if ((m = line.match(RE.text)) && mode !== 'question') {
      mode = 'content';
      if (m[1].trim()) content.push(m[1]);
      continue;
    }

    if ((m = line.match(RE.question))) {
      closeQuestion();
      mode = 'question';
      qCount++;
      const skillRaw = m[2] || m[3] || '';
      q = {
        prompt: m[4] || '',
        skill: skillRaw ? mapSkill(skillRaw) : null,
        options: {}, correct: null, explanation: '', distractors: {}, points: 1, field: 'prompt',
      };
      if (skillRaw && !q.skill) item.issues.push(`Pregunta ${qCount}: habilidad "${skillRaw}" no reconocida (usa localizar, interpretar o evaluar).`);
      continue;
    }

    if (mode === 'question' && q) {
      if ((m = line.match(RE.answer))) { q.correct = m[1].toUpperCase() as OptionLetter; continue; }
      if ((m = line.match(RE.explanation))) { q.explanation = m[1]; q.field = 'explanation'; continue; }
      if ((m = line.match(RE.distractor))) {
        const l = m[1].toUpperCase() as OptionLetter;
        q.distractors[l] = m[2].trim();
        q.field = `err_${l}`;
        continue;
      }
      if ((m = line.match(RE.points))) { q.points = Math.max(1, parseInt(m[1], 10)); continue; }
      if ((m = line.match(RE.option))) {
        const l = m[1].toUpperCase() as OptionLetter;
        q.options[l] = m[2];
        q.field = l;
        continue;
      }
      // Línea de continuación del campo actual
      const extra = line.trim();
      if (!extra) continue;
      if (q.field === 'prompt') q.prompt += ' ' + extra;
      else if (q.field === 'explanation') q.explanation += ' ' + extra;
      else if (q.field.startsWith('err_')) {
        const l = q.field.slice(4) as OptionLetter;
        q.distractors[l] = (q.distractors[l] || '') + ' ' + extra;
      } else {
        const l = q.field as OptionLetter;
        q.options[l] = (q.options[l] || '') + ' ' + extra;
      }
      continue;
    }

    if (mode === 'content') content.push(line);
  }
  closeQuestion();

  item.content = content.join('\n').replace(/^\n+|\n+$/g, '').replace(/\n{3,}/g, '\n\n');

  if (!item.title) { item.issues.push('Falta el TÍTULO.'); item.blocking = true; }
  if (!item.content) { item.issues.push('Falta el contenido después de "TEXTO:".'); item.blocking = true; }
  if (!typeSeen) item.issues.push('No indicaste TIPO; se usó "argumentativo".');
  if (!diffSeen) item.issues.push('No indicaste DIFICULTAD; se usó "medio".');
  if (item.questions.length === 0) item.issues.push('El texto no tiene preguntas completas: se importará como borrador sin poder aprobarse.');
  return item;
}

/** Convierte el texto plano (uno o varios textos separados por una línea ===) en textos con preguntas. */
export function parseTextImport(raw: string): ImportItem[] {
  const blocks = raw.replace(/\r\n/g, '\n').split(/^\s*={3,}\s*$/m);
  return blocks.map(parseBlock).filter((x): x is ImportItem => x !== null);
}

export const TEXT_IMPORT_TEMPLATE = `TÍTULO: La inteligencia artificial y el oficio de pensar
AUTOR: Nombre del autor
FUENTE: Diario o libro, año
TIPO: columna_opinion
DIFICULTAD: medio

TEXTO:
Primer párrafo del texto, tal como lo quieres mostrar a los estudiantes.

Segundo párrafo. Deja una línea en blanco entre párrafos.

PREGUNTA 1 [localizar]: ¿Qué afirma el autor en el primer párrafo?
A) Alternativa A
B) Alternativa B
C) Alternativa C
D) Alternativa D
RESPUESTA: B
EXPLICACIÓN: Por qué B es la correcta y qué evidencia del texto la respalda.
ERROR A: Por qué A no es correcta (opcional)
ERROR C: Por qué C no es correcta (opcional)

PREGUNTA 2 [interpretar]: ¿Qué sentido tiene la palabra "oficio" en el texto?
A) Alternativa A
B) Alternativa B
C) Alternativa C
D) Alternativa D
RESPUESTA: D
EXPLICACIÓN: Explicación de la respuesta correcta.

PREGUNTA 3 [evaluar]: ¿Qué función cumple el último párrafo?
A) Alternativa A
B) Alternativa B
C) Alternativa C
D) Alternativa D
RESPUESTA: A
EXPLICACIÓN: Explicación de la respuesta correcta.

===
TÍTULO: Segundo texto (se separa del anterior con una línea de tres signos igual)
TIPO: narrativo
DIFICULTAD: inicial

TEXTO:
Contenido del segundo texto…

PREGUNTA 1 [localizar]: Enunciado
A) …
B) …
C) …
D) …
RESPUESTA: C
EXPLICACIÓN: …
`;

export const AI_CONVERSION_PROMPT = `Convierte el material que te entrego al siguiente formato EXACTO, sin agregar comentarios ni markdown.
Reglas: separa cada texto con una línea que contenga solo ===. Tipos permitidos: narrativo, literario, expositivo, argumentativo, columna_opinion, ensayo, noticia, instructivo. Dificultad: inicial, medio o avanzado. Habilidad de cada pregunta entre corchetes: localizar, interpretar o evaluar. Cada pregunta lleva 4 alternativas (A, B, C, D), una línea RESPUESTA con la letra correcta, una EXPLICACIÓN, y opcionalmente líneas "ERROR A:", "ERROR B:"... explicando por qué cada distractor es incorrecto. Deja una línea en blanco entre párrafos del texto.

Formato:
${TEXT_IMPORT_TEMPLATE}`;
