import { Course, User, TextItem, Question, Assignment, Attempt } from '../src/types/index.js';

export const INITIAL_COURSES: Course[] = [
  {
    id: 'iv_medio_a',
    name: 'IV° Medio A',
    code: '4M-A',
    description: 'Curso Científico-Humanista IV° Medio A',
    student_count: 0,
  },
  {
    id: 'iv_medio_b',
    name: 'IV° Medio B',
    code: '4M-B',
    description: 'Curso Científico-Humanista IV° Medio B',
    student_count: 0,
  },
];

export const INITIAL_TEACHER: User = {
  id: 'doc_1',
  name: 'Prof. Rodrigo Lara Flores',
  email: 'rodrigolaraflores4@gmail.com',
  role: 'docente',
  rut: '17.784.722-4',
  password: 'PAES2026',
};

// Por defecto no se cargan estudiantes ficticios para que el docente trabaje con sus nóminas reales
export function generateInitialStudents(): User[] {
  return [];
}

// Función opcional para cargar estudiantes de demostración con RUTs chilenos oficiales de 9 dígitos
export function generateSampleDemoStudents(): User[] {
  const students: User[] = [
    {
      id: 'demo_est_1',
      name: 'Sofía González Muñoz',
      email: 'sofia.gonzalez@estudiantes.cl',
      role: 'estudiante',
      rut: '21.054.321-K',
      password: 'PAES2026',
      course_id: 'iv_medio_a',
    },
    {
      id: 'demo_est_2',
      name: 'Martín Muñoz Rojas',
      email: 'martin.munoz@estudiantes.cl',
      role: 'estudiante',
      rut: '21.123.456-7',
      password: 'PAES2026',
      course_id: 'iv_medio_a',
    },
    {
      id: 'demo_est_3',
      name: 'Valentina Díaz Soto',
      email: 'valentina.diaz@estudiantes.cl',
      role: 'estudiante',
      rut: '21.345.678-2',
      password: 'PAES2026',
      course_id: 'iv_medio_b',
    },
    {
      id: 'demo_est_4',
      name: 'Vicente Silva Pérez',
      email: 'vicente.silva@estudiantes.cl',
      role: 'estudiante',
      rut: '21.567.890-5',
      password: 'PAES2026',
      course_id: 'iv_medio_b',
    },
  ];
  return students;
}

