import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';
import { FISCAL_IRPF_META, TRAMOS_IRPF_2025 } from '@/data/fiscal';
import { formatNumber } from '@/lib/formatters';
import { FAQ_BASE_LIQUIDABLE, FAQ_TIPO_MEDIO, FAQ_SUBIR_TRAMO } from './faq';

// Año del título: la vigencia del módulo que sella los datos. Sale del dato
// y no se escribe a mano (lo exige check:anio-titulo).
const anio = FISCAL_IRPF_META.vigencia;

/**
 * Los tramos del FAQPage, de la misma escala que pinta la app. Hasta el 16/10/2026 iban
 * tecleados «para 2025» y la respuesta decía que eran «los tipos del tramo estatal», cuando son
 * estatal + autonómico medio: la escala estatal del art. 63 LIRPF acaba en el 24,50 % (leído en el
 * BOE ese día). Y la base liquidable se obtenía «restando los mínimos», que no se restan (art.
 * 63.1.2.º LIRPF: se gravan a tipo cero). Cabo C0092.
 */
const euros = (n: number) => `${formatNumber(n, 0)} €`;
const pct = (n: number) => `${formatNumber(n, 0)} %`;
const textoTramos = TRAMOS_IRPF_2025.map((t, i) => {
  const desde = i === 0 ? 0 : TRAMOS_IRPF_2025[i - 1].hasta;
  if (i === 0) return `${pct(t.tipo)} hasta ${euros(t.hasta)}`;
  if (t.hasta === Infinity) return `y ${pct(t.tipo)} por encima de ${euros(desde)}`;
  return `${pct(t.tipo)} de ${euros(desde)} a ${euros(t.hasta)}`;
}).join(', ');

export const metadata: Metadata = {
  title: `Simulador Visual IRPF Tramos ${anio} - "¿Qué pasa si subo X €?" | meskeIA`,
  description: `Visualiza los 6 tramos del IRPF español de forma interactiva. Mueve el slider y observa cómo cambia tu cuota. Vista por tramos, escalera de tipos y comparativa "qué pasa si subo X €". Datos ${anio}.`,
  keywords: `simulador IRPF tramos visual, tramos IRPF ${anio}, escalera IRPF, tipo marginal medio, base liquidable, cuota íntegra, AEAT, qué pasa si subo sueldo IRPF, gráfico IRPF`,
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-irpf-tramos/',
  },
  openGraph: {
    type: 'website',
    title: `Simulador Visual IRPF Tramos ${anio} | meskeIA`,
    description: 'Visualiza los tramos del IRPF y cómo afectan a tu cuota — interactivo y didáctico',
    url: 'https://meskeia.com/simulador-irpf-tramos/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador Visual IRPF Tramos | meskeIA',
    description: 'Cómo funcionan los tramos del IRPF español — visual e interactivo',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: `Simulador Visual de Tramos IRPF ${anio}`,
  description: `Simulador visual e interactivo de los 6 tramos del IRPF español ${anio}. Visualiza cómo se aplica cada tramo, el tipo marginal vs medio, y qué pasa con tu cuota si tu base liquidable cambia.`,
  url: 'https://meskeia.com/simulador-irpf-tramos/',
  category: 'FinanceApplication',
  features: [
    `Vista interactiva de los 6 tramos del IRPF ${anio}`,
    'Slider "qué pasa si subo X €"',
    '3 modos: por tramos, escalera de tipos, comparativa',
    'Cálculo de tipo marginal y tipo medio efectivo',
    'Escala estatal + autonómica media de la Ley 35/2006',
    'Solo orientativo — verifica con la AEAT',
    'En español',
  ],
  keywords: ['IRPF', 'tramos IRPF', 'tipo marginal', 'AEAT', 'fiscal España'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: `¿Cómo funcionan los tramos del IRPF en España en ${anio}?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `El IRPF español es un impuesto progresivo. Sumando la escala estatal y una autonómica media, la base liquidable general tributa en ${TRAMOS_IRPF_2025.length} tramos en ${anio}: ${textoTramos}. Cada tipo solo se aplica a la parte de renta que cae dentro de ese tramo, no a la totalidad del salario. La mitad aproximada de cada tipo es estatal (la escala del Estado acaba en el 24,50 %) y el resto lo fija cada comunidad autónoma, así que el tipo real cambia según dónde se resida.`,
      },
    },
    {
      '@type': 'Question',
      name: FAQ_TIPO_MEDIO.pregunta,
      acceptedAnswer: {
        '@type': 'Answer',
        text: FAQ_TIPO_MEDIO.respuesta,
      },
    },
    {
      '@type': 'Question',
      name: FAQ_SUBIR_TRAMO.pregunta,
      acceptedAnswer: {
        '@type': 'Answer',
        text: FAQ_SUBIR_TRAMO.respuesta,
      },
    },
    {
      '@type': 'Question',
      name: '¿Estos datos del simulador son válidos para todas las comunidades autónomas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No exactamente. Este simulador usa la escala estatal, que es igual en toda España, sumada a una escala autonómica media orientativa. Cada comunidad autónoma fija su propia escala, con tramos y tipos distintos, así que tu cuota real puede ser mayor o menor. Para conocerla con los tipos de tu comunidad, consulta su escala autonómica o el simulador de la AEAT.',
      },
    },
    {
      '@type': 'Question',
      name: FAQ_BASE_LIQUIDABLE.pregunta,
      acceptedAnswer: {
        '@type': 'Answer',
        text: FAQ_BASE_LIQUIDABLE.respuesta,
      },
    },
  ],
};
