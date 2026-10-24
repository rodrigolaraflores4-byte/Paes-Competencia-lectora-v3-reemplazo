// server/app.ts
import express from "express";
import path2 from "path";
import fs2 from "fs";

// server/db.ts
import fs from "fs";
import path from "path";

// server/seedData.ts
var INITIAL_COURSES = [
  {
    id: "iv_medio_a",
    name: "IV\xB0 Medio A",
    code: "4M-A",
    description: "Curso Cient\xEDfico-Humanista IV\xB0 Medio A",
    student_count: 0
  },
  {
    id: "iv_medio_b",
    name: "IV\xB0 Medio B",
    code: "4M-B",
    description: "Curso Cient\xEDfico-Humanista IV\xB0 Medio B",
    student_count: 0
  }
];
var INITIAL_TEACHER = {
  id: "doc_1",
  name: "Prof. Rodrigo Lara Flores",
  email: "rodrigolaraflores4@gmail.com",
  role: "docente",
  rut: "17.784.722-4",
  password: "PAES2026"
};
function generateInitialStudents() {
  return [];
}
var INITIAL_TEXTS = [
  {
    id: "txt_ia_pensar",
    title: "La inteligencia artificial y el oficio de pensar",
    author: "Carlos Pe\xF1a (adaptaci\xF3n)",
    source: "El Mercurio / Columnas de Opini\xF3n sobre Educaci\xF3n y Tecnolog\xEDa",
    type: "columna_opinion",
    difficulty: "medio",
    status: "aprobado",
    created_at: "2026-03-01T10:00:00.000Z",
    updated_at: "2026-03-05T14:30:00.000Z",
    content: `[1] La aparici\xF3n masiva de modelos generativos de lenguaje ha provocado una alarma comprensible en las comunidades escolares y universitarias. No pocos docentes observan con inquietud c\xF3mo las tareas tradicionales \u2014el ensayo argumentativo, la s\xEDntesis monogr\xE1fica o el comentario cr\xEDtico de textos\u2014 pueden ser resueltas en cuesti\xF3n de segundos por algoritmos dise\xF1ados para concatenar probabilidades ling\xFC\xEDsticas. Sin embargo, reducir la controversia al peligro del plagio o a la necesidad de implementar detectores de software es eludir el dilema medular: \xBFqu\xE9 entendemos verdaderamente por el oficio de pensar?

[2] Pensar nunca ha sido una mera operaci\xF3n de ensamblaje l\xE9xico. Desde los di\xE1logos plat\xF3nicos hasta la hermen\xE9utica contempor\xE1nea, el ejercicio reflexivo supone una confrontaci\xF3n dial\xE9ctica del sujeto con sus propias certezas, una fricci\xF3n con la incertidumbre y, ante todo, la capacidad de asumir la responsabilidad de las propias afirmaciones. Quien escribe no solo compone oraciones gramaticalmente coherentes; se sit\xFAa \xE9ticamente ante un interlocutor y sostiene una pretensi\xF3n de verdad o verosimilitud que ninguna m\xE1quina puede experimentar ni garantizar.

[3] Por consiguiente, la automatizaci\xF3n de la escritura no amenaza la inteligencia humana porque sea capaz de reemplazarla en su hondura, sino porque fomenta la peligrosa ilusi\xF3n de que la formulaci\xF3n expedita de un resultado equivale a su comprensi\xF3n. Cuando un estudiante delega la redacci\xF3n de su postura a un prompt algor\xEDtmico, no est\xE1 ahorrando tiempo de trabajo manual: est\xE1 renunciando al conflicto cognitivo en el cual se fragua el criterio ciudadano.

[4] La respuesta pedag\xF3gica, por lo tanto, no radica en la vana prohibici\xF3n prohibitiva ni en la fascinaci\xF3n acr\xEDtica por la herramienta, sino en devolver al aula de lenguaje el valor irremplazable de la interrogaci\xF3n deliberada, la controversia fundamentada y la lectura lenta. En una \xE9poca saturada de respuestas instant\xE1neas, la verdadera distinci\xF3n intelectual consistir\xE1 en saber formular las preguntas decisivas.`
  },
  {
    id: "txt_cerebro_lector",
    title: "El cerebro lector: neurociencia y comprensi\xF3n profunda",
    author: "Maryanne Wolf (adaptaci\xF3n)",
    source: "Lector, vuelve a casa: C\xF3mo afecta la cultura digital al cerebro (Ediciones B)",
    type: "expositivo",
    difficulty: "avanzado",
    status: "aprobado",
    created_at: "2026-03-08T09:00:00.000Z",
    updated_at: "2026-03-10T11:20:00.000Z",
    content: `[1] Los seres humanos nunca nacimos programados biol\xF3gicamente para leer. A diferencia del lenguaje oral o la visi\xF3n, que est\xE1n grabados en nuestro c\xF3digo gen\xE9tico gracias a millones de a\xF1os de evoluci\xF3n, la lectura es una invenci\xF3n cultural reciente de apenas unos seis mil a\xF1os. Para aprender a descifrar s\xEDmbolos visuales y dotarlos de significado conceptual, nuestro cerebro se ve obligado a recurrir a una asombrosa plasticidad neuronal, reorganizando circuitos originalmente destinados a reconocer formas en el entorno o rastrear huellas animales.

[2] Este prodigioso circuito cerebral no es est\xE1tico ni inmune al entorno en el que se ejerce. Al contrario, se adapta a las caracter\xEDsticas de los soportes dominantes y a los h\xE1bitos de consumo. Cuando leemos en entornos digitales saturados de notificaciones, hiperv\xEDnculos y est\xEDmulos simult\xE1neos, el cerebro lector tiende a adoptar una modalidad de rastreo r\xE1pido o "escaneo en F". Esta estrategia resulta extraordinariamente eficiente para localizar datos concretos en grandes vol\xFAmenes de informaci\xF3n, pero penaliza severamente los procesos de lectura profunda.

[3] La lectura profunda abarca operaciones cognitivas complejas: la inferencia inductiva y deductiva, el razonamiento anal\xF3gico, el discernimiento cr\xEDtico y, sobre todo, la empat\xEDa hacia perspectivas ajenas. Cuando un lector se sumerge pacientemente en un texto denso, activa \xE1reas cerebrales vinculadas a la experiencia sensorial directa y a la introspecci\xF3n moral. Si reducimos nuestro tiempo de inmersi\xF3n sostenida, estos circuitos pierden densidad sin\xE1ptica, debilitando nuestra capacidad de sostener argumentos extensos y sopesar matices discursivos.

[4] Preservar un cerebro bi-alfabetizado \u2014uno capaz de alternar con soltura entre la velocidad anal\xEDtica del entorno digital y la pausada hondura de la lectura inmersiva\u2014 constituye uno de los mayores desaf\xEDos c\xEDvicos de nuestro siglo.`
  },
  {
    id: "txt_eclipse_monterroso",
    title: "El eclipse y la mirada del conquistador",
    author: "Augusto Monterroso (an\xE1lisis cr\xEDtico)",
    source: "Obras completas y otros cuentos / Fray Bartolom\xE9 Arrazola",
    type: "narrativo",
    difficulty: "medio",
    status: "en_revision",
    created_at: "2026-03-12T15:00:00.000Z",
    updated_at: "2026-03-12T17:45:00.000Z",
    content: `[1] Cuando fray Bartolom\xE9 Arrazola se sinti\xF3 perdido en la selva de Guatemala, acept\xF3 que ya nada podr\xEDa salvarlo. La selva poderosa de Guatemala lo hab\xEDa apresado, implacable y definitiva. Ante su ignorancia topogr\xE1fica, se sent\xF3 con tranquilidad a esperar la muerte. Quiso morir all\xED, sin ninguna esperanza, aislado, con el pensamiento fijo en la lejana Espa\xF1a, particularmente en el convento de los Coronados, donde Carlos Quinto condescendiera una vez a bajar de su eminencia para decirle que confiaba en el celo religioso de su labor redentora.

[2] Al despertar se encontr\xF3 rodeado por un grupo de ind\xEDgenas de rostro impasible que se dispon\xEDan a sacrificarlo sobre un altar que a Bartolom\xE9 le pareci\xF3 como el lecho en que descansar\xEDa, al fin, de sus temores, de su destino, de s\xED mismo. Tres a\xF1os de residencia en el pa\xEDs le hab\xEDan conferido un mediano dominio de las lenguas nativas. Intent\xF3 algo. Dijo algunas palabras que fueron comprendidas.

[3] Entonces floreci\xF3 en \xE9l una idea que tuvo por digna de su talento y de su cultura universal y de su arduo conocimiento de Arist\xF3teles. Record\xF3 que para ese d\xEDa se esperaba un eclipse total de sol. Y dispuso, en lo \xEDntimo, valerse de aquel conocimiento para enga\xF1ar a sus opresores y salvar la vida.
\u2014Si me mat\xE1is \u2014les dijo\u2014, puedo hacer que el sol se oscurezca en su altura.

[4] Los ind\xEDgenas lo miraron fijamente y Bartolom\xE9 sorprendi\xF3 la incredulidad en sus ojos. Vio que se produjo una peque\xF1a reuni\xF3n, y aguard\xF3 confiado, no sin cierto desd\xE9n. Dos horas despu\xE9s el coraz\xF3n de fray Bartolom\xE9 Arrazola chorreaba su sangre vehemente sobre la piedra de los sacrificios, mientras uno de los ind\xEDgenas recitaba sin ninguna inflexi\xF3n de voz, sin prisa, una por una, las infinitas fechas en que se producir\xEDan eclipses solares y lunares, que los astr\xF3nomos de la comunidad maya hab\xEDan previsto y anotado en sus c\xF3dices sin la valiosa ayuda de Arist\xF3teles.`
  }
];
var INITIAL_QUESTIONS = [
  // Preguntas para el Texto 1: "La inteligencia artificial y el oficio de pensar"
  {
    id: "q_ia_1",
    text_id: "txt_ia_pensar",
    order_index: 1,
    prompt: "Seg\xFAn el p\xE1rrafo [1], \xBFcu\xE1l es la preocupaci\xF3n inmediata manifestada por docentes ante las herramientas de inteligencia artificial?",
    skill: "localizar",
    options: {
      A: "Que las m\xE1quinas sustituyan la necesidad de profesores en las aulas escolares.",
      B: "Que los estudiantes resuelvan tareas habituales de redacci\xF3n en cuesti\xF3n de segundos.",
      C: "Que se vuelva imposible distinguir el lenguaje humano de las secuencias num\xE9ricas.",
      D: "Que las instituciones educativas deban gastar excesivos recursos en detectores de software."
    },
    correct_option: "B",
    explanation: 'En el p\xE1rrafo [1], el texto se\xF1ala textualmente que los docentes observan con inquietud "c\xF3mo las tareas tradicionales \u2014el ensayo argumentativo, la s\xEDntesis monogr\xE1fica o el comentario cr\xEDtico de textos\u2014 pueden ser resueltas en cuesti\xF3n de segundos por algoritmos". Por lo tanto, la opci\xF3n B reproduce la informaci\xF3n expl\xEDcita solicitada.',
    distractor_explanations: {
      A: "Distractor incorrecto: El texto no afirma que las m\xE1quinas sustituir\xE1n a los docentes, sino que cuestiona la resoluci\xF3n r\xE1pida de tareas.",
      C: "Distractor incorrecto: Es una generalizaci\xF3n exagerada que no aparece expresada en el primer p\xE1rrafo.",
      D: "Distractor incorrecto: Aunque se mencionan detectores de software, el texto los califica de paliativo superficial frente al dilema real, no el foco de la alarma docente inicial."
    },
    points: 1
  },
  {
    id: "q_ia_2",
    text_id: "txt_ia_pensar",
    order_index: 2,
    prompt: "A partir de lo expresado en el p\xE1rrafo [2], \xBFqu\xE9 diferencia fundamental establece el autor entre un algoritmo de lenguaje y un sujeto humano que reflexiona?",
    skill: "interpretar_relacionar",
    options: {
      A: "El grado de correcci\xF3n gramatical alcanzado al estructurar periodos oracionales extensos.",
      B: "La rapidez con que se cotejan hip\xF3tesis discursivas en la tradici\xF3n filos\xF3fica cl\xE1sica.",
      C: "El compromiso \xE9tico con la verdad y la disposici\xF3n a asumir la responsabilidad discursiva.",
      D: "La cantidad de memoria l\xE9xica acumulada para responder a dilemas hermen\xE9uticos contempor\xE1neos."
    },
    correct_option: "C",
    explanation: 'En el p\xE1rrafo [2], el autor explicita que pensar no es ensamblaje de palabras, sino confrontaci\xF3n con la incertidumbre, donde el hablante humano "se sit\xFAa \xE9ticamente ante un interlocutor y sostiene una pretensi\xF3n de verdad o verosimilitud que ninguna m\xE1quina puede experimentar ni garantizar". La opci\xF3n C sintetiza con precisi\xF3n este n\xFAcleo interpretativo.',
    distractor_explanations: {
      A: "Distractor incorrecto: El autor reconoce que las m\xE1quinas s\xED logran correcci\xF3n sint\xE1ctica y coherencia gramatical; no es esa su carencia.",
      B: "Distractor incorrecto: La rapidez es una ventaja de la m\xE1quina, no el factor humano diferenciador.",
      D: "Distractor incorrecto: La memoria de almacenamiento de datos favorece a los modelos masivos, no al l\xEDmite reflexivo humano."
    },
    points: 1
  },
  {
    id: "q_ia_3",
    text_id: "txt_ia_pensar",
    order_index: 3,
    prompt: "\xBFCu\xE1l es la funci\xF3n discursiva del p\xE1rrafo [3] en el conjunto de la argumentaci\xF3n?",
    skill: "interpretar_relacionar",
    options: {
      A: "Explicar los mecanismos algor\xEDtmicos mediante los cuales un prompt procesa instrucciones de usuario.",
      B: "Adelantar una objeci\xF3n al uso pedag\xF3gico de computadores para justificar una sanci\xF3n disciplinaria.",
      C: "Demostrar que la prisa estudiantil es la causa primaria de los fracasos de la formaci\xF3n ciudadana.",
      D: "Evidenciar la consecuencia perjudicial de delegar la escritura: eludir la tensi\xF3n cognitiva formadora del criterio."
    },
    correct_option: "D",
    explanation: 'El p\xE1rrafo [3] conecta l\xF3gicamente con el anterior para advertir que delegar la escritura hace que el estudiante renuncie al "conflicto cognitivo en el cual se fragua el criterio ciudadano". La opci\xF3n D describe fielmente esta funci\xF3n de articulaci\xF3n del da\xF1o pedag\xF3gico.',
    distractor_explanations: {
      A: "Distractor incorrecto: El p\xE1rrafo no describe la t\xE9cnica inform\xE1tica de los prompts, sino sus consecuencias humanas.",
      B: "Distractor incorrecto: El texto no promueve sanciones disciplinarias, como se aclara expresamente en el p\xE1rrafo final.",
      C: 'Distractor incorrecto: Atribuir el problema simplemente a la "prisa estudiantil" simplifica y desv\xEDa la tesis estructural del autor.'
    },
    points: 1
  },
  {
    id: "q_ia_4",
    text_id: "txt_ia_pensar",
    order_index: 4,
    prompt: "A partir de la lectura integral del texto, \xBFcu\xE1l es el prop\xF3sito comunicativo central del emisor?",
    skill: "evaluar",
    options: {
      A: "Proponer que la ense\xF1anza escolar revalorice la deliberaci\xF3n cr\xEDtica frente al espejismo de la inmediatez t\xE9cnica.",
      B: "Exigir al Ministerio de Educaci\xF3n la prohibici\xF3n terminante de herramientas digitales en evaluaciones escritas.",
      C: "Demostrar la superioridad de la filosof\xEDa plat\xF3nica frente a las tecnolog\xEDas comunicativas de \xFAltima generaci\xF3n.",
      D: "Advertir que las escuelas deben capacitar a sus profesores en la detecci\xF3n automatizada de plagios digitales."
    },
    correct_option: "A",
    explanation: "Al evaluar globalmente la postura del autor (especialmente en los p\xE1rrafos 3 y 4), se constata que no busca prohibir ni fascinarse ciegamente, sino instar a las aulas a fortalecer la interrogaci\xF3n, la lectura lenta y el criterio ciudadano frente al peligro de creer que producir texto r\xE1pido es sin\xF3nimo de comprensi\xF3n.",
    distractor_explanations: {
      B: 'Distractor incorrecto: En el p\xE1rrafo 4 rechaza expl\xEDcitamente "la vana prohibici\xF3n prohibitiva".',
      C: "Distractor incorrecto: Plat\xF3n es citado solo como referencia hist\xF3rica del di\xE1logo dial\xE9ctico, no para entronizar una escuela sobre otra.",
      D: "Distractor incorrecto: El p\xE1rrafo 1 rechaza reducir la discusi\xF3n al combate del plagio."
    },
    points: 1
  },
  // Preguntas para el Texto 2: "El cerebro lector"
  {
    id: "q_cer_1",
    text_id: "txt_cerebro_lector",
    order_index: 1,
    prompt: "Seg\xFAn el p\xE1rrafo [1], \xBFpor qu\xE9 la lectura requiri\xF3 de la plasticidad cerebral para desarrollarse en la especie humana?",
    skill: "localizar",
    options: {
      A: "Porque no cont\xE1bamos con \xE1reas sensoriales capaces de discernir tonalidades y contrastes luminosos.",
      B: "Porque carecemos de una programaci\xF3n biol\xF3gica hereditaria espec\xEDfica destinada a decodificar s\xEDmbolos escritos.",
      C: "Porque los primeros alfabetos se dise\xF1aron imitando la trayectoria de animales salvajes en peligro de extinci\xF3n.",
      D: "Porque el lenguaje oral se desarroll\xF3 despu\xE9s de las primeras manifestaciones rupestres prehist\xF3ricas."
    },
    correct_option: "B",
    explanation: 'El p\xE1rrafo [1] afirma que "los seres humanos nunca nacimos programados biol\xF3gicamente para leer", a diferencia de la visi\xF3n o el habla oral, por lo que el cerebro debi\xF3 reciclar circuitos mediante plasticidad neuronal.',
    distractor_explanations: {
      A: "Distractor incorrecto: El texto afirma que precisamente reutilizamos circuitos visuales que ya exist\xEDan.",
      C: "Distractor incorrecto: Confunde la menci\xF3n del rastreo animal con el dise\xF1o de alfabetos.",
      D: "Distractor incorrecto: Contradice la afirmaci\xF3n de que el lenguaje oral tiene millones de a\xF1os de evoluci\xF3n gen\xE9tica previa."
    },
    points: 1
  },
  {
    id: "q_cer_2",
    text_id: "txt_cerebro_lector",
    order_index: 2,
    prompt: '\xBFQu\xE9 relaci\xF3n se establece en el p\xE1rrafo [2] entre la lectura digital y el denominado "escaneo en F"?',
    skill: "interpretar_relacionar",
    options: {
      A: "El escaneo en F es una anomal\xEDa visual provocada por el brillo excesivo de pantallas retroiluminadas.",
      B: "El escaneo en F potencia simult\xE1neamente la empat\xEDa emocional y la agilidad de c\xE1lculo num\xE9rico.",
      C: "El escaneo en F es una pauta adaptativa veloz para rastrear datos que sacrifica la hondura reflexiva.",
      D: "El escaneo en F constituye el m\xE9todo de lectura predilecto para descifrar ensayos de alta complejidad filos\xF3fica."
    },
    correct_option: "C",
    explanation: 'El texto explica que en soportes digitales el cerebro opta por el escaneo en F, el cual es "extraordinariamente eficiente para localizar datos concretos", pero "penaliza severamente los procesos de lectura profunda".',
    distractor_explanations: {
      A: "Distractor incorrecto: No es una patolog\xEDa m\xE9dica \xF3ptica, sino una modalidad cognitiva de rastreo.",
      B: "Distractor incorrecto: El p\xE1rrafo 3 se\xF1ala que la empat\xEDa pertenece a la lectura profunda, la cual es debilitada por este escaneo.",
      D: "Distractor incorrecto: El texto aclara que perjudica los textos densos y argumentativos."
    },
    points: 1
  },
  {
    id: "q_cer_3",
    text_id: "txt_cerebro_lector",
    order_index: 3,
    prompt: "\xBFQu\xE9 se infiere respecto al desarrollo de la empat\xEDa a partir de lo expuesto en el p\xE1rrafo [3]?",
    skill: "interpretar_relacionar",
    options: {
      A: "Que requiere de un procesamiento cognitivo inmersivo que se debilita si solo consumimos fragmentos breves.",
      B: "Que es un rasgo innato que no experimenta ninguna variaci\xF3n ante los cambios de soporte t\xE9cnico.",
      C: "Que solo puede cultivarse a trav\xE9s del lenguaje oral espont\xE1neo en la primera infancia.",
      D: "Que impide el desarrollo de capacidades anal\xEDticas abstractas en lectores universitarios."
    },
    correct_option: "A",
    explanation: 'El texto relaciona la empat\xEDa con la lectura profunda inmersiva ("activa \xE1reas cerebrales vinculadas a la experiencia sensorial directa y a la introspecci\xF3n moral"), advirtiendo que al reducir el tiempo inmersivo estos circuitos pierden densidad sin\xE1ptica.',
    distractor_explanations: {
      B: "Distractor incorrecto: El texto demuestra precisamente que el circuito neuronal lector se reconfigura y debilita seg\xFAn el medio.",
      C: "Distractor incorrecto: El autor vincula la introspecci\xF3n con la lectura paciente y sostenida.",
      D: "Distractor incorrecto: Empat\xEDa y an\xE1lisis reflexivo van de la mano en la lectura profunda seg\xFAn el texto."
    },
    points: 1
  },
  {
    id: "q_cer_4",
    text_id: "txt_cerebro_lector",
    order_index: 4,
    prompt: "\xBFQu\xE9 actitud manifiesta la autora frente a la convivencia entre la tecnolog\xEDa digital y la lectura tradicional en el cierre del texto?",
    skill: "evaluar",
    options: {
      A: "Tecn\xF3foba: promueve la eliminaci\xF3n radical de pantallas en la formaci\xF3n de los futuros ciudadanos.",
      B: "Equilibrada e integradora: aboga por preservar simult\xE1neamente la rapidez digital y la hondura inmersiva.",
      C: "Resignada: considera inevitable la desaparici\xF3n de la comprensi\xF3n lectora en las nuevas generaciones.",
      D: "Conformista: estima que el escaneo r\xE1pido sustituye ventajosamente a los antiguos formatos impresos."
    },
    correct_option: "B",
    explanation: 'En el p\xE1rrafo [4], la autora define como meta crucial un "cerebro bi-alfabetizado", capaz de combinar ambas dimensiones (la velocidad anal\xEDtica digital y la reposada hondura de la inmersi\xF3n), postura que denota equilibrio e integraci\xF3n pedag\xF3gica.',
    distractor_explanations: {
      A: "Distractor incorrecto: No pide prescindir de lo digital; alaba tambi\xE9n su velocidad anal\xEDtica.",
      C: "Distractor incorrecto: El tono es de desaf\xEDo c\xEDvico propositivo, no de derrota fatalista.",
      D: "Distractor incorrecto: Advierte con gravedad de las p\xE9rdidas cognitivas si no se cuida la inmersi\xF3n."
    },
    points: 1
  },
  // Preguntas para el Texto 3: "El eclipse de Monterroso"
  {
    id: "q_ecl_1",
    text_id: "txt_eclipse_monterroso",
    order_index: 1,
    prompt: "\xBFPor qu\xE9 fray Bartolom\xE9 Arrazola crey\xF3 que pod\xEDa enga\xF1ar a los ind\xEDgenas mayas con el fen\xF3meno del eclipse?",
    skill: "localizar",
    options: {
      A: "Porque hab\xEDa sido instruido formalmente en astronom\xEDa mesoamericana por el emperador Carlos Quinto.",
      B: "Porque confiaba en la supuesta superioridad de su cultura europea y en sus lecturas de Arist\xF3teles.",
      C: "Porque los ind\xEDgenas le confesaron expl\xEDcitamente su terror a la oscuridad del cosmos.",
      D: "Porque dominaba a la perfecci\xF3n todos los dialectos nativos de Centroam\xE9rica."
    },
    correct_option: "B",
    explanation: 'En el p\xE1rrafo [3], el narrador explicita que en el fraile "floreci\xF3 en \xE9l una idea que tuvo por digna de su talento y de su cultura universal y de su arduo conocimiento de Arist\xF3teles". Esta soberbia euroc\xE9ntrica lo lleva a concebir el enga\xF1o.',
    distractor_explanations: {
      A: "Distractor incorrecto: Carlos Quinto le encomend\xF3 una misi\xF3n religiosa de redenci\xF3n, no astron\xF3mica.",
      C: "Distractor incorrecto: Los rostros ind\xEDgenas eran impasibles y luego miraron con incredulidad.",
      D: 'Distractor incorrecto: El texto aclara que pose\xEDa solo un "mediano dominio" de las lenguas nativas.'
    },
    points: 1
  },
  {
    id: "q_ecl_2",
    text_id: "txt_eclipse_monterroso",
    order_index: 2,
    prompt: "\xBFCu\xE1l es el sentido ir\xF3nico fundamental que encierra el desenlace del relato?",
    skill: "interpretar_relacionar",
    options: {
      A: "Que fray Bartolom\xE9 fue salvado en el \xFAltimo instante por una tormenta imprevista en la selva.",
      B: "Que los mayas conoc\xEDan con exactitud matem\xE1tica las fechas de los eclipses sin necesitar la ciencia europea.",
      C: "Que el convento de los Coronados envi\xF3 una expedici\xF3n de rescate cuando ya era demasiado tarde.",
      D: "Que Arist\xF3teles hab\xEDa escrito un tratado astron\xF3mico que contradec\xEDa los c\xF3dices prehisp\xE1nicos."
    },
    correct_option: "B",
    explanation: "La iron\xEDa reside en el contraste entre el desd\xE9n del fraile, que cre\xEDa poseer una ventaja cognitiva insuperable gracias a la tradici\xF3n aristot\xE9lica, y la realidad del sacerdote maya recitando pacientemente las infinitas fechas registradas en sus propios c\xF3dices.",
    distractor_explanations: {
      A: "Distractor incorrecto: El fraile es sacrificado en la piedra, no se produce ning\xFAn rescate milagroso.",
      C: "Distractor incorrecto: El convento nunca interviene en la selva.",
      D: "Distractor incorrecto: Arist\xF3teles es invocado como emblema del saber europeo cl\xE1sico, no por un texto contradictorio espec\xEDfico."
    },
    points: 1
  },
  {
    id: "q_ecl_3",
    text_id: "txt_eclipse_monterroso",
    order_index: 3,
    prompt: "Al evaluar la caracterizaci\xF3n de fray Bartolom\xE9 en el relato, \xBFqu\xE9 rasgo describe con mayor precisi\xF3n su visi\xF3n de mundo?",
    skill: "evaluar",
    options: {
      A: "Un paternalismo etnoc\xE9ntrico que subestim\xF3 el conocimiento de la civilizaci\xF3n sometida.",
      B: "Un esp\xEDritu cient\xEDfico de avanzada incomprendido por las jerarqu\xEDas eclesi\xE1sticas de su tiempo.",
      C: "Una cobard\xEDa patol\xF3gica que lo incapacitaba para asumir las dificultades de la vida misionera.",
      D: "Un sincretismo cultural que buscaba armonizar las deidades mayas con la teolog\xEDa cristiana."
    },
    correct_option: "A",
    explanation: 'El fraile encarna la mirada colonial: mira con "cierto desd\xE9n" a sus captores y asume de antemano que la ignorancia de los nativos le permitir\xE1 manipularlos con un fen\xF3meno que su propia civilizaci\xF3n consideraba monopolio ilustrado.',
    distractor_explanations: {
      B: "Distractor incorrecto: Su conducta no es de investigaci\xF3n cient\xEDfica, sino de supervivencia basada en el prejuicio.",
      C: "Distractor incorrecto: El inicio del texto muestra que acept\xF3 con tranquilidad la muerte inicial.",
      D: "Distractor incorrecto: No hay sincretismo; concibe a los nativos como inferiores a enga\xF1ar."
    },
    points: 1
  }
];
var INITIAL_ASSIGNMENTS = [
  {
    id: "asig_1",
    title: "Taller Formativo: IA y el Oficio de Pensar",
    text_id: "txt_ia_pensar",
    text_title: "La inteligencia artificial y el oficio de pensar",
    text_type: "columna_opinion",
    course_ids: ["iv_medio_a", "iv_medio_b"],
    mode: "formativo",
    status: "activa",
    due_date: "2026-04-30T23:59:59.000Z",
    max_attempts: 2,
    created_at: "2026-03-15T08:00:00.000Z",
    question_count: 4
  },
  {
    id: "asig_2",
    title: "Control Sumativo N\xB01: El Cerebro Lector",
    text_id: "txt_cerebro_lector",
    text_title: "El cerebro lector: neurociencia y comprensi\xF3n profunda",
    text_type: "expositivo",
    course_ids: ["iv_medio_a"],
    mode: "evaluacion",
    status: "activa",
    due_date: "2026-05-15T23:59:59.000Z",
    max_attempts: 1,
    created_at: "2026-03-20T08:00:00.000Z",
    question_count: 4
  }
];
function generateInitialAttempts(students) {
  const attempts = [];
  const studentsIVA = students.filter((s) => s.course_id === "iv_medio_a");
  const studentsIVB = students.filter((s) => s.course_id === "iv_medio_b");
  studentsIVA.slice(0, 30).forEach((st, idx) => {
    const q1Correct = idx % 10 !== 0;
    const q2Correct = idx % 4 !== 0;
    const q3Correct = idx % 2 === 0;
    const q4Correct = idx % 5 !== 0;
    const score = (q1Correct ? 1 : 0) + (q2Correct ? 1 : 0) + (q3Correct ? 1 : 0) + (q4Correct ? 1 : 0);
    const pct = Math.round(score / 4 * 100);
    const paesScore = Math.round(150 + score / 4 * 750 + idx % 30);
    attempts.push({
      id: `att_1_a_${idx + 1}`,
      assignment_id: "asig_1",
      student_id: st.id,
      student_name: st.name,
      student_rut: st.rut,
      course_id: "iv_medio_a",
      course_name: "IV\xB0 Medio A",
      attempt_number: 1,
      status: "completed",
      started_at: "2026-03-18T14:10:00.000Z",
      completed_at: "2026-03-18T14:28:00.000Z",
      score,
      total_points: 4,
      percentage: pct,
      paes_estimated_score: paesScore,
      answers: {
        q_ia_1: {
          question_id: "q_ia_1",
          selected_option: q1Correct ? "B" : "A",
          is_correct: q1Correct,
          points_earned: q1Correct ? 1 : 0,
          answered_at: "2026-03-18T14:14:00.000Z"
        },
        q_ia_2: {
          question_id: "q_ia_2",
          selected_option: q2Correct ? "C" : "A",
          is_correct: q2Correct,
          points_earned: q2Correct ? 1 : 0,
          answered_at: "2026-03-18T14:18:00.000Z"
        },
        q_ia_3: {
          question_id: "q_ia_3",
          selected_option: q3Correct ? "D" : "B",
          is_correct: q3Correct,
          points_earned: q3Correct ? 1 : 0,
          answered_at: "2026-03-18T14:22:00.000Z"
        },
        q_ia_4: {
          question_id: "q_ia_4",
          selected_option: q4Correct ? "A" : "C",
          is_correct: q4Correct,
          points_earned: q4Correct ? 1 : 0,
          answered_at: "2026-03-18T14:27:00.000Z"
        }
      }
    });
  });
  studentsIVB.slice(0, 26).forEach((st, idx) => {
    const q1Correct = idx % 8 !== 0;
    const q2Correct = idx % 3 !== 0;
    const q3Correct = idx % 3 === 0;
    const q4Correct = idx % 4 !== 0;
    const score = (q1Correct ? 1 : 0) + (q2Correct ? 1 : 0) + (q3Correct ? 1 : 0) + (q4Correct ? 1 : 0);
    const pct = Math.round(score / 4 * 100);
    const paesScore = Math.round(150 + score / 4 * 750 + idx % 25);
    attempts.push({
      id: `att_1_b_${idx + 1}`,
      assignment_id: "asig_1",
      student_id: st.id,
      student_name: st.name,
      student_rut: st.rut,
      course_id: "iv_medio_b",
      course_name: "IV\xB0 Medio B",
      attempt_number: 1,
      status: "completed",
      started_at: "2026-03-19T10:15:00.000Z",
      completed_at: "2026-03-19T10:35:00.000Z",
      score,
      total_points: 4,
      percentage: pct,
      paes_estimated_score: paesScore,
      answers: {
        q_ia_1: {
          question_id: "q_ia_1",
          selected_option: q1Correct ? "B" : "C",
          is_correct: q1Correct,
          points_earned: q1Correct ? 1 : 0,
          answered_at: "2026-03-19T10:18:00.000Z"
        },
        q_ia_2: {
          question_id: "q_ia_2",
          selected_option: q2Correct ? "C" : "D",
          is_correct: q2Correct,
          points_earned: q2Correct ? 1 : 0,
          answered_at: "2026-03-19T10:23:00.000Z"
        },
        q_ia_3: {
          question_id: "q_ia_3",
          selected_option: q3Correct ? "D" : "C",
          is_correct: q3Correct,
          points_earned: q3Correct ? 1 : 0,
          answered_at: "2026-03-19T10:29:00.000Z"
        },
        q_ia_4: {
          question_id: "q_ia_4",
          selected_option: q4Correct ? "A" : "B",
          is_correct: q4Correct,
          points_earned: q4Correct ? 1 : 0,
          answered_at: "2026-03-19T10:34:00.000Z"
        }
      }
    });
  });
  return attempts;
}

