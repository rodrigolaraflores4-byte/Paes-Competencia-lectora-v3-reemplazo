import { 
  User, 
  Course, 
  TextItem, 
  Question, 
  Assignment, 
  Attempt, 
  AnalyticsSummary, 
  OptionLetter,
  StudentAdaptiveProfile,
  LearningSkillModule,
  VocabExercise,
  VocabProgress,
  VocabAnalytics,
  StudentProgressRow,
  StudentProgressSummary
} from '../types/index.js';
import { INITIAL_VOCAB_EXERCISES } from '../data/vocabData.js';
import { clientStore } from '../services/store.js';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const savedUserId = typeof window !== 'undefined' ? sessionStorage.getItem('paes_session_user_id') : null;
  const doFetch = () => fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(savedUserId ? { 'x-user-id': savedUserId } : {}),
      ...options?.headers,
    },
  });
  let res = await doFetch();

  // Una instancia nueva del servidor puede tardar un instante en cargar los datos: se reintenta una vez
  if (res.status === 401 && savedUserId && !url.includes('/auth/')) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    res = await doFetch();
  }

  if (res.status === 401 && savedUserId && typeof window !== 'undefined' && !url.includes('/auth/')) {
    // La sesión guardada ya no existe en el servidor: pedir iniciar sesión de nuevo (una sola vez)
    sessionStorage.removeItem('paes_session_user_id');
    localStorage.removeItem('paes_session_user_id');
    alert('Tu sesión ya no es válida en el servidor. Vuelve a iniciar sesión. Si te vuelve a ocurrir, avisa a tu docente: puede ser que Supabase no esté vinculado.');
    window.location.reload();
  }

  if (!res.ok) {
    let errorMsg = `Error ${res.status}: ${res.statusText}`;
    try {
      const data = await res.json();
      if (data.error) errorMsg = data.error;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

export const api = {
  // Auth
  getCurrentUser: async () => {
    try {
      return await fetchJson<{ user: User }>('/api/auth/current-user');
    } catch {
      return { user: clientStore.getCurrentUser() as User };
    }
  },

  switchUser: async (userId: string) => {
    try {
      return await fetchJson<{ user: User }>('/api/auth/switch-user', {
        method: 'POST',
        body: JSON.stringify({ userId }),
      });
    } catch {
      const user = clientStore.setCurrentUser(userId);
      if (!user) throw new Error('Usuario no encontrado');
      return { user };
    }
  },

  login: async (identifier: string, password?: string) => {
    try {
      return await fetchJson<{ user: User }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
      });
    } catch (err: any) {
      // Si el servidor falla (ej. despliegue estático o cold start en Vercel), validar con clientStore/Supabase
      const user = clientStore.authenticate(identifier, password);
      if (!user) {
        throw new Error(err.message?.includes('401') 
          ? 'Credenciales inválidas. Revisa tu RUT chileno/correo y contraseña.' 
          : (err.message || 'Credenciales inválidas. Revisa tu RUT chileno/correo y contraseña.'));
      }
      return { user };
    }
  },

  logout: async () => {
    try {
      return await fetchJson<{ success: boolean }>('/api/auth/logout', { method: 'POST' });
    } catch {
      return { success: true };
    }
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    try {
      return await fetchJson<{ success: boolean; message: string; user: User }>('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
    } catch {
      const current = clientStore.getCurrentUser();
      if (!current) throw new Error('Debes iniciar sesión.');
      clientStore.updatePassword(current.id, newPassword);
      return { 
        success: true, 
        message: 'Contraseña actualizada correctamente.', 
        user: { ...current, password: newPassword } 
      };
    }
  },

  resetStudentPassword: async (targetUserId: string, newPassword: string) => {
    try {
      return await fetchJson<{ success: boolean; message: string }>('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ targetUserId, newPassword }),
      });
    } catch {
      clientStore.updatePassword(targetUserId, newPassword);
      return { success: true, message: 'Contraseña restablecida exitosamente.' };
    }
  },

  // Courses & Students
  getCourses: async () => {
    try {
      return await fetchJson<{ courses: Course[] }>('/api/courses');
    } catch {
      return { courses: clientStore.getCourses() };
    }
  },

  getStudents: async (courseId?: string) => {
    try {
      return await fetchJson<{ students: User[] }>(`/api/students${courseId ? `?courseId=${courseId}` : ''}`);
    } catch {
      return { students: clientStore.getStudents(courseId) };
    }
  },

  createStudent: async (studentData: { name: string; email: string; rut?: string; course_id: string; password?: string }) => {
    try {
      return await fetchJson<{ student: User }>('/api/students', {
        method: 'POST',
        body: JSON.stringify(studentData),
      });
    } catch {
      const student = await clientStore.createStudent(studentData);
      return { student };
    }
  },

  importStudentsCsv: async (csvText: string, defaultCourseId: string) => {
    try {
      return await fetchJson<{ success: boolean; importedCount: number; totalParsed: number }>('/api/students/import-csv', {
        method: 'POST',
        body: JSON.stringify({ csvText, defaultCourseId }),
      });
    } catch {
      const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
      const sep = lines[0].includes(';') ? ';' : lines[0].includes('\t') ? '\t' : ',';
      const toImport: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(sep).map(c => c.trim().replace(/^"|"$/g, ''));
        if (cols[0] && cols[1]) {
          toImport.push({
            name: cols[0],
            email: cols[1],
            rut: cols[2] || undefined,
            course_id: defaultCourseId || 'iv_medio_a',
          });
        }
      }
      const importedCount = await clientStore.importStudents(toImport);
      return { success: true, importedCount, totalParsed: toImport.length };
    }
  },

  deleteStudent: async (id: string) => {
    try {
      return await fetchJson<{ success: boolean; message: string }>(`/api/students/${id}`, {
        method: 'DELETE',
      });
    } catch {
      await clientStore.deleteStudent(id);
      return { success: true, message: 'Estudiante eliminado correctamente.' };
    }
  },

  clearDemoStudents: async () => {
    try {
      return await fetchJson<{ success: boolean; count: number; message: string }>('/api/students/clear-demo', {
        method: 'POST',
      });
    } catch {
      const count = await clientStore.clearStudents('demo');
      return { success: true, count, message: `Se eliminaron ${count} estudiantes.` };
    }
  },

  clearAllStudents: async () => {
    try {
      return await fetchJson<{ success: boolean; count: number; message: string }>('/api/students/clear-all', {
        method: 'POST',
      });
    } catch {
      const count = await clientStore.clearStudents('all');
      return { success: true, count, message: `Se eliminaron ${count} estudiantes.` };
    }
  },

  restoreDemoStudents: () =>
    fetchJson<{ success: boolean; count: number; message: string }>('/api/students/restore-demo', {
      method: 'POST',
    }),

  restoreBackup: (data: any) =>
    fetchJson<{ success: boolean; message: string }>('/api/backup/restore', {
      method: 'POST',
      body: JSON.stringify({ data }),
    }),

  // Texts
  getTexts: async (params?: { status?: string; type?: string; difficulty?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.type) q.set('type', params.type);
    if (params?.difficulty) q.set('difficulty', params.difficulty);
    if (params?.search) q.set('search', params.search);
    const qs = q.toString();
    try {
      return await fetchJson<{ texts: TextItem[] }>(`/api/texts${qs ? `?${qs}` : ''}`);
    } catch {
      return { texts: clientStore.getTexts() };
    }
  },

  getTextById: async (id: string) => {
    try {
      return await fetchJson<{ text: TextItem }>(`/api/texts/${id}`);
    } catch {
      const text = clientStore.getTextById(id);
      if (!text) throw new Error('Texto no encontrado');
      return { text };
    }
  },

  createText: (data: Partial<TextItem>) =>
    fetchJson<{ text: TextItem }>('/api/texts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateText: (id: string, data: Partial<TextItem>) =>
    fetchJson<{ text: TextItem }>(`/api/texts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteText: (id: string) =>
    fetchJson<{ success: boolean }>(`/api/texts/${id}`, {
      method: 'DELETE',
    }),

  approveText: (id: string) =>
    fetchJson<{ success: boolean; message: string; text?: TextItem }>(`/api/texts/${id}/approve`, {
      method: 'POST',
    }),

  // Questions
  addQuestion: (textId: string, data: Partial<Question>) =>
    fetchJson<{ question: Question }>(`/api/texts/${textId}/questions`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateQuestion: (textId: string, questionId: string, data: Partial<Question>) =>
    fetchJson<{ question: Question }>(`/api/texts/${textId}/questions/${questionId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteQuestion: (textId: string, questionId: string) =>
    fetchJson<{ success: boolean }>(`/api/texts/${textId}/questions/${questionId}`, {
      method: 'DELETE',
    }),

  reorderQuestions: (textId: string, questionIds: string[]) =>
    fetchJson<{ questions: Question[] }>(`/api/texts/${textId}/questions/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ questionIds }),
    }),

  // Assignments
  getAssignments: async (courseId?: string) => {
    try {
      return await fetchJson<{ assignments: Assignment[] }>(`/api/assignments${courseId ? `?courseId=${courseId}` : ''}`);
    } catch {
      return { assignments: clientStore.getAssignments() };
    }
  },

  createAssignment: (data: Partial<Assignment>) =>
    fetchJson<{ assignment: Assignment }>('/api/assignments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateAssignment: (id: string, data: Partial<Assignment>) =>
    fetchJson<{ assignment: Assignment }>(`/api/assignments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Student Practice
  getStudentAssignments: () =>
    fetchJson<{ assignments: any[] }>('/api/student/assignments'),

  startAttempt: (assignmentId: string) =>
    fetchJson<{
      attempt: Attempt;
      assignment: Assignment;
      text: Partial<TextItem>;
      questions: any[];
    }>('/api/attempts/start', {
      method: 'POST',
      body: JSON.stringify({ assignmentId }),
    }),

  recordAnswer: (attemptId: string, questionId: string, selectedOption: OptionLetter) =>
    fetchJson<{
      attempt: Attempt;
      isCorrect: boolean;
      pointsEarned: number;
      correctOption?: OptionLetter;
      explanation?: string;
      distractorExplanation?: string;
    }>(`/api/attempts/${attemptId}/answer`, {
      method: 'POST',
      body: JSON.stringify({ questionId, selectedOption }),
    }),

  finishAttempt: (attemptId: string) =>
    fetchJson<{
      attempt: Attempt;
      assignment: Assignment;
      questions: Question[];
      skillStats: any;
    }>(`/api/attempts/${attemptId}/finish`, {
      method: 'POST',
    }),

  getMyResults: () =>
    fetchJson<{ results: any[] }>('/api/student/my-results'),

  // Adaptive Profile & Learning
  getAdaptiveProfile: () =>
    fetchJson<{ profile: StudentAdaptiveProfile }>('/api/student/adaptive-profile'),

  getLearningModules: () =>
    fetchJson<{ modules: LearningSkillModule[] }>('/api/student/learning-modules'),

  // Analytics & CSV Export
  getAnalytics: async (courseId?: string, assignmentId?: string) => {
    const q = new URLSearchParams();
    if (courseId) q.set('courseId', courseId);
    if (assignmentId) q.set('assignmentId', assignmentId);
    const qs = q.toString();
    try {
      return await fetchJson<{ analytics: AnalyticsSummary }>(`/api/analytics${qs ? `?${qs}` : ''}`);
    } catch {
      return { analytics: clientStore.getAnalytics() };
    }
  },

  getExportUrl: (courseId?: string, assignmentId?: string) => {
    const q = new URLSearchParams();
    if (courseId) q.set('courseId', courseId);
    if (assignmentId) q.set('assignmentId', assignmentId);
    const qs = q.toString();
    return `/api/export/csv${qs ? `?${qs}` : ''}`;
  },

  // Supabase
  getSupabaseStatus: async () => {
    try {
      return await fetchJson<{ status: any }>('/api/supabase/status');
    } catch {
      return { status: clientStore.getSupabaseStatus() };
    }
  },

  updateSupabaseConfig: async (url: string, anonKey: string) => {
    try {
      return await fetchJson<{ status: any; message: string }>('/api/supabase/config', {
        method: 'POST',
        body: JSON.stringify({ url, anonKey }),
      });
    } catch {
      const status = clientStore.updateSupabaseConfig(url, anonKey);
      return { status, message: 'Configuración de Supabase actualizada exitosamente.' };
    }
  },

  getSupabaseSchema: async () => {
    try {
      return await fetchJson<{ sql: string }>('/api/supabase/schema');
    } catch {
      return {
        sql: `-- Esquema Supabase disponible en supabase-schema.sql en la raíz del proyecto`,
      };
    }
  },

  syncPushToSupabase: async () => {
    try {
      return await fetchJson<{ success: boolean; message: string; stats: any }>('/api/supabase/sync-push', {
        method: 'POST',
      });
    } catch {
      return await clientStore.syncWithSupabase();
    }
  },

  syncPullFromSupabase: async () => {
    try {
      return await fetchJson<{ success: boolean; message: string; stats: any }>('/api/supabase/sync-pull', {
        method: 'POST',
      });
    } catch {
      return await clientStore.pullFromSupabase();
    }
  },

  importTexts: (items: any[], opts: { autoApprove: boolean; createAssignments: boolean }) =>
    fetchJson<{ results: { title: string; ok: boolean; message: string }[]; imported: number }>('/api/texts/import', {
      method: 'POST',
      body: JSON.stringify({ items, ...opts }),
    }),

  getStudentProgress: () =>
    fetchJson<{ rows: StudentProgressRow[]; summary: StudentProgressSummary }>('/api/analytics/student-progress'),

  getDiagnostics: () =>
    fetchJson<{ diagnostics: any }>('/api/diagnostics'),

  // --- Vocabulario ---
  getVocab: async () => {
    try {
      return await fetchJson<{ exercises: VocabExercise[] }>('/api/vocab');
    } catch {
      return { exercises: INITIAL_VOCAB_EXERCISES };
    }
  },

  saveVocab: (exercise: Omit<VocabExercise, 'id'>, id?: string) =>
    fetchJson<{ exercise: VocabExercise }>(id ? `/api/vocab/${id}` : '/api/vocab', {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify(exercise),
    }),

  deleteVocab: (id: string) =>
    fetchJson<{ success: boolean }>(`/api/vocab/${id}`, { method: 'DELETE' }),

  getVocabProgress: async () => {
    try {
      return await fetchJson<{ progress: VocabProgress[]; vocab_points: number }>('/api/vocab/progress');
    } catch {
      return { progress: [] as VocabProgress[], vocab_points: 0 };
    }
  },

  answerVocab: (exercise_id: string, selected_option: string) =>
    fetchJson<{ isCorrect: boolean; pointsEarned: number; vocab_points: number }>('/api/vocab/answer', {
      method: 'POST',
      body: JSON.stringify({ exercise_id, selected_option }),
    }),

  resetVocabProgress: () =>
    fetchJson<{ success: boolean }>('/api/vocab/progress', { method: 'DELETE' }),

  getVocabAnalytics: () =>
    fetchJson<{ analytics: VocabAnalytics }>('/api/vocab/analytics'),

  // --- Racha (guardada en el servidor) ---
  getStreak: async () => {
    try {
      return await fetchJson<{ streak: { currentStreak: number; highestStreak: number; lastActiveDate: string; history: string[] } | null }>('/api/student/streak');
    } catch {
      return { streak: null };
    }
  },

  saveStreak: async (streak: { currentStreak: number; highestStreak: number; lastActiveDate: string; history: string[] }) => {
    try {
      await fetchJson('/api/student/streak', { method: 'PUT', body: JSON.stringify(streak) });
    } catch {
      /* la racha seguirá guardada en este dispositivo */
    }
  },
};
