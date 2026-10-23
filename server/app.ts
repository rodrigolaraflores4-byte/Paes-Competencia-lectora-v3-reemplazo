import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { db } from './db.js';
import { OptionLetter, TextType, TextDifficulty, TextEditorialStatus } from '../src/types/index.js';

const app = express();

app.use(express.json({ limit: '4mb' }));

// Helper to resolve the authenticated user per request (supports 40+ concurrent students)
function getAuthUser(req: Request) {
  const headerUserId = (req.headers['x-user-id'] as string) || '';
  if (headerUserId) {
    const user = db.getUserById(headerUserId);
    if (user) return user;
  }
  return null;
}

const apiRouter = express.Router();

// Sincronización automática con Supabase:
// 1) antes de atender cualquier petición se asegura que los datos de la nube estén cargados
//    (en Vercel el disco se borra en cada "cold start");
// 2) en Vercel, tras cada cambio se espera a que se suba a la nube antes de responder.
apiRouter.use(async (req: Request, res: Response, next: express.NextFunction) => {
  const timeout = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  try { await Promise.race([db.ensureReady(), timeout(9000)]); } catch { /* se sigue con datos locales */ }
  try { await Promise.race([db.refreshIfStale(), timeout(6000)]); } catch { /* se sigue con lo que hay */ }
  const sessionUserId = (req.headers['x-user-id'] as string) || '';
  if (sessionUserId) {
    try { await Promise.race([db.ensureUser(sessionUserId), timeout(4000)]); } catch { /* ignorar */ }
  }

  if (process.env.VERCEL && req.method !== 'GET') {
    const originalJson = res.json.bind(res);
    (res as any).json = (body: any) => {
      Promise.race([db.flush(), timeout(9000)]).catch(() => {}).finally(() => originalJson(body));
      return res;
    };
  }
  next();
});

// --- AUTH & USERS API ---

apiRouter.get('/auth/current-user', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  res.json({ user });
});

apiRouter.post('/auth/switch-user', (req: Request, res: Response) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }
  const user = db.getUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  db.setCurrentUser(userId);
  res.json({ user });
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { identifier, email, password } = req.body;
  const loginInput = identifier || email;
  if (!loginInput) {
    return res.status(400).json({ error: 'Debes ingresar tu correo electrónico o RUT chileno.' });
  }

  const user = db.authenticateUser(loginInput, password);
  if (!user) {
    return res.status(401).json({ error: 'Credenciales inválidas. Revisa tu RUT/correo y contraseña.' });
  }
  res.json({ user });
});

apiRouter.post('/auth/logout', (req: Request, res: Response) => {
  db.logoutUser();
  res.json({ success: true });
});

apiRouter.post('/auth/change-password', (req: Request, res: Response) => {
  const currentUser = getAuthUser(req);
  if (!currentUser) {
    return res.status(401).json({ error: 'Debes iniciar sesión para realizar esta acción.' });
  }

  const { currentPassword, newPassword, targetUserId } = req.body;

  if (!newPassword || typeof newPassword !== 'string' || newPassword.trim().length < 4) {
    return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 4 caracteres.' });
  }

  // Teacher resetting a student's password
  if (targetUserId && targetUserId !== currentUser.id) {
    if (currentUser.role !== 'docente') {
      return res.status(403).json({ error: 'Solo los docentes pueden restablecer contraseñas de otros usuarios.' });
    }
    const targetUser = db.getUserById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ error: 'Estudiante no encontrado.' });
    }
    const success = db.updateUserPassword(targetUserId, newPassword.trim());
    if (!success) {
      return res.status(500).json({ error: 'Error al actualizar la contraseña.' });
    }
    return res.json({ 
      success: true, 
      message: `Contraseña de ${targetUser.name} actualizada correctamente a "${newPassword.trim()}".` 
    });
  }

  // User changing their own password
  const currentExpected = currentUser.password || 'PAES2026';
  if (currentPassword && currentPassword.trim() !== currentExpected && currentPassword.trim() !== 'PAES2026') {
    return res.status(400).json({ error: 'La contraseña actual no es correcta.' });
  }

  const success = db.updateUserPassword(currentUser.id, newPassword.trim());
  if (!success) {
    return res.status(500).json({ error: 'Error al actualizar la contraseña.' });
  }

  const updatedUser = db.getUserById(currentUser.id);
  res.json({ 
    success: true, 
    message: 'Contraseña actualizada correctamente.', 
    user: updatedUser 
  });
});

