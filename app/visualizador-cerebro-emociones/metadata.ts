import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'El Cerebro Emocional | Amígdala, Dopamina y Circuitos de Emoción | meskeIA',
  description:
    'Cómo el cerebro procesa las emociones: amígdala (circuito del miedo), corteza prefrontal (regulación), dopamina/serotonina/oxitocina y las 4 estrategias de regulación emocional.',
  keywords: [
    'cerebro emocional',
    'amigdala',
    'dopamina',
    'serotonina',
    'sistema limbico',
    'regulacion emocional',
    'corteza prefrontal',
    'neurotransmisores',
    'emociones',
  ],
  openGraph: {
    title: 'El Cerebro Emocional | meskeIA',
    description:
      'Amígdala, dopamina, circuito del miedo y regulación emocional: la neurociencia de las emociones explicada visualmente.',
    url: 'https://meskeia.com/visualizador-cerebro-emociones/',
    images: [{
      url: 'https://meskeia.com/og-image.png',
      width: 1200,
      height: 630,
      alt: 'meskeIA',
    }]
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LearningResource',
  name: 'El Cerebro Emocional',
  description:
    'Visualizador interactivo sobre el sistema límbico, neurotransmisores emocionales y regulación emocional.',
  url: 'https://meskeia.com/visualizador-cerebro-emociones/',
  provider: { '@type': 'Organization', name: 'meskeIA' },
  educationalLevel: 'secondary',
  learningResourceType: 'interactive',
  inLanguage: 'es',
};

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué parte del cerebro controla las emociones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las emociones no dependen de una sola región sino de una red llamada sistema límbico. La amígdala detecta amenazas y activa respuestas de miedo o alerta en milisegundos. El hipocampo vincula emociones con recuerdos. La corteza prefrontal regula y modera las respuestas emocionales de la amígdala. El hipotálamo coordina las respuestas corporales (frecuencia cardíaca, cortisol). La interacción entre estas estructuras determina cómo vivimos y gestionamos cada emoción.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué hace la dopamina en el cerebro y por qué es importante?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La dopamina es un neurotransmisor clave en el circuito de recompensa y motivación. Se libera en anticipación de una recompensa (no solo al recibirla), lo que impulsa conductas de búsqueda y aprendizaje. Niveles bajos se asocian con depresión y falta de motivación; niveles anormalmente altos o desequilibrios en sus receptores se vinculan con adicciones y esquizofrenia. También participa en el control motor (su deficiencia es central en el Parkinson).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre serotonina y dopamina?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La dopamina se asocia principalmente con motivación, anticipación de recompensas y movimiento. La serotonina regula el estado de ánimo general, el sueño, el apetito y la satisfacción. La dopamina impulsa a "querer"; la serotonina favorece el "estar bien". Los antidepresivos ISRS actúan sobre la serotonina, mientras que los medicamentos para el TDAH suelen actuar sobre dopamina y noradrenalina. Ambos sistemas interactúan continuamente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la regulación emocional y cuáles son las estrategias más efectivas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La regulación emocional es la capacidad de modular la intensidad, duración y expresión de las emociones. Las cuatro estrategias principales estudiadas en neurociencia son: reapreciación cognitiva (reinterpretar la situación, la más eficaz a largo plazo), supresión expresiva (ocultar la emoción, coste cognitivo alto), resolución de problemas y distracción atencional. La meditación de atención plena refuerza la conectividad entre corteza prefrontal y amígdala, mejorando la regulación con práctica sostenida.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la amígdala y cómo provoca el "secuestro emocional"?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La amígdala es una estructura con forma de almendra en el lóbulo temporal que actúa como sistema de alarma del cerebro. Ante una amenaza percibida, activa la respuesta de lucha-huida-parálisis en menos de 200 milisegundos, liberando adrenalina y cortisol antes de que la corteza prefrontal (razonamiento) pueda procesar la información. Daniel Goleman denominó esto "secuestro amocional": la emoción toma el control antes que el pensamiento racional. La respiración lenta y el tiempo son las herramientas más eficaces para reactivar la corteza prefrontal.',
      },
    },
  ],
};
