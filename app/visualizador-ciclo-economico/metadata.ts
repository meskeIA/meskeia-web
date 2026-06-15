import type { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Ciclo Económico - Expansión, Recesión y Curva de Rendimientos | meskeIA',
  description:
    'Visualiza las fases del ciclo económico: expansión, pico, recesión y recuperación. Indicadores leading y lagging, curva de rendimientos invertida y su valor predictivo.',
  keywords: [
    'ciclo economico',
    'expansion economica',
    'recesion',
    'indicadores economicos',
    'curva rendimientos',
    'yield curve invertida',
    'PIB',
    'PMI',
    'indicadores leading',
    'indicadores lagging',
    'economia bachillerato',
  ],
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Ciclo Económico | meskeIA',
    description:
      'Fases del ciclo, indicadores leading/lagging y curva de rendimientos explicados visualmente',
    url: 'https://meskeia.com/visualizador-ciclo-economico/',
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
    title: 'Ciclo Económico — Expansión, Recesión y Yield Curve | meskeIA',
    description:
      'Fases del ciclo económico, indicadores líderes y curva de rendimientos invertida como predictor de recesión.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Ciclo Económico meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Visualizador del Ciclo Económico',
  description:
    'Herramienta educativa interactiva para comprender las fases del ciclo económico, los indicadores leading, coincident y lagging, la curva de rendimientos y su valor predictivo en recesiones.',
  url: 'https://meskeia.com/visualizador-ciclo-economico/',
  features: [
    'Animación SVG de las 4 fases del ciclo económico (expansión, pico, recesión, valle)',
    'Indicadores leading, coincident y lagging explicados con datos reales',
    'Curva de rendimientos normal, plana e invertida con animación',
    'Simulador interactivo para estimar la fase económica actual',
    'Ejemplos históricos de España y economías globales',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuáles son las 4 fases del ciclo económico?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ciclo económico tiene cuatro fases principales: expansión (crecimiento del PIB, baja tasa de paro, aumento del consumo e inversión), pico (máximo de actividad antes del giro), recesión (caída del PIB durante al menos dos trimestres consecutivos, aumento del desempleo y reducción del crédito) y valle o recuperación (mínimo del ciclo, donde la economía empieza a remontar). Estas fases no tienen una duración fija y su intensidad varía según el ciclo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son los indicadores económicos leading y lagging?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los indicadores leading (adelantados) anticipan los movimientos del ciclo económico entre 6 y 12 meses antes de que ocurran; entre los más conocidos están el PMI manufacturero, los permisos de construcción y la confianza del consumidor. Los indicadores lagging (rezagados) confirman una tendencia ya establecida, como la tasa de desempleo o los créditos bancarios. Los indicadores coincidentes, como el PIB o la producción industrial, reflejan la situación actual.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué la curva de rendimientos invertida predice recesiones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La curva de rendimientos invertida ocurre cuando los bonos a corto plazo ofrecen mayor rentabilidad que los bonos a largo plazo, algo que va en contra de la lógica habitual. Esto señala que los inversores esperan tipos de interés más bajos en el futuro, lo que suele ocurrir cuando se anticipa una recesión. Históricamente, una inversión sostenida de la curva (especialmente el diferencial entre el bono a 2 y a 10 años) ha precedido a recesiones en EE. UU. con un horizonte de 12-24 meses.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo afecta el ciclo económico a las inversiones personales?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cada fase del ciclo favorece distintos tipos de activos: en expansión, las acciones de sectores cíclicos (tecnología, consumo discrecional) suelen rendir bien; en el pico, los activos reales como las materias primas tienden a subir. En recesión, los bonos de alta calidad y los sectores defensivos (salud, alimentación) suelen ser más resistentes. En la recuperación, los activos de riesgo vuelven a tomar la delantera. Conocer la fase del ciclo no garantiza rentabilidad, pero ayuda a contextualizar las decisiones de cartera.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto dura normalmente una recesión económica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La duración de las recesiones varía considerablemente. En España, la recesión de 2008-2013 duró unos cinco años, mientras que la caída del PIB por la pandemia en 2020 fue breve pero muy intensa (dos trimestres). En EE. UU., desde la Segunda Guerra Mundial, la recesión media ha durado unos 10 meses. La profundidad y duración dependen de la causa (financiera, de demanda, de oferta), la respuesta de política monetaria y fiscal, y la estructura de la economía afectada.',
      },
    },
  ],
};
