import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Componentes de la Sangre - Tubo de Ensayo Visual | meskeIA',
  description: 'Descubre los componentes de la sangre: glóbulos rojos, blancos, plaquetas y plasma. Grupos sanguíneos ABO/Rh, cascada de coagulación y valores de un análisis.',
  keywords: 'sangre, glóbulos rojos, eritrocitos, leucocitos, plaquetas, plasma, grupos sanguíneos, ABO, Rh, coagulación, hematocrito, hemoglobina, análisis sangre',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Componentes de la Sangre - Tubo de Ensayo Visual',
    description: 'Plasma, glóbulos rojos, blancos y plaquetas explicados visualmente. Grupos ABO/Rh y coagulación.',
    url: 'https://meskeia.com/visualizador-sangre-componentes/',
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
    title: 'Componentes de la Sangre - Tubo de Ensayo Visual',
    description: 'Plasma, eritrocitos, leucocitos, plaquetas, grupos ABO/Rh y cascada de coagulación.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Sangre Componentes meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Componentes de la Sangre - Tubo de Ensayo Visual',
  description: 'Explicador visual interactivo de los componentes de la sangre humana: tubo de ensayo centrifugado, grupos sanguíneos ABO/Rh, cascada de coagulación y valores normales de un análisis.',
  url: 'https://meskeia.com/visualizador-sangre-componentes/',
  category: 'EducationalApplication',
  features: [
    'Tubo de ensayo centrifugado con las 3 capas visibles',
    'Tabla de compatibilidad donante-receptor ABO/Rh',
    'Cascada de coagulación paso a paso',
    'Valores normales de un análisis de sangre',
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
      name: '¿Cuáles son los componentes principales de la sangre?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La sangre humana se compone de cuatro elementos principales: plasma (55% del volumen, líquido amarillento con agua, proteínas, glucosa, hormonas y electrolitos), glóbulos rojos o eritrocitos (el 45% restante, transportan oxígeno mediante hemoglobina), glóbulos blancos o leucocitos (defienden el organismo frente a infecciones, representan menos del 1%) y plaquetas o trombocitos (fragmentos celulares esenciales para la coagulación). Si se centrifuga una muestra, estas capas quedan visibles en el tubo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona el sistema de grupos sanguíneos ABO y Rh?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El sistema ABO clasifica la sangre según los antígenos presentes en la superficie de los glóbulos rojos: tipo A (antígeno A), tipo B (antígeno B), tipo AB (ambos antígenos, receptor universal) y tipo O (ninguno, donante universal de eritrocitos). El factor Rh añade una segunda capa: si se tiene el antígeno D eres Rh positivo; si no, Rh negativo. Recibir sangre de un grupo incompatible puede desencadenar una reacción hemolítica potencialmente mortal, de ahí la importancia del tipaje antes de una transfusión.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la cascada de coagulación y cómo detiene una hemorragia?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La cascada de coagulación es una serie de reacciones enzimáticas en cadena que se activan ante una lesión vascular. Existen dos vías: la intrínseca (activa da por contacto con superficies lesionadas) y la extrínseca (activada por el factor tisular liberado al exterior). Ambas convergen en la vía común, que transforma el fibrinógeno en fibrina; la fibrina forma una red que atrapa plaquetas y eritrocitos creando el coágulo definitivo. Factores como la vitamina K son esenciales para sintetizar varios de estos factores de coagulación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué valores de un análisis de sangre se consideran normales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los valores de referencia habituales en adultos son: hemoglobina 12-16 g/dL (mujeres) y 13,5-17,5 g/dL (hombres), hematocrito 36-46% (mujeres) y 41-53% (hombres), leucocitos 4.500-11.000/µL, plaquetas 150.000-400.000/µL y glucosa en ayunas 70-100 mg/dL. Estos rangos varían según el laboratorio, la edad y otros factores; un resultado fuera de rango requiere valoración médica contextualizada, no interpretación aislada.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tiempo viven los glóbulos rojos y dónde se producen?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los glóbulos rojos se producen en la médula ósea roja (proceso llamado eritropoyesis, estimulado por la hormona eritropoyetina) y tienen una vida media de aproximadamente 120 días. Al envejecer son destruidos principalmente en el bazo y el hígado, y sus componentes —especialmente el hierro de la hemoglobina— se reciclan para fabricar nuevos eritrocitos. Una producción insuficiente o una destrucción excesiva provoca anemia, cuyos síntomas incluyen fatiga, palidez y falta de aliento.',
      },
    },
  ],
};
