import { VocabExercise } from '../types/index.js';

export const INITIAL_VOCAB_EXERCISES: VocabExercise[] = [
  {
    id: 'voc_1',
    target_word: 'TACITURNO',
    context_sentence: 'El viejo guardián permanecía TACITURNO junto al muelle, contemplando las aguas oscuras sin pronunciar palabra alguna ante los pescadores.',
    full_passage: 'Durante los meses de invierno, el puerto quedaba desierto tras la partida de las últimas naves. El viejo guardián permanecía TACITURNO junto al muelle, contemplando las aguas oscuras sin pronunciar palabra alguna ante los pescadores que intentaban entablar conversación.',
    source: 'Crónica Austral / Adaptación Literaria PAES',
    category: 'literario',
    difficulty: 'inicial',
    options: {
      A: {
        synonym: 'SILENCIOSO',
        justification: 'porque se destaca su actitud reservada y la ausencia de comunicación verbal.',
      },
      B: {
        synonym: 'TRISTE',
        justification: 'porque contempla las aguas oscuras con un dejo de profunda amargura personal.',
      },
      C: {
        synonym: 'SOLITARIO',
        justification: 'porque nadie lo acompaña en la caseta de vigilancia durante el invierno.',
      },
      D: {
        synonym: 'AGOTADO',
        justification: 'porque el peso de los años le impide responder con agilidad a los pescadores.',
      },
    },
    correct_option: 'A',
    explanation: 'En el contexto, "taciturno" alude a la persona callada, silenciosa o poco propensa a hablar. El texto confirma expresamente que "no pronunciaba palabra alguna". Aunque pueda inferirse soledad o nostalgia, el rasgo esencial descrito es el silencio comunicativo.',
    nuance_tip: 'Distinguir entre el estado anímico (tristeza) y la conducta comunicativa observable (silencio/reserva). En la PAES, el sentido literal contextual prima sobre la conjetura psicológica.',
  },
  {
    id: 'voc_2',
    target_word: 'SOSLAYAR',
    context_sentence: 'El panel de expertos intentó SOSLAYAR la controversia ética de la inteligencia artificial, centrándose exclusivamente en sus ventajas comerciales.',
    full_passage: 'A lo largo del simposio de tecnología, los expositores elogiaron la rapidez de procesamiento algorítmico. Sin embargo, el panel de expertos intentó SOSLAYAR la controversia ética de la inteligencia artificial, centrándose exclusivamente en sus ventajas comerciales y eludiendo las preguntas del público.',
    source: 'Ensayo sobre Tecnologías Emergentes',
    category: 'academico',
    difficulty: 'medio',
    options: {
      A: {
        synonym: 'DISCUTIR',
        justification: 'porque abordan los dilemas bioéticos con argumentos comerciales.',
      },
      B: {
        synonym: 'ELUDIR',
        justification: 'porque los expositores evitaron afrontar directamente el problema ético.',
      },
      C: {
        synonym: 'IGNORAR',
        justification: 'porque desconocían por completo las implicancias morales de los algoritmos.',
      },
      D: {
        synonym: 'RESOLVER',
        justification: 'porque zanjaron la disputa técnica dando paso a la sesión de preguntas.',
      },
    },
    correct_option: 'B',
    explanation: '"Soslayar" significa esquivar, pasar por alto o sortear intencionalmente una dificultad. El fragmento indica que prefirieron enfocarse en lo comercial para evitar o esquivar la polémica ética.',
    nuance_tip: 'Soslayar no es no saber (ignorar), sino decidir activamente no enfrentar una situación espinosa o conflictiva.',
  },
  {
    id: 'voc_3',
    target_word: 'VEHEMENTE',
    context_sentence: 'La oradora pronunció una VEHEMENTE defensa de los humedales urbanos, conmoviendo a los asistentes por la fuerza de sus convicciones.',
    full_passage: 'Frente a las presiones del desarrollo inmobiliario, la comunidad se congregó en el frontis del municipio. La oradora pronunció una VEHEMENTE defensa de los humedales urbanos, conmoviendo a los asistentes por la fuerza de sus convicciones y el tono apasionado de su reclamo.',
    source: 'Crónica Ambiental Ciudadana',
    category: 'periodistico',
    difficulty: 'inicial',
    options: {
      A: {
        synonym: 'AGRESIVA',
        justification: 'porque increpó con hostilidad a las autoridades municipales presentes.',
      },
      B: {
        synonym: 'APASIONADA',
        justification: 'porque expresó sus ideas con intenso fervor, energía emocional y convicción.',
      },
      C: {
        synonym: 'EXTENSA',
        justification: 'porque enumeró detalladamente la historia ecológica de toda la cuenca.',
      },
      D: {
        synonym: 'IMPROVISADA',
        justification: 'porque habló espontáneamente al calor de la indignación colectiva.',
      },
    },
    correct_option: 'B',
    explanation: '"Vehemente" califica a aquello que se realiza con ímpetu, pasión y ardor. El fragmento refuerza esto señalando que la oradora conmovió por "la fuerza de sus convicciones y el tono apasionado". No connota violencia u hostilidad gratuita (agresiva).',
    nuance_tip: 'La vehemencia es fervor y fuerza comunicativa, no necesariamente enojo o agresión física.',
  },
  {
    id: 'voc_4',
    target_word: 'EFÍMERO',
    context_sentence: 'El éxito de las tendencias en redes sociales suele ser EFÍMERO, desvaneciéndose en cuestión de horas ante la llegada de nuevos contenidos.',
    full_passage: 'La cultura de consumo digital premia la novedad instantánea por sobre la permanencia de la obra. El éxito de las tendencias en redes sociales suele ser EFÍMERO, desvaneciéndose en cuestión de horas ante la llegada de nuevos contenidos que capturan la atención fugitiva del usuario.',
    source: 'Columna sobre Cultura Digital',
    category: 'periodistico',
    difficulty: 'inicial',
    options: {
      A: {
        synonym: 'FUGAZ',
        justification: 'porque dura muy poco tiempo y desaparece velozmente.',
      },
      B: {
        synonym: 'FALSO',
        justification: 'porque obedece a manipulaciones algorítmicas sin valor real.',
      },
      C: {
        synonym: 'INÚTIL',
        justification: 'porque no aporta ningún beneficio cultural duradero a los jóvenes.',
      },
      D: {
        synonym: 'FRÁGIL',
        justification: 'porque puede quebrarse fácilmente por una opinión contraria.',
      },
    },
    correct_option: 'A',
    explanation: '"Efímero" proviene del griego y alude a lo que dura un día o un lapso brevísimo. El texto lo explicita al señalar que se desvanece "en cuestión de horas". Su sinónimo contextual exacto es "fugaz".',
    nuance_tip: 'En preguntas PAES de léxico temporal, busca el sinónimo que exprese duración efímera o transitoriedad (fugaz, perecedero, momentáneo).',
  },
  {
    id: 'voc_5',
    target_word: 'DILUCIDAR',
    context_sentence: 'El propósito del experimento genético era DILUCIDAR si la mutación celular era hereditaria o provocada por factores ambientales.',
    full_passage: 'Tras años de discrepancias entre los laboratorios internacionales, se diseñó un protocolo ciego con muestras gemelas. El propósito del experimento genético era DILUCIDAR si la mutación celular era hereditaria o provocada por factores ambientales, aclarando así el debate que dividía a la comunidad biomédica.',
    source: 'Artículo de Divulgación Científica',
    category: 'academico',
    difficulty: 'medio',
    options: {
      A: {
        synonym: 'ESCLARECER',
        justification: 'porque se buscaba aclarar y despejar una incógnita científica no resuelta.',
      },
      B: {
        synonym: 'DEMOSTRAR',
        justification: 'porque los científicos ya conocían de antemano el resultado del ensayo.',
      },
      C: {
        synonym: 'PUBLICAR',
        justification: 'porque era imperativo dar a conocer los hallazgos en revistas indexadas.',
      },
      D: {
        synonym: 'CORREGIR',
        justification: 'porque debían subsanar los errores metodológicos de los protocolos anteriores.',
      },
    },
    correct_option: 'A',
    explanation: '"Dilucidar" significa explicar, poner en claro o esclarecer un asunto enredado o dudoso. El texto menciona que el objetivo era "aclarando así el debate", por lo que "esclarecer" calza con máxima fidelidad semántica.',
    nuance_tip: 'El prefijo "di-" junto a la raíz de "lucidez/luz" orienta hacia arrojar luz sobre algo confuso: esclarecer, desentrañar, transparentar.',
  },
  {
    id: 'voc_6',
    target_word: 'PROLIJO',
    context_sentence: 'El detective realizó un PROLIJO examen de la habitación, anotando meticulosamente cada fibra y grano de polvo hallado en el piso.',
    full_passage: 'Lejos de apresurarse con conclusiones preliminares, el detective realizó un PROLIJO examen de la habitación, anotando meticulosamente cada fibra y grano de polvo hallado en el piso antes de autorizar el ingreso de los peritos balísticos.',
    source: 'Novela Policial Contemporánea',
    category: 'literario',
    difficulty: 'medio',
    options: {
      A: {
        synonym: 'MINUCIOSO',
        justification: 'porque inspeccionó el lugar con extremo cuidado, detenimiento y rigor en los detalles.',
      },
      B: {
        synonym: 'LENTO',
        justification: 'porque tardó más horas de lo habitual en completar el procedimiento.',
      },
      C: {
        synonym: 'SOSPECHOSO',
        justification: 'because buscaba incriminar a uno de los sospechosos de la casa.',
      },
      D: {
        synonym: 'DESORDENADO',
        justification: 'porque revolvió todas las pertenencias en busca de indicios ocultos.',
      },
    },
    correct_option: 'A',
    explanation: 'En el español de América y en contexto de análisis, "prolijo" significa cuidadoso, esmerado y minucioso. El texto añade que anotaba "meticulosamente cada fibra", confirmando el rigor detallado.',
    nuance_tip: 'Ojo con el doble sentido: en retórica clásica "prolijo" puede significar excesivamente largo o pesado, pero aplicado a un trabajo o inspección significa cuidadoso, pulcro y minucioso.',
  },
  {
    id: 'voc_7',
    target_word: 'FRUGAL',
    context_sentence: 'A pesar de su inmensa fortuna, el filántropo mantenía una dieta FRUGAL, compuesta por frutas de estación, pan integral y agua fresca.',
    full_passage: 'Quienes visitaban su residencia quedaban asombrados por la ausencia de sirvientes y vajillas de plata. A pesar de su inmensa fortuna, el filántropo mantenía una dieta FRUGAL, compuesta por frutas de estación, pan integral y agua fresca, coherente con su prédica de sobriedad.',
    source: 'Perfil Biográfico',
    category: 'filosofico',
    difficulty: 'medio',
    options: {
      A: {
        synonym: 'AUSTERA',
        justification: 'porque su alimentación se caracterizaba por la sencillez, moderación y ausencia de lujos.',
      },
      B: {
        synonym: 'ESCASO',
        justification: 'porque pasaba hambre debido a su avaricia desmedida.',
      },
      C: {
        synonym: 'SALUDABLE',
        justification: 'porque seguía rigurosamente las recomendaciones de un médico nutricionista.',
      },
      D: {
        synonym: 'VEGETARIANA',
        justification: 'porque consumía exclusivamente frutos y vegetales por respeto a la fauna.',
      },
    },
    correct_option: 'A',
    explanation: '"Frugal" califica a la comida o modo de vida sobrio, moderado y austero. El texto lo asocia explícitamente a su "prédica de sobriedad", destacando la falta de ostentación.',
    nuance_tip: '"Frugal" no equivale solo a comer frutas ni a estar desnutrido: es sinónimo de sobrio, parco o austero frente al despilfarro.',
  },
  {
    id: 'voc_8',
    target_word: 'AMBIVALENTE',
    context_sentence: 'La respuesta de la ciudadanía ante la nueva ley de tránsito fue AMBIVALENTE: valoraban el aumento de seguridad pero criticaban el rigor de las multas.',
    full_passage: 'Las encuestas posteriores a la promulgación revelaron un escenario complejo de opiniones encontradas. La respuesta de la ciudadanía ante la nueva ley de tránsito fue AMBIVALENTE: valoraban el aumento de seguridad pero criticaban con igual fuerza el rigor desmedido de las multas pecuniarias.',
    source: 'Análisis Sociológico de Opinión Pública',
    category: 'periodistico',
    difficulty: 'medio',
    options: {
      A: {
        synonym: 'CONTRADICTORIA',
        justification: 'porque albergaba simultáneamente actitudes contrapuestas de aprobación y reproche.',
      },
      B: {
        synonym: 'NEGATIVA',
        justification: 'porque la mayoría de los encuestados rechazó de plano las nuevas normativas.',
      },
      C: {
        synonym: 'CONFUSA',
        justification: 'porque las personas no comprendieron el articulado técnico de la legislación.',
      },
      D: {
        synonym: 'TARDÍA',
        justification: 'porque se expresó meses después de que la ley ya hubiese entrado en vigor.',
      },
    },
    correct_option: 'A',
    explanation: '"Ambivalente" alude a la coexistencia de dos valores, sentidos o sentimientos opuestos respecto de un mismo objeto ("valoraban... pero criticaban"). Por ende, es sinónimo de contradictoria o dividida.',
    nuance_tip: 'El prefijo "ambi-" significa ambos (como en ambidiestro). Refiere a dos polos que conviven al mismo tiempo.',
  },
  {
    id: 'voc_9',
    target_word: 'PARADÓJICO',
    context_sentence: 'Resulta PARADÓJICO que en la era de mayor hiperconectividad digital proliferen los diagnósticos clínicos de soledad no deseada.',
    full_passage: 'Los sociólogos contemporáneos advierten una profunda encrucijada en las metrópolis modernas. Resulta PARADÓJICO que en la era de mayor hiperconectividad digital proliferen los diagnósticos clínicos de soledad no deseada, demostrando que estar conectado no equivale a estar acompañado.',
    source: 'Ensayo de Filosofía Social',
    category: 'filosofico',
    difficulty: 'avanzado',
    options: {
      A: {
        synonym: 'INEXPLICABLE',
        justification: 'porque la ciencia carece de herramientas para estudiar los efectos de la tecnología.',
      },
      B: {
        synonym: 'CONTRADICTORIO',
        justification: 'porque encierra una contradicción aparente entre el exceso de redes y la falta de compañía real.',
      },
      C: {
        synonym: 'PELIGROSO',
        justification: 'porque las redes sociales provocan trastornos de ansiedad en la población juvenil.',
      },
      D: {
        synonym: 'LÓGICO',
        justification: 'porque era una consecuencia previsible según los teóricos de la comunicación.',
      },
    },
    correct_option: 'B',
    explanation: 'Una "paradoja" es una figura o hecho que desafía el sentido común por presentar una aparente contradicción ("mucha conexión / mucha soledad") que sin embargo encierra un trasfondo verídico. Su equivalente es "contradictorio".',
    nuance_tip: 'No confundir paradójico con imposible: lo paradójico sí ocurre en la realidad, pero desafía la lógica convencional.',
  },
  {
    id: 'voc_10',
    target_word: 'RETICENTE',
    context_sentence: 'El testigo se mostró RETICENTE a contestar las preguntas del fiscal, limitándose a monosílabos evasivos.',
    full_passage: 'Pese a la protección judicial ofrecida por el tribunal, el testigo se mostró RETICENTE a contestar las preguntas del fiscal, limitándose a monosílabos evasivos por temor a posibles represalias de la organización delictual.',
    source: 'Reportaje Judicial',
    category: 'periodistico',
    difficulty: 'avanzado',
    options: {
      A: {
        synonym: 'RENUENTE',
        justification: 'porque manifestaba resistencia, reserva y poca disposición a brindar su testimonio.',
      },
      B: {
        synonym: 'INCAPAZ',
        justification: 'porque olvidó los detalles cruciales del crimen debido al paso del tiempo.',
      },
      C: {
        synonym: 'COLÉRICO',
        justification: 'porque increpó a los magistrados por considerar injusto el interrogatorio.',
      },
      D: {
        synonym: 'VALIENTE',
        justification: 'porque se presentó a declarar frente a todos los implicados en la causa.',
      },
    },
    correct_option: 'A',
    explanation: '"Reticente" describe a la persona desconfiada, reservada o que rehúye manifestar con franqueza lo que sabe. Su sinónimo idóneo en este contexto es "renuente" (reacio, renuente a colaborar).',
    nuance_tip: 'Reticencia implica callar intencionalmente parte de la verdad por cautela o desconfianza.',
  },
  {
    id: 'voc_11',
    target_word: 'INCISIVO',
    context_sentence: 'El periodista formuló un cuestionario INCISIVO sobre los conflictos de interés, obligando al ministro a reconocer las omisiones en su declaración.',
    full_passage: 'Durante la conferencia matinal en el palacio de gobierno, el periodista formuló un cuestionario INCISIVO sobre los conflictos de interés de la cartera, obligando al ministro a reconocer las omisiones en su declaración patrimonial ante las cámaras.',
    source: 'Crónica Política Nacional',
    category: 'periodistico',
    difficulty: 'medio',
    options: {
      A: {
        synonym: 'PENETRANTE',
        justification: 'porque sus preguntas fueron agudas, directas y fueron al nudo del problema.',
      },
      B: {
        synonym: 'OFENSIVO',
        justification: 'porque utilizó insultos directos dirigidos contra la dignidad del mandatario.',
      },
      C: {
        synonym: 'DESORDENADO',
        justification: 'porque interrumpió abruptamente el orden establecido de la conferencia.',
      },
      D: {
        synonym: 'RÁPIDO',
        justification: 'porque leyó las preguntas a gran velocidad para ganar tiempo en pantalla.',
      },
    },
    correct_option: 'A',
    explanation: 'En sentido figurado, "incisivo" es aquello agudo, penetrante, que cala hondo e hiere la superficie para llegar a la verdad. No implica grosería ni falta de respeto (ofensivo), sino agudeza crítica.',
    nuance_tip: 'Un comentario o pregunta incisiva es punzante y perspicaz, va directo al punto crítico.',
  },
  {
    id: 'voc_12',
    target_word: 'VEROSÍMIL',
    context_sentence: 'Aunque la trama presentaba sucesos fantásticos, el autor construyó un universo tan coherente que el relato resultaba completamente VEROSÍMIL.',
    full_passage: 'El éxito de la novela radica en la solidez de sus leyes mágicas y la psicología verosímil de sus personajes. Aunque la trama presentaba sucesos fantásticos, el autor construyó un universo tan coherente que el relato resultaba completamente VEROSÍMIL para el lector más exigente.',
    source: 'Crítica Literaria PAES',
    category: 'literario',
    difficulty: 'medio',
    options: {
      A: {
        synonym: 'CREÍBLE',
        justification: 'porque guardaba apariencia de verdad y consistencia lógica interna dentro de la ficción.',
      },
      B: {
        synonym: 'HISTÓRICO',
        justification: 'porque narraba hechos verídicos ocurridos durante el siglo XIX europeo.',
      },
      C: {
        synonym: 'PREDECIBLE',
        justification: 'porque el desenlace del conflicto se anticipaba desde los primeros capítulos.',
      },
      D: {
        synonym: 'COMPLEJO',
        justification: 'porque utilizaba vocabulario enrevesado y múltiples líneas temporales.',
      },
    },
    correct_option: 'A',
    explanation: '"Verosímil" no significa verdadero o histórico, sino que "tiene apariencia de verdadero" (vero = verdadero, símil = semejante). Dentro de una ficción fantástica, algo es verosímil si resulta creíble y verosímil dentro de sus propias reglas.',
    nuance_tip: 'Distinguir "verdadero" (que ocurrió en la realidad empírica) de "verosímil" (que resulta creíble y convincente en el contexto discursivo).',
  },
  {
    id: 'voc_13',
    target_word: 'ELOCUENTE',
    context_sentence: 'El silencio prolongado de la sala fue más ELOCUENTE que cualquier aplauso, reflejando el impacto emocional que provocó la obra.',
    full_passage: 'Al caer el telón del teatro municipal, nadie se atrevió a levantarse de su butaca. El silencio prolongado de la sala fue más ELOCUENTE que cualquier aplauso, reflejando el impacto emocional y la conmoción que provocó la obra en cada espectador.',
    source: 'Reseña Teatral',
    category: 'literario',
    difficulty: 'medio',
    options: {
      A: {
        synonym: 'EXPRESIVO',
        justification: 'porque comunicaba con fuerza y elocuencia el impacto profundo sentido por el público.',
      },
      B: {
        synonym: 'RUIDOSO',
        justification: 'porque provocó un estruendo ensordecedor en el recinto cerrado.',
      },
      C: {
        synonym: 'DESAGRADABLE',
        justification: 'porque los asistentes sintieron incomodidad ante la temática expuesta.',
      },
      D: {
        synonym: 'CORTO',
        justification: 'porque duró solo unos pocos segundos antes de comenzar la ovación.',
      },
    },
    correct_option: 'A',
    explanation: '"Elocuente" define a aquello que expresa emociones o conceptos con singular eficacia y fuerza persuasiva. En sentido metafórico, un "silencio elocuente" es un silencio tremendamente expresivo y revelador.',
    nuance_tip: 'La elocuencia no pertenece solo a las palabras orales: una mirada, un silencio o un gesto pueden ser elocuentes si comunican con intensidad.',
  },
  {
    id: 'voc_14',
    target_word: 'SUBREPTICIO',
    context_sentence: 'La empresa introdujo un cambio SUBREPTICIO en las cláusulas del contrato digital, eliminando el derecho a reembolso de los usuarios.',
    full_passage: 'Aprovechando una actualización rutinaria de la aplicación en la madrugada, la empresa introdujo un cambio SUBREPTICIO en las cláusulas del contrato digital, eliminando el derecho a reembolso de los usuarios sin notificarlos formalmente.',
    source: 'Boletín de Protección al Consumidor',
    category: 'academico',
    difficulty: 'avanzado',
    options: {
      A: {
        synonym: 'OCULTO',
        justification: 'porque se realizó de forma furtiva, encubierta y sin conocimiento de los clientes.',
      },
      B: {
        synonym: 'LEGAL',
        justification: 'porque respetaba plenamente los acuerdos internacionales de comercio electrónico.',
      },
      C: {
        synonym: 'URGENTE',
        justification: 'porque requería una aprobación inmediata para evitar la bancarrota fiscal.',
      },
      D: {
        synonym: 'PROMISORIO',
        justification: 'porque anunciaba futuras rebajas en los servicios ofrecidos a la comunidad.',
      },
    },
    correct_option: 'A',
    explanation: '"Subrepticio" califica a lo que se hace a escondidas, de manera solapada o furtiva, con intención de no ser descubierto. En este caso, la modificación se introdujo encubiertamente en la madrugada sin aviso.',
    nuance_tip: 'Subrepticio comparte raíz con reptar (arrastrarse por debajo). Es todo aquello que se introduce "por debajo de la mesa" o de forma encubierta.',
  },
  {
    id: 'voc_15',
    target_word: 'ESBOZAR',
    context_sentence: 'En su discurso inaugural, la rectora se limitó a ESBOZAR los lineamientos estratégicos del quinquenio, postergando el detalle de las metas operativas.',
    full_passage: 'Frente al cuerpo académico reunido en el aula magna, la rectora se limitó a ESBOZAR los lineamientos estratégicos del quinquenio, postergando el detalle de las metas operativas para las comisiones técnicas de cada facultad.',
    source: 'Cuenta Pública Universitaria',
    category: 'academico',
    difficulty: 'inicial',
    options: {
      A: {
        synonym: 'DELINEAR',
        justification: 'porque presentó únicamente los trazos generales y fundamentales de su programa.',
      },
      B: {
        synonym: 'CUESTIONAR',
        justification: 'porque criticó con dureza los planes implementados por la gestión precedente.',
      },
      C: {
        synonym: 'CANCELAR',
        justification: 'porque suspendió indefinidamente la ejecución de los proyectos de investigación.',
      },
      D: {
        synonym: 'MEMORIZAR',
        justification: 'porque repasó mentalmente las cifras antes de presentarlas a los decanos.',
      },
    },
    correct_option: 'A',
    explanation: '"Esbozar" procede del arte del dibujo (hacer un bosquejo) y significa insinuar, trazar las líneas primarias o delinear una idea sin profundizar aún en los detalles acabados. El texto especifica que "postergó el detalle de las metas operativas".',
    nuance_tip: 'Esbozar = bosquejar, perfilar, delinear o plantear a grandes rasgos.',
  },
  {
    id: 'voc_16',
    target_word: 'ABRUMADOR',
    context_sentence: 'La cantidad de evidencia científica acumulada sobre el retroceso de los glaciares resultó ABRUMADORA para los delegados de la cumbre.',
    full_passage: 'Lejos de tratarse de modelos teóricos hipotéticos, los informes satelitales exhibieron mediciones contundentes. La cantidad de evidencia científica acumulada sobre el retroceso de los glaciares resultó ABRUMADORA para los delegados de la cumbre, que no pudieron rebatir ningún punto.',
    source: 'Reporte de Cambio Climático',
    category: 'periodistico',
    difficulty: 'medio',
    options: {
      A: {
        synonym: 'CONTUNDENTE',
        justification: 'porque la contundencia y magnitud de los datos no dejaba lugar a dudas ni refutación.',
      },
      B: {
        synonym: 'DESAGRADABLE',
        justification: 'porque generó malestar estético por la calidad gráfica de los mapas satelitales.',
      },
      C: {
        synonym: 'CONTRADICTORIA',
        justification: 'porque los diferentes laboratorios aportaron estimaciones dispares.',
      },
      D: {
        synonym: 'ESCASA',
        justification: 'porque apenas se contaba con registros de los polos durante la última década.',
      },
    },
    correct_option: 'A',
    explanation: '"Abrumador" se refiere a lo que por su gran peso, fuerza o abundancia sobrecoge o rinde a alguien. En este contexto argumentativo, significa contundente, incontestable o demoledor.',
    nuance_tip: 'En contextos argumentativos y demostrativos, "abrumador" significa contundente o categórico.',
  },
  {
    id: 'voc_17',
    target_word: 'LACÓNICO',
    context_sentence: 'El telegrama contenía un mensaje LACÓNICO: "Operación cumplida; retorno mañana", sin dar mayores explicaciones.',
    full_passage: 'Tras semanas de incertidumbre en el cuartel general, el operador recibió por fin la señal cifrada. El telegrama contenía un mensaje LACÓNICO: "Operación cumplida; retorno mañana", sin dar mayores explicaciones a los oficiales que esperaban un informe pormenorizado.',
    source: 'Relato Histórico Militar',
    category: 'literario',
    difficulty: 'medio',
    options: {
      A: {
        synonym: 'CONCISO',
        justification: 'porque transmitía la información con la mayor brevedad y economía de palabras.',
      },
      B: {
        synonym: 'CONFUSO',
        justification: 'because el código empleado impedía entender si la misión había tenido éxito.',
      },
      C: {
        synonym: 'FALAZ',
        justification: 'porque mentía respecto al estado real de los soldados en el frente de batalla.',
      },
      D: {
        synonym: 'EMOTIVO',
        justification: 'porque conmovió hasta las lágrimas a los destinatarios que leían la misiva.',
      },
    },
    correct_option: 'A',
    explanation: '"Lacónico" proviene de Laconia (Esparta), célebre por la austeridad de palabras de sus habitantes. Significa breve, conciso y sobrio en el decir. El texto ilustra un mensaje de apenas cuatro palabras.',
    nuance_tip: 'Lo lacónico es lo sumamente breve y directo: sobrio, escueto, conciso.',
  },
  {
    id: 'voc_18',
    target_word: 'DISPLICENTE',
    context_sentence: 'El funcionario atendió al público con un gesto DISPLICENTE, hojeando una revista sin mirar a los ojos a quienes esperaban su turno.',
    full_passage: 'La fila avanzaba con exasperante lentitud frente a la ventanilla única. El funcionario atendió al público con un gesto DISPLICENTE, hojeando una revista sin mirar a los ojos a quienes esperaban su turno y respondiendo con monosílabos desganados.',
    source: 'Crónica Urbana Costumbrista',
    category: 'literario',
    difficulty: 'avanzado',
    options: {
      A: {
        synonym: 'DESPECTIVO',
        justification: 'porque manifestaba desdén, apatía e indiferencia poco cortés hacia los ciudadanos.',
      },
      B: {
        synonym: 'EFICIENTE',
        justification: 'porque despachaba las solicitudes con celeridad para evitar aglomeraciones.',
      },
      C: {
        synonym: 'TEMEROSO',
        justification: 'porque sospechaba de las intenciones de las personas que acudían al recinto.',
      },
      D: {
        synonym: 'ENTUSIASTA',
        justification: 'porque mostraba una alegría desbordante al interactuar con los solicitantes.',
      },
    },
    correct_option: 'A',
    explanation: '"Displicente" denota desinterés, frialdad, desdén o falta de empatía y cortesía en el trato con los demás. El fragmento lo ejemplifica al indicar que "no miraba a los ojos" y contestaba con "desgano".',
    nuance_tip: 'La displicencia es esa mezcla de aburrimiento y desdén hacia el prójimo.',
  },
  {
    id: 'voc_19',
    target_word: 'IDIOSINCRASIA',
    context_sentence: 'El humor popular y la picardía forman parte indiscutible de la IDIOSINCRASIA que distingue a las diversas regiones del país.',
    full_passage: 'En sus ensayos sobre el alma nacional, el historiador analizaba los mitos fundacionales de la república. Concluía que el humor popular y la picardía forman parte indiscutible de la IDIOSINCRASIA que distingue a las diversas regiones del país frente a sus vecinos continentales.',
    source: 'Ensayo sobre Identidad Nacional',
    category: 'filosofico',
    difficulty: 'medio',
    options: {
      A: {
        synonym: 'SINGULARIDAD',
        justification: 'porque alude al conjunto de rasgos distintivos y temperamento característico de un pueblo.',
      },
      B: {
        synonym: 'EDUCACIÓN',
        justification: 'porque refiere a los contenidos curriculares impartidos por el Ministerio en las escuelas.',
      },
      C: {
        synonym: 'LEGISLACIÓN',
        justification: 'porque comprende el código civil y las ordenanzas vigentes en el territorio.',
      },
      D: {
        synonym: 'GEOGRAFÍA',
        justification: 'porque describe los límites montañosos y la longitud costera del territorio chileno.',
      },
    },
    correct_option: 'A',
    explanation: '"Idiosincrasia" es el conjunto de rasgos, temperamento y carácter propio y distintivo de un individuo o colectividad. En este fragmento, equivale a la singularidad o carácter identitario propio.',
    nuance_tip: 'Idiosincrasia = temperamento colectivo, identidad característica, rasgos singulares.',
  },
  {
    id: 'voc_20',
    target_word: 'CONJETURAR',
    context_sentence: 'A falta de fósiles completos, los paleontólogos solo pueden CONJETURAR sobre la masa corporal de la especie recién descubierta.',
    full_passage: 'La expedición en la estepa patagónica recuperó apenas una falange y dos vértebras cervicales. A falta de fósiles completos, los paleontólogos solo pueden CONJETURAR sobre la masa corporal de la especie recién descubierta mediante comparaciones anatómicas indirectas.',
    source: 'Artículo de Paleontología y Evolución',
    category: 'academico',
    difficulty: 'medio',
    options: {
      A: {
        synonym: 'SUPONER',
        justification: 'porque elaboran una hipótesis tentativa fundada en indicios parciales y no comprobados del todo.',
      },
      B: {
        synonym: 'CONFIRMAR',
        justification: 'porque las vértebras permitían certificar sin error la masa exacta del animal.',
      },
      C: {
        synonym: 'DESCARTAR',
        justification: 'porque decidieron rechazar la muestra al considerarla demasiado deteriorada.',
      },
      D: {
        synonym: 'FABRICAR',
        justification: 'porque moldearon un esqueleto artificial para exponerlo en el museo comunal.',
      },
    },
    correct_option: 'A',
    explanation: '"Conjeturar" significa formar juicio de algo por indicios y observaciones, sin certeza matemática. En el texto, al tener solo fragmentos óseos, los científicos deben suponer o inferir la masa.',
    nuance_tip: 'Conjeturar = suponer, presumir, inferir provisionalmente a partir de pistas incompletas.',
  },
];
