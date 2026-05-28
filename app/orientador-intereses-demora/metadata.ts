import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Orientador de Intereses de Demora 2025 | meskeIA',
  description: 'Oriéntate sobre los intereses que puedes reclamar por facturas impagadas o deudas vencidas. Calcula orientativamente el interés de demora comercial (Ley 3/2004) o civil (art. 1108 CC) en España.',
  keywords: 'intereses demora, ley morosidad, ley 3/2004, intereses facturas impagadas, interes legal dinero, demora comercial, calculo intereses demora España 2025',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Orientador de Intereses de Demora 2025 — meskeIA',
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
    title: 'Orientador de Intereses de Demora 2025',
    description: 'Cuánto puedes reclamar por facturas impagadas: interés comercial (BCE+8pp) e interés civil para España 2025.',
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
      name: '¿Cuál es el tipo de interés de demora comercial en 2025?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El interés de demora comercial se calcula sumando 8 puntos porcentuales al tipo de interés de referencia del Banco Central Europeo (BCE) vigente en cada semestre. Para el primer semestre de 2025 el tipo del BCE era del 3,15%, por lo que el interés de demora comercial aplicable es del 11,15%. Este tipo se actualiza cada 1 de enero y 1 de julio.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre el interés de demora comercial y el civil?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El interés de demora comercial (Ley 3/2004) se aplica cuando ambas partes son empresas o profesionales autónomos y la deuda deriva de una operación comercial. Es más elevado y el plazo máximo de pago es 30 días (60 en algunos sectores). El interés civil (art. 1108 del Código Civil) se aplica a deudas entre particulares o cuando no existe un contrato mercantil, y su importe equivale al interés legal del dinero, que en 2025 es del 3,25%.',
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
        text: 'La fórmula es: Intereses = (Capital pendiente × tipo de interés anual × días de retraso) / 365. Por ejemplo, una factura de 5.000 € impagada durante 90 días al tipo comercial del 11,15% generaría unos intereses orientativos de 137,75 €. A esta cantidad se le puede añadir la compensación fija de 40 € por costes de cobro y, en su caso, los gastos de recuperación razonables acreditados.',
      },
    },
  ],
};