// --- COURSES & STUDENTS API ---

apiRouter.get('/courses', (req: Request, res: Response) => {
  const courses = db.getCourses();
  res.json({ courses });
});

apiRouter.get('/students', (req: Request, res: Response) => {
  const courseId = req.query.courseId as string | undefined;
  const students = db.getUsers('estudiante', courseId);
  res.json({ students });
});

apiRouter.post('/students', (req: Request, res: Response) => {
  const currentUser = getAuthUser(req);
  if (!currentUser || currentUser.role !== 'docente') {
    return res.status(403).json({ error: 'Solo los docentes pueden matricular nuevos estudiantes.' });
  }

  const { name, email, rut, course_id, password } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'El nombre y el correo electrónico son obligatorios.' });
  }

  if (db.getUserByEmail(email)) {
    return res.status(400).json({ error: 'Ya existe un usuario registrado con este correo.' });
  }

  if (rut && db.getUserByRut(rut)) {
    return res.status(400).json({ error: 'Ya existe un estudiante registrado con este RUT.' });
  }

  const student = db.createUser({
    name: name.trim(),
    email: email.trim(),
    rut: rut ? rut.trim() : undefined,
    role: 'estudiante',
    password: password ? password.trim() : 'PAES2026',
    course_id: course_id || 'iv_medio_a',
  });

  res.status(201).json({ student });
});

apiRouter.post('/students/import-csv', (req: Request, res: Response) => {
  const currentUser = getAuthUser(req);
  if (!currentUser || currentUser.role !== 'docente') {
    return res.status(403).json({ error: 'Solo los docentes pueden importar nóminas.' });
  }

  const { csvText, defaultCourseId } = req.body;
  if (!csvText || typeof csvText !== 'string') {
    return res.status(400).json({ error: 'El contenido del archivo CSV es obligatorio.' });
  }

  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length <= 1) {
    return res.status(400).json({ error: 'El archivo CSV debe contener al menos un encabezado y una fila de datos.' });
  }

  const header = lines[0].toLowerCase();
  const sep = header.includes(';') ? ';' : header.includes('\t') ? '\t' : ',';
  const headers = lines[0].split(sep).map(h => h.trim().toLowerCase());

  const nameIdx = headers.findIndex(h => h.includes('nombre') || h.includes('name') || h.includes('alumno') || h.includes('estudiante'));
  const emailIdx = headers.findIndex(h => h.includes('email') || h.includes('correo'));
  const rutIdx = headers.findIndex(h => h.includes('rut') || h.includes('identificacion'));
  const courseIdx = headers.findIndex(h => h.includes('curso') || h.includes('course'));

  if (nameIdx === -1 && emailIdx === -1) {
    return res.status(400).json({ error: 'No se encontraron columnas de "Nombre" ni "Email" en el encabezado.' });
  }

  const toImport: Array<{ name: string; email: string; rut?: string; course_id: string }> = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(sep).map(c => c.trim().replace(/^"|"$/g, ''));
    if (cols.length === 0 || !cols.some(c => c.length > 0)) continue;

    const name = nameIdx !== -1 ? cols[nameIdx] : `Estudiante ${i}`;
    let email = emailIdx !== -1 ? cols[emailIdx] : '';
    const rut = rutIdx !== -1 ? cols[rutIdx] : undefined;
    const course = courseIdx !== -1 && cols[courseIdx] ? cols[courseIdx] : defaultCourseId || 'iv_medio_a';

    if (!email && name) {
      email = `${name.toLowerCase().replace(/\s+/g, '.')}${i}@estudiantes.cl`;
    }

    if (name && email) {
      toImport.push({
        name,
        email,
        rut,
        course_id: course,
      });
    }
  }

  const importedCount = db.importStudents(toImport);

  res.json({
    success: true,
    totalParsed: toImport.length,
    importedCount,
    message: `Se importaron ${importedCount} estudiantes exitosamente.`,
  });
});

