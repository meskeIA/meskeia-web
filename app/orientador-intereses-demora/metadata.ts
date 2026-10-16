import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';
import { FISCAL_INTERESES_META, TIPOS_DEMORA_COMERCIAL, INTERES_LEGAL_DINERO_2025 } from '@/data/fiscal';
import { formatCurrency, formatNumber } from '@/lib/formatters';

// Año del título: la vigencia del módulo que sella los datos. Sale del dato
// y no se escribe a mano (lo exige check:anio-titulo).
const anio = FISCAL_INTERESES_META.vigencia;

// Tipos del FAQPage: del módulo, no tecleados. Hasta el 16/10/2026 respondía con el primer
// semestre de 2025 (11,15 %) y el interés legal «en 2025» (cabo C0092), y el ejemplo de 5.000 €
// a 90 días daba 137,75 € cuando a ese tipo son 137,47 €.
const tipoActual = TIPOS_DEMORA_COMERCIAL[0];
const SEMESTRE = { H1: 'primer', H2: 'segundo' } as const;
const [mitad, anioSemestre] = tipoActual.semestre.split(' ') as [keyof typeof SEMESTRE, string];
const pct = (n: number) => `${formatNumber(n, 2)} %`;
const interesesEjemplo = (5000 * tipoActual.tipoTotal / 100 * 90) / 365;

export const metadata: Metadata = {
  title: `Orientador de Intereses de Demora ${anio} | meskeIA`,
  description: 'Oriéntate sobre los intereses que puedes reclamar por facturas impagadas o deudas vencidas. Calcula orientativamente el interés de demora comercial (Ley 3/2004) o civil (art. 1108 CC) en España.',
  keywords: `intereses demora, ley morosidad, ley 3/2004, intereses facturas impagadas, interes legal dinero, demora comercial, calculo intereses demora España ${anio}`,
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: `Orientador de Intereses de Demora ${anio} — meskeIA`,
    description: 'Oriéntate sobre los intereses por facturas impagadas o deudas vencidas. Interés comercial (Ley 3/2004) e interés civil (Código Civil) calculados orientativamente.',
    url: 'https://meskeia.com/orientador-intereses-demora/',
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
    title: `Orientador de Intereses de Demora ${anio}`,
    description: `Cuánto puedes reclamar por facturas impagadas: interés comercial (BCE+8pp) e interés civil para España ${anio}.`,
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Orientador de Intereses de Demora",
  description: "Oriéntate sobre los intereses que puedes reclamar por facturas impagadas o deudas vencidas. Calcula orientativamente el interés de demora comercial (Ley 3/2004) o civil (art. 1108 CC) en España.",
  url: "https://meskeia.com/orientador-intereses-demora/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué son los intereses de demora y cuándo se aplican?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los intereses de demora son la compensación económica que el acreedor puede reclamar cuando el deudor no paga en el plazo acordado. En operaciones comerciales entre empresas o autónomos se aplica la Ley 3/2004 de lucha contra la morosidad, que fija el interés en el tipo del BCE más 8 puntos porcentuales. En relaciones civiles entre particulares se aplica el interés legal del dinero, fijado anualmente en los Presupuestos Generales del Estado.',
      },
    },
    {
      '@type': 'Question',
      name: `¿Cuál es el tipo de interés de demora comercial en ${anioSemestre}?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: `El interés de demora comercial se calcula sumando ${tipoActual.incremento} puntos porcentuales al tipo de interés de referencia del Banco Central Europeo (BCE) vigente en cada semestre. Para el ${SEMESTRE[mitad]} semestre de ${anioSemestre} el tipo de referencia es del ${pct(tipoActual.tipoBCE)}, así que el interés de demora comercial es del ${pct(tipoActual.tipoTotal)}. Este tipo se actualiza cada 1 de enero y 1 de julio.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre el interés de demora comercial y el civil?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `El interés de demora comercial (Ley 3/2004) se aplica cuando ambas partes son empresas o profesionales autónomos y la deuda deriva de una operación comercial. Es más elevado y el plazo máximo de pago es 30 días (60 en algunos sectores). El interés civil (art. 1108 del Código Civil) se aplica a deudas entre particulares o cuando no existe un contrato mercantil, y su importe equivale al interés legal del dinero, que en ${INTERES_LEGAL_DINERO_2025.vigencia} es del ${pct(INTERES_LEGAL_DINERO_2025.tipo)}.`,
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo reclamar intereses de demora aunque no conste en el contrato?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. En operaciones comerciales entre empresas, la Ley 3/2004 reconoce el derecho al cobro de intereses de demora de forma automática desde el día siguiente al vencimiento del plazo de pago, sin necesidad de aviso previo ni pacto expreso en el contrato. Además, el acreedor puede reclamar una compensación fija por costes de cobro de al menos 40 euros por factura impagada.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula el importe de los intereses de demora?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `La fórmula es: Intereses = (Capital pendiente × tipo de interés anual × días de retraso) / 365. Por ejemplo, una factura de 5.000 € impagada durante 90 días al tipo comercial del ${pct(tipoActual.tipoTotal)} generaría unos intereses orientativos de ${formatCurrency(interesesEjemplo)}. A esta cantidad se le puede añadir la compensación fija de 40 € por costes de cobro y, en su caso, los gastos de recuperación razonables acreditados.`,
      },
    },
  ],
};
