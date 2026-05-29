import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

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
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Calculadora de 1RM — Repetición Máxima | meskeIA',
    description: 'Calcula tu fuerza máxima en cualquier ejercicio con las fórmulas Epley y Brzycki.',
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
    'Fórmulas Epley y Brzycki para el cálculo del 1RM',
    'Tabla completa de cargas por porcentaje (60%–100%)',
    'Cálculo para cualquier ejercicio de fuerza',
    'Comparativa de ambas fórmulas con media ponderada',
    'Funciona 100% en el navegador, sin registro ni instalación',
    'Gratuito y sin publicidad',
    'Disponible en español',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el 1RM y para qué sirve en el entrenamiento de fuerza?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El 1RM (una repetición máxima) es el peso máximo que una persona puede levantar en un ejercicio determinado realizando una sola repetición con técnica correcta. Sirve como referencia para planificar el entrenamiento de fuerza: los distintos objetivos (hipertrofia, fuerza máxima, resistencia muscular) se trabajan con porcentajes específicos del 1RM, por ejemplo al 70-80% para hipertrofia o al 85-95% para fuerza máxima.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre las fórmulas de Epley y Brzycki para calcular el 1RM?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ambas fórmulas estiman el 1RM a partir del peso levantado y el número de repeticiones. La fórmula de Epley (1RM = peso × (1 + reps/30)) tiende a ser ligeramente más generosa en repeticiones altas. La fórmula de Brzycki (1RM = peso × 36 / (37 − reps)) es más precisa para rangos bajos de repeticiones (1-10 reps). Para mayor fiabilidad se recomienda usar ambas y tomar la media, que es lo que hace esta calculadora.',
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
        text: 'Una vez conoces tu 1RM estimado, puedes consultar la tabla de porcentajes para saber qué peso usar según tu objetivo. El rango del 60-70% del 1RM se usa habitualmente para resistencia muscular (12-20 repeticiones); el 70-80%, para hipertrofia (8-12 reps); el 80-90%, para fuerza (4-6 reps); y por encima del 90%, para fuerza máxima y entrenamiento de potencia (1-3 reps). Estos rangos son orientativos y deben adaptarse al nivel y objetivos individuales.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Con cuántas repeticiones es más fiable la estimación del 1RM?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La estimación del 1RM es más precisa cuando se realiza con un número bajo de repeticiones, idealmente entre 3 y 8. Con más de 10 repeticiones el margen de error aumenta considerablemente, porque la fatiga, la técnica y la resistencia aeróbica influyen en el resultado. Para obtener la estimación más fiable, elige un peso con el que puedas hacer entre 4 y 6 repeticiones al fallo técnico.',
      },
    },
  ],
};