apiRouter.delete('/students/:id', (req: Request, res: Response) => {
  const currentUser = getAuthUser(req);
  if (!currentUser || currentUser.role !== 'docente') {
    return res.status(403).json({ error: 'Solo los docentes pueden eliminar estudiantes.' });
  }

  const result = db.deleteStudent(req.params.id);
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }
  res.json(result);
});

apiRouter.post('/students/clear-demo', (req: Request, res: Response) => {
  const currentUser = getAuthUser(req);
  if (!currentUser || currentUser.role !== 'docente') {
    return res.status(403).json({ error: 'Solo los docentes pueden realizar esta acción.' });
  }
  const result = db.clearStudents('demo');
  res.json(result);
});

apiRouter.post('/students/clear-all', (req: Request, res: Response) => {
  const currentUser = getAuthUser(req);
  if (!currentUser || currentUser.role !== 'docente') {
    return res.status(403).json({ error: 'Solo los docentes pueden realizar esta acción.' });
  }
  const result = db.clearStudents('all');
  res.json(result);
});

apiRouter.post('/students/restore-demo', (req: Request, res: Response) => {
  const currentUser = getAuthUser(req);
  if (!currentUser || currentUser.role !== 'docente') {
    return res.status(403).json({ error: 'Solo los docentes pueden realizar esta acción.' });
  }
  const result = db.restoreDemoStudents();
  res.json(result);
});

// --- TEXT BANK API ---

apiRouter.get('/texts', (req: Request, res: Response) => {
  const type = req.query.type as TextType | undefined;
  const difficulty = req.query.difficulty as TextDifficulty | undefined;
  const status = req.query.status as TextEditorialStatus | undefined;
  const search = req.query.search as string | undefined;

  const texts = db.getTexts({ type, difficulty, status, search });
  res.json({ texts });
});

apiRouter.get('/texts/:id', (req: Request, res: Response) => {
  const text = db.getTextById(req.params.id);
  if (!text) {
    return res.status(404).json({ error: 'Texto no encontrado' });
  }
  res.json({ text });
});

apiRouter.post('/texts/import', (req: Request, res: Response) => {
  const currentUser = getAuthUser(req);
  if (!currentUser || currentUser.role !== 'docente') {
    return res.status(403).json({ error: 'Solo los docentes pueden importar textos.' });
  }
  const { items, autoApprove, createAssignments } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'No hay textos para importar.' });
  }
  const results = db.importTexts(items, {
    autoApprove: Boolean(autoApprove),
    createAssignments: Boolean(createAssignments),
    createdBy: currentUser.id,
  });
  res.status(201).json({ results, imported: results.filter(r => r.ok).length });
});

apiRouter.post('/texts', (req: Request, res: Response) => {
  const currentUser = getAuthUser(req);
  if (!currentUser || currentUser.role !== 'docente') {
    return res.status(403).json({ error: 'Solo los docentes pueden crear textos.' });
  }

  const { title, author, source, content, type, difficulty, status } = req.body;
  if (!title || !content || !type || !difficulty) {
    return res.status(400).json({ error: 'title, content, type y difficulty son obligatorios' });
  }

  const text = db.createText({
    title,
    author: author || '',
    source: source || '',
    content,
    type,
    difficulty,
    status: status || 'borrador',
  });

  res.status(201).json({ text });
});

apiRouter.put('/texts/:id', (req: Request, res: Response) => {
  const currentUser = getAuthUser(req);
  if (!currentUser || currentUser.role !== 'docente') {
    return res.status(403).json({ error: 'Solo los docentes pueden editar textos.' });
  }

  const text = db.updateText(req.params.id, req.body);
  if (!text) {
    return res.status(404).json({ error: 'Texto no encontrado' });
  }
  res.json({ text });
});

