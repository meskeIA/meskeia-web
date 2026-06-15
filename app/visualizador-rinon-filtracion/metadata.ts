import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Visualizador del Riñón y Filtración | Nefrona y Formación de Orina | meskeIA',
  description: 'Explora la nefrona y cómo los riñones filtran la sangre: filtración glomerular, reabsorción tubular, secreción y regulación hormonal (SRAA, ADH).',
  keywords: 'riñón, nefrona, filtración glomerular, reabsorción, TFG, aldosterona, ADH, SRAA, asa de Henle, túbulo colector',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Visualizador del Riñón y Filtración | meskeIA',
    description: '180 litros filtrados al día, 2 litros de orina. Aprende cómo funciona la nefrona y los riñones de forma visual.',
    url: 'https://meskeia.com/visualizador-rinon-filtracion/',
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
    title: 'Visualizador del Riñón - Explicador Visual',
    description: 'De la nefrona a la orina: cómo los riñones filtran 1.700 litros de sangre al día.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Visualizador Riñón meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Visualizador del Riñón y Filtración',
  description: 'Explicador visual interactivo del riñón: anatomía renal, nefrona con segmentos clickables, 3 procesos de formación de orina y regulación hormonal (SRAA, ADH).',
  url: 'https://meskeia.com/visualizador-rinon-filtracion/',
  category: 'EducationalApplication',
  features: [
    'Anatomía renal con zonas clickables',
    'Recorrido interactivo por la nefrona',
    'Los 3 procesos: filtración, reabsorción, secreción',
    'Regulación hormonal SRAA y ADH',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo filtran los riñones la sangre?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los riñones filtran la sangre a través de la nefrona, su unidad funcional. El proceso tiene tres etapas: filtración glomerular (donde la sangre se filtra en el glomérulo a una tasa de unos 125 ml/min), reabsorción tubular (el 99% del filtrado vuelve a la sangre) y secreción tubular (se eliminan sustancias residuales adicionales). El resultado final es aproximadamente 1,5-2 litros de orina al día.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la tasa de filtración glomerular (TFG) y por qué es importante?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La tasa de filtración glomerular (TFG) mide cuánta sangre filtran los glomérulos por minuto, normalmente entre 90 y 120 ml/min en adultos sanos. Es el indicador principal de la función renal: valores por debajo de 60 ml/min mantenidos más de tres meses indican enfermedad renal crónica. Se puede estimar con análisis de creatinina sérica sin necesidad de recogida de orina.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué papel tienen las hormonas ADH y aldosterona en la función renal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La hormona antidiurética (ADH) actúa sobre el túbulo colector aumentando la reabsorción de agua para concentrar la orina cuando hay deshidratación. La aldosterona, parte del sistema renina-angiotensina-aldosterona (SRAA), actúa en el túbulo distal para retener sodio y eliminar potasio, regulando así la presión arterial y el volumen de sangre. Ambas hormonas permiten al riñón adaptarse al estado de hidratación del organismo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el asa de Henle y qué función cumple?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El asa de Henle es un segmento tubular en forma de horquilla que desciende hacia la médula renal y vuelve a la corteza. Su función principal es crear un gradiente osmótico en la médula que permite concentrar la orina. La rama descendente es permeable al agua pero no a las sales; la rama ascendente, al contrario, bombea sodio y cloruro activamente sin dejar pasar agua, lo que es fundamental para la concentración urinaria.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánta sangre procesan los riñones al día?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los riñones reciben aproximadamente el 20-25% del gasto cardíaco, lo que equivale a unos 1.700 litros de sangre al día. De ese volumen, los glomérulos filtran alrededor de 180 litros de filtrado primario. Gracias a la reabsorción tubular, solo 1,5-2 litros se excretan finalmente como orina, recuperándose el 99% del filtrado inicial.',
      },
    },
  ],
};