export const INITIAL_TEXTS: TextItem[] = [
  {
    id: 'txt_ia_pensar',
    title: 'La inteligencia artificial y el oficio de pensar',
    author: 'Carlos Peña (adaptación)',
    source: 'El Mercurio / Columnas de Opinión sobre Educación y Tecnología',
    type: 'columna_opinion',
    difficulty: 'medio',
    status: 'aprobado',
    created_at: '2026-03-01T10:00:00.000Z',
    updated_at: '2026-03-05T14:30:00.000Z',
    content: `[1] La aparición masiva de modelos generativos de lenguaje ha provocado una alarma comprensible en las comunidades escolares y universitarias. No pocos docentes observan con inquietud cómo las tareas tradicionales —el ensayo argumentativo, la síntesis monográfica o el comentario crítico de textos— pueden ser resueltas en cuestión de segundos por algoritmos diseñados para concatenar probabilidades lingüísticas. Sin embargo, reducir la controversia al peligro del plagio o a la necesidad de implementar detectores de software es eludir el dilema medular: ¿qué entendemos verdaderamente por el oficio de pensar?

[2] Pensar nunca ha sido una mera operación de ensamblaje léxico. Desde los diálogos platónicos hasta la hermenéutica contemporánea, el ejercicio reflexivo supone una confrontación dialéctica del sujeto con sus propias certezas, una fricción con la incertidumbre y, ante todo, la capacidad de asumir la responsabilidad de las propias afirmaciones. Quien escribe no solo compone oraciones gramaticalmente coherentes; se sitúa éticamente ante un interlocutor y sostiene una pretensión de verdad o verosimilitud que ninguna máquina puede experimentar ni garantizar.

[3] Por consiguiente, la automatización de la escritura no amenaza la inteligencia humana porque sea capaz de reemplazarla en su hondura, sino porque fomenta la peligrosa ilusión de que la formulación expedita de un resultado equivale a su comprensión. Cuando un estudiante delega la redacción de su postura a un prompt algorítmico, no está ahorrando tiempo de trabajo manual: está renunciando al conflicto cognitivo en el cual se fragua el criterio ciudadano.

[4] La respuesta pedagógica, por lo tanto, no radica en la vana prohibición prohibitiva ni en la fascinación acrítica por la herramienta, sino en devolver al aula de lenguaje el valor irremplazable de la interrogación deliberada, la controversia fundamentada y la lectura lenta. En una época saturada de respuestas instantáneas, la verdadera distinción intelectual consistirá en saber formular las preguntas decisivas.`,
  },
  {
    id: 'txt_cerebro_lector',
    title: 'El cerebro lector: neurociencia y comprensión profunda',
    author: 'Maryanne Wolf (adaptación)',
    source: 'Lector, vuelve a casa: Cómo afecta la cultura digital al cerebro (Ediciones B)',
    type: 'expositivo',
    difficulty: 'avanzado',
    status: 'aprobado',
    created_at: '2026-03-08T09:00:00.000Z',
    updated_at: '2026-03-10T11:20:00.000Z',
    content: `[1] Los seres humanos nunca nacimos programados biológicamente para leer. A diferencia del lenguaje oral o la visión, que están grabados en nuestro código genético gracias a millones de años de evolución, la lectura es una invención cultural reciente de apenas unos seis mil años. Para aprender a descifrar símbolos visuales y dotarlos de significado conceptual, nuestro cerebro se ve obligado a recurrir a una asombrosa plasticidad neuronal, reorganizando circuitos originalmente destinados a reconocer formas en el entorno o rastrear huellas animales.

[2] Este prodigioso circuito cerebral no es estático ni inmune al entorno en el que se ejerce. Al contrario, se adapta a las características de los soportes dominantes y a los hábitos de consumo. Cuando leemos en entornos digitales saturados de notificaciones, hipervínculos y estímulos simultáneos, el cerebro lector tiende a adoptar una modalidad de rastreo rápido o "escaneo en F". Esta estrategia resulta extraordinariamente eficiente para localizar datos concretos en grandes volúmenes de información, pero penaliza severamente los procesos de lectura profunda.

[3] La lectura profunda abarca operaciones cognitivas complejas: la inferencia inductiva y deductiva, el razonamiento analógico, el discernimiento crítico y, sobre todo, la empatía hacia perspectivas ajenas. Cuando un lector se sumerge pacientemente en un texto denso, activa áreas cerebrales vinculadas a la experiencia sensorial directa y a la introspección moral. Si reducimos nuestro tiempo de inmersión sostenida, estos circuitos pierden densidad sináptica, debilitando nuestra capacidad de sostener argumentos extensos y sopesar matices discursivos.

[4] Preservar un cerebro bi-alfabetizado —uno capaz de alternar con soltura entre la velocidad analítica del entorno digital y la pausada hondura de la lectura inmersiva— constituye uno de los mayores desafíos cívicos de nuestro siglo.`,
  },
  {
    id: 'txt_eclipse_monterroso',
    title: 'El eclipse y la mirada del conquistador',
    author: 'Augusto Monterroso (análisis crítico)',
    source: 'Obras completas y otros cuentos / Fray Bartolomé Arrazola',
    type: 'narrativo',
    difficulty: 'medio',
    status: 'en_revision',
    created_at: '2026-03-12T15:00:00.000Z',
    updated_at: '2026-03-12T17:45:00.000Z',
    content: `[1] Cuando fray Bartolomé Arrazola se sintió perdido en la selva de Guatemala, aceptó que ya nada podría salvarlo. La selva poderosa de Guatemala lo había apresado, implacable y definitiva. Ante su ignorancia topográfica, se sentó con tranquilidad a esperar la muerte. Quiso morir allí, sin ninguna esperanza, aislado, con el pensamiento fijo en la lejana España, particularmente en el convento de los Coronados, donde Carlos Quinto condescendiera una vez a bajar de su eminencia para decirle que confiaba en el celo religioso de su labor redentora.

[2] Al despertar se encontró rodeado por un grupo de indígenas de rostro impasible que se disponían a sacrificarlo sobre un altar que a Bartolomé le pareció como el lecho en que descansaría, al fin, de sus temores, de su destino, de sí mismo. Tres años de residencia en el país le habían conferido un mediano dominio de las lenguas nativas. Intentó algo. Dijo algunas palabras que fueron comprendidas.

[3] Entonces floreció en él una idea que tuvo por digna de su talento y de su cultura universal y de su arduo conocimiento de Aristóteles. Recordó que para ese día se esperaba un eclipse total de sol. Y dispuso, en lo íntimo, valerse de aquel conocimiento para engañar a sus opresores y salvar la vida.
—Si me matáis —les dijo—, puedo hacer que el sol se oscurezca en su altura.

[4] Los indígenas lo miraron fijamente y Bartolomé sorprendió la incredulidad en sus ojos. Vio que se produjo una pequeña reunión, y aguardó confiado, no sin cierto desdén. Dos horas después el corazón de fray Bartolomé Arrazola chorreaba su sangre vehemente sobre la piedra de los sacrificios, mientras uno de los indígenas recitaba sin ninguna inflexión de voz, sin prisa, una por una, las infinitas fechas en que se producirían eclipses solares y lunares, que los astrónomos de la comunidad maya habían previsto y anotado en sus códices sin la valiosa ayuda de Aristóteles.`,
  },
];