apiRouter.delete('/texts/:id', (req: Request, res: Response) => {
  const currentUser = getAuthUser(req);
  if (!currentUser || currentUser.role !== 'docente') {
    return res.status(403).json({ error: 'Solo los docentes pueden eliminar textos.' });
  }

  const success = db.deleteText(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Texto no encontrado' });
  }
  res.json({ success: true });
});

// --- QUESTIONS API ---

apiRouter.get('/texts/:textId/questions', (req: Request, res: Response) => {
  const questions = db.getQuestionsByTextId(req.params.textId);
  res.json({ questions });
});

apiRouter.post('/texts/:id/approve', (req: Request, res: Response) => {
  const currentUser = getAuthUser(req);
  if (!currentUser || currentUser.role !== 'docente') {
    return res.status(403).json({ error: 'Solo los docentes pueden aprobar textos.' });
  }
  const result = db.approveText(req.params.id);
  if (!result.success) {
    const status = result.message === 'Texto no encontrado' ? 404 : 400;
    return res.status(status).json({ error: result.message });
  }
  res.json(result);
});

apiRouter.post('/texts/:textId/questions', (req: Request, res: Response) => {
  const currentUser = getAuthUser(req);
  if (!currentUser || currentUser.role !== 'docente') {
    return res.status(403).json({ error: 'Solo los docentes pueden crear preguntas.' });
  }

  const text = db.getTextById(req.params.textId);
  if (!text) {
    return res.status(404).json({ error: 'Texto asociado no encontrado' });
  }

  const { prompt, skill, options, correct_option, explanation, distractor_explanations, points } = req.body;
  if (!prompt || !skill || !options || !correct_option || !explanation) {
    return res.status(400).json({ error: 'Todos los campos obligatorios de la pregunta deben estar presentes' });
  }

  const question = db.addQuestion({
    text_id: req.params.textId,
    order_index: db.getQuestionsByTextId(req.params.textId).length + 1,
    prompt,
    skill,
    options,
    correct_option,
    explanation,
    distractor_explanations,
    points: points || 1,
  });

  res.status(201).json({ question });
});

apiRouter.put('/questions/:id', (req: Request, res: Response) => {
  const currentUser = getAuthUser(req);
  if (!currentUser || currentUser.role !== 'docente') {
    return res.status(403).json({ error: 'Solo los docentes pueden editar preguntas.' });
  }

  const question = db.updateQuestion(req.params.id, req.body);
  if (!question) {
    return res.status(404).json({ error: 'Pregunta no encontrada' });
  }
  res.json({ question });
});

apiRouter.delete('/questions/:id', (req: Request, res: Response) => {
  const currentUser = getAuthUser(req);
  if (!currentUser || currentUser.role !== 'docente') {
    return res.status(403).json({ error: 'Solo los docentes pueden eliminar preguntas.' });
  }

  const success = db.deleteQuestion(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Pregunta no encontrada' });
  }
  res.json({ success: true });
});

// Rutas anidadas que usa el cliente (texto -> pregunta). La de reordenar va primero para no confundirse con :id.
apiRouter.put('/texts/:textId/questions/reorder', (req: Request, res: Response) => {
  const currentUser = getAuthUser(req);
  if (!currentUser || currentUser.role !== 'docente') {
    return res.status(403).json({ error: 'Solo los docentes pueden reordenar preguntas.' });
  }
  const ids = Array.isArray(req.body?.questionIds) ? req.body.questionIds : [];
  res.json({ questions: db.reorderQuestions(req.params.textId, ids) });
});

apiRouter.put('/texts/:textId/questions/:id', (req: Request, res: Response) => {
  const currentUser = getAuthUser(req);
  if (!currentUser || currentUser.role !== 'docente') {
    return res.status(403).json({ error: 'Solo los docentes pueden editar preguntas.' });
  }
  const question = db.updateQuestion(req.params.id, req.body);
  if (!question) return res.status(404).json({ error: 'Pregunta no encontrada' });
  res.json({ question });
});

