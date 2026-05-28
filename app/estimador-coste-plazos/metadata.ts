import { Metadata } from 'next';
import { generateWebAppSchema } from '@/lib/schema-templates';

export const metadata: Metadata = {
  title: 'Estimador Coste Real a Plazos - Descubre el Precio Oculto | meskeIA',
  description: 'Calcula el coste real de financiar productos a plazos. Descubre la TAE, los intereses ocultos y cuánto pagas de más respecto al precio de contado.',
  keywords: 'coste real plazos, financiacion, TAE, TIN, intereses ocultos, cuotas, precio contado, comprar a plazos, credito consumo',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimador Coste Real a Plazos - meskeIA',
    description: 'Descubre cuánto pagas realmente al financiar productos. Calcula TAE, intereses y coste total vs precio de contado.',
    url: 'https://meskeia.com/estimador-coste-plazos/',
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
    title: 'Estimador Coste Real a Plazos - meskeIA',
    description: 'Descubre el precio oculto de comprar a plazos. Calcula TAE e intereses reales.',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Estimador Coste Real a Plazos",
  description: "Calcula el coste real de financiar productos a plazos. Descubre la TAE, los intereses ocultos y cuánto pagas de más respecto al precio de contado.",
  url: "https://meskeia.com/estimador-coste-plazos/",
  category: 'FinanceApplication',
  features: [],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué diferencia hay entre TIN y TAE en una financiación a plazos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El TIN (Tipo de Interés Nominal) es el porcentaje de interés puro que aplica el préstamo. La TAE (Tasa Anual Equivalente) incluye también comisiones y gastos, y refleja el coste real total en términos anualizados. La TAE siempre es igual o mayor que el TIN; es el indicador que debes comparar entre ofertas de financiación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto pago de más al comprar algo a plazos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Depende del plazo y del tipo de interés. Por ejemplo, financiar 1.000 € durante 24 meses a una TAE del 20% supone pagar aproximadamente 214 € de intereses, es decir, un 21,4% más del precio de contado. A mayor plazo y mayor TAE, más crece el sobrecoste total.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es mejor financiar a plazos o pagar al contado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Pagar al contado evita cualquier interés y es financieramente más eficiente salvo que el coste de oportunidad del dinero sea menor que el tipo de interés del préstamo. Si la financiación es al 0% TAE real (sin costes ocultos), puede ser interesante conservar el efectivo para invertirlo, siempre que se pague puntualmente cada cuota.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula la cuota mensual de una financiación?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La cuota mensual se calcula con la fórmula de amortización francesa: C = P × [i(1+i)^n] / [(1+i)^n - 1], donde P es el capital, i el tipo de interés mensual y n el número de cuotas. La mayor parte de la cuota inicial se destina a intereses; conforme avanza la amortización, la proporción de capital aumenta.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la financiación al 0% y cuándo tiene costes ocultos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La financiación promocional al 0% TIN puede tener una TAE mayor que cero si incluye comisiones de apertura, seguros obligatorios o gastos de gestión. Además, el precio del producto financiado a veces es superior al precio de contado disponible en otros canales. Siempre compara el coste total antes de firmar.',
      },
    },
  ],
};
