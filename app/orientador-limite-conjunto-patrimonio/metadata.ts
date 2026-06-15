import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Orientador Límite Conjunto IRPF-Patrimonio (Art. 31) | meskeIA',
  description: '¿Puedes reducir tu cuota del Impuesto sobre el Patrimonio gracias al límite conjunto del Art. 31? Orientador rápido que detecta si quedas excluido o si conviene consultar a tu asesor fiscal. España 2025.',
  keywords: 'limite conjunto IRPF Patrimonio, art 31 ley 19/1991, reduccion cuota Patrimonio, declaracion conjunta Patrimonio, 60 por ciento base imponible IRPF, bonificacion CCAA Patrimonio, ITSGF grandes fortunas, modelo 714, asesor fiscal Patrimonio',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://meskeia.com/orientador-limite-conjunto-patrimonio/',
  },
  openGraph: {
    type: 'website',
    title: 'Orientador Límite Conjunto IRPF-Patrimonio | meskeIA',
    description: 'Comprueba en 1 minuto si puedes beneficiarte de la reducción del Art. 31 Ley 19/1991 sobre la cuota del Impuesto de Patrimonio.',
    url: 'https://meskeia.com/orientador-limite-conjunto-patrimonio/',
    siteName: 'meskeIA',
    locale: 'es_ES',
    images: [{ url: 'https://meskeia.com/og-image.png', width: 1200, height: 630, alt: 'meskeIA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Reducción Límite Conjunto IRPF-Patrimonio | meskeIA',
    description: 'Orientador para saber si puedes pagar menos Patrimonio por el Art. 31',
    images: ['https://meskeia.com/og-image.png'],
  },
};

export const jsonLd = generateWebAppSchema({
  name: 'Orientador del Límite Conjunto IRPF-Patrimonio',
  description: 'Orientador fiscal que indica si un contribuyente puede beneficiarse de la reducción del límite conjunto IRPF-Patrimonio (Art. 31 de la Ley 19/1991), una posibilidad poco conocida que puede reducir la cuota del Impuesto sobre el Patrimonio. No es una calculadora exacta: determina si te conviene acudir a un asesor fiscal o si quedas descartado.',
  url: 'https://meskeia.com/orientador-limite-conjunto-patrimonio/',
  category: 'FinanceApplication',
  features: [
    'Detecta automáticamente bonificaciones autonómicas en el Impuesto sobre el Patrimonio',
    'Comprueba si la suma IRPF + Patrimonio supera el 60% de tu base imponible',
    'Estima orientativamente la reducción aplicable según el Art. 31',
    'Avisa del posible ITSGF (Impuesto de Solidaridad de las Grandes Fortunas) en patrimonios superiores a 3M€',
    'Distingue tres resultados claros: descarte por CCAA, descarte por límite, posible beneficio',
    'Datos basados en Ley 19/1991 actualizados a 2025',
    'Solo orientativo — siempre deriva al asesor fiscal',
  ],
  keywords: ['Patrimonio España', 'límite conjunto IRPF', 'Art. 31 Ley 19/1991', 'reducción cuota Patrimonio', 'fiscal España'],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué es el límite conjunto IRPF-Patrimonio del artículo 31?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El artículo 31 de la Ley 19/1991 establece que la suma de las cuotas del IRPF y del Impuesto sobre el Patrimonio no puede superar el 60% de la base imponible general y del ahorro del IRPF. Si se supera ese límite, la cuota del Patrimonio se reduce en el exceso, con un tope máximo del 80% de la cuota original. Es una ventaja fiscal reconocida por ley pero poco conocida entre los contribuyentes.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula si tengo derecho a la reducción del Impuesto sobre el Patrimonio?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para verificarlo hay que sumar la cuota íntegra del IRPF más la cuota del Impuesto sobre el Patrimonio y comprobar si ese total supera el 60% de la base imponible general y de ahorro del IRPF. Si supera ese umbral, la diferencia se resta de la cuota de Patrimonio. El cálculo preciso requiere datos de ambas declaraciones, por lo que conviene hacerlo con un asesor fiscal.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué comunidades autónomas bonifican el Impuesto sobre el Patrimonio al 100%?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Comunidades como Madrid aplican una bonificación del 100% en la cuota del Impuesto sobre el Patrimonio, lo que en la práctica anula el impuesto. En esos casos, la cuota de Patrimonio es cero y el límite conjunto del artículo 31 no resulta aplicable, ya que no hay cuota que reducir. La situación varía según la comunidad autónoma de residencia.',
      },
    },
    {
      '@type': 'Question',
      name: '¿El Impuesto de Solidaridad de las Grandes Fortunas (ITSGF) afecta al límite conjunto?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. El ITSGF (modelo 718) se aplica a patrimonios netos superiores a 3 millones de euros y actúa como complementario al Impuesto sobre el Patrimonio. Para contribuyentes que tributan por el ITSGF, el límite conjunto del artículo 31 también entra en juego, pero el cálculo se vuelve más complejo al intervenir tres impuestos. En estos casos es imprescindible la revisión de un asesor fiscal.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Para quién es útil este orientador fiscal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Es útil para contribuyentes que presentan tanto la declaración del IRPF como la del Impuesto sobre el Patrimonio (modelo 714) y quieren saber rápidamente si pueden beneficiarse de la reducción del artículo 31 antes de acudir a su asesor fiscal. También sirve para descartar la aplicabilidad del límite cuando la cuota de Patrimonio ya es cero por bonificación autonómica.',
      },
    },
  ],
};
