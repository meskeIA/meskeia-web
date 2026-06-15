import { Metadata } from 'next';

import { generateWebAppSchema } from '@/lib/schema-templates';
export const metadata: Metadata = {
  title: 'Calculadora Amortización Anticipada Hipoteca | meskeIA',
  description: 'Calcula el ahorro al amortizar anticipadamente tu hipoteca. Compara reducir cuota vs reducir plazo. Nuevo cuadro de amortización actualizado.',
  keywords: 'amortizacion anticipada, hipoteca, reducir cuota, reducir plazo, ahorro intereses, cancelacion parcial, prestamo vivienda',
  authors: [{ name: 'meskeIA' }],
  creator: 'meskeIA',
  publisher: 'meskeIA',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    title: 'Calculadora Amortización Anticipada Hipoteca',
    description: 'Simula amortizaciones anticipadas: reducir cuota o reducir plazo',
    url: 'https://meskeia.com/amortizacion-hipoteca/',
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
    title: 'Amortización Anticipada Hipoteca',
    description: 'Calcula cuánto ahorras amortizando tu hipoteca anticipadamente',
    images: ['https://meskeia.com/og-image.png']
  },
};

export const jsonLd = generateWebAppSchema({
  name: "Calculadora Amortización Anticipada Hipoteca",
  description: "Calcula el ahorro al amortizar anticipadamente tu hipoteca. Compara reducir cuota vs reducir plazo. Nuevo cuadro de amortización actualizado.",
  url: 'https://meskeia.com/amortizacion-hipoteca/',
  category: 'FinanceApplication',
  features: [
  ],
});

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Qué significa amortizar anticipadamente una hipoteca?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Amortizar anticipadamente significa realizar un pago extraordinario al banco, por encima de las cuotas mensuales pactadas, para reducir el capital pendiente de tu hipoteca antes de la fecha prevista. Puedes hacerlo de forma parcial (abonas una cantidad y continúas con la hipoteca) o total (cancelas todo el préstamo de golpe). El efecto es que pagas menos intereses en el futuro porque el capital sobre el que se calculan es menor.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es mejor reducir la cuota o reducir el plazo al amortizar anticipadamente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Reducir el plazo (mantener la misma cuota pero terminar antes) ahorra más intereses totales y liquida la deuda en menos tiempo. Reducir la cuota (mantener el plazo pero pagar menos cada mes) mejora la liquidez mensual inmediata. La elección óptima depende de tu situación: si tienes holgura económica, reducir plazo es más rentable; si tu presupuesto mensual está ajustado, reducir cuota alivia la carga corriente.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto puedo ahorrar en intereses amortizando anticipadamente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El ahorro depende del capital pendiente, el tipo de interés y el momento en que realizas la amortización. Cuanto antes lo hagas durante la vida del préstamo, mayor es el ahorro, porque los intereses de los primeros años representan la mayor parte de la cuota. Por ejemplo, en una hipoteca de 200.000 € a 25 años al 3%, amortizar 20.000 € en el año 5 eligiendo reducir plazo puede suponer un ahorro de más de 10.000 € en intereses.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Existe alguna comisión por amortizar anticipadamente una hipoteca?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí, los bancos pueden cobrar una comisión por amortización anticipada, aunque la Ley Hipotecaria española la limita. Para hipotecas variables está fijada en un máximo del 0,15% durante los cinco primeros años y del 0% a partir del sexto. Para hipotecas fijas el límite es del 2% los primeros diez años y del 1,5% después. Comprueba tu escritura de hipoteca para conocer el porcentaje concreto aplicable.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se calcula el nuevo cuadro de amortización tras un pago anticipado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Después de un pago anticipado, el banco recalcula el cuadro de amortización sobre el nuevo capital pendiente. Si elegiste reducir cuota, el tipo de interés se aplica sobre el capital restante y el plazo se mantiene, generando una cuota mensual inferior. Si elegiste reducir plazo, la cuota permanece igual pero el número de mensualidades disminuye. La calculadora genera automáticamente el cuadro actualizado con cada escenario para que puedas comparar.',
      },
    },
  ],
};