apiRouter.delete('/texts/:textId/questions/:id', (req: Request, res: Response) => {
  const currentUser = getAuthUser(req);
  if (!currentUser || currentUser.role !== 'docente') {
    return res.status(403).json({ error: 'Solo los docentes pueden eliminar preguntas.' });
  }
  if (!db.deleteQuestion(req.params.id)) return res.status(404).json({ error: 'Pregunta no encontrada' });
  res.json({ success: true });
});

// --- ASSIGNMENTS & ATTEMPTS API ---

apiRouter.get('/assignments', (req: Request, res: Response) => {
  const currentUser = getAuthUser(req);
  const courseId = req.query.courseId as string | undefined;
  const status = req.query.status as string | undefined;

  db.ensureDefaultAssignments();
  let assignments = db.getAssignments(courseId);

  if (currentUser && currentUser.role === 'estudiante') {
    assignments = assignments.filter(a => a.status === 'activa');
  }

  res.json({ assignments });
});

apiRouter.get('/assignments/:id', (req: Request, res: Response) => {
  const assignment = db.getAssignmentById(req.params.id);
  if (!assignment) {
    return res.status(404).json({ error: 'Asignación no encontrada' });
  }
  res.json({ assignment });
});

apiRouter.post('/assignments', (req: Request, res: Response) => {
  const currentUser = getAuthUser(req);
  if (!currentUser || currentUser.role !== 'docente') {
    return res.status(403).json({ error: 'Solo los docentes pueden crear asignaciones.' });
  }

  const { title, text_id, course_ids, mode, due_date, max_attempts } = req.body;
  if (!title || !text_id || !course_ids || !mode) {
    return res.status(400).json({ error: 'title, text_id, course_ids y mode son obligatorios' });
  }

  const assignment = db.createAssignment({
    title,
    text_id,
    course_ids,
    mode,
    due_date,
    max_attempts: max_attempts || 1,
    status: 'activa',
  });

  res.status(201).json({ assignment });
});

apiRouter.put('/assignments/:id', (req: Request, res: Response) => {
  const currentUser = getAuthUser(req);
  if (!currentUser || currentUser.role !== 'docente') {
    return res.status(403).json({ error: 'Solo los docentes pueden editar asignaciones.' });
  }

  const assignment = db.updateAssignment(req.params.id, req.body);
  if (!assignment) {
    return res.status(404).json({ error: 'Asignación no encontrada' });
  }
  res.json({ assignment });
});

apiRouter.get('/attempts', (req: Request, res: Response) => {
  const currentUser = getAuthUser(req);
  const assignmentId = req.query.assignmentId as string | undefined;
  const courseId = req.query.courseId as string | undefined;

  let studentId = req.query.studentId as string | undefined;
  if (currentUser && currentUser.role === 'estudiante') {
    studentId = currentUser.id;
  }

  const attempts = db.getAttempts(assignmentId, courseId, studentId);
  res.json({ attempts });
});