export const INITIAL_QUESTIONS: Question[] = [
  // Preguntas para el Texto 1: "La inteligencia artificial y el oficio de pensar"
  {
    id: 'q_ia_1',
    text_id: 'txt_ia_pensar',
    order_index: 1,
    prompt: 'Según el párrafo [1], ¿cuál es la preocupación inmediata manifestada por docentes ante las herramientas de inteligencia artificial?',
    skill: 'localizar',
    options: {
      A: 'Que las máquinas sustituyan la necesidad de profesores en las aulas escolares.',
      B: 'Que los estudiantes resuelvan tareas habituales de redacción en cuestión de segundos.',
      C: 'Que se vuelva imposible distinguir el lenguaje humano de las secuencias numéricas.',
      D: 'Que las instituciones educativas deban gastar excesivos recursos en detectores de software.',
    },
    correct_option: 'B',
    explanation: 'En el párrafo [1], el texto señala textualmente que los docentes observan con inquietud "cómo las tareas tradicionales —el ensayo argumentativo, la síntesis monográfica o el comentario crítico de textos— pueden ser resueltas en cuestión de segundos por algoritmos". Por lo tanto, la opción B reproduce la información explícita solicitada.',
    distractor_explanations: {
      A: 'Distractor incorrecto: El texto no afirma que las máquinas sustituirán a los docentes, sino que cuestiona la resolución rápida de tareas.',
      C: 'Distractor incorrecto: Es una generalización exagerada que no aparece expresada en el primer párrafo.',
      D: 'Distractor incorrecto: Aunque se mencionan detectores de software, el texto los califica de paliativo superficial frente al dilema real, no el foco de la alarma docente inicial.',
    },
    points: 1,
  },
  {
    id: 'q_ia_2',
    text_id: 'txt_ia_pensar',
    order_index: 2,
    prompt: 'A partir de lo expresado en el párrafo [2], ¿qué diferencia fundamental establece el autor entre un algoritmo de lenguaje y un sujeto humano que reflexiona?',
    skill: 'interpretar_relacionar',
    options: {
      A: 'El grado de corrección gramatical alcanzado al estructurar periodos oracionales extensos.',
      B: 'La rapidez con que se cotejan hipótesis discursivas en la tradición filosófica clásica.',
      C: 'El compromiso ético con la verdad y la disposición a asumir la responsabilidad discursiva.',
      D: 'La cantidad de memoria léxica acumulada para responder a dilemas hermenéuticos contemporáneos.',
    },
    correct_option: 'C',
    explanation: 'En el párrafo [2], el autor explicita que pensar no es ensamblaje de palabras, sino confrontación con la incertidumbre, donde el hablante humano "se sitúa éticamente ante un interlocutor y sostiene una pretensión de verdad o verosimilitud que ninguna máquina puede experimentar ni garantizar". La opción C sintetiza con precisión este núcleo interpretativo.',
    distractor_explanations: {
      A: 'Distractor incorrecto: El autor reconoce que las máquinas sí logran corrección sintáctica y coherencia gramatical; no es esa su carencia.',
      B: 'Distractor incorrecto: La rapidez es una ventaja de la máquina, no el factor humano diferenciador.',
      D: 'Distractor incorrecto: La memoria de almacenamiento de datos favorece a los modelos masivos, no al límite reflexivo humano.',
    },
    points: 1,
  },
  {
    id: 'q_ia_3',
    text_id: 'txt_ia_pensar',
    order_index: 3,
    prompt: '¿Cuál es la función discursiva del párrafo [3] en el conjunto de la argumentación?',
    skill: 'interpretar_relacionar',
    options: {
      A: 'Explicar los mecanismos algorítmicos mediante los cuales un prompt procesa instrucciones de usuario.',
      B: 'Adelantar una objeción al uso pedagógico de computadores para justificar una sanción disciplinaria.',
      C: 'Demostrar que la prisa estudiantil es la causa primaria de los fracasos de la formación ciudadana.',
      D: 'Evidenciar la consecuencia perjudicial de delegar la escritura: eludir la tensión cognitiva formadora del criterio.',
    },
    correct_option: 'D',
    explanation: 'El párrafo [3] conecta lógicamente con el anterior para advertir que delegar la escritura hace que el estudiante renuncie al "conflicto cognitivo en el cual se fragua el criterio ciudadano". La opción D describe fielmente esta función de articulación del daño pedagógico.',
    distractor_explanations: {
      A: 'Distractor incorrecto: El párrafo no describe la técnica informática de los prompts, sino sus consecuencias humanas.',
      B: 'Distractor incorrecto: El texto no promueve sanciones disciplinarias, como se aclara expresamente en el párrafo final.',
      C: 'Distractor incorrecto: Atribuir el problema simplemente a la "prisa estudiantil" simplifica y desvía la tesis estructural del autor.',
    },
    points: 1,
  },
  {
    id: 'q_ia_4',
    text_id: 'txt_ia_pensar',
    order_index: 4,
    prompt: 'A partir de la lectura integral del texto, ¿cuál es el propósito comunicativo central del emisor?',
    skill: 'evaluar',
    options: {
      A: 'Proponer que la enseñanza escolar revalorice la deliberación crítica frente al espejismo de la inmediatez técnica.',
      B: 'Exigir al Ministerio de Educación la prohibición terminante de herramientas digitales en evaluaciones escritas.',
      C: 'Demostrar la superioridad de la filosofía platónica frente a las tecnologías comunicativas de última generación.',
      D: 'Advertir que las escuelas deben capacitar a sus profesores en la detección automatizada de plagios digitales.',
    },
    correct_option: 'A',
    explanation: 'Al evaluar globalmente la postura del autor (especialmente en los párrafos 3 y 4), se constata que no busca prohibir ni fascinarse ciegamente, sino instar a las aulas a fortalecer la interrogación, la lectura lenta y el criterio ciudadano frente al peligro de creer que producir texto rápido es sinónimo de comprensión.',
    distractor_explanations: {
      B: 'Distractor incorrecto: En el párrafo 4 rechaza explícitamente "la vana prohibición prohibitiva".',
      C: 'Distractor incorrecto: Platón es citado solo como referencia histórica del diálogo dialéctico, no para entronizar una escuela sobre otra.',
      D: 'Distractor incorrecto: El párrafo 1 rechaza reducir la discusión al combate del plagio.',
    },
    points: 1,
  },

  // Preguntas para el Texto 2: "El cerebro lector"
  {
    id: 'q_cer_1',
    text_id: 'txt_cerebro_lector',
    order_index: 1,
    prompt: 'Según el párrafo [1], ¿por qué la lectura requirió de la plasticidad cerebral para desarrollarse en la especie humana?',
    skill: 'localizar',
    options: {
      A: 'Porque no contábamos con áreas sensoriales capaces de discernir tonalidades y contrastes luminosos.',
      B: 'Porque carecemos de una programación biológica hereditaria específica destinada a decodificar símbolos escritos.',
      C: 'Porque los primeros alfabetos se diseñaron imitando la trayectoria de animales salvajes en peligro de extinción.',
      D: 'Porque el lenguaje oral se desarrolló después de las primeras manifestaciones rupestres prehistóricas.',
    },
    correct_option: 'B',
    explanation: 'El párrafo [1] afirma que "los seres humanos nunca nacimos programados biológicamente para leer", a diferencia de la visión o el habla oral, por lo que el cerebro debió reciclar circuitos mediante plasticidad neuronal.',
    distractor_explanations: {
      A: 'Distractor incorrecto: El texto afirma que precisamente reutilizamos circuitos visuales que ya existían.',
      C: 'Distractor incorrecto: Confunde la mención del rastreo animal con el diseño de alfabetos.',
      D: 'Distractor incorrecto: Contradice la afirmación de que el lenguaje oral tiene millones de años de evolución genética previa.',
    },
    points: 1,
  },
  {
    id: 'q_cer_2',
    text_id: 'txt_cerebro_lector',
    order_index: 2,
    prompt: '¿Qué relación se establece en el párrafo [2] entre la lectura digital y el denominado "escaneo en F"?',
    skill: 'interpretar_relacionar',
    options: {
      A: 'El escaneo en F es una anomalía visual provocada por el brillo excesivo de pantallas retroiluminadas.',
      B: 'El escaneo en F potencia simultáneamente la empatía emocional y la agilidad de cálculo numérico.',
      C: 'El escaneo en F es una pauta adaptativa veloz para rastrear datos que sacrifica la hondura reflexiva.',
      D: 'El escaneo en F constituye el método de lectura predilecto para descifrar ensayos de alta complejidad filosófica.',
    },
    correct_option: 'C',
    explanation: 'El texto explica que en soportes digitales el cerebro opta por el escaneo en F, el cual es "extraordinariamente eficiente para localizar datos concretos", pero "penaliza severamente los procesos de lectura profunda".',
    distractor_explanations: {
      A: 'Distractor incorrecto: No es una patología médica óptica, sino una modalidad cognitiva de rastreo.',
      B: 'Distractor incorrecto: El párrafo 3 señala que la empatía pertenece a la lectura profunda, la cual es debilitada por este escaneo.',
      D: 'Distractor incorrecto: El texto aclara que perjudica los textos densos y argumentativos.',
    },
    points: 1,
  },
  {
    id: 'q_cer_3',
    text_id: 'txt_cerebro_lector',
    order_index: 3,
    prompt: '¿Qué se infiere respecto al desarrollo de la empatía a partir de lo expuesto en el párrafo [3]?',
    skill: 'interpretar_relacionar',
    options: {
      A: 'Que requiere de un procesamiento cognitivo inmersivo que se debilita si solo consumimos fragmentos breves.',
      B: 'Que es un rasgo innato que no experimenta ninguna variación ante los cambios de soporte técnico.',
      C: 'Que solo puede cultivarse a través del lenguaje oral espontáneo en la primera infancia.',
      D: 'Que impide el desarrollo de capacidades analíticas abstractas en lectores universitarios.',
    },
    correct_option: 'A',
    explanation: 'El texto relaciona la empatía con la lectura profunda inmersiva ("activa áreas cerebrales vinculadas a la experiencia sensorial directa y a la introspección moral"), advirtiendo que al reducir el tiempo inmersivo estos circuitos pierden densidad sináptica.',
    distractor_explanations: {
      B: 'Distractor incorrecto: El texto demuestra precisamente que el circuito neuronal lector se reconfigura y debilita según el medio.',
      C: 'Distractor incorrecto: El autor vincula la introspección con la lectura paciente y sostenida.',
      D: 'Distractor incorrecto: Empatía y análisis reflexivo van de la mano en la lectura profunda según el texto.',
    },
    points: 1,
  },
  {
    id: 'q_cer_4',
    text_id: 'txt_cerebro_lector',
    order_index: 4,
    prompt: '¿Qué actitud manifiesta la autora frente a la convivencia entre la tecnología digital y la lectura tradicional en el cierre del texto?',
    skill: 'evaluar',
    options: {
      A: 'Tecnófoba: promueve la eliminación radical de pantallas en la formación de los futuros ciudadanos.',
      B: 'Equilibrada e integradora: aboga por preservar simultáneamente la rapidez digital y la hondura inmersiva.',
      C: 'Resignada: considera inevitable la desaparición de la comprensión lectora en las nuevas generaciones.',
      D: 'Conformista: estima que el escaneo rápido sustituye ventajosamente a los antiguos formatos impresos.',
    },
    correct_option: 'B',
    explanation: 'En el párrafo [4], la autora define como meta crucial un "cerebro bi-alfabetizado", capaz de combinar ambas dimensiones (la velocidad analítica digital y la reposada hondura de la inmersión), postura que denota equilibrio e integración pedagógica.',
    distractor_explanations: {
      A: 'Distractor incorrecto: No pide prescindir de lo digital; alaba también su velocidad analítica.',
      C: 'Distractor incorrecto: El tono es de desafío cívico propositivo, no de derrota fatalista.',
      D: 'Distractor incorrecto: Advierte con gravedad de las pérdidas cognitivas si no se cuida la inmersión.',
    },
    points: 1,
  },

  // Preguntas para el Texto 3: "El eclipse de Monterroso"
  {
    id: 'q_ecl_1',
    text_id: 'txt_eclipse_monterroso',
    order_index: 1,
    prompt: '¿Por qué fray Bartolomé Arrazola creyó que podía engañar a los indígenas mayas con el fenómeno del eclipse?',
    skill: 'localizar',
    options: {
      A: 'Porque había sido instruido formalmente en astronomía mesoamericana por el emperador Carlos Quinto.',
      B: 'Porque confiaba en la supuesta superioridad de su cultura europea y en sus lecturas de Aristóteles.',
      C: 'Porque los indígenas le confesaron explícitamente su terror a la oscuridad del cosmos.',
      D: 'Porque dominaba a la perfección todos los dialectos nativos de Centroamérica.',
    },
    correct_option: 'B',
    explanation: 'En el párrafo [3], el narrador explicita que en el fraile "floreció en él una idea que tuvo por digna de su talento y de su cultura universal y de su arduo conocimiento de Aristóteles". Esta soberbia eurocéntrica lo lleva a concebir el engaño.',
    distractor_explanations: {
      A: 'Distractor incorrecto: Carlos Quinto le encomendó una misión religiosa de redención, no astronómica.',
      C: 'Distractor incorrecto: Los rostros indígenas eran impasibles y luego miraron con incredulidad.',
      D: 'Distractor incorrecto: El texto aclara que poseía solo un "mediano dominio" de las lenguas nativas.',
    },
    points: 1,
  },
  {
    id: 'q_ecl_2',
    text_id: 'txt_eclipse_monterroso',
    order_index: 2,
    prompt: '¿Cuál es el sentido irónico fundamental que encierra el desenlace del relato?',
    skill: 'interpretar_relacionar',
    options: {
      A: 'Que fray Bartolomé fue salvado en el último instante por una tormenta imprevista en la selva.',
      B: 'Que los mayas conocían con exactitud matemática las fechas de los eclipses sin necesitar la ciencia europea.',
      C: 'Que el convento de los Coronados envió una expedición de rescate cuando ya era demasiado tarde.',
      D: 'Que Aristóteles había escrito un tratado astronómico que contradecía los códices prehispánicos.',
    },
    correct_option: 'B',
    explanation: 'La ironía reside en el contraste entre el desdén del fraile, que creía poseer una ventaja cognitiva insuperable gracias a la tradición aristotélica, y la realidad del sacerdote maya recitando pacientemente las infinitas fechas registradas en sus propios códices.',
    distractor_explanations: {
      A: 'Distractor incorrecto: El fraile es sacrificado en la piedra, no se produce ningún rescate milagroso.',
      C: 'Distractor incorrecto: El convento nunca interviene en la selva.',
      D: 'Distractor incorrecto: Aristóteles es invocado como emblema del saber europeo clásico, no por un texto contradictorio específico.',
    },
    points: 1,
  },
  {
    id: 'q_ecl_3',
    text_id: 'txt_eclipse_monterroso',
    order_index: 3,
    prompt: 'Al evaluar la caracterización de fray Bartolomé en el relato, ¿qué rasgo describe con mayor precisión su visión de mundo?',
    skill: 'evaluar',
    options: {
      A: 'Un paternalismo etnocéntrico que subestimó el conocimiento de la civilización sometida.',
      B: 'Un espíritu científico de avanzada incomprendido por las jerarquías eclesiásticas de su tiempo.',
      C: 'Una cobardía patológica que lo incapacitaba para asumir las dificultades de la vida misionera.',
      D: 'Un sincretismo cultural que buscaba armonizar las deidades mayas con la teología cristiana.',
    },
    correct_option: 'A',
    explanation: 'El fraile encarna la mirada colonial: mira con "cierto desdén" a sus captores y asume de antemano que la ignorancia de los nativos le permitirá manipularlos con un fenómeno que su propia civilización consideraba monopolio ilustrado.',
    distractor_explanations: {
      B: 'Distractor incorrecto: Su conducta no es de investigación científica, sino de supervivencia basada en el prejuicio.',
      C: 'Distractor incorrecto: El inicio del texto muestra que aceptó con tranquilidad la muerte inicial.',
      D: 'Distractor incorrecto: No hay sincretismo; concibe a los nativos como inferiores a engañar.',
    },
    points: 1,
  },
];

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asig_1',
    title: 'Taller Formativo: IA y el Oficio de Pensar',
    text_id: 'txt_ia_pensar',
    text_title: 'La inteligencia artificial y el oficio de pensar',
    text_type: 'columna_opinion',
    course_ids: ['iv_medio_a', 'iv_medio_b'],
    mode: 'formativo',
    status: 'activa',
    due_date: '2026-04-30T23:59:59.000Z',
    max_attempts: 2,
    created_at: '2026-03-15T08:00:00.000Z',
    question_count: 4,
  },
  {
    id: 'asig_2',
    title: 'Control Sumativo N°1: El Cerebro Lector',
    text_id: 'txt_cerebro_lector',
    text_title: 'El cerebro lector: neurociencia y comprensión profunda',
    text_type: 'expositivo',
    course_ids: ['iv_medio_a'],
    mode: 'evaluacion',
    status: 'activa',
    due_date: '2026-05-15T23:59:59.000Z',
    max_attempts: 1,
    created_at: '2026-03-20T08:00:00.000Z',
    question_count: 4,
  },
];

