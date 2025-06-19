// Base de datos educativa con respuestas por materia
// Este archivo contiene las respuestas predefinidas del asistente virtual

import { Subject, EducationalResponse } from '../types';

// Base de datos de respuestas educativas organizadas por materia
// Cada materia tiene patrones de preguntas y respuestas correspondientes
export const educationalDatabase: Record<Subject, EducationalResponse[]> = {
  // Respuestas para la materia de Matemáticas
  matematicas: [
    {
      // Patrón para detectar preguntas sobre ecuaciones cuadráticas
      pattern: /ecuaci[óo]n cuadr[áa]tica|ax2|discriminante/i,
      response: "Una ecuación cuadrática tiene la forma ax² + bx + c = 0. Para resolverla puedes usar la fórmula: x = (-b ± √(b²-4ac)) / 2a. El discriminante (b²-4ac) te dice cuántas soluciones reales tiene.",
      followUp: "¿Te gustaría que practiquemos con un ejemplo específico?",
      resources: ["https://es.khanacademy.org/math/algebra/quadratics"]
    },
    {
      // Patrón para preguntas sobre fracciones
      pattern: /fracci[óo]n|numerador|denominador|simplificar/i,
      response: "Las fracciones representan partes de un todo. Para simplificar una fracción, divide numerador y denominador por su máximo común divisor (MCD). Para sumar fracciones, necesitas el mismo denominador.",
      followUp: "¿Necesitas ayuda con alguna operación específica con fracciones?",
      resources: ["https://es.khanacademy.org/math/arithmetic/fractions"]
    },
    {
      // Patrón para preguntas sobre funciones
      pattern: /funci[óo]n|dominio|rango|gr[áa]fica/i,
      response: "Una función es una relación donde cada entrada (x) tiene exactamente una salida (y). El dominio son todos los valores posibles de x, y el rango todos los valores posibles de y.",
      followUp: "¿Quieres que veamos cómo graficar una función específica?",
      resources: ["https://es.khanacademy.org/math/algebra/functions"]
    }
  ],

  // Respuestas para Ciencias Naturales
  ciencias: [
    {
      // Patrón para preguntas sobre células
      pattern: /c[ée]lula|mitosis|meiosis|organelos/i,
      response: "La célula es la unidad básica de la vida. Las células eucariotas tienen núcleo y organelos como mitocondrias, ribosomas y retículo endoplasmático. La mitosis produce células idénticas, la meiosis produce gametos.",
      followUp: "¿Te interesa profundizar en algún organelo específico?",
      resources: ["https://es.khanacademy.org/science/biology/cell-structure"]
    },
    {
      // Patrón para preguntas sobre ecosistemas
      pattern: /ecosistema|cadena alimentaria|productor|consumidor/i,
      response: "Un ecosistema incluye todos los seres vivos y factores abióticos de un área. La energía fluye desde productores (plantas) hacia consumidores primarios (herbívoros) y secundarios (carnívoros).",
      followUp: "¿Quieres explorar un ecosistema específico como el bosque o el océano?",
      resources: ["https://es.khanacademy.org/science/biology/ecology"]
    }
  ],

  // Respuestas para Historia
  historia: [
    {
      // Patrón para preguntas sobre independencia
      pattern: /independencia|revoluci[óo]n|colonia|libertad/i,
      response: "Los procesos de independencia latinoamericanos (1810-1825) fueron movimientos donde las colonias se liberaron del dominio español. Líderes como Bolívar, San Martín e Hidalgo fueron fundamentales.",
      followUp: "¿Te gustaría conocer más sobre algún prócer en particular?",
      resources: ["http://www.educarchile.cl/historia-independencia"]
    },
    {
      // Patrón para preguntas sobre guerras mundiales
      pattern: /guerra mundial|hitler|nazismo|holocausto/i,
      response: "Las Guerras Mundiales (1914-1918 y 1939-1945) transformaron el mundo. La Primera surgió por tensiones europeas, la Segunda por el fascismo. Ambas tuvieron consecuencias políticas, sociales y económicas duraderas.",
      followUp: "¿Quieres analizar las causas o consecuencias de alguna de estas guerras?",
      resources: ["https://encyclopedia.britannica.com/event/World-War-I"]
    }
  ],

  // Respuestas para Literatura
  literatura: [
    {
      // Patrón para preguntas sobre géneros literarios
      pattern: /g[ée]nero literario|narrativa|l[íi]rica|drama/i,
      response: "Los géneros literarios principales son: Épico (narrativa: novela, cuento), Lírico (poesía, expresión de sentimientos) y Dramático (teatro, diálogos). Cada uno tiene características y estructuras específicas.",
      followUp: "¿Te interesa analizar alguna obra en particular?",
      resources: ["https://www.cervantes.es/lengua_y_ensenanza/generos_literarios.htm"]
    },
    {
      // Patrón para preguntas sobre figuras retóricas
      pattern: /met[áa]fora|s[íi]mil|personificaci[óo]n|figura ret[óo]rica/i,
      response: "Las figuras retóricas embellecen el lenguaje: la metáfora compara sin usar 'como' (sus ojos son estrellas), el símil usa 'como' (rápido como el viento), la personificación da cualidades humanas a objetos.",
      followUp: "¿Quieres que identifiquemos figuras retóricas en algún poema?",
      resources: ["https://www.rae.es/dpd/figuras-retorica"]
    }
  ],

  // Respuestas para Inglés
  ingles: [
    {
      // Patrón para preguntas sobre tiempos verbales
      pattern: /present perfect|past simple|future|verb tense/i,
      response: "Los tiempos verbales en inglés expresan cuándo ocurre una acción. Present Simple (I work), Past Simple (I worked), Present Perfect (I have worked), Future (I will work). Cada uno tiene usos específicos.",
      followUp: "Would you like to practice with some examples?",
      resources: ["https://www.englishgrammar.org/verb-tenses/"]
    },
    {
      // Patrón para preguntas sobre vocabulario
      pattern: /vocabulary|words|meaning|definition/i,
      response: "Building vocabulary is essential for English fluency. Try learning 5-10 new words daily, use them in sentences, and practice with context. Reading and listening help expand your vocabulary naturally.",
      followUp: "¿Hay algún tema específico de vocabulario que te interese?",
      resources: ["https://www.merriam-webster.com/"]
    }
  ],

  // Respuestas para Física
  fisica: [
    {
      // Patrón para preguntas sobre movimiento
      pattern: /movimiento|velocidad|aceleraci[óo]n|cin[ée]tica/i,
      response: "El movimiento se describe con velocidad (distancia/tiempo) y aceleración (cambio de velocidad/tiempo). Las leyes de Newton explican cómo las fuerzas afectan el movimiento de los objetos.",
      followUp: "¿Quieres resolver algún problema de cinemática?",
      resources: ["https://es.khanacademy.org/science/physics/one-dimensional-motion"]
    },
    {
      // Patrón para preguntas sobre energía
      pattern: /energ[íi]a|cin[ée]tica|potencial|trabajo|potencia/i,
      response: "La energía es la capacidad de realizar trabajo. Energía cinética = ½mv², energía potencial = mgh. La energía se conserva: no se crea ni se destruye, solo se transforma.",
      followUp: "¿Te gustaría ver ejemplos de transformaciones de energía?",
      resources: ["https://es.khanacademy.org/science/physics/work-and-energy"]
    }
  ],

  // Respuestas para Química
  quimica: [
    {
      // Patrón para preguntas sobre tabla periódica
      pattern: /tabla peri[óo]dica|elemento|[áa]tomo|valencia/i,
      response: "La tabla periódica organiza elementos por número atómico. Los grupos (columnas) tienen propiedades similares, los períodos (filas) indican niveles de energía. La valencia determina cómo se combinan los elementos.",
      followUp: "¿Quieres que veamos las propiedades de algún elemento específico?",
      resources: ["https://es.khanacademy.org/science/chemistry/periodic-table"]
    },
    {
      // Patrón para preguntas sobre enlaces químicos
      pattern: /enlace|i[óo]nico|covalente|met[áa]lico|mol[ée]cula/i,
      response: "Los enlaces químicos unen átomos: iónicos (transferencia de electrones), covalentes (compartir electrones), metálicos (mar de electrones). Determinan las propiedades de los compuestos.",
      followUp: "¿Te interesa practicar con estructuras de Lewis?",
      resources: ["https://es.khanacademy.org/science/chemistry/chemical-bonds"]
    }
  ]
};

// Respuestas genéricas para cuando no se encuentra un patrón específico
export const genericResponses = [
  "Es una excelente pregunta. ¿Podrías ser más específico sobre qué aspecto te interesa más?",
  "Me gustaría ayudarte mejor. ¿Podrías reformular tu pregunta o dar más contexto?",
  "Esa es un área interesante de estudio. ¿Hay algún concepto particular que te genere dudas?",
  "Para darte una respuesta más precisa, ¿podrías especificar en qué materia se enmarca tu pregunta?"
];

// Respuestas de bienvenida según el rol del usuario
export const welcomeMessages = {
  student: "¡Hola! Soy tu asistente virtual educativo. Estoy aquí para ayudarte con tus estudios. ¿En qué materia necesitas apoyo hoy?",
  teacher: "¡Bienvenido/a! Como docente, puedes usar este sistema para apoyar a tus estudiantes y acceder a análisis de uso. ¿Cómo puedo asistirte?"
};