apiRouter.post('/attempts/start', (req: Request, res: Response) => {
  const currentUser = getAuthUser(req);
  if (!currentUser) {
    return res.status(401).json({ error: 'Debes iniciar sesión para comenzar una evaluación.' });
  }

  const assignment_id = req.body.assignment_id || req.body.assignmentId;
  if (!assignment_id) {
    return res.status(400).json({ error: 'assignment_id o assignmentId es obligatorio' });
  }

  try {
    const { attempt, assignment, text } = db.startAttempt(assignment_id, currentUser.id);
    const questions = assignment ? db.getQuestionsByTextId(assignment.text_id) : [];

    if (!text) {
      return res.status(404).json({ error: 'Texto asociado no encontrado' });
    }

    const isFormative = assignment?.mode === 'formativo';
    const sanitizedQuestions = questions.map(q => {
      const { correct_option, explanation, distractor_explanations, ...safeProps } = q;
      return isFormative ? q : safeProps;
    });

    res.json({
      attempt,
      assignment,
      text: {
        id: text.id,
        title: text.title,
        author: text.author,
        source: text.source,
        content: text.content,
        type: text.type,
      },
      questions: sanitizedQuestions,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/attempts/:attemptId/answer', (req: Request, res: Response) => {
  const { attemptId } = req.params;
  const { questionId, selectedOption } = req.body;

  if (!questionId || !selectedOption) {
    return res.status(400).json({ error: 'questionId y selectedOption son obligatorios.' });
  }

  try {
    const result = db.recordAnswer(attemptId, questionId, selectedOption as OptionLetter);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/attempts/:attemptId/finish', (req: Request, res: Response) => {
  const { attemptId } = req.params;
  try {
    const attempt = db.finishAttempt(attemptId);
    const assignment = db.getAssignmentById(attempt.assignment_id);
    const questions = assignment ? db.getQuestionsByTextId(assignment.text_id) : [];

    const skillStats = {
      localizar: { total: 0, correct: 0 },
      interpretar_relacionar: { total: 0, correct: 0 },
      evaluar: { total: 0, correct: 0 },
    };

    questions.forEach(q => {
      const ans = attempt.answers[q.id];
      if (ans && skillStats[q.skill]) {
        skillStats[q.skill].total++;
        if (ans.is_correct) skillStats[q.skill].correct++;
      }
    });

    res.json({
      attempt,
      assignment,
      questions,
      skillStats,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.get('/attempts/:attemptId', (req: Request, res: Response) => {
  const attempt = db.getAttemptById(req.params.attemptId);
  if (!attempt) {
    return res.status(404).json({ error: 'Intento no encontrado' });
  }
  const assignment = db.getAssignmentById(attempt.assignment_id);
  const text = assignment ? db.getTextById(assignment.text_id) : undefined;
  const questions = assignment ? db.getQuestionsByTextId(assignment.text_id) : [];

  res.json({
    attempt,
    assignment,
    text,
    questions,
  });
});

apiRouter.get('/student/assignments', (req: Request, res: Response) => {
  const currentUser = getAuthUser(req);
  if (!currentUser) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  // Si no hay ninguna actividad publicada, se crean automáticamente a partir de los textos aprobados
  db.ensureDefaultAssignments();

  // En el modelo sin cursos, todos los estudiantes y docentes acceden a la base completa de lecturas
  let assignments = db.getAssignments();
  if (currentUser.role === 'estudiante') {
    // Si no hay asignaciones marcadas como activas, mostrar todas las asignaciones existentes
    const activeOnes = assignments.filter(a => a.status === 'activa');
    if (activeOnes.length > 0) {
      assignments = activeOnes;
    }
  }

  // Enriquecer cada actividad con el estado del alumno/docente conectado
  const enriched = assignments.map(a => {
    const studentAttempts = db.getAttempts(a.id, undefined, currentUser.id);
    const completedAttempts = studentAttempts.filter(att => att.status === 'completed');
    const ongoingAttempt = studentAttempts.find(att => att.status === 'in_progress');

    const bestScore = completedAttempts.length > 0
      ? Math.max(...completedAttempts.map(att => att.percentage))
      : null;

    const maxAttempts = a.max_attempts || 3;
    const isLocked = completedAttempts.length >= maxAttempts && !ongoingAttempt;

    return {
      ...a,
      has_ongoing: Boolean(ongoingAttempt),
      ongoing_attempt_id: ongoingAttempt?.id || null,
      attempts_count: completedAttempts.length,
      best_score: bestScore,
      is_locked: isLocked,
    };
  });

  res.json({ assignments: enriched });
});

apiRouter.get('/student/my-results', (req: Request, res: Response) => {
  const currentUser = getAuthUser(req);
  if (!currentUser) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  const attempts = db.getAttempts(undefined, undefined, currentUser.id)
    .filter(a => a.status === 'completed')
    .sort((a, b) => new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime());

  const results = attempts.map(att => {
    const assignment = db.getAssignmentById(att.assignment_id);
    return {
      ...att,
      assignment_title: assignment?.title || 'Actividad',
      text_title: assignment?.text_title || 'Texto',
      mode: assignment?.mode,
    };
  });

  res.json({ results });
});

apiRouter.get('/student/adaptive-profile', (req: Request, res: Response) => {
  const currentUser = getAuthUser(req);
  if (!currentUser) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  const profile = db.getStudentAdaptiveProfile(currentUser.id);
  res.json({ profile });
});

apiRouter.get('/diagnostics', (req: Request, res: Response) => {
  if (!getAuthUser(req)) return res.status(401).json({ error: 'No autenticado' });
  res.json({ diagnostics: db.getDiagnostics() });
});

apiRouter.get('/student/learning-modules', (req: Request, res: Response) => {
  const currentUser = getAuthUser(req);
  if (!currentUser) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  const modules = db.getLearningModules(currentUser.id);
  res.json({ modules });
});

apiRouter.get('/analytics/student-progress', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'docente') return res.status(403).json({ error: 'Solo los docentes pueden ver el seguimiento.' });
  res.json(db.getStudentProgress());
});

apiRouter.get('/analytics', (req: Request, res: Response) => {
  const courseId = req.query.courseId as string | undefined;
  const assignmentId = req.query.assignmentId as string | undefined;

  const analytics = db.getAnalytics({ courseId, assignmentId });
  res.json({ analytics });
});

apiRouter.get('/export/csv', (req: Request, res: Response) => {
  const courseId = req.query.courseId as string | undefined;
  const assignmentId = req.query.assignmentId as string | undefined;

  const csv = db.generateCsvExport({ courseId, assignmentId });
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="paes_lector_resultados_${Date.now()}.csv"`);
  res.send(csv);
});

apiRouter.get('/backup/export', (req: Request, res: Response) => {
  const currentUser = getAuthUser(req);
  if (!currentUser || currentUser.role !== 'docente') {
    return res.status(403).json({ error: 'Solo los docentes pueden descargar copias de seguridad completas.' });
  }
  const backup = db.getFullBackup();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="paes_lector_respaldo_${Date.now()}.json"`);
  res.send(JSON.stringify(backup, null, 2));
});

apiRouter.post('/backup/restore', (req: Request, res: Response) => {
  const currentUser = getAuthUser(req);
  if (!currentUser || currentUser.role !== 'docente') {
    return res.status(403).json({ error: 'Solo los docentes pueden restaurar copias de seguridad.' });
  }
  const { data } = req.body;
  if (!data) {
    return res.status(400).json({ error: 'Datos de respaldo vacíos.' });
  }
  const result = db.restoreFullBackup(data);
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }
  res.json(result);
});

// --- VOCABULARIO (banco editable por el docente + progreso del estudiante) ---

function cleanVocab(body: any): { error?: string; value?: any } {
  const str = (v: any) => (typeof v === 'string' ? v.trim() : '');
  const letters: OptionLetter[] = ['A', 'B', 'C', 'D'];
  const target_word = str(body.target_word).toUpperCase();
  const context_sentence = str(body.context_sentence);
  const explanation = str(body.explanation);
  if (!target_word || !context_sentence || !explanation) {
    return { error: 'La palabra, la oración de contexto y la explicación son obligatorias.' };
  }
  if (!letters.includes(body.correct_option)) return { error: 'Indica cuál alternativa es la correcta (A, B, C o D).' };
  if (!['literario', 'academico', 'filosofico', 'periodistico'].includes(body.category)) return { error: 'Categoría inválida.' };
  if (!['inicial', 'medio', 'avanzado'].includes(body.difficulty)) return { error: 'Dificultad inválida.' };

  const options: any = {};
  for (const l of letters) {
    const synonym = str(body.options?.[l]?.synonym).toUpperCase();
    if (!synonym) return { error: `Falta el sinónimo de la alternativa ${l}.` };
    options[l] = { synonym, justification: str(body.options?.[l]?.justification) };
  }
  return {
    value: {
      target_word,
      context_sentence,
      full_passage: str(body.full_passage) || undefined,
      source: str(body.source) || undefined,
      category: body.category,
      difficulty: body.difficulty,
      options,
      correct_option: body.correct_option,
      explanation,
      nuance_tip: str(body.nuance_tip),
    },
  };
}

apiRouter.get('/vocab', (req: Request, res: Response) => {
  if (!getAuthUser(req)) return res.status(401).json({ error: 'No autenticado' });
  res.json({ exercises: db.getVocab() });
});

apiRouter.get('/vocab/progress', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'No autenticado' });
  res.json({ progress: db.getVocabProgress(user.id), vocab_points: user.vocab_points ?? 0 });
});

apiRouter.post('/vocab/answer', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'No autenticado' });
  const { exercise_id, selected_option } = req.body || {};
  if (!['A', 'B', 'C', 'D'].includes(selected_option)) return res.status(400).json({ error: 'Alternativa inválida' });
  const result = db.recordVocabAnswer(user.id, exercise_id, selected_option);
  if (!result) return res.status(404).json({ error: 'Ejercicio no encontrado' });
  res.json(result);
});

