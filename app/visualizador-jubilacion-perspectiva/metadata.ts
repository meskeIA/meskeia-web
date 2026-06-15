import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Tu Jubilación en Perspectiva - Timeline Visual | meskeIA',
  description: 'Visualiza tu vida laboral como una línea temporal: cuántos años cotizas, qué porcentaje de pensión generas y cómo cambia según cuándo empezaste a trabajar.',
  keywords: 'jubilación perspectiva, años cotizados, porcentaje pensión, vida laboral, timeline jubilación, explicador visual, seguridad social',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Tu Jubilación en Perspectiva - Timeline Visual',
    description: 'Timeline interactivo de tu vida laboral: años cotizados, porcentaje de pensión y edad de jubilación.',
    url: 'https://meskeia.com/visualizador-jubilacion-perspectiva/',
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
    title: 'Tu Jubilación en Perspectiva',
    description: 'Visualiza tu carrera laboral y cómo se traduce en pensión.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Jubilación Perspectiva meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Tu Jubilación en Perspectiva',
  description: 'Explicador visual de la jubilación española: timeline interactivo que muestra cuántos años cotizas según cuándo empiezas, qué porcentaje de pensión generas, y cómo cada año extra de cotización impacta tu pensión futura.',
  url: 'https://meskeia.com/visualizador-jubilacion-perspectiva/',
  features: [
    'Timeline visual de vida laboral desde los 18 a los 67',
    'Cálculo del porcentaje de pensión según años cotizados',
    'Slider de edad de inicio de cotización',
    'Gráfico de evolución del porcentaje de pensión por años',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuántos años hay que cotizar para cobrar el 100% de la pensión en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Con la reforma de 2023, para cobrar el 100% de la pensión de jubilación en España se necesitan 37 años cotizados en 2027 (plazo transitorio). Con 25 años cotizados se recibe aproximadamente el 80% y cada año adicional suma entre un 2% y un 3% al porcentaje. Jubilarse con menos de 15 años cotizados no genera derecho a pensión contributiva.',
      },
    },
    {
      '@type': 'Question',
      name: '¿A qué edad se puede jubilar una persona en España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La edad ordinaria de jubilación en España se sitúa en 66 años y 8 meses para 2025 y avanzará progresivamente hasta los 67 años en 2027 para quienes no acrediten 38 años y 6 meses de cotización. Quienes superen ese umbral de cotización pueden jubilarse a los 65 años. Existe también la jubilación anticipada voluntaria a partir de los 63 años con penalizaciones por cada trimestre adelantado.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué pasa si empiezo a trabajar tarde y cotizo pocos años?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Empezar a cotizar tarde reduce tanto el número de años de cotización como la base reguladora de la pensión. Por ejemplo, quien empiece a trabajar a los 30 años y se jubile a los 67 habrá cotizado 37 años, justo al límite para el 100%. Si solo cotizara 25 años, su pensión sería aproximadamente el 80% de la base reguladora. El visualizador permite comparar estas trayectorias de forma gráfica.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula la base reguladora de la pensión de jubilación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La base reguladora se calcula a partir de las bases de cotización de los últimos 25 años (300 meses), actualizadas por el IPC. Se divide la suma total entre 350. Es el importe mensual sobre el que se aplica el porcentaje según los años cotizados para obtener la pensión bruta. Cuanto más elevadas y estables sean las cotizaciones en esos 25 años, mayor será la base reguladora.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Vale la pena cotizar un año más para mejorar la pensión?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende del punto de partida: entre los primeros 15 y 25 años cotizados, cada año extra suma un 3% al porcentaje de pensión; entre los 25 y 37 años suma un 2% anual. Un año adicional puede traducirse en 30-80 € más de pensión mensual, dependiendo de la base reguladora. Durante toda la vida de la jubilación ese diferencial acumulado puede superar 10.000-20.000 €.',
      },
    },
  ],
};
