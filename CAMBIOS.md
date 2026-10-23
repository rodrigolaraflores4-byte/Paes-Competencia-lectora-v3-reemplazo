# Cambios de esta versión

## Guardado automático en Supabase (los datos ya no se pierden)
- `server/db.ts`: al arrancar (o tras un reinicio de Vercel) carga todo desde Supabase; cada cambio se sube solo
  (solo las filas modificadas, con borrados incluidos). Ahora también se guardan las **respuestas por pregunta**
  (`attempt_answers`), la **racha** y los **puntos de vocabulario**.
- `server/app.ts`: en Vercel espera a que el cambio llegue a Supabase antes de responder.
- Indicador "Guardado en la nube" en el encabezado docente y panel de estado en "Persistencia Supabase".

## Para dejarlo funcionando (una sola vez)
1. Supabase → SQL Editor → ejecutar `supabase-migration.sql`.
2. Vercel → Settings → Environment Variables: `SUPABASE_URL` y `SUPABASE_ANON_KEY` (ver `.env.example`). Volver a desplegar.

## Vocabulario
- Nueva pestaña docente **Vocabulario**: crear, editar y eliminar palabras; resultados por palabra y por estudiante.
- El estudiante lee el banco desde el servidor; sus respuestas se corrigen y guardan en el servidor.

## Diseño e interactividad
- Animaciones, barra de progreso, atajos de teclado (A-D, Enter, flechas) y retroalimentación en el taller de vocabulario.
- Transiciones entre pestañas docentes, estilos globales y foco accesible.

## Corrección: no aparecían ensayos ni aprendizaje
- Si Supabase ya tenía datos de respaldos anteriores, la primera vinculación ahora los **fusiona** (la nube gana) en vez de ignorarlos.
- Si la sesión guardada ya no existe en el servidor, la app vuelve a pedir inicio de sesión (antes dejaba los paneles vacíos).
- El panel del estudiante carga cada sección por separado y muestra el error real con botón "Reintentar".

## Racha
- Ahora suma con cualquier respuesta a un ejercicio (ensayo, aprendizaje o vocabulario), no solo al terminar un ensayo.

## Corrección del error de despliegue en Vercel
- Se eliminó `api/index.ts`. El comando de build ya genera `api/index.js` a partir de `server/app.ts`, y tener ambos
  archivos provocaba el error `conflicting_file_path`. `api/index.js` debe seguir en el proyecto (Vercel lo reemplaza en cada build).

## Corrección: Ensayos (0) y Aprendizaje sin actividades
- Si no existe ninguna actividad, el servidor crea automáticamente un taller formativo y un ensayo por cada texto **aprobado con preguntas**.
- Si aun así no hay nada, el estudiante ve un aviso con un diagnóstico (textos por estado, actividades) y un botón "Actualizar".

## Corrección: error 404 al aprobar textos (y al editar/borrar/reordenar preguntas)
- Faltaba en el servidor la ruta `POST /api/texts/:id/approve`. Agregada; si el texto no cumple los requisitos (sin preguntas, alternativas vacías) ahora muestra el motivo.
- También faltaban las rutas que usa el cliente para editar, eliminar y reordenar preguntas dentro de un texto. Agregadas.

## Corrección: el alumno volvía al inicio de sesión
- Si una instancia nueva del servidor no conoce al usuario de la sesión, ahora lo busca en Supabase antes de rechazarlo.
- Ante un 401 el cliente reintenta una vez y, si persiste, avisa con un mensaje antes de volver al inicio de sesión.
- Causa de fondo: sin Supabase vinculado (variables de entorno + migración SQL), cada instancia de Vercel guarda sus propios datos y no conoce a los alumnos creados en otra.

## Analítica: seguimiento de estudiantes
- Nueva tabla en Analítica con **avance**, **días de racha** (vigente y récord) y **% de logro** (lectura + vocabulario) por estudiante.
  Con buscador, filtros (con racha, sin actividad, logro bajo 55%), orden por columna y descarga en CSV (abre bien en Excel).

## Actividades y controles que se borraban al volver
- Causa: Vercel usa varias instancias del servidor y cada una guardaba su propia copia. Ahora, antes de cada petición, el servidor
  revisa si otra instancia guardó algo nuevo y lo recarga; lo creado por el docente se ve igual en todas.
- Si una tabla falla al guardar, las demás igual se guardan (antes se detenía todo) y el error indica cuál tabla falló.

## Importar textos
- Banco de textos → **Importar textos**: sube uno o varios .txt/.md, o pega el contenido, con textos y preguntas en un formato simple
  (descarga la plantilla desde el mismo botón). Vista previa con avisos, aprobación automática opcional y creación del taller y ensayo.
- Incluye un botón que copia instrucciones para que una IA convierta tu material al formato.
- El límite de tamaño de las peticiones subió a 4 MB.

## Archivos nuevos
`src/components/teacher/{StudentProgressTable,TextImportModal,VocabularyManager}.tsx`, `src/components/common/SyncBadge.tsx`,
`src/utils/textImport.ts`, `supabase-migration.sql`.
## Archivos modificados
`server/{db,app}.ts`, `src/api/client.ts`, `src/types/index.ts`, `src/App.tsx`, `src/index.css`, `src/utils/streak.ts`,
`src/components/teacher/{TextBank,AnalyticsDashboard,SupabaseSettings}.tsx`,
`src/components/student/{StudentDashboard,StudentPractice,VocabularyPractice}.tsx`, `.env.example`, `supabase-schema.sql`.
## Archivo eliminado
`api/index.ts` (conflicto con `api/index.js` en Vercel).
