import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Germinación - De la Semilla a la Planta | meskeIA',
  description: 'Descubre cómo germina una semilla: anatomía, fases del proceso, factores necesarios y datos fascinantes. Explicador visual interactivo de biología vegetal.',
  keywords: 'germinación, semilla, plántula, radícula, plúmula, cotiledones, testa, imbibición, biología vegetal, botánica, explicador visual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Germinación - De la Semilla a la Planta',
    description: 'El viaje de una semilla hasta convertirse en planta, explicado visualmente paso a paso.',
    url: 'https://meskeia.com/visualizador-germinacion/',
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
    title: 'Germinación - Explicador Visual',
    description: 'De semilla a planta: anatomía, fases, factores y datos curiosos sobre la germinación.',
    images: ['https://meskeia.com/og-image.png']
  },
  other: { 'application-name': 'Germinación Explicador meskeIA' },
};

export const jsonLd = generateWebAppSchema({
  name: 'Germinación - De la Semilla a la Planta',
  description: 'Explicador visual interactivo sobre la germinación: anatomía de la semilla, fases del proceso paso a paso, factores necesarios y datos fascinantes del mundo vegetal.',
  url: 'https://meskeia.com/visualizador-germinacion/',
  category: 'EducationalApplication',
  features: [
    'Anatomía de semilla con partes clickables',
    'Proceso de germinación animado paso a paso',
    'Factores de germinación con controles interactivos',
    'Datos fascinantes sobre semillas y plantas',
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es la germinación de una semilla?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La germinación es el proceso por el cual una semilla latente retoma su actividad metabólica y da lugar a una nueva planta. Comienza con la imbibición (absorción de agua), continúa con la activación enzimática y culmina con la emergencia de la radícula, que es la primera raíz del embrión.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuáles son las fases de la germinación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La germinación se divide en tres fases principales: imbibición (absorción rápida de agua que reactiva el metabolismo), activación (síntesis de enzimas que movilizan las reservas del endospermo) y elongación (crecimiento del embrión hasta que la radícula rompe la testa y emerge al exterior). La temperatura, la humedad y el oxígeno son determinantes en cada fase.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué factores influyen en la germinación de las semillas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los tres factores imprescindibles son agua, temperatura adecuada y oxígeno. Algunas especies también necesitan luz (semillas fotoblásticas positivas, como la lechuga) o periodos de frío previo (vernalización). La luz inhibe la germinación en otras especies como las cebollas. El sustrato y la profundidad de siembra también condicionan el éxito germinativo.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre germinación epígea e hipógea?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En la germinación epígea los cotiledones emergen por encima del suelo (como en las judías o los girasoles), mientras que en la hipógea permanecen bajo tierra (como en los guisantes o el maíz). La diferencia radica en si el hipocótilo o el epicótilo es el segmento que se alarga durante el crecimiento inicial.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto tiempo tarda en germinar una semilla?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende de la especie y las condiciones ambientales. Semillas de rábano o tomate pueden germinar en 3-7 días en condiciones óptimas, mientras que robles o palmeras pueden tardar varios meses. Las semillas del loto sagrado son capaces de germinar tras más de 1.000 años de latencia, lo que las convierte en las de mayor longevidad documentada.',
      },
    },
  ],
};
