import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';
import { CONDUCTA_GRADO_3, FUENTE_CONDUCTA_GRADO_3 } from './motor';

export const metadata: Metadata = {
  title: 'Orientador Tensión Arterial - Clasifica tu Presión según la guía ESH 2023 | meskeIA',
  description: 'Introduce tu tensión arterial sistólica y diastólica y obtén tu clasificación según las guías europeas ESH 2023. Calcula TAM, presión de pulso y guarda tu historial.',
  keywords: 'calculadora tension arterial, presion arterial, hipertension, clasificacion tension, sistolica, diastolica, TAM, ESH, ESC, hipertension grado 1, hipotension, tension alta',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Orientador Tensión Arterial | meskeIA',
    description: 'Clasifica tu presión arterial según las guías ESH 2023 y guarda tu historial de mediciones.',
    url: 'https://meskeia.com/orientador-tension-arterial/',
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
    title: 'Orientador Tensión Arterial | meskeIA',
    description: 'Clasifica tu presión arterial según guías europeas ESH 2023. Historial de mediciones incluido.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Calculadora Tensión Arterial meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Orientador Tensión Arterial",
  description: "Introduce tu tensión arterial sistólica y diastólica y obtén tu clasificación según las guías europeas ESH 2023. Calcula TAM, presión de pulso y guarda tu historial.",
  url: "https://meskeia.com/orientador-tension-arterial/",
  category: 'UtilityApplication',
  features: [
    'Clasificación de tensión arterial según la tabla de la guía ESH 2023 (óptima, normal, normal-alta, HTA grados 1-3)',
    'HTA sistólica aislada (≥ 140 / < 90 mmHg) y diastólica aislada (< 140 / ≥ 90 mmHg), graduadas como indica la ESH 2023',
    'Cálculo de TAM (Tensión Arterial Media) con fórmula diastólica + (sistólica − diastólica) / 3',
    'Cálculo e interpretación de la presión de pulso (normal 40-60 mmHg)',
    'Historial de mediciones con almacenamiento local (hasta 20 entradas)',
    'Tabla de referencia visual con rangos por categoría',
    'Ante una lectura de grado 3 (≥ 180 y/o ≥ 110 mmHg), conducta según síntomas: 112 con síntomas de alarma; sin ellos, repetir en reposo y contactar con el médico en el día (criterio de la ESC Council on Hypertension, fuera de la tabla ESH)',
    'Aviso de tensión baja por debajo de 90/60 mmHg, criterio propio fuera de la tabla ESH',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuáles son los valores normales de tensión arterial?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Según las guías europeas ESH 2023, la tensión arterial óptima es inferior a 120/80 mmHg. Se considera normal entre 120-129/80-84 mmHg, y normal-alta entre 130-139/85-89 mmHg. A partir de 140/90 mmHg se clasifica como hipertensión grado 1.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre tensión sistólica y diastólica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La tensión sistólica (el número mayor) mide la presión en las arterias cuando el corazón late y bombea sangre. La diastólica (el número menor) mide la presión cuando el corazón está en reposo entre latidos. Ambos valores son necesarios para clasificar correctamente la presión arterial.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la TAM o presión arterial media?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La TAM (Tensión Arterial Media) representa la presión de perfusión promedio que llega a los órganos durante un ciclo cardíaco completo. Se calcula como diastólica + (sistólica − diastólica) / 3. Un valor normal está entre 70 y 100 mmHg (orientativo: el techo varía entre fuentes); por debajo de 60 mmHg puede indicar riesgo de hipoperfusión orgánica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Con qué frecuencia debo medirme la tensión arterial en casa?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para el seguimiento habitual en personas con hipertensión conocida, se recomienda medir dos veces por la mañana y dos veces por la tarde durante 7 días consecutivos (protocolo HBPM). Para control preventivo en personas sanas, una medición mensual es suficiente. Siempre medir en reposo, sentado, con 5 minutos de espera previa.',
      },
    },
    {
      '@type': 'Question',
      name: '¿A partir de qué cifra debo consultar al médico urgentemente?',
      acceptedAnswer: {
        '@type': 'Answer',
        // El mismo texto que el resultado y la FAQ visible (hallazgo 2564, 01/10/2026).
        text: `Con una lectura muy elevada (grado 3 de la guía ESH 2023: sistólica ≥ 180 y/o diastólica ≥ 110 mmHg), lo que decide es si hay síntomas. ${CONDUCTA_GRADO_3.conSintomas} ${CONDUCTA_GRADO_3.sinSintomas} Fuente: ${FUENTE_CONDUCTA_GRADO_3}.`,
      },
    },
  ],
};
