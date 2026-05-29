import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Estimador de Préstamos - Francés, Alemán y Americano | meskeIA',
  description: 'Compara sistemas de amortización: francés (cuota fija), alemán (amortización constante) y americano. Cuadro completo, TAE vs TIN y comisiones.',
  keywords: 'prestamo, simulador, amortizacion, frances, aleman, americano, cuota, interes, TAE, TIN, cuadro amortizacion',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Estimador de Préstamos - Compara Sistemas de Amortización',
    description: 'Calcula y compara préstamos con sistema francés, alemán y americano',
    url: 'https://meskeia.com/estimador-prestamos/',
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
    title: 'Estimador de Préstamos',
    description: 'Compara sistemas de amortización y calcula tu préstamo ideal',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Estimador de Préstamos - Francés, Alemán y Americano",
  description: "Compara sistemas de amortización: francés (cuota fija), alemán (amortización constante) y americano. Cuadro completo, TAE vs TIN y comisiones.",
  url: 'https://meskeia.com/estimador-prestamos/',
  category: 'FinanceApplication',
  features: [
      "Funciona 100% en el navegador, sin registro ni instalación",
      "Gratuito y sin publicidad",
      "En español"
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuál es la diferencia entre el sistema de amortización francés y el alemán?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En el sistema francés la cuota mensual es siempre la misma durante toda la vida del préstamo: al principio pagas más intereses y con el tiempo vas amortizando más capital. En el sistema alemán la amortización de capital es constante cada mes, lo que hace que la cuota sea más alta al inicio y vaya bajando progresivamente. El alemán suele resultar más barato en total porque los intereses se calculan sobre un capital pendiente que decrece más rápido.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es la TAE de un préstamo y en qué se diferencia del TIN?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El TIN (Tipo de Interés Nominal) es el porcentaje anual que el banco aplica estrictamente al capital prestado. La TAE (Tasa Anual Equivalente) va más allá: incluye el TIN, las comisiones y la frecuencia de los pagos, ofreciendo un coste real estandarizado. Para comparar ofertas de distintas entidades siempre hay que fijarse en la TAE, no en el TIN.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo funciona el sistema de amortización americano o bullet?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'En el sistema americano (también llamado bullet) solo se pagan intereses durante toda la vida del préstamo y el capital se devuelve íntegramente al vencimiento. Las cuotas periódicas son las más bajas de los tres sistemas, pero el coste total en intereses suele ser el más elevado porque el capital nunca se reduce. Es habitual en financiación empresarial o en ciertos préstamos puente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué sistema de amortización conviene más para un préstamo personal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Para la mayoría de préstamos personales el sistema francés es el más habitual porque la cuota fija facilita la planificación mensual. Si dispones de mayor capacidad de pago al inicio, el sistema alemán te ahorra intereses totales. El sistema americano raramente se ofrece en préstamos al consumo. Antes de decidir, compara el coste total (suma de todas las cuotas) con cada sistema, no solo la cuota mensual.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué son las comisiones de apertura y cancelación en un préstamo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'La comisión de apertura es un porcentaje que cobra el banco al formalizar el préstamo, normalmente entre el 0,5% y el 2% del capital. La comisión de cancelación anticipada compensa al banco por los intereses que deja de percibir si devuelves el préstamo antes de tiempo; en préstamos hipotecarios está limitada por ley. Ambas comisiones elevan el coste real del préstamo y se reflejan en la TAE.',
      },
    },
  ],
};
