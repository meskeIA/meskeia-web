import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

/*
 * UNA respuesta por pregunta, que importan el FAQPage y la FAQ visible de page.tsx: antes cada
 * boca tenía su texto, y el FAQPage daba el absoluto «≈1-2 ms» sin cifra para el relativo
 * mientras la pantalla daba «relativo (3-5 ms)» (hallazgo 2955; receta de
 * simulador-gastos-compraventa-garaje).
 */
export const RESPUESTA_TODO_O_NADA =
  'Una neurona o dispara un potencial de acción completo o no dispara nada. Si el estímulo no alcanza el umbral, no hay potencial de acción: solo una respuesta local subumbral que decae sin propagarse. Si lo alcanza (o lo supera), el potencial de acción es siempre del mismo tamaño y forma, sea cual sea la intensidad: aumentarla no produce un potencial «más grande», sino más potenciales por segundo. Por eso la información del sistema nervioso se codifica en la frecuencia de disparo, no en la amplitud.';

export const RESPUESTA_REFRACTARIO =
  'Tras un potencial de acción hay un breve tiempo en que la neurona no puede volver a disparar como antes. En el periodo refractario absoluto (1-2 ms) los canales de Na⁺ están inactivados y es imposible generar otro potencial de acción, por grande que sea el estímulo. En el relativo (3-5 ms) los canales de K⁺ siguen abiertos, el potencial está en hiperpolarización y solo un estímulo más intenso que el normal desencadena un nuevo disparo. El absoluto limita la frecuencia máxima de disparo a unos 500 Hz e impide que el potencial de acción «se devuelva» por donde llegó.';

export const metadata: Metadata = {
  title: 'Simulador del Potencial de Acción Neuronal | meskeIA',
  description: 'Visualiza el disparo de una neurona: despolarización, repolarización, hiperpolarización y periodos refractarios. Estímulo configurable y umbral ajustable.',
  keywords: 'potencial de acción, neurona, fisiología, despolarización, repolarización, periodo refractario, canales sodio potasio, todo o nada, EBAU, Bachillerato, biología',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-potencial-accion/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador del Potencial de Acción Neuronal | meskeIA',
    description: 'La ley del "todo o nada" en directo: estímulo subumbral nada pasa, supraumbral dispara potencial completo.',
    url: 'https://meskeia.com/simulador-potencial-accion/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{
      url: 'https://meskeia.com/stemum/og-image.png',
      width: 1200,
      height: 630,
      alt: 'Stemum — el portal de ciencia interactiva de meskeIA',
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador del Potencial de Acción | meskeIA',
    description: 'Lanza estímulos a una neurona y observa el disparo (o no) según la regla "todo o nada".',
    images: ['https://meskeia.com/stemum/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador del Potencial de Acción Neuronal',
  description: 'Simulador interactivo del potencial de acción de una neurona con un modelo de integrador con fuga y umbral. Visualiza la evolución del potencial de membrana V_m a lo largo del tiempo: potencial de reposo, respuesta subumbral o supraumbral, despolarización rápida (canales Na⁺), repolarización (canales K⁺), hiperpolarización post-disparo y periodo refractario. Permite ajustar la intensidad y la duración del estímulo, el umbral de disparo y el intervalo entre pulsos. Demuestra la ley del &quot;todo o nada&quot; y por qué un estímulo subumbral no produce disparo. Ideal para EBAU de Biología, Bachillerato y fisiología universitaria.',
  url: 'https://meskeia.com/simulador-potencial-accion/',
  category: 'EducationalApplication',
  features: [
    'Trazado V_m(t) con las 5 fases del potencial de acción, recalculado al mover cada control',
    'Estímulo de intensidad y duración configurables',
    'Umbral de disparo ajustable, de −65 a −40 mV',
    'Ley del "todo o nada" demostrada visualmente',
    'Estímulo sostenido: produce trenes de PA con frecuencia variable',
    'Periodos refractarios absoluto y relativo incluidos en el modelo',
    'Estadísticos: latencia, frecuencia, altura del pico',
  ],
  keywords: ['potencial de acción', 'neurona', 'despolarización', 'todo o nada', 'EBAU', 'Bachillerato', 'biología'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el potencial de acción de una neurona?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El potencial de acción es una señal eléctrica que recorre el axón de una neurona cuando el estímulo supera un umbral de voltaje (típicamente −55 mV). Consiste en una rápida despolarización (entrada de Na⁺ que eleva el potencial hasta +40 mV) seguida de una repolarización (salida de K⁺) e hiperpolarización transitoria antes de recuperar el potencial de reposo (−70 mV). Es la forma en que las neuronas transmiten información.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué significa la ley del "todo o nada" en neurociencia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: RESPUESTA_TODO_O_NADA,
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son las fases del potencial de acción?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Las fases son: (1) potencial de reposo (−70 mV), (2) despolarización rápida cuando los canales de Na⁺ se abren y el voltaje sube hasta +40 mV, (3) repolarización por apertura de canales de K⁺ y cierre de canales de Na⁺, (4) hiperpolarización por debajo del potencial de reposo, y (5) retorno al reposo. Después existe un periodo refractario absoluto (imposible disparar) y uno relativo (se necesita un estímulo más intenso).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para qué sirve este simulador en Bachillerato y preparatoria?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El simulador permite visualizar interactivamente las 5 fases del potencial de acción ajustando la intensidad y la duración del estímulo y el umbral de disparo. Esto ayuda a comprender conceptos del temario de Biología de 2.º de Bachillerato (España) y de preparatoria en Latinoamérica: la ley del "todo o nada", los periodos refractarios y los canales iónicos. Es especialmente útil para preparar la EBAU/PAES y exámenes universitarios de fisiología.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre periodo refractario absoluto y relativo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: RESPUESTA_REFRACTARIO,
      },
    },
  ],
};
