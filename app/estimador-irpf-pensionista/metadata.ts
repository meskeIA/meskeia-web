import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';
import { formatCurrency } from '@/lib/formatters';
import {
  MINIMOS_IRPF_2025,
  GASTOS_DEDUCIBLES_TRABAJO_2025,
  REDUCCION_RENDIMIENTOS_TRABAJO_2025,
  OBLIGACION_DECLARAR_2025,
  cuotaEscalaGeneral,
} from '@/data/fiscal';

/**
 * El FAQPage se sirve a Bing Copilot, ChatGPT, Perplexity y Gemini para grounding, así que sus
 * cifras son tan publicables como las de la pantalla. Hasta el 20/09/2026 iban escritas a mano
 * y llevaban la redacción del art. 20 DEROGADA por el RDL 4/2024 —6.498 / 13.115 / 16.825 y una
 * «reducción mínima de 2.364 €» que `data/fiscal` declara inexistente— más un mínimo por edad de
 * 75 años cifrado en 1.215 € de cuota cuando la escala vigente da 1.539 €. Ahora salen todas de
 * `@/data/fiscal`: si la norma cambia allí, este texto cambia con ella.
 */
const LIMITE_OTRAS_RENTAS_ART_20 = REDUCCION_RENDIMIENTOS_TRABAJO_2025.limiteOtrasRentas;
const VALOR_MINIMO_75 = cuotaEscalaGeneral(MINIMOS_IRPF_2025.personal_75);

export const metadata: Metadata = {
  title: 'Estimador IRPF Pensionista 2026 - Cuánto pagas de renta | meskeIA',
  description: 'Estima el IRPF que pagas como pensionista: reducción por rendimientos del trabajo, mínimo personal por edad y cuota orientativa. Pensión neta mensual real.',
  keywords: 'irpf pensionista, declaracion renta jubilado, cuanto paga de irpf un pensionista, reduccion rendimientos trabajo pension, minimo personal 65 años, pension neta mensual',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimador IRPF Pensionista 2026 | meskeIA',
    description: 'Cuánto IRPF pagas como pensionista y cuál es tu pensión neta mensual real.',
    url: 'https://meskeia.com/estimador-irpf-pensionista/',
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
    title: 'Estimador IRPF Pensionista 2026 | meskeIA',
    description: 'Renta del pensionista orientativa: cuota IRPF y pensión neta mensual 2026',
    images: ['https://meskeia.com/og-image.png']
  },
  other: {
    'application-name': 'Estimador IRPF Pensionista meskeIA',
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Estimador IRPF Pensionista",
  description: "Estima el IRPF que pagas como pensionista: reducción por rendimientos del trabajo, mínimo personal por edad y cuota orientativa. Pensión neta mensual real.",
  url: "https://meskeia.com/estimador-irpf-pensionista/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuánto IRPF paga un pensionista en 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Depende del importe de la pensión. Las pensiones tributan como rendimientos del trabajo y se les aplica la escala general del IRPF. A la pensión se le restan los gastos deducibles del art. 19.2.f (${formatCurrency(GASTOS_DEDUCIBLES_TRABAJO_2025.importeGeneral)}) y la reducción del art. 20, que vale ${formatCurrency(REDUCCION_RENDIMIENTOS_TRABAJO_2025.reduccion1)} mientras la pensión anual no pase de ${formatCurrency(REDUCCION_RENDIMIENTOS_TRABAJO_2025.limite1)} y se agota en ${formatCurrency(REDUCCION_RENDIMIENTOS_TRABAJO_2025.limite2)}: esos umbrales se miden sin descontar los ${formatCurrency(GASTOS_DEDUCIBLES_TRABAJO_2025.importeGeneral)}, porque el art. 20 solo resta a estos efectos los gastos de las letras a) a e). El mínimo personal es de ${formatCurrency(MINIMOS_IRPF_2025.personal)} (${formatCurrency(MINIMOS_IRPF_2025.personal_65)} a partir de 65 años y ${formatCurrency(MINIMOS_IRPF_2025.personal_75)} a partir de 75) y no se resta de la base: se grava a tipo cero aplicando la escala dos veces, como manda el art. 63.1.2.º LIRPF. Con una pensión mínima de jubilación la cuota suele ser cero.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la reducción por rendimientos del trabajo para pensionistas?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Es una minoración del rendimiento neto del trabajo (art. 20 LIRPF) que beneficia a trabajadores y pensionistas con ingresos del trabajo bajos. Vale ${formatCurrency(REDUCCION_RENDIMIENTOS_TRABAJO_2025.reduccion1)} mientras el rendimiento neto no pase de ${formatCurrency(REDUCCION_RENDIMIENTOS_TRABAJO_2025.limite1)} (medido, según el propio art. 20, sin restar los ${formatCurrency(GASTOS_DEDUCIBLES_TRABAJO_2025.importeGeneral)} de gastos generales: en una pensión, su importe íntegro); después decrece en dos tramos y desde ${formatCurrency(REDUCCION_RENDIMIENTOS_TRABAJO_2025.limite2)} vale ${formatCurrency(REDUCCION_RENDIMIENTOS_TRABAJO_2025.reduccion2)}: se agota del todo y no deja ningún importe residual. Exige además no tener rentas distintas de las del trabajo superiores a ${formatCurrency(LIMITE_OTRAS_RENTAS_ART_20)}, así que un pensionista con alquileres por encima de esa cifra no la aplica.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Tiene que hacer la declaración de la renta un jubilado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `No siempre. Un pensionista con un único pagador (la Seguridad Social) y rendimientos del trabajo por debajo de ${formatCurrency(OBLIGACION_DECLARAR_2025.trabajo.unPagador)} brutos anuales no está obligado a declarar, aunque puede hacerlo voluntariamente si espera devolución. Si percibe pensión de más de un pagador (por ejemplo, también de una mutualidad) y el segundo supera ${formatCurrency(OBLIGACION_DECLARAR_2025.trabajo.limiteSegundoPagador)}, el límite baja a ${formatCurrency(OBLIGACION_DECLARAR_2025.trabajo.variosPagadores)}.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula la pensión neta mensual de un jubilado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La pensión neta mensual se obtiene restando a la pensión bruta las retenciones de IRPF que aplica la Seguridad Social. Esas retenciones dependen de la pensión anual y de las circunstancias personales (edad, discapacidad, etc.). A diferencia de los trabajadores, los pensionistas no pagan cotizaciones a la Seguridad Social, salvo la aportación de asistencia sanitaria del 1,59 % en algunos casos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿El mínimo personal por edad reduce el IRPF del pensionista?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Sí. El mínimo personal es de ${formatCurrency(MINIMOS_IRPF_2025.personal)} anuales con carácter general, sube a ${formatCurrency(MINIMOS_IRPF_2025.personal_65)} desde los 65 años y a ${formatCurrency(MINIMOS_IRPF_2025.personal_75)} desde los 75. No reduce la renta: forma parte de la base liquidable y se grava a tipo cero aplicando la escala dos veces —a la base completa y al mínimo— y restando la segunda cuota de la primera (art. 63.1.2.º LIRPF). Como el mínimo cae en el primer tramo de la escala, al 19 %, para un pensionista de 75 años o más equivale a ${formatCurrency(VALOR_MINIMO_75)} de cuota íntegra anulada.`,
      },
    },
  ],
};
