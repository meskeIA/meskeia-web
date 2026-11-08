import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';
import { FISCAL_PENSIONES_META } from '@/data/fiscal';
import { MINIMOS_VIUDEDAD_2026, COMPLEMENTO_MINIMOS_LIMITES_2026 } from '@/data/fiscal/pensiones';
import { formatCurrency } from '@/lib/formatters';

// Las cuantías del FAQPage salen del módulo: la de ≥ 65 años iba tecleada («unos 11.940 €»)
// y se quedó 1.166,80 € por debajo del Anexo I del RD 241/2026 (hallazgo 2813).
const minimo65Anual = formatCurrency(MINIMOS_VIUDEDAD_2026.desde65oDiscapacidad65 * 14);
const minimo65Mensual = formatCurrency(MINIMOS_VIUDEDAD_2026.desde65oDiscapacidad65);
const limiteRentas = formatCurrency(COMPLEMENTO_MINIMOS_LIMITES_2026.sinConyuge);

// Año del título: la vigencia del módulo que sella los datos. Sale del dato
// y no se escribe a mano (lo exige check:anio-titulo).
const anio = FISCAL_PENSIONES_META.vigencia;

export const metadata: Metadata = {
  title: `Estimador Pensión de Viudedad ${anio} — Cuantía y requisitos SS | meskeIA`,
  description: 'Calcula la pensión de viudedad estimada según la Seguridad Social española 2026. Porcentaje aplicable (52%, 60% o 70%), base reguladora, pensión mínima garantizada y requisitos de acceso.',
  keywords: 'pension viudedad 2026, cuantia pension viudedad, como calcular pension viudedad, requisitos pension viudedad, pension viudedad 52 60 70 por ciento, base reguladora viudedad, pension minima viudedad',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: `Estimador Pensión de Viudedad ${anio} | meskeIA`,
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
    title: `Estimador Pensión de Viudedad ${anio} | meskeIA`,
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
        text: `La cuantía de la pensión de viudedad depende del porcentaje aplicable sobre la base reguladora del fallecido. En 2026 se aplica el 52 % con carácter general, el 60 % para beneficiarios con 65 o más años sin otras rentas relevantes, y el 70 % en casos de cargas familiares (hijos menores a cargo) con bajos ingresos. La cuantía mínima para mayores de 65 años es de ${minimo65Anual} anuales (${minimo65Mensual} al mes en 14 pagas); el complemento que lleva hasta ella exige rentas propias por debajo de ${limiteRentas} al año.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué requisitos hay que cumplir para cobrar la pensión de viudedad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Si el fallecido estaba en alta o en situación asimilada, debe haber cotizado 500 días dentro de los 5 años anteriores al fallecimiento; si no estaba en alta, 15 años en toda su vida laboral. Si la muerte se debió a un accidente, sea o no de trabajo, o a una enfermedad profesional, no se exige ningún período previo (art. 219.1 LGSS). Las parejas de hecho deben haber convivido al menos 5 años, salvo que tengan hijos en común, y estar inscritas en el registro correspondiente con al menos 2 años de antelación al fallecimiento.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula la base reguladora de la pensión de viudedad?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Si el fallecimiento se debe a una enfermedad común y el fallecido no era pensionista, la base reguladora es la suma de sus bases de cotización de 24 meses seguidos, elegidos por los beneficiarios dentro de los 15 años anteriores al fallecimiento, dividida entre 28 (art. 7.2 del Decreto 1646/1972). Si ya era pensionista de jubilación o incapacidad permanente, es la misma base reguladora que sirvió para calcular su pensión, con las revalorizaciones posteriores (art. 7.3); no coincide con lo que cobraba salvo que cobrase el 100 % de esa base. Sobre ella se aplica el porcentaje correspondiente (52 %, 60 % o 70 %).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Se pierde la pensión de viudedad si se vuelve a casar o se convive con otra persona?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En general, contraer nuevo matrimonio implica la extinción de la pensión de viudedad. Desde 2002 (Real Decreto 1465/2001) existe una excepción que exige cumplir a la vez tres requisitos (art. 11 de la Orden de 13/02/1967): tener más de 61 años, o menos con incapacidad permanente absoluta, gran invalidez o una discapacidad de al menos el 65 %; que la pensión de viudedad sea la principal o única fuente de ingresos, es decir, al menos el 75 % de los ingresos anuales; y que los ingresos anuales del nuevo matrimonio, pensión incluida, no superen dos veces el salario mínimo interprofesional en cómputo anual. Con la edad sola no basta. La mera convivencia de hecho sin matrimonio no extingue la pensión, aunque puede generar nuevas obligaciones de comunicación a la Seguridad Social.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Tienen derecho a pensión de viudedad las parejas de hecho no casadas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, desde la reforma de 2007 las parejas de hecho tienen acceso a la pensión de viudedad en España, siempre que se cumplan ciertos requisitos adicionales: convivencia estable y notoria de al menos 5 años (salvo hijos en común) e inscripción en el registro de parejas de hecho, o documento público, con al menos 2 años de antelación al fallecimiento. Desde la Ley 21/2021 no se exige ningún límite de ingresos al superviviente (art. 221 LGSS). No basta con la convivencia de hecho sin registro.',
      },
    },
  ],
};
