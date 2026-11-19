import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';
import { BANDAS_1RM, rangoBanda1RM, REPS_MAX_1RM } from '@/lib/calculadoras/deporte';

export const metadata: Metadata = {
  title: 'Calculadora de 1RM — Repetición Máxima | meskeIA',
  description: 'Calcula tu repetición máxima (1RM) en el gimnasio a partir del peso y las repeticiones realizadas. Obtén tu tabla de cargas de entrenamiento por porcentaje con las fórmulas Epley y Brzycki.',
  keywords: 'calculadora 1rm, repeticion maxima, 1 rep max, fuerza maxima, epley, brzycki, tabla cargas entrenamiento, porcentaje 1rm, gimnasio, powerlifting',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora de 1RM — Repetición Máxima',
    description: 'Calcula tu fuerza máxima en cualquier ejercicio y obtén la tabla de cargas por porcentaje.',
    url: 'https://meskeia.com/calculadora-1rm-gimnasio',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [
      {
        url: 'https://meskeia.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'meskeIA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de 1RM — Repetición Máxima | meskeIA',
    description: 'Calcula tu fuerza máxima en cualquier ejercicio con las fórmulas Epley y Brzycki.',
    images: ['https://meskeia.com/og-image.png'],
  },
  other: {
    'application-name': 'Calculadora 1RM meskeIA',
  },
};

// Schema.org JSON-LD para indexación por buscadores e IAs
export const jsonLd = generateWebAppSchema({
  name: 'Calculadora de 1RM — Repetición Máxima',
  description: 'Calcula tu repetición máxima (1RM) en el gimnasio a partir del peso y las repeticiones realizadas. Obtén tu tabla de cargas de entrenamiento por porcentaje con las fórmulas Epley y Brzycki.',
  url: 'https://meskeia.com/calculadora-1rm-gimnasio/',
  category: 'UtilityApplication',
  features: [
    'Estimación del 1RM con las fórmulas de Epley y Brzycki a partir del peso y las repeticiones',
    'Media aritmética de las dos fórmulas como valor de referencia',
    'Tabla de cargas del 60 % al 100 % del 1RM en pasos del 5 %',
    'Repeticiones aproximadas y uso habitual de cada porcentaje',
    'Admite decimales con coma (102,5 kg)',
    `Aviso fuera del rango de 1 a ${REPS_MAX_1RM} repeticiones`,
  ],
});

// Las bandas de % del 1RM salen de la misma constante que la tabla y la guía (hallazgo 5255)
const [FUERZA, HIPERTROFIA, RESISTENCIA] = BANDAS_1RM;

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el 1RM y para qué sirve en el entrenamiento de fuerza?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `El 1RM (una repetición máxima) es el peso máximo que una persona puede levantar en un ejercicio determinado realizando una sola repetición con técnica correcta. Sirve como referencia para planificar el entrenamiento de fuerza: los distintos objetivos se trabajan con porcentajes específicos del 1RM; según las bandas orientativas de la NSCA, ${rangoBanda1RM(HIPERTROFIA)} para hipertrofia (${HIPERTROFIA.reps} repeticiones) y ${rangoBanda1RM(FUERZA)} para fuerza máxima (${FUERZA.reps} repeticiones).`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre las fórmulas de Epley y Brzycki para calcular el 1RM?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Ambas fórmulas estiman el 1RM a partir del peso levantado y el número de repeticiones: Epley, 1RM = peso × (1 + reps/30), y Brzycki, 1RM = peso × 36 / (37 − reps). Dan lo mismo con 10 repeticiones; por debajo de 10, Epley da una cifra algo mayor, y por encima la mayor es Brzycki, que crece cada vez más deprisa porque su denominador se acerca a cero. Esta calculadora muestra las dos y su media aritmética, y solo admite de 1 a ${REPS_MAX_1RM} repeticiones.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Es seguro intentar levantar el 1RM real en el gimnasio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Intentar el 1RM real conlleva mayor riesgo de lesión, especialmente para personas con poca experiencia en entrenamiento de fuerza. Las fórmulas de estimación permiten calcular el 1RM de forma indirecta a partir de un peso submáximo (por ejemplo, un peso que puedes levantar 5-8 repeticiones), que es más seguro y suficientemente preciso para programar el entrenamiento. Si se realiza una prueba real, es imprescindible el acompañamiento de un ayudante.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo uso la tabla de porcentajes del 1RM para programar mis entrenamientos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Una vez conoces tu 1RM estimado, la tabla de porcentajes te dice qué peso usar según tu objetivo. Sus bandas son las orientativas de la NSCA: ${rangoBanda1RM(FUERZA)} del 1RM para fuerza máxima (${FUERZA.reps} repeticiones), ${rangoBanda1RM(HIPERTROFIA)} para hipertrofia (${HIPERTROFIA.reps}) y ${rangoBanda1RM(RESISTENCIA)} para resistencia muscular (${RESISTENCIA.reps}). Estos rangos deben adaptarse al nivel y objetivos individuales.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Con cuántas repeticiones es más fiable la estimación del 1RM?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `La estimación del 1RM es más precisa cuando se realiza con un número bajo de repeticiones, idealmente entre 3 y 8. Con más de 10 repeticiones el margen de error aumenta considerablemente, porque la fatiga, la técnica y la resistencia aeróbica influyen en el resultado; por eso esta calculadora no admite más de ${REPS_MAX_1RM}. Para obtener la estimación más fiable, elige un peso con el que puedas hacer entre 4 y 6 repeticiones al fallo técnico.`,
      },
    },
  ],
};
