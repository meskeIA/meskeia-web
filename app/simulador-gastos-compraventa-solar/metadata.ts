import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Simulador Gastos Compra Solar / Terreno Edificable - IVA o ITP | meskeIA',
  description: 'Calcula los gastos de compra de un solar o terreno edificable en España: IVA 21% + AJD si vende un promotor, ITP por comunidad autónoma si vende un particular, notaría, registro y plusvalía municipal del vendedor. Gratis y sin registro.',
  keywords: 'simulador gastos compra solar, gastos compraventa terreno edificable, iva solar, itp solar, comprar parcela urbana impuestos, comprar terreno para construir impuestos, calculadora solar españa, autopromotor terreno',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/simulador-gastos-compraventa-solar/',
  },
  openGraph: {
    type: 'website',
    title: 'Simulador Gastos Compra Solar / Terreno Edificable | meskeIA',
    description: 'Calcula el IVA 21%, ITP, AJD, notaría y registro de la compra de un solar o terreno edificable en España.',
    url: 'https://meskeia.com/simulador-gastos-compraventa-solar/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Simulador Gastos Compra Solar / Terreno Edificable | meskeIA',
    description: 'IVA 21% o ITP según el vendedor, AJD, notaría y registro al comprar un solar en España. Calcula gratis.',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Simulador Gastos Compra Solar / Terreno Edificable',
  description: 'Calculadora de gastos de compra de un solar o terreno edificable en España. Incluye IVA 21% más AJD cuando el vendedor es promotor o empresario, ITP por comunidad autónoma cuando el vendedor es un particular, gastos de notaría y registro, y nota sobre la plusvalía municipal del vendedor.',
  url: 'https://meskeia.com/simulador-gastos-compraventa-solar/',
  category: 'FinanceApplication',
  features: [
    'IVA 21% + AJD cuando el vendedor es promotor o empresario',
    'ITP por comunidad autónoma cuando el vendedor es un particular',
    'Plusvalía municipal del vendedor (suelo urbano)',
    'Gastos de notaría y registro de la propiedad',
    'Útil para autopromotores y compra de parcela para construir',
    'Gratuito, sin registro, en español',
  ],
  keywords: ['gastos solar', 'IVA solar', 'ITP terreno edificable', 'comprar parcela urbana', 'autopromotor', 'España'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Se paga IVA o ITP al comprar un solar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende de quién venda. Si el vendedor es un promotor o empresario que actúa en su actividad, la entrega del solar está sujeta a IVA al 21% más AJD (entre el 0,5% y el 1,5% según la comunidad autónoma). Si el vendedor es un particular, la compra tributa por ITP al tipo general de la comunidad. No coinciden IVA e ITP en la misma operación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Por qué un solar de empresario lleva IVA y no ITP?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Porque los terrenos edificables (solares) están excluidos de la exención de IVA que sí se aplica al suelo rústico. Cuando un empresario o promotor entrega un solar en el ejercicio de su actividad, la operación está sujeta y no exenta de IVA al 21%, y la escritura tributa además por Actos Jurídicos Documentados (AJD).',
      },
    },
    {
      '@type': 'Question',
      name: '¿Hay plusvalía municipal al vender un solar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. El solar es suelo de naturaleza urbana, por lo que su transmisión genera plusvalía municipal (IIVTNU) para el vendedor, calculada sobre el incremento de valor del terreno durante el tiempo de tenencia. Si no ha habido incremento real de valor, puede acreditarse la exención con las escrituras de compra y venta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo deducir el IVA de la compra de un solar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Si eres promotor, empresario o autónomo y afectas el solar a una actividad económica sujeta y no exenta de IVA, puedes deducir el IVA soportado en el modelo 303. En cambio, un particular que compra un solar para autopromover su vivienda no puede deducir el IVA, que se convierte en un mayor coste de la parcela.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre comprar un solar y una finca rústica?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La fiscalidad es distinta. El solar edificable tributa por IVA 21% más AJD si vende un empresario, o por ITP si vende un particular, y al ser suelo urbano genera plusvalía municipal. La finca rústica no edificable está exenta de IVA (tributa por ITP incluso vendiéndola un empresario) y no genera plusvalía municipal. Por eso conviene identificar bien el tipo de suelo antes de comprar.',
      },
    },
  ],
};
