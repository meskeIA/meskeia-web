import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Diagnóstico de Brecha IA - ¿Usas la IA para pensar mejor o para dejar de pensar? | meskeIA',
  description: 'Evalúa si usas la inteligencia artificial como amplificador de tu pensamiento o como sustituto. Test de 10 preguntas sobre criterio propio y aprovechamiento de la IA. Gratuito y sin registro.',
  keywords: 'brecha IA, uso inteligente IA, dependencia inteligencia artificial, pensamiento crítico IA, amplificador IA, ChatGPT dependencia, criterio propio IA, automatización vs pensamiento',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Diagnóstico de Brecha IA | meskeIA',
    description: '¿Usas la IA para pensar mejor o para dejar de pensar? Test interactivo con diagnóstico visual.',
    url: 'https://meskeia.com/diagnostico-brecha-ia/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Diagnóstico de Brecha IA | meskeIA',
    description: '¿La IA te hace mejor o te hace dependiente? Descúbrelo con este test gratuito.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Diagnóstico de Brecha IA meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Diagnóstico de Brecha IA',
  description: 'Herramienta interactiva de reflexión sobre el uso de la inteligencia artificial. 10 preguntas para evaluar si mantienes tu criterio propio mientras aprovechas la IA. Diagnóstico visual con perfil personalizado y acciones concretas.',
  url: 'https://meskeia.com/diagnostico-brecha-ia/',
  features: [
    'Test de 10 preguntas sobre cómo usas la IA en tu trabajo',
    'Diagnóstico visual con mapa bidimensional',
    'Evalúa criterio propio y aprovechamiento de la IA',
    'Perfil personalizado con fortalezas y riesgos',
    'Acciones concretas para un uso más inteligente de la IA',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la brecha IA y cómo afecta al trabajo profesional?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La brecha IA describe la distancia entre quienes usan la inteligencia artificial como amplificador de su propio criterio y quienes la usan como sustituto del pensamiento. Quienes quedan en el segundo grupo asumen el riesgo de deteriorar habilidades cognitivas clave: síntesis, juicio contextual, detección de errores y razonamiento en situaciones nuevas. La brecha se agranda a medida que los modelos mejoran, por lo que el momento de desarrollar el hábito correcto es ahora.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo puedo saber si estoy dependiendo demasiado de la IA?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Señales de dependencia excesiva incluyen: dificultad para empezar una tarea sin consultar antes a la IA, aceptar respuestas sin verificarlas, no recordar cómo hacías esa tarea hace un año o sentir ansiedad cuando la herramienta no está disponible. El test de esta herramienta evalúa esos patrones en 10 preguntas y genera un diagnóstico con tu nivel de criterio propio frente al aprovechamiento de la IA.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre usar la IA como amplificador o como sustituto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Usarla como amplificador significa llegar con una hipótesis, criterio o borrador previo y pedir a la IA que lo mejore, cuestione o amplíe. Usarla como sustituto es delegar la generación de la idea, la decisión o el análisis completo sin participación propia. La distinción no es el tiempo dedicado sino el rol del propio juicio: en el primer caso se mantiene activo; en el segundo, se externaliza.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es este diagnóstico sobre el uso de la inteligencia artificial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para cualquier persona que use herramientas de IA generativa en su trabajo o estudio con cierta regularidad: escritores, desarrolladores, analistas, estudiantes universitarios, directivos, docentes o cualquier profesional con conocimiento como materia prima. No es necesario ser experto técnico; el test evalúa comportamientos y hábitos, no conocimientos sobre cómo funciona la IA por dentro.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué habilidades cognitivas corre riesgo de deteriorar el uso pasivo de la IA?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las más estudiadas son la escritura argumentativa (reducción de la práctica deliberada), la memoria de trabajo (dependencia del contexto externo), el pensamiento crítico (aceptar sin cuestionar), la creatividad divergente (partir siempre de una propuesta ajena) y la tolerancia a la ambigüedad (buscar respuesta inmediata en lugar de elaborar la propia). Ninguna desaparece de golpe, pero se debilitan gradualmente si no se ejercitan de forma independiente.',
      },
    },
  ],
};
