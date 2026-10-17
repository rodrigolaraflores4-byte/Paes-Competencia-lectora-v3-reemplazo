export type UserRole = 'docente' | 'estudiante';

export type DemreSkill = 'localizar' | 'interpretar_relacionar' | 'evaluar';

export type TextType = 
  | 'narrativo' 
  | 'literario' 
  | 'expositivo' 
  | 'argumentativo' 
  | 'columna_opinion' 
  | 'ensayo' 
  | 'noticia' 
  | 'instructivo';

export type TextDifficulty = 'inicial' | 'medio' | 'avanzado';

export type TextEditorialStatus = 'borrador' | 'en_revision' | 'aprobado' | 'archivado';

export type AssignmentMode = 'formativo' | 'evaluacion';

export type OptionLetter = 'A' | 'B' | 'C' | 'D';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  rut?: string;
  password?: string;
  course_id?: string;
  streak_days?: number;
  highest_streak?: number;
  last_activity_date?: string; // Formato YYYY-MM-DD
  activity_history?: string[]; // Fechas completadas
  vocab_points?: number;
}

export interface VocabOption {
  synonym: string;
  justification?: string;
}

export interface VocabExercise {
  id: string;
  target_word: string;
  context_sentence: string;
  full_passage?: string;
  source?: string;
  category: 'literario' | 'academico' | 'filosofico' | 'periodistico';
  difficulty: 'inicial' | 'medio' | 'avanzado';
  options: {
    A: VocabOption;
    B: VocabOption;
    C: VocabOption;
    D: VocabOption;
  };
  correct_option: OptionLetter;
  explanation: string;
  nuance_tip: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
  student_count?: number;
}

export interface Question {
  id: string;
  text_id: string;
  order_index: number;
  prompt: string;
  skill: DemreSkill;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_option: OptionLetter;
  explanation: string;
  distractor_explanations?: {
    A?: string;
    B?: string;
    C?: string;
    D?: string;
  };
  points: number;
}

// Student sanitized version of a question (hides correct option and explanations)
export interface StudentQuestionView {
  id: string;
  text_id: string;
  order_index: number;
  prompt: string;
  skill: DemreSkill;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  points: number;
  already_answered?: boolean;
  selected_option?: OptionLetter;
  feedback?: {
    is_correct: boolean;
    correct_option: OptionLetter;
    explanation: string;
    distractor_explanation?: string;
  };
}

export interface TextItem {
  id: string;
  title: string;
  author: string;
  source: string;
  content: string;
  type: TextType;
  difficulty: TextDifficulty;
  status: TextEditorialStatus;
  created_at: string;
  updated_at: string;
  created_by?: string;
  questions?: Question[];
  question_count?: number;
}

export interface Assignment {
  id: string;
  title: string;
  text_id: string;
  text_title?: string;
  text_type?: TextType;
  course_ids?: string[];
  is_global?: boolean;
  mode: AssignmentMode;
  status: 'activa' | 'cerrada';
  due_date: string | null;
  max_attempts: number;
  created_at: string;
  created_by?: string;
  question_count?: number;
}

export interface AttemptAnswer {
  question_id: string;
  selected_option: OptionLetter;
  is_correct: boolean;
  points_earned: number;
  answered_at: string;
}

export interface Attempt {
  id: string;
  assignment_id: string;
  student_id: string;
  student_name?: string;
  student_rut?: string;
  course_id: string;
  course_name?: string;
  attempt_number: number;
  status: 'in_progress' | 'completed';
  started_at: string;
  completed_at: string | null;
  score: number;
  total_points: number;
  percentage: number;
  paes_estimated_score: number;
  answers: Record<string, AttemptAnswer>;
}

export interface SkillAnalytics {
  skill: DemreSkill;
  label: string;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
}

export interface SkillMastery {
  skill: DemreSkill;
  label: string;
  totalAnswered: number;
  correctAnswers: number;
  accuracyPct: number;
  status: 'sin_datos' | 'por_reforzar' | 'en_progreso' | 'consolidado';
}

export interface AdaptiveRecommendation {
  status: 'diagnostico_requerido' | 'reforzamiento_prioritario' | 'progreso_adecuado' | 'avanzado';
  title: string;
  message: string;
  evidence: string;
  primarySkill: DemreSkill | null;
  skillLabel?: string;
  actionLabel: string;
  suggestedActionType: 'iniciar_ensayo' | 'practicar_habilidad';
  targetAssignmentId?: string;
}

export interface LearningSkillModule {
  skill: DemreSkill;
  label: string;
  description: string;
  demreDefinition: string;
  sampleQuestionsCount: number;
  studentAccuracy: number;
  studentStatus: 'sin_datos' | 'por_reforzar' | 'en_progreso' | 'consolidado';
  recommendedTexts: {
    id: string;
    title: string;
    type: TextType;
    difficulty: TextDifficulty;
    questionCount: number;
    assignmentId?: string;
  }[];
}

export interface StudentAdaptiveProfile {
  studentId: string;
  studentName: string;
  totalEnsayosCompleted: number;
  averageScorePct: number;
  latestPaesEstimated: number;
  skillsMastery: Record<DemreSkill, SkillMastery>;
  recommendation: AdaptiveRecommendation;
}

export interface AnalyticsSummary {
  totalStudents: number;
  activeStudents: number;
  totalAttempts: number;
  overallAverage: number;
  participationRate: number;
  courseComparison?: {
    courseId: string;
    courseName: string;
    totalEnrolled: number;
    participants: number;
    participationRate: number;
    averageScore: number;
    averagePaesScore: number;
  }[];
  studentStats?: {
    studentId: string;
    studentName: string;
    studentRut?: string;
    studentEmail: string;
    totalAttempts: number;
    averageScore: number;
    paesEstimated: number;
    latestAttemptDate?: string;
  }[];
  skillsBreakdown: SkillAnalytics[];
  criticalQuestions: {
    questionId: string;
    textTitle: string;
    prompt: string;
    skill: DemreSkill;
    correctOption: OptionLetter;
    errorRate: number;
    totalAnswers: number;
  }[];
}

// --- Vocabulario: progreso por estudiante y analítica docente ---
export interface VocabProgress {
  user_id: string;
  exercise_id: string;
  selected_option: OptionLetter;
  is_correct: boolean;
  answered_at: string;
}

export interface VocabAnalytics {
  totalExercises: number;
  totalAnswers: number;
  overallAccuracy: number;
  perWord: { id: string; target_word: string; answers: number; correct: number; accuracy: number }[];
  perStudent: { id: string; name: string; answered: number; correct: number; accuracy: number; points: number }[];
}

export interface CloudSyncState {
  state: 'disabled' | 'loading' | 'idle' | 'syncing' | 'ok' | 'error';
  lastSyncAt?: string;
  lastError?: string;
  pending: boolean;
}