apiRouter.delete('/vocab/progress', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'No autenticado' });
  db.resetVocabProgress(user.id);
  res.json({ success: true });
});

apiRouter.get('/vocab/analytics', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'docente') return res.status(403).json({ error: 'Solo los docentes pueden ver esta analítica.' });
  res.json({ analytics: db.getVocabAnalytics() });
});

apiRouter.post('/vocab', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'docente') return res.status(403).json({ error: 'Solo los docentes pueden crear vocabulario.' });
  const { error, value } = cleanVocab(req.body || {});
  if (error) return res.status(400).json({ error });
  res.status(201).json({ exercise: db.createVocab(value) });
});

apiRouter.put('/vocab/:id', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'docente') return res.status(403).json({ error: 'Solo los docentes pueden editar vocabulario.' });
  const { error, value } = cleanVocab(req.body || {});
  if (error) return res.status(400).json({ error });
  const updated = db.updateVocab(req.params.id, value);
  if (!updated) return res.status(404).json({ error: 'Ejercicio no encontrado' });
  res.json({ exercise: updated });
});

apiRouter.delete('/vocab/:id', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user || user.role !== 'docente') return res.status(403).json({ error: 'Solo los docentes pueden eliminar vocabulario.' });
  if (!db.deleteVocab(req.params.id)) return res.status(404).json({ error: 'Ejercicio no encontrado' });
  res.json({ success: true });
});

