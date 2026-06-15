import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Temporizador Visual - Reloj de cuenta atrás con colores | meskeIA',
  description: 'Temporizador visual con círculo de colores para personas con autismo, discapacidad cognitiva o necesidades especiales. Botones grandes, sonido al terminar y presets de 1 a 30 minutos.',
  keywords: 'temporizador visual, temporizador autismo, reloj cuenta atrás, timer visual, temporizador colores, discapacidad cognitiva, temporizador necesidades especiales, timer grande',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Temporizador Visual | meskeIA',
    description: 'Temporizador con círculo de colores y botones grandes. Perfecto para personas con autismo, TDAH o dificultades cognitivas.',
    url: 'https://meskeia.com/temporizador-visual/',
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
    title: 'Temporizador Visual | meskeIA',
    description: 'Cuenta atrás con colores y botones grandes. Ideal para personas con autismo o dificultades cognitivas.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Temporizador Visual - Reloj de cuenta atrás con colores',
  description: 'Temporizador visual con círculo de colores para personas con autismo, discapacidad cognitiva o necesidades especiales. Botones grandes, sonido al terminar.',
  url: 'https://meskeia.com/temporizador-visual/',
  category: 'UtilityApplication',
  features: [
    'Círculo visual que se vacía progresivamente',
    'Cambio de color según el tiempo restante (verde → amarillo → rojo)',
    'Botones grandes accesibles para personas con dificultades motoras',
    'Presets de 1 a 30 minutos',
    'Sonido al finalizar',
    'Compatible con pantallas grandes y proyectores para uso en aula',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Por qué los temporizadores visuales ayudan a personas con autismo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las personas con autismo (TEA) suelen tener dificultades para percibir el paso del tiempo de forma abstracta. Un temporizador visual convierte el tiempo en una representación gráfica concreta que se puede "ver" disminuir. Esto reduce la ansiedad por la incertidumbre temporal, facilita las transiciones entre actividades, ayuda a mantener la concentración en tareas con tiempo limitado y mejora la autorregulación. Es una herramienta recomendada por logopedas y psicopedagogos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué edades es adecuado el temporizador visual?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El temporizador visual es adecuado para todas las edades que se beneficien de apoyos visuales: niños con TEA desde los 3-4 años, niños y adultos con TDAH, personas con discapacidad intelectual, personas mayores con deterioro cognitivo leve y también cualquier persona que quiera gestionar mejor su tiempo con un recurso visual intuitivo. No requiere saber leer ni entender el reloj analógico.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo usar el temporizador visual en el aula o en casa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Usos habituales: tiempo de trabajo (iniciar el temporizador al comenzar una tarea, detenerlo al acabar); tiempo libre estructurado (marcar cuánto tiempo queda de juego libre antes de volver a la rutina); transiciones (avisar con antelación del cambio de actividad); higiene y rutinas (cepillado de dientes 2 minutos, tiempo en el baño); descansos (pausas Pomodoro de 5 minutos). Colocar el dispositivo bien visible durante la actividad maximiza su eficacia.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre un temporizador visual y un reloj de arena?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El reloj de arena es el temporizador visual más clásico, muy útil por su tangibilidad (se puede tocar y voltear). Sus limitaciones: los tiempos están fijos (no se puede ajustar), es frágil y difícil de leer con precisión. El temporizador visual digital permite configurar cualquier duración, muestra la cuenta numérica además del gráfico, emite sonido al terminar y puede usarse en pantalla grande. Para uso digital y escolar, el temporizador visual es más versátil.',
      },
    },
    {
      '@type': 'Question',
      name: '¿El temporizador visual funciona sin internet?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, el temporizador visual de meskeIA funciona completamente sin conexión a internet una vez cargada la página. Al ser una aplicación web progresiva, puede guardarse en la pantalla de inicio del dispositivo y usarse offline en cualquier momento. Esto lo hace ideal para usar en el aula, en terapia o en casa sin depender de la conexión a internet.',
      },
    },
  ],
};
