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
