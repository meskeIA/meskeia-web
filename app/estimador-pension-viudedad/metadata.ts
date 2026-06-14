import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estimador Pensión de Viudedad 2026 — Cuantía y requisitos SS | meskeIA',
  description: 'Calcula la pensión de viudedad estimada según la Seguridad Social española 2026. Porcentaje aplicable (52%, 60% o 70%), base reguladora, pensión mínima garantizada y requisitos de acceso.',
  keywords: 'pension viudedad 2026, cuantia pension viudedad, como calcular pension viudedad, requisitos pension viudedad, pension viudedad 52 60 70 por ciento, base reguladora viudedad, pension minima viudedad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimador Pensión de Viudedad 2026 | meskeIA',
    description: 'Estima la cuantía de la pensión de viudedad: porcentaje (52/60/70%), mínimos garantizados y requisitos de la Seguridad Social.',
    url: 'https://meskeia.com/estimador-pension-viudedad/',
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
    title: 'Estimador Pensión de Viudedad 2026 | meskeIA',
    description: 'Calcula la pensión de viudedad 2026: base reguladora, porcentaje y mínimos garantizados',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Estimador Pensión Viudedad meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Estimador Pensión de Viudedad",
  description: "Calcula la pensión de viudedad estimada según la Seguridad Social española 2026. Porcentaje aplicable (52%, 60% o 70%), base reguladora, pensión mínima garantizada y requisitos de acceso.",
  url: "https://meskeia.com/estimador-pension-viudedad/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuánto es la pensión de viudedad en España en 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La cuantía de la pensión de viudedad depende del porcentaje aplicable sobre la base reguladora del fallecido. En 2026 se aplica el 52% con carácter general, el 60% para beneficiarios con 65 o más años sin otras rentas relevantes, y el 70% en casos de cargas familiares (hijos menores a cargo) con bajos ingresos. La pensión mínima garantizada para mayores de 65 años asciende a unos 11.940 € anuales (14 pagas).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué requisitos hay que cumplir para cobrar la pensión de viudedad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El cónyuge o pareja de hecho superviviente debe acreditar que el fallecido estaba en alta o situación asimilada en la Seguridad Social, o tenía al menos 15 años cotizados. Si el fallecimiento se produjo por enfermedad común, se exigen 500 días cotizados en los 5 años anteriores. Las parejas de hecho deben haber convivido al menos 5 años y estar inscritas en el registro correspondiente con al menos 2 años de antelación al fallecimiento.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula la base reguladora de la pensión de viudedad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Si el fallecido era trabajador en activo, la base reguladora se calcula dividiendo las bases de cotización de los 24 meses anteriores al fallecimiento entre 28. Si ya era pensionista por jubilación o incapacidad permanente, la base reguladora de la pensión de viudedad coincide con la cuantía de la pensión que percibía. Sobre esa base se aplica el porcentaje correspondiente (52%, 60% o 70%).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Se pierde la pensión de viudedad si se vuelve a casar o se convive con otra persona?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En general, contraer nuevo matrimonio implica la extinción de la pensión de viudedad. Sin embargo, desde 2010 existe una excepción: si el beneficiario tiene 61 o más años, o es declarado incapacitado permanente absoluto, o si la pensión es su única fuente de ingresos significativa, puede conservarla. La mera convivencia de hecho sin matrimonio no extingue la pensión, aunque puede generar nuevas obligaciones de comunicación a la Seguridad Social.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Tienen derecho a pensión de viudedad las parejas de hecho no casadas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, desde la reforma de 2007 las parejas de hecho tienen acceso a la pensión de viudedad en España, siempre que se cumplan ciertos requisitos adicionales: convivencia estable y notoria de al menos 5 años, inscripción en el registro de parejas de hecho con al menos 2 años de antelación al fallecimiento, e ingresos del superviviente que no superen determinados límites (el 50% de la suma de los ingresos de ambos, o el 25% de los propios). No basta con la convivencia de hecho sin registro.',
      },
    },
  ],
};