// Generar intentos realistas de muestra para analítica inicial
export function generateInitialAttempts(students: User[]): Attempt[] {
  const attempts: Attempt[] = [];
  
  // Asignación 1: Formativo (ambos cursos)
  // Simular que 30 estudiantes de IV A y 26 estudiantes de IV B ya lo completaron
  const studentsIVA = students.filter(s => s.course_id === 'iv_medio_a');
  const studentsIVB = students.filter(s => s.course_id === 'iv_medio_b');

  // Intentos IV A (asig_1)
  studentsIVA.slice(0, 30).forEach((st, idx) => {
    // La mayoría acierta q_ia_1 y q_ia_2, q_ia_3 tiene más errores
    const q1Correct = idx % 10 !== 0; // 90% correct
    const q2Correct = idx % 4 !== 0;  // 75% correct
    const q3Correct = idx % 2 === 0;  // 50% correct (pregunta crítica)
    const q4Correct = idx % 5 !== 0;  // 80% correct

    const score = (q1Correct ? 1 : 0) + (q2Correct ? 1 : 0) + (q3Correct ? 1 : 0) + (q4Correct ? 1 : 0);
    const pct = Math.round((score / 4) * 100);
    const paesScore = Math.round(150 + (score / 4) * 750 + (idx % 30));

    attempts.push({
      id: `att_1_a_${idx + 1}`,
      assignment_id: 'asig_1',
      student_id: st.id,
      student_name: st.name,
      student_rut: st.rut,
      course_id: 'iv_medio_a',
      course_name: 'IV° Medio A',
      attempt_number: 1,
      status: 'completed',
      started_at: '2026-03-18T14:10:00.000Z',
      completed_at: '2026-03-18T14:28:00.000Z',
      score,
      total_points: 4,
      percentage: pct,
      paes_estimated_score: paesScore,
      answers: {
        q_ia_1: {
          question_id: 'q_ia_1',
          selected_option: q1Correct ? 'B' : 'A',
          is_correct: q1Correct,
          points_earned: q1Correct ? 1 : 0,
          answered_at: '2026-03-18T14:14:00.000Z',
        },
        q_ia_2: {
          question_id: 'q_ia_2',
          selected_option: q2Correct ? 'C' : 'A',
          is_correct: q2Correct,
          points_earned: q2Correct ? 1 : 0,
          answered_at: '2026-03-18T14:18:00.000Z',
        },
        q_ia_3: {
          question_id: 'q_ia_3',
          selected_option: q3Correct ? 'D' : 'B',
          is_correct: q3Correct,
          points_earned: q3Correct ? 1 : 0,
          answered_at: '2026-03-18T14:22:00.000Z',
        },
        q_ia_4: {
          question_id: 'q_ia_4',
          selected_option: q4Correct ? 'A' : 'C',
          is_correct: q4Correct,
          points_earned: q4Correct ? 1 : 0,
          answered_at: '2026-03-18T14:27:00.000Z',
        },
      },
    });
  });

  // Intentos IV B (asig_1)
  studentsIVB.slice(0, 26).forEach((st, idx) => {
    const q1Correct = idx % 8 !== 0; // 87%
    const q2Correct = idx % 3 !== 0; // 66%
    const q3Correct = idx % 3 === 0; // 33% (pregunta crítica)
    const q4Correct = idx % 4 !== 0; // 75%

    const score = (q1Correct ? 1 : 0) + (q2Correct ? 1 : 0) + (q3Correct ? 1 : 0) + (q4Correct ? 1 : 0);
    const pct = Math.round((score / 4) * 100);
    const paesScore = Math.round(150 + (score / 4) * 750 + (idx % 25));

    attempts.push({
      id: `att_1_b_${idx + 1}`,
      assignment_id: 'asig_1',
      student_id: st.id,
      student_name: st.name,
      student_rut: st.rut,
      course_id: 'iv_medio_b',
      course_name: 'IV° Medio B',
      attempt_number: 1,
      status: 'completed',
      started_at: '2026-03-19T10:15:00.000Z',
      completed_at: '2026-03-19T10:35:00.000Z',
      score,
      total_points: 4,
      percentage: pct,
      paes_estimated_score: paesScore,
      answers: {
        q_ia_1: {
          question_id: 'q_ia_1',
          selected_option: q1Correct ? 'B' : 'C',
          is_correct: q1Correct,
          points_earned: q1Correct ? 1 : 0,
          answered_at: '2026-03-19T10:18:00.000Z',
        },
        q_ia_2: {
          question_id: 'q_ia_2',
          selected_option: q2Correct ? 'C' : 'D',
          is_correct: q2Correct,
          points_earned: q2Correct ? 1 : 0,
          answered_at: '2026-03-19T10:23:00.000Z',
        },
        q_ia_3: {
          question_id: 'q_ia_3',
          selected_option: q3Correct ? 'D' : 'C',
          is_correct: q3Correct,
          points_earned: q3Correct ? 1 : 0,
          answered_at: '2026-03-19T10:29:00.000Z',
        },
        q_ia_4: {
          question_id: 'q_ia_4',
          selected_option: q4Correct ? 'A' : 'B',
          is_correct: q4Correct,
          points_earned: q4Correct ? 1 : 0,
          answered_at: '2026-03-19T10:34:00.000Z',
        },
      },
    });
  });

  return attempts;
}