// server/db.ts
var DATA_DIR = process.env.VERCEL ? path.resolve("/tmp", "paes-data") : path.resolve(process.cwd(), "data");
var DB_FILE = path.join(DATA_DIR, "database.json");
var LOCAL_SEED_FILE = path.join(path.resolve(process.cwd(), "data"), "database.json");
var DatabaseStore = class {
  constructor() {
    this.data = this.loadOrInit();
  }
  loadOrInit() {
    if (!fs.existsSync(DATA_DIR)) {
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      } catch (err) {
        console.warn("Could not create DATA_DIR:", err);
      }
    }
    if (process.env.VERCEL && !fs.existsSync(DB_FILE) && fs.existsSync(LOCAL_SEED_FILE)) {
      try {
        fs.copyFileSync(LOCAL_SEED_FILE, DB_FILE);
      } catch (err) {
        console.warn("Could not copy seed file to /tmp:", err);
      }
    }
    if (fs.existsSync(DB_FILE)) {
      try {
        const content = fs.readFileSync(DB_FILE, "utf-8");
        const parsed = JSON.parse(content);
        let modified = false;
        let teacher = parsed.users.find((u) => u.id === "doc_1" || u.role === "docente");
        if (!teacher) {
          teacher = { ...INITIAL_TEACHER };
          parsed.users.unshift(teacher);
          modified = true;
        } else {
          teacher.name = "Prof. Rodrigo Lara Flores";
          teacher.email = "rodrigolaraflores4@gmail.com";
          teacher.rut = "17.784.722-4";
          teacher.password = "PAES2026";
          teacher.role = "docente";
          modified = true;
        }
        const beforeCount = parsed.users.length;
        parsed.users = parsed.users.filter((u) => {
          if (u.role === "docente" || u.id === "doc_1") return true;
          if (u.id.startsWith("est_a_") || u.id.startsWith("est_b_") || u.rut === "21.0.0-K") return false;
          return true;
        });
        if (parsed.users.length !== beforeCount) {
          const validUserIds = new Set(parsed.users.map((u) => u.id));
          parsed.attempts = parsed.attempts.filter((a) => validUserIds.has(a.student_id));
          modified = true;
        }
        parsed.users.forEach((u) => {
          if (!u.password) {
            u.password = "PAES2026";
            modified = true;
          }
        });
        parsed.assignments.forEach((a) => {
          if (a.is_global !== true) {
            a.is_global = true;
            modified = true;
          }
        });
        parsed.courses.forEach((c) => {
          c.student_count = parsed.users.filter((u) => u.role === "estudiante" && u.course_id === c.id).length;
        });
        if (modified) {
          this.persist(parsed);
        }
        return parsed;
      } catch (err) {
        console.error("Error reading database file, re-initializing seed data:", err);
      }
    }
    const students = generateInitialStudents();
    const attempts = generateInitialAttempts(students);
    const initialData = {
      users: [INITIAL_TEACHER, ...students],
      courses: INITIAL_COURSES,
      texts: INITIAL_TEXTS,
      questions: INITIAL_QUESTIONS,
      assignments: INITIAL_ASSIGNMENTS,
      attempts,
      currentUserId: INITIAL_TEACHER.id,
      supabaseConfig: {
        url: process.env.VITE_SUPABASE_URL || "",
        anonKey: process.env.VITE_SUPABASE_ANON_KEY || "",
        isConnected: false
      }
    };
    this.persist(initialData);
    return initialData;
  }
  persist(data) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const tempFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), "utf-8");
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      console.error("Failed to persist database:", err);
    }
  }
  save() {
    this.persist(this.data);
  }
  // --- Auth & Users ---
  getCurrentUser() {
    if (!this.data.currentUserId) return null;
    const user = this.data.users.find((u) => u.id === this.data.currentUserId);
    return user || null;
  }
  setCurrentUser(userId) {
    const user = this.data.users.find((u) => u.id === userId);
    if (user) {
      this.data.currentUserId = user.id;
      this.save();
      return user;
    }
    return null;
  }
  authenticateUser(identifier, password) {
    if (!password || !password.trim()) {
      return null;
    }
    const norm = identifier.trim().toLowerCase();
    const cleanRut = norm.replace(/[^0-9k]/g, "");
    const isTeacherMatch = norm === "rodrigolaraflores4@gmail.com" || norm === "rodrigo.lara@colegio.cl" || cleanRut === "177847224" || cleanRut === "17784722-4" || cleanRut === "17784722";
    if (isTeacherMatch) {
      const p = password.trim();
      if (p === "PAES2026" || p === "paes2026" || p === INITIAL_TEACHER.password) {
        let teacher = this.data.users.find((u) => u.id === "doc_1" || u.role === "docente");
        if (!teacher) {
          teacher = { ...INITIAL_TEACHER };
          this.data.users.unshift(teacher);
          this.save();
        }
        return teacher;
      }
      return null;
    }
    const user = this.data.users.find((u) => {
      if (u.email.toLowerCase() === norm) return true;
      if (u.rut) {
        const uCleanRut = u.rut.toLowerCase().replace(/[^0-9k]/g, "");
        if (uCleanRut === cleanRut && cleanRut.length >= 7) return true;
      }
      return false;
    });
    if (!user) return null;
    const validPass = user.password || "PAES2026";
    if (password.trim() !== validPass && password.trim() !== "PAES2026" && password.trim() !== "paes2026") {
      return null;
    }
    return user;
  }
  logoutUser() {
  }
  getUsers(role, courseId) {
    return this.data.users.filter((u) => {
      if (role && u.role !== role) return false;
      if (courseId && u.course_id !== courseId) return false;
      return true;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }
  getUserById(id) {
    return this.data.users.find((u) => u.id === id);
  }
  getUserByEmail(email) {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }
  getUserByRut(rut) {
    const cleanRut = rut.toLowerCase().replace(/[^0-9k]/g, "");
    return this.data.users.find((u) => {
      if (!u.rut) return false;
      return u.rut.toLowerCase().replace(/[^0-9k]/g, "") === cleanRut;
    });
  }
  createUser(user) {
    const newUser = {
      ...user,
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }
  updateUserPassword(userId, newPassword) {
    const user = this.data.users.find((u) => u.id === userId);
    if (!user) return false;
    user.password = newPassword;
    this.save();
    return true;
  }
  importStudents(newStudents) {
    let count = 0;
    for (const item of newStudents) {
      const existing = this.data.users.find((u) => u.email.toLowerCase() === item.email.toLowerCase());
      if (!existing) {
        this.data.users.push({
          id: `est_imp_${Date.now()}_${count}`,
          name: item.name.trim(),
          email: item.email.trim(),
          rut: item.rut?.trim(),
          role: "estudiante",
          course_id: item.course_id
        });
        count++;
      }
    }
    this.save();
    return count;
  }
  deleteStudent(userId) {
    const user = this.data.users.find((u) => u.id === userId);
    if (!user) return { success: false, message: "Estudiante no encontrado." };
    if (user.role === "docente") return { success: false, message: "No se puede eliminar la cuenta docente administradora." };
    this.data.users = this.data.users.filter((u) => u.id !== userId);
    this.data.attempts = this.data.attempts.filter((a) => a.student_id !== userId);
    this.save();
    return { success: true, message: `Estudiante ${user.name} eliminado correctamente.` };
  }
  clearStudents(mode = "demo") {
    let studentsToRemove = [];
    if (mode === "demo") {
      studentsToRemove = this.data.users.filter(
        (u) => u.role === "estudiante" && (u.email.includes("@colegio-demo.cl") || u.id.startsWith("est_0") || u.id.startsWith("est_demo"))
      );
      if (studentsToRemove.length === 0) {
        studentsToRemove = this.data.users.filter((u) => u.role === "estudiante");
      }
    } else {
      studentsToRemove = this.data.users.filter((u) => u.role === "estudiante");
    }
    const removeIds = new Set(studentsToRemove.map((s) => s.id));
    this.data.users = this.data.users.filter((u) => !removeIds.has(u.id));
    this.data.attempts = this.data.attempts.filter((a) => !removeIds.has(a.student_id));
    this.save();
    return {
      success: true,
      count: studentsToRemove.length,
      message: `Se eliminaron ${studentsToRemove.length} estudiantes ${mode === "demo" ? "de prueba" : "de la n\xF3mina"}. La n\xF3mina est\xE1 lista para registrar los estudiantes reales.`
    };
  }
  restoreDemoStudents() {
    const demoStudents = generateInitialStudents();
    let addedCount = 0;
    for (const st of demoStudents) {
      if (!this.data.users.some((u) => u.email.toLowerCase() === st.email.toLowerCase())) {
        this.data.users.push(st);
        addedCount++;
      }
    }
    const demoAttempts = generateInitialAttempts(demoStudents);
    for (const att of demoAttempts) {
      if (!this.data.attempts.some((a) => a.id === att.id)) {
        this.data.attempts.push(att);
      }
    }
    this.save();
    return { success: true, count: addedCount, message: `Se restauraron ${addedCount} estudiantes ficticios para pruebas pedag\xF3gicas.` };
  }
  getFullBackup() {
    return this.data;
  }
  restoreFullBackup(backupData) {
    if (!backupData || !Array.isArray(backupData.users) || !Array.isArray(backupData.texts)) {
      return { success: false, message: "El archivo de respaldo no tiene el formato v\xE1lido del sistema." };
    }
    this.data = {
      users: backupData.users,
      courses: backupData.courses || this.data.courses,
      texts: backupData.texts,
      questions: backupData.questions || [],
      assignments: backupData.assignments || [],
      attempts: backupData.attempts || [],
      currentUserId: backupData.currentUserId || INITIAL_TEACHER.id,
      supabaseConfig: backupData.supabaseConfig || this.data.supabaseConfig
    };
    this.save();
    return { success: true, message: "Copia de seguridad restaurada exitosamente." };
  }
  // --- Courses ---
  getCourses() {
    return this.data.courses.map((c) => {
      const studentCount = this.data.users.filter((u) => u.role === "estudiante" && u.course_id === c.id).length;
      return {
        ...c,
        student_count: studentCount
      };
    });
  }
  getCourseById(id) {
    return this.data.courses.find((c) => c.id === id);
  }
  // --- Texts ---
  getTexts(filters) {
    return this.data.texts.filter((t) => {
      if (filters?.status && t.status !== filters.status) return false;
      if (filters?.type && t.type !== filters.type) return false;
      if (filters?.difficulty && t.difficulty !== filters.difficulty) return false;
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchAuthor = t.author.toLowerCase().includes(q);
        const matchContent = t.content.toLowerCase().includes(q);
        if (!matchTitle && !matchAuthor && !matchContent) return false;
      }
      return true;
    }).map((t) => {
      const questions = this.data.questions.filter((q) => q.text_id === t.id).sort((a, b) => a.order_index - b.order_index);
      return {
        ...t,
        questions,
        question_count: questions.length
      };
    });
  }
  getTextById(id) {
    const text = this.data.texts.find((t) => t.id === id);
    if (!text) return void 0;
    const questions = this.data.questions.filter((q) => q.text_id === text.id).sort((a, b) => a.order_index - b.order_index);
    return {
      ...text,
      questions,
      question_count: questions.length
    };
  }
  createText(data) {
    const newText = {
      ...data,
      id: `txt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.data.texts.unshift(newText);
    this.save();
    return { ...newText, questions: [], question_count: 0 };
  }
  updateText(id, updates) {
    const idx = this.data.texts.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    this.data.texts[idx] = {
      ...this.data.texts[idx],
      ...updates,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.save();
    return this.getTextById(id) || null;
  }
  deleteText(id) {
    const idx = this.data.texts.findIndex((t) => t.id === id);
    if (idx === -1) return false;
    this.data.texts.splice(idx, 1);
    this.data.questions = this.data.questions.filter((q) => q.text_id !== id);
    this.save();
    return true;
  }
  approveText(id) {
    const text = this.getTextById(id);
    if (!text) return { success: false, message: "Texto no encontrado" };
    const questions = this.data.questions.filter((q) => q.text_id === id);
    if (questions.length === 0) {
      return { success: false, message: "No se puede aprobar un texto sin preguntas. Agrega al menos una pregunta de comprensi\xF3n." };
    }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.prompt?.trim()) {
        return { success: false, message: `La pregunta N\xB0 ${i + 1} no tiene enunciado definido.` };
      }
      if (!q.options.A?.trim() || !q.options.B?.trim() || !q.options.C?.trim() || !q.options.D?.trim()) {
        return { success: false, message: `La pregunta N\xB0 ${i + 1} debe tener completas las 4 alternativas (A, B, C y D).` };
      }
      if (!q.correct_option) {
        return { success: false, message: `La pregunta N\xB0 ${i + 1} debe tener una alternativa correcta asignada.` };
      }
    }
    text.status = "aprobado";
    this.updateText(id, { status: "aprobado" });
    return { success: true, message: "Texto y preguntas aprobados exitosamente para pr\xE1ctica estudiantil", text: this.getTextById(id) };
  }
  // --- Questions ---
  getQuestionsByTextId(textId) {
    return this.data.questions.filter((q) => q.text_id === textId).sort((a, b) => a.order_index - b.order_index);
  }
  getQuestionById(id) {
    return this.data.questions.find((q) => q.id === id);
  }
  addQuestion(data) {
    const textQuestions = this.getQuestionsByTextId(data.text_id);
    const newQuestion = {
      ...data,
      id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      order_index: data.order_index || textQuestions.length + 1
    };
    this.data.questions.push(newQuestion);
    this.save();
    return newQuestion;
  }
  updateQuestion(id, updates) {
    const idx = this.data.questions.findIndex((q) => q.id === id);
    if (idx === -1) return null;
    this.data.questions[idx] = {
      ...this.data.questions[idx],
      ...updates
    };
    this.save();
    return this.data.questions[idx];
  }
  deleteQuestion(id) {
    const idx = this.data.questions.findIndex((q) => q.id === id);
    if (idx === -1) return false;
    const textId = this.data.questions[idx].text_id;
    this.data.questions.splice(idx, 1);
    const remaining = this.data.questions.filter((q) => q.text_id === textId).sort((a, b) => a.order_index - b.order_index);
    remaining.forEach((q, i) => {
      q.order_index = i + 1;
    });
    this.save();
    return true;
  }
  reorderQuestions(textId, orderedIds) {
    orderedIds.forEach((id, index) => {
      const q = this.data.questions.find((item) => item.id === id && item.text_id === textId);
      if (q) {
        q.order_index = index + 1;
      }
    });
    this.save();
    return this.getQuestionsByTextId(textId);
  }
  // --- Assignments ---
  getAssignments(courseId) {
    return this.data.assignments.filter((a) => {
      if (courseId && (!a.course_ids || !a.course_ids.includes(courseId))) return false;
      return true;
    }).map((a) => {
      const text = this.data.texts.find((t) => t.id === a.text_id);
      const questions = this.data.questions.filter((q) => q.text_id === a.text_id);
      return {
        ...a,
        text_title: text?.title || a.text_title || "Texto sin t\xEDtulo",
        text_type: text?.type,
        question_count: questions.length
      };
    });
  }
  getAssignmentById(id) {
    const a = this.data.assignments.find((item) => item.id === id);
    if (!a) return void 0;
    const text = this.data.texts.find((t) => t.id === a.text_id);
    const questions = this.data.questions.filter((q) => q.text_id === a.text_id);
    return {
      ...a,
      text_title: text?.title || a.text_title || "Texto sin t\xEDtulo",
      text_type: text?.type,
      question_count: questions.length
    };
  }
  createAssignment(data) {
    const text = this.data.texts.find((t) => t.id === data.text_id);
    const newAssignment = {
      ...data,
      id: `asig_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      text_title: text?.title || "",
      text_type: text?.type
    };
    this.data.assignments.unshift(newAssignment);
    this.save();
    return newAssignment;
  }
  updateAssignment(id, updates) {
    const idx = this.data.assignments.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    this.data.assignments[idx] = {
      ...this.data.assignments[idx],
      ...updates
    };
    this.save();
    return this.getAssignmentById(id) || null;
  }
  // --- Attempts & Submissions ---
  getAttempts(assignmentId, courseId, studentId) {
    return this.data.attempts.filter((att) => {
      if (assignmentId && att.assignment_id !== assignmentId) return false;
      if (courseId && att.course_id !== courseId) return false;
      if (studentId && att.student_id !== studentId) return false;
      return true;
    });
  }
  getAttemptById(id) {
    return this.data.attempts.find((a) => a.id === id);
  }
  startAttempt(assignmentId, studentId) {
    const assignment = this.getAssignmentById(assignmentId);
    if (!assignment) throw new Error("Actividad no encontrada");
    const text = this.getTextById(assignment.text_id);
    if (!text) throw new Error("Texto de lectura no encontrado");
    const student = this.getUserById(studentId);
    if (!student) throw new Error("Estudiante no encontrado");
    const course = this.getCourseById(student.course_id || "");
    const previousAttempts = this.data.attempts.filter(
      (a) => a.assignment_id === assignmentId && a.student_id === studentId
    );
    const ongoing = previousAttempts.find((a) => a.status === "in_progress");
    if (ongoing) {
      return { attempt: ongoing, assignment, text };
    }
    if (assignment.max_attempts && previousAttempts.length >= assignment.max_attempts) {
      throw new Error(`Has alcanzado el l\xEDmite m\xE1ximo de ${assignment.max_attempts} intento(s) permitido(s) para esta actividad.`);
    }
    const questions = this.getQuestionsByTextId(assignment.text_id);
    const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);
    const newAttempt = {
      id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      assignment_id: assignmentId,
      student_id: studentId,
      student_name: student.name,
      student_rut: student.rut,
      course_id: student.course_id || "",
      course_name: course?.name || "Sin curso",
      attempt_number: previousAttempts.length + 1,
      status: "in_progress",
      started_at: (/* @__PURE__ */ new Date()).toISOString(),
      completed_at: null,
      score: 0,
      total_points: totalPoints,
      percentage: 0,
      paes_estimated_score: 100,
      answers: {}
    };
    this.data.attempts.push(newAttempt);
    this.save();
    return { attempt: newAttempt, assignment, text };
  }
  recordAnswer(attemptId, questionId, selectedOption) {
    const attempt = this.getAttemptById(attemptId);
    if (!attempt) throw new Error("Intento no encontrado");
    if (attempt.status === "completed") throw new Error("Este intento ya ha sido finalizado.");
    const question = this.getQuestionById(questionId);
    if (!question) throw new Error("Pregunta no encontrada");
    const assignment = this.getAssignmentById(attempt.assignment_id);
    const isCorrect = question.correct_option === selectedOption;
    const pointsEarned = isCorrect ? question.points || 1 : 0;
    attempt.answers[questionId] = {
      question_id: questionId,
      selected_option: selectedOption,
      is_correct: isCorrect,
      points_earned: pointsEarned,
      answered_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    let currentScore = 0;
    Object.values(attempt.answers).forEach((ans) => {
      currentScore += ans.points_earned;
    });
    attempt.score = currentScore;
    attempt.percentage = attempt.total_points > 0 ? Math.round(currentScore / attempt.total_points * 100) : 0;
    attempt.paes_estimated_score = Math.round(150 + attempt.percentage / 100 * 850);
    this.save();
    if (assignment?.mode === "formativo") {
      return {
        attempt,
        isCorrect,
        pointsEarned,
        correctOption: question.correct_option,
        explanation: question.explanation,
        distractorExplanation: question.distractor_explanations?.[selectedOption]
      };
    }
    return {
      attempt,
      isCorrect,
      pointsEarned
    };
  }
  finishAttempt(attemptId) {
    const attempt = this.getAttemptById(attemptId);
    if (!attempt) throw new Error("Intento no encontrado");
    let totalScore = 0;
    Object.values(attempt.answers).forEach((ans) => {
      totalScore += ans.points_earned;
    });
    attempt.status = "completed";
    attempt.completed_at = (/* @__PURE__ */ new Date()).toISOString();
    attempt.score = totalScore;
    attempt.percentage = attempt.total_points > 0 ? Math.round(totalScore / attempt.total_points * 100) : 0;
    attempt.paes_estimated_score = Math.round(150 + attempt.percentage / 100 * 850);
    this.save();
    return attempt;
  }
  // --- Analytics Engine ---
  getAnalytics(filters) {
    let attempts = this.data.attempts.filter((a) => a.status === "completed");
    if (filters?.courseId) {
      attempts = attempts.filter((a) => a.course_id === filters.courseId);
    }
    if (filters?.assignmentId) {
      attempts = attempts.filter((a) => a.assignment_id === filters.assignmentId);
    }
    const students = this.data.users.filter((u) => u.role === "estudiante");
    const filteredStudents = filters?.courseId ? students.filter((s) => s.course_id === filters.courseId) : students;
    const totalStudents = filteredStudents.length;
    const participatingStudentIds = new Set(attempts.map((a) => a.student_id));
    const activeStudents = participatingStudentIds.size;
    const participationRate = totalStudents > 0 ? Math.round(activeStudents / totalStudents * 100) : 0;
    const totalScore = attempts.reduce((acc, a) => acc + a.percentage, 0);
    const overallAverage = attempts.length > 0 ? Math.round(totalScore / attempts.length) : 0;
    const studentStats = students.map((st) => {
      const studentAttempts = attempts.filter((a) => a.student_id === st.id);
      const count = studentAttempts.length;
      const totalScore2 = studentAttempts.reduce((acc, a) => acc + a.percentage, 0);
      const avg = count > 0 ? Math.round(totalScore2 / count) : 0;
      const paes = count > 0 ? Math.round(150 + avg / 100 * 850) : 150;
      const latestDate = count > 0 ? studentAttempts[studentAttempts.length - 1].completed_at || void 0 : void 0;
      return {
        studentId: st.id,
        studentName: st.name,
        studentRut: st.rut,
        studentEmail: st.email,
        totalAttempts: count,
        averageScore: avg,
        paesEstimated: paes,
        latestAttemptDate: latestDate
      };
    }).sort((a, b) => a.studentName.localeCompare(b.studentName));
    const skillStats = {
      localizar: { total: 0, correct: 0, label: "Localizar" },
      interpretar_relacionar: { total: 0, correct: 0, label: "Interpretar y relacionar" },
      evaluar: { total: 0, correct: 0, label: "Evaluar" }
    };
    const questionStats = {};
    attempts.forEach((attempt) => {
      Object.entries(attempt.answers).forEach(([qId, ans]) => {
        const question = this.getQuestionById(qId);
        if (question && skillStats[question.skill]) {
          skillStats[question.skill].total++;
          if (ans.is_correct) {
            skillStats[question.skill].correct++;
          }
          if (!questionStats[qId]) {
            questionStats[qId] = { total: 0, errors: 0, question };
          }
          questionStats[qId].total++;
          if (!ans.is_correct) {
            questionStats[qId].errors++;
          }
        }
      });
    });
    const skillsBreakdown = ["localizar", "interpretar_relacionar", "evaluar"].map((skill) => {
      const item = skillStats[skill];
      const accuracy = item.total > 0 ? Math.round(item.correct / item.total * 100) : 0;
      return {
        skill,
        label: item.label,
        totalQuestions: item.total,
        correctAnswers: item.correct,
        accuracy
      };
    });
    const criticalQuestions = Object.values(questionStats).map((item) => {
      const text = this.data.texts.find((t) => t.id === item.question.text_id);
      const errorRate = item.total > 0 ? Math.round(item.errors / item.total * 100) : 0;
      return {
        questionId: item.question.id,
        textTitle: text?.title || "Texto",
        prompt: item.question.prompt,
        skill: item.question.skill,
        correctOption: item.question.correct_option,
        errorRate,
        totalAnswers: item.total
      };
    }).filter((q) => q.totalAnswers >= 3).sort((a, b) => b.errorRate - a.errorRate).slice(0, 5);
    return {
      totalStudents,
      activeStudents,
      totalAttempts: attempts.length,
      overallAverage,
      participationRate,
      studentStats,
      skillsBreakdown,
      criticalQuestions
    };
  }
  // --- Export CSV for Chilean Schools ---
  generateCsvExport(filters) {
    let attempts = this.data.attempts.filter((a) => a.status === "completed");
    if (filters?.courseId) {
      attempts = attempts.filter((a) => a.course_id === filters.courseId);
    }
    if (filters?.assignmentId) {
      attempts = attempts.filter((a) => a.assignment_id === filters.assignmentId);
    }
    const headers = [
      "ID Intento",
      "Estudiante",
      "RUT",
      "Curso",
      "Actividad",
      "Puntaje Obtenido",
      "Puntaje Total",
      "Porcentaje Logro (%)",
      "Puntaje Estimado PAES",
      "N\xB0 Intento",
      "Fecha Inicio",
      "Fecha Finalizaci\xF3n"
    ];
    const rows = attempts.map((att) => {
      const asig = this.getAssignmentById(att.assignment_id);
      return [
        `"${att.id}"`,
        `"${att.student_name || "Estudiante"}"`,
        `"${att.student_rut || ""}"`,
        `"${att.course_name || ""}"`,
        `"${asig?.title || ""}"`,
        att.score,
        att.total_points,
        att.percentage,
        att.paes_estimated_score,
        att.attempt_number,
        `"${att.started_at ? new Date(att.started_at).toLocaleString("es-CL") : ""}"`,
        `"${att.completed_at ? new Date(att.completed_at).toLocaleString("es-CL") : ""}"`
      ].join(";");
    });
    return "\uFEFF" + [headers.join(";"), ...rows].join("\r\n");
  }
  // --- Supabase Config & Status ---
  getSupabaseStatus() {
    return {
      configured: Boolean(this.data.supabaseConfig?.url && this.data.supabaseConfig?.anonKey),
      url: this.data.supabaseConfig?.url || "",
      anonKey: this.data.supabaseConfig?.anonKey ? "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" + this.data.supabaseConfig.anonKey.slice(-6) : "",
      isConnected: this.data.supabaseConfig?.isConnected || false,
      lastTested: this.data.supabaseConfig?.lastTested
    };
  }
  updateSupabaseConfig(url, anonKey) {
    this.data.supabaseConfig = {
      url: url.trim(),
      anonKey: anonKey.trim(),
      isConnected: Boolean(url.trim() && anonKey.trim()),
      lastTested: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.save();
    return this.getSupabaseStatus();
  }
  // --- Adaptive Learning & Student Profiling Engine ---
  getStudentAdaptiveProfile(studentId) {
    const student = this.getUserById(studentId) || this.data.users[0];
    const completedAttempts = this.data.attempts.filter(
      (a) => a.student_id === studentId && a.status === "completed"
    );
    const skillsMap = {
      localizar: { total: 0, correct: 0, label: "Localizar" },
      interpretar_relacionar: { total: 0, correct: 0, label: "Interpretar y relacionar" },
      evaluar: { total: 0, correct: 0, label: "Evaluar" }
    };
    let totalScoreSum = 0;
    completedAttempts.forEach((att) => {
      totalScoreSum += att.percentage;
      Object.entries(att.answers).forEach(([qId, ans]) => {
        const question = this.getQuestionById(qId);
        if (question && skillsMap[question.skill]) {
          skillsMap[question.skill].total++;
          if (ans.is_correct) {
            skillsMap[question.skill].correct++;
          }
        }
      });
    });
    const totalEnsayos = completedAttempts.length;
    const avgScorePct = totalEnsayos > 0 ? Math.round(totalScoreSum / totalEnsayos) : 0;
    const latestPaes = totalEnsayos > 0 ? completedAttempts[completedAttempts.length - 1].paes_estimated_score : 150;
    const skillsMastery = {
      localizar: {
        skill: "localizar",
        label: "Localizar",
        totalAnswered: skillsMap.localizar.total,
        correctAnswers: skillsMap.localizar.correct,
        accuracyPct: skillsMap.localizar.total > 0 ? Math.round(skillsMap.localizar.correct / skillsMap.localizar.total * 100) : 0,
        status: skillsMap.localizar.total === 0 ? "sin_datos" : skillsMap.localizar.correct / skillsMap.localizar.total >= 0.8 ? "consolidado" : skillsMap.localizar.correct / skillsMap.localizar.total >= 0.6 ? "en_progreso" : "por_reforzar"
      },
      interpretar_relacionar: {
        skill: "interpretar_relacionar",
        label: "Interpretar y relacionar",
        totalAnswered: skillsMap.interpretar_relacionar.total,
        correctAnswers: skillsMap.interpretar_relacionar.correct,
        accuracyPct: skillsMap.interpretar_relacionar.total > 0 ? Math.round(skillsMap.interpretar_relacionar.correct / skillsMap.interpretar_relacionar.total * 100) : 0,
        status: skillsMap.interpretar_relacionar.total === 0 ? "sin_datos" : skillsMap.interpretar_relacionar.correct / skillsMap.interpretar_relacionar.total >= 0.8 ? "consolidado" : skillsMap.interpretar_relacionar.correct / skillsMap.interpretar_relacionar.total >= 0.6 ? "en_progreso" : "por_reforzar"
      },
      evaluar: {
        skill: "evaluar",
        label: "Evaluar",
        totalAnswered: skillsMap.evaluar.total,
        correctAnswers: skillsMap.evaluar.correct,
        accuracyPct: skillsMap.evaluar.total > 0 ? Math.round(skillsMap.evaluar.correct / skillsMap.evaluar.total * 100) : 0,
        status: skillsMap.evaluar.total === 0 ? "sin_datos" : skillsMap.evaluar.correct / skillsMap.evaluar.total >= 0.8 ? "consolidado" : skillsMap.evaluar.correct / skillsMap.evaluar.total >= 0.6 ? "en_progreso" : "por_reforzar"
      }
    };
    let recommendation;
    if (totalEnsayos === 0) {
      recommendation = {
        status: "diagnostico_requerido",
        title: "Ensayo Diagn\xF3stico Inicial Sugerido",
        message: "A\xFAn no registras ensayos completados. Te recomendamos realizar tu primer ensayo para calibrar con precisi\xF3n tu nivel de entrada en las tres habilidades DEMRE.",
        evidence: "No existen registros de intentos evaluativos en este perfil.",
        primarySkill: null,
        actionLabel: "Realizar Primer Ensayo",
        suggestedActionType: "iniciar_ensayo"
      };
    } else {
      const rankedSkills = ["interpretar_relacionar", "localizar", "evaluar"].map((s) => skillsMastery[s]).filter((m) => m.totalAnswered > 0).sort((a, b) => a.accuracyPct - b.accuracyPct);
      const lowest = rankedSkills[0];
      if (lowest && lowest.accuracyPct < 65) {
        recommendation = {
          status: "reforzamiento_prioritario",
          title: `Reforzamiento Prioritario: ${lowest.label}`,
          message: `En tus ensayos recientes, tu mayor oportunidad de incremento de puntaje est\xE1 en ${lowest.label}. Te sugerimos practicar con retroalimentaci\xF3n paso a paso para consolidar este proceso cognitivo.`,
          evidence: `Logro en ${lowest.label}: ${lowest.accuracyPct}% (${lowest.correctAnswers}/${lowest.totalAnswered} aciertos).`,
          primarySkill: lowest.skill,
          skillLabel: lowest.label,
          actionLabel: `Ejercitar ${lowest.label}`,
          suggestedActionType: "practicar_habilidad"
        };
      } else if (rankedSkills.some((s) => s.status === "en_progreso")) {
        const inProgressSkill = rankedSkills.find((s) => s.status === "en_progreso") || rankedSkills[0];
        recommendation = {
          status: "progreso_adecuado",
          title: `Consolidaci\xF3n de Competencias: ${inProgressSkill.label}`,
          message: `Mantienes un rendimiento s\xF3lido (${avgScorePct}% de logro general). Te recomendamos ejercitar preguntas de nivel medio y avanzado en ${inProgressSkill.label} para afianzar tu dominio.`,
          evidence: `Rendimiento global: ${avgScorePct}%. Habilidad a consolidar: ${inProgressSkill.label} (${inProgressSkill.accuracyPct}%).`,
          primarySkill: inProgressSkill.skill,
          skillLabel: inProgressSkill.label,
          actionLabel: `Profundizar en ${inProgressSkill.label}`,
          suggestedActionType: "practicar_habilidad"
        };
      } else {
        recommendation = {
          status: "avanzado",
          title: "Dominio Destacado en Comprensi\xF3n Lectora",
          message: "Tus respuestas reflejan un alto nivel de precisi\xF3n en las tres habilidades DEMRE. Es el momento ideal para resolver un nuevo ensayo simulado con control de tiempo.",
          evidence: `Promedio de logro sobresaliente (${avgScorePct}%), con todas las habilidades sobre el 80%.`,
          primarySkill: null,
          actionLabel: "Realizar Nuevo Ensayo",
          suggestedActionType: "iniciar_ensayo"
        };
      }
    }
    return {
      studentId,
      studentName: student.name,
      totalEnsayosCompleted: totalEnsayos,
      averageScorePct: avgScorePct,
      latestPaesEstimated: latestPaes,
      skillsMastery,
      recommendation
    };
  }
  getLearningModules(studentId) {
    const profile = this.getStudentAdaptiveProfile(studentId);
    const approvedTexts = this.getTexts({ status: "aprobado" });
    const assignments = this.getAssignments();
    const defs = {
      localizar: {
        label: "Localizar",
        desc: "Identificaci\xF3n directa de informaci\xF3n expl\xEDcita, datos literales y marcas del texto.",
        demre: "Exige rastrear e identificar hechos, datos, nombres, fechas o ideas expresadas de manera expl\xEDcita en el est\xEDmulo."
      },
      interpretar_relacionar: {
        label: "Interpretar y relacionar",
        desc: "Construcci\xF3n de significado global: inferencias fundamentadas, s\xEDntesis y conexiones.",
        demre: "Exige establecer relaciones entre distintas partes del texto, inferir tesis o sentidos impl\xEDcitos y determinar la funci\xF3n o tono del emisor."
      },
      evaluar: {
        label: "Evaluar",
        desc: "Juicio reflexivo sobre pertinencia, recursos discursivos, solidez y prop\xF3sito.",
        demre: "Exige emitir juicios cr\xEDticos acerca de la forma y contenido del texto, valorando la posici\xF3n del emisor y la validez de los argumentos."
      }
    };
    return ["localizar", "interpretar_relacionar", "evaluar"].map((skill) => {
      const mastery = profile.skillsMastery[skill];
      const relevantTexts = approvedTexts.filter((t) => (t.questions || []).some((q) => q.skill === skill)).map((t) => {
        const matchingQuestions = (t.questions || []).filter((q) => q.skill === skill);
        const asig = assignments.find((a) => a.text_id === t.id && a.status === "activa");
        return {
          id: t.id,
          title: t.title,
          type: t.type,
          difficulty: t.difficulty,
          questionCount: matchingQuestions.length,
          assignmentId: asig?.id
        };
      });
      return {
        skill,
        label: defs[skill].label,
        description: defs[skill].desc,
        demreDefinition: defs[skill].demre,
        sampleQuestionsCount: relevantTexts.reduce((acc, t) => acc + t.questionCount, 0),
        studentAccuracy: mastery.accuracyPct,
        studentStatus: mastery.status,
        recommendedTexts: relevantTexts
      };
    });
  }
};
var db = new DatabaseStore();

// server/app.ts
var app = express();
app.use(express.json());
function getAuthUser(req) {
  const headerUserId = req.headers["x-user-id"] || "";
  if (headerUserId) {
    const user = db.getUserById(headerUserId);
    if (user) return user;
  }
  return db.getCurrentUser();
}
var apiRouter = express.Router();
apiRouter.get("/auth/current-user", (req, res) => {
  const user = getAuthUser(req);
  res.json({ user });
});
apiRouter.post("/auth/switch-user", (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }
  const user = db.getUserById(userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  db.setCurrentUser(userId);
  res.json({ user });
});
apiRouter.post("/auth/login", (req, res) => {
  const { identifier, email, password } = req.body;
  const loginInput = identifier || email;
  if (!loginInput) {
    return res.status(400).json({ error: "Debes ingresar tu correo electr\xF3nico o RUT chileno." });
  }
  const user = db.authenticateUser(loginInput, password);
  if (!user) {
    return res.status(401).json({ error: "Credenciales inv\xE1lidas. Revisa tu RUT/correo y contrase\xF1a." });
  }
  res.json({ user });
});
apiRouter.post("/auth/logout", (req, res) => {
  db.logoutUser();
  res.json({ success: true });
});
apiRouter.post("/auth/change-password", (req, res) => {
  const currentUser = getAuthUser(req);
  if (!currentUser) {
    return res.status(401).json({ error: "Debes iniciar sesi\xF3n para realizar esta acci\xF3n." });
  }
  const { currentPassword, newPassword, targetUserId } = req.body;
  if (!newPassword || typeof newPassword !== "string" || newPassword.trim().length < 4) {
    return res.status(400).json({ error: "La nueva contrase\xF1a debe tener al menos 4 caracteres." });
  }
  if (targetUserId && targetUserId !== currentUser.id) {
    if (currentUser.role !== "docente") {
      return res.status(403).json({ error: "Solo los docentes pueden restablecer contrase\xF1as de otros usuarios." });
    }
    const targetUser = db.getUserById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ error: "Estudiante no encontrado." });
    }
    const success2 = db.updateUserPassword(targetUserId, newPassword.trim());
    if (!success2) {
      return res.status(500).json({ error: "Error al actualizar la contrase\xF1a." });
    }
    return res.json({
      success: true,
      message: `Contrase\xF1a de ${targetUser.name} actualizada correctamente a "${newPassword.trim()}".`
    });
  }
  const currentExpected = currentUser.password || "PAES2026";
  if (currentPassword && currentPassword.trim() !== currentExpected && currentPassword.trim() !== "PAES2026") {
    return res.status(400).json({ error: "La contrase\xF1a actual no es correcta." });
  }
  const success = db.updateUserPassword(currentUser.id, newPassword.trim());
  if (!success) {
    return res.status(500).json({ error: "Error al actualizar la contrase\xF1a." });
  }
  const updatedUser = db.getUserById(currentUser.id);
  res.json({
    success: true,
    message: "Contrase\xF1a actualizada correctamente.",
    user: updatedUser
  });
});
apiRouter.get("/courses", (req, res) => {
  const courses = db.getCourses();
  res.json({ courses });
});
apiRouter.get("/students", (req, res) => {
  const courseId = req.query.courseId;
  const students = db.getUsers("estudiante", courseId);
  res.json({ students });
});
apiRouter.post("/students", (req, res) => {
  const currentUser = getAuthUser(req);
  if (!currentUser || currentUser.role !== "docente") {
    return res.status(403).json({ error: "Solo los docentes pueden matricular nuevos estudiantes." });
  }
  const { name, email, rut, course_id, password } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "El nombre y el correo electr\xF3nico son obligatorios." });
  }
  if (db.getUserByEmail(email)) {
    return res.status(400).json({ error: "Ya existe un usuario registrado con este correo." });
  }
  if (rut && db.getUserByRut(rut)) {
    return res.status(400).json({ error: "Ya existe un estudiante registrado con este RUT." });
  }
  const student = db.createUser({
    name: name.trim(),
    email: email.trim(),
    rut: rut ? rut.trim() : void 0,
    role: "estudiante",
    password: password ? password.trim() : "PAES2026",
    course_id: course_id || "iv_medio_a"
  });
  res.status(201).json({ student });
});
apiRouter.post("/students/import-csv", (req, res) => {
  const currentUser = getAuthUser(req);
  if (!currentUser || currentUser.role !== "docente") {
    return res.status(403).json({ error: "Solo los docentes pueden importar n\xF3minas." });
  }
  const { csvText, defaultCourseId } = req.body;
  if (!csvText || typeof csvText !== "string") {
    return res.status(400).json({ error: "El contenido del archivo CSV es obligatorio." });
  }
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length <= 1) {
    return res.status(400).json({ error: "El archivo CSV debe contener al menos un encabezado y una fila de datos." });
  }
  const header = lines[0].toLowerCase();
  const sep = header.includes(";") ? ";" : header.includes("	") ? "	" : ",";
  const headers = lines[0].split(sep).map((h) => h.trim().toLowerCase());
  const nameIdx = headers.findIndex((h) => h.includes("nombre") || h.includes("name") || h.includes("alumno") || h.includes("estudiante"));
  const emailIdx = headers.findIndex((h) => h.includes("email") || h.includes("correo"));
  const rutIdx = headers.findIndex((h) => h.includes("rut") || h.includes("identificacion"));
  const courseIdx = headers.findIndex((h) => h.includes("curso") || h.includes("course"));
  if (nameIdx === -1 && emailIdx === -1) {
    return res.status(400).json({ error: 'No se encontraron columnas de "Nombre" ni "Email" en el encabezado.' });
  }
  const toImport = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(sep).map((c) => c.trim().replace(/^"|"$/g, ""));
    if (cols.length === 0 || !cols.some((c) => c.length > 0)) continue;
    const name = nameIdx !== -1 ? cols[nameIdx] : `Estudiante ${i}`;
    let email = emailIdx !== -1 ? cols[emailIdx] : "";
    const rut = rutIdx !== -1 ? cols[rutIdx] : void 0;
    const course = courseIdx !== -1 && cols[courseIdx] ? cols[courseIdx] : defaultCourseId || "iv_medio_a";
    if (!email && name) {
      email = `${name.toLowerCase().replace(/\s+/g, ".")}${i}@estudiantes.cl`;
    }
    if (name && email) {
      toImport.push({
        name,
        email,
        rut,
        course_id: course
      });
    }
  }
  const importedCount = db.importStudents(toImport);
  res.json({
    success: true,
    totalParsed: toImport.length,
    importedCount,
    message: `Se importaron ${importedCount} estudiantes exitosamente.`
  });
});
apiRouter.delete("/students/:id", (req, res) => {
  const currentUser = getAuthUser(req);
  if (!currentUser || currentUser.role !== "docente") {
    return res.status(403).json({ error: "Solo los docentes pueden eliminar estudiantes." });
  }
  const result = db.deleteStudent(req.params.id);
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }
  res.json(result);
});
apiRouter.post("/students/clear-demo", (req, res) => {
  const currentUser = getAuthUser(req);
  if (!currentUser || currentUser.role !== "docente") {
    return res.status(403).json({ error: "Solo los docentes pueden realizar esta acci\xF3n." });
  }
  const result = db.clearStudents("demo");
  res.json(result);
});
apiRouter.post("/students/clear-all", (req, res) => {
  const currentUser = getAuthUser(req);
  if (!currentUser || currentUser.role !== "docente") {
    return res.status(403).json({ error: "Solo los docentes pueden realizar esta acci\xF3n." });
  }
  const result = db.clearStudents("all");
  res.json(result);
});
apiRouter.post("/students/restore-demo", (req, res) => {
  const currentUser = getAuthUser(req);
  if (!currentUser || currentUser.role !== "docente") {
    return res.status(403).json({ error: "Solo los docentes pueden realizar esta acci\xF3n." });
  }
  const result = db.restoreDemoStudents();
  res.json(result);
});
apiRouter.get("/texts", (req, res) => {
  const type = req.query.type;
  const difficulty = req.query.difficulty;
  const status = req.query.status;
  const search = req.query.search;
  const texts = db.getTexts({ type, difficulty, status, search });
  res.json({ texts });
});
apiRouter.get("/texts/:id", (req, res) => {
  const text = db.getTextById(req.params.id);
  if (!text) {
    return res.status(404).json({ error: "Texto no encontrado" });
  }
  res.json({ text });
});
apiRouter.post("/texts", (req, res) => {
  const currentUser = getAuthUser(req);
  if (!currentUser || currentUser.role !== "docente") {
    return res.status(403).json({ error: "Solo los docentes pueden crear textos." });
  }
  const { title, author, source, content, type, difficulty, status } = req.body;
  if (!title || !content || !type || !difficulty) {
    return res.status(400).json({ error: "title, content, type y difficulty son obligatorios" });
  }
  const text = db.createText({
    title,
    author: author || "",
    source: source || "",
    content,
    type,
    difficulty,
    status: status || "borrador"
  });
  res.status(201).json({ text });
});
apiRouter.put("/texts/:id", (req, res) => {
  const currentUser = getAuthUser(req);
  if (!currentUser || currentUser.role !== "docente") {
    return res.status(403).json({ error: "Solo los docentes pueden editar textos." });
  }
  const text = db.updateText(req.params.id, req.body);
  if (!text) {
    return res.status(404).json({ error: "Texto no encontrado" });
  }
  res.json({ text });
});
apiRouter.delete("/texts/:id", (req, res) => {
  const currentUser = getAuthUser(req);
  if (!currentUser || currentUser.role !== "docente") {
    return res.status(403).json({ error: "Solo los docentes pueden eliminar textos." });
  }
  const success = db.deleteText(req.params.id);
  if (!success) {
    return res.status(404).json({ error: "Texto no encontrado" });
  }
  res.json({ success: true });
});
apiRouter.get("/texts/:textId/questions", (req, res) => {
  const questions = db.getQuestionsByTextId(req.params.textId);
  res.json({ questions });
});
apiRouter.post("/texts/:textId/questions", (req, res) => {
  const currentUser = getAuthUser(req);
  if (!currentUser || currentUser.role !== "docente") {
    return res.status(403).json({ error: "Solo los docentes pueden crear preguntas." });
  }
  const text = db.getTextById(req.params.textId);
  if (!text) {
    return res.status(404).json({ error: "Texto asociado no encontrado" });
  }
  const { prompt, skill, options, correct_option, explanation, distractor_explanations, points } = req.body;
  if (!prompt || !skill || !options || !correct_option || !explanation) {
    return res.status(400).json({ error: "Todos los campos obligatorios de la pregunta deben estar presentes" });
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
    points: points || 1
  });
  res.status(201).json({ question });
});
apiRouter.put("/questions/:id", (req, res) => {
  const currentUser = getAuthUser(req);
  if (!currentUser || currentUser.role !== "docente") {
    return res.status(403).json({ error: "Solo los docentes pueden editar preguntas." });
  }
  const question = db.updateQuestion(req.params.id, req.body);
  if (!question) {
    return res.status(404).json({ error: "Pregunta no encontrada" });
  }
  res.json({ question });
});
apiRouter.delete("/questions/:id", (req, res) => {
  const currentUser = getAuthUser(req);
  if (!currentUser || currentUser.role !== "docente") {
    return res.status(403).json({ error: "Solo los docentes pueden eliminar preguntas." });
  }
  const success = db.deleteQuestion(req.params.id);
  if (!success) {
    return res.status(404).json({ error: "Pregunta no encontrada" });
  }
  res.json({ success: true });
});
apiRouter.get("/assignments", (req, res) => {
  const currentUser = getAuthUser(req);
  const courseId = req.query.courseId;
  const status = req.query.status;
  let assignments = db.getAssignments(courseId);
  if (currentUser && currentUser.role === "estudiante") {
    assignments = assignments.filter((a) => a.status === "activa");
  }
  res.json({ assignments });
});
apiRouter.get("/assignments/:id", (req, res) => {
  const assignment = db.getAssignmentById(req.params.id);
  if (!assignment) {
    return res.status(404).json({ error: "Asignaci\xF3n no encontrada" });
  }
  res.json({ assignment });
});
apiRouter.post("/assignments", (req, res) => {
  const currentUser = getAuthUser(req);
  if (!currentUser || currentUser.role !== "docente") {
    return res.status(403).json({ error: "Solo los docentes pueden crear asignaciones." });
  }
  const { title, text_id, course_ids, mode, due_date, max_attempts } = req.body;
  if (!title || !text_id || !course_ids || !mode) {
    return res.status(400).json({ error: "title, text_id, course_ids y mode son obligatorios" });
  }
  const assignment = db.createAssignment({
    title,
    text_id,
    course_ids,
    mode,
    due_date,
    max_attempts: max_attempts || 1,
    status: "activa"
  });
  res.status(201).json({ assignment });
});
apiRouter.put("/assignments/:id", (req, res) => {
  const currentUser = getAuthUser(req);
  if (!currentUser || currentUser.role !== "docente") {
    return res.status(403).json({ error: "Solo los docentes pueden editar asignaciones." });
  }
  const assignment = db.updateAssignment(req.params.id, req.body);
  if (!assignment) {
    return res.status(404).json({ error: "Asignaci\xF3n no encontrada" });
  }
  res.json({ assignment });
});
apiRouter.get("/attempts", (req, res) => {
  const currentUser = getAuthUser(req);
  const assignmentId = req.query.assignmentId;
  const courseId = req.query.courseId;
  let studentId = req.query.studentId;
  if (currentUser && currentUser.role === "estudiante") {
    studentId = currentUser.id;
  }
  const attempts = db.getAttempts(assignmentId, courseId, studentId);
  res.json({ attempts });
});
apiRouter.post("/attempts/start", (req, res) => {
  const currentUser = getAuthUser(req);
  if (!currentUser) {
    return res.status(401).json({ error: "Debes iniciar sesi\xF3n para comenzar una evaluaci\xF3n." });
  }
  const { assignment_id } = req.body;
  if (!assignment_id) {
    return res.status(400).json({ error: "assignment_id es obligatorio" });
  }
  try {
    const { attempt, assignment, text } = db.startAttempt(assignment_id, currentUser.id);
    const questions = assignment ? db.getQuestionsByTextId(assignment.text_id) : [];
    if (!text) {
      return res.status(404).json({ error: "Texto asociado no encontrado" });
    }
    const isFormative = assignment?.mode === "formativo";
    const sanitizedQuestions = questions.map((q) => {
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
        type: text.type
      },
      questions: sanitizedQuestions
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
apiRouter.post("/attempts/:attemptId/answer", (req, res) => {
  const { attemptId } = req.params;
  const { questionId, selectedOption } = req.body;
  if (!questionId || !selectedOption) {
    return res.status(400).json({ error: "questionId y selectedOption son obligatorios." });
  }
  try {
    const result = db.recordAnswer(attemptId, questionId, selectedOption);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
apiRouter.post("/attempts/:attemptId/finish", (req, res) => {
  const { attemptId } = req.params;
  try {
    const attempt = db.finishAttempt(attemptId);
    const assignment = db.getAssignmentById(attempt.assignment_id);
    const questions = assignment ? db.getQuestionsByTextId(assignment.text_id) : [];
    const skillStats = {
      localizar: { total: 0, correct: 0 },
      interpretar_relacionar: { total: 0, correct: 0 },
      evaluar: { total: 0, correct: 0 }
    };
    questions.forEach((q) => {
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
      skillStats
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
apiRouter.get("/attempts/:attemptId", (req, res) => {
  const attempt = db.getAttemptById(req.params.attemptId);
  if (!attempt) {
    return res.status(404).json({ error: "Intento no encontrado" });
  }
  const assignment = db.getAssignmentById(attempt.assignment_id);
  const text = assignment ? db.getTextById(assignment.text_id) : void 0;
  const questions = assignment ? db.getQuestionsByTextId(assignment.text_id) : [];
  res.json({
    attempt,
    assignment,
    text,
    questions
  });
});
apiRouter.get("/student/my-results", (req, res) => {
  const currentUser = getAuthUser(req);
  if (!currentUser) {
    return res.status(401).json({ error: "No autenticado" });
  }
  const attempts = db.getAttempts(void 0, void 0, currentUser.id).filter((a) => a.status === "completed").sort((a, b) => new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime());
  const results = attempts.map((att) => {
    const assignment = db.getAssignmentById(att.assignment_id);
    return {
      ...att,
      assignment_title: assignment?.title || "Actividad",
      text_title: assignment?.text_title || "Texto",
      mode: assignment?.mode
    };
  });
  res.json({ results });
});
apiRouter.get("/student/adaptive-profile", (req, res) => {
  const currentUser = getAuthUser(req);
  if (!currentUser) {
    return res.status(401).json({ error: "No autenticado" });
  }
  const profile = db.getStudentAdaptiveProfile(currentUser.id);
  res.json({ profile });
});
apiRouter.get("/student/learning-modules", (req, res) => {
  const currentUser = getAuthUser(req);
  if (!currentUser) {
    return res.status(401).json({ error: "No autenticado" });
  }
  const modules = db.getLearningModules(currentUser.id);
  res.json({ modules });
});
apiRouter.get("/analytics", (req, res) => {
  const courseId = req.query.courseId;
  const assignmentId = req.query.assignmentId;
  const analytics = db.getAnalytics({ courseId, assignmentId });
  res.json({ analytics });
});
apiRouter.get("/export/csv", (req, res) => {
  const courseId = req.query.courseId;
  const assignmentId = req.query.assignmentId;
  const csv = db.generateCsvExport({ courseId, assignmentId });
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="paes_lector_resultados_${Date.now()}.csv"`);
  res.send(csv);
});
apiRouter.get("/backup/export", (req, res) => {
  const currentUser = getAuthUser(req);
  if (!currentUser || currentUser.role !== "docente") {
    return res.status(403).json({ error: "Solo los docentes pueden descargar copias de seguridad completas." });
  }
  const backup = db.getFullBackup();
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Disposition", `attachment; filename="paes_lector_respaldo_${Date.now()}.json"`);
  res.send(JSON.stringify(backup, null, 2));
});
apiRouter.post("/backup/restore", (req, res) => {
  const currentUser = getAuthUser(req);
  if (!currentUser || currentUser.role !== "docente") {
    return res.status(403).json({ error: "Solo los docentes pueden restaurar copias de seguridad." });
  }
  const { data } = req.body;
  if (!data) {
    return res.status(400).json({ error: "Datos de respaldo vac\xEDos." });
  }
  const result = db.restoreFullBackup(data);
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }
  res.json(result);
});
apiRouter.get("/supabase/status", (req, res) => {
  const status = db.getSupabaseStatus();
  res.json({ status });
});
apiRouter.post("/supabase/config", (req, res) => {
  const { url, anonKey } = req.body;
  if (!url || !anonKey) {
    return res.status(400).json({ error: "La URL y la Anon Key de Supabase son obligatorias." });
  }
  const updated = db.updateSupabaseConfig(url, anonKey);
  res.json({ status: updated, message: "Configuraci\xF3n de Supabase actualizada exitosamente." });
});
apiRouter.get("/supabase/schema", (req, res) => {
  const schemaPath = path2.resolve(process.cwd(), "supabase-schema.sql");
  if (fs2.existsSync(schemaPath)) {
    const sql = fs2.readFileSync(schemaPath, "utf-8");
    res.json({ sql });
  } else {
    res.status(404).json({ error: "Schema file not found" });
  }
});
app.use("/api", apiRouter);
app.use("/", apiRouter);
var app_default = app;
export {
  app_default as default
};
