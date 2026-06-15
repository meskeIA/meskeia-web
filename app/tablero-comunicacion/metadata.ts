import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Tablero de Comunicación AAC - Comunicación Aumentativa | meskeIA',
  description: 'Tablero de comunicación aumentativa y alternativa (AAC) con símbolos visuales y voz. Para personas no verbales, autismo, parálisis cerebral o afasia. Categorías de necesidades, emociones, comida, acciones, personas y lugares.',
  keywords: 'tablero comunicacion, AAC, comunicacion aumentativa, comunicacion alternativa, autismo, no verbal, parálisis cerebral, afasia, pictogramas, PECS, simbolos comunicacion',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Tablero de Comunicación AAC | meskeIA',
    description: 'Tablero de comunicación con símbolos visuales y voz para personas no verbales. Categorías de necesidades, emociones, comida y más.',
    url: 'https://meskeia.com/tablero-comunicacion/',
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
    title: 'Tablero de Comunicación AAC | meskeIA',
    description: 'Comunicación aumentativa con símbolos y voz. Ideal para autismo y personas no verbales.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Tablero de Comunicación AAC - Comunicación Aumentativa',
  description: 'Tablero de comunicación aumentativa y alternativa (AAC) con símbolos visuales y voz. Para personas no verbales, autismo, parálisis cerebral o afasia.',
  url: 'https://meskeia.com/tablero-comunicacion/',
  category: 'UtilityApplication',
  features: [
    'Símbolos visuales con texto y voz en español',
    'Categorías: necesidades, emociones, comida, acciones, personas, lugares',
    'Síntesis de voz al pulsar cada símbolo',
    'Favoritos guardados localmente: acceso rápido a los símbolos más usados',
    'Retroalimentación de voz inmediata al pulsar cada símbolo para refuerzo del aprendizaje',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la comunicación aumentativa y alternativa (AAC)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La Comunicación Aumentativa y Alternativa (AAC) engloba todos los métodos de comunicación que complementan o sustituyen el habla cuando esta es insuficiente o inexistente. "Aumentativa" añade al habla residual (gestos, signos, imágenes); "alternativa" sustituye el habla por completo (tableros de comunicación, dispositivos de voz generada). La AAC incluye sistemas de baja tecnología (tableros en papel) y alta tecnología (apps de voz sintetizada, eye-tracking). Es un derecho reconocido para personas con TEA, parálisis cerebral, afasia u otras condiciones.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién está indicado un tablero de comunicación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los tableros de comunicación están indicados para: personas no verbales o con habla muy limitada por TEA (autismo); personas con parálisis cerebral que afecte al habla; personas con afasia (pérdida del habla tras ictus o lesión cerebral); personas con ELA, esclerosis múltiple u otras enfermedades neurológicas progresivas; niños con retraso severo del lenguaje. También son útiles temporalmente tras cirugías de garganta o en UCI. Cualquier persona con dificultad comunicativa puede beneficiarse.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona la síntesis de voz en el tablero de comunicación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Al pulsar un símbolo en el tablero, la aplicación convierte el texto asociado en voz usando la API de síntesis de voz del navegador (Web Speech API). Esta tecnología genera habla natural sin necesidad de archivos de audio grabados. En español hay varias voces disponibles según el navegador y sistema operativo. La síntesis de voz funciona sin conexión en la mayoría de dispositivos modernos, lo que garantiza disponibilidad en cualquier momento.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre PECS y los tableros de comunicación digitales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'PECS (Picture Exchange Communication System) es un sistema terapéutico estructurado donde la persona entrega físicamente una tarjeta al interlocutor para comunicarse; requiere entrenamiento específico con terapeuta. Los tableros digitales son más versátiles: permiten comunicación sin entrega física, incorporan síntesis de voz, son fáciles de personalizar, siempre disponibles en el dispositivo y no necesitan imprimir materiales. Ambos sistemas son complementarios; muchos profesionales usan PECS para el aprendizaje inicial y tableros digitales para la comunicación cotidiana.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Pueden los tableros de comunicación retrasar el desarrollo del habla?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. La evidencia científica actual (revisiones sistemáticas de ASHA y ISAAC) demuestra que el uso de AAC no retrasa el desarrollo del habla y en muchos casos lo potencia. Al reducir la frustración comunicativa, el sistema nervioso puede destinar más recursos al desarrollo del lenguaje oral. Los logopedas recomiendan introducir AAC cuanto antes, sin esperar a que el niño "falle" en el habla. La AAC y el habla son complementarias, no excluyentes.',
      },
    },
  ],
};