// --- RACHA (persistida en el servidor / Supabase) ---
apiRouter.get('/student/streak', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'No autenticado' });
  res.json({ streak: db.getStreak(user.id) });
});

apiRouter.put('/student/streak', (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'No autenticado' });
  res.json({ streak: db.saveStreak(user.id, req.body || {}) });
});

apiRouter.get('/supabase/status', (req: Request, res: Response) => {
  const status = db.getSupabaseStatus();
  res.json({ status });
});

apiRouter.post('/supabase/config', async (req: Request, res: Response) => {
  const { url, anonKey } = req.body;
  if (!url || !anonKey) {
    return res.status(400).json({ error: 'La URL y la Anon Key de Supabase son obligatorias.' });
  }
  try {
    const updated = await db.updateSupabaseConfig(url, anonKey);
    res.json({ status: updated, message: 'Configuración de Supabase actualizada exitosamente.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error al conectar con Supabase' });
  }
});

apiRouter.post('/supabase/sync-push', async (req: Request, res: Response) => {
  try {
    const result = await db.syncPushToSupabase();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error al respaldar en Supabase' });
  }
});

apiRouter.post('/supabase/sync-pull', async (req: Request, res: Response) => {
  try {
    const result = await db.syncPullFromSupabase();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error al recuperar datos desde Supabase' });
  }
});

apiRouter.get('/supabase/schema', (req: Request, res: Response) => {
  const schemaPath = path.resolve(process.cwd(), 'supabase-schema.sql');
  if (fs.existsSync(schemaPath)) {
    const sql = fs.readFileSync(schemaPath, 'utf-8');
    res.json({ sql });
  } else {
    res.status(404).json({ error: 'Schema file not found' });
  }
});

// Mount the apiRouter on both '/api' and '/' so that it resolves regardless of how Vercel or local proxies route the request
app.use('/api', apiRouter);
app.use('/', apiRouter);

export default app;
